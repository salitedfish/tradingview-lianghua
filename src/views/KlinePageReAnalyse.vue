<template>
  <div class="kline">
    <div class="kline_container" id="kline_container_reAnalyse"></div>
    <div class="chart_container">
      <div class="count_container">
        <div class="head">
          <div class="clear" @click="clearData()">清除数据</div>
          账户列表
        </div>
        <div class="chart_head">
          <div class="child_one">InitBalance</div>
          <div class="child_one">Balance</div>
          <div class="child_one">Orders</div>
          <div class="child_one">Margin</div>
          <div class="child_two">SignalInfo</div>
        </div>
        <div class="count_chart">
          <div v-for="item in countList" :key="item.Orders" class="chart_item" @click="searchOrdersByOrder(item.Orders)">
            <div class="child_one">{{item.InitBalance}}</div>
            <div class="child_one">{{item.Balance}}</div>
            <div class="child_one">{{item.Orders}}</div>
            <div class="child_one">{{item.Margin}}</div>
            <div class="child_two" :title="item.SignalInfo">{{item.SignalInfo}}</div>
          </div>
        </div>
        <!-- <div>分页</div> -->
      </div>
      <div class="order_container">
        <div class="order_banner">
          <div class="show_line_btn" @click="showLine">资产变动曲线</div>
        </div>
        <div class="head">{{orderParams.orders || '全部'}} 订单列表</div>
        <div class="chart_head">
          <div>OpenTime</div>
          <div>OpenPrice</div>
          <div>CloseTime</div>
          <div>ClosePrice</div>
          <!-- <div>CurPrice</div> -->
          <!-- <div>CurTime</div> -->
          <div>Point</div>
          <div>Type</div>
          <div>MaxPoint</div>
          <!-- <div>MaxProfit</div> -->
          <div>MinPoint</div>
          <!-- <div>MinProfit</div> -->
          <div>Margin</div>
        </div>
        <div class="order_chart">
          <div v-for="(item,index) in orderList" :key="index" class="chart_item">
          <div :title="$moment(item.OpenTime*1000).format('MM-DD hh:mm:ss')">{{(item.OpenTime*1000) | mapTime('MM-DD hh:mm:ss')}}</div>
          <div>{{item.OpenPrice}}</div>
          <div>{{(item.CloseTime*1000) | mapTime('MM-DD hh:mm:ss')}}</div>
          <div>{{item.ClosePrice}}</div>
          <!-- <div>{{item.CurPrice}}</div>
          <div>{{(item.CurTime*1000) | mapTime('MM-DD HH:mm:ss')}}</div> -->
          <div>{{item.Point}}</div>
          <div>{{item.Type == 0?'买':'卖'}}</div>
          <div>{{item.MaxPoint}}</div>
          <!-- <div>{{item.MaxProfit}}</div> -->
          <div>{{item.MinPoint}}</div>
          <!-- <div>{{item.MinProfit}}</div> -->
          <div>{{item.Margin}}</div>
          </div>
        </div>
        <div class="pagination">
          <el-pagination 
          :page-size="orderParams.pageSize" 
          :current-page.sync="orderParams.pageNum"
          @current-change="handleCurrentChange"
          :total='orderTotal'
          :pager-count="5"
          layout=" prev, pager, next, total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
    <broken-line v-if="showBrokenLine" @hideDialog="showLine"></broken-line>
  </div>
</template>

<script>
import Vue from "vue"
import { Pagination } from "element-ui"
import { createTradingView } from "../utilities/createTradingView";
import { createStudy } from "../utilities/createStudy";
import searchConfig from "../service/searchConfig"
import BrokenLine from "@/components/BrokenLine.vue"
import { mapSymbol } from "@/utilities/dataMap.js"
// import overrides from "../utilities/overrides";
Vue.use(Pagination)
export default {
  components: {
    BrokenLine
  },
  data() {
    return {
      widget: null,
      baseUrl: process.env.BASE_URL,
      DIYExchange: '/api',
      // DIYExchange: '/reAnalyse',
      symbol:'BTC-USD',//这个是用来获取K线的，火币、dydx和找币名称都不一样，dydx要加dydx_
      symbolRow:'BTCUSD',//这个是用来获取标记的，直接使用获取到的配置里的名称就行
      interval:'1',
      xkey:'reAnalyse',
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
      timeOutFun:null
    };
  },
  mounted() {
    this.getCountList()
    this.getOrderList(this.orderParams)
    /**
    * 量化回归项目这里先请求配置，获取到symbol和interval还有bolling线配置传给tradingView
    */
    searchConfig.reAnalyse_getSymbolConfig().then((res)=>{
      
      this.symbolRow = res.data[0].value.split(',')[0]
      this.symbol = mapSymbol(res.data[0].value.split(',')[0])
      if(res.data[1].value.split(',')[0] == 'M1'){
        this.interval = '1'
      }else if(res.data[1].value.split(',')[0] == 'M5'){
        this.interval = '5'
      }
      searchConfig.reAnalyse_getStudyConfig().then((res)=>{
        this.studyConfig = res.data
         /**
         * 获取完配置后再创建K线、指标、形状
         */
        this.createTradingView()
        this.createStudy()
        this.createMarks()
      })
    })
  },
  methods: {
    /**获取账户列表 */
    getCountList(){
      searchConfig.reAnalyse_getCountList().then((res) => {
        this.countList = res.data
      })
    },
    /**获取订单列表 */
    getOrderList(params){
      searchConfig.reAnalyse_getOrderList(params).then((res) => {
        this.orderList = res.data.data
        this.orderTotal = res.data.totalNum
      })
    },
    /**分页 */
    handleCurrentChange(pageNum){
      this.orderParams.pageNum = pageNum
      this.getOrderList(this.orderParams)
    },
    /**根据账号查找订单列表 */
    searchOrdersByOrder(orders){
      this.orderParams.orders = orders
      this.getOrderList(this.orderParams)
    },
    /**创建图表 */
    createTradingView(){
      this.widget = createTradingView(this);
    },
    /**创建指标 */
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
    },
    /**创建标记点 */
    createMarks(){
      const markShape = (shape, index, overrides) => {
        this.widget.activeChart().createShape({ 
          time: this.marksObj.time[index], 
          price: Number(this.marksObj.text[index].slice(this.marksObj.text[index].indexOf(' ') + 1)) 
          }, 
          {
           text: this.marksObj.text[index].slice(this.marksObj.text[index].indexOf(' ') + 1),
           overrides,
           shape,
           zOrder: "top", 
           lock: true 
          });
      }
      /**间隔10秒获取一次可见范围内的标记 */
      setInterval(()=>{
        const { from, to} = this.widget.chart().getVisibleRange()
        const params = {
          symbol:this.symbolRow,
          from,
          to,
          resolution: this.interval
        }
        searchConfig.reAnalyse_getMarks(params).then((res)=>{
          this.marksObj = res.data
            this.marksObj.id.forEach((item,index) => {
              if(this.marksObj.label[index] == '买'){
                markShape('arrow_up', index, {color:"#006000", fontsize: 12})
              }else if(this.marksObj.label[index] == '卖'){
                markShape('arrow_down', index, {color:"#EA0000", fontsize: 12})
              }else if(this.marksObj.label[index] == '卖平'){
                markShape('arrow_left', index, {color:"#0080FF", fontsize: 12})
              }else if(this.marksObj.label[index] == '买平'){
                markShape('arrow_right', index, {color:"#0080FF", fontsize: 12})
              }
            });
        })
      },5000)
    },
    /**清除数据 */
    clearData(){
      searchConfig.reAnalyse_clear()
      location.reload()
    },
    /**展示资产变化曲线 */
    showLine(){
      this.showBrokenLine = !this.showBrokenLine
    },
  },
  beforeDestroy() {
    this.widget = null
  },
};
</script>
<style lang="less" scoped>
.kline{
  display:flex;
  height: calc(100vh)
}

.kline_container {
  width: 70%;
  height: calc(100vh);
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


