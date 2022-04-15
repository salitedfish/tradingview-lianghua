<template>
  <!-- <div class="kline"> -->
    <div :class="klineID == 0? 'main' : 'minor'" :id="'kline_container_' + klineID"></div>
  <!-- </div> -->
</template>

<script>
import Vue from "vue"
import { Pagination } from "element-ui"
import { time } from "echarts/core";
import { MarkPointComponent } from "echarts/components";
import { createTradingView } from "../utilities/createTradingView";
import { createStudy } from "../utilities/createStudy";
import searchConfig from "../service/searchConfig"
import BrokenLine from "@/components/BrokenLine.vue"
import { mapSymbol } from "@/utilities/dataMap" 

Vue.use(Pagination)
export default {
  name: '',
  components: {
    BrokenLine
  },
  props: {
    klineID: {
      type: Number
    },
    klineInfo: {
      type: Array
    }
  },
  data() {
    return {
      widget: null,
      baseUrl: process.env.BASE_URL,
      config: {
        ZHAOBI: ["HOLD"],
        MT4: ["EASYFOREX", "OANDA"],
      },
      DIYExchange: '/reAnalyse',
      symbol:'dydx_BTC-USD',
      symbolRow: 'BTCUSD',
      interval:'',
      xkey: this.klineID,
      studyConfig:[],
      countList:[],
      orderList:[],
      orderParams:{
        pageSize:20,
        pageNum:1,
        orders:null
      },
      orderTotal:null,
      showBrokenLine: false,
      marksObj:{},
      timeOutFun:null,
      markTimeCache:[],
      markLineCache:[]
    };
  },

  mounted() {
    /**
    * 量化回归项目这里先请求配置，获取到symbol和interval还有bolling线配置传给tradingView
    */
    this.symbolRow = mapSymbol(this.klineInfo[0].value, 'dydx')
    // this.symbolRow = 'ETHBTC'
    this.symbol= mapSymbol(this.klineInfo[0].value, 'dydx')
    // this.symbol= 'ETHBTC'
    this.interval = this.klineInfo[1].value.substr(1, this.klineInfo[1].value.length)
    searchConfig.reAnalyse_getStudyConfig().then((res)=>{
      this.studyConfig = res.data
       /**
       * 获取完配置后再创建K线、指标、形状
       */
      this.createTradingView()
      this.createStudy()
      this.createBtn()
      // if(this.xkey == 0) {  
        this.createMarks()
      // }

    })
  },
  methods: {
    /**创建图表 */
    createTradingView(){
      this.widget = createTradingView(this);
    },
    /**创建指标 */
    createStudy(){
      this.widget.onChartReady(() => {
          /**
           * 根据指标配置循环创建bolling和ma
           */
          const colors = ['#F44336', '#FF9800', '#FFE83B', '#4CAF50', '#00BCD4', '#2196F3', '#673AB7', '#E91E63', '#FFCDD2', '#B2EBF2']
          const newStudys = this.studyConfig.filter((item) => {
            return this.klineInfo[0].value == item.symbol && this.klineInfo[1].value == item.symbolperiod
          })
          for(let key in newStudys) {
            if(newStudys[key].type.indexOf('Bolling') != -1){
              for(let i in Array.from(new Set(newStudys[key].period))){
                createStudy(this.widget, "bollinger bands", false, false, [Array.from(new Set(newStudys[key].period))[i], 2], {
                  "upper.color": colors[Number(key) + Number(i)],
                  "median.color": colors[Number(key) + Number(i)],
                  "lower.color": colors[Number(key) + Number(i)],
                  "Plots Background.color": colors[Number(key) + Number(i)]
                });
              }
            }else if(newStudys[key].type.indexOf('Ma') != -1){
              for(let i in Array.from(new Set(newStudys[key].period))){
                createStudy( this.widget, "Moving Average", false, false, [Array.from(new Set(newStudys[key].period))[i], "close", 0], null);
              }
            }
          }
      })
    },
    /**创建标记 */
    createMarks(){
      
      /**创建单点形状 */
      const markShape = (shape, index, overrides) => {
        this.widget.activeChart().createShape({ 
          time: this.marksObj.time[index], 
          price: Number(this.marksObj.text[index].slice(this.marksObj.text[index].indexOf(' ') + 1)) 
          }, 
          { 
           text: this.marksObj.text[index].slice(this.marksObj.text[index].indexOf(' ') + 1) + "---" + this.marksObj.id[index].toString().slice(-2), 
           overrides,
           shape,
           zOrder: "top", 
           lock: true 
          });
      }

      /**创建多点形状 */
      const markMultiShape = (shape, index, overrides) => {
        this.widget.chart().createMultipointShape([
            {
              time: this.marksObj.time[index-1], 
              price: Number(this.marksObj.text[index-1].slice(this.marksObj.text[index-1].indexOf(' ') + 1)) 
            },
            {
              time: this.marksObj.time[index], 
              price: Number(this.marksObj.text[index].slice(this.marksObj.text[index].indexOf(' ') + 1)) 
            }
          ],{
            shape: shape,
            lock: true,
            overrides
          }
        );
      }

      this.widget.onChartReady(()=>{
        this.widget.chart().onVisibleRangeChanged().subscribe(
          null,
          ({from, to}) => {
            clearTimeout(this.timeOutFun)
            const eventFun = () => {
              const params = {
                symbol:this.symbolRow,
                from,
                to,
                resolution: this.interval
              }
              /**画箭头 */
              searchConfig.reAnalyse_getMarks(params).then((res)=>{
                this.marksObj = res.data
                this.marksObj.id.forEach((item,index) => {
                  if(this.markTimeCache.indexOf(this.marksObj.id[index]) != -1) return
                  if(this.marksObj.label[index] == '买'){
                    markShape('arrow_up', index, {color:"#02C076", fontsize: 12})
                  }else if(this.marksObj.label[index] == '卖'){
                    markShape('arrow_down', index, {color:"#FF2D2D", fontsize: 12})
                  }else if(this.marksObj.label[index] == '卖平'){
                    markShape('arrow_left', index, {color:"#66B3FF", fontsize: 12})
                  }else if(this.marksObj.label[index] == '买平'){
                    markShape('arrow_right', index, {color:"#66B3FF", fontsize: 12})
                  }
                  this.markTimeCache.push(this.marksObj.id[index])
                });
                /**画线 */
                this.marksObj.id.forEach((item, index) => {
                  if(this.markLineCache.indexOf(this.marksObj.id[index]) != -1) return
                  if(this.marksObj.time[index-1]) {
                    markMultiShape('trend_line', index, {})
                    this.markLineCache.push(this.marksObj.id[index])
                  }
                })
              })
            }
            this.timeOutFun = setTimeout(eventFun,1000)
          },
          false
        )
      })
    },
    /**创建自定义按钮 */
    createBtn(){
      this.widget.onChartReady(()=>{
        this.widget.headerReady().then(() => {
          const themeChangeButton = this.widget.createButton();
          themeChangeButton.textContent = "主题切换";
          themeChangeButton.addEventListener("click", () => {
            this.changeTheme();
          });

          const showFormButton = this.widget.createButton();
          showFormButton.textContent = "显示图表";
          showFormButton.addEventListener('click', () => {
            this.$emit('changeFormVisibity')
          })
        });
      })
    },
    /**改变主题 */
    changeTheme(type) {
      if (type) {
        this.widget.changeTheme(type);
      } else {
        this.widget.changeTheme(
          this.widget.getTheme() == "dark" ? "light" : "dark"
        );
        this.$nextTick(()=>{
          this.widget.applyOverrides({
            "style": 9,
            "hollowCandleStyle.upColor": "#02C076",
            "hollowCandleStyle.downColor": "rgba(0, 0, 0, 0)",
            "hollowCandleStyle.drawWick": true,
            "hollowCandleStyle.drawBorder": true,
            "hollowCandleStyle.borderUpColor": "#02C076",
            "hollowCandleStyle.borderDownColor": "#F84960",
          })
        })
      }
    },
    /**清除数据 */
    clearData(){
      searchConfig.reAnalyse_clear()
      
      setTimeout(()=>{
        location.reload()
      }, 2000)

    },
    /**展示资产变化曲线 */
    showLine(){
      this.showBrokenLine = !this.showBrokenLine
    }
  },
  beforeDestroy() {
    this.widget = null
  },
};
</script>
<style lang="less" scoped>

.main {
  // width: 50vw;
  flex: 2;
}
.minor {
  // width: 50vw;
  flex: 1;
}
.chart_container {
  // padding: 5px;
  flex: 1;
  border-right: 1px solid #888;
  border-left: 1px solid #888;
  .count_container {
    height: calc(30vh);
    border-bottom: 1px solid #888;
    .chart_head {
      display: flex;
      height: 30px;
      align-items: center;
      justify-content: space-around;
      background-color: #eeeeee;
      .child_one {
        width: 100px
      }
      .child_two {
        width: 200px;
      }
    }
    .count_chart {
      height: calc(18vh);
      overflow-y:scroll;
      .chart_item {
        display: flex;
        // height: 25px;
        align-items: center;
        border: 1px solid #efefefef;
        cursor: pointer;
        justify-content: space-around;
        &:hover {
          background-color: #eeeeee;
        }
      .child_one {
        width: 100px
      }
      .child_two {
        width: 200px;
      }
      }
    }
  }
  .order_container {
    height: calc(70vh);
    .order_banner {
      display: flex;
      padding: 5px 5px;
      border-bottom: 1px solid #333333;
      .show_line_btn {
        height: 25px;
        width: 90px;
        line-height: 25px;
        background-color: rgb(93, 93, 241);
        color: #ffffff;
        border-radius: 4px;
        cursor: pointer;
      }
    }
    .chart_head {
      display: flex;
      height: 30px;
      align-items: center;
      justify-content: space-around;
      background-color: #eeeeee;
        div {
          width: 16%;
        }
    }
    .order_chart {
      height: calc(50vh);
      overflow-y:scroll;
      .chart_item {
        display: flex;
        height: 40px;
        align-items: center;
        border: 1px solid #efefefef;
        justify-content: space-around;
        cursor: pointer;
        &:hover {
          background-color: #eeeeee;
        }
        div {
          width: 16%;
        }
      }
    }
  }
  .head {
    font-size: 16px;
    border-bottom: 1px dotted #888;
    .clear {
      width: 100px;
      margin: 0 auto;
      background: #e92929;
      color: #ffffff;
      cursor: pointer;
      border-radius: 3px;
    }
  }
}
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

</style>


