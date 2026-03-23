DELETE p
FROM products p
JOIN products p2 ON p2.name = REPLACE(p.name, '', '')
WHERE p.name LIKE '%';

UPDATE products p
LEFT JOIN products p2 ON p2.name = REPLACE(p.name, '', '')
SET p.name = REPLACE(p.name, '', '')
WHERE p.name LIKE '%'
  AND p2.id IS NULL;

INSERT INTO products (name, category, description, capability, scenarios, price, version, provider_name, source_type, source_name, popularity, status, create_time, update_time)
SELECT
  '陆路运输',
  '运输管理',
  '陆路运输协同产品，覆盖公路/汽运/干线运输的计划、调度与在途可视化',
  '运力协同、车辆调度、在途追踪、异常处理',
  '干线运输、多式联运、跨境物流',
  68.00,
  'v1.0',
  '联运示例团队',
  'INTERNAL',
  '联运示例',
  72,
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '陆路运输');

INSERT INTO products (name, category, description, capability, scenarios, price, version, provider_name, source_type, source_name, popularity, status, create_time, update_time)
SELECT
  '海运运输',
  '运输管理',
  '海运运输协同产品，覆盖订舱、船期节点、箱货跟踪与异常协同',
  '节点追踪、到发站管理、异常处理、对外协同接口',
  '海运、跨境物流、多式联运',
  88.00,
  'v1.0',
  '联运示例团队',
  'INTERNAL',
  '联运示例',
  74,
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '海运运输');

INSERT INTO products (name, category, description, capability, scenarios, price, version, provider_name, source_type, source_name, popularity, status, create_time, update_time)
SELECT
  '航空运输',
  '运输管理',
  '航空运输协同产品，覆盖航班节点追踪、时效承诺与异常预警',
  '节点追踪、时效承诺、异常预警、对外协同接口',
  '航空、跨境物流、多式联运',
  98.00,
  'v1.0',
  '联运示例团队',
  'INTERNAL',
  '联运示例',
  70,
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '航空运输');

INSERT INTO products (name, category, description, capability, scenarios, price, version, provider_name, source_type, source_name, popularity, status, create_time, update_time)
SELECT
  '水运运输',
  '运输管理',
  '水运运输协同产品，覆盖内河/港航节点追踪、在途异常与协同处置',
  '节点追踪、港航协同、异常处理、对外协同接口',
  '水运、跨境物流、多式联运',
  78.00,
  'v1.0',
  '联运示例团队',
  'INTERNAL',
  '联运示例',
  69,
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '水运运输');

INSERT INTO solutions (name, description, target_industry, scenarios, architecture, product_ids, estimated_days, price_range, create_time)
SELECT
  '多式联运协同方案',
  '覆盖铁公水空多种运输方式的计划编排、节点追踪、异常处置与对外协同，支持组合推荐与一键试用',
  '物流',
  '多式联运,跨境物流,干线运输',
  'SaaS+开放API',
  '',
  60,
  '80-200万',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM solutions WHERE name = '多式联运协同方案');
