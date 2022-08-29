<template>
  <div class="strategy_box">
    <div class="close_btn" @click="hiddenStrategyBox">关闭</div>
    <el-select v-model="currentStrategy" placeholder="请选择">
      <el-option
        v-for="item in strategys"
        :key="item"
        :label="item"
        :value="item"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
/**框架*/
import Vue from "vue"
/**工具库*/
/**类型*/
/**组件*/
import { Select, Option } from "element-ui"
/**自定义方法*/
Vue.use(Select)
Vue.use(Option)
export default {
  name: "",
  props: {
    strategys: {
      default: () => [],
      type: Array,
    },
  },
  data() {
    return {
      currentStrategy: "",
    }
  },
  methods: {
    hiddenStrategyBox() {
      this.$emit("hiddenStrategyBox")
    },
    selectStrategy(id) {
      this.$emit("selectStrategy", id)
    },
  },
  watch: {
    currentStrategy(newValue) {
      this.selectStrategy(newValue)
    },
  },
}
</script>

<style scoped lang="less">
.strategy_box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40px 80px;
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #333;
  .close_btn {
    position: absolute;
    right: 0;
    top: 0;
    border-radius: 0 10px 0 0;
    background-color: red;
    color: #fff;
    cursor: pointer;
    height: 25px;
    line-height: 25px;
    padding: 0 8px;
  }
}
</style>
