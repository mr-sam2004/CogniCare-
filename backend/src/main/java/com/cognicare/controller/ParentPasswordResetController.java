package com.cognicare.controller;

import com.cognicare.dto.ApiResponse;
import com.cognicare.model.PasswordResetOtp;
import com.cognicare.model.User;
import com.cognicare.repository.UserRepository;
import com.cognicare.service.EmailService;
import com.cognicare.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/parent")
public class ParentPasswordResetController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getRole().name().equals("PARENT")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email not found or not a parent account"));
        }
        
        PasswordResetOtp otp = otpService.createOtp(email);
        emailService.sendOtpEmail(email, otp.getOtp());
        
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", null));
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        boolean isValid = otpService.verifyOtp(email, otp);
        if (!isValid) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", null));
    }
}
