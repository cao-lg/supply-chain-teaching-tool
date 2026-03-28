/**
 * 财务管理模块
 * 包含应收账款、应付账款、成本核算、财务报表功能
 */

import { loadData, saveData, generateId } from '../store.js';

export default {
    name: 'FinanceModule',
    template: `
        <div>
            <h2 class="mb-4">财务管理</h2>
            
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'AR' }" @click="activeTab = 'AR'">应收账款</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'AP' }" @click="activeTab = 'AP'">应付账款</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'cost' }" @click="activeTab = 'cost'">成本核算</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'report' }" @click="activeTab = 'report'">财务报表</a>
                </li>
            </ul>

            <div v-if="activeTab === 'AR'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>应收账款列表</h5>
                    <button class="btn btn-primary" @click="refreshData">刷新数据</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>单据编号</th>
                                <th>来源</th>
                                <th class="text-end">金额</th>
                                <th class="text-end">已收金额</th>
                                <th class="text-end">余额</th>
                                <th>日期</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="record in arRecords" :key="record.id">
                                <td>{{ record.sourceNo }}</td>
                                <td>{{ record.sourceType === 'order' ? '销售订单' : '其他' }}</td>
                                <td class="text-end">¥{{ record.amount.toFixed(2) }}</td>
                                <td class="text-end">¥{{ record.paidAmount.toFixed(2) }}</td>
                                <td class="text-end">¥{{ record.balance.toFixed(2) }}</td>
                                <td>{{ record.date }}</td>
                                <td>
                                    <span class="badge" :class="getStatusBadgeClass(record.status)">
                                        {{ getStatusText(record.status) }}
                                    </span>
                                </td>
                                <td>
                                    <button v-if="record.status !== 'paid'" class="btn btn-sm btn-success" 
                                            @click="openPaymentModal(record, 'AR')">收款</button>
                                </td>
                            </tr>
                            <tr v-if="arRecords.length === 0">
                                <td colspan="8" class="text-center text-muted">暂无应收账款记录</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="activeTab === 'AP'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>应付账款列表</h5>
                    <button class="btn btn-primary" @click="refreshData">刷新数据</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>单据编号</th>
                                <th>来源</th>
                                <th class="text-end">金额</th>
                                <th class="text-end">已付金额</th>
                                <th class="text-end">余额</th>
                                <th>日期</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="record in apRecords" :key="record.id">
                                <td>{{ record.sourceNo }}</td>
                                <td>{{ record.sourceType === 'purchase' ? '采购订单' : '其他' }}</td>
                                <td class="text-end">¥{{ record.amount.toFixed(2) }}</td>
                                <td class="text-end">¥{{ record.paidAmount.toFixed(2) }}</td>
                                <td class="text-end">¥{{ record.balance.toFixed(2) }}</td>
                                <td>{{ record.date }}</td>
                                <td>
                                    <span class="badge" :class="getStatusBadgeClass(record.status)">
                                        {{ getStatusText(record.status) }}
                                    </span>
                                </td>
                                <td>
                                    <button v-if="record.status !== 'paid'" class="btn btn-sm btn-success" 
                                            @click="openPaymentModal(record, 'AP')">付款</button>
                                </td>
                            </tr>
                            <tr v-if="apRecords.length === 0">
                                <td colspan="8" class="text-center text-muted">暂无应付账款记录</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="activeTab === 'cost'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>产品成本核算</h5>
                    <button class="btn btn-primary" @click="refreshData">刷新数据</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>产品编码</th>
                                <th>产品名称</th>
                                <th>物料清单</th>
                                <th class="text-end">总成本</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in productCostList" :key="product.id">
                                <td>{{ product.code }}</td>
                                <td>{{ product.name }}</td>
                                <td>
                                    <ul class="list-unstyled mb-0">
                                        <li v-for="(item, idx) in product.bomItems" :key="idx">
                                            {{ item.materialName }} × {{ item.quantity }} × ¥{{ item.price.toFixed(2) }} = ¥{{ item.subtotal.toFixed(2) }}
                                        </li>
                                    </ul>
                                </td>
                                <td class="text-end fw-bold">¥{{ product.totalCost.toFixed(2) }}</td>
                            </tr>
                            <tr v-if="productCostList.length === 0">
                                <td colspan="4" class="text-center text-muted">暂无产品数据</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="activeTab === 'report'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>财务报表汇总</h5>
                    <button class="btn btn-primary" @click="refreshData">刷新数据</button>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <h5 class="card-title">总收入</h5>
                                <h3 class="mb-0">¥{{ financialSummary.totalRevenue.toFixed(2) }}</h3>
                                <small>已完成订单收入</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-danger text-white">
                            <div class="card-body">
                                <h5 class="card-title">总成本</h5>
                                <h3 class="mb-0">¥{{ financialSummary.totalCost.toFixed(2) }}</h3>
                                <small>已完成采购成本</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h5 class="card-title">总利润</h5>
                                <h3 class="mb-0">¥{{ financialSummary.totalProfit.toFixed(2) }}</h3>
                                <small>收入 - 成本</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mt-3">
                    <div class="card-body">
                        <h5 class="card-title">利润明细</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                已收应收账款
                                <span class="badge bg-success rounded-pill">¥{{ financialSummary.receivedAR.toFixed(2) }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                待收应收账款
                                <span class="badge bg-warning rounded-pill">¥{{ financialSummary.pendingAR.toFixed(2) }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                已付应付账款
                                <span class="badge bg-success rounded-pill">¥{{ financialSummary.paidAP.toFixed(2) }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                待付应付账款
                                <span class="badge bg-warning rounded-pill">¥{{ financialSummary.pendingAP.toFixed(2) }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="paymentModal" tabindex="-1" ref="paymentModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ paymentType === 'AR' ? '收款' : '付款' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="confirmPayment">
                                <div class="mb-3">
                                    <label class="form-label">单据编号</label>
                                    <input type="text" class="form-control" :value="paymentRecord?.sourceNo" disabled>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">总金额</label>
                                    <input type="text" class="form-control" :value="'¥' + paymentRecord?.amount.toFixed(2)" disabled>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">已{{ paymentType === 'AR' ? '收' : '付' }}金额</label>
                                    <input type="text" class="form-control" :value="'¥' + paymentRecord?.paidAmount.toFixed(2)" disabled>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">余额</label>
                                    <input type="text" class="form-control" :value="'¥' + paymentRecord?.balance.toFixed(2)" disabled>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">本次{{ paymentType === 'AR' ? '收' : '付' }}金额</label>
                                    <input type="number" class="form-control" v-model="paymentAmount" 
                                           :max="paymentRecord?.balance" min="0.01" step="0.01" required>
                                </div>
                                <div class="text-end">
                                    <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-success">确认{{ paymentType === 'AR' ? '收款' : '付款' }}</button>
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
            activeTab: 'AR',
            data: loadData(),
            paymentRecord: null,
            paymentType: 'AR',
            paymentAmount: 0
        };
    },
    computed: {
        arRecords() {
            return (this.data.financialRecords || [])
                .filter(r => r.type === 'AR')
                .map(r => ({
                    ...r,
                    balance: r.balance ?? (r.amount - r.paidAmount)
                }));
        },
        apRecords() {
            return (this.data.financialRecords || [])
                .filter(r => r.type === 'AP')
                .map(r => ({
                    ...r,
                    balance: r.balance ?? (r.amount - r.paidAmount)
                }));
        },
        productCostList() {
            return (this.data.products || []).map(product => {
                const bom = this.data.boms?.find(b => b.productId === product.id);
                const bomItems = (bom?.items || []).map(item => {
                    const material = this.data.materials?.find(m => m.id === item.materialId);
                    const price = material?.price || 0;
                    return {
                        materialName: material?.name || '未知物料',
                        quantity: item.quantity,
                        price: price,
                        subtotal: item.quantity * price
                    };
                });
                const totalCost = bomItems.reduce((sum, item) => sum + item.subtotal, 0);
                return {
                    id: product.id,
                    code: product.code,
                    name: product.name,
                    bomItems: bomItems,
                    totalCost: totalCost
                };
            });
        },
        financialSummary() {
            const completedOrders = (this.data.orders || []).filter(o => o.status === '已完成');
            const completedPurchases = (this.data.purchaseOrders || []).filter(p => p.status === '已完成');

            const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const totalCost = completedPurchases.reduce((sum, po) => {
                return sum + po.items.reduce((s, item) => s + (item.quantity * item.price), 0);
            }, 0);

            const financialRecords = this.data.financialRecords || [];
            const receivedAR = financialRecords
                .filter(r => r.type === 'AR')
                .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
            const pendingAR = financialRecords
                .filter(r => r.type === 'AR' && r.status !== 'paid')
                .reduce((sum, r) => sum + ((r.amount - r.paidAmount) || 0), 0);
            const paidAP = financialRecords
                .filter(r => r.type === 'AP')
                .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
            const pendingAP = financialRecords
                .filter(r => r.type === 'AP' && r.status !== 'paid')
                .reduce((sum, r) => sum + ((r.amount - r.paidAmount) || 0), 0);

            return {
                totalRevenue,
                totalCost,
                totalProfit: totalRevenue - totalCost,
                receivedAR,
                pendingAR,
                paidAP,
                pendingAP
            };
        }
    },
    mounted() {
        window.addEventListener('data-updated', this.refreshData);
    },
    beforeUnmount() {
        window.removeEventListener('data-updated', this.refreshData);
    },
    methods: {
        refreshData() {
            this.data = loadData();
        },
        getOrderSourceNo(id) {
            const order = this.data.orders?.find(o => o.id === id);
            return order?.orderNo || id;
        },
        getPurchaseSourceNo(id) {
            const purchase = this.data.purchaseOrders?.find(p => p.id === id);
            return purchase?.orderNo || id;
        },
        getStatusBadgeClass(status) {
            switch (status) {
                case 'pending': return 'bg-secondary';
                case 'partial': return 'bg-warning';
                case 'paid': return 'bg-success';
                default: return 'bg-secondary';
            }
        },
        getStatusText(status) {
            switch (status) {
                case 'pending': return '待收款/付款';
                case 'partial': return '部分收款/付款';
                case 'paid': return '已完成';
                default: return status;
            }
        },
        openPaymentModal(record, type) {
            this.paymentRecord = record;
            this.paymentType = type;
            this.paymentAmount = record.balance ?? (record.amount - record.paidAmount);
            new bootstrap.Modal(this.$refs.paymentModal).show();
        },
        recordPayment(record) {
            return this.confirmPayment();
        },
        confirmPayment() {
            if (!this.paymentRecord || this.paymentAmount <= 0) return;

            const amount = parseFloat(this.paymentAmount);
            const newPaidAmount = (this.paymentRecord.paidAmount || 0) + amount;
            const originalAmount = this.paymentRecord.amount;
            const newBalance = originalAmount - newPaidAmount;

            let newStatus = 'partial';
            if (newPaidAmount >= originalAmount) {
                newStatus = 'paid';
            } else if (newPaidAmount <= 0) {
                newStatus = 'pending';
            }

            const index = this.data.financialRecords.findIndex(r => r.id === this.paymentRecord.id);
            if (index !== -1) {
                this.data.financialRecords[index].paidAmount = newPaidAmount;
                this.data.financialRecords[index].balance = Math.max(0, newBalance);
                this.data.financialRecords[index].status = newStatus;
            }

            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.paymentModal).hide();
            this.refreshData();
        },
        calculateProductCost(productId) {
            const bom = this.data.boms?.find(b => b.productId === productId);
            if (!bom) return 0;

            return (bom.items || []).reduce((total, item) => {
                const material = this.data.materials?.find(m => m.id === item.materialId);
                const price = material?.price || 0;
                return total + (item.quantity * price);
            }, 0);
        }
    }
};
