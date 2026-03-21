package com.cognicare.controller;

import com.cognicare.dto.ApiResponse;
import com.cognicare.dto.ChildPerformanceDto;
import com.cognicare.dto.LeaderboardEntryDto;
import com.cognicare.service.PublicStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final PublicStatsService publicStatsService;

    public PublicController(PublicStatsService publicStatsService) {
        this.publicStatsService = publicStatsService;
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getLeaderboard() {
        try {
            return ResponseEntity.ok(ApiResponse.success(publicStatsService.getLeaderboard()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/child-performance/{childId}")
    public ResponseEntity<ApiResponse<ChildPerformanceDto>> getChildPerformance(@PathVariable Integer childId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(publicStatsService.getChildPerformance(childId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
