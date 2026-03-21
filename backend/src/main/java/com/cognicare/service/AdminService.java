package com.cognicare.service;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final DoctorRepository doctorRepository;
    private final ChildRepository childRepository;
    private final FeedbackRepository feedbackRepository;
    private final SessionRepository sessionRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, ParentRepository parentRepository,
                        DoctorRepository doctorRepository, ChildRepository childRepository,
                        FeedbackRepository feedbackRepository, SessionRepository sessionRepository,
                        ContactMessageRepository contactMessageRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
        this.doctorRepository = doctorRepository;
        this.childRepository = childRepository;
        this.feedbackRepository = feedbackRepository;
        this.sessionRepository = sessionRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.countByIsActiveTrue();
        long totalParents = userRepository.countByRoleAndIsActiveTrue(User.Role.PARENT);
        long totalDoctors = userRepository.countByRoleAndIsActiveTrue(User.Role.DOCTOR);
        long totalChildren = userRepository.countByRoleAndIsActiveTrue(User.Role.CHILD);
        long totalSessions = sessionRepository.count();
        long pendingParents = parentRepository.countByApprovalStatusAndUserIsActiveTrue(Parent.ApprovalStatus.PENDING);

        return Map.of(
                "totalUsers", totalUsers,
                "totalParents", totalParents,
                "totalDoctors", totalDoctors,
                "totalChildren", totalChildren,
                "totalSessions", totalSessions,
                "pendingParents", pendingParents
        );
    }

    public List<ParentPendingDto> getPendingParents() {
        return parentRepository.findPendingParentDtos(Parent.ApprovalStatus.PENDING);
    }

    public List<AdminParentDto> getAllParents() {
        return parentRepository.findAllParentDtos();
    }

    public List<AdminDoctorDto> getAllDoctors() {
        return doctorRepository.findAllDoctorDtos();
    }

    public List<AdminChildDto> getAllChildren() {
        return childRepository.findAllChildDtos();
    }

    @Transactional
    public void approveParent(Integer parentId, Integer adminId) {
        Parent parent = getActiveParent(parentId);
        parent.setApprovalStatus(Parent.ApprovalStatus.APPROVED);
        if (adminId != null) {
            parent.setApprovedBy(adminId);
            parent.setApprovedAt(LocalDateTime.now());
        }
        parentRepository.save(parent);
    }

    @Transactional
    public void rejectParent(Integer parentId) {
        Parent parent = getActiveParent(parentId);
        parent.setApprovalStatus(Parent.ApprovalStatus.REJECTED);
        parentRepository.save(parent);
    }

    @Transactional
    public Doctor createDoctor(DoctorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.DOCTOR);
        user.setIsActive(true);
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setPhone(request.getPhone());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        return doctorRepository.save(doctor);
    }

    @Transactional
    public Child createChild(ChildCreateRequest request) {
        String childEmail = request.getEmail();
        if (userRepository.existsByEmail(childEmail)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(childEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.CHILD);
        user.setIsActive(true);
        user = userRepository.save(user);

        Parent parent = getActiveParent(request.getParentId());
        if (parent.getApprovalStatus() != Parent.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Parent must be approved before creating child account");
        }

        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = getActiveDoctor(request.getDoctorId());
        }

        Child child = new Child();
        child.setUser(user);
        child.setParent(parent);
        child.setDoctor(doctor);
        child.setFirstName(request.getFirstName());
        child.setLastName(request.getLastName());
        child.setDateOfBirth(parseDate(request.getDateOfBirth()));
        child.setGender(request.getGender());
        child.setDiagnosis(request.getDiagnosis());
        child.setLoginUsername(request.getEmail());
        child.setTempPassword(request.getPassword());
        child.setTempPasswordShownAt(null);
        return childRepository.save(child);
    }

    public List<FeedbackDto> getAllFeedback() {
        return feedbackRepository.findByFeedbackTypeOrderByCreatedAtDesc(Feedback.FeedbackType.PARENT_FEEDBACK).stream()
                .map(f -> {
                    String fromName = null;
                    if (f.getParent() != null) {
                        fromName = f.getParent().getFirstName() + " " + f.getParent().getLastName();
                    }
                    return new FeedbackDto(
                            f.getFeedbackId(),
                            f.getRating(),
                            f.getComment(),
                            f.getFeedbackType() != null ? f.getFeedbackType().name() : null,
                            fromName,
                            "Parent",
                            f.getCreatedAt()
                    );
                })
                .toList();
    }

    @Transactional
    public AdminParentDto updateParent(Integer parentId, AdminParentUpdateRequest request) {
        Parent parent = getActiveParent(parentId);

        if (request.getFirstName() != null) parent.setFirstName(request.getFirstName());
        if (request.getLastName() != null) parent.setLastName(request.getLastName());
        if (request.getPhone() != null) parent.setPhone(request.getPhone());
        if (request.getAddress() != null) parent.setAddress(request.getAddress());
        if (request.getApprovalStatus() != null && !request.getApprovalStatus().isBlank()) {
            parent.setApprovalStatus(Parent.ApprovalStatus.valueOf(request.getApprovalStatus()));
        }

        parentRepository.save(parent);
        return new AdminParentDto(
                parent.getParentId(), parent.getFirstName(), parent.getLastName(),
                parent.getUser().getEmail(), parent.getPhone(), parent.getAddress(), parent.getApprovalStatus()
        );
    }

    @Transactional
    public AdminDoctorDto updateDoctor(Integer doctorId, AdminDoctorUpdateRequest request) {
        Doctor doctor = getActiveDoctor(doctorId);

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(doctor.getUser().getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            doctor.getUser().setEmail(request.getEmail());
            userRepository.save(doctor.getUser());
        }

        if (request.getFirstName() != null) doctor.setFirstName(request.getFirstName());
        if (request.getLastName() != null) doctor.setLastName(request.getLastName());
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getLicenseNumber() != null) doctor.setLicenseNumber(request.getLicenseNumber());
        if (request.getPhone() != null) doctor.setPhone(request.getPhone());
        if (request.getYearsOfExperience() != null) doctor.setYearsOfExperience(request.getYearsOfExperience());

        doctorRepository.save(doctor);
        return new AdminDoctorDto(
                doctor.getDoctorId(), doctor.getFirstName(), doctor.getLastName(),
                doctor.getUser().getEmail(), doctor.getSpecialization(), doctor.getPhone()
        );
    }

    @Transactional
    public AdminChildDto updateChild(Integer childId, AdminChildUpdateRequest request) {
        Child child = getActiveChild(childId);

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(child.getUser().getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            child.getUser().setEmail(request.getEmail());
            userRepository.save(child.getUser());
            child.setLoginUsername(request.getEmail());
        }

        if (request.getFirstName() != null) child.setFirstName(request.getFirstName());
        if (request.getLastName() != null) child.setLastName(request.getLastName());
        if (request.getGender() != null) child.setGender(request.getGender());
        if (request.getDiagnosis() != null) child.setDiagnosis(request.getDiagnosis());
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            child.setDateOfBirth(parseDate(request.getDateOfBirth()));
        }

        if (request.getParentId() != null) {
            Parent parent = getActiveParent(request.getParentId());
            child.setParent(parent);
        }

        if (request.getDoctorId() != null) {
            if (request.getDoctorId() <= 0) {
                child.setDoctor(null);
            } else {
                Doctor doctor = getActiveDoctor(request.getDoctorId());
                child.setDoctor(doctor);
            }
        }

        childRepository.save(child);
        return new AdminChildDto(
                child.getChildId(), child.getFirstName(), child.getLastName(), child.getUser().getEmail(),
                child.getParent().getParentId(), child.getDoctor() != null ? child.getDoctor().getDoctorId() : null,
                child.getDiagnosis(),
                child.getLevel(), child.getCurrentStreak(), child.getTotalScore()
        );
    }

    @Transactional
    public void deleteChild(Integer childId) {
        Child child = getActiveChild(childId);
        deactivateUser(child.getUser());
    }

    @Transactional
    public void deleteDoctor(Integer doctorId) {
        Doctor doctor = getActiveDoctor(doctorId);

        childRepository.findByDoctorDoctorIdAndUserIsActiveTrue(doctorId).forEach(c -> {
            c.setDoctor(null);
            childRepository.save(c);
        });

        deactivateUser(doctor.getUser());
    }

    @Transactional
    public void deleteParent(Integer parentId) {
        Parent parent = getActiveParent(parentId);

        childRepository.findByParentParentIdAndUserIsActiveTrue(parentId)
                .forEach(c -> deactivateUser(c.getUser()));

        deactivateUser(parent.getUser());
    }

    private Parent getActiveParent(Integer parentId) {
        return parentRepository.findByParentIdAndUserIsActiveTrue(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
    }

    private Doctor getActiveDoctor(Integer doctorId) {
        return doctorRepository.findByDoctorIdAndUserIsActiveTrue(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    private Child getActiveChild(Integer childId) {
        return childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    private void deactivateUser(User user) {
        user.setIsActive(false);
        userRepository.save(user);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException("Date of birth is required");
        }

        List<DateTimeFormatter> formats = List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd-MMM-yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy")
        );

        for (DateTimeFormatter formatter : formats) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        throw new RuntimeException("Invalid date format. Use yyyy-MM-dd");
    }

    public List<AdminContactDto> getAllContactMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(m -> new AdminContactDto(
                        m.getMessageId(), m.getName(), m.getEmail(), m.getPhone(),
                        m.getSubject(), m.getMessage(), m.getIsRead(), m.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void markContactAsRead(Integer messageId) {
        ContactMessage msg = contactMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setIsRead(true);
        contactMessageRepository.save(msg);
    }

    public long getUnreadContactCount() {
        return contactMessageRepository.countByIsReadFalse();
    }
}
