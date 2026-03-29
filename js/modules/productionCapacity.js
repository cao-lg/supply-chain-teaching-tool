/**
 * 生产能力管理模块
 * 包含设备管理、工人管理、工时管理和生产能力评估功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 生产能力管理组件
 */
export default {
    name: 'ProductionCapacityModule',
    template: `
        <div>
            <h2 class="mb-4">生产能力管理</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'equipment' }" @click="activeTab = 'equipment'">设备管理</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'workers' }" @click="activeTab = 'workers'">工人管理</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'workhours' }" @click="activeTab = 'workhours'">工时管理</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'assessment' }" @click="activeTab = 'assessment'">能力评估</a>
                </li>
            </ul>

            <!-- 设备管理 -->
            <div v-if="activeTab === 'equipment'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>设备列表</h5>
                    <button class="btn btn-primary" @click="openEquipmentModal()">添加设备</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>设备编号</th>
                                <th>设备名称</th>
                                <th>设备类型</th>
                                <th>产能(单位/天)</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.equipment" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ getEquipmentTypeName(item.typeId) }}</td>
                                <td>{{ item.capacityPerDay }}</td>
                                <td>
                                    <span class="badge" :class="item.status === '正常' ? 'bg-success' : 'bg-warning'">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openEquipmentModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteEquipment(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 工人管理 -->
            <div v-if="activeTab === 'workers'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>工人列表</h5>
                    <button class="btn btn-primary" @click="openWorkerModal()">添加工人</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>工号</th>
                                <th>姓名</th>
                                <th>工种</th>
                                <th>工作效率</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.workers" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ getWorkerTypeName(item.typeId) }}</td>
                                <td>{{ item.efficiency }}%</td>
                                <td>
                                    <span class="badge" :class="item.status === '在职' ? 'bg-success' : 'bg-secondary'">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openWorkerModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteWorker(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 工时管理 -->
            <div v-if="activeTab === 'workhours'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>工时设置</h5>
                    <button class="btn btn-primary" @click="openWorkhourModal()">添加工时设置</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>名称</th>
                                <th>每天工作小时</th>
                                <th>每周工作日</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.workhours" :key="item.id">
                                <td>{{ item.name }}</td>
                                <td>{{ item.hoursPerDay }}小时</td>
                                <td>{{ item.daysPerWeek }}天</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openWorkhourModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteWorkhour(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 生产能力评估 -->
            <div v-if="activeTab === 'assessment'">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">生产能力评估</h5>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">设备总产能</h6>
                                        <p class="card-text fs-4">{{ totalEquipmentCapacity }} 单位/天</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">工人总效率</h6>
                                        <p class="card-text fs-4">{{ totalWorkerEfficiency }}%</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">可用工时</h6>
                                        <p class="card-text fs-4">{{ availableWorkhours }} 小时/周</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h6>生产能力分析</h6>
                            <div id="capacityChart" class="chart-container" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 设备模态框 -->
            <div class="modal fade" id="equipmentModal" tabindex="-1" ref="equipmentModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingEquipment.id ? '编辑设备' : '添加设备' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveEquipment">
                                <div class="mb-3">
                                    <label class="form-label">设备编号</label>
                                    <input type="text" class="form-control" v-model="editingEquipment.code" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">设备名称</label>
                                    <input type="text" class="form-control" v-model="editingEquipment.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">设备类型</label>
                                    <input type="text" class="form-control" v-model="editingEquipment.type" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">产能(单位/天)</label>
                                    <input type="number" class="form-control" v-model="editingEquipment.capacityPerDay" required min="0">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingEquipment.status">
                                        <option value="正常">正常</option>
                                        <option value="故障">故障</option>
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

            <!-- 工人模态框 -->
            <div class="modal fade" id="workerModal" tabindex="-1" ref="workerModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingWorker.id ? '编辑工人' : '添加工人' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveWorker">
                                <div class="mb-3">
                                    <label class="form-label">工号</label>
                                    <input type="text" class="form-control" v-model="editingWorker.code" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">姓名</label>
                                    <input type="text" class="form-control" v-model="editingWorker.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">工种</label>
                                    <input type="text" class="form-control" v-model="editingWorker.type" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">工作效率</label>
                                    <input type="number" class="form-control" v-model="editingWorker.efficiency" required min="0" max="100">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingWorker.status">
                                        <option value="在职">在职</option>
                                        <option value="离职">离职</option>
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

            <!-- 工时模态框 -->
            <div class="modal fade" id="workhourModal" tabindex="-1" ref="workhourModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingWorkhour.id ? '编辑工时设置' : '添加工时设置' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveWorkhour">
                                <div class="mb-3">
                                    <label class="form-label">名称</label>
                                    <input type="text" class="form-control" v-model="editingWorkhour.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">每天工作小时</label>
                                    <input type="number" class="form-control" v-model="editingWorkhour.hoursPerDay" required min="1" max="24">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">每周工作日</label>
                                    <input type="number" class="form-control" v-model="editingWorkhour.daysPerWeek" required min="1" max="7">
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
            activeTab: 'equipment',
            data: loadData(),
            editingEquipment: {},
            editingWorker: {},
            editingWorkhour: {}
        };
    },
    watch: {
        // 当组件激活时刷新数据
        activeTab() {
            this.refreshData();
        }
    },
    computed: {
        /**
         * 计算设备总产能
         * @returns {number} 总产能
         */
        totalEquipmentCapacity() {
            return this.data.equipment
                .filter(e => e.status === '正常')
                .reduce((total, equipment) => total + equipment.capacityPerDay, 0);
        },

        /**
         * 计算工人总效率
         * @returns {number} 总效率
         */
        totalWorkerEfficiency() {
            const workers = this.data.workers.filter(w => w.status === '在职');
            if (workers.length === 0) return 0;
            const totalEfficiency = workers.reduce((total, worker) => total + worker.efficiency, 0);
            return Math.round(totalEfficiency / workers.length);
        },

        /**
         * 计算可用工时
         * @returns {number} 可用工时
         */
        availableWorkhours() {
            if (this.data.workhours.length === 0) return 0;
            const workhourSetting = this.data.workhours[0];
            const activeWorkers = this.data.workers.filter(w => w.status === '在职').length;
            return workhourSetting.hoursPerDay * workhourSetting.daysPerWeek * activeWorkers;
        }
    },
    methods: {
        /**
         * 获取设备类型名称
         */
        getEquipmentTypeName(typeId) {
            const type = this.data.equipmentTypes?.find(t => t.id === typeId);
            return type ? type.name : typeId || '-';
        },
        
        /**
         * 获取工人类型名称
         */
        getWorkerTypeName(typeId) {
            const type = this.data.workerTypes?.find(t => t.id === typeId);
            return type ? type.name : typeId || '-';
        },
        
        /**
         * 刷新数据
         */
        refreshData() {
            this.data = loadData();
        },
        // 设备管理
        openEquipmentModal(equipment = null) {
            this.editingEquipment = equipment ? { ...equipment } : { code: '', name: '', type: '', capacityPerDay: 0, status: '正常' };
            new bootstrap.Modal(this.$refs.equipmentModal).show();
        },
        saveEquipment() {
            if (this.editingEquipment.id) {
                const index = this.data.equipment.findIndex(e => e.id === this.editingEquipment.id);
                if (index !== -1) this.data.equipment[index] = { ...this.editingEquipment };
            } else {
                this.data.equipment.push({ ...this.editingEquipment, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.equipmentModal).hide();
        },
        deleteEquipment: async function(id) {
            if (await window.confirmAction('确定要删除这个设备吗？此操作不可撤销。')) {
                this.data.equipment = this.data.equipment.filter(e => e.id !== id);
                saveData(this.data);
                window.showToast('success', '删除成功', '设备已删除');
            }
        },

        // 工人管理
        openWorkerModal(worker = null) {
            this.editingWorker = worker ? { ...worker } : { code: '', name: '', type: '', efficiency: 100, status: '在职' };
            new bootstrap.Modal(this.$refs.workerModal).show();
        },
        saveWorker() {
            if (this.editingWorker.id) {
                const index = this.data.workers.findIndex(w => w.id === this.editingWorker.id);
                if (index !== -1) this.data.workers[index] = { ...this.editingWorker };
            } else {
                this.data.workers.push({ ...this.editingWorker, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.workerModal).hide();
        },
        deleteWorker: async function(id) {
            if (await window.confirmAction('确定要删除这个工人吗？此操作不可撤销。')) {
                this.data.workers = this.data.workers.filter(w => w.id !== id);
                saveData(this.data);
                window.showToast('success', '删除成功', '工人已删除');
            }
        },

        // 工时管理
        openWorkhourModal(workhour = null) {
            this.editingWorkhour = workhour ? { ...workhour } : { name: '', hoursPerDay: 8, daysPerWeek: 5 };
            new bootstrap.Modal(this.$refs.workhourModal).show();
        },
        saveWorkhour() {
            if (this.editingWorkhour.id) {
                const index = this.data.workhours.findIndex(w => w.id === this.editingWorkhour.id);
                if (index !== -1) this.data.workhours[index] = { ...this.editingWorkhour };
            } else {
                this.data.workhours.push({ ...this.editingWorkhour, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.workhourModal).hide();
        },
        deleteWorkhour: async function(id) {
            if (await window.confirmAction('确定要删除这个工时设置吗？此操作不可撤销。')) {
                this.data.workhours = this.data.workhours.filter(w => w.id !== id);
                saveData(this.data);
                window.showToast('success', '删除成功', '工时设置已删除');
            }
        },

        /**
         * 初始化产能分析图表
         */
        initCapacityChart() {
            const chartDom = document.getElementById('capacityChart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            const equipmentData = this.data.equipment.map(equipment => ({
                name: equipment.name,
                value: equipment.capacityPerDay,
                itemStyle: { color: equipment.status === '正常' ? '#52c41a' : '#ff4d4f' }
            }));

            chart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} 单位/天'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [{
                    name: '设备产能',
                    type: 'pie',
                    radius: '50%',
                    data: equipmentData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            });
        }
    },
    mounted() {
        // 初始化数据结构
        if (!this.data.equipment) this.data.equipment = [];
        if (!this.data.workers) this.data.workers = [];
        if (!this.data.workhours) this.data.workhours = [];
        saveData(this.data);
    },
    watch: {
        activeTab(newTab) {
            if (newTab === 'assessment') {
                setTimeout(() => this.initCapacityChart(), 100);
            }
        }
    }
};
