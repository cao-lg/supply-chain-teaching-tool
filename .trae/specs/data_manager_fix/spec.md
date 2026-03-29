# 数据管理功能修复规格文档

## Why
数据管理模块存在以下问题：
1. 清空数据时确认对话框可能不工作
2. 示例数据不完整，缺少采购订单、生产计划等
3. 数据统计显示与实际数据不一致

## What Changes
- 修复清空数据的确认对话框
- 完善示例数据集，包含完整的业务流程数据
- 确保数据统计实时更新

## Impact
- Affected specs: scm_core_flow
- Affected code: js/store.js, js/modules/dataManager.js

## ADDED Requirements

### Requirement: 清空数据确认
清空数据操作必须有用户确认步骤。

#### Scenario: 清空数据确认
- **WHEN** 用户点击"清空数据"按钮
- **THEN** 系统应弹出确认对话框
- **AND** 只有用户点击"确定"后才执行清空

### Requirement: 完整示例数据
示例数据应包含完整的业务流程数据。

#### Scenario: 加载示例数据
- **WHEN** 用户点击"加载示例数据"
- **THEN** 系统应加载包含以下完整数据：
  - 2个产品
  - 3个物料
  - 2个供应商
  - 3个客户
  - 1个BOM
  - 2个采购订单（一个待入库）
  - 2个生产计划（一个进行中）
  - 3个销售订单
  - 库存数据
  - 库存流水记录
  - 质量检验记录
  - 财务记录

### Requirement: 数据统计实时更新
数据统计应反映当前实际数据。

#### Scenario: 数据统计显示
- **WHEN** 用户查看数据管理页面
- **THEN** 数据统计应显示当前localStorage中的实际数据数量