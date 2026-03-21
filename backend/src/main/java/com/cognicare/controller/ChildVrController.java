package com.cognicare.controller;

import com.cognicare.dto.ApiResponse;
import com.cognicare.dto.ChildVrVideoDto;
import com.cognicare.service.ChildVrVideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/child/vr")
public class ChildVrController {

    private final ChildVrVideoService childVrVideoService;

    public ChildVrController(ChildVrVideoService childVrVideoService) {
        this.childVrVideoService = childVrVideoService;
    }

    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<List<ChildVrVideoDto>>> getVideos(@RequestParam Integer childId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(childVrVideoService.getChildVideos(childId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/video/{assignmentId}")
    public ResponseEntity<ApiResponse<String>> markAsWatched(
            @PathVariable Integer assignmentId,
            @RequestParam Integer childId) {
        try {
            childVrVideoService.markAsWatched(childId, assignmentId);
            return ResponseEntity.ok(ApiResponse.success("Video marked as watched", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
