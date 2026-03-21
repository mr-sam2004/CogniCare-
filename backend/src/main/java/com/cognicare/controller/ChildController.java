package com.cognicare.controller;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.service.ChildService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/child")
public class ChildController {

    private final ChildService childService;

    public ChildController(ChildService childService) {
        this.childService = childService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ChildService.ChildProfile>> getProfile(
            @RequestParam Integer userId) {
        try {
            ChildService.ChildProfile profile = childService.getProfile(
                    childService.getChildByUserId(userId).getChildId());
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/modules")
    public ResponseEntity<ApiResponse<List<ChildTaskDto>>> getAssignedModules(
            @RequestParam Integer childId) {
        try {
            List<ChildTaskDto> modules = childService.getAssignedModules(childId);
            return ResponseEntity.ok(ApiResponse.success(modules));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<ChildTaskDto>>> getPendingTasks(
            @RequestParam Integer childId) {
        try {
            List<ChildTaskDto> tasks = childService.getPendingTasks(childId);
            return ResponseEntity.ok(ApiResponse.success(tasks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/activity")
    public ResponseEntity<ApiResponse<String>> submitActivityResult(
            @RequestParam Integer childId,
            @Valid @RequestBody ActivityResultRequest request) {
        try {
            childService.submitActivityResult(childId, request);
            return ResponseEntity.ok(ApiResponse.success("Activity completed!", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/streak")
    public ResponseEntity<ApiResponse<Void>> updateStreak(@RequestParam Integer childId) {
        try {
            childService.updateStreak(childId);
            return ResponseEntity.ok(ApiResponse.success("Streak updated", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/rewards")
    public ResponseEntity<ApiResponse<List<ChildRewardDto>>> getRewards(@RequestParam Integer childId) {
        try {
            List<ChildRewardDto> rewards = childService.getRewards(childId);
            return ResponseEntity.ok(ApiResponse.success(rewards));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChildSessionDto>>> getUpcomingSessions(
            @RequestParam Integer childId) {
        try {
            List<ChildSessionDto> sessions = childService.getUpcomingSessions(childId);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/session/{sessionId}/attend")
    public ResponseEntity<ApiResponse<String>> attendSession(
            @PathVariable Integer sessionId,
            @RequestParam Integer childId) {
        try {
            childService.attendSession(childId, sessionId);
            return ResponseEntity.ok(ApiResponse.success("Session marked as attended", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/vr-sessions")
    public ResponseEntity<ApiResponse<List<ChildSessionDto>>> getVrSessions(
            @RequestParam Integer childId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(childService.getVrSessions(childId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<List<ChildPrescriptionDto>>> getPrescriptions(
            @RequestParam Integer childId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(childService.getPrescriptions(childId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/prescription/{prescriptionId}/download")
    public ResponseEntity<String> downloadPrescription(
            @PathVariable Integer prescriptionId,
            @RequestParam Integer childId) {
        try {
            Prescription prescription = childService.getPrescriptionForDownload(childId, prescriptionId);
            String doctorName = "Dr. " + prescription.getDoctor().getFirstName() + " " + prescription.getDoctor().getLastName();
            String childName = prescription.getChild().getFirstName() + " " + prescription.getChild().getLastName();
            String content = "CogniCare+ Prescription\n"
                    + "--------------------------------\n"
                    + "Prescription ID: " + prescription.getPrescriptionId() + "\n"
                    + "Doctor: " + doctorName + "\n"
                    + "Child: " + childName + "\n"
                    + "Created At: " + prescription.getCreatedAt() + "\n\n"
                    + "Title: " + prescription.getTitle() + "\n"
                    + "Description: " + (prescription.getDescription() == null ? "-" : prescription.getDescription()) + "\n"
                    + "Dosage: " + (prescription.getDosage() == null ? "-" : prescription.getDosage()) + "\n"
                    + "Frequency: " + (prescription.getFrequency() == null ? "-" : prescription.getFrequency()) + "\n"
                    + "Start Date: " + (prescription.getStartDate() == null ? "-" : prescription.getStartDate()) + "\n"
                    + "End Date: " + (prescription.getEndDate() == null ? "-" : prescription.getEndDate()) + "\n";

            String filename = "prescription-" + prescription.getPrescriptionId() + ".txt";
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(content);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vr")
    public ResponseEntity<ApiResponse<List<com.cognicare.model.Module>>> getVRContent() {
        try {
            List<com.cognicare.model.Module> vrContent = childService.getVRContent();
            return ResponseEntity.ok(ApiResponse.success(vrContent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(
            @RequestParam Integer childId,
            @Valid @RequestBody FeedbackRequest request) {
        try {
            Feedback feedback = childService.submitFeedback(request, childId);
            return ResponseEntity.ok(ApiResponse.success("Feedback submitted", feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/profile-image")
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(
            @RequestParam Integer childId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = childService.uploadProfileImage(childId, file);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/profile-image/{childId}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Integer childId) {
        try {
            byte[] image = childService.getProfileImage(childId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .body(image);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
