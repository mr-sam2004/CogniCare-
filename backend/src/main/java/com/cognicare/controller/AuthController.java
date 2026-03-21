package com.cognicare.controller;

import com.cognicare.dto.*;
import com.cognicare.model.User;
import com.cognicare.repository.UserRepository;
import com.cognicare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping(value = "/parent/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LoginResponse>> parentSignup(
            @Valid @RequestPart("data") ParentSignupRequest request,
            @RequestPart(value = "report", required = false) MultipartFile report) {
        try {
            LoginResponse response = authService.parentSignup(request, report);
            return ResponseEntity.ok(ApiResponse.success("Parent registered successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/parent/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password must be at least 6 characters"));
        }
        
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Passwords do not match"));
        }
        
        String hashedPassword = passwordEncoder.encode(newPassword);
        
        int rows = jdbcTemplate.update("UPDATE users SET password_hash = ? WHERE email = ? AND role = 'PARENT'", hashedPassword, email);
        
        if (rows == 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found or not a parent account"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }
}
