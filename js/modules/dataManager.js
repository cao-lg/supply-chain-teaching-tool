/**
 * 数据管理模块
 * 包含数据导入/导出、示例数据加载、数据清空功能
 */

import { loadData, saveData, exportData, importData, loadSampleData, clearData } from '../store.js';

export default {
    name: 'DataManagerModule',
    template: `
        <div>
            <h2 class="mb-4">数据管理</h2>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">数据操作</h5>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" @click="handleExportData">
                                    <i class="bi bi-download"></i> 导出数据
                                </button>
                                <label class="btn btn-outline-primary">
                                    <i class="bi bi-upload"></i> 导入数据
                                    <input type="file" class="d-none" accept=".json" @change="handleImportData">
                                </label>
                                <button class="btn btn-success" @click="showLoadConfirm">
                                    <i class="bi bi-play-circle"></i> 加载示例数据
                                </button>
                                <button class="btn btn-danger" @click="showClearConfirm">
                                    <i class="bi bi-trash"></i> 清空数据
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">数据统计</h5>
                            <div v-if="data">
                                <ul class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        产品数量
                                        <span class="badge bg-primary rounded-pill">{{ data.products?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        物料数量
                                        <span class="badge bg-primary rounded-pill">{{ data.materials?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        供应商数量
                                        <span class="badge bg-primary rounded-pill">{{ data.suppliers?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        客户数量
                                        <span class="badge bg-primary rounded-pill">{{ data.customers?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        BOM数量
                                        <span class="badge bg-primary rounded-pill">{{ data.boms?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        订单数量
                                        <span class="badge bg-primary rounded-pill">{{ data.orders?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        生产计划数量
                                        <span class="badge bg-primary rounded-pill">{{ data.productionPlans?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        采购订单数量
                                        <span class="badge bg-primary rounded-pill">{{ data.purchaseOrders?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        库存流水
                                        <span class="badge bg-info rounded-pill">{{ data.inventoryTransactions?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        质量检验记录
                                        <span class="badge bg-info rounded-pill">{{ data.qualityInspections?.length || 0 }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        财务记录
                                        <span class="badge bg-info rounded-pill">{{ data.financialRecords?.length || 0 }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 成功提示 -->
            <div v-if="message" class="alert alert-success alert-dismissible fade show" role="alert">
                {{ message }}
                <button type="button" class="btn-close" @click="message = ''"></button>
            </div>

            <!-- 确认模态框 -->
            <div class="modal fade" id="confirmModal" tabindex="-1" ref="confirmModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header" :class="confirmType === 'clear' ? 'bg-danger text-white' : 'bg-warning'">
                            <h5 class="modal-title">
                                <i :class="confirmType === 'clear' ? 'bi bi-exclamation-triangle' : 'bi bi-info-circle'"></i>
                                {{ confirmType === 'clear' ? '警告' : '确认' }}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0">{{ confirmMessage }}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" 
                                    class="btn" 
                                    :class="confirmType === 'clear' ? 'btn-danger' : 'btn-primary'"
                                    @click="confirmAction">
                                确定执行
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            data: loadData(),
            message: '',
            confirmType: '',
            confirmMessage: '',
            modalInstance: null
        };
    },
    mounted() {
        this.$nextTick(() => {
            const modalEl = document.getElementById('confirmModal');
            if (modalEl) {
                this.modalInstance = new bootstrap.Modal(modalEl);
            }
        });
    },
    methods: {
        handleExportData() {
            exportData(this.data);
            this.message = '数据导出成功！';
            setTimeout(() => this.message = '', 3000);
        },

        async handleImportData(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const importedData = await importData(file);
                this.data = importedData;
                saveData(this.data);
                this.message = '数据导入成功！';
                setTimeout(() => this.message = '', 3000);
            } catch (error) {
                alert(error.message);
            }
            
            event.target.value = '';
        },

        showLoadConfirm() {
            this.confirmType = 'load';
            this.confirmMessage = '加载示例数据将覆盖当前数据，确定继续吗？';
            this.modalInstance.show();
        },

        showClearConfirm() {
            this.confirmType = 'clear';
            this.confirmMessage = '确定要清空所有数据吗？此操作不可恢复！';
            this.modalInstance.show();
        },

        confirmAction() {
            this.modalInstance.hide();
            
            if (this.confirmType === 'load') {
                this.data = loadSampleData();
                this.$forceUpdate();
                this.message = '示例数据加载成功！';
                setTimeout(() => this.message = '', 3000);
                window.dispatchEvent(new CustomEvent('data-updated'));
            } else if (this.confirmType === 'clear') {
                clearData();
                this.data = loadData();
                this.message = '数据已清空！';
                setTimeout(() => this.message = '', 3000);
            }
            
            this.confirmType = '';
        },

        handleLoadSampleData() {
            this.showLoadConfirm();
        },

        handleClearData() {
            this.showClearConfirm();
        }
    }
};