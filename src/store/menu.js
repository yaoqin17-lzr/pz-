import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { updateUser } from '../api'
// 第一个参数是你的应用中 Store 的唯一 ID。

// 从 localStorage 读取数据，如果没有或解析失败则返回默认值
const getLocalStorageData = (key, defaultValue = []) => {
    try {
        const localData = localStorage.getItem('pz_menu')
        if (localData) {
            const parsed = JSON.parse(localData)
            return parsed[key] || defaultValue
        }
    } catch (error) {
        console.error('读取 localStorage 失败:', error)
    }
    return defaultValue
}

export const useMenuStore = defineStore('menu', () => {
    // 数据（state）
    const isCollapse = ref(true)
    // 从 localStorage 读取 selectMenu，如果没有则设为空数组
    const selectMenu = ref(getLocalStorageData('selectMenu', []))
    // 从 localStorage 读取 routerList，如果没有则设为空数组
    const routerList = ref(getLocalStorageData('routerList', []))
    const menuActive = ref('1-1')
    

    // 修改数据的方法（action）
    function collapseMenu() {
        isCollapse.value = !isCollapse.value
        console.log(isCollapse.value);
    }

    function addMenu(payload) {
        // 判断 selectMenu 中是否已存在该路径（避免重复添加）
        const isExist = selectMenu.value.findIndex(item => item.path === payload.path) !== -1;
        if (!isExist) {
            selectMenu.value.push(payload); // 追加到数组中
        }
    }

    function closeMenu(payload) {
        // 找到点击数据的索引值
        const index = selectMenu.value.findIndex(item => item.path === payload.path)
        // 通过索引删除指定元素
        selectMenu.value.splice(index, 1);
    }

    function dynamicMenu(payload) {
        // 通过vite的glob导入文件 
        const modules = import.meta.glob('../views/**/**/*.vue')
        // console.log('可用的组件模块:', modules);
        function routerSet(router) {
            // 判断有没有子菜单,拼接路由数据
            // 遍历
            router.forEach(route => {
                if (!route.children) {
                    const url = `../views${route.meta.path}/index.vue`
                    // 拿到获取的vue组件
                    route.component = modules[url]
                } else {
                    // 如果有子菜单
                    routerSet(route.children)
                }
            });
        }
        routerSet(payload)
        routerList.value = payload
    }

    function updateMenuActive(payload) {
        menuActive.value = payload
    }

    // 以对象形式返回
    return { isCollapse, collapseMenu, selectMenu, addMenu, closeMenu, dynamicMenu, routerList, updateMenuActive }
},
    {
        // 这里是 pinia-plugin-persistedstate 的配置
        persist: {
            key: 'pz_menu',          // localStorage 的 key
            storage: window.localStorage,  // 或 window.sessionStorage
            // 指定要持久化的字段（对应 return 出去的名字）
            paths: ['selectMenu', 'routerList', 'menuActive']
        }
    }
)
