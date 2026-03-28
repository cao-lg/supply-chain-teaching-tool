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
                            <tr v-for="item in data.products" :key="item.id">
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
                            <tr v-for="item in data.materials" :key="item.id">
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
                            <tr v-for="item in data.suppliers" :key="item.id">
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.contact }}</td>
                                <td>{{ item.phone }}</td>
                                <td>{{ item.address }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openSupplierModal(item)">编辑</button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteSupplier(item.id)">删除</button>
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
                            <tr v-for="item in data.boms" :key="item.id">
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
                            <form @submit.prevent="saveProduct">
                                <div class="mb-3">
                                    <label class="form-label">编码</label>
                                    <input type="text" class="form-control" v-model="editingProduct.code" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">名称</label>
                                    <input type="text" class="form-control" v-model="editingProduct.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">描述</label>
                                    <textarea class="form-control" v-model="editingProduct.description" rows="2"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">单位</label>
                                    <input type="text" class="form-control" v-model="editingProduct.unit" required>
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

            <!-- 物料模态框 -->
            <div class="modal fade" id="materialModal" tabindex="-1" ref="materialModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingMaterial.id ? '编辑物料' : '添加物料' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveMaterial">
                                <div class="mb-3">
                                    <label class="form-label">编码</label>
                                    <input type="text" class="form-control" v-model="editingMaterial.code" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">名称</label>
                                    <input type="text" class="form-control" v-model="editingMaterial.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">类型</label>
                                    <select class="form-select" v-model="editingMaterial.type" required>
                                        <option value="采购">采购</option>
                                        <option value="自制">自制</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">单位</label>
                                    <input type="text" class="form-control" v-model="editingMaterial.unit" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">单价</label>
                                    <input type="number" class="form-control" v-model="editingMaterial.price" required min="0" step="0.01">
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

            <!-- 供应商模态框 -->
            <div class="modal fade" id="supplierModal" tabindex="-1" ref="supplierModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingSupplier.id ? '编辑供应商' : '添加供应商' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveSupplier">
                                <div class="mb-3">
                                    <label class="form-label">编码</label>
                                    <input type="text" class="form-control" v-model="editingSupplier.code" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">名称</label>
                                    <input type="text" class="form-control" v-model="editingSupplier.name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">联系人</label>
                                    <input type="text" class="form-control" v-model="editingSupplier.contact">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">电话</label>
                                    <input type="text" class="form-control" v-model="editingSupplier.phone">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">地址</label>
                                    <textarea class="form-control" v-model="editingSupplier.address" rows="2"></textarea>
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

            <!-- BOM模态框 -->
            <div class="modal fade" id="bomModal" tabindex="-1" ref="bomModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editingBom.id ? '编辑BOM' : '添加BOM' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveBom">
                                <div class="mb-3">
                                    <label class="form-label">产品</label>
                                    <select class="form-select" v-model="editingBom.productId" required>
                                        <option v-for="product in data.products" :key="product.id" :value="product.id">
                                            {{ product.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">物料清单</label>
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
                                            <button type="button" class="btn btn-outline-danger" @click="removeBomItem(index)">删除</button>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-outline-primary" @click="addBomItem">添加物料</button>
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
            activeTab: 'products',
            data: loadData(),
            editingProduct: {},
            editingMaterial: {},
            editingSupplier: {},
            editingBom: { items: [] }
        };
    },
    methods: {
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
            if (confirm('确定要删除这个产品吗？')) {
                this.data.products = this.data.products.filter(p => p.id !== id);
                saveData(this.data);
            }
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
            if (confirm('确定要删除这个物料吗？')) {
                this.data.materials = this.data.materials.filter(m => m.id !== id);
                saveData(this.data);
            }
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
            if (confirm('确定要删除这个供应商吗？')) {
                this.data.suppliers = this.data.suppliers.filter(s => s.id !== id);
                saveData(this.data);
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
            if (confirm('确定要删除这个BOM吗？')) {
                this.data.boms = this.data.boms.filter(b => b.id !== id);
                saveData(this.data);
            }
        },
        getProductName(id) {
            const product = this.data.products.find(p => p.id === id);
            return product ? product.name : '未知产品';
        },
        getMaterialName(id) {
            const material = this.data.materials.find(m => m.id === id);
            return material ? material.name : '未知物料';
        }
    }
};
