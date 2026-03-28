/**
 * 供应链管理教学工具 - 主应用入口
 */

import { loadData, saveData, exportData, importData, loadSampleData, clearData } from './store.js';
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
import FinanceModule from './modules/finance.js';

const { createApp, ref, onMounted, watch } = Vue;

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
            // 加载数据
            const data = loadData();
            
            const chart1Dom = document.getElementById('chart1');
            if (chart1Dom) {
                chart1 = echarts.init(chart1Dom);
                
                // 从订单数据计算销售额
                const orders = data.orders || [];
                const monthlySales = {};
                
                // 初始化月份数据
                for (let i = 1; i <= 6; i++) {
                    monthlySales[i] = 0;
                }
                
                // 计算每月销售额
                orders.forEach(order => {
                    const date = new Date(order.deliveryDate);
                    const month = date.getMonth() + 1;
                    if (month <= 6) {
                        // 假设每个产品的平均价格为100元
                        monthlySales[month] += (order.quantity || 0) * 100;
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
                
                // 从库存数据计算库存分布
                const inventory = data.inventory || { materials: [], products: [] };
                const materialStock = inventory.materials.reduce((total, item) => total + (item.quantity || 0), 0);
                const productStock = inventory.products.reduce((total, item) => total + (item.quantity || 0), 0);
                
                chart2.setOption({
                    tooltip: { trigger: 'item' },
                    series: [{
                        type: 'pie',
                        radius: '60%',
                        data: [
                            { value: materialStock, name: '原材料' },
                            { value: 0, name: '半成品' }, // 暂不支持半成品数据
                            { value: productStock, name: '成品' },
                            { value: 0, name: '备品备件' } // 暂不支持备品备件数据
                        ].filter(item => item.value > 0)
                    }]
                });
            }

            const chart3Dom = document.getElementById('chart3');
            if (chart3Dom) {
                chart3 = echarts.init(chart3Dom);
                
                // 从生产计划数据计算产量
                const productionPlans = data.productionPlans || [];
                const monthlyPlans = {};
                const monthlyActuals = {};
                
                // 初始化月份数据
                for (let i = 1; i <= 6; i++) {
                    monthlyPlans[i] = 0;
                    monthlyActuals[i] = 0;
                }
                
                // 计算每月计划产量和实际产量
                productionPlans.forEach(plan => {
                    const startDate = new Date(plan.startDate);
                    const month = startDate.getMonth() + 1;
                    if (month <= 6) {
                        monthlyPlans[month] += plan.quantity || 0;
                        // 假设实际产量为计划产量的90%
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

        onMounted(() => {
            initCharts();
            window.addEventListener('resize', handleResize);
        });

        return {
            currentPage,
            navItems,
            switchPage
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

app.mount('#app');
