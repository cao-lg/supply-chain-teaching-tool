# 生产计划总表与编辑功能任务列表

## Task 1: 添加生产计划总表标签页
- [x] **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在生产计划模块添加"生产计划总表"标签页
  - 显示所有生产计划的汇总列表
  - 包含计划编号、产品、数量、日期、工时、设备、状态等列
- **Test Requirements**:
  - `human-judgment` TR-1.1: 标签页正确显示 ✅
  - `human-judgment` TR-1.2: 列表数据正确 ✅

## Task 2: 添加手动创建生产计划功能
- [x] **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 添加"添加生产计划"按钮
  - 创建添加计划表单
  - 包含产品、数量、日期、设备、工人等字段
  - 自动计算预估资源消耗
- **Test Requirements**:
  - `human-judgment` TR-2.1: 表单正确显示 ✅
  - `programmatic` TR-2.2: 计划创建成功 ✅

## Task 3: 实现数量内联编辑
- [x] **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 数量列支持点击编辑
  - 编辑后实时更新影响分析
  - 保存修改到数据
- **Test Requirements**:
  - `human-judgment` TR-3.1: 内联编辑正常工作 ✅
  - `programmatic` TR-3.2: 数据正确保存 ✅

## Task 4: 添加影响分析面板
- [x] **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**:
  - 在表格下方添加影响分析面板
  - 显示总工时消耗
  - 显示设备产能消耗率
  - 显示物料消耗清单
  - 显示库存充足性检查
- **Test Requirements**:
  - `human-judgment` TR-4.1: 影响分析正确显示 ✅
  - `programmatic` TR-4.2: 计算结果正确 ✅

## Task 5: 测试验证
- [x] **Priority**: P0
- **Depends On**: Task 1, Task 2, Task 3, Task 4
- **Description**:
  - 使用Playwright测试所有功能
  - 验证数据计算正确性
- **Test Requirements**:
  - `programmatic` TR-5.1: 所有功能正常工作 ✅
