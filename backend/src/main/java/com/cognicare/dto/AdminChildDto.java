package com.cognicare.dto;

public class AdminChildDto {
    private Integer childId;
    private String firstName;
    private String lastName;
    private String email;
    private Integer parentId;
    private Integer doctorId;
    private String diagnosis;
    private Integer level;
    private Integer currentStreak;
    private Integer totalScore;

    public AdminChildDto(Integer childId, String firstName, String lastName, String email,
                         Integer parentId, Integer doctorId, String diagnosis,
                         Integer level, Integer currentStreak, Integer totalScore) {
        this.childId = childId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.parentId = parentId;
        this.doctorId = doctorId;
        this.diagnosis = diagnosis;
        this.level = level;
        this.currentStreak = currentStreak;
        this.totalScore = totalScore;
    }

    public Integer getChildId() { return childId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public Integer getParentId() { return parentId; }
    public Integer getDoctorId() { return doctorId; }
    public String getDiagnosis() { return diagnosis; }
    public Integer getLevel() { return level; }
    public Integer getCurrentStreak() { return currentStreak; }
    public Integer getTotalScore() { return totalScore; }
}
