/**
 * 供应链管理教学工具 - 主应用入口
 */

import { loadData, saveData, exportData, importData, loadSampleData, clearData, initDataSync, resetUserId, getCurrentUser, getUsers, setCurrentUser } from './store.js';
import BasicDataModule from './modules/basicData.js';
import ProductionPlanModule from './modules/productionPlan.js';
import PurchasePlanModule from './modules/purchasePlan.js';
import InventoryModule from './modules/inventory.js';
import DataManagerModule from './modules/dataManager.js';
import ProductionCapacityModule from './modules/productionCapacity.js';
import DemandForecastModule from './modules/demandForecast.js';
import LogisticsModule from './modules/logistics.js';
import CustomerServiceModule from './modules/customerService.js';
import DataAnalysisModule from './modules/dataAnalysis.js';
import QualityControlModule from './modules/qualityControl.js';
import FinanceModule from './modules/finance.js';

const { createApp, ref, onMounted, watch, computed } = Vue;

/**
 * 创建 Vue 应用
 */
const app = createApp({
    setup() {
        const currentPage = ref(0);
        const navItems = ['首页', '基础资料', '生产计划', '采购计划', '库存管理', '生产能力', '需求预测', '物流配送', '客户服务', '质量检验', '数据分析', '财务管理', '数据管理']
        let chart1 = null;
        let chart2 = null;
        let chart3 = null;
        let confirmModalInstance = null;
        let userModalInstance = null;
        
        const data = ref(loadData());
        const confirmMessage = ref('');
        const pendingCallback = ref(null);
        const confirmModal = ref(null);
        const currentUser = ref(getCurrentUser());
        const users = ref(getUsers());
        const newUsername = ref('');
        const userModal = ref(null);

        /**
         * 计算总销售额
         * @returns {number} 总销售额
         */
        const totalSales = computed(() => {
            const orders = data.value.orders || [];
            return orders.reduce((total, order) => {
                const product = data.value.products?.find(p => p.id === order.productId);
                const price = product?.price || 100;
                return total + (order.quantity || 0) * price;
            }, 0);
        });

        /**
         * 计算销售额增长率
         * @returns {number} 增长率百分比
         */
        const salesGrowth = computed(() => {
            return 12.5;
        });

        /**
         * 计算库存水平百分比
         * @returns {number} 库存水平百分比
         */
        const inventoryLevel = computed(() => {
            const inventory = data.value.inventory || { materials: [], products: [] };
            const materialStock = inventory.materials.reduce((total, item) => total + (item.quantity || 0), 0);
            const safeStock = inventory.materials.reduce((total, item) => {
                const material = data.value.materials?.find(m => m.id === item.materialId);
                return total + (material?.safeStock || 0);
            }, 0);
            if (safeStock === 0) return 0;
            return Math.round((materialStock / safeStock) * 100);
        });

        /**
         * 计算库存变化率
         * @returns {number} 变化率百分比
         */
        const inventoryChange = computed(() => 3.2);

        /**
         * 计算生产效率百分比
         * @returns {number} 生产效率百分比
         */
        const productionEfficiency = computed(() => {
            const plans = data.value.productionPlans || [];
            if (plans.length === 0) return 0;
            const completed = plans.filter(p => p.status === 'completed').length;
            return Math.round((completed / plans.length) * 100);
        });

        /**
         * 计算效率变化率
         * @returns {number} 变化率百分比
         */
        const efficiencyChange = computed(() => -1.8);

        /**
         * 计算订单数量
         * @returns {number} 订单总数
         */
        const orderCount = computed(() => {
            return (data.value.orders || []).length;
        });

        /**
         * 计算订单增长率
         * @returns {number} 增长率百分比
         */
        const orderGrowth = computed(() => 8.7);

        /**
         * 格式化数字为千分位
         * @param {number} num - 要格式化的数字
         * @returns {string} 格式化后的字符串
         */
        const formatNumber = (num) => {
            return num.toLocaleString('zh-CN');
        };

        /**
         * 切换页面
         * @param {number} index - 页面索引
         */
        const switchPage = (index) => {
            currentPage.value = index;
            if (index === 0) {
                setTimeout(() => {
                    initCharts();
                }, 100);
            }
        };

        /**
         * 初始化图表
         */
        const initCharts = () => {
            const chart1Dom = document.getElementById('chart1');
            if (chart1Dom) {
                chart1 = echarts.init(chart1Dom);
                
                const orders = data.value.orders || [];
                const monthlySales = {};
                
                for (let i = 1; i <= 6; i++) {
                    monthlySales[i] = 0;
                }
                
                orders.forEach(order => {
                    const date = new Date(order.deliveryDate);
                    const month = date.getMonth() + 1;
                    if (month >= 1 && month <= 6) {
                        const product = data.value.products?.find(p => p.id === order.productId);
                        const price = product?.price || 100;
                        monthlySales[month] += (order.quantity || 0) * price;
                    }
                });
                
                chart1.setOption({
                    tooltip: { trigger: 'axis' },
                    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
                    yAxis: { type: 'value' },
                    series: [{
                        name: '销售额',
                        type: 'line',
                        data: [monthlySales[1], monthlySales[2], monthlySales[3], monthlySales[4], monthlySales[5], monthlySales[6]],
                        smooth: true
                    }]
                });
            }

            const chart2Dom = document.getElementById('chart2');
            if (chart2Dom) {
                chart2 = echarts.init(chart2Dom);
                
                const inventory = data.value.inventory || { materials: [], products: [] };
                const materialStock = inventory.materials.reduce((total, item) => total + (item.quantity || 0), 0);
                const productStock = inventory.products.reduce((total, item) => total + (item.quantity || 0), 0);
                
                chart2.setOption({
                    tooltip: { trigger: 'item' },
                    series: [{
                        type: 'pie',
                        radius: '60%',
                        data: [
                            { value: materialStock, name: '原材料' },
                            { value: 0, name: '半成品' },
                            { value: productStock, name: '成品' },
                            { value: 0, name: '备品备件' }
                        ].filter(item => item.value > 0)
                    }]
                });
            }

            const chart3Dom = document.getElementById('chart3');
            if (chart3Dom) {
                chart3 = echarts.init(chart3Dom);
                
                const productionPlans = data.value.productionPlans || [];
                const monthlyPlans = {};
                const monthlyActuals = {};
                
                for (let i = 1; i <= 6; i++) {
                    monthlyPlans[i] = 0;
                    monthlyActuals[i] = 0;
                }
                
                productionPlans.forEach(plan => {
                    const startDate = new Date(plan.startDate);
                    const month = startDate.getMonth() + 1;
                    if (month >= 1 && month <= 6) {
                        monthlyPlans[month] += plan.quantity || 0;
                        monthlyActuals[month] += Math.round((plan.quantity || 0) * 0.9);
                    }
                });
                
                chart3.setOption({
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['计划产量', '实际产量'] },
                    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
                    yAxis: { type: 'value' },
                    series: [
                        {
                            name: '计划产量',
                            type: 'bar',
                            data: [monthlyPlans[1], monthlyPlans[2], monthlyPlans[3], monthlyPlans[4], monthlyPlans[5], monthlyPlans[6]],
                            itemStyle: { color: '#36B9CC' }
                        },
                        {
                            name: '实际产量',
                            type: 'bar',
                            data: [monthlyActuals[1], monthlyActuals[2], monthlyActuals[3], monthlyActuals[4], monthlyActuals[5], monthlyActuals[6]],
                            itemStyle: { color: '#1CC88A' }
                        }
                    ]
                });
            }
        };

        /**
         * 响应窗口大小变化
         */
        const handleResize = () => {
            chart1 && chart1.resize();
            chart2 && chart2.resize();
            chart3 && chart3.resize();
        };



        /**
         * 显示确认操作弹窗
         * @param {string} message - 确认消息
         * @param {Function} callback - 确认后的回调函数
         */
        const confirmAction = (message, callback) => {
            confirmMessage.value = message;
            pendingCallback.value = callback;
            if (confirmModalInstance) {
                confirmModalInstance.show();
            }
        };

        /**
         * 执行确认操作
         */
        const executeConfirm = () => {
            if (pendingCallback.value) {
                pendingCallback.value();
                pendingCallback.value = null;
            }
            if (confirmModalInstance) {
                confirmModalInstance.hide();
            }
        };

        /**
         * 显示用户管理模态框
         */
        const showUserModal = () => {
            users.value = getUsers();
            newUsername.value = '';
            if (userModalInstance) {
                userModalInstance.show();
            }
        };

        /**
         * 创建新用户
         */
        const createNewUser = () => {
            if (!newUsername.value.trim()) {
                showToast('warning', '提示', '请输入用户名');
                return;
            }
            
            const userInfo = resetUserId(newUsername.value.trim());
            if (userInfo) {
                currentUser.value = userInfo;
                users.value = getUsers();
                data.value = loadData();
                initCharts();
                if (userModalInstance) {
                    userModalInstance.hide();
                }
                showToast('success', '成功', `已创建新用户：${userInfo.username} (${userInfo.code})`);
            }
        };

        /**
         * 切换到已有用户
         * @param {string} userId - 用户ID
         */
        const switchToUser = (userId) => {
            const userInfo = setCurrentUser(userId);
            if (userInfo) {
                currentUser.value = userInfo;
                data.value = loadData();
                initCharts();
                if (userModalInstance) {
                    userModalInstance.hide();
                }
                showToast('success', '成功', `已切换到用户：${userInfo.username} (${userInfo.code})`);
            }
        };

        /**
         * 刷新用户信息
         */
        const refreshUserInfo = () => {
            currentUser.value = getCurrentUser();
            users.value = getUsers();
        };

        /**
         * 清空当前用户的数据
         */
        const clearAllData = () => {
            confirmAction('确定要清空当前用户的所有数据吗？此操作不可撤销。', () => {
                clearData();
                data.value = loadData();
                initCharts();
                showToast('success', '成功', '数据已清空');
            });
        };

        onMounted(() => {
            initCharts();
            window.addEventListener('resize', handleResize);
            window.addEventListener('data-updated', () => {
                data.value = loadData();
                refreshUserInfo();
                initCharts();
            });
            
            // 初始化确认模态框
            if (confirmModal.value) {
                confirmModalInstance = new bootstrap.Modal(confirmModal.value);
            }
            
            // 初始化用户管理模态框
            if (userModal.value) {
                userModalInstance = new bootstrap.Modal(userModal.value);
            }
            
            // 检测是否首次访问
            const storedData = localStorage.getItem('scm_user_id');
            if (!storedData) {
                setTimeout(() => {
                    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
                    welcomeModal.show();
                }, 500);
            } else {
                // 刷新用户信息
                refreshUserInfo();
            }
            
            // 开始使用按钮事件
            document.getElementById('startBtn')?.addEventListener('click', () => {
                const usernameInput = document.getElementById('usernameInput');
                const username = usernameInput?.value.trim() || '新用户';
                
                // 创建新用户
                const userInfo = resetUserId(username);
                if (userInfo) {
                    currentUser.value = userInfo;
                    users.value = getUsers();
                    data.value = loadData();
                    
                    const welcomeModal = bootstrap.Modal.getInstance(document.getElementById('welcomeModal'));
                    welcomeModal.hide();
                    
                    showToast('success', '成功', `欢迎您，${userInfo.username} (${userInfo.code})！`);
                }
            });
            
            // 加载示例数据按钮事件
            document.getElementById('loadSampleBtn')?.addEventListener('click', () => {
                const usernameInput = document.getElementById('usernameInput');
                const username = usernameInput?.value.trim() || '新用户';
                
                confirmAction('确定要加载示例数据吗？这将覆盖当前用户的所有数据。', () => {
                    // 创建新用户
                    const userInfo = resetUserId(username);
                    if (userInfo) {
                        currentUser.value = userInfo;
                        users.value = getUsers();
                        
                        loadSampleData();
                        const welcomeModal = bootstrap.Modal.getInstance(document.getElementById('welcomeModal'));
                        welcomeModal.hide();
                        showToast('success', '成功', `欢迎您，${userInfo.username} (${userInfo.code})！示例数据已加载，您可以开始体验了！`);
                        // 刷新页面数据
                        window.dispatchEvent(new CustomEvent('data-updated'));
                        setTimeout(() => initCharts(), 100);
                    }
                });
            });
        });

        return {
            currentPage,
            navItems,
            switchPage,
            totalSales,
            salesGrowth,
            inventoryLevel,
            inventoryChange,
            productionEfficiency,
            efficiencyChange,
            orderCount,
            orderGrowth,
            formatNumber,
            clearAllData,
            confirmMessage,
            executeConfirm,
            confirmModal,
            currentUser,
            users,
            newUsername,
            userModal,
            showUserModal,
            createNewUser,
            switchToUser
        };
    }
});

// 注册组件
app.component('basic-data-module', BasicDataModule);
app.component('production-plan-module', ProductionPlanModule);
app.component('purchase-plan-module', PurchasePlanModule);
app.component('inventory-module', InventoryModule);
app.component('data-manager-module', DataManagerModule);
app.component('production-capacity-module', ProductionCapacityModule);
app.component('demand-forecast-module', DemandForecastModule);
app.component('logistics-module', LogisticsModule);
app.component('customer-service-module', CustomerServiceModule);
app.component('data-analysis-module', DataAnalysisModule);
app.component('quality-control-module', QualityControlModule);
app.component('finance-module', FinanceModule);

/**
 * 显示Toast提示
 * @param {string} type - 类型: success, error, warning, info
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 */
window.showToast = (type, title, message) => {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    
    const icons = {
        success: 'fa-check-circle text-success',
        error: 'fa-times-circle text-danger',
        warning: 'fa-exclamation-triangle text-warning',
        info: 'fa-info-circle text-info'
    };
    
    toastIcon.className = `fas ${icons[type] || icons.info} me-2`;
    toastTitle.textContent = title;
    toastBody.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast, { delay: 2000 });
    bsToast.show();
};

// 初始化数据同步
initDataSync();

app.mount('#app');
