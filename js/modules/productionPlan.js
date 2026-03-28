/**
 * 生产计划模块
 * 包含订单管理、生产计划生成、生产排产可视化功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 生产计划组件
 */
export default {
    name: 'ProductionPlanModule',
    template: `
        <div>
            <h2 class="mb-4">生产计划</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">订单管理</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'plans' }" @click="activeTab = 'plans'; initGanttChart();">生产计划</a>
                </li>
            </ul>

            <!-- 订单管理 -->
            <div v-if="activeTab === 'orders'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>订单列表</h5>
                    <button class="btn btn-primary" @click="openOrderModal()">添加订单</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>订单编号</th>
                                <th>产品</th>
                                <th>数量</th>
                                <th>交货日期</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.orders" :key="item.id">
                                <td>{{ item.orderNo }}</td>
                                <td>{{ getProductName(item.productId) }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.deliveryDate }}</td>
                                <td>
                                    <span class="badge" :class="getStatusBadgeClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openOrderModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-success" @click="generatePlan(item)" v-if="item.status === '待处理'">生成计划</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteOrder(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 生产计划 -->
            <div v-if="activeTab === 'plans'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>生产计划列表</h5>
                </div>
                <div class="table-responsive mb-4">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>产品</th>
                                <th>数量</th>
                                <th>开始日期</th>
                                <th>结束日期</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.productionPlans" :key="item.id">
                                <td>{{ getProductName(item.productId) }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.startDate }}</td>
                                <td>{{ item.endDate }}</td>
                                <td>
                                    <span class="badge" :class="getStatusBadgeClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openPlanModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deletePlan(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">生产排产甘特图</h5>
                        <div id="ganttChart" class="chart-container"></div>
                    </div>
                </div>
            </div>

            <!-- 订单模态框 -->
            <div class="modal fade" id="orderModal" tabindex="-1" ref="orderModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingOrder.id ? '编辑订单' : '添加订单' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveOrder">
                                <div class="mb-3">
                                    <label class="form-label">订单编号</label>
                                    <input type="text" class="form-control" v-model="editingOrder.orderNo" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">产品</label>
                                    <select class="form-select" v-model="editingOrder.productId" required>
                                        <option v-for="product in data.products" :key="product.id" :value="product.id">
                                            {{ product.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">数量</label>
                                    <input type="number" class="form-control" v-model="editingOrder.quantity" required min="1">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">交货日期</label>
                                    <input type="date" class="form-control" v-model="editingOrder.deliveryDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingOrder.status">
                                        <option value="待处理">待处理</option>
                                        <option value="进行中">进行中</option>
                                        <option value="已完成">已完成</option>
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

            <!-- 生产计划模态框 -->
            <div class="modal fade" id="planModal" tabindex="-1" ref="planModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">编辑生产计划</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="savePlan">
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingPlan.status">
                                        <option value="待处理">待处理</option>
                                        <option value="进行中">进行中</option>
                                        <option value="已完成">已完成</option>
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
            activeTab: 'orders',
            data: loadData(),
            editingOrder: {},
            editingPlan: {}
        };
    },
    methods: {
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
         * 获取状态徽章样式类
         * @param {string} status - 状态
         * @returns {string} 样式类
         */
        getStatusBadgeClass(status) {
            switch (status) {
                case '待处理': return 'bg-secondary';
                case '进行中': return 'bg-warning';
                case '已完成': return 'bg-success';
                default: return 'bg-secondary';
            }
        },

        /**
         * 打开订单模态框
         * @param {Object} order - 订单对象
         */
        openOrderModal(order = null) {
            this.editingOrder = order ? { ...order } : { 
                orderNo: '', 
                productId: '', 
                quantity: 1, 
                deliveryDate: '', 
                status: '待处理' 
            };
            new bootstrap.Modal(this.$refs.orderModal).show();
        },

        /**
         * 保存订单
         */
        saveOrder() {
            if (this.editingOrder.id) {
                const index = this.data.orders.findIndex(o => o.id === this.editingOrder.id);
                if (index !== -1) this.data.orders[index] = { ...this.editingOrder };
            } else {
                this.data.orders.push({ ...this.editingOrder, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.orderModal).hide();
        },

        /**
         * 删除订单
         * @param {string} id - 订单ID
         */
        deleteOrder(id) {
            if (confirm('确定要删除这个订单吗？')) {
                this.data.orders = this.data.orders.filter(o => o.id !== id);
                saveData(this.data);
            }
        },

        /**
         * 生成生产计划
         * @param {Object} order - 订单对象
         */
        generatePlan(order) {
            const deliveryDate = new Date(order.deliveryDate);
            const startDate = new Date(deliveryDate);
            startDate.setDate(startDate.getDate() - 7);

            const plan = {
                id: generateId(),
                orderId: order.id,
                productId: order.productId,
                quantity: order.quantity,
                startDate: startDate.toISOString().split('T')[0],
                endDate: order.deliveryDate,
                status: '待处理'
            };

            this.data.productionPlans.push(plan);
            order.status = '进行中';
            saveData(this.data);
            alert('生产计划生成成功！');
        },

        /**
         * 打开生产计划模态框
         * @param {Object} plan - 生产计划对象
         */
        openPlanModal(plan) {
            this.editingPlan = { ...plan };
            new bootstrap.Modal(this.$refs.planModal).show();
        },

        /**
         * 保存生产计划
         */
        savePlan() {
            const index = this.data.productionPlans.findIndex(p => p.id === this.editingPlan.id);
            if (index !== -1) this.data.productionPlans[index] = { ...this.editingPlan };
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.planModal).hide();
            this.initGanttChart();
        },

        /**
         * 删除生产计划
         * @param {string} id - 生产计划ID
         */
        deletePlan(id) {
            if (confirm('确定要删除这个生产计划吗？')) {
                this.data.productionPlans = this.data.productionPlans.filter(p => p.id !== id);
                saveData(this.data);
                this.initGanttChart();
            }
        },

        /**
         * 初始化甘特图
         */
        initGanttChart() {
            const chartDom = document.getElementById('ganttChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            const seriesData = this.data.productionPlans.map(plan => {
                const product = this.getProductName(plan.productId);
                const statusColor = plan.status === '已完成' ? '#52c41a' : 
                                    plan.status === '进行中' ? '#faad14' : '#1890ff';
                return {
                    name: product,
                    value: [plan.startDate, plan.endDate, plan.quantity],
                    itemStyle: { color: statusColor }
                };
            });

            chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        const data = params[0];
                        return `${data.name}<br/>开始: ${data.value[0]}<br/>结束: ${data.value[1]}<br/>数量: ${data.value[2]}`;
                    }
                },
                xAxis: {
                    type: 'time',
                    name: '日期'
                },
                yAxis: {
                    type: 'category',
                    data: this.data.productionPlans.map(plan => this.getProductName(plan.productId))
                },
                series: [{
                    type: 'bar',
                    data: seriesData,
                    label: {
                        show: true,
                        formatter: (params) => `数量: ${params.value[2]}`
                    }
                }]
            });
        }
    },
    mounted() {
        if (this.activeTab === 'plans') {
            setTimeout(() => this.initGanttChart(), 100);
        }
    }
};
