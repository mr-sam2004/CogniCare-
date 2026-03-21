package com.cognicare.repository;

import com.cognicare.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    List<Prescription> findByChildChildId(Integer childId);
    List<Prescription> findByDoctorDoctorId(Integer doctorId);
    List<Prescription> findByChildChildIdAndIsActiveTrue(Integer childId);
    java.util.Optional<Prescription> findByPrescriptionIdAndChildChildIdAndIsActiveTrue(Integer prescriptionId, Integer childId);
}
