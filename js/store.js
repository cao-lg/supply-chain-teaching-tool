/**
 * 数据存储管理模块
 * 使用 LocalStorage 进行数据持久化
 */

const STORAGE_KEY = 'scm_data';

/**
 * 获取默认数据结构
 * @returns {Object} 默认数据对象
 */
const getDefaultData = () => ({
    products: [],
    materials: [],
    suppliers: [],
    boms: [],
    orders: [],
    productionPlans: [],
    purchaseOrders: [],
    inventory: {
        materials: [],
        products: []
    }
});

/**
 * 加载数据
 * @returns {Object} 存储的数据或默认数据
 */
export const loadData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : getDefaultData();
    } catch (error) {
        console.error('加载数据失败:', error);
        return getDefaultData();
    }
};

/**
 * 保存数据
 * @param {Object} data - 要保存的数据
 */
export const saveData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
};

/**
 * 清空数据
 */
export const clearData = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('清空数据失败:', error);
    }
};

/**
 * 导出数据为 JSON 文件
 * @param {Object} data - 要导出的数据
 */
export const exportData = (data) => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `scm_data_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * 导入数据
 * @param {File} file - JSON 文件
 * @returns {Promise<Object>} 解析后的数据
 */
export const importData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('文件格式错误'));
            }
        };
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsText(file);
    });
};

/**
 * 加载示例数据
 * @returns {Object} 示例数据
 */
export const loadSampleData = () => {
    const sampleData = {
        products: [
            { id: 'p1', code: 'P001', name: '智能手表', description: '高端智能手表', unit: '个' },
            { id: 'p2', code: 'P002', name: '无线耳机', description: '降噪无线耳机', unit: '个' }
        ],
        materials: [
            { id: 'm1', code: 'M001', name: '锂电池', type: '采购', unit: '个', price: 50 },
            { id: 'm2', code: 'M002', name: '显示屏', type: '采购', unit: '个', price: 120 },
            { id: 'm3', code: 'M003', name: '塑料外壳', type: '采购', unit: '个', price: 15 }
        ],
        suppliers: [
            { id: 's1', code: 'S001', name: '电子元件有限公司', contact: '张三', phone: '13800138001', address: '深圳市南山区' },
            { id: 's2', code: 'S002', name: '精密制造有限公司', contact: '李四', phone: '13800138002', address: '东莞市松山湖' }
        ],
        boms: [
            {
                id: 'b1',
                productId: 'p1',
                items: [
                    { materialId: 'm1', quantity: 1 },
                    { materialId: 'm2', quantity: 1 },
                    { materialId: 'm3', quantity: 2 }
                ]
            }
        ],
        orders: [],
        productionPlans: [],
        purchaseOrders: [],
        inventory: {
            materials: [
                { materialId: 'm1', quantity: 100, safeStock: 20 },
                { materialId: 'm2', quantity: 50, safeStock: 10 },
                { materialId: 'm3', quantity: 200, safeStock: 30 }
            ],
            products: [
                { productId: 'p1', quantity: 20 },
                { productId: 'p2', quantity: 15 }
            ]
        }
    };
    
    saveData(sampleData);
    return sampleData;
};

/**
 * 生成唯一ID
 * @returns {string} UUID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
