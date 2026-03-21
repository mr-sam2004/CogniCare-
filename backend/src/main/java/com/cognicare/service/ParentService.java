package com.cognicare.service;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ParentService {

    private final ParentRepository parentRepository;
    private final ChildRepository childRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final SessionRepository sessionRepository;
    private final AssignmentRepository assignmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final RewardRepository rewardRepository;

    public ParentService(ParentRepository parentRepository, ChildRepository childRepository,
                         PrescriptionRepository prescriptionRepository, SessionRepository sessionRepository,
                         AssignmentRepository assignmentRepository, FeedbackRepository feedbackRepository,
                         RewardRepository rewardRepository) {
        this.parentRepository = parentRepository;
        this.childRepository = childRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.sessionRepository = sessionRepository;
        this.assignmentRepository = assignmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.rewardRepository = rewardRepository;
    }

    public ParentProfileDto getParentByUserId(Integer userId) {
        Parent parent = parentRepository.findByUserUserIdAndUserIsActiveTrue(userId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        return new ParentProfileDto(
                parent.getParentId(),
                parent.getFirstName(),
                parent.getLastName(),
                parent.getUser().getEmail(),
                parent.getPhone(),
                parent.getApprovalStatus() != null ? parent.getApprovalStatus().name() : null
        );
    }

    public List<ParentChildDto> getChildren(Integer parentId) {
        return childRepository.findByParentParentIdAndUserIsActiveTrue(parentId).stream()
                .map(c -> new ParentChildDto(
                        c.getChildId(),
                        c.getFirstName(),
                        c.getLastName(),
                        c.getDiagnosis(),
                        c.getLevel(),
                        c.getCurrentStreak(),
                        c.getTotalScore(),
                        c.getProfileImage()
                ))
                .toList();
    }

    public Child getChildDetails(Integer childId) {
        return childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    public List<Prescription> getChildPrescriptions(Integer childId) {
        return prescriptionRepository.findByChildChildId(childId);
    }

    public List<ParentSessionDto> getUpcomingSessions(Integer childId) {
        return sessionRepository.findByChildChildIdAndScheduledAtAfter(childId, java.time.LocalDateTime.now()).stream()
                .map(s -> new ParentSessionDto(
                        s.getSessionId(),
                        s.getSessionTitle(),
                        s.getScheduledAt(),
                        s.getSessionType() != null ? s.getSessionType().name() : null,
                        s.getGoogleMeetLink(),
                        s.getStatus() != null ? s.getStatus().name() : null
                ))
                .toList();
    }

    public List<Assignment> getChildProgress(Integer childId) {
        return assignmentRepository.findByChildChildId(childId);
    }

    public List<ParentRewardDto> getChildRewards(Integer childId) {
        return rewardRepository.findByChildChildIdOrderByEarnedAtDesc(childId).stream()
                .map(r -> new ParentRewardDto(
                        r.getRewardId(),
                        r.getBadgeName(),
                        r.getDescription(),
                        r.getBadgeIcon(),
                        r.getEarnedAt()
                ))
                .toList();
    }

    public ChildStats getChildStats(Integer childId) {
        Child child = childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        List<Assignment> assignments = assignmentRepository.findByChildChildId(childId);
        long completedAssignments = assignments.stream().filter(Assignment::getIsCompleted).count();
        long totalAssignments = assignments.size();
        
        return new ChildStats(
                child.getCurrentStreak(),
                child.getLongestStreak(),
                child.getTotalScore(),
                child.getLevel(),
                (int) completedAssignments,
                (int) totalAssignments
        );
    }

    @Transactional
    public ChildCredentials getChildCredentials(Integer childId) {
        Child child = childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));

        if (child.getTempPasswordShownAt() != null || child.getTempPassword() == null) {
            return new ChildCredentials(child.getLoginUsername(), null, true);
        }

        String tempPassword = child.getTempPassword();
        child.setTempPassword(null);
        child.setTempPasswordShownAt(java.time.LocalDateTime.now());
        childRepository.save(child);

        return new ChildCredentials(child.getLoginUsername(), tempPassword, false);
    }

    @Transactional
    public Feedback submitFeedback(FeedbackRequest request, Integer parentId) {
        Parent parent = parentRepository.findByParentIdAndUserIsActiveTrue(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        Feedback feedback = new Feedback();
        feedback.setParent(parent);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setFeedbackType(Feedback.FeedbackType.PARENT_FEEDBACK);

        if (request.getSessionId() != null) {
            TherapySession session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            feedback.setSession(session);
        }

        return feedbackRepository.save(feedback);
    }

    @Transactional
    public void submitFeedbackRaw(Integer parentId, Integer rating, String comment) {
        Parent parent = parentRepository.findByParentIdAndUserIsActiveTrue(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        Feedback feedback = new Feedback();
        feedback.setParent(parent);
        feedback.setRating(rating);
        feedback.setComment(comment);
        feedback.setFeedbackType(Feedback.FeedbackType.PARENT_FEEDBACK);
        feedbackRepository.save(feedback);
    }

    public record ChildStats(int currentStreak, int longestStreak, int totalScore, int level,
                            int completedAssignments, int totalAssignments) {}

    public record ChildCredentials(String username, String tempPassword, boolean alreadyShown) {}

    public ChildActivityDto getChildActivity(Integer childId) {
        Child child = childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<Assignment> todayAssignments = assignmentRepository.findCompletedByChildAfter(childId, startOfDay);
        List<TherapySession> todaySessions = sessionRepository.findByChildChildIdAndScheduledAtBetween(childId, startOfDay, endOfDay);
        List<Assignment> allAssignments = assignmentRepository.findByChildChildId(childId);
        List<Assignment> pendingAssignments = assignmentRepository.findByChildChildIdAndIsCompletedFalse(childId);

        int scoreEarnedToday = todayAssignments.stream()
                .mapToInt(a -> a.getScore() == null ? 0 : a.getScore())
                .sum();

        List<ActivityItemDto> recentActivity = new ArrayList<>();
        for (Assignment a : todayAssignments) {
            recentActivity.add(new ActivityItemDto(
                    "TASK_COMPLETED",
                    a.getModule().getName(),
                    "Completed " + a.getModule().getName() + " - " + a.getDifficultyLevel(),
                    a.getScore(),
                    a.getCompletedAt()
            ));
        }
        for (TherapySession s : todaySessions) {
            recentActivity.add(new ActivityItemDto(
                    "SESSION",
                    s.getSessionTitle(),
                    s.getSessionType() + " session",
                    null,
                    s.getScheduledAt()
            ));
        }
        recentActivity.sort(Comparator.comparing(ActivityItemDto::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));

        return new ChildActivityDto(
                todayAssignments.size(),
                pendingAssignments.size(),
                scoreEarnedToday,
                todaySessions.size(),
                child.getTotalScore() == null ? 0 : child.getTotalScore(),
                child.getCurrentStreak() == null ? 0 : child.getCurrentStreak(),
                child.getLevel() == null ? 1 : child.getLevel(),
                recentActivity
        );
    }

    public List<DoctorReportDto> getDoctorReports(Integer childId) {
        Child child = childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));

        List<Feedback> reports = feedbackRepository.findByChildChildIdAndFeedbackTypeOrderByCreatedAtDesc(
                childId, Feedback.FeedbackType.REPORT);

        return reports.stream()
                .map(f -> new DoctorReportDto(
                        f.getFeedbackId(),
                        childId,
                        child.getFirstName() + " " + child.getLastName(),
                        f.getReportTitle() != null ? f.getReportTitle() : "Progress Report",
                        f.getComment(),
                        f.getRating(),
                        f.getDoctor() != null ? "Dr. " + f.getDoctor().getFirstName() + " " + f.getDoctor().getLastName() : null,
                        Boolean.TRUE.equals(f.getSeen()),
                        f.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void markReportAsSeen(Integer feedbackId, Integer childId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        if (!feedback.getChild().getChildId().equals(childId)) {
            throw new RuntimeException("Not authorized");
        }
        feedback.setSeen(true);
        feedbackRepository.save(feedback);
    }

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
