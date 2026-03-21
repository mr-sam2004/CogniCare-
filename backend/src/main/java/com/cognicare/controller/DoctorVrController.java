package com.cognicare.controller;

import com.cognicare.dto.ApiResponse;
import com.cognicare.dto.DoctorVrVideoDto;
import com.cognicare.dto.VrVideoRequest;
import com.cognicare.service.DoctorVrVideoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/vr")
public class DoctorVrController {

    private final DoctorVrVideoService vrVideoService;

    public DoctorVrController(DoctorVrVideoService vrVideoService) {
        this.vrVideoService = vrVideoService;
    }

    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<List<DoctorVrVideoDto>>> getVideos(@RequestParam Integer doctorId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(vrVideoService.getDoctorVideos(doctorId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<String>> assignVideo(
            @RequestParam Integer doctorId,
            @Valid @RequestBody VrVideoRequest request) {
        try {
            vrVideoService.assignVideo(doctorId, request);
            return ResponseEntity.ok(ApiResponse.success("Video assigned successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/video/{assignmentId}")
    public ResponseEntity<ApiResponse<String>> deleteVideo(
            @PathVariable Integer assignmentId,
            @RequestParam Integer doctorId) {
        try {
            vrVideoService.deleteVideo(doctorId, assignmentId);
            return ResponseEntity.ok(ApiResponse.success("Video deleted", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
