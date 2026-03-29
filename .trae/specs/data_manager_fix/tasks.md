# 数据管理功能修复任务列表

## Task 1: 修复清空数据确认对话框
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查handleClearData方法中的confirm对话框是否正常工作
  - 确保用户点击"取消"时不执行清空操作
- **Test Requirements**:
  - `human-judgment` TR-1.1: 点击清空数据后弹出确认框
  - `human-judgment` TR-1.2: 点击取消后数据不被清空

## Task 2: 完善示例数据
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在loadSampleData中添加完整的采购订单数据
  - 添加生产计划数据
  - 添加销售订单数据
  - 确保数据之间的关联关系正确
- **Test Requirements**:
  - `programmatic` TR-2.1: 示例数据包含采购订单
  - `programmatic` TR-2.2: 示例数据包含生产计划
  - `programmatic` TR-2.3: 示例数据包含销售订单

## Task 3: 修复数据统计显示
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 确保数据统计在加载示例数据后正确更新
  - 添加更多统计项（库存流水、质量检验、财务记录）
- **Test Requirements**:
  - `human-judgment` TR-3.1: 加载示例数据后统计正确显示
  - `human-judgment` TR-3.2: 所有数据类型都有统计

## Task 4: 测试验证
- **Priority**: P0
- **Depends On**: Task 1, Task 2, Task 3
- **Description**:
  - 使用Playwright测试所有修复功能
  - 验证数据流程完整性
- **Test Requirements**:
  - `programmatic` TR-4.1: 所有功能正常工作