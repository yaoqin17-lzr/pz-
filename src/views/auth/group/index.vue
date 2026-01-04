<template>
    <panel-head :route="route" />
    <div class="btns">
        <el-button type="primary" @click="open(null)" size="small">新增</el-button>
    </div>
    <el-table :data="tableData.list" style="width: 100%">
        <el-table-column prop="id" label="id" />
        <el-table-column prop="name" label="昵称" />
        <el-table-column prop="permissionName" label="菜单权限" width="500" />
        <el-table-column label="操作">
            <!-- 作用域插槽拿到当前列 -->
            <template #default="scope">
                <div>
                    <el-button type="primary" @click="open(scope.row)">编辑</el-button>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination-info">
        <el-pagination size="small" v-model:current-page="pageData.pageNum" :page-size="pageData.pageSize"
            :background="false" layout="total, prev, pager, next" :total="tableData.total"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <el-dialog v-model="dialogForm" title="添加权限" width="500" :before-close="handleClose">
        <el-form :rules="rules" ref="formRef" label-width="100px" label-position="left" :model="form">
            <el-form-item v-show="false" prop="id">
                <el-input v-model="form.id"></el-input>
            </el-form-item>
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="请填写权限名称"></el-input>
            </el-form-item>
            <el-form-item label="权限" prop="permissions">
                <el-tree ref="treeRef" style="max-width: 600px" :data="permissionData" show-checkbox node-key="id"
                    :default-checked-keys="defaultkeys" :default-expanded-keys="[2]" :props="defaultProps" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="confirm(formRef)">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { userGetMenu, userSetMenu, menuList } from '../../../api'
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const pageData = reactive({
    pageNum: '1',
    pageSize: '10'
})
// 点击页码的回调
const handleSizeChange = (val) => {
    pageData.pageSize = val
    getListData()
}
// 点击当前页码的回调
const handleCurrentChange = (val) => {
    pageData.pageNum = val
    getListData()
}

onMounted(() => {
    // 菜单数据
    userGetMenu().then(({ data }) => {
        permissionData.value = data.data
    })
    getListData()
})

// 列表数据
const tableData = reactive({
    list: [],
    total: 0
})

// 请求列表数据
const getListData = () => {
    menuList(pageData).then(({ data }) => {
        console.log(data.data);
        const { list, total } = data.data
        tableData.list = list
        tableData.total = total
    })
}
// 打开弹框
const open = (rowData = {}) => {
    dialogForm.value = true
    // form弹框打开form生成是异步的
    nextTick(() => {
        if (rowData) {
            Object.assign(form, { id: rowData.id, name: rowData.name })
            treeRef.value.setCheckedKeys(rowData.permission)
        }
    })
}

// 树型菜单权限数据
const permissionData = ref({})
// 控制弹框
const dialogForm = ref(false)
const formRef = ref()
// 
const form = reactive({
    name: '',
    permissions: '',
    id: ''
})
// 关闭弹框的回调
const handleClose = () => {
    dialogForm.value = false
    // 重置表单
    formRef.value.resetFields()
    // tree选择重置
    treeRef.value.setCheckedKeys(defaultkeys)
}
// 表单检验
const rules = reactive({
    name: [{ required: true, trigger: 'blur', message: '请输入权限名称' }]
})
// 表单提交
const confirm = () => {
    const permissions = JSON.stringify(treeRef.value.getCheckedKeys())
    console.log(permissions);
    userSetMenu({
        // 获取到选择的checkedbox数据
        name: form.name,
        permissions,
        id: form.id
    }).then(({ data }) => {
        handleClose()
        getListData()
    }).catch((e) => {
        console.log(e);
    })
}
// 选中权限
const defaultkeys = [4, 5]
const treeRef = ref()
</script>
<style lang="less">
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
</style>