<template>
    <!-- @open="handleOpen" @close="handleClose" -->
    <el-menu :style="{ width: !collapse ? '230px' : '64px' }" :default-active="active" active-text-color="#ffd04b"
        background-color="#545c64" class="aside-container" text-color="#fff" :collapse="collapse">
        <p class="logo">{{ collapse ? '陪诊' : '陪诊系统' }}</p>
        <TreeMenu :index="1" :menuDate="menuDate"></TreeMenu>
    </el-menu>
</template>


<script lang="ts" setup>
import TreeMenu from './treeMenu.vue'
import { useRouter } from 'vue-router'
import { reactive, computed, onMounted } from 'vue'
//1.导入use打头的方法
import { useMenuStore } from '../store/menu'
//2.执行方法得到store实例对象
const menuStore = useMenuStore()
// 拿到菜单显示计算属性
const collapse = computed(() => {
    return !menuStore.isCollapse
})
onMounted(() => {
    // const x = localStorage.getItem('pz_menu')
    // console.log(x);

    console.log(menuStore);
})

const active = computed(() => menuStore.menuActive)
console.log(active);

const router = useRouter()
// const menuDate = reactive(router.options.routes[0].children)

const menuDate = computed(() => {
    return menuStore.routerList
})


</script>
<style lang="less" scoped>
.aside-container {
    height: 100%;

    .logo {
        text-align: center;
        font-size: 20px;
        height: 50px;
        line-height: 50px;
        color: #fff;
    }
}
</style>