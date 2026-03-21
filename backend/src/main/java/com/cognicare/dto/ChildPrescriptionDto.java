package com.cognicare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ChildPrescriptionDto {
    private Integer prescriptionId;
    private String doctorName;
    private String doctorSpecialization;
    private String childName;
    private String title;
    private String description;
    private String dosage;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;

    public ChildPrescriptionDto(Integer prescriptionId, String doctorName, String doctorSpecialization,
                                String childName, String title, String description,
                                String dosage, String frequency, LocalDate startDate,
                                LocalDate endDate, LocalDateTime createdAt) {
        this.prescriptionId = prescriptionId;
        this.doctorName = doctorName;
        this.doctorSpecialization = doctorSpecialization;
        this.childName = childName;
        this.title = title;
        this.description = description;
        this.dosage = dosage;
        this.frequency = frequency;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
    }

    public Integer getPrescriptionId() { return prescriptionId; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorSpecialization() { return doctorSpecialization; }
    public String getChildName() { return childName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDosage() { return dosage; }
    public String getFrequency() { return frequency; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
