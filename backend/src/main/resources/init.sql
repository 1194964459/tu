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
    popularity INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'DRAFT/ACTIVE/OFFLINE',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trial_id) REFERENCES trials(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
