package com.example.demo.model;

import java.util.List;
import java.util.Map;

public class ChatResponse {
    private Long conversationId;
    private String reply;
    private List<Product> recommendedProducts;
    private List<Solution> recommendedSolutions;
    private List<RecommendationBundle> bundles;
    private Map<String, String> requirements;
    private Boolean needsMoreInfo;
    private String nextQuestion;
    private List<String> tags;
    private List<String> missing;
    private Integer completeness;

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public List<Product> getRecommendedProducts() { return recommendedProducts; }
    public void setRecommendedProducts(List<Product> recommendedProducts) { this.recommendedProducts = recommendedProducts; }
    public List<Solution> getRecommendedSolutions() { return recommendedSolutions; }
    public void setRecommendedSolutions(List<Solution> recommendedSolutions) { this.recommendedSolutions = recommendedSolutions; }
    public List<RecommendationBundle> getBundles() { return bundles; }
    public void setBundles(List<RecommendationBundle> bundles) { this.bundles = bundles; }
    public Map<String, String> getRequirements() { return requirements; }
    public void setRequirements(Map<String, String> requirements) { this.requirements = requirements; }
    public Boolean getNeedsMoreInfo() { return needsMoreInfo; }
    public void setNeedsMoreInfo(Boolean needsMoreInfo) { this.needsMoreInfo = needsMoreInfo; }
    public String getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(String nextQuestion) { this.nextQuestion = nextQuestion; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public List<String> getMissing() { return missing; }
    public void setMissing(List<String> missing) { this.missing = missing; }
    public Integer getCompleteness() { return completeness; }
    public void setCompleteness(Integer completeness) { this.completeness = completeness; }
}
