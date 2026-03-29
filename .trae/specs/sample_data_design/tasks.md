# 严密示例数据设计任务列表

## Task 1: 设计数据结构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 定义设备类型与产品的对应关系
  - 定义工人类型与设备类型的对应关系
  - 设计BOM增强结构（包含生产步骤）
- **Test Requirements**:
  - `human-judgment` TR-1.1: 数据结构逻辑合理

## Task 2: 更新store.js示例数据
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 添加设备类型定义
  - 添加工人类型定义
  - 添加完整的设备数据（关联设备类型）
  - 添加完整的工人数据（关联工人类型）
  - 更新产品数据（添加所需设备类型）
  - 更新BOM数据（添加生产步骤）
- **Test Requirements**:
  - `programmatic` TR-2.1: 设备数据包含类型信息
  - `programmatic` TR-2.2: 工人数据包含类型信息
  - `programmatic` TR-2.3: 产品数据包含所需设备类型

## Task 3: 更新生产能力模块
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 更新设备管理界面显示设备类型
  - 更新工人管理界面显示工人类型
  - 添加设备类型筛选功能
  - 添加工人类型筛选功能
- **Test Requirements**:
  - `human-judgment` TR-3.1: 设备类型正确显示
  - `human-judgment` TR-3.2: 工人类型正确显示

## Task 4: 更新生产计划模块
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 生成计划时检查设备类型支持
  - 显示可用设备列表
  - 显示可用工人列表
- **Test Requirements**:
  - `human-judgment` TR-4.1: 设备选择正确
  - `human-judgment` TR-4.2: 工人分配正确

## Task 5: 测试验证
- **Priority**: P0
- **Depends On**: Task 2, Task 3, Task 4
- **Description**:
  - 使用Playwright测试所有功能
  - 验证数据关联正确性
- **Test Requirements**:
  - `programmatic` TR-5.1: 所有功能正常工作