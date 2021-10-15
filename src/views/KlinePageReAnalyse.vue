<template>
  <div class="kline">
    <div class="kline_container" id="kline_container_reAnalyse"></div>
  </div>
</template>

<script>
import { createTradingView } from "../utilities/createTradingView";
import { createStudy } from "../utilities/createStudy";
import searchConfig from "../service/searchConfig"
// import overrides from "../utilities/overrides";
export default {
  data() {
    return {
      widget: null,
      baseUrl: process.env.BASE_URL,
      config: {
        ZHAOBI: ["HOLD"],
        MT4: ["EASYFOREX", "OANDA"],
      },
      DIYExchange: '/reAnalyse',
      symbol:'',
      interval:'',
      xkey:'reAnalyse',
      studyConfig:[]
    };
  },
  mounted() {
    /**
    * 量化回归项目这里先请求配置，获取到symbol和interval还有bolling线配置传给tradingView
    */
    searchConfig.reAnalyse_getSymbolConfig().then((res)=>{
      this.symbol = res.data[0].value
      if(res.data[1].value == 'M1'){
        this.interval = '1'
      }else if(res.data[1].value == 'M5'){
        this.interval = '5'
      }
      searchConfig.reAnalyse_getStudyConfig().then((res)=>{
        this.studyConfig = res.data
         /**
         * 获取完配置后再创建K线
         */
        this.createTradingView()
        this.createStudy()
      })
    })
  },
  methods: {
    createTradingView(){
      this.widget = createTradingView(this);
    },
    createStudy(){
      this.widget.onChartReady(() => {
        for(let item of this.studyConfig) {
          /**
           * 根据指标配置循环创建bolling和ma
           */
          if(item.type.indexOf('Bolling') != -1){
            for(let i of item.period){
              createStudy(this.widget, "Bollinger Bands", false, false, [i, 2]);
            }
          }else if(item.type.indexOf('Ma') != -1){
            for(let i of item.period){
              createStudy( this.widget,"Moving Average",false,false,[i, "close", 0],null);
            }
          }
        }
      })
    }
  },
  beforeDestroy() {
    this.widget = null
  },
};
</script>
<style lang="less" scoped>
.kline{
  height: calc(100vh)
}

.kline_container {
  height: calc(100vh);
}

/*.kline_container {*/
/*  border: 1px solid black;*/

/*  &:focus-within {*/
/*    border-color: red;*/
/*  }*/
/*}*/
</style>


