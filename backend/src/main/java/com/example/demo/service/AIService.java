package com.example.demo.service;

import com.example.demo.mapper.*;
import com.example.demo.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.regex.*;

@Service
public class AIService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SolutionMapper solutionMapper;

    @Autowired
    private AiConversationMapper aiConversationMapper;

    @Autowired
    private AiConversationMessageMapper aiConversationMessageMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse chat(ChatRequest request) {
        ChatResponse response = new ChatResponse();

        Long userId = request.getUserId() == null ? 1L : request.getUserId();
        AiConversation conv = ensureConversation(userId, request.getConversationId());

        Map<String, String> requirements = parseRequirementsJson(conv.getRequirementsJson());
        merge(requirements, parseRequirements(request));
        finalizeTransportModes(requirements, request.getMessage());
        response.setRequirements(requirements);

        String message = safe(request.getMessage());
        boolean forceFinish = containsFinishIntent(message);
        boolean wantsProductList = containsAny(message, "有哪些产品", "产品有哪些", "看看有哪些产品", "给我看看有哪些产品", "有什么产品");
        List<String> missing = computeMissing(requirements);
        boolean needsMoreInfo = !forceFinish && !missing.isEmpty();
        int completeness = computeCompleteness(requirements);
        List<String> tags = buildTags(requirements);

        boolean multiModal = "是".equals(requirements.get("multiModal"));
        List<Product> recommendedProducts;
        List<Solution> recommendedSolutions;
        if (!needsMoreInfo) {
            recommendedProducts = multiModal ? recommendMultiModalProducts(4)
                    : recommendProducts(requirements, 3, true);
            recommendedSolutions = recommendSolutions(requirements, 2);
        } else {
            recommendedProducts = (wantsProductList && (multiModal || containsAny(message, "多式联运")))
                    ? recommendMultiModalProducts(4)
                    : Collections.emptyList();
            recommendedSolutions = Collections.emptyList();
        }

        response.setNeedsMoreInfo(needsMoreInfo);
        response.setNextQuestion(needsMoreInfo ? generateNextQuestion(missing) : null);
        response.setRecommendedProducts(recommendedProducts);
        response.setRecommendedSolutions(recommendedSolutions);
        response.setMissing(missing);
        response.setCompleteness(completeness);
        response.setTags(tags);

        if (!needsMoreInfo) {
            response.setBundles(buildBundles(recommendedSolutions, requirements));
        } else {
            response.setBundles(Collections.emptyList());
        }

        String reply = generateReply(requirements, missing, recommendedSolutions, recommendedProducts, needsMoreInfo,
                wantsProductList);
        response.setReply(reply);
        response.setConversationId(conv.getId());

        saveConversationTurn(conv, userId, request.getMessage(), reply, requirements, tags, needsMoreInfo,
                response.getNextQuestion(), completeness);

        return response;
    }

    private AiConversation ensureConversation(Long userId, Long conversationId) {
        if (conversationId != null) {
            AiConversation existing = aiConversationMapper.findById(conversationId);
            if (existing != null && Objects.equals(existing.getUserId(), userId)) {
                return existing;
            }
        }

        AiConversation created = new AiConversation();
        created.setUserId(userId);
        created.setStatus("OPEN");
        created.setTitle("AI 对话");
        created.setRequirementsJson("{}");
        created.setTags("");
        created.setCompleteness(0);
        created.setNeedsMoreInfo(true);
        created.setNextQuestion(null);
        aiConversationMapper.insert(created);
        return created;
    }

    private void saveConversationTurn(
            AiConversation conv,
            Long userId,
            String userMessage,
            String assistantReply,
            Map<String, String> requirements,
            List<String> tags,
            boolean needsMoreInfo,
            String nextQuestion,
            int completeness) {

        if (conv == null || conv.getId() == null)
            return;

        String requirementsJson = toJson(requirements);
        String tagsStr = String.join(",", tags == null ? List.of() : tags);

        if (userMessage != null && !userMessage.isBlank()) {
            AiConversationMessage um = new AiConversationMessage();
            um.setConversationId(conv.getId());
            um.setRole("user");
            um.setContent(userMessage);
            um.setRequirementsJson(requirementsJson);
            um.setTags(tagsStr);
            um.setNeedsMoreInfo(needsMoreInfo);
            um.setNextQuestion(nextQuestion);
            aiConversationMessageMapper.insert(um);
        }

        if (assistantReply != null && !assistantReply.isBlank()) {
            AiConversationMessage am = new AiConversationMessage();
            am.setConversationId(conv.getId());
            am.setRole("assistant");
            am.setContent(assistantReply);
            am.setRequirementsJson(requirementsJson);
            am.setTags(tagsStr);
            am.setNeedsMoreInfo(needsMoreInfo);
            am.setNextQuestion(nextQuestion);
            aiConversationMessageMapper.insert(am);
        }

        conv.setRequirementsJson(requirementsJson);
        conv.setTags(tagsStr);
        conv.setCompleteness(completeness);
        conv.setNeedsMoreInfo(needsMoreInfo);
        conv.setNextQuestion(nextQuestion);

        String title = buildTitle(requirements);
        if (title != null && !title.isBlank())
            conv.setTitle(title);
        aiConversationMapper.update(conv);
    }

    private String buildTitle(Map<String, String> requirements) {
        if (requirements == null || requirements.isEmpty())
            return "AI 对话";
        String industry = safe(requirements.get("industry"));
        String scenario = safe(requirements.get("scenario"));
        String capability = safe(requirements.get("capability"));
        List<String> parts = new ArrayList<>();
        if (!industry.isBlank())
            parts.add(industry);
        if (!scenario.isBlank())
            parts.add(scenario);
        if (parts.isEmpty() && !capability.isBlank())
            parts.add(capability);
        if (parts.isEmpty())
            return "AI 对话";
        return String.join("-", parts).substring(0, Math.min(String.join("-", parts).length(), 80));
    }

    private int computeCompleteness(Map<String, String> requirements) {
        int score = 0;
        if (requirements != null) {
            if (requirements.containsKey("industry"))
                score += 25;
            if (requirements.containsKey("scenario"))
                score += 25;
            if (requirements.containsKey("capability"))
                score += 25;
            if (requirements.containsKey("budget"))
                score += 25;
        }
        return Math.min(100, Math.max(0, score));
    }

    private List<String> buildTags(Map<String, String> requirements) {
        LinkedHashSet<String> tags = new LinkedHashSet<>();
        if (requirements == null)
            return List.of();

        String industry = safe(requirements.get("industry"));
        String scenario = safe(requirements.get("scenario"));
        String budget = safe(requirements.get("budget"));
        String version = safe(requirements.get("version"));
        String scale = safe(requirements.get("scale"));
        String needCase = safe(requirements.get("needCase"));
        String transportModes = safe(requirements.get("transportModes"));
        String multiModal = safe(requirements.get("multiModal"));

        if (!industry.isBlank())
            tags.add("行业:" + industry);
        if (!scenario.isBlank())
            tags.add("场景:" + scenario);
        if (!budget.isBlank())
            tags.add("预算:" + budget);
        if (!version.isBlank())
            tags.add("版本:" + version);
        if (!scale.isBlank())
            tags.add("规模:" + scale);
        if (!needCase.isBlank())
            tags.add("需要案例");
        if (!transportModes.isBlank())
            tags.add("运输方式:" + transportModes);
        if ("是".equals(multiModal))
            tags.add("多式联运");

        String capability = safe(requirements.get("capability"));
        if (!capability.isBlank()) {
            for (String part : capability.split("[,，/\\s]+")) {
                String t = part == null ? "" : part.trim();
                if (!t.isBlank())
                    tags.add("功能:" + t);
                if (tags.size() >= 12)
                    break;
            }
        }

        return tags.stream().toList();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj == null ? Map.of() : obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Map<String, String> parseRequirementsJson(String raw) {
        try {
            if (raw == null || raw.isBlank())
                return new HashMap<>();
            return objectMapper.readValue(raw, new TypeReference<Map<String, String>>() {
            });
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, String> parseRequirements(ChatRequest request) {
        Map<String, String> requirements = new HashMap<>();

        List<String> texts = new ArrayList<>();
        if (request.getHistory() != null) {
            for (ChatRequest.Conversation c : request.getHistory()) {
                if (c == null)
                    continue;
                if ("user".equalsIgnoreCase(c.getRole()) && c.getContent() != null) {
                    texts.add(c.getContent());
                }
            }
        }
        if (request.getMessage() != null) {
            texts.add(request.getMessage());
        }

        for (String text : texts) {
            merge(requirements, parseFromText(text));
        }

        return requirements;
    }

    private Map<String, String> parseFromText(String text) {
        Map<String, String> requirements = new HashMap<>();
        if (text == null || text.isBlank())
            return requirements;

        String message = text;

        String[] industries = { "物流", "电商", "制造", "零售", "金融", "医疗", "跨境", "冷链" };
        for (String industry : industries) {
            if (message.contains(industry)) {
                requirements.put("industry", industry);
                break;
            }
        }

        if (containsAny(message, "仓储", "仓库", "入库", "出库", "拣选", "库存")) {
            requirements.put("scenario", "仓储管理");
        } else if (containsAny(message, "运输", "配送", "干线", "同城", "车队", "运费", "对账")) {
            requirements.put("scenario", "运输管理");
        } else if (containsAny(message, "订单", "履约", "全渠道", "分单")) {
            requirements.put("scenario", "订单管理");
        } else if (containsAny(message, "供应链", "协同", "采购", "供应商")) {
            requirements.put("scenario", "供应链协同");
        } else if (containsAny(message, "看板", "可视化", "控制塔", "指标", "KPI")) {
            requirements.put("scenario", "运营可视化");
        }

        String capability = extractCapability(message);
        if (capability != null && !capability.isBlank()) {
            requirements.put("capability", capability);
        }

        String version = extractVersion(message);
        if (version != null) {
            requirements.put("version", version);
        }

        String budget = extractBudget(message);
        if (budget != null) {
            requirements.put("budget", budget);
        }

        if (containsAny(message, "大型", "集团", "多分公司", "多仓")) {
            requirements.put("scale", "大型");
        } else if (containsAny(message, "中小", "小型", "初创")) {
            requirements.put("scale", "中小");
        }

        if (containsAny(message, "要案例", "案例", "参考客户", "标杆")) {
            requirements.put("needCase", "是");
        }

        if (containsAny(message, "陆路", "公路", "汽运", "卡车", "货车", "干线")) {
            requirements.put("modeRoad", "是");
        }
        if (containsAny(message, "海运", "海船", "船期", "订舱", "港口")) {
            requirements.put("modeSea", "是");
        }
        if (containsAny(message, "航空", "空运", "航班", "机场")) {
            requirements.put("modeAir", "是");
        }
        if (containsAny(message, "水运", "内河", "江运", "河运", "港航")) {
            requirements.put("modeWater", "是");
        }
        if (containsAny(message, "多式联运")) {
            requirements.put("multiModal", "是");
        }

        return requirements;
    }

    private void merge(Map<String, String> base, Map<String, String> delta) {
        for (Map.Entry<String, String> e : delta.entrySet()) {
            if (e.getValue() == null || e.getValue().isBlank())
                continue;
            base.put(e.getKey(), e.getValue());
        }
    }

    private boolean containsFinishIntent(String text) {
        if (text == null)
            return false;
        return containsAny(text, "结束", "就这样", "直接推荐", "给方案", "推荐一下", "先这样");
    }

    private List<String> computeMissing(Map<String, String> requirements) {
        List<String> missing = new ArrayList<>();
        if (!requirements.containsKey("industry"))
            missing.add("industry");
        if (!requirements.containsKey("scenario"))
            missing.add("scenario");
        if (!requirements.containsKey("capability"))
            missing.add("capability");
        if (!requirements.containsKey("budget"))
            missing.add("budget");
        return missing;
    }

    private String generateNextQuestion(List<String> missing) {
        if (missing.contains("industry"))
            return "您所在行业是？例如：物流/电商/制造";
        if (missing.contains("scenario"))
            return "您主要想解决哪个场景？例如：仓储/运输/订单/供应链协同";
        if (missing.contains("capability"))
            return "最关注的功能点有哪些？例如：可视化看板、路线优化、库存预测、异常预警";
        if (missing.contains("budget"))
            return "预算范围大概多少？例如：50万以内 / 50-150万";
        return null;
    }

    private String generateReply(
            Map<String, String> requirements,
            List<String> missing,
            List<Solution> recommendedSolutions,
            List<Product> recommendedProducts,
            boolean needsMoreInfo,
            boolean wantsProductList) {
        if (requirements.isEmpty()) {
            return "您好！我是您的 AI 顾问。\n\n为了推荐更贴合的产品/方案，我需要了解：\n1) 行业\n2) 场景\n3) 关注功能点\n4) 预算范围\n\n您可以这样说：我是物流企业，需要仓储管理，关注库存预测，预算 50 万以内。";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("收到，我先把需求要点梳理一下：\n");
        sb.append("- 行业：").append(requirements.getOrDefault("industry", "未填写")).append("\n");
        sb.append("- 场景：").append(requirements.getOrDefault("scenario", "未填写")).append("\n");
        sb.append("- 功能点：").append(requirements.getOrDefault("capability", "未填写")).append("\n");
        sb.append("- 预算：").append(requirements.getOrDefault("budget", "未填写")).append("\n");
        if (requirements.containsKey("version")) {
            sb.append("- 版本偏好：").append(requirements.get("version")).append("\n");
        }
        if ("是".equals(requirements.get("multiModal"))) {
            String modes = requirements.getOrDefault("transportModes", "");
            if (!modes.isBlank())
                sb.append("- 运输方式：").append(modes).append("\n");
        }

        if (needsMoreInfo) {
            if (wantsProductList && ("是".equals(requirements.get("multiModal"))
                    || containsAny(requirements.getOrDefault("scenario", ""), "运输"))) {
                sb.append("\n关于多式联运协同，常见可组合的运输产品包括：陆路运输、海运运输、航空运输、水运运输。您可以考虑结合使用。\n");
            }
            sb.append("\n为了更精准推荐，我还需要补充：");
            List<String> need = new ArrayList<>();
            if (missing.contains("industry"))
                need.add("行业");
            if (missing.contains("scenario"))
                need.add("场景");
            if (missing.contains("capability"))
                need.add("功能点");
            if (missing.contains("budget"))
                need.add("预算");
            sb.append(String.join(" / ", need));
            sb.append("。");
            return sb.toString();
        }

        if ("是".equals(requirements.get("multiModal"))) {
            sb.append("\n针对多式联运协同，通常可以组合使用：陆路运输、海运运输、航空运输、水运运输。\n");
        }
        sb.append("\n基于以上信息，我给您准备了 1-2 套可对比的方案，并配套推荐了可直接试用的产品。\n");
        if (recommendedSolutions == null || recommendedSolutions.isEmpty()) {
            sb.append("（当前暂无完全匹配的方案模板，我先按需求为您匹配最接近的产品组合。）\n");
        }
        sb.append("您可以选择其中一套方案，然后从方案下的产品里点击“立即试用”。");
        return sb.toString();
    }

    private List<Product> recommendProducts(Map<String, String> requirements, int limit,
            boolean includePopularFallback) {
        LinkedHashMap<Long, Product> result = new LinkedHashMap<>();

        String scenario = requirements.getOrDefault("scenario", "");
        String capability = requirements.getOrDefault("capability", "");

        List<String> keywords = new ArrayList<>();
        if (!scenario.isBlank())
            keywords.add(scenario);
        if (!capability.isBlank()) {
            for (String part : capability.split("[,，/\\s]+")) {
                if (!part.isBlank())
                    keywords.add(part.trim());
            }
        }

        for (String kw : keywords) {
            for (Product p : productMapper.search(kw)) {
                result.putIfAbsent(p.getId(), p);
                if (result.size() >= limit)
                    break;
            }
            if (result.size() >= limit)
                break;
        }

        if (includePopularFallback && result.size() < limit) {
            for (Product p : productMapper.findPopular(Math.max(limit, 6))) {
                result.putIfAbsent(p.getId(), p);
                if (result.size() >= limit)
                    break;
            }
        }

        return result.values().stream().limit(limit).toList();
    }

    private List<Solution> recommendSolutions(Map<String, String> requirements, int limit) {
        List<Solution> candidates;
        String industry = requirements.get("industry");
        if (industry != null && !industry.isBlank()) {
            candidates = solutionMapper.findByIndustry(industry);
            if (candidates == null || candidates.isEmpty()) {
                candidates = solutionMapper.findAll();
            }
        } else {
            candidates = solutionMapper.findAll();
        }

        String scenario = requirements.getOrDefault("scenario", "");
        String capability = requirements.getOrDefault("capability", "");

        candidates = candidates.stream()
                .sorted((a, b) -> Integer.compare(scoreSolution(b, requirements, scenario, capability),
                        scoreSolution(a, requirements, scenario, capability)))
                .toList();

        if (limit <= 0)
            return candidates.stream().limit(0).toList();
        return candidates.stream().limit(limit).toList();
    }

    private int scoreSolution(Solution s, Map<String, String> requirements, String scenario, String capability) {
        int score = 0;
        if (s == null)
            return score;
        String hay = String.join(" ", safe(s.getName()), safe(s.getDescription()), safe(s.getScenarios()),
                safe(s.getArchitecture()));
        if (!scenario.isBlank() && hay.contains(scenario))
            score += 5;
        if ("是".equals(requirements.get("multiModal")) && hay.contains("多式联运"))
            score += 10;
        if (!capability.isBlank()) {
            for (String part : capability.split("[,，/\\s]+")) {
                if (!part.isBlank() && hay.contains(part.trim()))
                    score += 1;
            }
        }
        return score;
    }

    private List<RecommendationBundle> buildBundles(List<Solution> solutions, Map<String, String> requirements) {
        if (solutions == null || solutions.isEmpty())
            return Collections.emptyList();

        List<RecommendationBundle> bundles = new ArrayList<>();
        for (Solution s : solutions) {
            RecommendationBundle b = new RecommendationBundle();
            b.setSolution(s);

            List<Product> products = new ArrayList<>();
            if (s.getProductIds() != null && !s.getProductIds().isBlank()) {
                for (String idStr : s.getProductIds().split(",")) {
                    String trimmed = idStr.trim();
                    if (trimmed.isBlank())
                        continue;
                    try {
                        Product p = productMapper.findById(Long.valueOf(trimmed));
                        if (p != null)
                            products.add(p);
                    } catch (Exception ignored) {
                    }
                }
            }
            if (products.isEmpty()) {
                if ("是".equals(requirements.get("multiModal")) && safe(s.getName()).contains("多式联运")) {
                    products = recommendMultiModalProducts(4);
                } else {
                    products = recommendProducts(requirements, 3, true);
                }
            }
            b.setProducts(products);

            Map<String, String> highlights = new LinkedHashMap<>();
            highlights.put("适用行业", safe(requirements.getOrDefault("industry", safe(s.getTargetIndustry()))));
            highlights.put("适用场景", safe(requirements.getOrDefault("scenario", safe(s.getScenarios()))));
            b.setHighlights(highlights);

            bundles.add(b);
        }
        return bundles;
    }

    private void finalizeTransportModes(Map<String, String> requirements, String message) {
        LinkedHashSet<String> modes = new LinkedHashSet<>();
        if ("是".equals(requirements.get("modeRoad")))
            modes.add("陆路");
        if ("是".equals(requirements.get("modeSea")))
            modes.add("海运");
        if ("是".equals(requirements.get("modeAir")))
            modes.add("航空");
        if ("是".equals(requirements.get("modeWater")))
            modes.add("水运");

        if (containsAny(message, "多式联运")) {
            requirements.put("multiModal", "是");
        }
        if (modes.size() >= 2) {
            requirements.put("multiModal", "是");
        }
        if (!modes.isEmpty()) {
            requirements.put("transportModes", String.join("、", modes));
        }
    }

    private List<Product> recommendMultiModalProducts(int limit) {
        LinkedHashMap<Long, Product> result = new LinkedHashMap<>();
        for (String kw : List.of("陆路运输", "海运运输", "航空运输", "水运运输", "多式联运")) {
            for (Product p : productMapper.search(kw)) {
                result.putIfAbsent(p.getId(), p);
            }
        }
        return result.values().stream().limit(limit).toList();
    }

    private String extractBudget(String message) {
        Pattern range = Pattern.compile("(\\d+)\\s*[-~到]\\s*(\\d+)\\s*[万wW]");
        Matcher m1 = range.matcher(message);
        if (m1.find()) {
            return m1.group(1) + "-" + m1.group(2) + "万";
        }

        Pattern single = Pattern.compile("(\\d+)\\s*[万wW]");
        Matcher m2 = single.matcher(message);
        if (m2.find()) {
            return m2.group(1) + "万";
        }

        Pattern under = Pattern.compile("(\\d+)\\s*[万wW]\\s*以内");
        Matcher m3 = under.matcher(message);
        if (m3.find()) {
            return m3.group(1) + "万以内";
        }

        return null;
    }

    private String extractVersion(String message) {
        Pattern p1 = Pattern.compile("v\\s*\\d+(?:\\.\\d+)?", Pattern.CASE_INSENSITIVE);
        Matcher m = p1.matcher(message);
        if (m.find())
            return m.group(0).replace(" ", "").toLowerCase();
        if (containsAny(message, "标准版"))
            return "标准版";
        if (containsAny(message, "专业版"))
            return "专业版";
        if (containsAny(message, "企业版"))
            return "企业版";
        return null;
    }

    private String extractCapability(String message) {
        List<String> hits = new ArrayList<>();
        Map<String, String[]> dict = new LinkedHashMap<>();
        dict.put("运营可视化看板", new String[] { "看板", "可视化", "控制塔", "大屏" });
        dict.put("异常预警与处置", new String[] { "告警", "预警", "异常处理", "工单" });
        dict.put("路线优化与调度", new String[] { "路线优化", "路径优化", "调度", "派单", "装载" });
        dict.put("库存预测与补货", new String[] { "库存预测", "预测", "补货" });
        dict.put("订单协同与履约", new String[] { "全渠道", "分单", "履约", "OMS" });
        dict.put("运费结算对账", new String[] { "运费", "对账", "结算" });
        dict.put("冷链温控追溯", new String[] { "冷链", "温控", "温湿度", "追溯" });

        for (Map.Entry<String, String[]> e : dict.entrySet()) {
            if (containsAny(message, e.getValue()))
                hits.add(e.getKey());
        }
        if (hits.isEmpty())
            return null;
        return String.join("，", hits.stream().distinct().limit(3).toList());
    }

    private boolean containsAny(String text, String... keywords) {
        if (text == null)
            return false;
        for (String kw : keywords) {
            if (kw != null && !kw.isBlank() && text.contains(kw))
                return true;
        }
        return false;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    public Map<String, Object> recommend(Map<String, String> requirements) {
        Map<String, Object> result = new HashMap<>();
        result.put("products", recommendProducts(requirements, 5, true));
        result.put("solutions", recommendSolutions(requirements, 3));
        return result;
    }
}
