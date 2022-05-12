<template>
  <div class="klinePage">
    <div class="kline_box">
      <KlineReanalyse
        :klineID="key"
        :klineInfo="item"
        v-for="(item, key) in KLineList"
        :key="key"
        @changeFormVisibity="changeFormVisibity"
      ></KlineReanalyse>

      <!-- <KlineReanalyse klineID="0"></KlineReanalyse>
      <KlineReanalyse klineID="1"></KlineReanalyse>
      <KlineReanalyse klineID="2"></KlineReanalyse> -->
    </div>
    <div class="chart_container" v-if="formVisibity">
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
          <div
            v-for="(item, index) in countList"
            :key="index"
            class="chart_item"
            @click="searchOrdersByOrder(item.Orders, item.AccountID)"
            :class="{
              activeCount:
                item.Orders == orderParams.orders &&
                item.AccountID == orderParams.accountid,
            }"
          >
            <div class="child_one">{{ item.InitBalance }}</div>
            <div class="child_one">{{ item.Balance }}</div>
            <div class="child_one">
              {{ item.Orders }}
            </div>
            <div class="child_one">{{ item.Margin }}</div>
            <div class="child_two" :title="item.SignalInfo">
              {{ item.SignalInfo }}
            </div>
          </div>
        </div>
        <!-- <div>分页</div> -->
      </div>
      <div class="order_container">
        <div class="order_banner">
          <div class="show_line_btn" @click="showLine(true)">
            总资产盈亏曲线
          </div>
          <div class="show_line_btn" @click="showLine(false)">
            当前账号资产盈亏曲线
          </div>
        </div>
        <div class="head">{{ orderParams.orders || "全部" }} 订单列表</div>
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
          <div
            v-for="(item, index) in orderList"
            :key="index"
            class="chart_item"
          >
            <div
              :title="$moment(item.OpenTime * 1000).format('MM-DD hh:mm:ss')"
            >
              {{ (item.OpenTime * 1000) | mapTime("MM-DD hh:mm:ss") }}
            </div>
            <div>{{ item.OpenPrice }}</div>
            <div>{{ (item.CloseTime * 1000) | mapTime("MM-DD hh:mm:ss") }}</div>
            <div>{{ item.ClosePrice }}</div>
            <!-- <div>{{item.CurPrice}}</div>
          <div>{{(item.CurTime*1000) | mapTime('MM-DD HH:mm:ss')}}</div> -->
            <div>{{ item.Point }}</div>
            <div>{{ item.Type == 0 ? "买" : "卖" }}</div>
            <div>{{ item.MaxPoint }}</div>
            <!-- <div>{{item.MaxProfit}}</div> -->
            <div>{{ item.MinPoint }}</div>
            <!-- <div>{{item.MinProfit}}</div> -->
            <div>{{ item.Margin }}</div>
          </div>
        </div>
        <div class="pagination">
          <el-pagination
            :page-size="orderParams.pageSize"
            :current-page.sync="orderParams.pageNum"
            @current-change="handleCurrentChange"
            :total="orderTotal"
            :pager-count="5"
            layout=" prev, pager, next, total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
    <BrokenLine
      v-if="showBrokenLine"
      @hideDialog="showLine"
      :order="orderParams.orders"
      :accountId="orderParams.accountid"
      :showTotal="showTotal"
    ></BrokenLine>
  </div>
</template>

<script>
import Vue from "vue";
import { Pagination } from "element-ui";
import { time } from "echarts/core";
import { MarkPointComponent } from "echarts/components";
import { createTradingView } from "../utilities/createTradingView";
import { createStudy } from "../utilities/createStudy";
import searchConfig from "../service/searchConfig";
import BrokenLine from "@/components/BrokenLine.vue";
import { mapSymbol } from "@/utilities/dataMap";
import KlineReanalyse from "@/components/KlineReanalyse.vue";

// import overrides from "../utilities/overrides";
Vue.use(Pagination);
export default {
  data() {
    return {
      widget: null,
      baseUrl: process.env.BASE_URL,
      config: {
        ZHAOBI: ["HOLD"],
        MT4: ["EASYFOREX", "OANDA"],
      },
      DIYExchange: "/reAnalyse",
      symbol: "dydx_BTC-USD",
      symbolRow: "BTCUSD",
      interval: "",
      xkey: "reAnalyse",
      studyConfig: [],
      countList: [],
      orderList: [],
      orderParams: {
        pageSize: 20,
        pageNum: 1,
        orders: null,
        accountid: null,
      },
      orderTotal: null,
      showBrokenLine: false,
      marksObj: {},
      timeOutFun: null,
      markTimeCache: [],
      markLineCache: [],
      KLineList: [],
      formVisibity:
        localStorage.getItem("formVisibity") == "true" ? true : false,
      showTotal: true,
    };
  },
  components: {
    BrokenLine,
    KlineReanalyse,
  },
  mounted() {
    this.getCountList();
    this.getOrderList(this.orderParams);
    /**
     * 量化回归项目这里先请求配置，获取到symbol和interval还有bolling线配置传给tradingView
     */
    searchConfig.reAnalyse_getSymbolConfig().then((res) => {
      this.KLineList = res.data;
    });
  },
  methods: {
    /**显示、隐藏列表 */
    changeFormVisibity() {
      this.formVisibity = !this.formVisibity;
      localStorage.setItem("formVisibity", this.formVisibity);
    },
    /**获取账户列表 */
    getCountList() {
      searchConfig.reAnalyse_getCountList().then((res) => {
        this.countList = res.data;
      });
    },
    /**获取订单列表 */
    getOrderList(params) {
      searchConfig.reAnalyse_getOrderList(params).then((res) => {
        this.orderList = res.data.data;
        this.orderTotal = res.data.totalNum;
      });
    },
    /**分页 */
    handleCurrentChange(pageNum) {
      this.orderParams.pageNum = pageNum;
      this.getOrderList(this.orderParams);
    },
    /**根据账号查找订单列表 */
    searchOrdersByOrder(orders, accountid) {
      this.orderParams.orders = orders;
      this.orderParams.accountid = accountid;
      this.getOrderList(this.orderParams);
    },
    /**清除数据 */
    clearData() {
      searchConfig.reAnalyse_clear();

      setTimeout(() => {
        location.reload();
      }, 2000);
    },
    /**展示资产变化曲线 */
    showLine(showTotal) {
      this.showTotal = showTotal;
      this.showBrokenLine = !this.showBrokenLine;
    },
  },
  beforeDestroy() {
    this.widget = null;
  },
};
</script>
<style lang="less">
.klinePage {
  display: flex;
  height: calc(100vh);
  background-color: #222;
  color: #aaa;
}

.kline_box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.chart_container {
  // padding: 5px;
  // display: none;
  width: 50vw;
  flex: 1;
  border-right: 1px solid #555;
  border-left: 1px solid #555;
  .count_container {
    height: calc(30vh);
    border-bottom: 1px solid #555;
    .chart_head {
      display: flex;
      height: 30px;
      align-items: center;
      justify-content: space-around;
      background-color: #333;
      color: #aaa;
      .child_one {
        width: 100px;
      }
      .child_two {
        width: 200px;
      }
    }
    .count_chart {
      height: calc(18vh);
      overflow-y: scroll;
      .chart_item {
        display: flex;
        // height: 25px;
        align-items: center;
        border: 1px solid #555;
        cursor: pointer;
        justify-content: space-around;
        &:hover {
          background-color: #333;
        }
        .child_one {
          width: 100px;
        }
        .child_two {
          width: 200px;
        }
      }
      .activeCount {
        background-color: #000;
        &:hover {
          background-color: #000;
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
        width: 140px;
        line-height: 25px;
        background-color: rgb(57, 57, 171);
        color: #ffffff;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
      }
    }
    .chart_head {
      display: flex;
      height: 30px;
      align-items: center;
      justify-content: space-around;
      background-color: #222;
      div {
        width: 16%;
      }
    }
    .order_chart {
      height: calc(50vh);
      overflow-y: scroll;
      .chart_item {
        display: flex;
        height: 40px;
        align-items: center;
        border: 1px solid #555;
        justify-content: space-around;
        cursor: pointer;
        &:hover {
          background-color: #000;
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
      background: rgb(160, 7, 7);
      color: #ffffff;
      cursor: pointer;
      border-radius: 3px;
    }
  }
}
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.btn-prev,
.el-pager li,
.btn-next {
  background-color: #333 !important;
}
.el-pagination {
  color: #ffffff;
}
</style>
