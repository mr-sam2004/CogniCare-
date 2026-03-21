package com.cognicare.service;

import com.cognicare.dto.ActivityResultRequest;
import com.cognicare.dto.ChildPrescriptionDto;
import com.cognicare.dto.ChildRewardDto;
import com.cognicare.dto.ChildSessionDto;
import com.cognicare.dto.ChildTaskDto;
import com.cognicare.dto.FeedbackRequest;
import com.cognicare.model.*;
import com.cognicare.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChildService {

    private final ChildRepository childRepository;
    private final AssignmentRepository assignmentRepository;
    private final RewardRepository rewardRepository;
    private final SessionRepository sessionRepository;
    private final FeedbackRepository feedbackRepository;
    private final DoctorRepository doctorRepository;
    private final ModuleRepository moduleRepository;
    private final PrescriptionRepository prescriptionRepository;

    public ChildService(ChildRepository childRepository, AssignmentRepository assignmentRepository,
                         RewardRepository rewardRepository, SessionRepository sessionRepository,
                         FeedbackRepository feedbackRepository, DoctorRepository doctorRepository,
                         ModuleRepository moduleRepository, PrescriptionRepository prescriptionRepository) {
        this.childRepository = childRepository;
        this.assignmentRepository = assignmentRepository;
        this.rewardRepository = rewardRepository;
        this.sessionRepository = sessionRepository;
        this.feedbackRepository = feedbackRepository;
        this.doctorRepository = doctorRepository;
        this.moduleRepository = moduleRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    public Child getChildByUserId(Integer userId) {
        return childRepository.findByUserUserIdAndUserIsActiveTrue(userId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    public List<ChildTaskDto> getAssignedModules(Integer childId) {
        getActiveChild(childId);
        return assignmentRepository.findByChildChildId(childId).stream()
                .map(this::mapTask)
                .toList();
    }

    public List<ChildTaskDto> getPendingTasks(Integer childId) {
        getActiveChild(childId);
        return assignmentRepository.findByChildChildIdAndIsCompletedFalse(childId).stream()
                .map(this::mapTask)
                .toList();
    }

    @Transactional
    public Assignment submitActivityResult(Integer childId, ActivityResultRequest request) {
        Child child = getActiveChild(childId);
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!assignment.getChild().getChildId().equals(childId)) {
            throw new RuntimeException("Assignment does not belong to this child");
        }

        assignment.setScore(request.getScore());
        assignment.setIsCompleted(true);
        assignment.setCompletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        child.setTotalScore(child.getTotalScore() + request.getScore());
        
        int completedCount = assignmentRepository.findByChildChildIdAndIsCompletedTrue(childId).size();
        if (completedCount >= 5 && child.getLevel() < 2) {
            child.setLevel(2);
            createReward(childId, "Level 2 Achieved", "star", "Reached level 2!");
        } else if (completedCount >= 15 && child.getLevel() < 3) {
            child.setLevel(3);
            createReward(childId, "Level 3 Achieved", "trophy", "Reached level 3!");
        }
        
        childRepository.save(child);

        return assignment;
    }

    @Transactional
    public void updateStreak(Integer childId) {
        Child child = getActiveChild(childId);
        
        child.setCurrentStreak(child.getCurrentStreak() + 1);
        if (child.getCurrentStreak() > child.getLongestStreak()) {
            child.setLongestStreak(child.getCurrentStreak());
        }
        
        if (child.getCurrentStreak() == 7) {
            createReward(childId, "Week Warrior", "fire", "7 day streak!");
        } else if (child.getCurrentStreak() == 30) {
            createReward(childId, "Month Master", "medal", "30 day streak!");
        }
        
        childRepository.save(child);
    }

    private void createReward(Integer childId, String badgeName, String icon, String description) {
        Child child = getActiveChild(childId);
        
        Reward reward = new Reward();
        reward.setChild(child);
        reward.setBadgeName(badgeName);
        reward.setBadgeIcon(icon);
        reward.setDescription(description);
        rewardRepository.save(reward);
    }

    public List<ChildRewardDto> getRewards(Integer childId) {
        getActiveChild(childId);
        return rewardRepository.findByChildChildId(childId).stream()
                .map(r -> new ChildRewardDto(
                        r.getRewardId(),
                        r.getBadgeName(),
                        r.getBadgeIcon(),
                        r.getDescription(),
                        r.getEarnedAt()
                ))
                .toList();
    }

    public List<ChildSessionDto> getUpcomingSessions(Integer childId) {
        getActiveChild(childId);
        return sessionRepository.findByChildChildIdAndScheduledAtAfter(childId, LocalDateTime.now()).stream()
                .filter(s -> s.getStatus() != TherapySession.SessionStatus.COMPLETED
                          && s.getStatus() != TherapySession.SessionStatus.CANCELLED
                          && s.getStatus() != TherapySession.SessionStatus.DELETED)
                .map(s -> new ChildSessionDto(
                        s.getSessionId(),
                        s.getSessionTitle(),
                        s.getSessionType().name(),
                        s.getGoogleMeetLink(),
                        s.getScheduledAt(),
                        s.getDurationMinutes(),
                        s.getStatus().name()
                ))
                .toList();
    }

    @Transactional
    public void attendSession(Integer childId, Integer sessionId) {
        Child child = getActiveChild(childId);
        TherapySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getChild().getChildId().equals(childId)) {
            throw new RuntimeException("This session does not belong to you");
        }
        if (session.getStatus() == TherapySession.SessionStatus.COMPLETED) {
            throw new RuntimeException("Session already attended");
        }
        session.setStatus(TherapySession.SessionStatus.COMPLETED);
        sessionRepository.save(session);
    }

    public List<ChildPrescriptionDto> getPrescriptions(Integer childId) {
        Child child = getActiveChild(childId);
        return prescriptionRepository.findByChildChildIdAndIsActiveTrue(childId).stream()
                .map(p -> new ChildPrescriptionDto(
                        p.getPrescriptionId(),
                        "Dr. " + p.getDoctor().getFirstName() + " " + p.getDoctor().getLastName(),
                        p.getDoctor().getSpecialization(),
                        child.getFirstName() + " " + child.getLastName(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getDosage(),
                        p.getFrequency(),
                        p.getStartDate(),
                        p.getEndDate(),
                        p.getCreatedAt()
                ))
                .toList();
    }

    public List<ChildSessionDto> getVrSessions(Integer childId) {
        getActiveChild(childId);
        return sessionRepository.findByChildChildIdAndScheduledAtAfter(childId, LocalDateTime.now()).stream()
                .filter(s -> "VR".equals(s.getSessionType().name()))
                .filter(s -> s.getStatus() != TherapySession.SessionStatus.COMPLETED
                          && s.getStatus() != TherapySession.SessionStatus.CANCELLED
                          && s.getStatus() != TherapySession.SessionStatus.DELETED)
                .map(s -> new ChildSessionDto(
                        s.getSessionId(),
                        s.getSessionTitle(),
                        s.getSessionType().name(),
                        s.getGoogleMeetLink(),
                        s.getScheduledAt(),
                        s.getDurationMinutes(),
                        s.getStatus().name()
                ))
                .toList();
    }

    @Transactional
    public Prescription getPrescriptionForDownload(Integer childId, Integer prescriptionId) {
        getActiveChild(childId);
        Prescription prescription = prescriptionRepository.findByPrescriptionIdAndChildChildIdAndIsActiveTrue(prescriptionId, childId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescription.setIsActive(false);
        prescriptionRepository.save(prescription);
        return prescription;
    }

    public List<com.cognicare.model.Module> getVRContent() {
        return moduleRepository.findByIsActiveTrue().stream()
                .filter(m -> m.getVrVideoUrl() != null && !m.getVrVideoUrl().isEmpty())
                .toList();
    }

    public ChildProfile getProfile(Integer childId) {
        Child child = getActiveChild(childId);
        
        List<Assignment> assignments = assignmentRepository.findByChildChildId(childId);
        long completedCount = assignments.stream().filter(Assignment::getIsCompleted).count();
        
        return new ChildProfile(
                child.getChildId(),
                child.getFirstName(),
                child.getLastName(),
                child.getCurrentStreak(),
                child.getLongestStreak(),
                child.getTotalScore(),
                child.getLevel(),
                child.getAvatar(),
                (int) completedCount,
                assignments.size()
        );
    }

    @Transactional
    public Feedback submitFeedback(FeedbackRequest request, Integer childId) {
        Child child = getActiveChild(childId);

        Feedback feedback = new Feedback();
        feedback.setChild(child);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setFeedbackType(Feedback.FeedbackType.valueOf(request.getFeedbackType()));

        return feedbackRepository.save(feedback);
    }

    public record ChildProfile(Integer childId, String firstName, String lastName, int currentStreak, int longestStreak,
                               int totalScore, int level, String avatar, int completedTasks, int totalTasks) {}

    private Child getActiveChild(Integer childId) {
        return childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    private ChildTaskDto mapTask(Assignment assignment) {
        return new ChildTaskDto(
                assignment.getAssignmentId(),
                assignment.getModule().getModuleId(),
                assignment.getModule().getName(),
                assignment.getModule().getIcon(),
                assignment.getModule().getDurationMinutes(),
                assignment.getDifficultyLevel().name(),
                assignment.getIsCompleted(),
                assignment.getScore()
        );
    }

    private static final String UPLOAD_DIR = "uploads/avatars/";

    @Transactional
    public String uploadProfileImage(Integer childId, MultipartFile file) throws IOException {
        Child child = getActiveChild(childId);

        Files.createDirectories(Paths.get(UPLOAD_DIR));
        String filename = "child_" + childId + "_" + System.currentTimeMillis() + ".jpg";
        Path path = Paths.get(UPLOAD_DIR, filename);
        Files.write(path, file.getBytes());

        child.setProfileImage(filename);
        childRepository.save(child);
        return filename;
    }

    public byte[] getProfileImage(Integer childId) throws IOException {
        Child child = getActiveChild(childId);
        if (child.getProfileImage() == null) {
            throw new RuntimeException("No profile image");
        }
        Path path = Paths.get(UPLOAD_DIR, child.getProfileImage());
        return Files.readAllBytes(path);
    }
}
