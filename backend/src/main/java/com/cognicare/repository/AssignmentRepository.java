package com.cognicare.repository;

import com.cognicare.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
    List<Assignment> findByChildChildId(Integer childId);
    List<Assignment> findByAssignedByDoctorId(Integer doctorId);
    List<Assignment> findByChildChildIdAndIsCompletedFalse(Integer childId);
    List<Assignment> findByChildChildIdAndIsCompletedTrue(Integer childId);

    @Query("SELECT a FROM Assignment a WHERE a.child.childId = :childId AND a.isCompleted = true AND a.completedAt >= :since ORDER BY a.completedAt DESC")
    List<Assignment> findCompletedByChildAfter(@Param("childId") Integer childId, @Param("since") LocalDateTime since);
}
