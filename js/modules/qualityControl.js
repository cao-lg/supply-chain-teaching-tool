/**
 * 质量检验管理模块
 * 包含IQC来料检验、OQC成品检验和检验记录查询功能
 */

import { loadData, saveData, generateId } from '../store.js';

export default {
    name: 'QualityControlModule',
    template: `
        <div>
            <h2 class="mb-4">质量检验管理</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'iqc' }" @click="activeTab = 'iqc'">IQC来料检验</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'oqc' }" @click="activeTab = 'oqc'">OQC成品检验</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'records' }" @click="activeTab = 'records'">检验记录查询</a>
                </li>
            </ul>

            <!-- IQC来料检验 -->
            <div v-if="activeTab === 'iqc'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>待检验采购入库单</h5>
                    <button class="btn btn-sm btn-outline-secondary" @click="refreshData">刷新</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>检验单号</th>
                                <th>物料名称</th>
                                <th>供应商</th>
                                <th>待检数量</th>
                                <th>创建日期</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in pendingIQCList" :key="item.id">
                                <td>{{ item.inspectionNo }}</td>
                                <td>{{ getMaterialName(item.materialId) }}</td>
                                <td>{{ getSupplierName(item.supplierId) }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.createDate }}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" @click="startInspection(item, 'IQC')">开始检验</button>
                                </td>
                            </tr>
                            <tr v-if="pendingIQCList.length === 0">
                                <td colspan="6" class="text-center text-muted">暂无待检验记录</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- OQC成品检验 -->
            <div v-if="activeTab === 'oqc'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>待检验生产入库单</h5>
                    <button class="btn btn-sm btn-outline-secondary" @click="refreshData">刷新</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>检验单号</th>
                                <th>产品名称</th>
                                <th>待检数量</th>
                                <th>创建日期</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in pendingOQCList" :key="item.id">
                                <td>{{ item.inspectionNo }}</td>
                                <td>{{ getProductName(item.productId) }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.createDate }}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" @click="startInspection(item, 'OQC')">开始检验</button>
                                </td>
                            </tr>
                            <tr v-if="pendingOQCList.length === 0">
                                <td colspan="5" class="text-center text-muted">暂无待检验记录</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 检验记录查询 -->
            <div v-if="activeTab === 'records'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>检验记录</h5>
                    <div class="d-flex gap-2">
                        <select class="form-select form-select-sm" style="width: 120px;" v-model="filterType">
                            <option value="">全部类型</option>
                            <option value="IQC">IQC</option>
                            <option value="OQC">OQC</option>
                        </select>
                        <input type="date" class="form-control form-control-sm" style="width: 150px;" v-model="filterStartDate" placeholder="开始日期">
                        <input type="date" class="form-control form-control-sm" style="width: 150px;" v-model="filterEndDate" placeholder="结束日期">
                        <button class="btn btn-sm btn-outline-secondary" @click="clearFilters">清除筛选</button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>检验单号</th>
                                <th>类型</th>
                                <th>物料/产品</th>
                                <th>供应商</th>
                                <th>送检数量</th>
                                <th>合格数量</th>
                                <th>不合格数量</th>
                                <th>结果</th>
                                <th>处理方式</th>
                                <th>检验人</th>
                                <th>检验日期</th>
                                <th>备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="record in filteredInspectionRecords" :key="record.id">
                                <td>{{ record.inspectionNo }}</td>
                                <td>
                                    <span class="badge" :class="record.type === 'IQC' ? 'bg-info' : 'bg-warning'">
                                        {{ record.type }}
                                    </span>
                                </td>
                                <td>{{ record.type === 'IQC' ? getMaterialName(record.materialId) : getProductName(record.productId) }}</td>
                                <td>{{ record.type === 'IQC' ? getSupplierName(record.supplierId) : '-' }}</td>
                                <td>{{ record.quantity }}</td>
                                <td>{{ record.qualifiedQty }}</td>
                                <td>{{ record.defectiveQty }}</td>
                                <td>
                                    <span class="badge" :class="record.result === 'pass' ? 'bg-success' : 'bg-danger'">
                                        {{ record.result === 'pass' ? '合格' : '不合格' }}
                                    </span>
                                </td>
                                <td>
                                    <span v-if="record.disposition">{{ dispositionText(record.disposition) }}</span>
                                    <span v-else>-</span>
                                </td>
                                <td>{{ record.inspector }}</td>
                                <td>{{ record.inspectionDate }}</td>
                                <td>{{ record.remark || '-' }}</td>
                            </tr>
                            <tr v-if="filteredInspectionRecords.length === 0">
                                <td colspan="12" class="text-center text-muted">暂无检验记录</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 检验模态框 -->
            <div class="modal fade" id="inspectionModal" tabindex="-1" ref="inspectionModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ currentInspection.type === 'IQC' ? 'IQC来料检验' : 'OQC成品检验' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <strong>检验单号：</strong>{{ currentInspection.inspectionNo }}<br>
                                <strong>{{ currentInspection.type === 'IQC' ? '物料' : '产品' }}：</strong>
                                {{ currentInspection.type === 'IQC' ? getMaterialName(currentInspection.materialId) : getProductName(currentInspection.productId) }}
                                <br>
                                <strong>供应商：</strong>{{ currentInspection.type === 'IQC' ? getSupplierName(currentInspection.supplierId) : '-' }}<br>
                                <strong>送检数量：</strong>{{ currentInspection.quantity }}
                            </div>
                            
                            <form @submit.prevent="saveInspection">
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <label class="form-label">合格数量</label>
                                        <input type="number" class="form-control" v-model.number="inspectionForm.qualifiedQty" 
                                               min="0" :max="currentInspection.quantity" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">不合格数量</label>
                                        <input type="number" class="form-control" v-model.number="inspectionForm.defectiveQty" 
                                               min="0" :max="currentInspection.quantity" required>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">检验结论</label>
                                    <div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" value="pass" 
                                                   v-model="inspectionForm.result" id="resultPass">
                                            <label class="form-check-label" for="resultPass">合格</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" value="fail" 
                                                   v-model="inspectionForm.result" id="resultFail">
                                            <label class="form-check-label" for="resultFail">不合格</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3" v-if="inspectionForm.result === 'fail' || inspectionForm.defectiveQty > 0">
                                    <label class="form-label">不合格处理方式</label>
                                    <select class="form-select" v-model="inspectionForm.disposition" required>
                                        <option value="">请选择</option>
                                        <option value="return">退货</option>
                                        <option value="accept">让步接收</option>
                                        <option value="scrap">报废</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">检验人</label>
                                    <input type="text" class="form-control" v-model="inspectionForm.inspector" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">备注</label>
                                    <textarea class="form-control" v-model="inspectionForm.remark" rows="2"></textarea>
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
            activeTab: 'iqc',
            data: loadData(),
            filterType: '',
            filterStartDate: '',
            filterEndDate: '',
            currentInspection: {
                type: 'IQC',
                inspectionNo: '',
                materialId: '',
                productId: '',
                supplierId: '',
                quantity: 0
            },
            inspectionForm: {
                qualifiedQty: 0,
                defectiveQty: 0,
                result: 'pass',
                disposition: '',
                inspector: '',
                remark: ''
            },
            pendingInspections: []
        };
    },
    mounted() {
        window.addEventListener('data-updated', this.refreshData);
        this.loadPendingInspections();
    },
    beforeUnmount() {
        window.removeEventListener('data-updated', this.refreshData);
    },
    computed: {
        pendingIQCList() {
            return this.pendingInspections.filter(item => item.type === 'IQC');
        },
        pendingOQCList() {
            return this.pendingInspections.filter(item => item.type === 'OQC');
        },
        filteredInspectionRecords() {
            let records = this.data.qualityInspections || [];
            
            if (this.filterType) {
                records = records.filter(r => r.type === this.filterType);
            }
            
            if (this.filterStartDate) {
                records = records.filter(r => r.inspectionDate >= this.filterStartDate);
            }
            
            if (this.filterEndDate) {
                records = records.filter(r => r.inspectionDate <= this.filterEndDate);
            }
            
            return records.sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate));
        }
    },
    methods: {
        /**
         * 刷新数据
         */
        refreshData() {
            this.data = loadData();
            this.loadPendingInspections();
        },
        
        /**
         * 加载待检验列表
         */
        loadPendingInspections() {
            const purchaseOrders = this.data.purchaseOrders || [];
            const productionPlans = this.data.productionPlans || [];
            const completedIds = (this.data.qualityInspections || [])
                .filter(qi => qi.sourceType === 'purchase')
                .map(qi => qi.sourceId);
            
            this.pendingInspections = [];
            
            purchaseOrders.forEach(po => {
                if (po.status === 'inbound' && !completedIds.includes(po.id)) {
                    const material = this.data.materials.find(m => m.id === po.materialId);
                    const supplier = this.data.suppliers.find(s => s.id === po.supplierId);
                    this.pendingInspections.push({
                        id: generateId(),
                        type: 'IQC',
                        inspectionNo: 'IQC-' + new Date().getFullYear() + '-' + po.id,
                        sourceType: 'purchase',
                        sourceId: po.id,
                        materialId: po.materialId,
                        supplierId: po.supplierId,
                        quantity: po.quantity,
                        createDate: po.deliveryDate || po.orderDate,
                        status: 'pending'
                    });
                }
            });
            
            const oqcCompletedIds = (this.data.qualityInspections || [])
                .filter(qi => qi.sourceType === 'production')
                .map(qi => qi.sourceId);
            
            productionPlans.forEach(pp => {
                if (pp.status === 'completed' && !oqcCompletedIds.includes(pp.id)) {
                    const product = this.data.products.find(p => p.id === pp.productId);
                    this.pendingInspections.push({
                        id: generateId(),
                        type: 'OQC',
                        inspectionNo: 'OQC-' + new Date().getFullYear() + '-' + pp.id,
                        sourceType: 'production',
                        sourceId: pp.id,
                        productId: pp.productId,
                        quantity: pp.quantity,
                        createDate: pp.completionDate || pp.endDate,
                        status: 'pending'
                    });
                }
            });
        },
        
        /**
         * 获取物料名称
         * @param {string} id - 物料ID
         * @returns {string} 物料名称
         */
        getMaterialName(id) {
            const material = this.data.materials.find(m => m.id === id);
            return material ? material.name : id;
        },
        
        /**
         * 获取产品名称
         * @param {string} id - 产品ID
         * @returns {string} 产品名称
         */
        getProductName(id) {
            const product = this.data.products.find(p => p.id === id);
            return product ? product.name : id;
        },
        
        /**
         * 获取供应商名称
         * @param {string} id - 供应商ID
         * @returns {string} 供应商名称
         */
        getSupplierName(id) {
            const supplier = this.data.suppliers.find(s => s.id === id);
            return supplier ? supplier.name : id;
        },
        
        /**
         * 处理方式文本
         * @param {string} disposition - 处理方式代码
         * @returns {string} 处理方式文本
         */
        dispositionText(disposition) {
            const map = {
                'return': '退货',
                'accept': '让步接收',
                'scrap': '报废'
            };
            return map[disposition] || disposition;
        },
        
        /**
         * 开始检验
         * @param {Object} item - 检验项
         * @param {string} type - 检验类型
         */
        startInspection(item, type) {
            this.currentInspection = { ...item, type };
            this.inspectionForm = {
                qualifiedQty: item.quantity,
                defectiveQty: 0,
                result: 'pass',
                disposition: '',
                inspector: '',
                remark: ''
            };
            new bootstrap.Modal(this.$refs.inspectionModal).show();
        },
        
        /**
         * 保存检验结果
         */
        saveInspection() {
            const inspection = {
                id: generateId(),
                inspectionNo: this.currentInspection.inspectionNo,
                type: this.currentInspection.type,
                sourceType: this.currentInspection.sourceType,
                sourceId: this.currentInspection.sourceId,
                materialId: this.currentInspection.materialId,
                productId: this.currentInspection.productId,
                supplierId: this.currentInspection.supplierId,
                quantity: this.currentInspection.quantity,
                qualifiedQty: this.inspectionForm.qualifiedQty,
                defectiveQty: this.inspectionForm.defectiveQty,
                result: this.inspectionForm.result,
                disposition: this.inspectionForm.disposition || null,
                inspector: this.inspectionForm.inspector,
                inspectionDate: new Date().toISOString().split('T')[0],
                status: 'completed',
                remark: this.inspectionForm.remark
            };
            
            if (!this.data.qualityInspections) {
                this.data.qualityInspections = [];
            }
            this.data.qualityInspections.push(inspection);
            
            if (inspection.result === 'pass' || inspection.disposition === 'accept') {
                this.updateInventoryForPass(inspection);
            }
            
            saveData(this.data);
            
            bootstrap.Modal.getInstance(this.$refs.inspectionModal).hide();
            this.loadPendingInspections();
            
            window.dispatchEvent(new CustomEvent('data-updated'));
        },
        
        /**
         * 检验合格或让步接收时更新库存
         * @param {Object} inspection - 检验记录
         */
        updateInventoryForPass(inspection) {
            const qty = inspection.disposition === 'accept' 
                ? inspection.qualifiedQty 
                : inspection.qualifiedQty;
            
            if (inspection.type === 'IQC') {
                const materialInventory = this.data.inventory.materials;
                let item = materialInventory.find(i => i.materialId === inspection.materialId);
                
                if (item) {
                    item.quantity += qty;
                } else {
                    materialInventory.push({
                        materialId: inspection.materialId,
                        quantity: qty,
                        safeStock: 0
                    });
                }
                
                this.data.inventoryTransactions.push({
                    id: generateId(),
                    type: 'qc_in',
                    materialId: inspection.materialId,
                    productId: null,
                    quantity: qty,
                    referenceDoc: inspection.inspectionNo,
                    date: inspection.inspectionDate,
                    remark: inspection.type === 'IQC' ? 'IQC检验入库' : 'OQC检验入库'
                });
            } else {
                const productInventory = this.data.inventory.products;
                let item = productInventory.find(i => i.productId === inspection.productId);
                
                if (item) {
                    item.quantity += qty;
                } else {
                    productInventory.push({
                        productId: inspection.productId,
                        quantity: qty
                    });
                }
                
                this.data.inventoryTransactions.push({
                    id: generateId(),
                    type: 'qc_in',
                    materialId: null,
                    productId: inspection.productId,
                    quantity: qty,
                    referenceDoc: inspection.inspectionNo,
                    date: inspection.inspectionDate,
                    remark: 'OQC检验入库'
                });
            }
        },
        
        /**
         * 清除筛选条件
         */
        clearFilters() {
            this.filterType = '';
            this.filterStartDate = '';
            this.filterEndDate = '';
        }
    }
};
