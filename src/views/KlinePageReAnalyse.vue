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
          <div class="show_line_btn" @click="showLine">查看趋势</div>
        </div>
        <div class="head">{{orderParams.orders || '全部'}} 订单列表</div>
        <div class="chart_head">
          <!-- <div>OpenTime</div> -->
          <!-- <div>OpenPrice</div> -->
          <div>CurPrice</div>
          <div>CurTime</div>
          <div>Point</div>
          <!-- <div>Profit</div> -->
          <div>MaxPoint</div>
          <!-- <div>MaxProfit</div> -->
          <div>MinPoint</div>
          <!-- <div>MinProfit</div> -->
          <div>Margin</div>
        </div>
        <div class="order_chart">
          <div v-for="(item,index) in orderList" :key="index" class="chart_item">
          <!-- <div>{{(item.OpenTime*1000) | mapTime('MM-DD hh:mm:ss')}}</div> -->
          <!-- <div>{{item.OpenPrice}}</div> -->
          <div>{{item.CurPrice}}</div>
          <div>{{(item.CurTime*1000) | mapTime('MM-DD hh:mm:ss')}}</div>
          <div>{{item.Point}}</div>
          <!-- <div>{{item.Profit}}</div> -->
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
      config: {
        ZHAOBI: ["HOLD"],
        MT4: ["EASYFOREX", "OANDA"],
      },
      DIYExchange: '/reAnalyse',
      symbol:'',
      interval:'',
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
      showBrokenLine: false
    };
  },
  mounted() {
    this.getCountList()
    this.getOrderList(this.orderParams)
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
    getCountList(){
      searchConfig.reAnalyse_getCountList().then((res) => {
        this.countList = res.data
      })
    },
    getOrderList(params){
      searchConfig.reAnalyse_getOrderList(params).then((res) => {
        this.orderList = res.data.data
        this.orderTotal = res.data.totalNum
      })
      // searchConfig.reAnalyse_getOrderList({pageNum:1, pageSize: 10000, orders: null}).then((res) => {
      //   console.log(res.data.data)
      // })
    },
    handleCurrentChange(pageNum){
      this.orderParams.pageNum = pageNum
      this.getOrderList(this.orderParams)
    },
    searchOrdersByOrder(orders){
      this.orderParams.orders = orders
      this.getOrderList(this.orderParams)
    },
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
    },
    clearData(){
      searchConfig.reAnalyse_clear()
      location.reload()
    },
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
        width: 70px;
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
        height: 25px;
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


