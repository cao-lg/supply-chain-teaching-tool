# 导航菜单显示修复规格文档

## Why
当前系统中新增了质量检验和财务管理模块，但index.html中没有正确注册和对应，导致导航菜单只显示`{{item}}`，无法正常渲染。

## What Changes
- 在index.html中正确注册质量检验模块组件
- 在index.html中正确注册财务管理模块组件
- 修正导航项与页面组件的对应关系

## Impact
- Affected specs: scm_core_flow
- Affected code: index.html

## ADDED Requirements
### Requirement: 导航菜单正常显示
导航菜单应该正确显示所有13个导航项，并正确跳转到对应页面。

#### Scenario: 导航菜单显示
- **WHEN** 用户打开系统首页
- **THEN** 导航菜单正确显示所有13个菜单项，不显示{{item}}占位符

#### Scenario: 导航切换
- **WHEN** 用户点击"质量检验"菜单
- **THEN** 正确显示质量检验管理页面
- **WHEN** 用户点击"财务管理"菜单
- **THEN** 正确显示财务管理页面

## MODIFIED Requirements
### Requirement: 页面组件对应关系
index.html中的v-show条件与navItems数组索引必须一一对应。

当前navItems数组：
```javascript
const navItems = ['首页', '基础资料', '生产计划', '采购计划', '库存管理', '生产能力', '需求预测', '物流配送', '客户服务', '质量检验', '数据分析', '财务管理', '数据管理']
```

正确对应关系：
- 0: 首页
- 1: 基础资料 → basic-data-module
- 2: 生产计划 → production-plan-module
- 3: 采购计划 → purchase-plan-module
- 4: 库存管理 → inventory-module
- 5: 生产能力 → production-capacity-module
- 6: 需求预测 → demand-forecast-module
- 7: 物流配送 → logistics-module
- 8: 客户服务 → customer-service-module
- 9: 质量检验 → quality-control-module
- 10: 数据分析 → data-analysis-module
- 11: 财务管理 → finance-module
- 12: 数据管理 → data-manager-module