<template>
  <div id="app">
    <div id="banner-box">
      <div class="center-container">
        <span @click="changeMode('custom')">筛选模式</span>
        <div class="select-box">
          <span class="select-title">周期：</span>
          <select name="周期" id="" class="select-content" v-model="interval">
            <option value="5">{{ "5分钟" }}</option>
            <option value="15">{{ "15分钟" }}</option>
            <option value="60">{{ "1小时" }}</option>
            <option value="240">{{ "4小时" }}</option>
            <option value="1D">{{ "1天" }}</option>
            <option value="1W">{{ "1周" }}</option>
          </select>
        </div>
        <div class="select-box">
          <span class="select-title">成交量：</span>
          <select
            name="交易量"
            id="selectBox"
            class="select-content"
            v-model="searchData.volume"
          >
            <option value="">{{ "" }}</option>
            <option value="1000000000">{{ "10亿 ~ 无限" }}</option>
            <option value="500000000">{{ "5亿 ~ 10亿" }}</option>
            <option value="200000000">{{ "2亿 ~ 5亿" }}</option>
            <option value="100000000">{{ "1亿 ~ 2亿" }}</option>
            <option value="50000000">{{ "0.5亿 ~ 1亿" }}</option>
          </select>
        </div>

        <div class="select-box">
          <span class="select-title">排名：</span>
          <select
            name="排名"
            id=""
            class="select-content"
            v-model="searchData.rank"
          >
            <option value="0">{{ "0" }}</option>
            <option value="4">{{ "4" }}</option>
            <option value="6">{{ "6" }}</option>
            <option value="9">{{ "9" }}</option>
            <option value="12">{{ "12" }}</option>
            <option value="16">{{ "16" }}</option>
          </select>
        </div>
        <span @click="searchSymbolByRank()">查找</span>
      </div>
    </div>
    <div class="KLineBox">
      <div
        class="KLineLineBox"
        :class="lineCount + 'LineItem'"
        v-for="(itemA, indexA) in KLineData"
        :key="itemA + indexA"
      >
        <div
          class="KLineRowBox"
          v-for="itemB in itemA"
          :key="itemB.symbol + interval"
        >
          <k-line
            class="item"
            :xkey="itemB.symbol"
            :symbol="itemB.symbol"
            :interval="interval"
          ></k-line>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import searchConfig from "../service/searchConfig";
import { rankDataMap } from "../utilities/dataMap";
export default {
  components: {
    KLine: () => {
      return import("./KLine");
    },
  },
  data() {
    return {
      searchData: {
        volume: "",
        rank: "4",
      },
      interval: "15",
      KLineData: [[{ symbol: "BTCUSDT" }]],
      searchInterval: "",
    };
  },
  computed: {
    lineCount() {
      switch (this.KLineData.length) {
        case 1:
          return "one";
        case 2:
          return "two";
        case 3:
          return "three";
        case 4:
          return "four";
      }
    },
  },
  methods: {
    searchSymbolByRank() {
      clearInterval(this.searchInterval);
      const params = {};
      params.limit = this.searchData.rank;
      params.volume_from = this.searchData.volume;
      params.exchange = "huobi";
      params.type = "spot";
      params.period = "1day"; //默认是24小时的成交量
      //根据volumeFrom获取volumeTo
      switch (this.searchData.volume) {
        case "50000000":
          params.volume_to = "100000000";
          break;
        case "100000000":
          params.volume_to = "200000000";
          break;
        case "200000000":
          params.volume_to = "500000000";
          break;
        case "500000000":
          params.volume_to = "1000000000";
          break;
        case "1000000000":
          params.volume_to = "";
          break;
        default:
          params.volume_to = "";
      }
      searchConfig
        .getSymbolListByRank(params)
        .then((res) => {
          // console.log(res.data);

          //这是把数据处理成渲染需要的二维数组格式
          if (res.data.data.items) {
            // 如果过滤得到的数据是空的，那就去掉
            this.KLineData = rankDataMap(
              this.searchData.rank,
              res.data.data.items
            ).filter((item) => {
              return item.length > 0;
            });
          } else {
            alert("未查询到数据");
          }
        })
        .catch((err) => {
          alert("网络异常~");
        });
      if (this.searchData.rank != "0") {
        this.searchInterval = setInterval(this.searchSymbolByRank, 3000);
      }
    },
    //这个是用来切换到自定义模式
    changeMode(type) {
      this.$emit("changeMode", type);
    },
  },
};
</script>

<style lang="less" scope>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  // background-color: #131722;
  #banner-box {
    background-color: #131722;
    color: #787b86;
    height: 4%;
    // padding: 10px;
    border-bottom: 1px solid #787b86;
    .center-container {
      width: 50%;
      min-width: 600px;
      height: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      align-items: center;
      span {
        padding: 0 5px;
      }
      .select-box {
        height: 100%;
        display: flex;
        align-items: center;
        .select-title {
          border: none;
          padding: 0;
        }
        .select-content {
          cursor: pointer;
          border: 1px solid #787b86;
          background-color: #131722;
          border-radius: 3px;
          color: #787b86;
        }
      }
      .input-box {
        background-color: #131722;
        border: 1px solid #787b86;
        border-radius: 3px;
        padding-left: 5px;
      }
    }
    span {
      cursor: pointer;
      border: 1px solid #787b86;
      border-radius: 3px;
    }
  }
  .KLineBox {
    height: 96%;
    .oneLineItem {
      height: 100%;
      width: 100%;
      display: flex;
      .KLineRowBox {
        height: 100%;
        flex: 1;
        .item {
          height: 100%;
        }
      }
    }
    .twoLineItem {
      height: 50%;
      width: 100%;
      display: flex;
      .KLineRowBox {
        height: 100%;
        flex: 1;
        .item {
          height: 100%;
        }
      }
    }
    .threeLineItem {
      height: 33.3%;
      width: 100%;
      display: flex;
      .KLineRowBox {
        height: 100%;
        flex: 1;
        .item {
          height: 100%;
        }
      }
    }
    .fourLineItem {
      height: 25%;
      width: 100%;
      display: flex;
      .KLineRowBox {
        height: 100%;
        flex: 1;
        .item {
          height: 100%;
        }
      }
    }
  }
}
</style>