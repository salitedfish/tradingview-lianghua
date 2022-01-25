<template>
  <div class="broken_line_box">
      <div class="line_box_title">
        <div @click="hideDialog" class="close_btn">关闭</div>
      </div>
      <div class="broken_kline" :id="'broken_kline_'+xkey">
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
            yLineData:[],
        }
    },
    props: ['interval', 'symbol', 'xkey'],
    mounted(){
        
        this.myChart = echarts.init(document.getElementById('broken_kline_'+this.xkey))
        this.getBrokenLine()
    },
    methods: {
      getBrokenLine(){
        searchConfig.reAnalyse_broken_line_symbol({ symbol: this.symbol, resolution: this.interval }).then((res)=>{
          this.xLineData = res.data.map((item)=>{
            return this.$moment(item.OpenTime*1000).format('MM-DD HH:mm')
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
    position: absolute;
    top: 40px;
    left: 40px;
    bottom: 40px;
    right: 40px;
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
      width: 50px;
      background-color: red;
      color: white;
      border-top-right-radius: 10px;
    }
    .broken_kline {
        position: absolute;
        top: 30px;
        left: 10px;
        right: 10px;
        bottom: 5px;
        background: #fff;
    }
}
</style>