package com.example.demo.model;

import java.util.List;

public class ChatResponse {
    private String reply;
    private List<Product> recommendedProducts;
    private List<Solution> recommendedSolutions;
    private Boolean needsMoreInfo;
    private String nextQuestion;

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public List<Product> getRecommendedProducts() { return recommendedProducts; }
    public void setRecommendedProducts(List<Product> recommendedProducts) { this.recommendedProducts = recommendedProducts; }
    public List<Solution> getRecommendedSolutions() { return recommendedSolutions; }
    public void setRecommendedSolutions(List<Solution> recommendedSolutions) { this.recommendedSolutions = recommendedSolutions; }
    public Boolean getNeedsMoreInfo() { return needsMoreInfo; }
    public void setNeedsMoreInfo(Boolean needsMoreInfo) { this.needsMoreInfo = needsMoreInfo; }
    public String getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(String nextQuestion) { this.nextQuestion = nextQuestion; }
}
