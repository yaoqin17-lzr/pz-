<template>
    <div class="header-container">
        <div class="headerleft flex-box">
            <el-icon class="icon" size="20px" @click="menuStore.collapseMenu()">
                <Fold />
            </el-icon>
            <ul class="flex-box">
                <li v-for="(item, index) in selectMenu" :class="{ selected: route.path === item.path }"
                    class="tab flex-box" :key="item.path">
                    <el-icon size="12px">
                        <component :is="item.icon" />
                    </el-icon>
                    <router-link class="text flex-box" :to="{ path: item.path }">
                        {{ item.name }}
                    </router-link>

                    <el-icon size="12px" class="close" @click="closeTab(item, index)">
                        <Close />
                    </el-icon>
                </li>
            </ul>

        </div>
        <div class="headerright">
            <el-dropdown @command="handleClick">
                <div class="el-dropdown-link flex-box">

                    <el-avatar :size="size" :src="userInfo.avatar" />
                    <p class="username">{{ userInfo.name }}</p>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="cancel">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
//1.导入use打头的方法
import { useMenuStore } from '../store/menu'
//2.执行方法得到store实例对象
const menuStore = useMenuStore()
import { computed } from 'vue';
const selectMenu = computed(() => {
    return menuStore.selectMenu
})
import { useRoute } from 'vue-router'
// 当前的路由对象
const route = useRoute()
console.log(route);
import { useRouter } from 'vue-router'
// 创建router实例
const router = useRouter()

const userInfo = JSON.parse(localStorage.getItem('pz_userInfo'))

// 点击关闭tab
const closeTab = (item, index) => {
    const selectMenuData = [...menuStore.selectMenu] // 保存当前状态
    menuStore.closeMenu(item) // 只传递item参数

    // 判断删除是否当前页面
    if (route.path !== item.path) {
        return
    }

    // 获取更新后的菜单数据
    const updatedMenuData = menuStore.selectMenu

    // 如果删除后没有菜单了，跳转到主页面
    if (updatedMenuData.length === 0) {
        router.push('/')
        return
    }

    // 计算新的跳转路径
    let newPath = ''
    if (index === selectMenuData.length - 1) {
        // 如果删除的是最后一项，跳转到前一项
        newPath = updatedMenuData[Math.max(0, index - 1)].path
    } else {
        // 如果删除的是中间或第一项，跳转到原位置的下一项
        newPath = updatedMenuData[index].path
    }

    router.push({ path: newPath })
}
const handleClick = (command) => {
    if (command === 'cancel') {
        localStorage.removeItem('pz_token')
        localStorage.removeItem('pz_userInfo')
        localStorage.removeItem('pz_menu')
        window.location.href = window.location.origin
        console.log(window.location.origin);
    }
}
</script>
<style lang="less" scoped>
.flex-box {
    display: flex;
    align-items: center;
    height: 100%;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    background-color: #fff;
    padding-right: 25px;

    .headerleft {
        height: 100%;

        .icon {
            width: 45px;
            height: 100%;
        }

        .tab {
            padding: 0 10px;
            height: 100%;

            .text {
                margin: 0 5px;
            }

            .close {
                visibility: hidden;
            }

            &.selected {
                a {
                    color: #409eff;
                }

                i {
                    color: #409eff;
                }

                background-color: #f5f5f5;
            }
        }

        .tab:hover {
            background-color: #f5f5f5;

            .close {
                visibility: inherit;
                cursor: pointer;
                color: #333;
            }
        }

    }

    .username {
        margin-left: 10px;
    }

    a {
        color: #333;
        font-size: 15px;
        height: 100%;
    }
}
</style>