/**
 * 数据管理模块
 * 包含数据导入/导出、示例数据加载、数据清空功能
 */

import { loadData, saveData, exportData, importData, loadSampleData, clearData } from '../store.js';

/**
 * 数据管理组件
 */
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
                                <button class="btn btn-success" @click="handleLoadSampleData">
                                    <i class="bi bi-play-circle"></i> 加载示例数据
                                </button>
                                <button class="btn btn-danger" @click="handleClearData">
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
                                        <span class="badge bg-primary rounded-pill">{{ data.products.length }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        物料数量
                                        <span class="badge bg-primary rounded-pill">{{ data.materials.length }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        供应商数量
                                        <span class="badge bg-primary rounded-pill">{{ data.suppliers.length }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        BOM数量
                                        <span class="badge bg-primary rounded-pill">{{ data.boms.length }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        订单数量
                                        <span class="badge bg-primary rounded-pill">{{ data.orders.length }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        生产计划数量
                                        <span class="badge bg-primary rounded-pill">{{ data.productionPlans.length }}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        采购订单数量
                                        <span class="badge bg-primary rounded-pill">{{ data.purchaseOrders.length }}</span>
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
        </div>
    `,
    data() {
        return {
            data: loadData(),
            message: ''
        };
    },
    methods: {
        /**
         * 导出数据
         */
        handleExportData() {
            exportData(this.data);
            this.message = '数据导出成功！';
            setTimeout(() => this.message = '', 3000);
        },

        /**
         * 导入数据
         * @param {Event} event - 文件选择事件
         */
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

        /**
         * 加载示例数据
         */
        handleLoadSampleData() {
            if (confirm('加载示例数据将覆盖当前数据，确定继续吗？')) {
                this.data = loadSampleData();
                this.$forceUpdate();
                this.message = '示例数据加载成功！';
                setTimeout(() => this.message = '', 3000);
            }
        },

        /**
         * 清空数据
         */
        handleClearData() {
            if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
                clearData();
                this.data = loadData();
                this.message = '数据已清空！';
                setTimeout(() => this.message = '', 3000);
            }
        }
    }
};
