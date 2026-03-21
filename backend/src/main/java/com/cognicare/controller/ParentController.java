package com.cognicare.controller;

import com.cognicare.dto.*;
import com.cognicare.model.*;
import com.cognicare.service.ParentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parent")
public class ParentController {

    private final ParentService parentService;

    public ParentController(ParentService parentService) {
        this.parentService = parentService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ParentProfileDto>> getProfile(@RequestParam Integer userId) {
        try {
            ParentProfileDto parent = parentService.getParentByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success(parent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<ParentChildDto>>> getChildren(@RequestParam Integer parentId) {
        try {
            List<ParentChildDto> children = parentService.getChildren(parentId);
            return ResponseEntity.ok(ApiResponse.success(children));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<Child>> getChildDetails(@PathVariable Integer childId) {
        try {
            Child child = parentService.getChildDetails(childId);
            return ResponseEntity.ok(ApiResponse.success(child));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/stats")
    public ResponseEntity<ApiResponse<ParentService.ChildStats>> getChildStats(
            @PathVariable Integer childId) {
        try {
            ParentService.ChildStats stats = parentService.getChildStats(childId);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/credentials")
    public ResponseEntity<ApiResponse<ParentService.ChildCredentials>> getChildCredentials(
            @PathVariable Integer childId) {
        try {
            ParentService.ChildCredentials creds = parentService.getChildCredentials(childId);
            return ResponseEntity.ok(ApiResponse.success(creds));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/prescriptions")
    public ResponseEntity<ApiResponse<List<Prescription>>> getPrescriptions(
            @PathVariable Integer childId) {
        try {
            List<Prescription> prescriptions = parentService.getChildPrescriptions(childId);
            return ResponseEntity.ok(ApiResponse.success(prescriptions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/sessions")
    public ResponseEntity<ApiResponse<List<ParentSessionDto>>> getUpcomingSessions(
            @PathVariable Integer childId) {
        try {
            List<ParentSessionDto> sessions = parentService.getUpcomingSessions(childId);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/progress")
    public ResponseEntity<ApiResponse<List<Assignment>>> getProgress(@PathVariable Integer childId) {
        try {
            List<Assignment> progress = parentService.getChildProgress(childId);
            return ResponseEntity.ok(ApiResponse.success(progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/activity")
    public ResponseEntity<ApiResponse<ChildActivityDto>> getChildActivity(@PathVariable Integer childId) {
        try {
            ChildActivityDto activity = parentService.getChildActivity(childId);
            return ResponseEntity.ok(ApiResponse.success(activity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/reports")
    public ResponseEntity<ApiResponse<List<DoctorReportDto>>> getDoctorReports(@PathVariable Integer childId) {
        try {
            List<DoctorReportDto> reports = parentService.getDoctorReports(childId);
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/child/{childId}/report/{feedbackId}/seen")
    public ResponseEntity<ApiResponse<String>> markReportSeen(
            @PathVariable Integer childId,
            @PathVariable Integer feedbackId) {
        try {
            parentService.markReportAsSeen(feedbackId, childId);
            return ResponseEntity.ok(ApiResponse.success("Report marked as seen", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/performance")
    public ResponseEntity<ApiResponse<ChildPerformanceDto>> getChildPerformance(@PathVariable Integer childId) {
        try {
            ChildPerformanceDto performance = parentService.getChildPerformance(childId);
            return ResponseEntity.ok(ApiResponse.success(performance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}/rewards")
    public ResponseEntity<ApiResponse<List<ParentRewardDto>>> getRewards(@PathVariable Integer childId) {
        try {
            List<ParentRewardDto> rewards = parentService.getChildRewards(childId);
            return ResponseEntity.ok(ApiResponse.success(rewards));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<String>> submitFeedback(
            @RequestParam Integer parentId,
            @RequestBody FeedbackRequest request) {
        try {
            parentService.submitFeedback(request, parentId);
            return ResponseEntity.ok(ApiResponse.success("Feedback submitted to admin", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
