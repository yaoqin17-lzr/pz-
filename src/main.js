import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import panelHead from './components/panelHead.vue'
import { useMenuStore } from './store/menu'

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const pinia = createPinia()
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)
pinia.use(piniaPluginPersistedstate)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('panelHead', panelHead)
// 路由挂载

app.use(pinia)

// 刷新后的动态路由添加（必须在 pinia 挂载后、app 挂载前执行）
// const initDynamicRoutes = () => {
//   const token = localStorage.getItem('pz_token')
//   // 如果没有 token，不执行路由添加
//   if (!token) {
//     return
//   }
//   try {
//     const localDataStr = localStorage.getItem('pz_menu')
//     if (!localDataStr) {
//       return
//     }

//     const localData = JSON.parse(localDataStr)
//     // 注意：持久化插件保存的数据结构是 { selectMenu: [], routerList: [] }
//     const routerList = localData.routerList || []
//     if (routerList.length > 0) {
//       // 获取 menuStore 实例
//       const menuStore = useMenuStore()
//       // 重新处理路由数据（绑定组件）
//       menuStore.dynamicMenu(routerList)
//       console.log(routerList);

//       // 添加动态路由（使用 toRaw 处理响应式对象）
//       toRaw(menuStore.routerList).forEach(element => {
//         router.addRoute('main', element)
//       })

//       console.log('刷新后动态路由已重新添加', menuStore.routerList)
//     }
//   } catch (error) {
//     console.error('初始化动态路由失败:', error)
//   }
// }
// // 初始化动态路由
// initDynamicRoutes()


const menuStore = useMenuStore()
//刷新后的动态路由添加
const localData = localStorage.getItem('pz_menu')
if (localData) {
  menuStore.dynamicMenu(JSON.parse(localData).routerList)
  menuStore.routerList.forEach(item => {
    router.addRoute('main', item)
  })
}
app.use(router)

// 路由守卫（在动态路由添加后注册）
router.beforeEach((to, from) => {
  const token = localStorage.getItem('pz_token')
  // 判断非登录页面
  if (!token && to.path !== '/login') {
    return '/login'
  } else if (token && to.path === '/login') {
    // 跳转回根目录
    return '/'
  } else {
    return true
  }
})

app.mount('#app')


