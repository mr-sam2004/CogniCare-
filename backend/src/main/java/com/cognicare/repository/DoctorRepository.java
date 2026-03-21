package com.cognicare.repository;

import com.cognicare.dto.AdminDoctorDto;
import com.cognicare.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    Optional<Doctor> findByUserUserId(Integer userId);
    Optional<Doctor> findByUserUserIdAndUserIsActiveTrue(Integer userId);
    Optional<Doctor> findByDoctorIdAndUserIsActiveTrue(Integer doctorId);
    Optional<Doctor> findByLicenseNumber(String licenseNumber);

    @Query("select new com.cognicare.dto.AdminDoctorDto(d.doctorId, d.firstName, d.lastName, d.user.email, d.specialization, d.phone) from Doctor d where d.user.isActive = true")
    java.util.List<AdminDoctorDto> findAllDoctorDtos();
}
