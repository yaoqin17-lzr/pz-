<template>
    <el-row class="login-container" justify="center" :align="'middle'">
        <el-card style="max-width: 480px;">
            <template #header>
                <div class="card-header">
                    <img :src="imgUrl" alt="">
                </div>
            </template>
            <div class="jump-link">
                <el-link type="primary" @click="handleChange">{{ formType ? '返回登录' : '注册账号' }}</el-link>
            </div>
            <!-- 表单内容 -->
            <el-form ref="loginFormRef" :rules="rules" :model="loginForm" label-width="auto" style="max-width: 600px">
                <el-form-item prop="userName">
                    <el-input v-model="loginForm.userName" placeholder="手机号" />
                </el-form-item>
                <el-form-item prop="passWord">
                    <el-input type="password" v-model="loginForm.passWord" placeholder="密码" />
                </el-form-item>
                <!-- 因为验证码在注册页面才存在 -->
                <el-form-item v-if="formType" prop="userName">
                    <el-input v-model="loginForm.validCode" placeholder="验证码">
                        <!-- 发送验证码 -->
                        <template #append>
                            <span @click="countDownChange">{{ countDown.validText }}</span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :style="{ width: '100%' }" @click="submitForm(loginFormRef)">
                        {{ formType ? '注册账号' : '登录' }}
                    </el-button>
                </el-form-item>

            </el-form>
        </el-card>
    </el-row>
</template>

<script setup>
import { ref, reactive, computed, toRaw } from 'vue'
import { getCode, userAuthentication, login, menuPermissions } from '../../api/index'
import { useRouter } from 'vue-router'
//1.导入use打头的方法
import { useMenuStore } from '../../store/menu'
//2.执行方法得到store实例对象
const menuStore = useMenuStore()
const imgUrl = new URL('../../../public/login-head.png', import.meta.url).href
// 表单切换(0登录,1注册)
const formType = ref(0)
const handleChange = () => {
    formType.value = formType.value ? 0 : 1
}
// 定义表单数据
const loginForm = reactive({
    userName: '',
    passWord: '',
    validCode: ''
})
// 发送短信
const countDown = reactive({
    validText: '获取验证码',
    validTime: 60
})
// 账号(手机号)校验规则
const validateUser = (rule, value, callback) => {
    // 账号不能为空
    if (value === '') {
        callback(new Error('请输入账号'))
    } else {
        const phone = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
        phone.test(value) ? callback() : callback(new Error('手机号格式不对,请输入正确的手机号'))
    }
}
// 密码校验规则
const validatePass = (rule, value, callback) => {
    // 密码不能为空
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        const password = /^[a-zA-Z0-9_-]{4,16}$/
        password.test(value) ? callback() : callback(new Error('密码格式不对,请输入4到16位密码'))
    }
}

// 表单检验
const rules = reactive(
    {
        userName: [{ validator: validateUser, trigger: 'blur' }],
        passWord: [{ validator: validatePass, trigger: 'blur' }],
    }
)

// 创建标识只能有一个倒计时
let flag = false
const countDownChange = () => {
    // 如果已发送不处理
    if (flag) return
    // 正则验证手机号
    const phone = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!loginForm.userName || !phone.test(loginForm.userName)) {
        return ElMessage({
            message: '请检查手机号是否正确',
            type: 'info',
            plain: true,
        })
    }
    // 倒计时
    const time = setInterval(() => {
        if (countDown.validTime <= 0) {
            countDown.validTime = 60
            countDown.validText = '获取验证码'
            flag = false
            clearInterval(time)
        } else {
            countDown.validTime -= 1
            countDown.validText = `剩余${countDown.validTime}s`
        }
    }, 1000)
    flag = true
    getCode({ tel: loginForm.userName }).then(({ data }) => {
        if (data.code === 10000) {
            ElMessage.success('发送成功')
        }
    })
}

const router = useRouter()
// 获取from实例
const loginFormRef = ref()

// 通过计算属性
const routerList = computed(() => menuStore.routerList)
// 表单提交
const submitForm = async (formdata) => {
    if (!formdata) return
    // validate方法手动触发效验
    await formdata.validate((valid, fields) => {
        if (valid) {
            console.log(loginForm, 'submit!')
            // 注册页面
            if (formType.value) {
                userAuthentication(loginForm).then((data) => {
                    if (data.data.code === 10000) {
                        ElMessage.success('注册成功,请登录')
                        formType.value = 0
                    }
                })
            } else {
                // 登录页面
                login(loginForm).then(({data}) => {
                    if (data.code === 10000) {
                        ElMessage.success('登录成功')
                        // 用户信息和token缓存到浏览器
                        localStorage.setItem('pz_token', data.data.token)
                        localStorage.setItem('pz_userInfo', JSON.stringify(data.data.userInfo))
                        // 调用获取权限的接口
                        menuPermissions().then(({ data }) => {
                            // 用pinia进行存储
                            menuStore.dynamicMenu(data.data)
                            toRaw(routerList.value).forEach(element => {
                                console.log(element);
                                // 指定添加路由
                                router.addRoute('main', element)
                            });
                            console.log(routerList.value);

                            // 页面跳转
                            router.push('/')
                        })
                    }
                })
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}
</script>
<style lang="less" scoped>
:deep(.el-card__header) {
    padding: 0
}

.login-container {
    height: 100%;

    .card-header {
        background-color: #899fe1;

        img {
            width: 430px;
        }
    }

    .jump-link {
        text-align: right;
        margin-bottom: 10px;
    }
}
</style>