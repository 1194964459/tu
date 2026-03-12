package com.example.demo.model;

import java.time.LocalDateTime;

public class TrialFeedback {
    private Long id;
    private Long trialId;
    private Long userId;
    private Integer rating;
    private String feedback;
    private String issues;
    private String purchaseIntent;
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTrialId() { return trialId; }
    public void setTrialId(Long trialId) { this.trialId = trialId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getIssues() { return issues; }
    public void setIssues(String issues) { this.issues = issues; }
    public String getPurchaseIntent() { return purchaseIntent; }
    public void setPurchaseIntent(String purchaseIntent) { this.purchaseIntent = purchaseIntent; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
