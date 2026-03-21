package com.cognicare.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private Integer userId;
    private String firstName;
    private String lastName;

    public LoginResponse() {}

    public LoginResponse(String token, String email, String role, Integer userId, String firstName, String lastName) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
