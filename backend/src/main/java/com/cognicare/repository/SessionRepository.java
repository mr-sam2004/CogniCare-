package com.cognicare.repository;

import com.cognicare.model.TherapySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<TherapySession, Integer> {
    List<TherapySession> findByChildChildId(Integer childId);
    List<TherapySession> findByDoctorDoctorId(Integer doctorId);
    List<TherapySession> findByChildChildIdAndScheduledAtAfter(Integer childId, LocalDateTime after);
    List<TherapySession> findByDoctorDoctorIdAndScheduledAtAfter(Integer doctorId, LocalDateTime after);
    List<TherapySession> findByScheduledAtBetween(LocalDateTime start, LocalDateTime end);
    long countByScheduledAtAfter(LocalDateTime after);
    List<TherapySession> findByChildChildIdAndScheduledAtBetween(Integer childId, LocalDateTime start, LocalDateTime end);
}
