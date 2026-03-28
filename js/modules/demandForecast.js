/**
 * 需求预测模块
 * 包含销售预测、需求分析和预测模型管理功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 需求预测组件
 */
export default {
    name: 'DemandForecastModule',
    template: `
        <div>
            <h2 class="mb-4">需求预测</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'forecast' }" @click="activeTab = 'forecast'">销售预测</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'analysis' }" @click="activeTab = 'analysis'">需求分析</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'models' }" @click="activeTab = 'models'">预测模型</a>
                </li>
            </ul>

            <!-- 销售预测 -->
            <div v-if="activeTab === 'forecast'">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">销售预测设置</h5>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">选择产品</label>
                                <select class="form-select" v-model="forecastSettings.productId">
                                    <option value="">全部产品</option>
                                    <option v-for="product in data.products" :key="product.id" :value="product.id">
                                        {{ product.name }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">预测周期</label>
                                <select class="form-select" v-model="forecastSettings.period">
                                    <option value="month">按月</option>
                                    <option value="quarter">按季度</option>
                                    <option value="year">按年</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">预测时长</label>
                                <select class="form-select" v-model="forecastSettings.duration">
                                    <option value="3">3个月</option>
                                    <option value="6">6个月</option>
                                    <option value="12">12个月</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" @click="generateForecast">生成预测</button>
                    </div>
                </div>

                <div class="card" v-if="forecastData.length > 0">
                    <div class="card-body">
                        <h5 class="card-title">预测结果</h5>
                        <div id="forecastChart" class="chart-container" style="height: 400px;"></div>
                        <div class="table-responsive mt-4">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>时间</th>
                                        <th>预测销量</th>
                                        <th>置信区间下限</th>
                                        <th>置信区间上限</th>
                                        <th>增长率</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in forecastData" :key="index">
                                        <td>{{ item.period }}</td>
                                        <td>{{ item.value }}</td>
                                        <td>{{ item.lowerBound }}</td>
                                        <td>{{ item.upperBound }}</td>
                                        <td :class="item.growthRate > 0 ? 'text-success' : 'text-danger'">
                                            {{ item.growthRate > 0 ? '+' : '' }}{{ item.growthRate }}%
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 需求分析 -->
            <div v-if="activeTab === 'analysis'">
                <div class="row">
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">历史销售趋势</h5>
                                <div id="salesTrendChart" class="chart-container" style="height: 300px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">产品需求分布</h5>
                                <div id="demandDistributionChart" class="chart-container" style="height: 300px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">需求分析洞察</h5>
                        <div class="list-group">
                            <div v-for="(insight, index) in demandInsights" :key="index" class="list-group-item">
                                <h6 class="mb-1">{{ insight.title }}</h6>
                                <p class="mb-1">{{ insight.description }}</p>
                                <small class="text-muted">{{ insight.type }}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 预测模型 -->
            <div v-if="activeTab === 'models'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>预测模型列表</h5>
                    <button class="btn btn-primary" @click="openModelModal()">添加模型</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>模型名称</th>
                                <th>模型类型</th>
                                <th>准确度</th>
                                <th>状态</th>
                                <th>最后训练时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.forecastModels || []" :key="item.id">
                                <td>{{ item.name }}</td>
                                <td>{{ item.type }}</td>
                                <td>{{ item.accuracy }}%</td>
                                <td>
                                    <span class="badge" :class="item.status === '活跃' ? 'bg-success' : 'bg-secondary'">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>{{ item.lastTrained }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openModelModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-success" @click="trainModel(item)">训练</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteModel(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 预测模型模态框 -->
            <div class="modal fade" id="modelModal" tabindex="-1" ref="modelModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingModel.id ? '编辑模型' : '添加模型' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveModel">
                                <div class="mb-3">
                                    <label class="form-label">模型名称</label>
                                    <input type="text" class="form-control" v-model="editingModel.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">模型类型</label>
                                    <select class="form-select" v-model="editingModel.type" required>
                                        <option value="移动平均">移动平均</option>
                                        <option value="指数平滑">指数平滑</option>
                                        <option value="线性回归">线性回归</option>
                                        <option value="季节性分解">季节性分解</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">参数设置</label>
                                    <div class="row">
                                        <div class="col-6">
                                            <input type="number" class="form-control" v-model="editingModel.windowSize" placeholder="窗口大小" min="1">
                                        </div>
                                        <div class="col-6">
                                            <input type="number" class="form-control" v-model="editingModel.alpha" placeholder="平滑系数" min="0" max="1" step="0.1">
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingModel.status">
                                        <option value="活跃">活跃</option>
                                        <option value="停用">停用</option>
                                    </select>
                                </div>
                                <div class="text-end">
                                    <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            activeTab: 'forecast',
            data: loadData(),
            forecastSettings: {
                productId: '',
                period: 'month',
                duration: '6'
            },
            forecastData: [],
            editingModel: {}
        };
    },

    computed: {
        /**
         * 需求分析洞察
         * @returns {Array} 分析洞察列表
         */
        demandInsights() {
            const insights = [];
            
            // 基于历史订单数据生成洞察
            const orders = this.data.orders || [];
            if (orders.length === 0) {
                insights.push({
                    title: '数据不足',
                    description: '当前没有足够的订单数据来进行需求分析，建议先录入一些销售订单。',
                    type: '提示'
                });
                return insights;
            }
            
            // 计算总体趋势
            insights.push({
                title: '销售趋势分析',
                description: `系统已记录 ${orders.length} 个订单，建议定期分析销售趋势以优化库存和生产计划。`,
                type: '分析'
            });
            
            // 产品需求分布
            const productCounts = {};
            orders.forEach(order => {
                productCounts[order.productId] = (productCounts[order.productId] || 0) + order.quantity;
            });
            
            const topProduct = Object.entries(productCounts)
                .sort((a, b) => b[1] - a[1])[0];
            
            if (topProduct) {
                const productName = this.getProductName(topProduct[0]);
                insights.push({
                    title: '热销产品',
                    description: `${productName} 是目前的畅销产品，累计销量 ${topProduct[1]} 个，建议保证充足的库存。`,
                    type: '建议'
                });
            }
            
            // 季节性分析（模拟）
            insights.push({
                title: '季节性趋势',
                description: '根据历史数据分析，产品销售呈现一定的季节性波动，建议在旺季前提前备货。',
                type: '趋势'
            });
            
            return insights;
        }
    },
    methods: {
        /**
         * 刷新数据
         */
        refreshData() {
            this.data = loadData();
        },
        /**
         * 获取产品名称
         * @param {string} id - 产品ID
         * @returns {string} 产品名称
         */
        getProductName(id) {
            const product = this.data.products.find(p => p.id === id);
            return product ? product.name : '未知产品';
        },

        /**
         * 生成销售预测
         */
        generateForecast() {
            const duration = parseInt(this.forecastSettings.duration);
            const forecastData = [];
            
            // 从订单数据获取历史销售数据
            const orders = this.data.orders || [];
            const productId = this.forecastSettings.productId;
            
            // 过滤出指定产品的订单
            const filteredOrders = productId ? 
                orders.filter(order => order.productId === productId) : 
                orders;
            
            // 按月份统计历史销量
            const historicalSales = {};
            filteredOrders.forEach(order => {
                const date = new Date(order.deliveryDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!historicalSales[monthKey]) {
                    historicalSales[monthKey] = 0;
                }
                historicalSales[monthKey] += order.quantity || 0;
            });
            
            // 计算历史平均销量和增长趋势
            const historicalValues = Object.values(historicalSales);
            const baseValue = historicalValues.length > 0 
                ? Math.round(historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length)
                : 100; // 默认值
            
            // 计算增长趋势
            let trend = 0.05; // 默认5%增长
            if (historicalValues.length >= 2) {
                const firstValue = historicalValues[0];
                const lastValue = historicalValues[historicalValues.length - 1];
                trend = (lastValue - firstValue) / firstValue / (historicalValues.length - 1);
                trend = Math.max(-0.1, Math.min(0.2, trend)); // 限制趋势范围
            }
            
            const seasonality = [1.0, 0.9, 1.1, 1.2, 1.3, 1.1, 1.0, 0.9, 1.1, 1.2, 1.4, 1.2]; // 季节性因子
            const now = new Date();
            
            for (let i = 0; i < duration; i++) {
                const date = new Date(now);
                date.setMonth(date.getMonth() + i);
                
                const period = this.forecastSettings.period === 'month' 
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                    : this.forecastSettings.period === 'quarter'
                        ? `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
                        : `${date.getFullYear()}`;
                
                const trendFactor = Math.pow(1 + trend, i);
                const seasonalFactor = seasonality[date.getMonth() % 12];
                const predictedValue = Math.max(0, Math.round(baseValue * trendFactor * seasonalFactor));
                const confidenceInterval = Math.round(predictedValue * 0.15); // 15%置信区间
                
                const prevValue = i > 0 ? forecastData[i - 1].value : predictedValue;
                const growthRate = i > 0 ? ((predictedValue - prevValue) / prevValue * 100).toFixed(1) : 0;
                
                forecastData.push({
                    period,
                    value: predictedValue,
                    lowerBound: Math.max(0, predictedValue - confidenceInterval),
                    upperBound: predictedValue + confidenceInterval,
                    growthRate
                });
            }
            
            this.forecastData = forecastData;
            this.$nextTick(() => {
                this.initForecastChart();
            });
        },

        /**
         * 初始化预测图表
         */
        initForecastChart() {
            const chartDom = document.getElementById('forecastChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            const periods = this.forecastData.map(item => item.period);
            const values = this.forecastData.map(item => item.value);
            const lowerBounds = this.forecastData.map(item => item.lowerBound);
            const upperBounds = this.forecastData.map(item => item.upperBound);
            
            chart.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['预测值', '置信区间']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: periods
                },
                yAxis: {
                    type: 'value',
                    name: '销量'
                },
                series: [
                    {
                        name: '预测值',
                        type: 'line',
                        data: values,
                        smooth: true,
                        itemStyle: { color: '#1890ff' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                            ])
                        }
                    },
                    {
                        name: '置信区间上限',
                        type: 'line',
                        data: upperBounds,
                        lineStyle: { type: 'dashed', color: '#52c41a' },
                        symbol: 'none'
                    },
                    {
                        name: '置信区间下限',
                        type: 'line',
                        data: lowerBounds,
                        lineStyle: { type: 'dashed', color: '#ff4d4f' },
                        symbol: 'none'
                    }
                ]
            });
        },

        /**
         * 初始化销售趋势图表
         */
        initSalesTrendChart() {
            const chartDom = document.getElementById('salesTrendChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            // 从订单数据获取历史销售数据
            const orders = this.data.orders || [];
            
            // 按月份统计销量
            const monthlySales = {};
            // 初始化12个月的数据
            for (let i = 1; i <= 12; i++) {
                monthlySales[i] = 0;
            }
            
            // 统计每月销量
            orders.forEach(order => {
                const date = new Date(order.deliveryDate);
                const month = date.getMonth() + 1;
                monthlySales[month] += order.quantity || 0;
            });
            
            const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            const salesData = [monthlySales[1], monthlySales[2], monthlySales[3], monthlySales[4], monthlySales[5], monthlySales[6],
                              monthlySales[7], monthlySales[8], monthlySales[9], monthlySales[10], monthlySales[11], monthlySales[12]];
            
            chart.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: months
                },
                yAxis: {
                    type: 'value',
                    name: '销量'
                },
                series: [{
                    name: '历史销量',
                    type: 'line',
                    data: salesData,
                    smooth: true,
                    itemStyle: { color: '#1890ff' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                        ])
                    }
                }]
            });
        },

        /**
         * 初始化需求分布图表
         */
        initDemandDistributionChart() {
            const chartDom = document.getElementById('demandDistributionChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            // 基于产品数据生成需求分布
            const productData = this.data.products.map(product => {
                const orderCount = this.data.orders
                    .filter(order => order.productId === product.id)
                    .reduce((sum, order) => sum + (order.quantity || 0), 0);
                return {
                    name: product.name,
                    value: orderCount
                };
            }).filter(item => item.value > 0); // 只显示有需求的产品
            
            // 如果没有产品数据或没有需求数据，使用默认数据
            const data = productData.length > 0 ? productData : [
                { name: '智能手表', value: 335 },
                { name: '无线耳机', value: 310 }
            ];
            
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
                    radius: '50%',
                    data: data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            });
        },

        // 预测模型管理
        openModelModal(model = null) {
            this.editingModel = model ? { ...model } : { 
                name: '', 
                type: '移动平均', 
                windowSize: 3, 
                alpha: 0.3, 
                status: '活跃',
                accuracy: 0
            };
            new bootstrap.Modal(this.$refs.modelModal).show();
        },
        saveModel() {
            if (!this.data.forecastModels) {
                this.data.forecastModels = [];
            }
            
            if (this.editingModel.id) {
                const index = this.data.forecastModels.findIndex(m => m.id === this.editingModel.id);
                if (index !== -1) this.data.forecastModels[index] = { ...this.editingModel };
            } else {
                this.data.forecastModels.push({ 
                    ...this.editingModel, 
                    id: generateId(),
                    lastTrained: new Date().toISOString().split('T')[0]
                });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.modelModal).hide();
        },
        deleteModel(id) {
            if (confirm('确定要删除这个预测模型吗？')) {
                this.data.forecastModels = this.data.forecastModels.filter(m => m.id !== id);
                saveData(this.data);
            }
        },
        trainModel(model) {
            // 模拟模型训练
            const accuracy = Math.floor(Math.random() * 20) + 80; // 80-99%的准确度
            const index = this.data.forecastModels.findIndex(m => m.id === model.id);
            if (index !== -1) {
                this.data.forecastModels[index].accuracy = accuracy;
                this.data.forecastModels[index].lastTrained = new Date().toISOString().split('T')[0];
                saveData(this.data);
                alert(`模型训练完成！准确度: ${accuracy}%`);
            }
        }
    },
    watch: {
        activeTab(newTab) {
            // 当组件激活时刷新数据
            this.refreshData();
            if (newTab === 'analysis') {
                this.$nextTick(() => {
                    this.initSalesTrendChart();
                    this.initDemandDistributionChart();
                });
            }
        }
    },
    mounted() {
        // 初始化数据结构
        if (!this.data.forecastModels) {
            this.data.forecastModels = [];
            saveData(this.data);
        }
    }
};
