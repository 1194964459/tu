-- 产品体验平台 v1.3 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS demo_platform DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE demo_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100),
    role VARCHAR(20) NOT NULL COMMENT 'BUYER/PROVIDER/ADMIN',
    industry VARCHAR(50),
    email VARCHAR(100),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    capability TEXT,
    scenarios TEXT,
    price DECIMAL(15, 2),
    version VARCHAR(50),
    provider_name VARCHAR(200),
    source_type VARCHAR(20) DEFAULT 'INTERNAL' COMMENT 'INTERNAL/PARTNER/BENCHMARK',
    source_name VARCHAR(200),
    source_url VARCHAR(500),
    external_demo_url VARCHAR(500),
    customers TEXT,
    cases TEXT,
    owner_user_id BIGINT,
    popularity INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'DRAFT/ACTIVE/OFFLINE',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'source_type');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN source_type VARCHAR(20) DEFAULT ''INTERNAL'' COMMENT ''INTERNAL/PARTNER/BENCHMARK''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'source_name');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN source_name VARCHAR(200)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'source_url');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN source_url VARCHAR(500)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'external_demo_url');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN external_demo_url VARCHAR(500)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'customers');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN customers TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'cases');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN cases TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'owner_user_id');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN owner_user_id BIGINT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 方案表
CREATE TABLE IF NOT EXISTS solutions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    target_industry VARCHAR(50),
    scenarios TEXT,
    architecture TEXT,
    product_ids TEXT,
    estimated_days INT,
    price_range VARCHAR(100),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 试用记录表
CREATE TABLE IF NOT EXISTS trials (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT,
    solution_id BIGINT,
    environment_url VARCHAR(500),
    test_data TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/RUNNING/COMPLETED/EXPIRED',
    start_time DATETIME,
    end_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (solution_id) REFERENCES solutions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 试用反馈表
CREATE TABLE IF NOT EXISTS trial_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trial_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT COMMENT '1-5',
    feedback TEXT,
    issues TEXT,
    purchase_intent VARCHAR(20) COMMENT 'NONE/INTERESTED/PENDING/PURCHASED',
    status VARCHAR(30) DEFAULT 'SUBMITTED' COMMENT 'SUBMITTED/VIEWED/REPLIED/CLOSED',
    provider_reply TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trial_id) REFERENCES trials(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trial_feedback' AND COLUMN_NAME = 'status');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE trial_feedback ADD COLUMN status VARCHAR(30) DEFAULT ''SUBMITTED'' COMMENT ''SUBMITTED/VIEWED/REPLIED/CLOSED''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trial_feedback' AND COLUMN_NAME = 'provider_reply');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE trial_feedback ADD COLUMN provider_reply TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trial_feedback' AND COLUMN_NAME = 'update_time');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE trial_feedback ADD COLUMN update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 插入示例数据
INSERT INTO users (username, name, role, industry, email) VALUES
('buyer1', '张总', 'BUYER', '物流', 'zhang@example.com'),
('buyer2', '李总', 'BUYER', '电商', 'li@example.com'),
('provider1', '王经理', 'PROVIDER', 'IT', 'wang@example.com'),
('admin1', '系统管理员', 'ADMIN', '互联网', 'admin@example.com');

INSERT INTO products (name, category, description, capability, scenarios, price, version, provider_name, popularity) VALUES
('智能仓储管理系统', '仓储管理', '基于AI的智能仓储解决方案，实现货物自动化入库、存储、拣选和出库', 
 '自动化入库、智能拣选、库存预测、多仓协同', '电商仓储、制造业仓库、冷链仓储', 88.00, 'v3.0', '智仓科技', 95),

('物流运输管理平台', '运输管理', '覆盖运输全流程的数字化管理平台，支持多式联运', 
 '路线优化、车辆调度、实时追踪、运费结算', '干线运输、城市配送、冷链物流', 128.00, 'v2.5', '运力科技', 88),

('供应链协同平台', '供应链', '连接供应商、制造商、经销商的供应链协同平台', 
 '订单协同、采购管理、供应商评估、风险预警', '制造业供应链、零售供应链', 168.00, 'v1.8', '链云科技', 76),

('订单管理系统', '订单管理', '全渠道订单统一管理，支持订单全生命周期追踪', 
 '订单接收、智能分单、异常处理、数据分析', '电商订单、线下订单、O2O订单', 58.00, 'v4.0', '订单科技', 92),

('数据分析平台', '数据分析', '企业级数据分析和可视化平台', 
 '数据采集、BI分析、仪表盘、报表生成', '经营分析、风控分析、营销分析', 198.00, 'v2.0', '数智科技', 65),

('AI智能客服', '人工智能', '基于大模型的智能客服系统', '智能问答、意图识别、情绪分析、多轮对话', '客户服务、售后支持', 38.00, 'v1.5', 'AI科技', 80);

INSERT INTO products (name, category, description, capability, scenarios, price, version, provider_name, popularity) VALUES
('物流控制塔（Control Tower）', '运营可视化', '面向物流企业的全链路运营可视化与异常协同平台，统一订单、仓、运、配关键指标与告警处置', 
 '全局看板、异常预警、工单协同、KPI与SLA管理', '干线运输、城市配送、多仓协同、园区运营', 158.00, 'v1.2', '控塔科技', 97),

('智能路线规划与调度引擎', '智能调度', '结合实时路况与订单约束的智能调度能力，提升车辆装载率与准时率，支持多目标优化', 
 '路径优化、波次与车次计划、装载优化、时窗约束、动态重算', '同城配送、干线运输、冷链配送、甩挂运输', 128.00, 'v2.1', '智配引擎', 96),

('多式联运协同平台', '运输管理', '覆盖铁公水空多式联运业务协同的平台，支持计划编排、节点追踪与在途异常处置', 
 '运力协同、节点追踪、到发站管理、异常处理、对外协同接口', '跨境物流、多式联运、港口园区、干线网络', 168.00, 'v1.6', '联运云', 91),

('冷链温控监测与预警平台', '冷链物流', '通过物联网采集温湿度与轨迹数据，提供在途温控合规监测、预警与追溯能力', 
 '温湿度监控、电子围栏、异常告警、合规报表、追溯留痕', '医药冷链、生鲜冷链、冷库仓配一体', 98.00, 'v3.3', '冷链智控', 94),

('运费结算与对账系统', '财务结算', '面向承运商与货主的运费计费、对账与结算平台，减少人工核对，提升结算效率', 
 '计费规则引擎、对账单生成、异常差异处理、发票与付款管理', '三方物流、车队管理、货主对账、运力平台', 78.00, 'v2.0', '结算管家', 90),

('物流数据中台与指标体系', '数据平台', '统一接入WMS/TMS/OMS等多源数据，沉淀指标体系与主题模型，支撑推荐、运营与试用报告生成', 
 '数据接入与治理、主数据管理、指标口径管理、数据服务API', '运营分析、转化漏斗、需求画像、数据资产化', 188.00, 'v1.0', '数仓工坊', 93);

-- 外部产品 Mock（生态产品：伙伴/对标），用于展示“外部体验”入口与审核流程
INSERT INTO products (
  name, category, description, capability, scenarios, price, version, provider_name,
  source_type, source_name, source_url, external_demo_url, customers, cases, owner_user_id,
  popularity, status, create_time, update_time
)
SELECT
  'CargoWise One（Mock）', '国际货代/关务', '对标产品：国际货代与通关一体化平台（示例数据）',
  '关务申报、舱单管理、费用结算、在途可视化', '跨境物流、国际货代、海运空运', 299.00, 'SaaS', '生态伙伴A',
  'BENCHMARK', 'WiseTech Global', 'https://example.com/wise-tech', 'https://demo.example.com/external/cargowise',
  '某跨境电商,某货代集团', '跨境业务一体化上线（Mock）', 3,
  98, 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'CargoWise One（Mock）');

INSERT INTO products (
  name, category, description, capability, scenarios, price, version, provider_name,
  source_type, source_name, source_url, external_demo_url, customers, cases, owner_user_id,
  popularity, status, create_time, update_time
)
SELECT
  'Blue Yonder WMS（Mock）', '仓储管理', '对标产品：仓储管理系统（示例数据）',
  '波次拣选、库位优化、自动补货、设备对接', '电商仓储、制造仓库、冷链仓储', 260.00, 'Cloud', '生态伙伴B',
  'BENCHMARK', 'Blue Yonder', 'https://example.com/blue-yonder', 'https://demo.example.com/external/by-wms',
  '某头部零售,某3PL', '多仓统一WMS（Mock）', 3,
  89, 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Blue Yonder WMS（Mock）');

INSERT INTO products (
  name, category, description, capability, scenarios, price, version, provider_name,
  source_type, source_name, source_url, external_demo_url, customers, cases, owner_user_id,
  popularity, status, create_time, update_time
)
SELECT
  '伙伴TMS轻量版（Mock）', '运输管理', '生态伙伴提交：提供外部试用链接（方式A），等待管理员审核',
  '运单管理、调度派车、轨迹回传、对账结算', '同城配送、干线运输', 49.00, 'v0.9', '生态伙伴C',
  'PARTNER', '生态伙伴C', 'https://example.com/partner-c', 'https://demo.example.com/external/partner-tms-lite',
  '某区域快运', '区域快运TMS落地（Mock）', 3,
  10, 'DRAFT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '伙伴TMS轻量版（Mock）');

INSERT INTO solutions (name, description, target_industry, scenarios, architecture, estimated_days, price_range) VALUES
('智慧物流解决方案', '面向物流企业的端到端数字化方案', '物流', '仓储+运输+配送', '微服务架构', 90, '50-200万'),
('电商运营一体化方案', '电商全链路数字化解决方案', '电商', '订单+仓储+物流', '云原生架构', 60, '30-100万'),
('制造业数字化转型方案', '制造企业智能制造解决方案', '制造', '供应链+生产+仓储', '混合云架构', 120, '100-500万'),
('冷链物流全程监控方案', '冷链物流数字化监控方案', '物流', '仓储+运输+配送+温控', 'IoT+云平台', 75, '80-150万');

-- 插入试用记录示例
INSERT INTO trials (user_id, product_id, solution_id, environment_url, status, start_time, end_time) VALUES
(1, 1, 1, 'https://demo.example.com/env/1/abc123', 'RUNNING', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
(1, 2, 1, 'https://demo.example.com/env/2/def456', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 4, 2, 'https://demo.example.com/env/4/ghi789', 'RUNNING', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

-- 插入反馈示例
INSERT INTO trial_feedback (trial_id, user_id, rating, feedback, issues, purchase_intent) VALUES
(2, 1, 4, '系统功能齐全，性能稳定，界面友好', '部分报表导出较慢', 'INTERESTED');

-- 创建索引
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_trials_user ON trials(user_id);
CREATE INDEX idx_trials_product ON trials(product_id);
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_feedback_trial ON trial_feedback(trial_id);

SELECT '数据库初始化完成！' AS message;
