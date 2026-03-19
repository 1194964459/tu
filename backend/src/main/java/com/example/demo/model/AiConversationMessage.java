package com.example.demo.model;

import java.time.LocalDateTime;

public class AiConversationMessage {
    private Long id;
    private Long conversationId;
    private String role;
    private String content;
    private String requirementsJson;
    private String tags;
    private Boolean needsMoreInfo;
    private String nextQuestion;
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getRequirementsJson() { return requirementsJson; }
    public void setRequirementsJson(String requirementsJson) { this.requirementsJson = requirementsJson; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Boolean getNeedsMoreInfo() { return needsMoreInfo; }
    public void setNeedsMoreInfo(Boolean needsMoreInfo) { this.needsMoreInfo = needsMoreInfo; }
    public String getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(String nextQuestion) { this.nextQuestion = nextQuestion; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
