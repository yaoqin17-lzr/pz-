import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// 第一个参数是你的应用中 Store 的唯一 ID。
export const useCounterStore = defineStore('counter', () => {
    // 数据（state）
    const count = ref(1)

    // 修改数据的方法（action）
    function increment() {
        count.value++
    }

    // getter定义
    const doubleCount = computed(() => count.value * 2)




    // 以对象形式返回
    return { count, increment,doubleCount}
})
