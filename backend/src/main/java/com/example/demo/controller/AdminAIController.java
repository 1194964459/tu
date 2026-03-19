package com.example.demo.controller;

import com.example.demo.mapper.AiConversationMapper;
import com.example.demo.mapper.AiConversationMessageMapper;
import com.example.demo.model.AiConversation;
import com.example.demo.model.AiConversationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@CrossOrigin(origins = "*")
public class AdminAIController {

    @Autowired
    private AiConversationMapper aiConversationMapper;

    @Autowired
    private AiConversationMessageMapper aiConversationMessageMapper;

    @GetMapping("/conversations")
    public Map<String, Object> conversations(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {

        int safeLimit = Math.max(1, Math.min(200, limit == null ? 50 : limit));

        List<AiConversation> list = userId == null
                ? aiConversationMapper.findRecent(safeLimit)
                : aiConversationMapper.findRecentByUser(userId, safeLimit);

        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", list.size());
        return result;
    }

    @GetMapping("/conversations/{id}")
    public Map<String, Object> conversationDetail(@PathVariable Long id) {
        AiConversation conv = aiConversationMapper.findById(id);
        List<AiConversationMessage> messages = aiConversationMessageMapper.findByConversationId(id);

        Map<String, Object> data = new HashMap<>();
        data.put("conversation", conv);
        data.put("messages", messages);

        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        return result;
    }
}

