package com.example.demo.service;

import com.example.demo.mapper.*;
import com.example.demo.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TrialService {

    @Autowired
    private TrialMapper trialMapper;

    @Autowired
    private TrialFeedbackMapper feedbackMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SolutionMapper solutionMapper;

    @Transactional
    public Trial createTrial(Long userId, Long productId, Long solutionId, String testData) {
        String envUrl = generateEnvironmentUrl(productId);
        LocalDateTime now = LocalDateTime.now();
        
        Trial trial = new Trial();
        trial.setUserId(userId);
        trial.setProductId(productId);
        trial.setSolutionId(solutionId);
        trial.setEnvironmentUrl(envUrl);
        trial.setTestData(testData);
        trial.setStatus("RUNNING");
        trial.setStartTime(now);
        trial.setEndTime(now.plusDays(7));
        
        trialMapper.insert(trial);
        
        Product product = productMapper.findById(productId);
        if (product != null) {
            productMapper.updatePopularity(productId, product.getPopularity() + 1);
        }
        
        return trial;
    }

    public Map<String, Object> getTrialDetail(Long trialId) {
        Trial trial = trialMapper.findById(trialId);
        if (trial == null) return Collections.emptyMap();
        
        Map<String, Object> detail = new HashMap<>();
        detail.put("trial", trial);
        
        if (trial.getProductId() != null) {
            detail.put("product", productMapper.findById(trial.getProductId()));
        }
        if (trial.getSolutionId() != null) {
            detail.put("solution", solutionMapper.findById(trial.getSolutionId()));
        }
        detail.put("feedback", feedbackMapper.findByTrialId(trialId));
        
        return detail;
    }

    public List<Trial> getUserTrials(Long userId) {
        return trialMapper.findByUserId(userId);
    }

    @Transactional
    public TrialFeedback submitFeedback(Long trialId, Long userId, Integer rating, 
                                        String feedback, String issues, String purchaseIntent) {
        if (rating == null || rating < 1 || rating > 10) {
            throw new IllegalArgumentException("rating must be between 1 and 10");
        }
        TrialFeedback fb = new TrialFeedback();
        fb.setTrialId(trialId);
        fb.setUserId(userId);
        fb.setRating(rating);
        fb.setFeedback(feedback);
        fb.setIssues(issues);
        fb.setPurchaseIntent(purchaseIntent);
        fb.setStatus("SUBMITTED");
        fb.setProviderReply(null);

        TrialFeedback existing = feedbackMapper.findByTrialId(trialId);
        if (existing == null) {
            feedbackMapper.insert(fb);
        } else {
            feedbackMapper.updateByTrialId(fb);
            fb = feedbackMapper.findByTrialId(trialId);
        }

        trialMapper.updateStatus(trialId, "COMPLETED");

        return fb;
    }

    public Trial extendTrial(Long trialId, Integer days) {
        Trial trial = trialMapper.findById(trialId);
        if (trial != null) {
            trial.setEndTime(trial.getEndTime().plusDays(days));
            return trial;
        }
        return null;
    }

    private String generateEnvironmentUrl(Long productId) {
        return String.format("https://demo.example.com/environment/%d/%s", 
                productId, UUID.randomUUID().toString().substring(0, 8));
    }

    public Map<String, Object> getTrialStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Trial> running = trialMapper.findByStatus("RUNNING");
        List<Trial> completed = trialMapper.findByStatus("COMPLETED");
        
        stats.put("runningCount", running.size());
        stats.put("completedCount", completed.size());
        stats.put("totalCount", running.size() + completed.size());
        
        List<TrialFeedback> recentFeedback = feedbackMapper.findRecent(10);
        if (!recentFeedback.isEmpty()) {
            double avgRating = recentFeedback.stream()
                    .mapToInt(TrialFeedback::getRating)
                    .average().orElse(0.0);
            stats.put("averageRating", Math.round(avgRating * 10) / 10.0);
        }
        
        return stats;
    }
}
