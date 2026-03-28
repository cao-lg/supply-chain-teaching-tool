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
            adjustMethod: 'add',
            adjustQuantity: 1,
            adjustingItem: null
        };
    },
    computed: {
        materialInventory() {
            return this.data.inventory.materials || [];
        },
        productInventory() {
            return this.data.inventory.products || [];
        }
    },
    methods: {
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
        }
    }
};
