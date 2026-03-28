/**
 * 客户服务模块
 * 包含客户沟通、售后服务、客户满意度管理功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 客户服务组件
 */
export default {
    name: 'CustomerServiceModule',
    template: `
        <div>
            <h2 class="mb-4">客户服务</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'communication' }" @click="activeTab = 'communication'">客户沟通</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'aftersales' }" @click="activeTab = 'aftersales'">售后服务</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'satisfaction' }" @click="activeTab = 'satisfaction'">满意度管理</a>
                </li>
            </ul>

            <!-- 客户沟通 -->
            <div v-if="activeTab === 'communication'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>沟通记录</h5>
                    <button class="btn btn-primary" @click="openCommunicationModal()">添加沟通记录</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>日期</th>
                                <th>客户名称</th>
                                <th>沟通方式</th>
                                <th>沟通主题</th>
                                <th>处理状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.communications || []" :key="item.id">
                                <td>{{ item.date }}</td>
                                <td>{{ item.customerName }}</td>
                                <td>{{ item.method }}</td>
                                <td>{{ item.subject }}</td>
                                <td>
                                    <span class="badge" :class="getCommunicationStatusClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openCommunicationModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-success" @click="markAsResolved(item)" v-if="item.status !== '已解决'">标记解决</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteCommunication(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 售后服务 -->
            <div v-if="activeTab === 'aftersales'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>售后工单</h5>
                    <button class="btn btn-primary" @click="openAftersalesModal()">创建工单</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>工单编号</th>
                                <th>关联订单</th>
                                <th>问题类型</th>
                                <th>问题描述</th>
                                <th>优先级</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.aftersalesTickets || []" :key="item.id">
                                <td>{{ item.ticketNo }}</td>
                                <td>{{ getOrderNo(item.orderId) }}</td>
                                <td>{{ item.issueType }}</td>
                                <td>{{ item.description }}</td>
                                <td>
                                    <span class="badge" :class="getPriorityBadgeClass(item.priority)">
                                        {{ item.priority }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge" :class="getTicketStatusClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openAftersalesModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-success" @click="updateTicketStatus(item)" v-if="item.status !== '已关闭'">更新状态</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteAftersales(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 满意度管理 -->
            <div v-if="activeTab === 'satisfaction'">
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">总体满意度</h6>
                                <p class="card-text fs-2 text-success">{{ overallSatisfaction }}%</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">响应速度评分</h6>
                                <p class="card-text fs-2 text-primary">{{ responseSpeedScore }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">服务质量评分</h6>
                                <p class="card-text fs-2 text-info">{{ serviceQualityScore }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">问题解决率</h6>
                                <p class="card-text fs-2 text-warning">{{ resolutionRate }}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">满意度调查</h5>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="mb-0">管理客户满意度调查问卷和反馈</p>
                            <button class="btn btn-primary" @click="openSurveyModal()">创建调查</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>调查名称</th>
                                        <th>调查时间</th>
                                        <th>参与人数</th>
                                        <th>平均评分</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in data.satisfactionSurveys || []" :key="item.id">
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.surveyDate }}</td>
                                        <td>{{ item.participants }}</td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <span class="me-2">{{ item.averageScore }}</span>
                                                <div class="stars">
                                                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.round(item.averageScore) }">★</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge" :class="item.status === '进行中' ? 'bg-success' : 'bg-secondary'">
                                                {{ item.status }}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" @click="openSurveyModal(item)">编辑</button>
                                            <button class="btn btn-sm btn-outline-info" @click="viewSurveyDetails(item)">查看详情</button>
                                            <button class="btn btn-sm btn-outline-danger" @click="deleteSurvey(item.id)">删除</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">客户反馈词云</h5>
                        <div id="feedbackWordCloud" class="chart-container" style="height: 300px;"></div>
                    </div>
                </div>
            </div>

            <!-- 沟通记录模态框 -->
            <div class="modal fade" id="communicationModal" tabindex="-1" ref="communicationModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingCommunication.id ? '编辑沟通记录' : '添加沟通记录' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveCommunication">
                                <div class="mb-3">
                                    <label class="form-label">日期</label>
                                    <input type="date" class="form-control" v-model="editingCommunication.date" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">客户名称</label>
                                    <input type="text" class="form-control" v-model="editingCommunication.customerName" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">沟通方式</label>
                                    <select class="form-select" v-model="editingCommunication.method" required>
                                        <option value="电话">电话</option>
                                        <option value="邮件">邮件</option>
                                        <option value="在线聊天">在线聊天</option>
                                        <option value="面谈">面谈</option>
                                        <option value="视频会议">视频会议</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">沟通主题</label>
                                    <input type="text" class="form-control" v-model="editingCommunication.subject" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">沟通内容</label>
                                    <textarea class="form-control" v-model="editingCommunication.content" rows="3"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">处理状态</label>
                                    <select class="form-select" v-model="editingCommunication.status">
                                        <option value="待处理">待处理</option>
                                        <option value="处理中">处理中</option>
                                        <option value="已解决">已解决</option>
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

            <!-- 售后工单模态框 -->
            <div class="modal fade" id="aftersalesModal" tabindex="-1" ref="aftersalesModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingAftersales.id ? '编辑工单' : '创建工单' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveAftersales">
                                <div class="mb-3">
                                    <label class="form-label">工单编号</label>
                                    <input type="text" class="form-control" v-model="editingAftersales.ticketNo" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">关联订单</label>
                                    <select class="form-select" v-model="editingAftersales.orderId" required>
                                        <option v-for="order in data.orders" :key="order.id" :value="order.id">
                                            {{ order.orderNo }} - {{ getProductName(order.productId) }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">问题类型</label>
                                    <select class="form-select" v-model="editingAftersales.issueType" required>
                                        <option value="产品质量">产品质量</option>
                                        <option value="物流问题">物流问题</option>
                                        <option value="使用咨询">使用咨询</option>
                                        <option value="退换货">退换货</option>
                                        <option value="投诉建议">投诉建议</option>
                                        <option value="其他">其他</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">问题描述</label>
                                    <textarea class="form-control" v-model="editingAftersales.description" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">优先级</label>
                                    <select class="form-select" v-model="editingAftersales.priority">
                                        <option value="低">低</option>
                                        <option value="中">中</option>
                                        <option value="高">高</option>
                                        <option value="紧急">紧急</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">处理人</label>
                                    <input type="text" class="form-control" v-model="editingAftersales.assignee">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">备注</label>
                                    <textarea class="form-control" v-model="editingAftersales.remark" rows="2"></textarea>
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

            <!-- 调查模态框 -->
            <div class="modal fade" id="surveyModal" tabindex="-1" ref="surveyModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingSurvey.id ? '编辑调查' : '创建调查' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveSurvey">
                                <div class="mb-3">
                                    <label class="form-label">调查名称</label>
                                    <input type="text" class="form-control" v-model="editingSurvey.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">调查时间</label>
                                    <input type="date" class="form-control" v-model="editingSurvey.surveyDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">参与人数</label>
                                    <input type="number" class="form-control" v-model="editingSurvey.participants" required min="0">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">平均评分</label>
                                    <input type="number" class="form-control" v-model="editingSurvey.averageScore" required min="1" max="5" step="0.1">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">状态</label>
                                    <select class="form-select" v-model="editingSurvey.status">
                                        <option value="进行中">进行中</option>
                                        <option value="已结束">已结束</option>
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
            activeTab: 'communication',
            data: loadData(),
            editingCommunication: {},
            editingAftersales: {},
            editingSurvey: {}
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
         * 总体满意度
         * @returns {number} 满意度百分比
         */
        overallSatisfaction() {
            const surveys = this.data.satisfactionSurveys || [];
            if (surveys.length === 0) return 0;
            const totalScore = surveys.reduce((sum, survey) => sum + (survey.averageScore || 0), 0);
            return Math.round((totalScore / surveys.length / 5) * 100);
        },

        /**
         * 响应速度评分
         * @returns {number} 评分
         */
        responseSpeedScore() {
            // 模拟数据
            return 4.2;
        },

        /**
         * 服务质量评分
         * @returns {number} 评分
         */
        serviceQualityScore() {
            // 模拟数据
            return 4.5;
        },

        /**
         * 问题解决率
         * @returns {number} 解决率百分比
         */
        resolutionRate() {
            const tickets = this.data.aftersalesTickets || [];
            if (tickets.length === 0) return 0;
            const resolvedTickets = tickets.filter(t => t.status === '已关闭').length;
            return Math.round((resolvedTickets / tickets.length) * 100);
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
         * 获取沟通状态样式类
         * @param {string} status - 状态
         * @returns {string} 样式类
         */
        getCommunicationStatusClass(status) {
            switch (status) {
                case '待处理': return 'bg-warning';
                case '处理中': return 'bg-info';
                case '已解决': return 'bg-success';
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
                case '高': return 'bg-warning';
                case '中': return 'bg-info';
                case '低': return 'bg-secondary';
                default: return 'bg-secondary';
            }
        },

        /**
         * 获取工单状态样式类
         * @param {string} status - 状态
         * @returns {string} 样式类
         */
        getTicketStatusClass(status) {
            switch (status) {
                case '待处理': return 'bg-warning';
                case '处理中': return 'bg-info';
                case '待确认': return 'bg-primary';
                case '已关闭': return 'bg-success';
                default: return 'bg-secondary';
            }
        },

        // 沟通记录管理
        openCommunicationModal(communication = null) {
            const today = new Date().toISOString().split('T')[0];
            this.editingCommunication = communication ? { ...communication } : { 
                date: today, 
                customerName: '', 
                method: '电话', 
                subject: '', 
                content: '',
                status: '待处理'
            };
            new bootstrap.Modal(this.$refs.communicationModal).show();
        },
        saveCommunication() {
            if (!this.data.communications) {
                this.data.communications = [];
            }
            
            if (this.editingCommunication.id) {
                const index = this.data.communications.findIndex(c => c.id === this.editingCommunication.id);
                if (index !== -1) this.data.communications[index] = { ...this.editingCommunication };
            } else {
                this.data.communications.push({ ...this.editingCommunication, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.communicationModal).hide();
        },
        deleteCommunication(id) {
            if (confirm('确定要删除这条沟通记录吗？')) {
                this.data.communications = this.data.communications.filter(c => c.id !== id);
                saveData(this.data);
            }
        },
        markAsResolved(communication) {
            communication.status = '已解决';
            saveData(this.data);
            alert('沟通记录已标记为已解决');
        },

        // 售后工单管理
        openAftersalesModal(ticket = null) {
            this.editingAftersales = ticket ? { ...ticket } : { 
                ticketNo: '', 
                orderId: '', 
                issueType: '产品质量', 
                description: '', 
                priority: '中',
                assignee: '',
                remark: '',
                status: '待处理'
            };
            new bootstrap.Modal(this.$refs.aftersalesModal).show();
        },
        saveAftersales() {
            if (!this.data.aftersalesTickets) {
                this.data.aftersalesTickets = [];
            }
            
            if (this.editingAftersales.id) {
                const index = this.data.aftersalesTickets.findIndex(t => t.id === this.editingAftersales.id);
                if (index !== -1) this.data.aftersalesTickets[index] = { ...this.editingAftersales };
            } else {
                this.data.aftersalesTickets.push({ ...this.editingAftersales, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.aftersalesModal).hide();
        },
        deleteAftersales(id) {
            if (confirm('确定要删除这个售后工单吗？')) {
                this.data.aftersalesTickets = this.data.aftersalesTickets.filter(t => t.id !== id);
                saveData(this.data);
            }
        },
        updateTicketStatus(ticket) {
            const statusFlow = ['待处理', '处理中', '待确认', '已关闭'];
            const currentIndex = statusFlow.indexOf(ticket.status);
            const nextStatus = statusFlow[currentIndex + 1] || '已关闭';
            
            ticket.status = nextStatus;
            saveData(this.data);
            alert(`工单状态已更新为: ${nextStatus}`);
        },

        // 满意度调查管理
        openSurveyModal(survey = null) {
            const today = new Date().toISOString().split('T')[0];
            this.editingSurvey = survey ? { ...survey } : { 
                name: '', 
                surveyDate: today, 
                participants: 0, 
                averageScore: 4.0,
                status: '进行中'
            };
            new bootstrap.Modal(this.$refs.surveyModal).show();
        },
        saveSurvey() {
            if (!this.data.satisfactionSurveys) {
                this.data.satisfactionSurveys = [];
            }
            
            if (this.editingSurvey.id) {
                const index = this.data.satisfactionSurveys.findIndex(s => s.id === this.editingSurvey.id);
                if (index !== -1) this.data.satisfactionSurveys[index] = { ...this.editingSurvey };
            } else {
                this.data.satisfactionSurveys.push({ ...this.editingSurvey, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.surveyModal).hide();
        },
        deleteSurvey(id) {
            if (confirm('确定要删除这个满意度调查吗？')) {
                this.data.satisfactionSurveys = this.data.satisfactionSurveys.filter(s => s.id !== id);
                saveData(this.data);
            }
        },
        viewSurveyDetails(survey) {
            alert(`调查详情:\n名称: ${survey.name}\n参与人数: ${survey.participants}\n平均评分: ${survey.averageScore}`);
        },

        /**
         * 初始化词云图表
         */
        initWordCloudChart() {
            const chartDom = document.getElementById('feedbackWordCloud');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            
            // 模拟词云数据
            const words = [
                { name: '服务态度好', value: 100 },
                { name: '响应及时', value: 80 },
                { name: '专业', value: 70 },
                { name: '耐心', value: 60 },
                { name: '解决问题', value: 90 },
                { name: '满意', value: 85 },
                { name: '推荐', value: 75 },
                { name: '高效', value: 65 },
                { name: '友好', value: 55 },
                { name: '负责', value: 50 }
            ];
            
            chart.setOption({
                tooltip: {
                    show: true
                },
                series: [{
                    type: 'wordCloud',
                    shape: 'circle',
                    left: 'center',
                    top: 'center',
                    width: '90%',
                    height: '90%',
                    right: null,
                    bottom: null,
                    sizeRange: [12, 50],
                    rotationRange: [-45, 90],
                    rotationStep: 45,
                    gridSize: 8,
                    drawOutOfBound: false,
                    textStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        color: function () {
                            return 'rgb(' + [
                                Math.round(Math.random() * 160),
                                Math.round(Math.random() * 160),
                                Math.round(Math.random() * 160)
                            ].join(',') + ')';
                        }
                    },
                    emphasis: {
                        focus: 'self',
                        textStyle: {
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: words
                }]
            });
        }
    },
    watch: {
        activeTab(newTab) {
            if (newTab === 'satisfaction') {
                this.$nextTick(() => {
                    this.initWordCloudChart();
                });
            }
        }
    },
    mounted() {
        // 初始化数据结构
        if (!this.data.communications) {
            this.data.communications = [];
        }
        if (!this.data.aftersalesTickets) {
            this.data.aftersalesTickets = [];
        }
        if (!this.data.satisfactionSurveys) {
            this.data.satisfactionSurveys = [];
        }
        saveData(this.data);
    }
};
