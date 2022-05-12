<template>
  <div class="broken_line_box">
    <div class="line_box_title">
      <div class=""></div>
      <div class="order">账号：{{ showTotal ? "全部" : order }}</div>
      <div @click="hideDialog" class="close_btn">关闭</div>
    </div>

    <div id="broken_kline"></div>
  </div>
</template>

<script>
import searchConfig from "../service/searchConfig";
import * as echarts from "echarts/core";
import { GridComponent, TooltipComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  GridComponent,
  TooltipComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);
export default {
  props: ["order", "showTotal", "accountId"],
  data() {
    return {
      myChart: null,
      xLineData: [],
      yLineData: [],
    };
  },
  mounted() {
    this.myChart = echarts.init(document.getElementById("broken_kline"));
    this.getBrokenLine();
  },
  methods: {
    async getBrokenLine() {
      let res;
      if (this.order && !this.showTotal) {
        res = await searchConfig.reAnalyse_broken_line_current(
          this.order,
          this.accountId
        );
      } else {
        res = await searchConfig.reAnalyse_broken_line();
      }
      this.xLineData = res.data.map((item) => {
        return this.$moment(item.OpenTime * 1000).format("MM:DD HH:mm");
      });
      this.yLineData = res.data.map((item) => {
        return Number(item.Balance);
      });
      console.log(this.yLineData);
      this.myChart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        xAxis: {
          name: "OpenTime",
          type: "category",
          data: this.xLineData,
        },
        yAxis: {
          name: "Balance",
          type: "value",
          min: () => {
            return Math.min.apply(Math, this.yLineData) * 0.999999999;
          },
          max: () => {
            return Math.max.apply(Math, this.yLineData) * 1.000000001;
          },
        },
        series: [
          {
            data: this.yLineData,
            type: "line",
          },
        ],
      });
    },
    hideDialog() {
      this.$emit("hideDialog");
    },
  },
};
</script>

<style lang="less" scoped>
.broken_line_box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1002px;
  height: 460px;
  background: #111;
  border: 1px solid #333;
  border-radius: 10px;
  .line_box_title {
    display: flex;
    // justify-content: flex-end;
    justify-content: space-between;
    .order {
      font-size: 16px;
    }
  }

  .close_btn {
    cursor: pointer;
    height: 25px;
    line-height: 25px;
    width: 100px;
    background-color: rgb(160, 7, 7);
    color: white;
    border-top-right-radius: 10px;
  }
  #broken_kline {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1000px;
    height: 400px;
    background: #111;
    // border: 1px solid #333;
  }
}
</style>
