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
      xkey:'reAnalyse'
    };
  },
  mounted() {
    /**
    * 量化回归项目这里先请求配置，获取到symbol和interval还有bolling线配置传给tradingView
    */
    searchConfig.reAnalyse_getSymbolConfig().then((res)=>{
      this.symbol = res.data[0].value
      // this.interval = res.data[1].value
      this.interval = '1'
      /**
       * 获取完配置后再创建K线
       */
      this.createTradingView()
      this.createStudy()
    })
  },
  methods: {
    createTradingView(){
      this.widget = createTradingView(this);
    },
    createStudy(){
      this.widget.onChartReady(() => {
        createStudy(
          this.widget,
          "Moving Average",
          false,
          false,
          [5, "close", 0],
          null,
          {
            "Plot.color": "#965fc4",
          }
        );
        createStudy(
          this.widget,
          "Moving Average",
          false,
          false,
          [10, "close", 0],
          null,
          {
            "Plot.color": "#84aad5",
          }
        );
        createStudy(
          this.widget,
          "Moving Average",
          false,
          false,
          [30, "close", 0],
          null,
          {
            "Plot.color": "#55b263",
          }
        );
        createStudy(
          this.widget,
          "Moving Average",
          false,
          false,
          [60, "close", 0],
          null,
          {
            "Plot.color": "#b7248a",
          }
        );
        createStudy(this.widget, "Bollinger Bands", false, false, [20, 2]);
        createStudy(this.widget, "Bollinger Bands", false, false, [50, 2]);
        createStudy(this.widget, "Bollinger Bands", false, false, [100, 2]);
        // createStudy(this.widget, "Average Directional Index", false, false);
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


