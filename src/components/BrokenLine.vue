<template>
  <div class="broken_line_box">
      <div class="line_box_title">
        <div @click="hideDialog" class="close_btn">关闭</div>
      </div>
      <div id="broken_kline">

      </div>
  </div>
</template>

<script>
import searchConfig from "../service/searchConfig";
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent,TooltipComponent, LineChart, CanvasRenderer, UniversalTransition]);
export default {
    data(){
        return {
            myChart:null,
            xLineData:[],
            yLineData:[]
        }
    },
    mounted(){
        this.myChart = echarts.init(document.getElementById('broken_kline'))
        this.getBrokenLine()
    },
    methods: {
      getBrokenLine(){
        searchConfig.reAnalyse_broken_line().then((res)=>{
          this.xLineData = res.data.map((item)=>{
            return this.$moment(item.OpenTime*1000).format('MM:DD HH:mm')
          })
          this.yLineData = res.data.map((item)=>{
            return item.Balance
          })
        this.myChart.setOption({
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross'
              }
            },
            xAxis: {
              name: 'OpenTime',
              type: 'category',
              data: this.xLineData
            },
            yAxis: {
              name: 'Balance',
              type: 'value',
              min: ()=>{return Math.min.apply(Math, this.yLineData)*0.999999999},
              max: ()=>{return Math.max.apply(Math, this.yLineData)*1.000000001},
            },
            series: [
              {
                data: this.yLineData,
                type: 'line',
              }
            ]
        })
        })
      },
      hideDialog(){
        this.$emit('hideDialog')
      }
    }


}
</script>

<style lang="less" scoped>
.broken_line_box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1002px;
    height: 460px;
    background: #fff;
    border: 1px solid #333;
    border-radius: 10px;
    .line_box_title {
      display: flex;
      justify-content: flex-end;
    }
    .close_btn {
      cursor: pointer;
      height: 25px;
      line-height: 25px;
      width: 100px;
      background-color: red;
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
        background: #fff;
        // border: 1px solid #333;
    }
}
</style>