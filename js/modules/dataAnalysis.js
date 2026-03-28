/**
 * 数据分析模块
 * 包含供应链绩效、成本分析、风险评估、决策支持功能
 */

import { loadData, saveData } from '../store.js';

/**
 * 数据分析组件
 */
export default {
    name: 'DataAnalysisModule',
    template: `
        <div>
            <h2 class="mb-4">数据分析</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'performance' }" @click="activeTab = 'performance'">供应链绩效</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'cost' }" @click="activeTab = 'cost'">成本分析</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'risk' }" @click="activeTab = 'risk'">风险评估</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'decision' }" @click="activeTab = 'decision'">决策支持</a>
                </li>
            </ul>

            <!-- 供应链绩效 -->
            <div v-if="activeTab === 'performance'">
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">订单履约率</h6>
                                <p class="card-text fs-2 text-success">{{ performanceMetrics.orderFulfillment }}%</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">准时交付率</h6>
                                <p class="card-text fs-2 text-primary">{{ performanceMetrics.onTimeDelivery }}%</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">库存周转率</h6>
                                <p class="card-text fs-2 text-info">{{ performanceMetrics.inventoryTurnover }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">供应链总成本</h6>
                                <p class="card-text fs-2 text-warning">¥{{ formatNumber(performanceMetrics.totalCost) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">KPI趋势</h5>
                                <div id="kpiTrendChart" class="chart-container" style="height: 350px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">绩效雷达图</h5>
                                <div id="performanceRadarChart" class="chart-container" style="height: 350px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 成本分析 -->
            <div v-if="activeTab === 'cost'">
                <div class="row mb-4">
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">成本结构分布</h5>
                                <div id="costStructureChart" class="chart-container" style="height: 350px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">成本趋势</h5>
                                <div id="costTrendChart" class="chart-container" style="height: 350px;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">成本明细</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>成本项目</th>
                                        <th>本月成本</th>
                                        <th>上月成本</th>
                                        <th>变化</th>
                                        <th>占比</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in costDetails" :key="index">
                                        <td>{{ item.name }}</td>
                                        <td>¥{{ formatNumber(item.currentMonth) }}</td>
                                        <td>¥{{ formatNumber(item.lastMonth) }}</td>
                                        <td :class="item.change > 0 ? 'text-danger' : 'text-success'">
                                            {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                                        </td>
                                        <td>{{ item.percentage }}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 风险评估 -->
            <div v-if="activeTab === 'risk'">
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">总体风险等级</h6>
                                <p class="card-text fs-2" :class="getRiskLevelClass(riskAssessment.overallLevel)">
                                    {{ riskAssessment.overallLevel }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">高风险项数量</h6>
                                <p class="card-text fs-2 text-danger">{{ riskAssessment.highRiskCount }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">风险缓解率</h6>
                                <p class="card-text fs-2 text-success">{{ riskAssessment.mitigationRate }}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">风险矩阵</h5>
                        <div id="riskMatrixChart" class="chart-container" style="height: 400px;"></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">风险清单</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>风险类型</th>
                                        <th>风险描述</th>
                                        <th>影响程度</th>
                                        <th>发生概率</th>
                                        <th>风险等级</th>
                                        <th>应对措施</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(risk, index) in riskList" :key="index">
                                        <td>{{ risk.type }}</td>
                                        <td>{{ risk.description }}</td>
                                        <td>
                                            <span class="badge" :class="getImpactClass(risk.impact)">
                                                {{ risk.impact }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge" :class="getProbabilityClass(risk.probability)">
                                                {{ risk.probability }}%
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge" :class="getRiskLevelClass(risk.level)">
                                                {{ risk.level }}
                                            </span>
                                        </td>
                                        <td>{{ risk.mitigation }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 决策支持 -->
            <div v-if="activeTab === 'decision'">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">智能决策建议</h5>
                        <div class="list-group">
                            <div v-for="(suggestion, index) in decisionSuggestions" :key="index" class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">{{ suggestion.title }}</h6>
                                    <span class="badge" :class="getPriorityClass(suggestion.priority)">
                                        {{ suggestion.priority }}
                                    </span>
                                </div>
                                <p class="mb-1">{{ suggestion.description }}</p>
                                <small class="text-muted">{{ suggestion.impact }}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">库存优化建议</h5>
                                <div id="inventoryOptimizationChart" class="chart-container" style="height: 300px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">采购策略建议</h5>
                                <div id="procurementStrategyChart" class="chart-container" style="height: 300px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            activeTab: 'performance',
            data: loadData()
        };
    },
    computed: {
        /**
         * 绩效指标
         * @returns {Object} 绩效指标数据
         */
        performanceMetrics() {
            const orders = this.data.orders || [];
            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === '已完成').length;
            const onTimeOrders = orders.filter(o => {
                if (o.status !== '已完成') return false;
                const deliveryDate = new Date(o.deliveryDate);
                const actualDate = new Date();
                return actualDate <= deliveryDate;
            }).length;

            return {
                orderFulfillment: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
                onTimeDelivery: completedOrders > 0 ? Math.round((onTimeOrders / completedOrders) * 100) : 0,
                inventoryTurnover: 8.5, // 模拟数据
                totalCost: 1250000 // 模拟数据
            };
        },

        /**
         * 成本明细
         * @returns {Array} 成本明细列表
         */
        costDetails() {
            return [
                { name: '采购成本', currentMonth: 450000, lastMonth: 420000, change: 7.1, percentage: 36 },
                { name: '生产成本', currentMonth: 320000, lastMonth: 310000, change: 3.2, percentage: 25.6 },
                { name: '物流成本', currentMonth: 180000, lastMonth: 195000, change: -7.7, percentage: 14.4 },
                { name: '库存成本', currentMonth: 150000, lastMonth: 145000, change: 3.4, percentage: 12 },
                { name: '管理成本', currentMonth: 150000, lastMonth: 150000, change: 0, percentage: 12 }
            ];
        },

        /**
         * 风险评估
         * @returns {Object} 风险评估数据
         */
        riskAssessment() {
            return {
                overallLevel: '中',
                highRiskCount: 3,
                mitigationRate: 75
            };
        },

        /**
         * 风险清单
         * @returns {Array} 风险列表
         */
        riskList() {
            return [
                {
                    type: '供应商风险',
                    description: '主要供应商交货不稳定',
                    impact: '高',
                    probability: 30,
                    level: '高',
                    mitigation: '开发备用供应商，建立安全库存'
                },
                {
                    type: '需求风险',
                    description: '市场需求波动较大',
                    impact: '中',
                    probability: 50,
                    level: '中',
                    mitigation: '加强需求预测，灵活调整生产计划'
                },
                {
                    type: '库存风险',
                    description: '部分物料库存积压',
                    impact: '中',
                    probability: 40,
                    level: '中',
                    mitigation: '优化库存管理，加强物料周转'
                },
                {
                    type: '物流风险',
                    description: '运输成本上涨',
                    impact: '低',
                    probability: 70,
                    level: '中',
                    mitigation: '优化运输路线，谈判更优价格'
                },
                {
                    type: '质量风险',
                    description: '产品质量问题',
                    impact: '高',
                    probability: 15,
                    level: '中',
                    mitigation: '加强质量管控，完善检验流程'
                }
            ];
        },

        /**
         * 决策建议
         * @returns {Array} 决策建议列表
         */
        decisionSuggestions() {
            const suggestions = [];
            
            // 基于库存数据生成建议
            const materialInventory = this.data.inventory?.materials || [];
            const lowStockMaterials = materialInventory.filter(m => m.quantity < m.safeStock);
            
            if (lowStockMaterials.length > 0) {
                suggestions.push({
                    title: '库存补货提醒',
                    description: `有 ${lowStockMaterials.length} 种物料库存低于安全库存，建议及时补货。`,
                    priority: '高',
                    impact: '避免生产中断'
                });
            }

            // 基于订单数据生成建议
            const orders = this.data.orders || [];
            const urgentOrders = orders.filter(o => {
                const deliveryDate = new Date(o.deliveryDate);
                const today = new Date();
                const diffDays = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && o.status !== '已完成';
            });

            if (urgentOrders.length > 0) {
                suggestions.push({
                    title: '紧急订单处理',
                    description: `有 ${urgentOrders.length} 个订单即将到期，需要优先处理。`,
                    priority: '紧急',
                    impact: '保证准时交付'
                });
            }

            // 基于生产能力生成建议
            const equipment = this.data.equipment || [];
            const availableEquipment = equipment.filter(e => e.status === '正常').length;
            const totalEquipment = equipment.length;
            
            if (totalEquipment > 0 && availableEquipment / totalEquipment < 0.8) {
                suggestions.push({
                    title: '设备维护提醒',
                    description: '可用设备比例较低，建议安排设备维护计划。',
                    priority: '中',
                    impact: '提高设备利用率'
                });
            }

            // 通用建议
            suggestions.push({
                title: '供应商评估',
                description: '建议定期评估供应商绩效，优化供应商结构。',
                priority: '中',
                impact: '降低采购成本，提高供应稳定性'
            });

            suggestions.push({
                title: '库存优化',
                description: '分析库存周转率，优化安全库存设置。',
                priority: '低',
                impact: '降低库存成本'
            });

            return suggestions;
        }
    },
    methods: {
        /**
         * 格式化数字
         * @param {number} num - 数字
         * @returns {string} 格式化后的字符串
         */
        formatNumber(num) {
            return num.toLocaleString('zh-CN');
        },

        /**
         * 获取风险等级样式类
         * @param {string} level - 风险等级
         * @returns {string} 样式类
         */
        getRiskLevelClass(level) {
            switch (level) {
                case '高': return 'text-danger';
                case '中': return 'text-warning';
                case '低': return 'text-success';
                default: return 'text-secondary';
            }
        },

        /**
         * 获取影响程度样式类
         * @param {string} impact - 影响程度
         * @returns {string} 样式类
         */
        getImpactClass(impact) {
            switch (impact) {
                case '高': return 'bg-danger';
                case '中': return 'bg-warning';
                case '低': return 'bg-success';
                default: return 'bg-secondary';
            }
        },

        /**
         * 获取概率样式类
         * @param {number} probability - 概率
         * @returns {string} 样式类
         */
        getProbabilityClass(probability) {
            if (probability >= 70) return 'bg-danger';
            if (probability >= 40) return 'bg-warning';
            return 'bg-success';
        },

        /**
         * 获取优先级样式类
         * @param {string} priority - 优先级
         * @returns {string} 样式类
         */
        getPriorityClass(priority) {
            switch (priority) {
                case '紧急': return 'bg-danger';
                case '高': return 'bg-warning';
                case '中': return 'bg-info';
                case '低': return 'bg-secondary';
                default: return 'bg-secondary';
            }
        },

        /**
         * 初始化KPI趋势图表
         */
        initKpiTrendChart() {
            const chartDom = document.getElementById('kpiTrendChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            chart.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['订单履约率', '准时交付率', '库存周转率']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['1月', '2月', '3月', '4月', '5月', '6月']
                },
                yAxis: {
                    type: 'value',
                    name: '百分比(%)'
                },
                series: [
                    {
                        name: '订单履约率',
                        type: 'line',
                        data: [92, 94, 93, 95, 96, 95],
                        smooth: true,
                        itemStyle: { color: '#52c41a' }
                    },
                    {
                        name: '准时交付率',
                        type: 'line',
                        data: [88, 90, 89, 92, 93, 94],
                        smooth: true,
                        itemStyle: { color: '#1890ff' }
                    },
                    {
                        name: '库存周转率',
                        type: 'line',
                        data: [7.5, 7.8, 8.0, 8.2, 8.5, 8.5],
                        smooth: true,
                        itemStyle: { color: '#faad14' }
                    }
                ]
            });
        },

        /**
         * 初始化绩效雷达图
         */
        initPerformanceRadarChart() {
            const chartDom = document.getElementById('performanceRadarChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            chart.setOption({
                tooltip: {},
                radar: {
                    indicator: [
                        { name: '成本', max: 100 },
                        { name: '质量', max: 100 },
                        { name: '交付', max: 100 },
                        { name: '柔性', max: 100 },
                        { name: '创新', max: 100 }
                    ]
                },
                series: [{
                    type: 'radar',
                    data: [
                        {
                            value: [85, 90, 88, 75, 70],
                            name: '当前绩效',
                            areaStyle: {
                                color: 'rgba(24, 144, 255, 0.3)'
                            },
                            itemStyle: {
                                color: '#1890ff'
                            }
                        },
                        {
                            value: [90, 95, 95, 85, 80],
                            name: '目标绩效',
                            lineStyle: {
                                type: 'dashed'
                            },
                            itemStyle: {
                                color: '#52c41a'
                            }
                        }
                    ]
                }]
            });
        },

        /**
         * 初始化成本结构图表
         */
        initCostStructureChart() {
            const chartDom = document.getElementById('costStructureChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            chart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: 450000, name: '采购成本' },
                        { value: 320000, name: '生产成本' },
                        { value: 180000, name: '物流成本' },
                        { value: 150000, name: '库存成本' },
                        { value: 150000, name: '管理成本' }
                    ]
                }]
            });
        },

        /**
         * 初始化成本趋势图表
         */
        initCostTrendChart() {
            const chartDom = document.getElementById('costTrendChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ['采购成本', '生产成本', '物流成本', '库存成本', '管理成本']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['1月', '2月', '3月', '4月', '5月', '6月']
                },
                yAxis: {
                    type: 'value',
                    name: '成本(元)'
                },
                series: [
                    {
                        name: '采购成本',
                        type: 'bar',
                        stack: 'total',
                        data: [400000, 410000, 415000, 420000, 425000, 450000]
                    },
                    {
                        name: '生产成本',
                        type: 'bar',
                        stack: 'total',
                        data: [300000, 305000, 308000, 310000, 312000, 320000]
                    },
                    {
                        name: '物流成本',
                        type: 'bar',
                        stack: 'total',
                        data: [200000, 195000, 190000, 188000, 185000, 180000]
                    },
                    {
                        name: '库存成本',
                        type: 'bar',
                        stack: 'total',
                        data: [140000, 142000, 143000, 144000, 145000, 150000]
                    },
                    {
                        name: '管理成本',
                        type: 'bar',
                        stack: 'total',
                        data: [150000, 150000, 150000, 150000, 150000, 150000]
                    }
                ]
            });
        },

        /**
         * 初始化风险矩阵图表
         */
        initRiskMatrixChart() {
            const chartDom = document.getElementById('riskMatrixChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            const data = [
                [0, 0, 10], [1, 0, 20], [2, 0, 30], [3, 0, 40],
                [0, 1, 20], [1, 1, 30], [2, 1, 40], [3, 1, 50],
                [0, 2, 30], [1, 2, 40], [2, 2, 50], [3, 2, 60],
                [0, 3, 40], [1, 3, 50], [2, 3, 60], [3, 3, 70]
            ];
            
            const riskPoints = [
                { value: [2, 2], name: '供应商风险' },
                { value: [1, 1], name: '需求风险' },
                { value: [1, 2], name: '库存风险' },
                { value: [3, 0], name: '物流风险' },
                { value: [0, 2], name: '质量风险' }
            ];
            
            chart.setOption({
                tooltip: {
                    position: 'top'
                },
                grid: {
                    height: '70%',
                    top: '10%'
                },
                xAxis: {
                    type: 'category',
                    data: ['低', '中', '高', '极高'],
                    name: '影响程度',
                    splitArea: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'category',
                    data: ['低', '中', '高', '极高'],
                    name: '发生概率',
                    splitArea: {
                        show: true
                    }
                },
                visualMap: {
                    min: 0,
                    max: 70,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '5%',
                    inRange: {
                        color: ['#52c41a', '#faad14', '#ff4d4f']
                    }
                },
                series: [{
                    name: '风险等级',
                    type: 'heatmap',
                    data: data,
                    label: {
                        show: true
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }, {
                    name: '风险点',
                    type: 'scatter',
                    symbolSize: 20,
                    data: riskPoints.map(p => ({
                        value: p.value,
                        name: p.name
                    })),
                    itemStyle: {
                        color: '#1890ff',
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}',
                        position: 'top'
                    }
                }]
            });
        },

        /**
         * 初始化库存优化图表
         */
        initInventoryOptimizationChart() {
            const chartDom = document.getElementById('inventoryOptimizationChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['当前库存', '建议库存']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                    data: ['物料A', '物料B', '物料C', '物料D', '物料E']
                },
                series: [
                    {
                        name: '当前库存',
                        type: 'bar',
                        data: [320, 280, 250, 220, 190]
                    },
                    {
                        name: '建议库存',
                        type: 'bar',
                        data: [300, 260, 240, 200, 180]
                    }
                ]
            });
        },

        /**
         * 初始化采购策略图表
         */
        initProcurementStrategyChart() {
            const chartDom = document.getElementById('procurementStrategyChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            chart.setOption({
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '5%',
                    left: 'center'
                },
                series: [
                    {
                        name: '采购策略',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 20,
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            { value: 40, name: '集中采购' },
                            { value: 30, name: '分散采购' },
                            { value: 20, name: '长期合同' },
                            { value: 10, name: '现货采购' }
                        ]
                    }
                ]
            });
        }
    },
    watch: {
        activeTab(newTab) {
            this.$nextTick(() => {
                switch (newTab) {
                    case 'performance':
                        this.initKpiTrendChart();
                        this.initPerformanceRadarChart();
                        break;
                    case 'cost':
                        this.initCostStructureChart();
                        this.initCostTrendChart();
                        break;
                    case 'risk':
                        this.initRiskMatrixChart();
                        break;
                    case 'decision':
                        this.initInventoryOptimizationChart();
                        this.initProcurementStrategyChart();
                        break;
                }
            });
        }
    },
    mounted() {
        // 初始化第一个选项卡的图表
        this.initKpiTrendChart();
        this.initPerformanceRadarChart();
    }
};
