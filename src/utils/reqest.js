import axios from "axios";
import { ElMessage } from "element-plus";
const http = axios.create({
    baseURL: 'https://v3pz.itndedu.com/v3pz',
    timeout: 20000
})


// 添加请求拦截器
http.interceptors.request.use(function (config) {
    // 在发送请求之前(添加token)
    const token = localStorage.getItem('pz_token')
    // 不需要token接口(白名单)
    const whiteUrl = ['/get/code', '/user/authentication', '/login']
    if (token && !whiteUrl.includes(config.url)) {
        config.headers['x-token'] = token
    }
    return config;
}, function (error) {
    console.log(error);
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
http.interceptors.response.use(function (response) {
    // 对接口异常的数据需要给用户提示
    if (response.data.code === -1) {
        ElMessage.warning(response.data.message)
    }
    if (response.data.code === -2) {
        ElMessage.warning(response.data.message)
        localStorage.removeItem('pz_token')
        localStorage.removeItem('pz_userInfo')
        localStorage.removeItem('pz_menu')
        window.location.href = window.location.origin
    }
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default http