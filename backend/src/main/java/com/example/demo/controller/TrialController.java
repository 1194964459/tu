package com.example.demo.controller;

import com.example.demo.mapper.*;
import com.example.demo.model.*;
import com.example.demo.service.TrialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trials")
@CrossOrigin(origins = "*")
public class TrialController {

    @Autowired
    private TrialService trialService;

    @Autowired
    private TrialMapper trialMapper;

    /**
     * 创建试用 - v1.3 核心 API
     */
    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long productId = Long.valueOf(request.get("productId").toString());
        Long solutionId = request.containsKey("solutionId") 
                ? Long.valueOf(request.get("solutionId").toString()) 
                : null;
        String testData = (String) request.getOrDefault("testData", "");
        
        Trial trial = trialService.createTrial(userId, productId, solutionId, testData);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", trial);
        result.put("message", "试用环境创建成功");
        
        return result;
    }

    /**
     * 获取试用详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable Long id) {
        Map<String, Object> detail = trialService.getTrialDetail(id);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", detail);
        
        return result;
    }

    /**
     * 获取用户试用列表
     */
    @GetMapping("/user/{userId}")
    public Map<String, Object> userTrials(@PathVariable Long userId) {
        List<Trial> trials = trialService.getUserTrials(userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", trials);
        result.put("total", trials.size());
        
        return result;
    }

    /**
     * 提交试用反馈 - v1.3 核心 API
     */
    @PostMapping("/{id}/feedback")
    public Map<String, Object> feedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        Long userId = Long.valueOf(request.get("userId").toString());
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String feedback = (String) request.getOrDefault("feedback", "");
        String issues = (String) request.getOrDefault("issues", "");
        String purchaseIntent = (String) request.getOrDefault("purchaseIntent", "NONE");
        
        TrialFeedback fb = trialService.submitFeedback(id, userId, rating, feedback, issues, purchaseIntent);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", fb);
        result.put("message", "感谢您的反馈！");
        
        return result;
    }

    /**
     * 延长试用时间
     */
    @PostMapping("/{id}/extend")
    public Map<String, Object> extend(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") Integer days) {
        
        Trial trial = trialService.extendTrial(id, days);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", trial);
        result.put("message", "试用时间已延长 " + days + " 天");
        
        return result;
    }

    /**
     * 获取试用统计
     */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> stats = trialService.getTrialStats();
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", stats);
        
        return result;
    }

    /**
     * 更新试用状态
     */
    @PutMapping("/{id}/status")
    public Map<String, Object> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        
        trialMapper.updateStatus(id, status);
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "状态已更新");
        
        return result;
    }
}
