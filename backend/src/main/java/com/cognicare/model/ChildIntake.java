package com.cognicare.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "child_intake")
public class ChildIntake {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "intake_id")
    private Integer intakeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @Column(name = "child_first_name", nullable = false)
    private String childFirstName;

    @Column(name = "child_last_name", nullable = false)
    private String childLastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    private String gender;
    private String diagnosis;

    @Column(name = "cognitive_level")
    private String cognitiveLevel;

    @Column(name = "doctor_feedback", columnDefinition = "TEXT")
    private String doctorFeedback;

    @Column(name = "questionnaire_json", columnDefinition = "TEXT")
    private String questionnaireJson;

    @Column(name = "medical_report_path")
    private String medicalReportPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ChildIntake() {}

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Integer getIntakeId() { return intakeId; }
    public void setIntakeId(Integer intakeId) { this.intakeId = intakeId; }
    public Parent getParent() { return parent; }
    public void setParent(Parent parent) { this.parent = parent; }
    public String getChildFirstName() { return childFirstName; }
    public void setChildFirstName(String childFirstName) { this.childFirstName = childFirstName; }
    public String getChildLastName() { return childLastName; }
    public void setChildLastName(String childLastName) { this.childLastName = childLastName; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getCognitiveLevel() { return cognitiveLevel; }
    public void setCognitiveLevel(String cognitiveLevel) { this.cognitiveLevel = cognitiveLevel; }
    public String getDoctorFeedback() { return doctorFeedback; }
    public void setDoctorFeedback(String doctorFeedback) { this.doctorFeedback = doctorFeedback; }
    public String getQuestionnaireJson() { return questionnaireJson; }
    public void setQuestionnaireJson(String questionnaireJson) { this.questionnaireJson = questionnaireJson; }
    public String getMedicalReportPath() { return medicalReportPath; }
    public void setMedicalReportPath(String medicalReportPath) { this.medicalReportPath = medicalReportPath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
