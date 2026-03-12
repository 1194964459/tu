package com.example.demo.model;

import java.time.LocalDateTime;

public class Trial {
    private Long id;
    private Long userId;
    private Long productId;
    private Long solutionId;
    private String environmentUrl;
    private String testData;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getSolutionId() { return solutionId; }
    public void setSolutionId(Long solutionId) { this.solutionId = solutionId; }
    public String getEnvironmentUrl() { return environmentUrl; }
    public void setEnvironmentUrl(String environmentUrl) { this.environmentUrl = environmentUrl; }
    public String getTestData() { return testData; }
    public void setTestData(String testData) { this.testData = testData; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
