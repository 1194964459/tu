package com.example.demo.service;

import com.example.demo.mapper.*;
import com.example.demo.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;

@Service
public class AIService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SolutionMapper solutionMapper;

    public ChatResponse chat(ChatRequest request) {
        ChatResponse response = new ChatResponse();
        String message = request.getMessage().toLowerCase();
        
        Map<String, String> requirements = parseRequirements(message);
        String reply = generateReply(message, requirements);
        response.setReply(reply);
        response.setNeedsMoreInfo(requirements.size() < 3);
        response.setNextQuestion(generateNextQuestion(requirements));
        response.setRecommendedProducts(recommendProducts(requirements));
        response.setRecommendedSolutions(recommendSolutions(requirements));
        
        return response;
    }

    private Map<String, String> parseRequirements(String message) {
        Map<String, String> requirements = new HashMap<>();
        
        String[] industries = {"物流", "电商", "制造", "零售", "金融", "医疗"};
        for (String industry : industries) {
            if (message.contains(industry)) {
                requirements.put("industry", industry);
                break;
            }
        }
        
        if (message.contains("仓储") || message.contains("仓库")) {
            requirements.put("scenario", "仓储管理");
        } else if (message.contains("运输") || message.contains("配送")) {
            requirements.put("scenario", "运输管理");
        } else if (message.contains("订单") || message.contains("订单管理")) {
            requirements.put("scenario", "订单管理");
        }
        
        Pattern budgetPattern = Pattern.compile("(\\d+)\\s*[万w]");
        Matcher matcher = budgetPattern.matcher(message);
        if (matcher.find()) {
            requirements.put("budget", matcher.group(1) + "万");
        }
        
        if (message.contains("大") || message.contains("大型") || message.contains("集团")) {
            requirements.put("scale", "大型");
        } else if (message.contains("小") || message.contains("小型") || message.contains("中小企业")) {
            requirements.put("scale", "小型");
        }
        
        return requirements;
    }

    private String generateReply(String message, Map<String, String> requirements) {
        if (requirements.isEmpty()) {
            return "您好！我是您的智能顾问。为了给您推荐最合适的产品和方案，请告诉我您的行业和需求，比如：\"我是物流企业，需要仓储管理解决方案\"";
        }
        
        StringBuilder reply = new StringBuilder("好的，我已经了解您的");
        if (requirements.containsKey("industry")) {
            reply.append(requirements.get("industry")).append("行业");
        }
        if (requirements.containsKey("scenario")) {
            reply.append("、").append(requirements.get("scenario")).append("场景");
        }
        reply.append("需求。");
        
        if (requirements.size() >= 2) {
            reply.append("根据您的描述，我为您推荐以下方案：");
        } else {
            reply.append("为了更精准地推荐，请告诉我您的预算规模和具体需求。");
        }
        
        return reply.toString();
    }

    private String generateNextQuestion(Map<String, String> requirements) {
        if (!requirements.containsKey("budget")) return "您的预算范围是多少？比如：50万以内";
        if (!requirements.containsKey("scale")) return "您的企业规模是怎样的？大型企业还是中小企业？";
        if (!requirements.containsKey("industry")) return "请告诉我您所在的行业";
        return null;
    }

    private List<Product> recommendProducts(Map<String, String> requirements) {
        String keyword = requirements.getOrDefault("scenario", "");
        List<Product> products = keyword.isEmpty() ? productMapper.findPopular(3) : productMapper.search(keyword);
        return products;
    }

    private List<Solution> recommendSolutions(Map<String, String> requirements) {
        String industry = requirements.get("industry");
        if (industry != null) return solutionMapper.findByIndustry(industry);
        return solutionMapper.findAll().stream().limit(3).toList();
    }

    public Map<String, Object> recommend(Map<String, String> requirements) {
        Map<String, Object> result = new HashMap<>();
        result.put("products", recommendProducts(requirements));
        result.put("solutions", recommendSolutions(requirements));
        return result;
    }
}
