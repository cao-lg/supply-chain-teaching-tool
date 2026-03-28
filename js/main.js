/**
 * 供应链管理教学工具 - 主应用入口
 */

import { loadData, saveData, exportData, importData, loadSampleData, clearData } from './store.js';
import BasicDataModule from './modules/basicData.js';
import ProductionPlanModule from './modules/productionPlan.js';
import PurchasePlanModule from './modules/purchasePlan.js';
import InventoryModule from './modules/inventory.js';
import DataManagerModule from './modules/dataManager.js';

const { createApp, ref, onMounted, watch } = Vue;

/**
 * 创建 Vue 应用
 */
const app = createApp({
    setup() {
        const currentPage = ref(0);
        const navItems = ['首页', '基础资料', '生产计划', '采购计划', '库存管理', '数据管理'];
        let chart1 = null;
        let chart2 = null;

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
                chart1.setOption({
                    tooltip: { trigger: 'axis' },
                    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
                    yAxis: { type: 'value' },
                    series: [{
                        name: '销售额',
                        type: 'line',
                        data: [120, 200, 150, 80, 70, 110],
                        smooth: true
                    }]
                });
            }

            const chart2Dom = document.getElementById('chart2');
            if (chart2Dom) {
                chart2 = echarts.init(chart2Dom);
                chart2.setOption({
                    tooltip: { trigger: 'item' },
                    series: [{
                        type: 'pie',
                        radius: '60%',
                        data: [
                            { value: 1048, name: '原材料' },
                            { value: 735, name: '半成品' },
                            { value: 580, name: '成品' },
                            { value: 484, name: '备品备件' }
                        ]
                    }]
                });
            }
        };

        /**
         * 响应窗口大小变化
         */
        const handleResize = () => {
            chart1 && chart1.resize();
            chart2 && chart2.resize();
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

app.mount('#app');
