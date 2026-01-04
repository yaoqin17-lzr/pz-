<template>
    <panel-head :route="route"/>
    <div>
        <el-table :data="tableData.list" style="width: 100%">
            <el-table-column prop="id" label="id" />
            <el-table-column prop="name" label="昵称" />
            <el-table-column prop="permissions_id" label="所属组别">
                <template #default="scope">
                    {{ permissionName(scope.row.permissions_id) }}
                </template>
            </el-table-column>
            <el-table-column prop="mobile" label="手机号" />
            <el-table-column prop="active" label="状态">
                <template #default="scope">
                    <el-tag :type="scope.row.active ? 'success' : 'danger'">{{ scope.row.active ? '正常' : '失效' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间">
                <!-- <template #default="scope">
                    <el-tag :type="scope.row.active ? 'succ3' : 'danger'">{{ scope.row.active ? '正常' : '失效' }}</el-tag>
                </template> -->
            </el-table-column>
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
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="form.mobile" disabled></el-input>
                </el-form-item>
                <el-form-item label="昵称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="菜单权限" prop="permissions_id">
                    <el-select v-model="form.permissions_id" placeholder="请选择菜单权限" style="width: 240px">
                        <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
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
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { authAdmin, updateUser, menuSelectList } from '../../../api'
const route = useRoute()

import { ref, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
const pageData = reactive({
    pageNum: '1',
    pageSize: '10'
})
// 列表数据
const tableData = reactive({
    list: [],
    total: 0
})
// 获取列表数据
const getListData = () => {
    authAdmin(pageData).then(({ data }) => {
        console.log(data.data);
        const { list, total } = data.data
        list.forEach(element => {
            element.create_time = dayjs(element.create_time).format('YYYY-MM-DD')
        });
        tableData.list = list
        tableData.total = total
    })
}
onMounted(() => {

    menuSelectList().then(({ data }) => {
        console.log(data.data);
        options.value = data.data
    })
    getListData()

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

// 弹框
const dialogForm = ref(false)
// 编辑表单
const formRef = ref()
const form = reactive({
    id: '',
    mobile: '',
    name: '',
    permissions_id: '',
})

// 表单提交
const confirm = () => {
    console.log(form);
    updateUser({
        name: form.name,
        permissions_id: form.permissions_id
    }).then(({ data }) => {
        console.log(data.data);
        if (data.code === 10000) {
            dialogForm.value = false
            getListData()
        }
        // handleClose()
    }).catch((e) => {
        console.log(e);
    })
}

const options = ref([])
// 根据权限id匹配名称
const permissionName = (id) => {
    const data = options.value.find(el => el.id === id)
    return data ? data.name : '超级管理员'
}
// 关闭弹框的回调
const handleClose = () => {
    dialogForm.value = false
    // // 重置表单
    // formRef.value.resetFields()
    // // tree选择重置
    // treeRef.value.setCheckedKeys(defaultkeys)
}
const open = (rowData) => {
    dialogForm.value = true
    Object.assign(form, { mobile: rowData.mobile, name: rowData.name, permissions_id: rowData.permissions_id })
}
const rules = reactive({
    name: [{ required: true, trigger: 'blur', message: '请输入昵称' }],
    permissions_id: [{ required: true, trigger: 'blur', message: '请选择权限' }]
})

</script>
<style lang="less">
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
</style>