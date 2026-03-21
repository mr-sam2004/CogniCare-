package com.cognicare.dto;

public class AdminDoctorDto {
    private Integer doctorId;
    private String firstName;
    private String lastName;
    private String email;
    private String specialization;
    private String phone;

    public AdminDoctorDto(Integer doctorId, String firstName, String lastName, String email,
                          String specialization, String phone) {
        this.doctorId = doctorId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.specialization = specialization;
        this.phone = phone;
    }

    public Integer getDoctorId() { return doctorId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getSpecialization() { return specialization; }
    public String getPhone() { return phone; }
}
