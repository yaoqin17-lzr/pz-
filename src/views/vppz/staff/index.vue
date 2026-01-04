<template>
    <panel-head :route="route" />
    <div class="btns">
        <el-button type="primary" @click="open(null)" size="small">新增</el-button>
        <el-popconfirm confirm-button-text="是" cancel-button-text="否" width="220" :icon="InfoFilled"
            icon-color="#626AEF" title="确认删除吗" @confirm="confirmEvent">
            <template #reference>
                <el-button type="danger" :icon="Delete" size="small">删除</el-button>
            </template>
        </el-popconfirm>
    </div>
    <el-table :data="tableData.list" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="name" label="昵称" />
        <el-table-column prop="avatar" label="头像">
            <template #default="scope">
                <el-image style="width: 50px;height: 50px;" :src="scope.row.avatar">
                </el-image>
            </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别">
            <template #default="scope">
                {{ scope.row.sex === "1" ? '男' : '女' }}
            </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" />
        <el-table-column prop="active" label="状态">
            <template #default="scope">
                <el-tag :type="scope.row.active ? 'success' : 'danger'">{{ scope.row.active ? '正常' : '失效' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间">

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
    <el-dialog v-model="dialogForm" title="添加陪诊师" width="500" :before-close="handleClose">
        <el-form :rules="rules" ref="formRef" label-width="100px" label-position="left" :model="form">
            <el-form-item v-show="false" prop="id">
                <el-input v-model="form.id"></el-input>
            </el-form-item>
            <el-form-item label="昵称" prop="name">
                <el-input v-model="form.name" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
                <!-- 头像上传 -->
                <el-button type="primary" v-if="!form.avatar" @click="dialogImage = true" size="small">点击上传</el-button>
                <el-image v-else :src="form.avatar" style="width: 100px; height: 100px;" />
            </el-form-item>
            <el-form-item label="性别" prop="sex">
                <el-select v-model="form.sex" placeholder="请选择性别">
                    <el-option label="男" value="1"></el-option>
                    <el-option label="女" value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="年龄" prop="age">
                <el-input-number v-model="form.age" :min="18" :max="50" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="form.mobile" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item label="是否生效" prop="active">
                <el-radio-group v-model="form.active">
                    <el-radio :value="1" size="large">生效</el-radio>
                    <el-radio :value="0" size="large">失效</el-radio>
                </el-radio-group>
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
    <!-- 图片上传的弹框 -->
    <el-dialog v-model="dialogImage" title="选择图片" width="680" :before-close="handleClose">
        <div class="image-list">
            <div @click="selectIndex = index" v-for="(item, index) in fileList" :key="item.name" class="img-box">
                <div v-if="selectIndex === index" class="select">
                    <el-icon color="#fff">
                        <Check />
                    </el-icon>
                </div>
                <el-image style="width: 148px;height: 148px;" :src="item.url" />
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogImage = false">
                    取消
                </el-button>
                <el-button type="primary" @click="confirmImg">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { photoList, addCompanion, companionList, deleteCompanion } from '../../../api'
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Delete } from "@element-plus/icons-vue";
import dayjs from 'dayjs'

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
// 头像列表
const fileList = ref([])
// 选中图片
const selectIndex = ref(0)
// 选择头像
const dialogImage = ref(false)

// 确认上传图片
const confirmImg = () => {
    form.avatar = fileList.value[selectIndex.value].url
    dialogImage.value = false
}

onMounted(() => {
    // 头像数据
    photoList().then(({ data }) => {
        fileList.value = data.data
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
    companionList(pageData).then(({ data }) => {
        console.log(data.data);
        const { list, total } = data.data
        list.forEach(element => {
            element.create_time = dayjs(element.create_time).format('YYYY-MM-DD')
        });
        tableData.list = list
        tableData.total = total
    })
}
// 编辑弹框
const open = (rowData = {}) => {
    dialogForm.value = true
    // form弹框打开form生成是异步的
    nextTick(() => {
        if (rowData) {
            Object.assign(form, rowData)
            // treeRef.value.setCheckedKeys(rowData.permission)
        }
    })
}

const selectTableData = ref([])
// 选择复选框拿到勾选的数据
const handleSelectionChange = (val) => {
    // 遍历拿到id返回出去
    selectTableData.value = val.map(item => ({ id: item.id }))
}
// 确认删除
const confirmEvent = () => {
    if (!selectTableData.value.length) {
        return ElMessage.warning("请选择至少一项数据")
    }
    deleteCompanion({ id: selectTableData.value }).then(({ data }) => {
        if (data.code === 10000) {
            console.log(data.data);
            getListData()
        }
    })
}

// 控制弹框
const dialogForm = ref(false)
const formRef = ref()
// 表单绑定
const form = reactive({
    id: '',
    name: '',
    mobile: '',
    active: 1,
    age: '',
    avatar: '',
    sex: ''
})
// 关闭弹框的回调
const handleClose = () => {
    dialogForm.value = false
    // 重置表单
    formRef.value.resetFields()
}
// 表单检验
const rules = reactive({
    name: [{ required: true, trigger: 'blur', message: '请输入昵称' }],
    avatar: [{ required: true, message: '请选择头像' }],
    sex: [{ required: true, trigger: 'change', message: '请选择性别' }],
    mobile: [{ required: true, trigger: 'blur', message: '请输入手机号' }],

})
// 表单提交
const confirm = () => {
    dialogForm.value = false
    addCompanion(form).then(({ data }) => {
        console.log(data);
        if (data.code === 10000) {
            ElMessage.success('成功')
        }
        else {
            ElMessage.error(data.message)
        }
        handleClose()
        getListData()
    }).catch((e) => {
        console.log(e);
    })
}
</script>
<style lang="less">
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}

.image-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .img-box {
        position: relative;

        .select {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 24px;
            height: 24px;
            background-color: #67c23a;
            z-index: 999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .el-image {
        margin-right: 10px;
        margin-bottom: 10px;
    }
}
</style>