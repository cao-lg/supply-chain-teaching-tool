/**
 * 采购计划模块
 * 包含采购需求计算、采购订单管理功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 采购计划组件
 */
export default {
    name: 'PurchasePlanModule',
    template: `
        <div>
            <h2 class="mb-4">采购计划</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'requirements' }" @click="activeTab = 'requirements'">采购需求</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">采购订单</a>
                </li>
            </ul>

            <!-- 采购需求 -->
            <div v-if="activeTab === 'requirements'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>采购需求列表</h5>
                    <button class="btn btn-primary" @click="calculateRequirements">计算采购需求</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>物料编码</th>
                                <th>物料名称</th>
                                <th>需求数量</th>
                                <th>当前库存</th>
                                <th>需采购数量</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in purchaseRequirements" :key="item.materialId">
                                <td>{{ getMaterial(item.materialId)?.code }}</td>
                                <td>{{ getMaterial(item.materialId)?.name }}</td>
                                <td>{{ item.requiredQty }}</td>
                                <td>{{ item.currentStock }}</td>
                                <td :class="{'text-danger fw-bold': item.needPurchaseQty > 0}">{{ item.needPurchaseQty }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="addToPurchaseOrder(item)" 
                                            v-if="item.needPurchaseQty > 0">
                                        加入采购单
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 采购订单 -->
            <div v-if="activeTab === 'orders'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>采购订单列表</h5>
                    <button class="btn btn-primary" @click="openPurchaseOrderModal()">添加采购订单</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>订单编号</th>
                                <th>供应商</th>
                                <th>物料清单</th>
                                <th>总金额</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.purchaseOrders" :key="item.id">
                                <td>{{ item.orderNo }}</td>
                                <td>{{ getSupplierName(item.supplierId) }}</td>
                                <td>
                                    <ul class="list-unstyled mb-0">
                                        <li v-for="poItem in item.items" :key="poItem.materialId">
                                            {{ getMaterial(poItem.materialId)?.name }} x {{ poItem.quantity }}
                                        </li>
                                    </ul>
                                </td>
                                <td>¥{{ calculateOrderTotal(item) }}</td>
                                <td>
                                    <span class="badge" :class="getStatusBadgeClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openPurchaseOrderModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deletePurchaseOrder(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 采购订单模态框 -->
            <div class="modal fade" id="purchaseOrderModal" tabindex="-1" ref="purchaseOrderModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingPurchaseOrder.id ? '编辑采购订单' : '添加采购订单' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="savePurchaseOrder">
                                <div class="mb-3">
                                    <label class="form-label">订单编号</label>
                                    <input type="text" class="form-control" v-model="editingPurchaseOrder.orderNo" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">供应商</label>
                                    <select class="form-select" v-model="editingPurchaseOrder.supplierId" required>
                                        <option v-for="supplier in data.suppliers" :key="supplier.id" :value="supplier.id">
                                            {{ supplier.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">物料清单</label>
                                    <div v-for="(item, index) in editingPurchaseOrder.items" :key="index" class="row mb-2">
                                        <div class="col-4">
                                            <select class="form-select" v-model="item.materialId" required>
                                                <option v-for="material in data.materials" :key="material.id" :value="material.id">
                                                    {{ material.name }}
                                                </option>
                                            </select>
                                        </div>
                                        <div class="col-3">
                                            <input type="number" class="form-control" v-model="item.quantity" placeholder="数量" required min="1">
                                        </div>
                                        <div class="col-3">
                                            <input type="number" class="form-control" v-model="item.price" placeholder="单价" required min="0" step="0.01">
                                        </div>
                                        <div class="col-2">
                                            <button type="button" class="btn btn-outline-danger" @click="removePurchaseItem(index)">删除</button>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-outline-primary" @click="addPurchaseItem">添加物料</button>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">订单日期</label>
                                    <input type="date" class="form-control" v-model="editingPurchaseOrder.orderDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">预计到货日期</label>
                                    <input type="date" class="form-control" v-model="editingPurchaseOrder.expectedDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingPurchaseOrder.status">
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
            activeTab: 'requirements',
            data: loadData(),
            purchaseRequirements: [],
            editingPurchaseOrder: {}
        };
    },
    mounted() {
        // 监听数据更新事件
        window.addEventListener('data-updated', this.refreshData);
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
         * 获取物料信息
         * @param {string} id - 物料ID
         * @returns {Object} 物料对象
         */
        getMaterial(id) {
            return this.data.materials.find(m => m.id === id);
        },

        /**
         * 获取供应商名称
         * @param {string} id - 供应商ID
         * @returns {string} 供应商名称
         */
        getSupplierName(id) {
            const supplier = this.data.suppliers.find(s => s.id === id);
            return supplier ? supplier.name : '未知供应商';
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
         * 计算采购需求
         */
        calculateRequirements() {
            const requirements = {};

            // 遍历生产计划，计算物料需求
            this.data.productionPlans.forEach(plan => {
                const bom = this.data.boms.find(b => b.productId === plan.productId);
                if (bom) {
                    bom.items.forEach(bomItem => {
                        if (!requirements[bomItem.materialId]) {
                            requirements[bomItem.materialId] = {
                                materialId: bomItem.materialId,
                                requiredQty: 0,
                                currentStock: 0
                            };
                        }
                        requirements[bomItem.materialId].requiredQty += bomItem.quantity * plan.quantity;
                    });
                }
            });

            // 获取当前库存
            Object.keys(requirements).forEach(materialId => {
                const inventoryItem = this.data.inventory.materials.find(i => i.materialId === materialId);
                requirements[materialId].currentStock = inventoryItem ? inventoryItem.quantity : 0;
                requirements[materialId].needPurchaseQty = Math.max(0, requirements[materialId].requiredQty - requirements[materialId].currentStock);
            });

            this.purchaseRequirements = Object.values(requirements);
        },

        /**
         * 添加到采购订单
         * @param {Object} requirement - 采购需求项
         */
        addToPurchaseOrder(requirement) {
            const material = this.getMaterial(requirement.materialId);
            this.openPurchaseOrderModal(null, [{
                materialId: requirement.materialId,
                quantity: requirement.needPurchaseQty,
                price: material ? material.price : 0
            }]);
        },

        /**
         * 打开采购订单模态框
         * @param {Object} order - 采购订单对象
         * @param {Array} prefilledItems - 预填的物料项
         */
        openPurchaseOrderModal(order = null, prefilledItems = []) {
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            this.editingPurchaseOrder = order ? { ...order, items: [...order.items] } : {
                orderNo: '',
                supplierId: '',
                items: prefilledItems.length > 0 ? prefilledItems : [{ materialId: '', quantity: 1, price: 0 }],
                orderDate: today,
                expectedDate: nextWeek.toISOString().split('T')[0],
                status: '待处理'
            };
            new bootstrap.Modal(this.$refs.purchaseOrderModal).show();
        },

        /**
         * 添加采购物料项
         */
        addPurchaseItem() {
            this.editingPurchaseOrder.items.push({ materialId: '', quantity: 1, price: 0 });
        },

        /**
         * 删除采购物料项
         * @param {number} index - 索引
         */
        removePurchaseItem(index) {
            this.editingPurchaseOrder.items.splice(index, 1);
        },

        /**
         * 保存采购订单
         */
        savePurchaseOrder() {
            if (this.editingPurchaseOrder.id) {
                const index = this.data.purchaseOrders.findIndex(o => o.id === this.editingPurchaseOrder.id);
                if (index !== -1) this.data.purchaseOrders[index] = { ...this.editingPurchaseOrder };
            } else {
                this.data.purchaseOrders.push({ ...this.editingPurchaseOrder, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.purchaseOrderModal).hide();
        },

        /**
         * 删除采购订单
         * @param {string} id - 采购订单ID
         */
        deletePurchaseOrder(id) {
            if (confirm('确定要删除这个采购订单吗？')) {
                this.data.purchaseOrders = this.data.purchaseOrders.filter(o => o.id !== id);
                saveData(this.data);
            }
        },

        /**
         * 计算采购订单总金额
         * @param {Object} order - 采购订单
         * @returns {number} 总金额
         */
        calculateOrderTotal(order) {
            return order.items.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2);
        }
    }
};
