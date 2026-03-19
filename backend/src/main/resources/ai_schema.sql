-- AI 对话会话与消息（用于管理后台回溯“需求结构化/追问/标签/完整性检查”等过程）

CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200),
    status VARCHAR(20) DEFAULT 'OPEN' COMMENT 'OPEN/CLOSED',
    requirements_json TEXT,
    tags TEXT,
    completeness INT DEFAULT 0 COMMENT '0-100',
    needs_more_info TINYINT DEFAULT 0,
    next_question TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_conversation_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'user/assistant',
    content TEXT,
    requirements_json TEXT,
    tags TEXT,
    needs_more_info TINYINT DEFAULT 0,
    next_question TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ai_conversations'
      AND INDEX_NAME = 'idx_ai_conv_user'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ai_conversation_messages'
      AND INDEX_NAME = 'idx_ai_msg_conv'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_ai_msg_conv ON ai_conversation_messages(conversation_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
