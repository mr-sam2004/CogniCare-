package com.cognicare.service;

import com.cognicare.dto.ChildPerformanceDto;
import com.cognicare.dto.LeaderboardEntryDto;
import com.cognicare.dto.PerformancePointDto;
import com.cognicare.model.Assignment;
import com.cognicare.model.Child;
import com.cognicare.repository.AssignmentRepository;
import com.cognicare.repository.ChildRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PublicStatsService {

    private final ChildRepository childRepository;
    private final AssignmentRepository assignmentRepository;

    public PublicStatsService(ChildRepository childRepository, AssignmentRepository assignmentRepository) {
        this.childRepository = childRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboard() {
        List<Child> children = childRepository.findAllActiveOrderByScoreDesc();

        List<LeaderboardEntryDto> result = new ArrayList<>();
        for (int i = 0; i < children.size(); i++) {
            Child child = children.get(i);
            result.add(new LeaderboardEntryDto(
                    i + 1,
                    child.getChildId(),
                    child.getFirstName() + " " + child.getLastName(),
                    child.getLevel() == null ? 1 : child.getLevel(),
                    child.getTotalScore() == null ? 0 : child.getTotalScore(),
                    child.getCurrentStreak() == null ? 0 : child.getCurrentStreak()
            ));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public ChildPerformanceDto getChildPerformance(Integer childId) {
        Child child = childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));

        List<Assignment> allAssignments = assignmentRepository.findByChildChildId(childId);
        List<Assignment> completedAssignments = allAssignments.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsCompleted()))
                .sorted(Comparator.comparing(Assignment::getCompletedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        int totalScore = completedAssignments.stream().mapToInt(a -> a.getScore() == null ? 0 : a.getScore()).sum();
        int averageScore = completedAssignments.isEmpty() ? 0 : Math.round((float) totalScore / completedAssignments.size());

        List<PerformancePointDto> points = completedAssignments.stream()
                .map(a -> new PerformancePointDto(
                        a.getModule().getName(),
                        a.getDifficultyLevel().name(),
                        a.getScore() == null ? 0 : a.getScore(),
                        a.getCompletedAt()
                ))
                .toList();

        return new ChildPerformanceDto(
                child.getChildId(),
                child.getFirstName() + " " + child.getLastName(),
                completedAssignments.size(),
                allAssignments.size(),
                averageScore,
                points
        );
    }
}
