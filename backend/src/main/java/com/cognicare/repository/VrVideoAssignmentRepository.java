package com.cognicare.repository;

import com.cognicare.model.VrVideoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VrVideoAssignmentRepository extends JpaRepository<VrVideoAssignment, Integer> {
    List<VrVideoAssignment> findByDoctorDoctorIdAndIsActiveTrue(Integer doctorId);
    List<VrVideoAssignment> findByDoctorDoctorId(Integer doctorId);
    List<VrVideoAssignment> findByChildChildIdAndIsActiveTrue(Integer childId);
    Optional<VrVideoAssignment> findByAssignmentIdAndChildChildIdAndIsActiveTrue(Integer assignmentId, Integer childId);
    Optional<VrVideoAssignment> findByAssignmentIdAndChildChildId(Integer assignmentId, Integer childId);
}
