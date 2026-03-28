/**
 * 物流与配送模块
 * 包含运输管理、配送计划、货物跟踪功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 物流与配送组件
 */
export default {
    name: 'LogisticsModule',
    template: `
        <div>
            <h2 class="mb-4">物流与配送</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'transport' }" @click="activeTab = 'transport'">运输管理</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'delivery' }" @click="activeTab = 'delivery'">配送计划</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'tracking' }" @click="activeTab = 'tracking'">货物跟踪</a>
                </li>
            </ul>

            <!-- 运输管理 -->
            <div v-if="activeTab === 'transport'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>运输方式管理</h5>
                    <button class="btn btn-primary" @click="openTransportModal()">添加运输方式</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>运输方式</th>
                                <th>承运商</th>
                                <th>运费单价</th>
                                <th>时效(天)</th>
                                <th>覆盖范围</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.transportMethods || []" :key="item.id">
                                <td>{{ item.name }}</td>
                                <td>{{ item.carrier }}</td>
                                <td>¥{{ item.price }}/kg</td>
                                <td>{{ item.transitTime }}</td>
                                <td>{{ item.coverage }}</td>
                                <td>
                                    <span class="badge" :class="item.status === '可用' ? 'bg-success' : 'bg-secondary'">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openTransportModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteTransport(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 配送计划 -->
            <div v-if="activeTab === 'delivery'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>配送计划列表</h5>
                    <button class="btn btn-primary" @click="openDeliveryModal()">创建配送计划</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>计划编号</th>
                                <th>关联订单</th>
                                <th>收货地址</th>
                                <th>运输方式</th>
                                <th>预计发货</th>
                                <th>预计到达</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.deliveryPlans || []" :key="item.id">
                                <td>{{ item.planNo }}</td>
                                <td>{{ getOrderNo(item.orderId) }}</td>
                                <td>{{ item.address }}</td>
                                <td>{{ getTransportName(item.transportId) }}</td>
                                <td>{{ item.shipDate }}</td>
                                <td>{{ item.arrivalDate }}</td>
                                <td>
                                    <span class="badge" :class="getDeliveryStatusClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openDeliveryModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-success" @click="updateDeliveryStatus(item)" v-if="item.status !== '已完成'">更新状态</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteDelivery(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 货物跟踪 -->
            <div v-if="activeTab === 'tracking'">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">货物跟踪查询</h5>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" v-model="trackingNumber" placeholder="请输入运单号">
                            <button class="btn btn-primary" @click="trackShipment">查询</button>
                        </div>
                    </div>
                </div>

                <div class="card" v-if="trackingResult">
                    <div class="card-body">
                        <h5 class="card-title">跟踪结果</h5>
                        <div class="timeline">
                            <div v-for="(event, index) in trackingResult.events" :key="index" class="timeline-item" :class="{ 'active': index === 0 }">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <h6 class="timeline-title">{{ event.status }}</h6>
                                    <p class="timeline-text">{{ event.location }}</p>
                                    <span class="timeline-date">{{ event.time }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">在途货物概览</h5>
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <h6 class="card-subtitle mb-2 text-muted">待发货</h6>
                                        <p class="card-text fs-4">{{ inTransitStats.pending }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <h6 class="card-subtitle mb-2 text-muted">运输中</h6>
                                        <p class="card-text fs-4">{{ inTransitStats.inTransit }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <h6 class="card-subtitle mb-2 text-muted">已签收</h6>
                                        <p class="card-text fs-4">{{ inTransitStats.delivered }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <h6 class="card-subtitle mb-2 text-muted">异常</h6>
                                        <p class="card-text fs-4">{{ inTransitStats.exception }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 运输方式模态框 -->
            <div class="modal fade" id="transportModal" tabindex="-1" ref="transportModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingTransport.id ? '编辑运输方式' : '添加运输方式' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveTransport">
                                <div class="mb-3">
                                    <label class="form-label">运输方式</label>
                                    <select class="form-select" v-model="editingTransport.name" required>
                                        <option value="快递">快递</option>
                                        <option value="陆运">陆运</option>
                                        <option value="空运">空运</option>
                                        <option value="海运">海运</option>
                                        <option value="铁路">铁路</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">承运商</label>
                                    <input type="text" class="form-control" v-model="editingTransport.carrier" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">运费单价(元/kg)</label>
                                    <input type="number" class="form-control" v-model="editingTransport.price" required min="0" step="0.01">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">运输时效(天)</label>
                                    <input type="number" class="form-control" v-model="editingTransport.transitTime" required min="1">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">覆盖范围</label>
                                    <input type="text" class="form-control" v-model="editingTransport.coverage" placeholder="如：全国、华南地区等">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingTransport.status">
                                        <option value="可用">可用</option>
                                        <option value="暂停">暂停</option>
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

            <!-- 配送计划模态框 -->
            <div class="modal fade" id="deliveryModal" tabindex="-1" ref="deliveryModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingDelivery.id ? '编辑配送计划' : '创建配送计划' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveDelivery">
                                <div class="mb-3">
                                    <label class="form-label">计划编号</label>
                                    <input type="text" class="form-control" v-model="editingDelivery.planNo" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">关联订单</label>
                                    <select class="form-select" v-model="editingDelivery.orderId" required>
                                        <option v-for="order in data.orders" :key="order.id" :value="order.id">
                                            {{ order.orderNo }} - {{ getProductName(order.productId) }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">收货地址</label>
                                    <textarea class="form-control" v-model="editingDelivery.address" rows="2" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">运输方式</label>
                                    <select class="form-select" v-model="editingDelivery.transportId" required>
                                        <option v-for="transport in data.transportMethods || []" :key="transport.id" :value="transport.id">
                                            {{ transport.name }} - {{ transport.carrier }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">预计发货日期</label>
                                    <input type="date" class="form-control" v-model="editingDelivery.shipDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">预计到达日期</label>
                                    <input type="date" class="form-control" v-model="editingDelivery.arrivalDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">运单号</label>
                                    <input type="text" class="form-control" v-model="editingDelivery.trackingNo" placeholder="选填">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">备注</label>
                                    <textarea class="form-control" v-model="editingDelivery.remark" rows="2"></textarea>
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
            activeTab: 'transport',
            data: loadData(),
            editingTransport: {},
            editingDelivery: {},
            trackingNumber: '',
            trackingResult: null
        };
    },
    computed: {
        /**
         * 在途货物统计
         * @returns {Object} 统计信息
         */
        inTransitStats() {
            const deliveries = this.data.deliveryPlans || [];
            return {
                pending: deliveries.filter(d => d.status === '待发货').length,
                inTransit: deliveries.filter(d => d.status === '运输中').length,
                delivered: deliveries.filter(d => d.status === '已签收').length,
                exception: deliveries.filter(d => d.status === '异常').length
            };
        }
    },
    methods: {
        /**
         * 获取订单编号
         * @param {string} orderId - 订单ID
         * @returns {string} 订单编号
         */
        getOrderNo(orderId) {
            const order = this.data.orders.find(o => o.id === orderId);
            return order ? order.orderNo : '未知订单';
        },

        /**
         * 获取产品名称
         * @param {string} productId - 产品ID
         * @returns {string} 产品名称
         */
        getProductName(productId) {
            const product = this.data.products.find(p => p.id === productId);
            return product ? product.name : '未知产品';
        },

        /**
         * 获取运输方式名称
         * @param {string} transportId - 运输方式ID
         * @returns {string} 运输方式名称
         */
        getTransportName(transportId) {
            const transport = (this.data.transportMethods || []).find(t => t.id === transportId);
            return transport ? `${transport.name}(${transport.carrier})` : '未知运输方式';
        },

        /**
         * 获取配送状态样式类
         * @param {string} status - 状态
         * @returns {string} 样式类
         */
        getDeliveryStatusClass(status) {
            switch (status) {
                case '待发货': return 'bg-secondary';
                case '已发货': return 'bg-info';
                case '运输中': return 'bg-primary';
                case '已签收': return 'bg-success';
                case '异常': return 'bg-danger';
                default: return 'bg-secondary';
            }
        },

        // 运输方式管理
        openTransportModal(transport = null) {
            this.editingTransport = transport ? { ...transport } : { 
                name: '快递', 
                carrier: '', 
                price: 0, 
                transitTime: 3, 
                coverage: '全国',
                status: '可用' 
            };
            new bootstrap.Modal(this.$refs.transportModal).show();
        },
        saveTransport() {
            if (!this.data.transportMethods) {
                this.data.transportMethods = [];
            }
            
            if (this.editingTransport.id) {
                const index = this.data.transportMethods.findIndex(t => t.id === this.editingTransport.id);
                if (index !== -1) this.data.transportMethods[index] = { ...this.editingTransport };
            } else {
                this.data.transportMethods.push({ ...this.editingTransport, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.transportModal).hide();
        },
        deleteTransport(id) {
            if (confirm('确定要删除这个运输方式吗？')) {
                this.data.transportMethods = this.data.transportMethods.filter(t => t.id !== id);
                saveData(this.data);
            }
        },

        // 配送计划管理
        openDeliveryModal(delivery = null) {
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            this.editingDelivery = delivery ? { ...delivery } : { 
                planNo: '', 
                orderId: '', 
                address: '', 
                transportId: '', 
                shipDate: today,
                arrivalDate: nextWeek.toISOString().split('T')[0],
                trackingNo: '',
                remark: '',
                status: '待发货'
            };
            new bootstrap.Modal(this.$refs.deliveryModal).show();
        },
        saveDelivery() {
            if (!this.data.deliveryPlans) {
                this.data.deliveryPlans = [];
            }
            
            if (this.editingDelivery.id) {
                const index = this.data.deliveryPlans.findIndex(d => d.id === this.editingDelivery.id);
                if (index !== -1) this.data.deliveryPlans[index] = { ...this.editingDelivery };
            } else {
                this.data.deliveryPlans.push({ ...this.editingDelivery, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.deliveryModal).hide();
        },
        deleteDelivery(id) {
            if (confirm('确定要删除这个配送计划吗？')) {
                this.data.deliveryPlans = this.data.deliveryPlans.filter(d => d.id !== id);
                saveData(this.data);
            }
        },
        updateDeliveryStatus(delivery) {
            const statusFlow = ['待发货', '已发货', '运输中', '已签收'];
            const currentIndex = statusFlow.indexOf(delivery.status);
            const nextStatus = statusFlow[currentIndex + 1] || '已签收';
            
            delivery.status = nextStatus;
            saveData(this.data);
            alert(`配送状态已更新为: ${nextStatus}`);
        },

        // 货物跟踪
        trackShipment() {
            if (!this.trackingNumber) {
                alert('请输入运单号');
                return;
            }
            
            // 模拟跟踪结果
            this.trackingResult = {
                trackingNo: this.trackingNumber,
                events: [
                    {
                        status: '已签收',
                        location: '北京市朝阳区',
                        time: '2024-01-15 14:30:00'
                    },
                    {
                        status: '派送中',
                        location: '北京市朝阳区配送中心',
                        time: '2024-01-15 08:00:00'
                    },
                    {
                        status: '到达',
                        location: '北京市转运中心',
                        time: '2024-01-14 20:00:00'
                    },
                    {
                        status: '运输中',
                        location: '上海市转运中心',
                        time: '2024-01-13 15:00:00'
                    },
                    {
                        status: '已发货',
                        location: '上海市发货仓库',
                        time: '2024-01-12 18:00:00'
                    }
                ]
            };
        }
    },
    mounted() {
        // 初始化数据结构
        if (!this.data.transportMethods) {
            this.data.transportMethods = [];
        }
        if (!this.data.deliveryPlans) {
            this.data.deliveryPlans = [];
        }
        saveData(this.data);
    }
};
