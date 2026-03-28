# 供应链管理教学工具 - 产品需求文档

## Overview
- **Summary**: 一个基于Web的供应链管理教学工具，提供从基础资料管理到生产计划、采购计划和库存管理的完整流程模拟，帮助学生理解供应链管理核心概念。
- **Purpose**: 为高校供应链管理课程提供一个直观、实用的实践教学平台，让学生通过动手操作加深对供应链管理理论的理解。
- **Target Users**: 高校供应链管理专业学生、教师、培训人员。

## Goals
- 实现完整的供应链核心流程模拟
- 提供简洁直观的用户界面
- 支持数据可视化展示
- 使用极简技术栈，易于维护和部署

## Non-Goals (Out of Scope)
- 实时多用户协作
- 复杂的用户权限管理
- 与外部ERP系统集成
- 企业级安全性和性能优化

## Background & Context
- 供应链管理是现代企业运营的核心环节
- 传统教学方式多为理论讲解，缺乏实践操作
- 需要一个轻量级、易部署的教学工具
- 基于静态网站技术，使用CDN资源，确保快速访问

## Functional Requirements
- **FR-1**: 基础资料管理
  - 产品信息管理（添加、编辑、删除）
  - 物料信息管理
  - 供应商信息管理
  - BOM（物料清单）管理
  - 数据本地存储

- **FR-2**: 生产计划
  - 基于订单生成生产计划
  - 考虑资源约束
  - 生产排产可视化展示

- **FR-3**: 采购计划
  - 基于BOM和生产计划计算采购需求
  - 采购订单管理

- **FR-4**: 库存管理
  - 库存查询
  - 库存预警

- **FR-5**: 数据管理
  - 数据导入/导出
  - 示例数据加载

## Non-Functional Requirements
- **NFR-1**: 响应式设计
  - 适配桌面端和平板
  - 在不同屏幕尺寸下正常显示

- **NFR-2**: 性能
  - 页面加载时间 < 3秒
  - 数据操作响应时间 < 1秒

- **NFR-3**: 可用性
  - 界面简洁直观
  - 操作流程清晰

## Constraints
- **Technical**: 
  - 静态网站部署
  - LocalStorage数据存储
  - 技术栈：Vue.js 3 + Bootstrap 5 + ECharts 5
  - 多文件模块化结构
  - 部署到极狐GitLab Pages

- **Business**: 
  - 免费使用
  - 适合教学场景

- **Dependencies**: 
  - CDN资源（Vue.js、Bootstrap、ECharts）

## Assumptions
- 用户具备基本的供应链管理知识
- 用户使用现代浏览器
- 数据量适中，适合LocalStorage存储
- 不需要实时数据同步

## Acceptance Criteria

### AC-1: 基础资料管理
- **Given**: 用户访问基础资料管理页面
- **When**: 用户添加、编辑、删除产品、物料、供应商、BOM信息
- **Then**: 系统正确保存数据到LocalStorage，并在界面上展示更新后的信息
- **Verification**: `programmatic`

### AC-2: 生产计划生成
- **Given**: 系统已有基础资料和订单数据
- **When**: 用户点击生成生产计划按钮
- **Then**: 系统生成合理的生产计划并展示
- **Verification**: `programmatic`

### AC-3: 采购计划生成
- **Given**: 系统已有生产计划和BOM数据
- **When**: 用户点击生成采购计划按钮
- **Then**: 系统计算采购需求并展示采购订单
- **Verification**: `programmatic`

### AC-4: 库存管理
- **Given**: 用户访问库存管理页面
- **When**: 用户查看库存状态
- **Then**: 系统展示库存数据和预警信息
- **Verification**: `programmatic`

### AC-5: 数据管理
- **Given**: 用户访问数据管理功能
- **When**: 用户保存、加载、导入/导出数据
- **Then**: 系统正确处理数据操作
- **Verification**: `programmatic`

### AC-6: 响应式设计
- **Given**: 用户在不同设备上访问系统
- **When**: 用户调整浏览器窗口大小
- **Then**: 系统界面自适应调整
- **Verification**: `human-judgment`

## Open Questions
- 无
