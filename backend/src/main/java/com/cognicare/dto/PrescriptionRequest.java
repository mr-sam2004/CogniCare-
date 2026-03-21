package com.cognicare.dto;

import jakarta.validation.constraints.NotNull;

public class PrescriptionRequest {
    @NotNull(message = "Child ID is required")
    private Integer childId;

    @NotNull(message = "Title is required")
    private String title;

    private String description;
    private String dosage;
    private String frequency;
    private String startDate;
    private String endDate;

    public Integer getChildId() { return childId; }
    public void setChildId(Integer childId) { this.childId = childId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
}
