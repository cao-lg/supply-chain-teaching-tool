/**
 * 库存管理模块
 * 包含物料和产品库存查询、库存预警功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 库存管理组件
 */
export default {
    name: 'InventoryModule',
    template: `
        <div>
            <h2 class="mb-4">库存管理</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'materials' }" @click="activeTab = 'materials'">物料库存</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">产品库存</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'analysis' }" @click="activeTab = 'analysis'">库存分析</a>
                </li>
            </ul>

            <!-- 物料库存 -->
            <div v-if="activeTab === 'materials'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>物料库存列表</h5>
                    <button class="btn btn-primary" @click="openInventoryAdjustModal('material')">调整库存</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>编码</th>
                                <th>物料名称</th>
                                <th>当前库存</th>
                                <th>安全库存</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in materialInventory" :key="item.materialId">
                                <td>{{ getMaterial(item.materialId)?.code }}</td>
                                <td>{{ getMaterial(item.materialId)?.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>
                                    <input type="number" class="form-control form-control-sm" style="width: 100px;" 
                                           v-model="item.safeStock" min="0" @change="updateInventory">
                                </td>
                                <td>
                                    <span class="badge" :class="item.quantity < item.safeStock ? 'bg-danger' : 'bg-success'">
                                        {{ item.quantity < item.safeStock ? '⚠️ 预警' : '✅ 正常' }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openInventoryAdjustModal('material', item)">调整</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 产品库存 -->
            <div v-if="activeTab === 'products'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>产品库存列表</h5>
                    <button class="btn btn-primary" @click="openInventoryAdjustModal('product')">调整库存</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>编码</th>
                                <th>产品名称</th>
                                <th>当前库存</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in productInventory" :key="item.productId">
                                <td>{{ getProduct(item.productId)?.code }}</td>
                                <td>{{ getProduct(item.productId)?.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openInventoryAdjustModal('product', item)">调整</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 库存分析 -->
            <div v-if="activeTab === 'analysis'">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">库存周转率分析</h5>
                        <div class="row mb-4">
                            <div class="col-md-4 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">物料周转率</h6>
                                        <p class="card-text fs-4">{{ materialTurnoverRate.toFixed(2) }} 次/年</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">产品周转率</h6>
                                        <p class="card-text fs-4">{{ productTurnoverRate.toFixed(2) }} 次/年</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">平均库存天数</h6>
                                        <p class="card-text fs-4">{{ averageInventoryDays.toFixed(0) }} 天</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="turnoverChart" class="chart-container" style="height: 400px;"></div>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">库存优化建议</h5>
                        <div class="list-group">
                            <div v-for="(suggestion, index) in inventorySuggestions" :key="index" class="list-group-item">
                                <h6 class="mb-1">{{ suggestion.title }}</h6>
                                <p class="mb-1">{{ suggestion.description }}</p>
                                <small class="text-muted">{{ suggestion.type }}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 库存调整模态框 -->
            <div class="modal fade" id="inventoryAdjustModal" tabindex="-1" ref="inventoryAdjustModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">调整库存</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveInventoryAdjust">
                                <div class="mb-3">
                                    <label class="form-label">{{ adjustType === 'material' ? '物料' : '产品' }}</label>
                                    <select class="form-select" v-model="adjustItemId" :disabled="!!adjustingItem" required>
                                        <option v-for="item in (adjustType === 'material' ? data.materials : data.products)" 
                                                :key="item.id" :value="item.id">
                                            {{ item.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">调整方式</label>
                                    <select class="form-select" v-model="adjustMethod">
                                        <option value="add">增加</option>
                                        <option value="subtract">减少</option>
                                        <option value="set">设置</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">数量</label>
                                    <input type="number" class="form-control" v-model="adjustQuantity" required min="1">
                                </div>
                                <div v-if="adjustingItem" class="alert alert-info">
                                    当前库存：{{ adjustingItem.quantity }}
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
            activeTab: 'materials',
            data: loadData(),
            adjustType: 'material',
            adjustItemId: '',
            adjustQuantity: 1,
            adjustMethod: 'add',
            adjustingItem: null
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
        activeTab(newTab) {
            this.refreshData();
            if (newTab === 'analysis') {
                setTimeout(() => this.initTurnoverChart(), 100);
            }
        }
    },
    computed: {
        materialInventory() {
            return this.data.inventory.materials || [];
        },
        productInventory() {
            return this.data.inventory.products || [];
        },
        /**
         * 物料周转率
         * @returns {number} 周转率
         */
        materialTurnoverRate() {
            // 基于生产计划计算物料消耗
            const productionPlans = this.data.productionPlans || [];
            const boms = this.data.boms || [];
            
            // 计算物料消耗总量
            let totalMaterialConsumption = 0;
            productionPlans.forEach(plan => {
                const bom = boms.find(b => b.productId === plan.productId);
                if (bom) {
                    bom.items.forEach(item => {
                        totalMaterialConsumption += item.quantity * plan.quantity;
                    });
                }
            });
            
            // 计算平均物料库存
            const averageMaterialInventory = this.materialInventory.reduce((total, item) => total + item.quantity, 0) / (this.materialInventory.length || 1);
            
            // 计算周转率（假设消耗数据为6个月，乘以2得到年度周转率）
            const annualConsumption = totalMaterialConsumption * 2;
            return averageMaterialInventory > 0 ? annualConsumption / averageMaterialInventory : 0;
        },
        
        /**
         * 产品周转率
         * @returns {number} 周转率
         */
        productTurnoverRate() {
            // 基于订单数据计算产品销售
            const orders = this.data.orders || [];
            const totalProductSales = orders.reduce((total, order) => total + (order.quantity || 0), 0);
            
            // 计算平均产品库存
            const averageProductInventory = this.productInventory.reduce((total, item) => total + item.quantity, 0) / (this.productInventory.length || 1);
            
            // 计算周转率（假设销售数据为6个月，乘以2得到年度周转率）
            const annualSales = totalProductSales * 2;
            return averageProductInventory > 0 ? annualSales / averageProductInventory : 0;
        },
        
        /**
         * 平均库存天数
         * @returns {number} 平均库存天数
         */
        averageInventoryDays() {
            const totalTurnover = this.materialTurnoverRate + this.productTurnoverRate;
            return totalTurnover > 0 ? 365 / (totalTurnover / 2) : 0;
        },
        
        /**
         * 库存优化建议
         * @returns {Array} 优化建议列表
         */
        inventorySuggestions() {
            const suggestions = [];
            
            // 检查物料库存预警
            this.materialInventory.forEach(item => {
                if (item.quantity < item.safeStock) {
                    suggestions.push({
                        title: `物料 ${this.getMaterial(item.materialId)?.name} 库存不足`,
                        description: `当前库存 ${item.quantity}，安全库存 ${item.safeStock}，建议及时补货`,
                        type: '预警'
                    });
                }
            });
            
            // 检查周转率
            if (this.materialTurnoverRate < 5) {
                suggestions.push({
                    title: '物料周转率偏低',
                    description: '物料周转率低于行业平均水平，建议优化采购计划和库存管理',
                    type: '优化建议'
                });
            }
            
            if (this.productTurnoverRate < 8) {
                suggestions.push({
                    title: '产品周转率偏低',
                    description: '产品周转率低于行业平均水平，建议加强销售和生产计划协调',
                    type: '优化建议'
                });
            }
            
            // 检查库存天数
            if (this.averageInventoryDays > 60) {
                suggestions.push({
                    title: '平均库存天数过长',
                    description: '平均库存天数超过60天，建议优化库存结构，减少滞销品库存',
                    type: '优化建议'
                });
            }
            
            return suggestions.length > 0 ? suggestions : [{
                title: '库存管理良好',
                description: '当前库存水平和周转率处于合理范围',
                type: '状态'
            }];
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
         * 获取产品信息
         * @param {string} id - 产品ID
         * @returns {Object} 产品对象
         */
        getProduct(id) {
            return this.data.products.find(p => p.id === id);
        },

        /**
         * 更新库存数据
         */
        updateInventory() {
            saveData(this.data);
        },

        /**
         * 打开库存调整模态框
         * @param {string} type - 类型：material/product
         * @param {Object} item - 要调整的库存项
         */
        openInventoryAdjustModal(type, item = null) {
            this.adjustType = type;
            this.adjustingItem = item;
            this.adjustItemId = item ? (type === 'material' ? item.materialId : item.productId) : '';
            this.adjustMethod = 'add';
            this.adjustQuantity = 1;
            new bootstrap.Modal(this.$refs.inventoryAdjustModal).show();
        },

        /**
         * 保存库存调整
         */
        saveInventoryAdjust() {
            const inventoryList = this.adjustType === 'material' 
                ? this.data.inventory.materials 
                : this.data.inventory.products;
            
            const idField = this.adjustType === 'material' ? 'materialId' : 'productId';
            
            let inventoryItem = inventoryList.find(i => i[idField] === this.adjustItemId);
            
            if (!inventoryItem) {
                inventoryItem = { [idField]: this.adjustItemId, quantity: 0 };
                if (this.adjustType === 'material') {
                    inventoryItem.safeStock = 0;
                }
                inventoryList.push(inventoryItem);
            }

            switch (this.adjustMethod) {
                case 'add':
                    inventoryItem.quantity += this.adjustQuantity;
                    break;
                case 'subtract':
                    inventoryItem.quantity = Math.max(0, inventoryItem.quantity - this.adjustQuantity);
                    break;
                case 'set':
                    inventoryItem.quantity = this.adjustQuantity;
                    break;
            }

            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.inventoryAdjustModal).hide();
        },

        /**
         * 初始化库存周转率图表
         */
        initTurnoverChart() {
            const chartDom = document.getElementById('turnoverChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            // 计算周转率和库存天数
            const materialTurnover = this.materialTurnoverRate;
            const productTurnover = this.productTurnoverRate;
            const averageTurnover = (materialTurnover + productTurnover) / 2;
            
            const materialDays = materialTurnover > 0 ? 365 / materialTurnover : 0;
            const productDays = productTurnover > 0 ? 365 / productTurnover : 0;
            const averageDays = this.averageInventoryDays;
            
            chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['周转率', '库存天数']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['物料', '产品', '平均']
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '周转率(次/年)',
                        position: 'left'
                    },
                    {
                        type: 'value',
                        name: '库存天数(天)',
                        position: 'right'
                    }
                ],
                series: [
                    {
                        name: '周转率',
                        type: 'bar',
                        data: [
                            materialTurnover,
                            productTurnover,
                            averageTurnover
                        ]
                    },
                    {
                        name: '库存天数',
                        type: 'line',
                        yAxisIndex: 1,
                        data: [
                            materialDays,
                            productDays,
                            averageDays
                        ]
                    }
                ]
            });
        }
    },

};
