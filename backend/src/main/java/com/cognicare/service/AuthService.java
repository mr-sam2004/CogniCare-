package com.cognicare.service;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.repository.ChildIntakeRepository;
import com.cognicare.repository.*;
import com.cognicare.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final ChildRepository childRepository;
    private final ChildIntakeRepository childIntakeRepository;
    private final FileStorageService fileStorageService;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, ParentRepository parentRepository,
                       ChildRepository childRepository, DoctorRepository doctorRepository,
                       ChildIntakeRepository childIntakeRepository, FileStorageService fileStorageService,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
        this.childRepository = childRepository;
        this.doctorRepository = doctorRepository;
        this.childIntakeRepository = childIntakeRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        String firstName = "";
        String lastName = "";

        switch (user.getRole()) {
            case PARENT -> {
                Parent parent = parentRepository.findByUserUserId(user.getUserId()).orElse(null);
                if (parent != null) {
                    if (parent.getApprovalStatus() != Parent.ApprovalStatus.APPROVED) {
                        throw new RuntimeException("Parent account is not approved yet");
                    }
                    firstName = parent.getFirstName();
                    lastName = parent.getLastName();
                }
            }
            case DOCTOR -> {
                Doctor doctor = doctorRepository.findByUserUserId(user.getUserId()).orElse(null);
                if (doctor != null) {
                    firstName = doctor.getFirstName();
                    lastName = doctor.getLastName();
                }
            }
            case CHILD -> {
                Child child = childRepository.findByUserUserId(user.getUserId()).orElse(null);
                if (child != null) {
                    firstName = child.getFirstName();
                    lastName = child.getLastName();
                }
            }
            case ADMIN -> {
                firstName = "Admin";
                lastName = "User";
            }
        }

        return new LoginResponse(token, user.getEmail(), user.getRole().name(), user.getUserId(), firstName, lastName);
    }

    @Transactional
    public LoginResponse parentSignup(ParentSignupRequest request, org.springframework.web.multipart.MultipartFile report) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PARENT);
        user.setIsActive(true);
        user = userRepository.save(user);

        Parent parent = new Parent();
        parent.setUser(user);
        parent.setFirstName(request.getFirstName());
        parent.setLastName(request.getLastName());
        parent.setPhone(request.getPhone());
        parent.setAddress(request.getAddress());
        parent.setApprovalStatus(Parent.ApprovalStatus.PENDING);
        parentRepository.save(parent);

        if (request.getChildFirstName() != null && !request.getChildFirstName().isEmpty()) {
            String reportPath = fileStorageService.store(report);

            ChildIntake intake = new ChildIntake();
            intake.setParent(parent);
            intake.setChildFirstName(request.getChildFirstName());
            intake.setChildLastName(request.getChildLastName());
            intake.setDateOfBirth(parseDate(request.getChildDateOfBirth()));
            intake.setGender(request.getChildGender());
            intake.setDiagnosis(request.getChildDiagnosis());
            intake.setCognitiveLevel(request.getCognitiveLevel());
            intake.setDoctorFeedback(request.getDoctorFeedback());
            intake.setQuestionnaireJson(request.getQuestionnaireJson());
            intake.setMedicalReportPath(reportPath);
            childIntakeRepository.save(intake);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getEmail(), user.getRole().name(), user.getUserId(), request.getFirstName(), request.getLastName());
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
}
