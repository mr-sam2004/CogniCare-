package com.cognicare.service;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.repository.*;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final ChildRepository childRepository;
    private final AssignmentRepository assignmentRepository;
    private final ModuleRepository moduleRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final SessionRepository sessionRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ParentRepository parentRepository;

    public DoctorService(DoctorRepository doctorRepository, ChildRepository childRepository,
                         AssignmentRepository assignmentRepository, ModuleRepository moduleRepository,
                         PrescriptionRepository prescriptionRepository, SessionRepository sessionRepository,
                         FeedbackRepository feedbackRepository, UserRepository userRepository,
                         ParentRepository parentRepository) {
        this.doctorRepository = doctorRepository;
        this.childRepository = childRepository;
        this.assignmentRepository = assignmentRepository;
        this.moduleRepository = moduleRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.sessionRepository = sessionRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
    }

    public DoctorProfileDto getDoctorByUserId(Integer userId) {
        Doctor doctor = doctorRepository.findByUserUserIdAndUserIsActiveTrue(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return new DoctorProfileDto(
                doctor.getDoctorId(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getPhone()
        );
    }

    public List<DoctorChildDto> getAssignedChildren(Integer doctorId) {
        getActiveDoctor(doctorId);
        return childRepository.findByDoctorDoctorIdAndUserIsActiveTrue(doctorId).stream()
                .map(child -> new DoctorChildDto(
                        child.getChildId(),
                        child.getFirstName(),
                        child.getLastName(),
                        child.getDiagnosis(),
                        child.getLevel(),
                        child.getCurrentStreak(),
                        child.getTotalScore()
                ))
                .toList();
    }

    public List<com.cognicare.model.Module> getAllModules() {
        return moduleRepository.findByIsActiveTrue();
    }

    public List<com.cognicare.model.Module> getModulesByCategory(String category) {
        return moduleRepository.findByIsActiveTrueAndCategory(category);
    }

    @Transactional
    public void createAssignment(Integer doctorId, AssignmentRequest request) {
        Doctor doctor = getActiveDoctor(doctorId);
        Child child = getActiveChild(request.getChildId());
        validateAssignedChild(doctor, child);
        com.cognicare.model.Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Assignment assignment = new Assignment();
        assignment.setChild(child);
        assignment.setModule(module);
        assignment.setAssignedBy(doctor);
        assignment.setDifficultyLevel(Assignment.DifficultyLevel.valueOf(request.getDifficultyLevel()));
        assignment.setDueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null);
        assignment.setNotes(request.getNotes());
        assignmentRepository.save(assignment);
    }

    @Transactional
    public void createPrescription(Integer doctorId, PrescriptionRequest request) {
        Doctor doctor = getActiveDoctor(doctorId);
        Child child = getActiveChild(request.getChildId());
        validateAssignedChild(doctor, child);

        Prescription prescription = new Prescription();
        prescription.setChild(child);
        prescription.setDoctor(doctor);
        prescription.setTitle(request.getTitle());
        prescription.setDescription(request.getDescription());
        prescription.setDosage(request.getDosage());
        prescription.setFrequency(request.getFrequency());
        prescription.setStartDate(request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : null);
        prescription.setEndDate(request.getEndDate() != null ? LocalDate.parse(request.getEndDate()) : null);
        prescriptionRepository.save(prescription);
    }

    @Transactional
    public void scheduleSession(Integer doctorId, SessionRequest request) {
        Doctor doctor = getActiveDoctor(doctorId);
        Child child = getActiveChild(request.getChildId());
        validateAssignedChild(doctor, child);

        TherapySession session = new TherapySession();
        session.setChild(child);
        session.setDoctor(doctor);
        session.setSessionTitle(request.getSessionTitle());
        session.setSessionType(TherapySession.SessionType.valueOf(request.getSessionType()));
        session.setGoogleMeetLink(request.getGoogleMeetLink());
        session.setScheduledAt(LocalDateTime.parse(request.getScheduledAt()));
        session.setDurationMinutes(request.getDurationMinutes());
        session.setNotes(request.getNotes());
        sessionRepository.save(session);
    }

    public List<Assignment> getChildAssignments(Integer childId) {
        return assignmentRepository.findByChildChildId(childId);
    }

    @Transactional(readOnly = true)
    public List<DoctorAssignmentDto> getDoctorAssignments(Integer doctorId) {
        getActiveDoctor(doctorId);
        return assignmentRepository.findByAssignedByDoctorId(doctorId).stream()
                .map(a -> new DoctorAssignmentDto(
                        a.getAssignmentId(),
                        a.getChild().getChildId(),
                        a.getChild().getFirstName() + " " + a.getChild().getLastName(),
                        a.getModule().getName(),
                        a.getDifficultyLevel().name(),
                        a.getIsCompleted(),
                        a.getScore(),
                        a.getDueDate(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorSessionDto> getDoctorSessions(Integer doctorId) {
        getActiveDoctor(doctorId);
        return sessionRepository.findByDoctorDoctorId(doctorId).stream()
                .filter(s -> s.getStatus() != TherapySession.SessionStatus.DELETED
                          && s.getStatus() != TherapySession.SessionStatus.COMPLETED
                          && s.getStatus() != TherapySession.SessionStatus.CANCELLED)
                .map(s -> new DoctorSessionDto(
                        s.getSessionId(),
                        s.getChild().getChildId(),
                        s.getChild().getFirstName() + " " + s.getChild().getLastName(),
                        s.getSessionTitle(),
                        s.getSessionType().name(),
                        s.getGoogleMeetLink(),
                        s.getScheduledAt(),
                        s.getDurationMinutes(),
                        s.getStatus().name(),
                        s.getStatus() != TherapySession.SessionStatus.COMPLETED
                ))
                .toList();
    }

    @Transactional
    public void deleteSession(Integer doctorId, Integer sessionId) {
        Doctor doctor = getActiveDoctor(doctorId);
        TherapySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            throw new RuntimeException("You can only delete your own sessions");
        }
        if (session.getStatus() == TherapySession.SessionStatus.COMPLETED) {
            throw new RuntimeException("Cannot delete a completed session");
        }
        session.setStatus(TherapySession.SessionStatus.DELETED);
        sessionRepository.save(session);
    }

    @Transactional
    public void deletePrescription(Integer doctorId, Integer prescriptionId) {
        Doctor doctor = getActiveDoctor(doctorId);
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!prescription.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            throw new RuntimeException("You can only delete your own prescriptions");
        }
        if (!Boolean.TRUE.equals(prescription.getIsActive())) {
            throw new RuntimeException("Prescription already deleted");
        }
        prescription.setIsActive(false);
        prescriptionRepository.save(prescription);
    }

    @Transactional(readOnly = true)
    public List<DoctorPrescriptionDto> getDoctorPrescriptions(Integer doctorId) {
        getActiveDoctor(doctorId);
        return prescriptionRepository.findByDoctorDoctorId(doctorId).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .map(p -> new DoctorPrescriptionDto(
                        p.getPrescriptionId(),
                        p.getChild().getChildId(),
                        p.getChild().getFirstName() + " " + p.getChild().getLastName(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getDosage(),
                        p.getFrequency(),
                        p.getStartDate(),
                        p.getEndDate(),
                        p.getCreatedAt(),
                        true
                ))
                .toList();
    }

    public List<Feedback> getDoctorFeedback(Integer doctorId) {
        return feedbackRepository.findByDoctorDoctorId(doctorId);
    }

    private Doctor getActiveDoctor(Integer doctorId) {
        return doctorRepository.findByDoctorIdAndUserIsActiveTrue(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    private Child getActiveChild(Integer childId) {
        return childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    private void validateAssignedChild(Doctor doctor, Child child) {
        if (child.getDoctor() == null || !child.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            throw new RuntimeException("This child is not assigned to you");
        }
    }

    @Transactional
    public void sendReportToParent(Integer doctorId, DoctorReportRequest request) {
        Doctor doctor = getActiveDoctor(doctorId);
        Child child = getActiveChild(request.getChildId());

        Feedback report = new Feedback();
        report.setDoctor(doctor);
        report.setChild(child);

        parentRepository.findParentByChildId(child.getChildId())
                .ifPresent(report::setParent);

        report.setFeedbackType(Feedback.FeedbackType.REPORT);
        report.setReportTitle(request.getReportTitle());
        report.setComment(request.getReportContent());
        report.setRating(request.getRating());
        feedbackRepository.save(report);
    }
}
