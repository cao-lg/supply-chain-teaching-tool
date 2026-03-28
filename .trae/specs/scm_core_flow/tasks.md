# 供应链管理教学工具 - 核心业务流程修复实现计划

## [x] Task 1: 数据模型扩展 (已完成)
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在store.js中增加库存流水数据实体 inventoryTransactions
  - 增加质量检验数据实体 qualityInspections
  - 增加财务记录数据实体 financialRecords
  - 更新loadSampleData函数，初始化新数据结构
- **Acceptance Criteria Addressed**: FR-5, FR-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 新增数据结构可以正常保存和读取
  - `human-judgment` TR-1.2: 示例数据加载后新字段正常显示

## Task 2: 采购入库功能实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在采购订单列表增加"入库"按钮
  - 实现采购入库模态框，支持部分入库
  - 入库成功后更新物料库存
  - 生成库存流水记录
  - 支持选择是否需要IQC检验
- **Acceptance Criteria Addressed**: FR-1, FR-5
- **Test Requirements**:
  - `programmatic` TR-2.1: 入库后库存数据正确增加
  - `programmatic` TR-2.2: 生成正确的库存流水记录
  - `human-judgment` TR-2.3: 入库流程操作顺畅

## Task 3: 生产入库功能实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在生产工单列表增加"完工入库"按钮
  - 实现生产完工入库模态框
  - 入库时自动按BOM扣减物料库存
  - 入库成功后更新产品库存
  - 生成库存流水记录（入库和出库）
- **Acceptance Criteria Addressed**: FR-2, FR-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 入库后产品库存正确增加
  - `programmatic` TR-3.2: 物料库存按BOM正确扣减
  - `programmatic` TR-3.3: 生成正确的库存流水记录

## Task 4: 销售库存扣减功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在订单确认时检查产品库存
  - 库存充足时自动扣减产品库存
  - 库存不足时提示用户并阻止确认
  - 生成库存流水记录
- **Acceptance Criteria Addressed**: FR-3, FR-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 订单确认后库存正确扣减
  - `programmatic` TR-4.2: 库存不足时正确提示
  - `programmatic` TR-4.3: 生成正确的库存流水记录

## Task 5: 质量检验模块实现
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**:
  - 创建质量检验模块页面
  - 实现IQC来料检验功能
  - 实现OQC成品检验功能
  - 检验记录管理（新增、编辑、查询）
  - 检验不合格品处理（退货、让步、报废）
- **Acceptance Criteria Addressed**: FR-4
- **Test Requirements**:
  - `human-judgment` TR-5.1: 检验流程操作顺畅
  - `programmatic` TR-5.2: 检验结果正确影响入库流程
  - `human-judgment` TR-5.3: 检验记录显示完整

## Task 6: 库存流水查询功能
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3, Task 4
- **Description**:
  - 在库存管理页面增加"库存流水"选项卡
  - 实现流水记录查询（按时间、物料类型筛选）
  - 流水记录展示（类型、业务来源、数量、日期）
- **Acceptance Criteria Addressed**: FR-5
- **Test Requirements**:
  - `human-judgment` TR-6.1: 流水记录显示完整
  - `human-judgment` TR-6.2: 筛选功能正常

## Task 7: 基础财务管理功能
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 4
- **Description**:
  - 创建财务管理模块页面
  - 应收账款管理（查看、核销）
  - 应付账款管理（查看、付款）
  - 简单成本核算（按BOM计算产品成本）
  - 订单确认时生成应收款记录
  - 采购入库时生成应付款记录
- **Acceptance Criteria Addressed**: FR-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 应收/应付记录正确生成
  - `human-judgment` TR-7.2: 财务管理页面显示正常

## Task 8: 现有功能回归测试
- **Priority**: P0
- **Depends On**: Task 2, Task 3, Task 4, Task 5, Task 6, Task 7
- **Description**:
  - 确保现有功能不受影响
  - 测试手机适配是否正常
  - 测试所有模块数据保存和加载
- **Acceptance Criteria Addressed**: All
- **Test Requirements**:
  - `human-judgment` TR-8.1: 所有现有功能正常运行
  - `human-judgment` TR-8.2: 手机适配正常显示
  - `programmatic` TR-8.3: 数据保存加载正常

## Task 9: GitHub同步
- **Priority**: P0
- **Depends On**: Task 8
- **Description**:
  - 提交所有代码更改
  - 推送到GitHub仓库
  - 验证同步结果
- **Acceptance Criteria Addressed**: All
- **Test Requirements**:
  - `programmatic` TR-9.1: 代码成功推送到GitHub
  - `human-judgment` TR-9.2: GitHub仓库代码完整