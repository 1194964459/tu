package com.example.demo.controller;

import com.example.demo.mapper.ProductMapper;
import com.example.demo.mapper.SolutionMapper;
import com.example.demo.mapper.TrialFeedbackMapper;
import com.example.demo.mapper.TrialMapper;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.Product;
import com.example.demo.model.Solution;
import com.example.demo.model.Trial;
import com.example.demo.model.TrialFeedback;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private TrialMapper trialMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SolutionMapper solutionMapper;

    @Autowired
    private TrialFeedbackMapper trialFeedbackMapper;

    @GetMapping("/trial-requests")
    public Map<String, Object> listTrialRequests() {
        List<Map<String, Object>> rows = trialMapper.findAllForAdmin();
        Map<String, Object> result = new HashMap<>();
        result.put("data", rows);
        result.put("total", rows.size());
        return result;
    }

    @GetMapping("/trial-requests/{trialId}")
    public Map<String, Object> trialRequestDetail(@PathVariable Long trialId) {
        Trial trial = trialMapper.findById(trialId);

        User user = null;
        Product product = null;
        Solution solution = null;
        TrialFeedback feedback = null;

        if (trial != null) {
            if (trial.getUserId() != null) {
                user = userMapper.findById(trial.getUserId());
            }
            if (trial.getProductId() != null) {
                product = productMapper.findById(trial.getProductId());
            }
            if (trial.getSolutionId() != null) {
                solution = solutionMapper.findById(trial.getSolutionId());
            }
            feedback = trialFeedbackMapper.findByTrialId(trialId);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("trial", trial);
        data.put("user", user);
        data.put("product", product);
        data.put("solution", solution);
        data.put("feedback", feedback);

        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        return result;
    }
}
