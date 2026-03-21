package com.cognicare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DoctorPrescriptionDto {
    private Integer prescriptionId;
    private Integer childId;
    private String childName;
    private String title;
    private String description;
    private String dosage;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private boolean canDelete;

    public DoctorPrescriptionDto(Integer prescriptionId, Integer childId, String childName, String title,
                                 String description, String dosage, String frequency,
                                 LocalDate startDate, LocalDate endDate, LocalDateTime createdAt,
                                 boolean canDelete) {
        this.prescriptionId = prescriptionId;
        this.childId = childId;
        this.childName = childName;
        this.title = title;
        this.description = description;
        this.dosage = dosage;
        this.frequency = frequency;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
        this.canDelete = canDelete;
    }

    public Integer getPrescriptionId() { return prescriptionId; }
    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDosage() { return dosage; }
    public String getFrequency() { return frequency; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isCanDelete() { return canDelete; }
}
