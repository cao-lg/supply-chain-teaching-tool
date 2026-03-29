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
                    <a class="nav-link" :class="{ active: activeTab === 'plans' }" @click="activeTab = 'plans'; initGanttChart();">生产计划总表</a>
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
                                <th>优先级</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.orders.length === 0">
                                <td colspan="7" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-clipboard-list fa-3x mb-3 d-block"></i>
                                        <h5>暂无订单数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个订单</p>
                                        <button class="btn btn-primary" @click="openOrderModal()">
                                            <i class="fas fa-plus"></i> 添加订单
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.orders" :key="item.id">
                                <td>{{ item.orderNo }}</td>
                                <td>{{ getProductName(item.productId) }}</td>
                                <td>{{ item.quantity }}</td>
                                <td :class="{ 'text-danger': isDeliveryDateUrgent(item) }">
                                    {{ item.deliveryDate }}
                                    <span v-if="isDeliveryDateUrgent(item)" class="ms-1">⚠️</span>
                                </td>
                                <td>
                                    <span class="badge" :class="getPriorityBadgeClass(item.priority)">
                                        {{ item.priority || '普通' }}
                                    </span>
                                </td>
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
                    <h5>生产计划总表</h5>
                    <button class="btn btn-primary" @click="openAddPlanModal()">添加生产计划</button>
                </div>
                
                <!-- 生产计划表格 -->
                <div class="table-responsive mb-4">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>计划编号</th>
                                <th>产品</th>
                                <th>数量</th>
                                <th>开始日期</th>
                                <th>结束日期</th>
                                <th>工时</th>
                                <th>设备</th>
                                <th>设备消耗</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.productionPlans.length === 0">
                                <td colspan="10" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-industry fa-3x mb-3 d-block"></i>
                                        <h5>暂无生产计划数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个生产计划</p>
                                        <button class="btn btn-primary" @click="openAddPlanModal()">
                                            <i class="fas fa-plus"></i> 添加生产计划
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.productionPlans" :key="item.id">
                                <td>{{ item.planNo || item.id }}</td>
                                <td>{{ getProductName(item.productId) }}</td>
                                <td>
                                    <span class="editable-cell" @click="startEditQuantity(item)" v-if="editingPlanId !== item.id">
                                        {{ item.quantity }}
                                        <i class="bi bi-pencil text-muted ms-1"></i>
                                    </span>
                                    <input v-else type="number" class="form-control form-control-sm d-inline-block" 
                                           style="width: 80px" 
                                           v-model.number="editingQuantity" 
                                           @blur="saveQuantityEdit(item)"
                                           @keyup.enter="saveQuantityEdit(item)"
                                           ref="quantityInput">
                                </td>
                                <td>{{ item.startDate }}</td>
                                <td>{{ item.endDate }}</td>
                                <td>{{ calculateWorkHours(item) }}h</td>
                                <td>{{ getEquipmentName(item.equipmentId) }}</td>
                                <td>
                                    <span :class="getEquipmentUsageClass(item)">
                                        {{ calculateEquipmentUsage(item) }}%
                                        <span v-if="calculateEquipmentUsage(item) > 100">⚠️</span>
                                    </span>
                                </td>
                                <td>
                                    <span class="badge" :class="getStatusBadgeClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openPlanModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-success" @click="openCompletionModal(item)" v-if="item.status === '进行中'">完工入库</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deletePlan(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- 影响分析面板 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <strong>📊 资源消耗分析</strong>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h6 class="text-muted">总工时消耗</h6>
                                    <h3>{{ totalWorkHours.toFixed(1) }}h</h3>
                                    <small class="text-muted">({{ (totalWorkHours / 8).toFixed(2) }}人天)</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h6 class="text-muted">设备产能消耗</h6>
                                    <h3 :class="avgEquipmentUsage > 80 ? 'text-warning' : 'text-success'">
                                        {{ avgEquipmentUsage.toFixed(1) }}%
                                    </h3>
                                    <small class="text-muted">平均利用率</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <h6 class="text-muted">物料消耗</h6>
                                <ul class="list-unstyled mb-0">
                                    <li v-for="(consumption, materialId) in materialConsumption" :key="materialId">
                                        {{ getMaterialName(materialId) }}: {{ consumption }}个
                                    </li>
                                </ul>
                            </div>
                            <div class="col-md-3">
                                <h6 class="text-muted">库存检查</h6>
                                <ul class="list-unstyled mb-0">
                                    <li v-for="(status, materialId) in materialStockStatus" :key="materialId" 
                                        :class="status.sufficient ? 'text-success' : 'text-danger'">
                                        {{ status.sufficient ? '✅' : '⚠️' }} {{ getMaterialName(materialId) }}
                                        <small>({{ status.current }}/{{ status.needed }})</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 甘特图 -->
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">生产排产甘特图</h5>
                        <div id="ganttChart" class="chart-container"></div>
                    </div>
                </div>
            </div>

            <!-- 添加生产计划模态框 -->
            <div class="modal fade" id="addPlanModal" tabindex="-1" ref="addPlanModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">添加生产计划</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveNewPlan">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">产品</label>
                                            <select class="form-select" v-model="addingPlan.productId" required>
                                                <option value="">请选择产品</option>
                                                <option v-for="product in data.products" :key="product.id" :value="product.id">
                                                    {{ product.name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">数量</label>
                                            <input type="number" class="form-control" v-model.number="addingPlan.quantity" min="1" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">开始日期</label>
                                            <input type="date" class="form-control" v-model="addingPlan.startDate" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">结束日期</label>
                                            <input type="date" class="form-control" v-model="addingPlan.endDate" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">优先级</label>
                                            <select class="form-select" v-model="addingPlan.priority">
                                                <option value="普通">普通</option>
                                                <option value="重要">重要</option>
                                                <option value="紧急">紧急</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">分配设备</label>
                                            <select class="form-select" v-model="addingPlan.equipmentId">
                                                <option value="">请选择设备</option>
                                                <option v-for="eq in data.equipment" :key="eq.id" :value="eq.id">
                                                    {{ eq.name }} ({{ eq.capacityPerDay }}个/天)
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 预估资源消耗 -->
                                <div class="card bg-light mt-3" v-if="addingPlan.productId">
                                    <div class="card-body">
                                        <h6 class="card-title">📊 预估资源消耗</h6>
                                        <div class="row">
                                            <div class="col-md-4">
                                                <p class="mb-1 text-muted">工时消耗</p>
                                                <strong>{{ calculateEstimatedHours().toFixed(1) }}工时</strong>
                                                <small class="text-muted">({{ (calculateEstimatedHours() / 8).toFixed(2) }}人天)</small>
                                            </div>
                                            <div class="col-md-4">
                                                <p class="mb-1 text-muted">设备产能消耗</p>
                                                <strong :class="calculateEstimatedEquipmentUsage() > 100 ? 'text-danger' : 'text-success'">
                                                    {{ calculateEstimatedEquipmentUsage() }}%
                                                </strong>
                                                <span v-if="calculateEstimatedEquipmentUsage() > 100" class="text-danger">⚠️ 超载</span>
                                            </div>
                                            <div class="col-md-4">
                                                <p class="mb-1 text-muted">物料消耗</p>
                                                <ul class="list-unstyled mb-0 small">
                                                    <li v-for="item in getBomItems(addingPlan.productId)" :key="item.materialId">
                                                        {{ getMaterialName(item.materialId) }}: {{ item.quantity * addingPlan.quantity }}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
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
                                    <label class="form-label">客户</label>
                                    <select class="form-select" v-model="editingOrder.customerId" @change="calculateDeliveryDate" required>
                                        <option value="">请选择客户</option>
                                        <option v-for="customer in data.customers" :key="customer.id" :value="customer.id">
                                            {{ customer.name }}
                                        </option>
                                    </select>
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
                                    <input type="date" class="form-control" v-model="editingOrder.deliveryDate" @change="recordDeliveryDateAdjustment" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">交货日期调整原因</label>
                                    <textarea class="form-control" v-model="editingOrder.deliveryDateAdjustmentReason" rows="2"></textarea>
                                </div>
                                <div class="mb-3" v-if="editingOrder.deliveryDateCalculation">
                                    <label class="form-label">交货日期计算依据</label>
                                    <input type="text" class="form-control" v-model="editingOrder.deliveryDateCalculation" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">优先级</label>
                                    <select class="form-select" v-model="editingOrder.priority">
                                        <option value="普通">普通</option>
                                        <option value="重要">重要</option>
                                        <option value="紧急">紧急</option>
                                    </select>
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

            <!-- 生产完工入库模态框 -->
            <div class="modal fade" id="completionModal" tabindex="-1" ref="completionModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">生产完工入库</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">工单编号</label>
                                <input type="text" class="form-control" :value="completionPlan?.id" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">产品</label>
                                <input type="text" class="form-control" :value="getProductName(completionPlan?.productId)" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">计划数量</label>
                                <input type="number" class="form-control" :value="completionPlan?.quantity" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">入库数量</label>
                                <input type="number" class="form-control" v-model.number="completionQuantity" min="1" required>
                            </div>
                            <div class="alert alert-info" v-if="bomNotFound">
                                <strong>提示：</strong>未找到该产品的BOM清单，将直接增加产品库存而不扣减物料。
                            </div>
                            <div class="text-end">
                                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                                <button type="button" class="btn btn-primary" @click="confirmProductionCompletion">确认入库</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 确认删除模态框 -->
            <div class="modal fade" id="confirmDeleteModal" tabindex="-1" ref="confirmDeleteModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">确认操作</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>{{ confirmMessage }}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-danger" @click="executeConfirm">确定</button>
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
            editingPlan: {},
            completionPlan: null,
            completionQuantity: 0,
            bomNotFound: false,
            editingPlanId: null,
            editingQuantity: 0,
            addingPlan: {
                productId: '',
                quantity: 1,
                startDate: '',
                endDate: '',
                priority: '普通',
                equipmentId: '',
                workers: []
            },
            confirmMessage: '',
            pendingConfirmCallback: null
        };
    },
    computed: {
        totalWorkHours() {
            return this.data.productionPlans.reduce((total, plan) => {
                return total + this.calculateWorkHours(plan);
            }, 0);
        },
        avgEquipmentUsage() {
            if (this.data.productionPlans.length === 0) return 0;
            const total = this.data.productionPlans.reduce((sum, plan) => {
                return sum + this.calculateEquipmentUsage(plan);
            }, 0);
            return total / this.data.productionPlans.length;
        },
        materialConsumption() {
            const consumption = {};
            this.data.productionPlans.forEach(plan => {
                const bom = this.data.boms?.find(b => b.productId === plan.productId);
                if (bom && bom.items) {
                    bom.items.forEach(item => {
                        if (!consumption[item.materialId]) {
                            consumption[item.materialId] = 0;
                        }
                        consumption[item.materialId] += item.quantity * plan.quantity;
                    });
                }
            });
            return consumption;
        },
        materialStockStatus() {
            const status = {};
            Object.keys(this.materialConsumption).forEach(materialId => {
                const needed = this.materialConsumption[materialId];
                const inventory = this.data.inventory?.materials?.find(m => m.materialId === materialId);
                const current = inventory ? inventory.quantity : 0;
                status[materialId] = {
                    needed,
                    current,
                    sufficient: current >= needed
                };
            });
            return status;
        }
    },
    mounted() {
        // 监听数据更新事件
        window.addEventListener('data-updated', this.refreshData);
        if (this.activeTab === 'plans') {
            setTimeout(() => this.initGanttChart(), 100);
        }
    },
    beforeUnmount() {
        // 移除事件监听
        window.removeEventListener('data-updated', this.refreshData);
    },
    watch: {
        // 当组件激活时刷新数据
        activeTab() {
            this.refreshData();
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
         * 显示依赖数据缺失提示
         * @param {string} message - 提示消息
         * @param {Array} dependencies - 依赖项列表
         */
        showDependencyWarning(message, dependencies) {
            const depsHtml = dependencies.map(d => 
                `<a href="#" class="d-block text-decoration-none" onclick="window.goToModule('basicData', '${d.name}')">${d.label} [去添加 →]</a>`
            ).join('');
            
            const toast = document.getElementById('toast');
            const toastBody = document.getElementById('toastBody');
            const toastTitle = document.getElementById('toastTitle');
            const toastIcon = document.getElementById('toastIcon');
            
            if (toast && toastBody && toastTitle && toastIcon) {
                toastIcon.className = 'fas fa-exclamation-triangle text-warning me-2';
                toastTitle.textContent = '缺少必要数据';
                toastBody.innerHTML = `${message}<br><small class="mt-2 d-block">${depsHtml}</small>`;
                
                const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
                bsToast.show();
            } else {
                alert(`${message}\n\n请先添加：${dependencies.map(d => d.label).join('、')}`);
            }
        },
        
        /**
         * 跳转到基础资料模块
         * @param {string} tab - 标签页名称
         */
        goToBasicData(tab) {
            window.dispatchEvent(new CustomEvent('switch-page', { detail: { page: 1, tab: tab } }));
        },
        
        /**
         * 计算工时
         */
        calculateWorkHours(plan) {
            const product = this.data.products?.find(p => p.id === plan.productId);
            const productionTime = product?.productionTime || 0.5;
            return plan.quantity * productionTime;
        },
        
        /**
         * 计算设备产能消耗率
         */
        calculateEquipmentUsage(plan) {
            if (!plan.equipmentId) return 0;
            const equipment = this.data.equipment?.find(e => e.id === plan.equipmentId);
            if (!equipment) return 0;
            
            const days = Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            const dailyProduction = plan.quantity / days;
            return Math.round((dailyProduction / equipment.capacityPerDay) * 100);
        },
        
        /**
         * 获取设备产能消耗样式类
         */
        getEquipmentUsageClass(plan) {
            const usage = this.calculateEquipmentUsage(plan);
            if (usage > 100) return 'text-danger fw-bold';
            if (usage > 80) return 'text-warning';
            return 'text-success';
        },
        
        /**
         * 获取设备名称
         */
        getEquipmentName(equipmentId) {
            if (!equipmentId) return '-';
            const equipment = this.data.equipment?.find(e => e.id === equipmentId);
            return equipment ? equipment.name : '-';
        },
        
        /**
         * 获取物料名称
         */
        getMaterialName(materialId) {
            const material = this.data.materials?.find(m => m.id === materialId);
            return material ? material.name : '未知物料';
        },
        
        /**
         * 获取产品的BOM清单项
         * @param {string} productId - 产品ID
         * @returns {Array} BOM清单项数组
         */
        getBomItems(productId) {
            if (!productId) return [];
            const bom = this.data.boms?.find(b => b.productId === productId);
            return bom?.items || [];
        },
        
        /**
         * 开始编辑数量
         */
        startEditQuantity(plan) {
            this.editingPlanId = plan.id;
            this.editingQuantity = plan.quantity;
            this.$nextTick(() => {
                if (this.$refs.quantityInput && this.$refs.quantityInput[0]) {
                    this.$refs.quantityInput[0].focus();
                }
            });
        },
        
        /**
         * 保存数量编辑
         */
        saveQuantityEdit(plan) {
            if (this.editingQuantity > 0) {
                const planIndex = this.data.productionPlans.findIndex(p => p.id === plan.id);
                if (planIndex !== -1) {
                    this.data.productionPlans[planIndex].quantity = this.editingQuantity;
                    saveData(this.data);
                }
            }
            this.editingPlanId = null;
            this.editingQuantity = 0;
        },
        
        /**
         * 打开添加生产计划模态框
         */
        openAddPlanModal() {
            if (this.data.products.length === 0) {
                this.showDependencyWarning('创建生产计划需要先添加产品信息', [
                    { name: 'products', label: '产品信息' }
                ]);
                return;
            }
            
            this.addingPlan = {
                productId: '',
                quantity: 1,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: '普通',
                equipmentId: '',
                workers: []
            };
            new bootstrap.Modal(this.$refs.addPlanModal).show();
        },
        
        /**
         * 保存新生产计划
         */
        saveNewPlan() {
            if (!this.addingPlan.productId || this.addingPlan.quantity <= 0) {
                alert('请填写完整信息');
                return;
            }
            
            const plan = {
                id: generateId(),
                planNo: `PP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(this.data.productionPlans.length + 1).padStart(3, '0')}`,
                productId: this.addingPlan.productId,
                quantity: this.addingPlan.quantity,
                startDate: this.addingPlan.startDate,
                endDate: this.addingPlan.endDate,
                status: '待处理',
                priority: this.addingPlan.priority,
                equipmentId: this.addingPlan.equipmentId,
                workers: this.addingPlan.workers
            };
            
            this.data.productionPlans.push(plan);
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.addPlanModal).hide();
            this.initGanttChart();
        },
        
        /**
         * 计算预估工时
         */
        calculateEstimatedHours() {
            if (!this.addingPlan.productId || this.addingPlan.quantity <= 0) return 0;
            const product = this.data.products?.find(p => p.id === this.addingPlan.productId);
            const productionTime = product?.productionTime || 0.5;
            return this.addingPlan.quantity * productionTime;
        },
        
        /**
         * 计算预估设备消耗
         */
        calculateEstimatedEquipmentUsage() {
            if (!this.addingPlan.equipmentId || this.addingPlan.quantity <= 0) return 0;
            const equipment = this.data.equipment?.find(e => e.id === this.addingPlan.equipmentId);
            if (!equipment) return 0;
            
            const days = Math.ceil((new Date(this.addingPlan.endDate) - new Date(this.addingPlan.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            const dailyProduction = this.addingPlan.quantity / days;
            return Math.round((dailyProduction / equipment.capacityPerDay) * 100);
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
         * 获取优先级徽章样式类
         * @param {string} priority - 优先级
         * @returns {string} 样式类
         */
        getPriorityBadgeClass(priority) {
            switch (priority) {
                case '紧急': return 'bg-danger';
                case '重要': return 'bg-warning';
                case '普通': return 'bg-info';
                default: return 'bg-info';
            }
        },

        /**
         * 检查交货日期是否紧急
         * @param {Object} order - 订单对象
         * @returns {boolean} 是否紧急
         */
        isDeliveryDateUrgent(order) {
            const deliveryDate = new Date(order.deliveryDate);
            const today = new Date();
            const diffTime = deliveryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3;
        },

        /**
         * 打开订单模态框
         * @param {Object} order - 订单对象
         */
        openOrderModal(order = null) {
            if (!order && this.data.customers.length === 0) {
                this.showDependencyWarning('创建订单需要先添加客户信息', [
                    { name: 'customers', label: '客户信息' }
                ]);
                return;
            }
            if (!order && this.data.products.length === 0) {
                this.showDependencyWarning('创建订单需要先添加产品信息', [
                    { name: 'products', label: '产品信息' }
                ]);
                return;
            }
            
            this.editingOrder = order ? { ...order } : { 
                orderNo: '', 
                customerId: '',
                productId: '', 
                quantity: 1, 
                deliveryDate: '', 
                deliveryDateCalculation: '',
                deliveryDateAdjustmentReason: '',
                priority: '普通',
                status: '待处理' 
            };
            new bootstrap.Modal(this.$refs.orderModal).show();
        },
        
        /**
         * 计算交货日期
         */
        calculateDeliveryDate() {
            if (!this.editingOrder.customerId) return;
            
            const customer = this.data.customers.find(c => c.id === this.editingOrder.customerId);
            if (!customer || !customer.deliveryRules || customer.deliveryRules.length === 0) return;
            
            // 按优先级排序规则
            const sortedRules = [...customer.deliveryRules].sort((a, b) => a.priority - b.priority);
            const selectedRule = sortedRules[0];
            
            let deliveryDate = new Date();
            let calculationReason = '';
            
            switch (selectedRule.type) {
                case 'fixed_days':
                    deliveryDate.setDate(deliveryDate.getDate() + selectedRule.days);
                    calculationReason = `固定天数规则：${selectedRule.days}天`;
                    break;
                case 'working_days':
                    let workingDays = selectedRule.days;
                    let currentDate = new Date();
                    while (workingDays > 0) {
                        currentDate.setDate(currentDate.getDate() + 1);
                        const dayOfWeek = currentDate.getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            workingDays--;
                        }
                    }
                    deliveryDate = currentDate;
                    calculationReason = `工作日规则：${selectedRule.days}个工作日`;
                    break;
                case 'specific_date':
                    const currentMonth = deliveryDate.getMonth();
                    const currentYear = deliveryDate.getFullYear();
                    let targetMonth = currentMonth;
                    let targetYear = currentYear;
                    
                    if (deliveryDate.getDate() > selectedRule.dayOfMonth) {
                        targetMonth += 1;
                        if (targetMonth > 11) {
                            targetMonth = 0;
                            targetYear += 1;
                        }
                    }
                    
                    deliveryDate = new Date(targetYear, targetMonth, selectedRule.dayOfMonth);
                    calculationReason = `特定日期规则：每月${selectedRule.dayOfMonth}日`;
                    break;
            }
            
            this.editingOrder.deliveryDate = deliveryDate.toISOString().split('T')[0];
            this.editingOrder.deliveryDateCalculation = calculationReason;
        },
        
        /**
         * 记录交货日期调整
         */
        recordDeliveryDateAdjustment() {
            if (!this.editingOrder.deliveryDateCalculation) {
                this.editingOrder.deliveryDateCalculation = '手动设置';
            }
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
            this.showConfirm('确定要删除这个订单吗？', () => {
                this.data.orders = this.data.orders.filter(o => o.id !== id);
                saveData(this.data);
            });
        },

        /**
         * 生成生产计划
         * @param {Object} order - 订单对象
         */
        generatePlan(order) {
            const deliveryDate = new Date(order.deliveryDate);
            const startDate = new Date(deliveryDate);
            
            // 默认提前7天开始生产
            startDate.setDate(startDate.getDate() - 7);

            // 检查资源冲突
            const conflictingPlans = this.getConflictingPlans(startDate, deliveryDate);
            if (conflictingPlans.length > 0) {
                const confirmMsg = `检测到资源冲突！\n\n与以下生产计划时间重叠：\n${conflictingPlans.map(p => `- ${this.getProductName(p.productId)} (${p.startDate} ~ ${p.endDate})`).join('\n')}\n\n是否仍要创建生产计划？`;
                this.showConfirm(confirmMsg, () => {
                    this.createProductionPlan(order, startDate);
                });
                return;
            }

            this.createProductionPlan(order, startDate);
        },

        /**
         * 创建生产计划
         * @param {Object} order - 订单对象
         * @param {Date} startDate - 开始日期
         */
        createProductionPlan(order, startDate) {
            const plan = {
                id: generateId(),
                planNo: `PP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(this.data.productionPlans.length + 1).padStart(3, '0')}`,
                orderId: order.id,
                productId: order.productId,
                quantity: order.quantity,
                startDate: startDate.toISOString().split('T')[0],
                endDate: order.deliveryDate,
                status: '待处理',
                priority: order.priority || '普通'
            };

            this.data.productionPlans.push(plan);
            order.status = '进行中';
            saveData(this.data);
            alert('生产计划生成成功！');
        },

        /**
         * 获取冲突的生产计划
         * @param {Date} startDate - 开始日期
         * @param {Date} endDate - 结束日期
         * @returns {Array} 冲突的生产计划列表
         */
        getConflictingPlans(startDate, endDate) {
            const conflicts = [];
            for (const plan of this.data.productionPlans) {
                const planStart = new Date(plan.startDate);
                const planEnd = new Date(plan.endDate);
                
                // 检查时间重叠
                if ((startDate >= planStart && startDate <= planEnd) ||
                    (endDate >= planStart && endDate <= planEnd) ||
                    (startDate <= planStart && endDate >= planEnd)) {
                    conflicts.push(plan);
                }
            }
            return conflicts;
        },

        /**
         * 检查资源冲突
         * @param {Date} startDate - 开始日期
         * @param {Date} endDate - 结束日期
         * @returns {boolean} 是否存在冲突
         */
        checkResourceConflict(startDate, endDate) {
            return this.getConflictingPlans(startDate, endDate).length > 0;
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
        async deletePlan(id) {
            if (await window.confirmAction('确定要删除这个生产计划吗？此操作不可撤销。')) {
                this.data.productionPlans = this.data.productionPlans.filter(p => p.id !== id);
                saveData(this.data);
                this.initGanttChart();
                window.showToast('success', '删除成功', '生产计划已删除');
            }
        },

        /**
         * 初始化甘特图
         */
        initGanttChart() {
            this.refreshData();
            
            const chartDom = document.getElementById('ganttChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            if (this.data.productionPlans.length === 0) {
                chart.setOption({
                    title: {
                        text: '暂无生产计划数据',
                        left: 'center',
                        top: 'center',
                        textStyle: {
                            color: '#999',
                            fontSize: 14
                        }
                    }
                });
                return;
            }

            const products = [...new Set(this.data.productionPlans.map(p => this.getProductName(p.productId)))];
            const minDate = new Date(Math.min(...this.data.productionPlans.map(p => new Date(p.startDate).getTime())));
            const maxDate = new Date(Math.max(...this.data.productionPlans.map(p => new Date(p.endDate).getTime())));
            
            minDate.setDate(minDate.getDate() - 3);
            maxDate.setDate(maxDate.getDate() + 3);

            const seriesData = this.data.productionPlans.map((plan, index) => {
                const product = this.getProductName(plan.productId);
                const statusColor = plan.status === '已完成' ? '#52c41a' : 
                                    plan.status === '进行中' ? '#faad14' : '#1890ff';
                
                return {
                    name: product,
                    value: [index, plan.startDate, plan.endDate, plan.quantity, plan.planNo || plan.id],
                    itemStyle: { color: statusColor }
                };
            });

            chart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: (params) => {
                        const plan = this.data.productionPlans[params.value[0]];
                        return `<strong>${params.name}</strong><br/>
                                计划编号: ${plan.planNo || plan.id}<br/>
                                开始: ${params.value[1]}<br/>
                                结束: ${params.value[2]}<br/>
                                数量: ${params.value[3]}<br/>
                                状态: ${plan.status}`;
                    }
                },
                grid: {
                    left: '15%',
                    right: '10%',
                    top: '10%',
                    bottom: '15%'
                },
                xAxis: {
                    type: 'time',
                    min: minDate.toISOString().split('T')[0],
                    max: maxDate.toISOString().split('T')[0],
                    axisLabel: {
                        formatter: (value) => {
                            const date = new Date(value);
                            return `${date.getMonth()+1}/${date.getDate()}`;
                        }
                    }
                },
                yAxis: {
                    type: 'category',
                    data: this.data.productionPlans.map(p => this.getProductName(p.productId)),
                    inverse: true
                },
                series: [{
                    type: 'custom',
                    renderItem: (params, api) => {
                        const categoryIndex = api.value(0);
                        const start = api.coord([api.value(1), categoryIndex]);
                        const end = api.coord([api.value(2), categoryIndex]);
                        const height = 20;
                        
                        return {
                            type: 'rect',
                            shape: {
                                x: start[0],
                                y: start[1] - height / 2,
                                width: Math.max(end[0] - start[0], 1),
                                height: height
                            },
                            style: api.style({
                                fill: api.visual('color')
                            })
                        };
                    },
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: seriesData
                }]
            });
        },

        /**
         * 计算总生产能力
         * @returns {number} 总生产能力
         */
        calculateTotalCapacity() {
            // 从生产能力管理模块获取设备总产能
            if (this.data.equipment) {
                return this.data.equipment
                    .filter(e => e.status === '正常')
                    .reduce((total, equipment) => total + equipment.capacityPerDay, 0);
            }
            return 0;
        },

        /**
         * 打开生产完工入库模态框
         * @param {Object} plan - 生产计划对象
         */
        openCompletionModal(plan) {
            this.completionPlan = { ...plan };
            this.completionQuantity = plan.quantity;
            this.bomNotFound = false;
            const bom = this.data.boms?.find(b => b.productId === plan.productId);
            if (!bom) {
                this.bomNotFound = true;
            }
            new bootstrap.Modal(this.$refs.completionModal).show();
        },

        /**
         * 确认生产完工入库
         */
        confirmProductionCompletion() {
            if (!this.completionPlan || !this.completionQuantity || this.completionQuantity <= 0) {
                alert('请输入有效的入库数量');
                return;
            }

            const plan = this.completionPlan;
            const quantity = this.completionQuantity;
            const now = new Date().toISOString();

            const bom = this.data.boms?.find(b => b.productId === plan.productId);
            this.bomNotFound = !bom;

            if (bom && bom.items) {
                bom.items.forEach(bomItem => {
                    const material = this.data.inventory.materials.find(m => m.materialId === bomItem.materialId);
                    if (material) {
                        material.quantity -= bomItem.quantity * quantity;
                        if (material.quantity < 0) material.quantity = 0;
                    }
                });
            }

            let product = this.data.inventory.products.find(p => p.productId === plan.productId);
            if (product) {
                product.quantity += quantity;
            } else {
                this.data.inventory.products.push({
                    productId: plan.productId,
                    quantity: quantity
                });
            }

            const planIndex = this.data.productionPlans.findIndex(p => p.id === plan.id);
            if (planIndex !== -1) {
                this.data.productionPlans[planIndex].status = '已完成';
            }

            const materialFlows = [];
            if (bom && bom.items) {
                bom.items.forEach(bomItem => {
                    const material = this.data.materials?.find(m => m.id === bomItem.materialId);
                    materialFlows.push({
                        id: generateId(),
                        type: 'material_out',
                        materialId: bomItem.materialId,
                        materialName: material?.name || '未知物料',
                        quantity: bomItem.quantity * quantity,
                        date: now,
                        relatedPlanId: plan.id
                    });
                });
            }

            const productFlow = {
                id: generateId(),
                type: 'production_in',
                productId: plan.productId,
                productName: this.getProductName(plan.productId),
                quantity: quantity,
                date: now,
                relatedPlanId: plan.id
            };

            if (!this.data.inventoryFlows) {
                this.data.inventoryFlows = [];
            }
            this.data.inventoryFlows.push(...materialFlows, productFlow);

            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.completionModal).hide();
            alert('入库成功！');
            this.refreshData();
        }
    }
};
