package com.cognicare.repository;

import com.cognicare.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Integer> {
    Optional<PasswordResetOtp> findTopByEmailAndOtpAndUsedFalseAndExpiryTimeAfterOrderByIdDesc(String email, String otp, LocalDateTime now);
    Optional<PasswordResetOtp> findTopByEmailAndUsedTrueOrderByIdDesc(String email);
    Optional<PasswordResetOtp> findTopByEmailAndUsedFalseOrderByIdDesc(String email);
    List<PasswordResetOtp> findByEmail(String email);
    
    @Modifying
    @Query(value = "DELETE FROM password_reset_otp WHERE email = :email", nativeQuery = true)
    void deleteByEmailNative(String email);
}
