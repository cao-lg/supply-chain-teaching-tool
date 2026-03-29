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
    customers: [],
    boms: [],
    orders: [],
    productionPlans: [],
    purchaseOrders: [],
    inventory: {
        materials: [],
        products: []
    },
    inventoryTransactions: [],
    qualityInspections: [],
    financialRecords: []
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
        customers: [
            {
                id: 'c1',
                code: 'C001',
                name: '科技有限公司',
                contact: '王五',
                phone: '13900139001',
                address: '北京市海淀区',
                deliveryRules: [
                    {
                        type: 'fixed_days',
                        days: 7,
                        priority: 1
                    }
                ]
            },
            {
                id: 'c2',
                code: 'C002',
                name: '贸易公司',
                contact: '赵六',
                phone: '13900139002',
                address: '上海市浦东新区',
                deliveryRules: [
                    {
                        type: 'working_days',
                        days: 5,
                        priority: 1
                    }
                ]
            },
            {
                id: 'c3',
                code: 'C003',
                name: '制造企业',
                contact: '钱七',
                phone: '13900139003',
                address: '广州市天河区',
                deliveryRules: [
                    {
                        type: 'specific_date',
                        dayOfMonth: 15,
                        priority: 1
                    }
                ]
            }
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
        orders: [
            {
                id: 'o1',
                orderNo: 'SO-20260320-001',
                customerId: 'c1',
                productId: 'p1',
                quantity: 5,
                deliveryDate: '2026-03-25',
                status: 'completed',
                priority: '普通'
            },
            {
                id: 'o2',
                orderNo: 'SO-20260328-001',
                customerId: 'c2',
                productId: 'p1',
                quantity: 10,
                deliveryDate: '2026-04-05',
                status: 'pending',
                priority: '重要'
            },
            {
                id: 'o3',
                orderNo: 'SO-20260328-002',
                customerId: 'c3',
                productId: 'p2',
                quantity: 20,
                deliveryDate: '2026-04-10',
                status: 'pending',
                priority: '普通'
            }
        ],
        productionPlans: [
            {
                id: 'pp1',
                planNo: 'PP-20260315-001',
                productId: 'p1',
                quantity: 10,
                startDate: '2026-03-15',
                endDate: '2026-03-20',
                status: 'completed',
                priority: '重要'
            },
            {
                id: 'pp2',
                planNo: 'PP-20260325-001',
                productId: 'p1',
                quantity: 15,
                startDate: '2026-03-25',
                endDate: '2026-04-01',
                status: 'in_progress',
                priority: '紧急'
            }
        ],
        purchaseOrders: [
            {
                id: 'po1',
                orderNo: 'PO-20260301-001',
                supplierId: 's1',
                items: [
                    { materialId: 'm1', quantity: 50, price: 50 }
                ],
                orderDate: '2026-03-01',
                expectedDate: '2026-03-05',
                status: 'completed',
                totalAmount: 2500
            },
            {
                id: 'po2',
                orderNo: 'PO-20260328-001',
                supplierId: 's1',
                items: [
                    { materialId: 'm1', quantity: 30, price: 50 },
                    { materialId: 'm2', quantity: 20, price: 120 }
                ],
                orderDate: '2026-03-28',
                expectedDate: '2026-04-03',
                status: 'pending',
                totalAmount: 3900
            },
            {
                id: 'po3',
                orderNo: 'PO-20260328-002',
                supplierId: 's2',
                items: [
                    { materialId: 'm3', quantity: 100, price: 15 }
                ],
                orderDate: '2026-03-28',
                expectedDate: '2026-04-02',
                status: 'in_progress',
                totalAmount: 1500
            }
        ],
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
        },
        inventoryTransactions: [
            {
                id: 'it1',
                type: 'purchase_in',
                materialId: 'm1',
                productId: null,
                quantity: 50,
                referenceDoc: 'PO-20260301-001',
                date: '2026-03-01',
                remark: '采购入库-锂电池'
            },
            {
                id: 'it2',
                type: 'production_in',
                materialId: null,
                productId: 'p1',
                quantity: 10,
                referenceDoc: 'PP-20260315-001',
                date: '2026-03-15',
                remark: '生产入库-智能手表'
            },
            {
                id: 'it3',
                type: 'sale_out',
                materialId: null,
                productId: 'p1',
                quantity: 5,
                referenceDoc: 'SO-20260320-001',
                date: '2026-03-20',
                remark: '销售出库'
            }
        ],
        qualityInspections: [
            {
                id: 'qi1',
                type: 'IQC',
                sourceType: 'material',
                sourceId: 'm1',
                result: 'pass',
                quantity: 50,
                qualifiedQty: 48,
                defectiveQty: 2,
                inspector: '质检员A',
                date: '2026-03-01'
            },
            {
                id: 'qi2',
                type: 'OQC',
                sourceType: 'product',
                sourceId: 'p1',
                result: 'pass',
                quantity: 10,
                qualifiedQty: 10,
                defectiveQty: 0,
                inspector: '质检员B',
                date: '2026-03-15'
            }
        ],
        financialRecords: [
            {
                id: 'fr1',
                type: 'AP',
                sourceType: 'purchase_order',
                sourceId: 'po1',
                amount: 5000,
                paidAmount: 3000,
                status: 'partial',
                date: '2026-03-01'
            },
            {
                id: 'fr2',
                type: 'AR',
                sourceType: 'order',
                sourceId: 'o1',
                amount: 12000,
                paidAmount: 12000,
                status: 'paid',
                date: '2026-03-20'
            }
        ]
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
