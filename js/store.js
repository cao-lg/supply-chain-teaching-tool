/**
 * 数据存储管理模块
 * 使用 LocalStorage 进行数据持久化
 * 支持多用户数据隔离
 */

const USER_ID_KEY = 'scm_user_id';
const USER_INFO_KEY = 'scm_user_info';
const USERS_KEY = 'scm_users';

/**
 * 生成唯一用户ID
 * @returns {string} 用户ID
 */
const generateUserId = () => {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 生成用户编号
 * @returns {string} 用户编号
 */
const generateUserCode = () => {
    const users = getUsers();
    return 'U' + String(users.length + 1).padStart(3, '0');
};

/**
 * 保存用户信息
 * @param {Array} users - 用户信息数组
 */
const saveUsers = (users) => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('保存用户列表失败:', error);
    }
};

/**
 * 创建新用户
 * @param {string} username - 用户名
 * @returns {Object} 用户信息
 */
const createUser = (username) => {
    const userId = generateUserId();
    const userCode = generateUserCode();
    const userInfo = {
        id: userId,
        code: userCode,
        username: username,
        createdAt: new Date().toISOString()
    };
    
    const users = getUsers();
    users.push(userInfo);
    saveUsers(users);
    
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    
    return userInfo;
};

/**
 * 获取当前用户ID，如果不存在则生成新的
 * @returns {string} 用户ID
 */
const getUserId = () => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
};

/**
 * 获取当前用户的数据存储键
 * @returns {string} 存储键
 */
const getStorageKey = () => {
    const userId = getUserId();
    return `scm_data_${userId}`;
};

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
    equipmentTypes: [],
    workerTypes: [],
    equipment: [],
    workers: [],
    workHours: [],
    inventory: {
        materials: [],
        products: []
    },
    inventoryTransactions: [],
    qualityInspections: [],
    financialRecords: [],
    communications: [],
    aftersalesTickets: [],
    satisfactionSurveys: []
});

/**
 * 加载数据
 * @returns {Object} 存储的数据或默认数据
 */
export const loadData = () => {
    try {
        const storageKey = getStorageKey();
        const data = localStorage.getItem(storageKey);
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
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(data));
        // 触发数据更新事件，通知其他标签页
        window.dispatchEvent(new CustomEvent('data-updated'));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
};

/**
 * 初始化数据同步
 */
export const initDataSync = () => {
    // 监听localStorage变化，实现不同浏览器标签页间的数据同步
    window.addEventListener('storage', (event) => {
        const storageKey = getStorageKey();
        if (event.key === storageKey) {
            // 数据发生变化，触发数据更新事件
            window.dispatchEvent(new CustomEvent('data-updated'));
        }
    });
};

/**
 * 清空数据
 */
export const clearData = () => {
    try {
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.error('清空数据失败:', error);
    }
};

/**
 * 重置用户ID，创建新的用户数据空间
 * @param {string} username - 用户名
 * @returns {Object} 新用户信息
 */
export const resetUserId = (username = '新用户') => {
    try {
        // 创建新用户
        const userInfo = createUser(username);
        // 触发数据更新事件
        window.dispatchEvent(new CustomEvent('data-updated'));
        return userInfo;
    } catch (error) {
        console.error('重置用户ID失败:', error);
        return null;
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
        // 设备类型定义
        equipmentTypes: [
            { id: 'et1', name: '电子组装线', description: '用于电子产品组装', capacityUnit: '个/天', minCapacity: 50, maxCapacity: 100 },
            { id: 'et2', name: 'SMT贴片机', description: '用于PCB贴片', capacityUnit: '片/天', minCapacity: 200, maxCapacity: 500 },
            { id: 'et3', name: '注塑机', description: '用于塑料件生产', capacityUnit: '个/天', minCapacity: 500, maxCapacity: 1000 },
            { id: 'et4', name: '测试设备', description: '用于产品测试', capacityUnit: '个/天', minCapacity: 100, maxCapacity: 200 },
            { id: 'et5', name: '包装线', description: '用于产品包装', capacityUnit: '个/天', minCapacity: 200, maxCapacity: 400 }
        ],
        
        // 工人类型定义
        workerTypes: [
            { id: 'wt1', name: '电子装配工', description: '电子产品组装', compatibleEquipmentTypes: ['et1'], efficiencyRange: [80, 120] },
            { id: 'wt2', name: 'SMT操作员', description: 'SMT设备操作', compatibleEquipmentTypes: ['et2'], efficiencyRange: [85, 115] },
            { id: 'wt3', name: '注塑工', description: '注塑设备操作', compatibleEquipmentTypes: ['et3'], efficiencyRange: [90, 110] },
            { id: 'wt4', name: '质检员', description: '质量检验', compatibleEquipmentTypes: ['et4'], efficiencyRange: [95, 105] },
            { id: 'wt5', name: '包装工', description: '产品包装', compatibleEquipmentTypes: ['et5'], efficiencyRange: [85, 115] }
        ],
        
        // 产品定义（增强版）
        products: [
            { 
                id: 'p1', 
                code: 'P001', 
                name: '智能手表', 
                description: '高端智能手表', 
                unit: '个',
                requiredEquipmentTypes: ['et1', 'et4', 'et5'],
                requiredWorkerTypes: ['wt1', 'wt4', 'wt5'],
                productionTime: 0.5
            },
            { 
                id: 'p2', 
                code: 'P002', 
                name: '无线耳机', 
                description: '降噪无线耳机', 
                unit: '个',
                requiredEquipmentTypes: ['et1', 'et4', 'et5'],
                requiredWorkerTypes: ['wt1', 'wt4', 'wt5'],
                productionTime: 0.3
            }
        ],
        
        // 物料定义
        materials: [
            { id: 'm1', code: 'M001', name: '锂电池', type: '采购', unit: '个', price: 50, safeStock: 50 },
            { id: 'm2', code: 'M002', name: '显示屏', type: '采购', unit: '个', price: 120, safeStock: 30 },
            { id: 'm3', code: 'M003', name: '塑料外壳', type: '采购', unit: '个', price: 15, safeStock: 100 },
            { id: 'm4', code: 'M004', name: '蓝牙芯片', type: '采购', unit: '个', price: 80, safeStock: 40 },
            { id: 'm5', code: 'M005', name: '扬声器单元', type: '采购', unit: '个', price: 30, safeStock: 60 }
        ],
        
        // 供应商定义
        suppliers: [
            { id: 's1', code: 'S001', name: '电子元件有限公司', contact: '张三', phone: '13800138001', address: '深圳市南山区', category: '战略供应商', status: '活跃' },
            { id: 's2', code: 'S002', name: '精密制造有限公司', contact: '李四', phone: '13800138002', address: '东莞市松山湖', category: '核心供应商', status: '活跃' },
            { id: 's3', code: 'S003', name: '芯片科技有限公司', contact: '王八', phone: '13800138003', address: '上海市浦东新区', category: '一般供应商', status: '活跃' }
        ],
        
        // 客户定义
        customers: [
            {
                id: 'c1',
                code: 'C001',
                name: '科技有限公司',
                contact: '王五',
                phone: '13900139001',
                address: '北京市海淀区',
                deliveryRules: [{ type: 'fixed_days', days: 7, priority: 1 }]
            },
            {
                id: 'c2',
                code: 'C002',
                name: '贸易公司',
                contact: '赵六',
                phone: '13900139002',
                address: '上海市浦东新区',
                deliveryRules: [{ type: 'working_days', days: 5, priority: 1 }]
            },
            {
                id: 'c3',
                code: 'C003',
                name: '制造企业',
                contact: '钱七',
                phone: '13900139003',
                address: '广州市天河区',
                deliveryRules: [{ type: 'specific_date', dayOfMonth: 15, priority: 1 }]
            }
        ],
        
        // BOM定义（增强版，包含生产步骤）
        boms: [
            {
                id: 'b1',
                productId: 'p1',
                items: [
                    { materialId: 'm1', quantity: 1 },
                    { materialId: 'm2', quantity: 1 },
                    { materialId: 'm3', quantity: 2 }
                ],
                productionSteps: [
                    { step: 1, name: 'SMT贴片', equipmentTypeId: 'et2', workerTypeId: 'wt2', timeMinutes: 10 },
                    { step: 2, name: '组装', equipmentTypeId: 'et1', workerTypeId: 'wt1', timeMinutes: 15 },
                    { step: 3, name: '测试', equipmentTypeId: 'et4', workerTypeId: 'wt4', timeMinutes: 5 },
                    { step: 4, name: '包装', equipmentTypeId: 'et5', workerTypeId: 'wt5', timeMinutes: 3 }
                ]
            },
            {
                id: 'b2',
                productId: 'p2',
                items: [
                    { materialId: 'm1', quantity: 1 },
                    { materialId: 'm4', quantity: 1 },
                    { materialId: 'm5', quantity: 2 }
                ],
                productionSteps: [
                    { step: 1, name: '组装', equipmentTypeId: 'et1', workerTypeId: 'wt1', timeMinutes: 12 },
                    { step: 2, name: '测试', equipmentTypeId: 'et4', workerTypeId: 'wt4', timeMinutes: 4 },
                    { step: 3, name: '包装', equipmentTypeId: 'et5', workerTypeId: 'wt5', timeMinutes: 2 }
                ]
            }
        ],
        
        // 设备定义
        equipment: [
            { id: 'eq1', code: 'EQ001', name: '1号电子组装线', typeId: 'et1', capacityPerDay: 80, status: '正常', supportedProducts: ['p1', 'p2'] },
            { id: 'eq2', code: 'EQ002', name: '2号电子组装线', typeId: 'et1', capacityPerDay: 60, status: '正常', supportedProducts: ['p1', 'p2'] },
            { id: 'eq3', code: 'EQ003', name: 'SMT贴片机A', typeId: 'et2', capacityPerDay: 300, status: '正常', supportedProducts: ['p1'] },
            { id: 'eq4', code: 'EQ004', name: '测试设备1', typeId: 'et4', capacityPerDay: 150, status: '正常', supportedProducts: ['p1', 'p2'] },
            { id: 'eq5', code: 'EQ005', name: '测试设备2', typeId: 'et4', capacityPerDay: 120, status: '维护', supportedProducts: ['p1', 'p2'] },
            { id: 'eq6', code: 'EQ006', name: '包装线A', typeId: 'et5', capacityPerDay: 250, status: '正常', supportedProducts: ['p1', 'p2'] }
        ],
        
        // 工人定义
        workers: [
            { id: 'w1', code: 'W001', name: '张明', typeId: 'wt1', efficiency: 95, status: '在职', certifiedEquipment: ['eq1', 'eq2'] },
            { id: 'w2', code: 'W002', name: '李华', typeId: 'wt1', efficiency: 88, status: '在职', certifiedEquipment: ['eq1'] },
            { id: 'w3', code: 'W003', name: '王芳', typeId: 'wt2', efficiency: 92, status: '在职', certifiedEquipment: ['eq3'] },
            { id: 'w4', code: 'W004', name: '赵强', typeId: 'wt4', efficiency: 98, status: '在职', certifiedEquipment: ['eq4', 'eq5'] },
            { id: 'w5', code: 'W005', name: '刘丽', typeId: 'wt4', efficiency: 102, status: '在职', certifiedEquipment: ['eq4'] },
            { id: 'w6', code: 'W006', name: '陈伟', typeId: 'wt5', efficiency: 90, status: '在职', certifiedEquipment: ['eq6'] }
        ],
        
        // 工时设置
        workHours: [
            { id: 'wh1', name: '标准工时', dailyHours: 8, weeklyDays: 5, overtimeAllowed: true, maxOvertimeHours: 2 }
        ],
        
        // 订单定义
        orders: [
            { id: 'o1', orderNo: 'SO-20260320-001', customerId: 'c1', productId: 'p1', quantity: 5, deliveryDate: '2026-03-25', status: 'completed', priority: '普通' },
            { id: 'o2', orderNo: 'SO-20260328-001', customerId: 'c2', productId: 'p1', quantity: 10, deliveryDate: '2026-04-05', status: 'pending', priority: '重要' },
            { id: 'o3', orderNo: 'SO-20260328-002', customerId: 'c3', productId: 'p2', quantity: 20, deliveryDate: '2026-04-10', status: 'pending', priority: '普通' }
        ],
        
        // 生产计划定义
        productionPlans: [
            { id: 'pp1', planNo: 'PP-20260315-001', productId: 'p1', quantity: 10, startDate: '2026-03-15', endDate: '2026-03-20', status: 'completed', priority: '重要', equipmentId: 'eq1', workers: ['w1', 'w2'] },
            { id: 'pp2', planNo: 'PP-20260325-001', productId: 'p1', quantity: 15, startDate: '2026-03-25', endDate: '2026-04-01', status: 'in_progress', priority: '紧急', equipmentId: 'eq1', workers: ['w1'] }
        ],
        
        // 采购订单定义
        purchaseOrders: [
            { id: 'po1', orderNo: 'PO-20260301-001', supplierId: 's1', items: [{ materialId: 'm1', quantity: 50, price: 50 }], orderDate: '2026-03-01', expectedDate: '2026-03-05', status: 'completed', totalAmount: 2500 },
            { id: 'po2', orderNo: 'PO-20260328-001', supplierId: 's1', items: [{ materialId: 'm1', quantity: 30, price: 50 }, { materialId: 'm2', quantity: 20, price: 120 }], orderDate: '2026-03-28', expectedDate: '2026-04-03', status: 'pending', totalAmount: 3900 },
            { id: 'po3', orderNo: 'PO-20260328-002', supplierId: 's2', items: [{ materialId: 'm3', quantity: 100, price: 15 }], orderDate: '2026-03-28', expectedDate: '2026-04-02', status: 'in_progress', totalAmount: 1500 }
        ],
        
        // 库存定义
        inventory: {
            materials: [
                { materialId: 'm1', quantity: 100, safeStock: 50 },
                { materialId: 'm2', quantity: 50, safeStock: 30 },
                { materialId: 'm3', quantity: 200, safeStock: 100 },
                { materialId: 'm4', quantity: 40, safeStock: 40 },
                { materialId: 'm5', quantity: 60, safeStock: 60 }
            ],
            products: [
                { productId: 'p1', quantity: 20 },
                { productId: 'p2', quantity: 15 }
            ]
        },
        
        // 库存流水
        inventoryTransactions: [
            { id: 'it1', type: 'purchase_in', materialId: 'm1', productId: null, quantity: 50, referenceDoc: 'PO-20260301-001', date: '2026-03-01', remark: '采购入库-锂电池' },
            { id: 'it2', type: 'production_in', materialId: null, productId: 'p1', quantity: 10, referenceDoc: 'PP-20260315-001', date: '2026-03-15', remark: '生产入库-智能手表' },
            { id: 'it3', type: 'sale_out', materialId: null, productId: 'p1', quantity: 5, referenceDoc: 'SO-20260320-001', date: '2026-03-20', remark: '销售出库' }
        ],
        
        // 质量检验
        qualityInspections: [
            { id: 'qi1', type: 'IQC', sourceType: 'material', sourceId: 'm1', result: 'pass', quantity: 50, qualifiedQty: 48, defectiveQty: 2, inspector: '质检员A', date: '2026-03-01' },
            { id: 'qi2', type: 'OQC', sourceType: 'product', sourceId: 'p1', result: 'pass', quantity: 10, qualifiedQty: 10, defectiveQty: 0, inspector: '质检员B', date: '2026-03-15' }
        ],
        
        // 财务记录
        financialRecords: [
            { id: 'fr1', type: 'AP', sourceType: 'purchase_order', sourceId: 'po1', amount: 5000, paidAmount: 3000, status: 'partial', date: '2026-03-01' },
            { id: 'fr2', type: 'AR', sourceType: 'order', sourceId: 'o1', amount: 12000, paidAmount: 12000, status: 'paid', date: '2026-03-20' }
        ],
        
        // 客户沟通记录
        communications: [],
        
        // 售后工单
        aftersalesTickets: [],
        
        // 满意度调查
        satisfactionSurveys: []
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

/**
 * 获取当前用户信息
 * @returns {Object} 用户信息
 */
export const getCurrentUser = () => {
    try {
        const userInfo = localStorage.getItem(USER_INFO_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return null;
    }
};

/**
 * 获取所有用户信息
 * @returns {Array} 用户信息数组
 */
export const getUsers = () => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return [];
    }
};

/**
 * 设置当前用户
 * @param {string} userId - 用户ID
 * @returns {Object} 用户信息
 */
export const setCurrentUser = (userId) => {
    try {
        const users = getUsers();
        const userInfo = users.find(user => user.id === userId);
        if (userInfo) {
            localStorage.setItem(USER_ID_KEY, userId);
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
            return userInfo;
        }
        return null;
    } catch (error) {
        console.error('设置用户失败:', error);
        return null;
    }
};
