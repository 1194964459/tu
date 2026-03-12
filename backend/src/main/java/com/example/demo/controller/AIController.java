package com.example.demo.controller;

import com.example.demo.model.ChatRequest;
import com.example.demo.model.ChatResponse;
import com.example.demo.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * AI 对话
     */
    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody ChatRequest request) {
        ChatResponse response = aiService.chat(request);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", response);
        
        return result;
    }

    /**
     * 方案推荐
     */
    @PostMapping("/recommend")
    public Map<String, Object> recommend(@RequestBody Map<String, String> requirements) {
        Map<String, Object> result = aiService.recommend(requirements);
        
        return result;
    }
}
