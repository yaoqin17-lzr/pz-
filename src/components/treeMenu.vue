<template>
    <template v-for="(item, index) in props.menuDate" :key="index">
        <el-menu-item @click="handleClick(item, `${props.index}-${item.meta.id}`)"
            v-if="!item.children || item.children.lenght === 0" :key="`${props.index}-${item.meta.id}`"
            :index="`${props.index}-${item.meta.id}`">
            <el-icon size="20">
                <component :is="item.meta.icon"></component>
            </el-icon>
            <span>{{ item.meta.name }}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="`${props.index}-${item.meta.id}`">
            <template #title>
                <el-icon>
                    <component :is="item.meta.icon"></component>
                </el-icon>
                <span>{{ item.meta.name }}</span>
            </template>
            <tree-menu :index="`${props.index}-${item.meta.id}`" :menuDate="item.children" />
        </el-sub-menu>
    </template>
</template>

<script setup>
import { useRouter } from 'vue-router';
//1.导入use打头的方法
import { useMenuStore } from '../store/menu'
//2.执行方法得到store实例对象
const menuStore = useMenuStore()


// 创建router实例
const router = useRouter()
const props = defineProps(['menuDate', 'index'])
// 点击菜单
const handleClick = (item, active) => {
    console.log(active);
    router.push(item.meta.path)
    menuStore.addMenu(item.meta)
    menuStore.updateMenuActive(active)
}
</script>