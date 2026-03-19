package com.example.demo.model;

import java.util.List;

public class ChatRequest {
    private Long userId;
    private Long conversationId;
    private String message;
    private List<Conversation> history;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<Conversation> getHistory() { return history; }
    public void setHistory(List<Conversation> history) { this.history = history; }

    public static class Conversation {
        private String role;
        private String content;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
