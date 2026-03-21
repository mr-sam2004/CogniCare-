package com.cognicare.service;

import com.cognicare.model.PasswordResetOtp;
import com.cognicare.repository.PasswordResetOtpRepository;
import com.cognicare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {
    @Autowired
    private PasswordResetOtpRepository otpRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final Random random = new Random();
    
    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
    
    @Transactional
    public PasswordResetOtp createOtp(String email) {
        PasswordResetOtp otp = new PasswordResetOtp();
        otp.setEmail(email);
        otp.setOtp(generateOtp());
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otp.setUsed(false);
        
        return otpRepository.save(otp);
    }
    
    @Transactional
    public boolean verifyOtp(String email, String otpCode) {
        Optional<PasswordResetOtp> optOtp = otpRepository.findTopByEmailAndOtpAndUsedFalseAndExpiryTimeAfterOrderByIdDesc(
            email, otpCode, LocalDateTime.now());
        
        if (optOtp.isPresent()) {
            PasswordResetOtp otp = optOtp.get();
            otp.setUsed(true);
            otpRepository.save(otp);
            return true;
        }
        return false;
    }
    
    public boolean isOtpVerified(String email) {
        return otpRepository.findTopByEmailAndUsedTrueOrderByIdDesc(email).isPresent();
    }
    
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void resetUserPassword(String email, String hashedPassword) {
        userRepository.updatePasswordByEmail(email, hashedPassword);
    }
    
    public void deleteOtpByEmail(String email) {
        // No-op: OTPs will naturally expire
    }
}
