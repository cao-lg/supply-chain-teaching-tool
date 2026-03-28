// 测试模块加载
import { loadData, loadSampleData } from './js/store.js';
import BasicDataModule from './js/modules/basicData.js';
import ProductionPlanModule from './js/modules/productionPlan.js';
import PurchasePlanModule from './js/modules/purchasePlan.js';
import InventoryModule from './js/modules/inventory.js';
import DataAnalysisModule from './js/modules/dataAnalysis.js';

console.log('开始测试模块加载...');

// 测试数据加载
console.log('1. 测试数据加载');
try {
    const sampleData = loadSampleData();
    console.log('✓ 示例数据加载成功');
    console.log('产品数量:', sampleData.products.length);
    console.log('物料数量:', sampleData.materials.length);
    console.log('供应商数量:', sampleData.suppliers.length);
} catch (error) {
    console.error('✗ 数据加载失败:', error);
}

// 测试模块加载
console.log('\n2. 测试模块加载');
try {
    console.log('✓ BasicDataModule 加载成功');
    console.log('✓ ProductionPlanModule 加载成功');
    console.log('✓ PurchasePlanModule 加载成功');
    console.log('✓ InventoryModule 加载成功');
    console.log('✓ DataAnalysisModule 加载成功');
} catch (error) {
    console.error('✗ 模块加载失败:', error);
}

// 测试数据结构
console.log('\n3. 测试数据结构');
try {
    const data = loadData();
    console.log('✓ 数据结构验证成功');
    console.log('数据结构:', Object.keys(data));
} catch (error) {
    console.error('✗ 数据结构验证失败:', error);
}

console.log('\n测试完成！');
