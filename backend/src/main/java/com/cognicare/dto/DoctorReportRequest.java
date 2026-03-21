package com.cognicare.dto;

import jakarta.validation.constraints.NotNull;

public class DoctorReportRequest {
    @NotNull(message = "Child ID is required")
    private Integer childId;

    private String reportTitle;
    private String reportContent;
    private Integer rating;

    public Integer getChildId() { return childId; }
    public void setChildId(Integer childId) { this.childId = childId; }
    public String getReportTitle() { return reportTitle; }
    public void setReportTitle(String reportTitle) { this.reportTitle = reportTitle; }
    public String getReportContent() { return reportContent; }
    public void setReportContent(String reportContent) { this.reportContent = reportContent; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
