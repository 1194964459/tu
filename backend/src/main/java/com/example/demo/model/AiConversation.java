package com.example.demo.model;

import java.time.LocalDateTime;

public class AiConversation {
    private Long id;
    private Long userId;
    private String title;
    private String status;
    private String requirementsJson;
    private String tags;
    private Integer completeness;
    private Boolean needsMoreInfo;
    private String nextQuestion;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRequirementsJson() { return requirementsJson; }
    public void setRequirementsJson(String requirementsJson) { this.requirementsJson = requirementsJson; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Integer getCompleteness() { return completeness; }
    public void setCompleteness(Integer completeness) { this.completeness = completeness; }
    public Boolean getNeedsMoreInfo() { return needsMoreInfo; }
    public void setNeedsMoreInfo(Boolean needsMoreInfo) { this.needsMoreInfo = needsMoreInfo; }
    public String getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(String nextQuestion) { this.nextQuestion = nextQuestion; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
