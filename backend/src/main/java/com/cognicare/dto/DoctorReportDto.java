package com.cognicare.dto;

import java.time.LocalDateTime;

public class DoctorReportDto {
    private Integer feedbackId;
    private Integer childId;
    private String childName;
    private String reportTitle;
    private String reportContent;
    private Integer rating;
    private String doctorName;
    private Boolean seen;
    private LocalDateTime createdAt;

    public DoctorReportDto() {}

    public DoctorReportDto(Integer feedbackId, Integer childId, String childName, String reportTitle,
                          String reportContent, Integer rating, String doctorName, Boolean seen, LocalDateTime createdAt) {
        this.feedbackId = feedbackId;
        this.childId = childId;
        this.childName = childName;
        this.reportTitle = reportTitle;
        this.reportContent = reportContent;
        this.rating = rating;
        this.doctorName = doctorName;
        this.seen = seen;
        this.createdAt = createdAt;
    }

    public Integer getFeedbackId() { return feedbackId; }
    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public String getReportTitle() { return reportTitle; }
    public String getReportContent() { return reportContent; }
    public Integer getRating() { return rating; }
    public String getDoctorName() { return doctorName; }
    public Boolean getSeen() { return seen; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
