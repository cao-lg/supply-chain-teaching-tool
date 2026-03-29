# 供应链管理系统全面用户测试任务列表

## Task 1: 准备测试环境
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 确保开发服务器运行在8081端口
  - 清空现有数据
  - 加载完整示例数据
- **Test Requirements**:
  - `programmatic` TR-1.1: 服务器正常运行
  - `programmatic` TR-1.2: 示例数据加载成功

## Task 2: 基础资料管理测试
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 测试产品管理功能（查看列表、添加产品）
  - 测试物料管理功能
  - 测试供应商管理功能
  - 测试客户管理功能
  - 测试BOM管理功能
- **Test Requirements**:
  - `human-judgment` TR-2.1: 产品列表正确显示
  - `human-judgment` TR-2.2: 物料列表正确显示
  - `human-judgment` TR-2.3: 供应商列表正确显示
  - `human-judgment` TR-2.4: 客户列表正确显示
  - `human-judgment` TR-2.5: BOM列表正确显示

## Task 3: 采购入库流程测试
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 查看采购需求列表
  - 创建采购订单
  - 执行采购入库
  - 验证物料库存增加
  - 验证库存流水记录
- **Test Requirements**:
  - `programmatic` TR-3.1: 采购订单创建成功
  - `programmatic` TR-3.2: 入库后库存正确增加
  - `programmatic` TR-3.3: 库存流水正确生成

## Task 4: 生产入库流程测试
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 查看生产计划列表
  - 执行生产完工入库
  - 验证产品库存增加
  - 验证物料库存扣减（按BOM）
  - 验证库存流水记录
- **Test Requirements**:
  - `programmatic` TR-4.1: 完工入库成功
  - `programmatic` TR-4.2: 产品库存正确增加
  - `programmatic` TR-4.3: 物料库存正确扣减

## Task 5: 销售订单库存扣减测试
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 创建销售订单
  - 确认订单时验证库存检查
  - 验证库存自动扣减
  - 验证库存流水记录
- **Test Requirements**:
  - `programmatic` TR-5.1: 订单确认成功
  - `programmatic` TR-5.2: 产品库存正确扣减

## Task 6: 质量检验功能测试
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 查看IQC来料检验列表
  - 执行检验操作
  - 验证检验记录生成
  - 查看OQC成品检验
- **Test Requirements**:
  - `human-judgment` TR-6.1: IQC检验页面正常
  - `human-judgment` TR-6.2: 检验记录正确保存

## Task 7: 库存流水查询测试
- **Priority**: P1
- **Depends On**: Task 3, Task 4, Task 5
- **Description**:
  - 查看库存流水列表
  - 测试按类型筛选
  - 测试按日期筛选
  - 验证流水记录完整性
- **Test Requirements**:
  - `human-judgment` TR-7.1: 流水列表正确显示
  - `human-judgment` TR-7.2: 筛选功能正常

## Task 8: 财务管理功能测试
- **Priority**: P1
- **Depends On**: Task 3, Task 5
- **Description**:
  - 查看应收账款列表
  - 查看应付账款列表
  - 测试成本核算功能
  - 查看财务报表
- **Test Requirements**:
  - `human-judgment` TR-8.1: 应收账款正确显示
  - `human-judgment` TR-8.2: 应付账款正确显示
  - `human-judgment` TR-8.3: 成本核算正确计算

## Task 9: 数据分析功能测试
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 查看供应链绩效
  - 查看成本分析
  - 查看风险评估
- **Test Requirements**:
  - `human-judgment` TR-9.1: 绩效指标正确显示
  - `human-judgment` TR-9.2: 图表正确渲染

## Task 10: 手机适配测试
- **Priority**: P1
- **Depends On**: All other tasks
- **Description**:
  - 测试手机视图下的页面布局
  - 测试导航菜单折叠
  - 测试表格水平滚动
- **Test Requirements**:
  - `human-judgment` TR-10.1: 手机布局正常
  - `human-judgment` TR-10.2: 导航菜单正常折叠