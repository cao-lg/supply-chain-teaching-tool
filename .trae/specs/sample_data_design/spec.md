# 严密示例数据设计规格文档

## Why
当前示例数据存在以下问题：
1. 缺少生产能力数据（设备、工人）
2. 数据之间缺乏逻辑关联
3. 设备类型、工人类型与产品没有对应关系
4. 无法体现真实的生产约束和资源依赖

## What Changes
- 设计完整的数据关联模型
- 添加设备类型与产品的对应关系
- 添加工人类型与设备类型的对应关系
- 创建严密的示例数据集

## Impact
- Affected specs: scm_core_flow, data_manager_fix
- Affected code: js/store.js

## 数据结构设计

### 1. 产品与生产资源的关系模型

```
产品 ──需要──> 设备类型 ──需要──> 工人类型
  │
  └──包含──> BOM ──包含──> 物料
```

### 2. 设备类型定义

| 设备类型 | 可生产产品 | 需要工人类型 | 日产能范围 |
|----------|------------|--------------|------------|
| 电子组装线 | 智能手表、无线耳机 | 电子装配工 | 50-100个/天 |
| SMT贴片机 | 智能手表、无线耳机 | SMT操作员 | 200-500片/天 |
| 注塑机 | 塑料外壳 | 注塑工 | 500-1000个/天 |
| 测试设备 | 智能手表、无线耳机 | 质检员 | 100-200个/天 |
| 包装线 | 所有产品 | 包装工 | 200-400个/天 |

### 3. 工人类型定义

| 工人类型 | 可操作设备 | 技能要求 | 效率范围 |
|----------|------------|----------|----------|
| 电子装配工 | 电子组装线 | 焊接、组装 | 80%-120% |
| SMT操作员 | SMT贴片机 | 编程、调试 | 85%-115% |
| 注塑工 | 注塑机 | 模具操作 | 90%-110% |
| 质检员 | 测试设备 | 检验、测试 | 95%-105% |
| 包装工 | 包装线 | 包装、贴标 | 85%-115% |

### 4. 完整数据关联示例

#### 产品定义
```javascript
{
  id: 'p1',
  code: 'P001',
  name: '智能手表',
  description: '高端智能手表',
  unit: '个',
  requiredEquipmentTypes: ['电子组装线', '测试设备', '包装线'],
  requiredWorkerTypes: ['电子装配工', '质检员', '包装工'],
  productionTime: 0.5 // 每个产品需要0.5个工时
}
```

#### 设备定义
```javascript
{
  id: 'eq1',
  code: 'EQ001',
  name: '1号电子组装线',
  type: '电子组装线',
  capacityPerDay: 80,
  status: '正常',
  supportedProducts: ['p1', 'p2'] // 支持生产的产品ID
}
```

#### 工人定义
```javascript
{
  id: 'w1',
  code: 'W001',
  name: '张明',
  type: '电子装配工',
  efficiency: 95,
  status: '在职',
  certifiedEquipment: ['eq1', 'eq2'] // 可操作的设备ID
}
```

#### BOM定义（增强版）
```javascript
{
  id: 'b1',
  productId: 'p1',
  items: [
    { materialId: 'm1', quantity: 1, unit: '个' },
    { materialId: 'm2', quantity: 1, unit: '个' },
    { materialId: 'm3', quantity: 2, unit: '个' }
  ],
  productionSteps: [
    { step: 1, name: 'SMT贴片', equipmentType: 'SMT贴片机', workerType: 'SMT操作员', timeMinutes: 10 },
    { step: 2, name: '组装', equipmentType: '电子组装线', workerType: '电子装配工', timeMinutes: 15 },
    { step: 3, name: '测试', equipmentType: '测试设备', workerType: '质检员', timeMinutes: 5 },
    { step: 4, name: '包装', equipmentType: '包装线', workerType: '包装工', timeMinutes: 3 }
  ]
}
```

### 5. 数据完整性约束

1. **设备-产品约束**：设备类型必须支持要生产的产品
2. **工人-设备约束**：工人类型必须匹配设备类型
3. **产能约束**：生产计划不能超过设备日产能
4. **物料约束**：生产必须有足够的物料库存
5. **工时约束**：生产时间不能超过工人可用工时

## ADDED Requirements

### Requirement: 设备类型与产品关联
设备类型应明确支持生产的产品类型。

#### Scenario: 设备生产产品
- **WHEN** 创建生产计划
- **THEN** 系统应检查设备是否支持该产品

### Requirement: 工人类型与设备关联
工人类型应明确可操作的设备类型。

#### Scenario: 工人操作设备
- **WHEN** 分配工人到生产任务
- **THEN** 系统应检查工人是否具备操作资格

### Requirement: 生产步骤定义
BOM应包含完整的生产步骤信息。

#### Scenario: 生产排程
- **WHEN** 生成生产计划
- **THEN** 系统应根据BOM生产步骤分配设备和工人