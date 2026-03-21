package com.cognicare.controller;

import com.cognicare.dto.*;
import com.cognicare.model.Doctor;
import com.cognicare.model.Feedback;
import com.cognicare.model.Parent;
import com.cognicare.dto.ParentPendingDto;
import com.cognicare.service.AdminService;
import com.cognicare.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/pending-parents")
    public ResponseEntity<ApiResponse<List<ParentPendingDto>>> getPendingParents() {
        try {
            List<ParentPendingDto> parents = adminService.getPendingParents();
            return ResponseEntity.ok(ApiResponse.success(parents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/approve-parent/{parentId}")
    public ResponseEntity<ApiResponse<String>> approveParent(
            @PathVariable Integer parentId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
            }

            Integer adminId = userRepository.findByEmail(auth.getName())
                    .map(u -> u.getUserId())
                    .orElse(null);
            adminService.approveParent(parentId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Parent approved successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reject-parent/{parentId}")
    public ResponseEntity<ApiResponse<String>> rejectParent(@PathVariable Integer parentId) {
        try {
            adminService.rejectParent(parentId);
            return ResponseEntity.ok(ApiResponse.success("Parent rejected", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/create-doctor")
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        try {
            Doctor doctor = adminService.createDoctor(request);
            return ResponseEntity.ok(ApiResponse.success("Doctor created successfully", doctor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/create-child")
    public ResponseEntity<ApiResponse<AdminChildCredentialsDto>> createChild(@Valid @RequestBody ChildCreateRequest request) {
        try {
            com.cognicare.model.Child child = adminService.createChild(request);
            AdminChildCredentialsDto creds = new AdminChildCredentialsDto(
                    child.getChildId(),
                    child.getLoginUsername(),
                    request.getPassword()
            );
            return ResponseEntity.ok(ApiResponse.success("Child account created", creds));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getAllFeedback() {
        try {
            List<FeedbackDto> feedback = adminService.getAllFeedback();
            return ResponseEntity.ok(ApiResponse.success(feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<AdminContactDto>>> getAllContacts() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getAllContactMessages()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/contact/{id}/read")
    public ResponseEntity<ApiResponse<String>> markContactRead(@PathVariable Integer id) {
        try {
            adminService.markContactAsRead(id);
            return ResponseEntity.ok(ApiResponse.success("Marked as read", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/contacts/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadContactCount() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getUnreadContactCount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<AdminParentDto>>> getAllParents() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getAllParents()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<AdminDoctorDto>>> getAllDoctors() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getAllDoctors()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<AdminChildDto>>> getAllChildren() {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.getAllChildren()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<AdminParentDto>> updateParent(@PathVariable Integer parentId,
                                                                    @RequestBody AdminParentUpdateRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.updateParent(parentId, request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<String>> deleteParent(@PathVariable Integer parentId) {
        try {
            adminService.deleteParent(parentId);
            return ResponseEntity.ok(ApiResponse.success("Parent deactivated", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<AdminDoctorDto>> updateDoctor(@PathVariable Integer doctorId,
                                                                    @RequestBody AdminDoctorUpdateRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.updateDoctor(doctorId, request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<String>> deleteDoctor(@PathVariable Integer doctorId) {
        try {
            adminService.deleteDoctor(doctorId);
            return ResponseEntity.ok(ApiResponse.success("Doctor deactivated", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<AdminChildDto>> updateChild(@PathVariable Integer childId,
                                                                   @RequestBody AdminChildUpdateRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.success(adminService.updateChild(childId, request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<String>> deleteChild(@PathVariable Integer childId) {
        try {
            adminService.deleteChild(childId);
            return ResponseEntity.ok(ApiResponse.success("Child deactivated", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
