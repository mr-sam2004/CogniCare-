package com.cognicare.controller;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorProfileDto>> getProfile(
            @RequestParam Integer userId) {
        try {
            DoctorProfileDto doctor = doctorService.getDoctorByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success(doctor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<DoctorChildDto>>> getAssignedChildren(
            @RequestParam Integer doctorId) {
        try {
            List<DoctorChildDto> children = doctorService.getAssignedChildren(doctorId);
            return ResponseEntity.ok(ApiResponse.success(children));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<DoctorAssignmentDto>>> getDoctorAssignments(
            @RequestParam Integer doctorId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorAssignments(doctorId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<DoctorSessionDto>>> getDoctorSessions(
            @RequestParam Integer doctorId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorSessions(doctorId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<List<DoctorPrescriptionDto>>> getDoctorPrescriptions(
            @RequestParam Integer doctorId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorPrescriptions(doctorId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/modules")
    public ResponseEntity<ApiResponse<List<com.cognicare.model.Module>>> getModules(
            @RequestParam(required = false) String category) {
        try {
            List<com.cognicare.model.Module> modules = category != null 
                    ? doctorService.getModulesByCategory(category)
                    : doctorService.getAllModules();
            return ResponseEntity.ok(ApiResponse.success(modules));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/assign-module")
    public ResponseEntity<ApiResponse<String>> assignModule(
            @RequestParam Integer doctorId,
            @Valid @RequestBody AssignmentRequest request) {
        try {
            doctorService.createAssignment(doctorId, request);
            return ResponseEntity.ok(ApiResponse.success("Module assigned successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/prescription")
    public ResponseEntity<ApiResponse<String>> createPrescription(
            @RequestParam Integer doctorId,
            @Valid @RequestBody PrescriptionRequest request) {
        try {
            doctorService.createPrescription(doctorId, request);
            return ResponseEntity.ok(ApiResponse.success("Prescription created", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/session")
    public ResponseEntity<ApiResponse<String>> scheduleSession(
            @RequestParam Integer doctorId,
            @Valid @RequestBody SessionRequest request) {
        try {
            doctorService.scheduleSession(doctorId, request);
            return ResponseEntity.ok(ApiResponse.success("Session scheduled", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/assignments")
    public ResponseEntity<ApiResponse<List<Assignment>>> getChildAssignments(
            @PathVariable Integer childId) {
        try {
            List<Assignment> assignments = doctorService.getChildAssignments(childId);
            return ResponseEntity.ok(ApiResponse.success(assignments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse<List<Feedback>>> getFeedback(
            @RequestParam Integer doctorId) {
        try {
            List<Feedback> feedback = doctorService.getDoctorFeedback(doctorId);
            return ResponseEntity.ok(ApiResponse.success(feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<String>> deleteSession(
            @PathVariable Integer sessionId,
            @RequestParam Integer doctorId) {
        try {
            doctorService.deleteSession(doctorId, sessionId);
            return ResponseEntity.ok(ApiResponse.success("Session deleted", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/prescription/{prescriptionId}")
    public ResponseEntity<ApiResponse<String>> deletePrescription(
            @PathVariable Integer prescriptionId,
            @RequestParam Integer doctorId) {
        try {
            doctorService.deletePrescription(doctorId, prescriptionId);
            return ResponseEntity.ok(ApiResponse.success("Prescription deleted", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/report")
    public ResponseEntity<ApiResponse<String>> sendReport(
            @RequestParam Integer doctorId,
            @RequestBody DoctorReportRequest request) {
        try {
            if (request.getChildId() == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Child ID is required"));
            }
            doctorService.sendReportToParent(doctorId, request);
            return ResponseEntity.ok(ApiResponse.success("Report sent to parent", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
