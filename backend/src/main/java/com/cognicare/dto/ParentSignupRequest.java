package com.cognicare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ParentSignupRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;
    private String address;

    private String childFirstName;
    private String childLastName;
    private String childDateOfBirth;
    private String childGender;
    private String childDiagnosis;
    private String cognitiveLevel;
    private String doctorFeedback;
    private String questionnaireJson;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getChildFirstName() { return childFirstName; }
    public void setChildFirstName(String childFirstName) { this.childFirstName = childFirstName; }
    public String getChildLastName() { return childLastName; }
    public void setChildLastName(String childLastName) { this.childLastName = childLastName; }
    public String getChildDateOfBirth() { return childDateOfBirth; }
    public void setChildDateOfBirth(String childDateOfBirth) { this.childDateOfBirth = childDateOfBirth; }
    public String getChildGender() { return childGender; }
    public void setChildGender(String childGender) { this.childGender = childGender; }
    public String getChildDiagnosis() { return childDiagnosis; }
    public void setChildDiagnosis(String childDiagnosis) { this.childDiagnosis = childDiagnosis; }
    public String getCognitiveLevel() { return cognitiveLevel; }
    public void setCognitiveLevel(String cognitiveLevel) { this.cognitiveLevel = cognitiveLevel; }
    public String getDoctorFeedback() { return doctorFeedback; }
    public void setDoctorFeedback(String doctorFeedback) { this.doctorFeedback = doctorFeedback; }
    public String getQuestionnaireJson() { return questionnaireJson; }
    public void setQuestionnaireJson(String questionnaireJson) { this.questionnaireJson = questionnaireJson; }
}
