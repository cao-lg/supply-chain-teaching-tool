/**
 * 基础资料管理模块
 * 包含产品、物料、供应商、BOM的管理功能
 */

import { loadData, saveData, generateId } from '../store.js';

/**
 * 基础资料管理组件
 */
export default {
    name: 'BasicDataModule',
    template: `
        <div>
            <h2 class="mb-4">基础资料管理</h2>
            
            <!-- 选项卡导航 -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">产品</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'materials' }" @click="activeTab = 'materials'">物料</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'suppliers' }" @click="activeTab = 'suppliers'">供应商</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'customers' }" @click="activeTab = 'customers'">客户</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'boms' }" @click="activeTab = 'boms'">BOM</a>
                </li>
            </ul>

            <!-- 产品管理 -->
            <div v-if="activeTab === 'products'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>产品列表</h5>
                    <button class="btn btn-primary" @click="openProductModal()">添加产品</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>编码</th>
                                <th>名称</th>
                                <th>描述</th>
                                <th>单位</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.products.length === 0">
                                <td colspan="5" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                                        <h5>暂无产品数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个产品</p>
                                        <button class="btn btn-primary" @click="openProductModal()">
                                            <i class="fas fa-plus"></i> 添加产品
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.products" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.description }}</td>
                                <td>{{ item.unit }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openProductModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 物料管理 -->
            <div v-if="activeTab === 'materials'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>物料列表</h5>
                    <button class="btn btn-primary" @click="openMaterialModal()">添加物料</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>编码</th>
                                <th>名称</th>
                                <th>类型</th>
                                <th>单位</th>
                                <th>单价</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.materials.length === 0">
                                <td colspan="6" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-boxes fa-3x mb-3 d-block"></i>
                                        <h5>暂无物料数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个物料</p>
                                        <button class="btn btn-primary" @click="openMaterialModal()">
                                            <i class="fas fa-plus"></i> 添加物料
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.materials" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.type }}</td>
                                <td>{{ item.unit }}</td>
                                <td>¥{{ item.price }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openMaterialModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteMaterial(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 供应商管理 -->
            <div v-if="activeTab === 'suppliers'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>供应商列表</h5>
                    <button class="btn btn-primary" @click="openSupplierModal()">添加供应商</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>编码</th>
                                <th>名称</th>
                                <th>联系人</th>
                                <th>电话</th>
                                <th>地址</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.suppliers.length === 0">
                                <td colspan="6" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-truck fa-3x mb-3 d-block"></i>
                                        <h5>暂无供应商数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个供应商</p>
                                        <button class="btn btn-primary" @click="openSupplierModal()">
                                            <i class="fas fa-plus"></i> 添加供应商
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.suppliers" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.contact }}</td>
                                <td>{{ item.phone }}</td>
                                <td>{{ item.address || '' }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openSupplierModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteSupplier(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 客户管理 -->
            <div v-if="activeTab === 'customers'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>客户列表</h5>
                    <button class="btn btn-primary" @click="openCustomerModal()">添加客户</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>编码</th>
                                <th>名称</th>
                                <th>联系人</th>
                                <th>电话</th>
                                <th>地址</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.customers.length === 0">
                                <td colspan="6" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-users fa-3x mb-3 d-block"></i>
                                        <h5>暂无客户数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个客户</p>
                                        <button class="btn btn-primary" @click="openCustomerModal()">
                                            <i class="fas fa-plus"></i> 添加客户
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.customers" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.contact }}</td>
                                <td>{{ item.phone }}</td>
                                <td>{{ item.address || '' }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openCustomerModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteCustomer(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- BOM管理 -->
            <div v-if="activeTab === 'boms'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>BOM列表</h5>
                    <button class="btn btn-primary" @click="openBomModal()">添加BOM</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>产品</th>
                                <th>物料清单</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.boms.length === 0">
                                <td colspan="3" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-sitemap fa-3x mb-3 d-block"></i>
                                        <h5>暂无BOM数据</h5>
                                        <p class="mb-3">点击下方按钮创建第一个BOM</p>
                                        <button class="btn btn-primary" @click="openBomModal()">
                                            <i class="fas fa-plus"></i> 添加BOM
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else v-for="item in data.boms" :key="item.id">
                                <td>{{ getProductName(item.productId) }}</td>
                                <td>
                                    <ul class="list-unstyled mb-0">
                                        <li v-for="bomItem in item.items" :key="bomItem.materialId">
                                            {{ getMaterialName(bomItem.materialId) }} x {{ bomItem.quantity }}
                                        </li>
                                    </ul>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openBomModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteBom(item.id)">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 产品模态框 -->
            <div class="modal fade" id="productModal" tabindex="-1" ref="productModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingProduct.id ? '编辑产品' : '添加产品' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveProduct" class="form-compact">
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">编码 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingProduct.code" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">名称 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingProduct.name" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">描述</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <textarea class="form-control" v-model="editingProduct.description" rows="2"></textarea>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">单位 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingProduct.unit" required>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-sm btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 物料模态框 -->
            <div class="modal fade" id="materialModal" tabindex="-1" ref="materialModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingMaterial.id ? '编辑物料' : '添加物料' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveMaterial" class="form-compact">
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">编码 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingMaterial.code" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">名称 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingMaterial.name" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">类型 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="editingMaterial.type" required>
                                            <option value="采购">采购</option>
                                            <option value="自制">自制</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">单位 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingMaterial.unit" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">单价 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="number" class="form-control" v-model="editingMaterial.price" required min="0" step="0.01">
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-sm btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 供应商模态框 -->
            <div class="modal fade" id="supplierModal" tabindex="-1" ref="supplierModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingSupplier.id ? '编辑供应商' : '添加供应商' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveSupplier" class="form-compact">
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">编码 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingSupplier.code" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">名称 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingSupplier.name" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">联系人</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingSupplier.contact">
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">电话</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingSupplier.phone">
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">地址</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <textarea class="form-control" v-model="editingSupplier.address" rows="2"></textarea>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">分类</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="editingSupplier.category">
                                            <option value="">未分类</option>
                                            <option value="战略供应商">战略供应商</option>
                                            <option value="核心供应商">核心供应商</option>
                                            <option value="一般供应商">一般供应商</option>
                                            <option value="临时供应商">临时供应商</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">状态</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="editingSupplier.status">
                                            <option value="活跃">活跃</option>
                                            <option value="暂停">暂停</option>
                                            <option value="终止">终止</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-sm btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 供应商评估模态框 -->
            <div class="modal fade" id="supplierEvaluationModal" tabindex="-1" ref="supplierEvaluationModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">供应商评估 - {{ evaluatingSupplier.name }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveSupplierEvaluation" class="form-compact">
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">整体评分</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <div class="d-flex align-items-center">
                                            <input type="range" class="form-range me-3" v-model="evaluation.rating" min="0" max="5" step="0.5" style="flex: 1;">
                                            <span class="fs-4">{{ evaluation.rating }}</span>
                                        </div>
                                        <div class="stars mt-2">
                                            <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= evaluation.rating }" @click="evaluation.rating = i">★</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">质量评分</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="evaluation.qualityScore">
                                            <option value="5">优秀</option>
                                            <option value="4">良好</option>
                                            <option value="3">一般</option>
                                            <option value="2">较差</option>
                                            <option value="1">差</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">交期评分</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="evaluation.deliveryScore">
                                            <option value="5">优秀</option>
                                            <option value="4">良好</option>
                                            <option value="3">一般</option>
                                            <option value="2">较差</option>
                                            <option value="1">差</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">服务评分</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="evaluation.serviceScore">
                                            <option value="5">优秀</option>
                                            <option value="4">良好</option>
                                            <option value="3">一般</option>
                                            <option value="2">较差</option>
                                            <option value="1">差</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">评价</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <textarea class="form-control" v-model="evaluation.comment" rows="3"></textarea>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-sm btn-primary">保存评估</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 客户模态框 -->
            <div class="modal fade" id="customerModal" tabindex="-1" ref="customerModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingCustomer.id ? '编辑客户' : '添加客户' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveCustomer" class="form-compact">
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">编码 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingCustomer.code" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">名称 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingCustomer.name" required>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">联系人</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingCustomer.contact">
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">电话</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" v-model="editingCustomer.phone">
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">地址</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <textarea class="form-control" v-model="editingCustomer.address" rows="2"></textarea>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">交货日期规则</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <div v-for="(rule, index) in editingCustomer.deliveryRules" :key="index" class="border p-3 mb-2">
                                            <div class="row mb-2">
                                                <div class="col-md-4">
                                                    <label class="form-label">规则类型</label>
                                                    <select class="form-select" v-model="rule.type" required>
                                                        <option value="fixed_days">固定天数</option>
                                                        <option value="working_days">工作日计算</option>
                                                        <option value="specific_date">特定日期</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-4" v-if="rule.type === 'fixed_days' || rule.type === 'working_days'">
                                                    <label class="form-label">天数</label>
                                                    <input type="number" class="form-control" v-model="rule.days" required min="1">
                                                </div>
                                                <div class="col-md-4" v-if="rule.type === 'specific_date'">
                                                    <label class="form-label">每月日期</label>
                                                    <input type="number" class="form-control" v-model="rule.dayOfMonth" required min="1" max="31">
                                                </div>
                                                <div class="col-md-4">
                                                    <label class="form-label">优先级</label>
                                                    <input type="number" class="form-control" v-model="rule.priority" required min="1">
                                                </div>
                                                <div class="col-md-2 align-self-end">
                                                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeDeliveryRule(index)">删除</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addDeliveryRule">添加规则</button>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-sm btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BOM模态框 -->
            <div class="modal fade" id="bomModal" tabindex="-1" ref="bomModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingBom.id ? '编辑BOM' : '添加BOM' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveBom" class="form-compact">
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">产品 *</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <select class="form-select" v-model="editingBom.productId" required>
                                            <option v-for="product in data.products" :key="product.id" :value="product.id">
                                                {{ product.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-3">
                                        <label class="form-label">物料清单</label>
                                    </div>
                                    <div class="col-sm-9">
                                        <div v-for="(item, index) in editingBom.items" :key="index" class="row mb-2">
                                            <div class="col-6">
                                                <select class="form-select" v-model="item.materialId" required>
                                                    <option v-for="material in data.materials" :key="material.id" :value="material.id">
                                                        {{ material.name }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-4">
                                                <input type="number" class="form-control" v-model="item.quantity" placeholder="数量" required min="1">
                                            </div>
                                            <div class="col-2">
                                                <button type="button" class="btn btn-sm btn-outline-danger" @click="removeBomItem(index)">删除</button>
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addBomItem">添加物料</button>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-sm btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 确认删除模态框 -->
            <div class="modal fade" id="confirmDeleteModal" tabindex="-1" ref="confirmDeleteModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">确认删除</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>{{ confirmMessage }}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-sm btn-danger" @click="executeDelete">确定删除</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            activeTab: 'products',
            data: loadData(),
            editingProduct: {},
            editingMaterial: {},
            editingSupplier: {},
            editingCustomer: { deliveryRules: [] },
            editingBom: { items: [] },
            evaluatingSupplier: {},
            evaluation: {
                rating: 0,
                qualityScore: 3,
                deliveryScore: 3,
                serviceScore: 3,
                comment: ''
            },
            confirmMessage: '',
            pendingDeleteCallback: null
        };
    },
    mounted() {
        // 监听数据更新事件
        window.addEventListener('data-updated', this.refreshData);
    },
    beforeUnmount() {
        // 移除事件监听
        window.removeEventListener('data-updated', this.refreshData);
    },
    watch: {
        // 当组件激活时刷新数据
        activeTab() {
            this.refreshData();
        }
    },
    methods: {
        /**
         * 刷新数据
         */
        refreshData() {
            this.data = loadData();
        },
        // 产品管理
        openProductModal(product = null) {
            this.editingProduct = product ? { ...product } : { code: '', name: '', description: '', unit: '' };
            new bootstrap.Modal(this.$refs.productModal).show();
        },
        saveProduct() {
            if (this.editingProduct.id) {
                const index = this.data.products.findIndex(p => p.id === this.editingProduct.id);
                if (index !== -1) this.data.products[index] = { ...this.editingProduct };
            } else {
                this.data.products.push({ ...this.editingProduct, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.productModal).hide();
        },
        deleteProduct(id) {
            this.confirmDelete('确定要删除这个产品吗？', () => {
                this.data.products = this.data.products.filter(p => p.id !== id);
                saveData(this.data);
            });
        },

        // 物料管理
        openMaterialModal(material = null) {
            this.editingMaterial = material ? { ...material } : { code: '', name: '', type: '采购', unit: '', price: 0 };
            new bootstrap.Modal(this.$refs.materialModal).show();
        },
        saveMaterial() {
            if (this.editingMaterial.id) {
                const index = this.data.materials.findIndex(m => m.id === this.editingMaterial.id);
                if (index !== -1) this.data.materials[index] = { ...this.editingMaterial };
            } else {
                this.data.materials.push({ ...this.editingMaterial, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.materialModal).hide();
        },
        deleteMaterial(id) {
            this.confirmDelete('确定要删除这个物料吗？', () => {
                this.data.materials = this.data.materials.filter(m => m.id !== id);
                saveData(this.data);
            });
        },

        // 供应商管理
        openSupplierModal(supplier = null) {
            this.editingSupplier = supplier ? { ...supplier } : { code: '', name: '', contact: '', phone: '', address: '' };
            new bootstrap.Modal(this.$refs.supplierModal).show();
        },
        saveSupplier() {
            if (this.editingSupplier.id) {
                const index = this.data.suppliers.findIndex(s => s.id === this.editingSupplier.id);
                if (index !== -1) this.data.suppliers[index] = { ...this.editingSupplier };
            } else {
                this.data.suppliers.push({ ...this.editingSupplier, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.supplierModal).hide();
        },
        deleteSupplier(id) {
            this.confirmDelete('确定要删除这个供应商吗？', () => {
                this.data.suppliers = this.data.suppliers.filter(s => s.id !== id);
                saveData(this.data);
            });
        },

        // 客户管理
        openCustomerModal(customer = null) {
            this.editingCustomer = customer ? { ...customer, deliveryRules: [...customer.deliveryRules] } : { code: '', name: '', contact: '', phone: '', address: '', deliveryRules: [{ type: 'fixed_days', days: 7, priority: 1 }] };
            new bootstrap.Modal(this.$refs.customerModal).show();
        },
        saveCustomer() {
            if (this.editingCustomer.id) {
                const index = this.data.customers.findIndex(c => c.id === this.editingCustomer.id);
                if (index !== -1) this.data.customers[index] = { ...this.editingCustomer };
            } else {
                this.data.customers.push({ ...this.editingCustomer, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.customerModal).hide();
        },
        deleteCustomer(id) {
            this.confirmDelete('确定要删除这个客户吗？', () => {
                this.data.customers = this.data.customers.filter(c => c.id !== id);
                saveData(this.data);
            });
        },
        addDeliveryRule() {
            this.editingCustomer.deliveryRules.push({ type: 'fixed_days', days: 7, priority: 1 });
        },
        removeDeliveryRule(index) {
            this.editingCustomer.deliveryRules.splice(index, 1);
        },

        // 供应商评估
        openSupplierEvaluationModal(supplier) {
            this.evaluatingSupplier = { ...supplier };
            this.evaluation = {
                rating: supplier.rating || 0,
                qualityScore: supplier.qualityScore || 3,
                deliveryScore: supplier.deliveryScore || 3,
                serviceScore: supplier.serviceScore || 3,
                comment: supplier.comment || ''
            };
            new bootstrap.Modal(this.$refs.supplierEvaluationModal).show();
        },
        saveSupplierEvaluation() {
            const index = this.data.suppliers.findIndex(s => s.id === this.evaluatingSupplier.id);
            if (index !== -1) {
                this.data.suppliers[index] = {
                    ...this.data.suppliers[index],
                    rating: this.evaluation.rating,
                    qualityScore: this.evaluation.qualityScore,
                    deliveryScore: this.evaluation.deliveryScore,
                    serviceScore: this.evaluation.serviceScore,
                    comment: this.evaluation.comment,
                    lastEvaluationDate: new Date().toISOString().split('T')[0]
                };
                saveData(this.data);
                bootstrap.Modal.getInstance(this.$refs.supplierEvaluationModal).hide();
                alert('供应商评估保存成功！');
            }
        },

        // BOM管理
        openBomModal(bom = null) {
            this.editingBom = bom ? { ...bom, items: [...bom.items] } : { productId: '', items: [{ materialId: '', quantity: 1 }] };
            new bootstrap.Modal(this.$refs.bomModal).show();
        },
        addBomItem() {
            this.editingBom.items.push({ materialId: '', quantity: 1 });
        },
        removeBomItem(index) {
            this.editingBom.items.splice(index, 1);
        },
        saveBom() {
            if (this.editingBom.id) {
                const index = this.data.boms.findIndex(b => b.id === this.editingBom.id);
                if (index !== -1) this.data.boms[index] = { ...this.editingBom };
            } else {
                this.data.boms.push({ ...this.editingBom, id: generateId() });
            }
            saveData(this.data);
            bootstrap.Modal.getInstance(this.$refs.bomModal).hide();
        },
        deleteBom(id) {
            this.confirmDelete('确定要删除这个BOM吗？', () => {
                this.data.boms = this.data.boms.filter(b => b.id !== id);
                saveData(this.data);
            });
        },
        getProductName(id) {
            const product = this.data.products.find(p => p.id === id);
            return product ? product.name : '未知产品';
        },
        getMaterialName(id) {
            const material = this.data.materials.find(m => m.id === id);
            return material ? material.name : '未知物料';
        },
        /**
         * 显示确认删除弹窗
         * @param {string} message - 确认消息
         * @param {Function} callback - 确认后的回调函数
         */
        confirmDelete(message, callback) {
            this.confirmMessage = message;
            this.pendingDeleteCallback = callback;
            new bootstrap.Modal(this.$refs.confirmDeleteModal).show();
        },
        /**
         * 执行删除操作
         */
        executeDelete() {
            if (this.pendingDeleteCallback) {
                this.pendingDeleteCallback();
                this.pendingDeleteCallback = null;
            }
            bootstrap.Modal.getInstance(this.$refs.confirmDeleteModal).hide();
        }
    }
};
