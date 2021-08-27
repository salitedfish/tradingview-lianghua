<template>
  <div id="app">
    <div id="banner-box">
      <div class="center-container">
        <span @click="changeMode('screen')" class="btn" v-if="!isMobile">自定义模式</span>
        <span
          @click="showExchange = 'zhaobi'"
          v-if="showExchange == 'huobi'"
          class="btn"
        >火币</span>
        <span
          @click="showExchange = 'huobi'"
          v-if="showExchange == 'zhaobi'"
          class="btn"
        >找币</span>
        <span @click="changeTheme('light')" class="btn" v-if="!isMobile">明亮</span>
        <span @click="changeTheme('dark')" class="btn" v-if="!isMobile">暗黑</span>
        <span @click="changeRowCount('less')" class="btn" v-if="!isMobile">减一列</span>
        <span @click="changeRowCount('more')" class="btn" v-if="!isMobile">加一列</span>
        <span @click="changeLineCount('less')" class="btn" v-if="!isMobile">减一行</span>
        <span @click="changeLineCount('more')" class="btn" v-if="!isMobile">加一行</span>
        <div class="search-box" v-if="!isMobile">
          <input
            type="text"
            class="input-box"
            placeholder="请输入要添加的币种..."
            v-model="addSymbol"
            @input="searchEvent()"
          />
          <ul class="search-list">
            <li
              v-for="item in this.addSearchList"
              :key="item.symbol+item.exchange"
              @click="checkoutSymbol(item.symbol)"
            >
              {{ item.symbol }} -- {{item.exchange}}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 通过list循环展示k线图 -->
    <div
      class="kline-box huobiBox"
      v-if="showExchange == 'huobi'"
    >
      <div
        v-for="(SymbolItem, SymbolIndex) in list"
        :key="SymbolIndex"
        :class="lineClassByCount"
      >
        <!-- 注意要保证每个k-line的xkey值不相同,不然会挂载在同一个地方 -->
        <k-line
          :class="lineClassByCount + '-item'"
          :symbol="SymbolItem.symbol"
          :exchange="SymbolItem.exchange"
          :interval="item"
          :yIndex="SymbolIndex"
          :xkey="SymbolItem.symbol + index.toString() + SymbolIndex.toString()"
          v-for="(item, index) in RowListDate[RowCount - 1]"
          :key="SymbolItem.symbol + item"
          :createDelay="KLineDelayTime(index, SymbolIndex)"
          @symbolChanged="symbolChanged"
          ref="kLine"
        ></k-line>
      </div>
    </div>
    <div
      class="kline-box zhaobiBox"
      v-if="showExchange == 'zhaobi'"
    >
      <div
        v-for="(SymbolItem, SymbolIndex) in list"
        :key="SymbolIndex"
        :class="lineClassByCount"
      >
        <k-line-b
          :class="lineClassByCount + '-item'"
          :symbol="SymbolItem.symbol"
          :exchange="SymbolItem.exchange"
          :interval="item"
          :yIndex="SymbolIndex"
          :xkey="SymbolItem.symbol + index.toString() + SymbolIndex.toString()"
          v-for="(item, index) in RowListDate[RowCount - 1]"
          :key="SymbolItem.symbol + item"
          :createDelay="KLineDelayTime(index, SymbolIndex)"
          @symbolChanged="symbolChanged"
          ref="kLine"
        ></k-line-b>
      </div>
    </div>
  </div>
</template>

<script>
import searchConfig from "../service/searchConfig";
import { isMobile } from "../utilities/tools"
const RowListDate = [
  ["15"],
  ["15", "60"],
  ["15", "60", "240"],
  ["15", "60", "240", "1D"],
];
export default {
  name: "KLinePageCustom",
  data() {
    return {
      list: [],
      RowCount: 1,
      RowListDate,
      addSymbol: "",
      addSymbolCase: "",
      addSearchList: [],
      showExchange: "zhaobi",
      isMobile: isMobile()
    };
  },
  components: {
    KLine: () => {
      return import("./KLine");
    },
    KLineB: () => {
      return import("./KlineB.vue");
    },
  },
  mounted() {
    //从其他页面跳转过来的路由获取参数
    const query = this.$route.query;
    //如果路由中list存在
    if (query.symbol) {
        this.list = [{
          symbol:query.symbol
        }];
    } else {
      //如果路由中list不存在
      this.list = [
        {
          symbol: "ETHUSDT",
        },
      ];
    }
  },
  computed: {
    lineClassByCount() {
      let lineType = "line-one";
      switch (this.list.length) {
        case 1:
          lineType = "line-one";
          break;
        case 2:
          lineType = "line-two";
          break;
        case 3:
          lineType = "line-three";
          break;
        case 4:
          lineType = "line-four";
          break;
        default:
          lineType = "line-one";
      }
      return lineType;
    },
  },
  methods: {
    changeLineCount(type) {
      if (this.list.length >= 2 && type == "less") {
        this.list.pop();
      } else if (this.list.length <= 3 && type == "more") {
        this.addSymbolCase = "addLine";
        //添加行的时候如果没有填对应的symbol，则使用前一个symbol
        if (!this.addSymbol) {
          const preSymbol = this.list[this.list.length - 1].symbol;
          this.list.push({ symbol: preSymbol });
        } else {
          this.list.push({ symbol: this.addSymbol });
        }
      }
    },
    changeRowCount(type) {
      if (this.RowCount >= 2 && type == "less") {
        this.RowCount--;
      } else if (this.RowCount <= 3 && type == "more") {
        this.addSymbolCase = "addRow";
        this.RowCount++;
      }
    },
    //设置kline的延时创建时间,同时加载太多有可能会丢失样式覆盖
    KLineDelayTime(index, SymbolIndex) {
      switch (this.addSymbolCase) {
        case "":
          return index * 200 + SymbolIndex * 500;
        case "addLine":
          return index * 200;
        case "addRow":
          return SymbolIndex * 200;
      }
    },
    //改变总主题
    changeTheme(theme) {
      for (let kLineItem of this.$refs.kLine) {
        kLineItem.changeTheme(theme);
      }
    },
    //当K线的symbol改变时，对应index的list里面的对应项的symbol也改变，同时同一行的symbol变了导致key变了
    symbolChanged(param) {
      this.list[param.index].symbol = param.symbol;
    },
    changeMode(type) {
      this.$emit("changeMode", type);
    },
    searchEvent() {
      const params = {
        query: this.addSymbol,
        limit: 30,
        type: "",
        exchange: "",
      };
      if (this.addSymbol && this.showExchange == "huobi") {
        searchConfig
          .getSymbolListBySearch(params)
          .then((res) => {
            this.addSearchList = res.data;
          });
      } else if (this.addSymbol && this.showExchange == "zhaobi") {
        searchConfig
          .getZhaobiSymbolListBySearch(params)
          .then((res) => {
            this.addSearchList = res.data;
          });
      } else {
        this.addSearchList = [];
      }
    },
    checkoutSymbol(symbol) {
      this.addSymbol = symbol;
      this.addSearchList = [];
    },
  },
};
</script>


<style lang="less" scope>
html,
body {
  height: 100%;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  // background-color: #131722;
  #banner-box {
    // background-color: #131722;
    background-color: white;
    color: black;
    height: 4%;
    // padding: 10px;
    border-bottom: 1px solid #787b86;
    width: calc(100vw);


    .center-container {
      width: 50%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      align-items: center;
      min-width: 400px;
      span {
        padding: 0 5px;
      }
      .btn {
        &:hover {
              background-color: rgba(0, 132, 255, 0.781);
              color: white;
              border: 1px solid white;

        }
      }
      .search-box {
        position: relative;
        .input-box {
          background-color: white;
          border: 1px solid #787b86;
          border-radius: 3px;
          padding-left: 5px;
        }
        .search-list {
          position: absolute;
          top: 25px;
          left: 0;
          right: 0;
          // background-color: #131722;
          background-color: white;
          border-radius: 3px;
          color: black;
          opacity: 0.9;
          li {
            cursor: pointer;
            border: 1px solid #787b86;
            &:hover {
              background-color: rgba(0, 132, 255, 0.781);
              color: white;
              // background-color: #787b86;
              // color: #131722;
            }
          }
        }
      }
    }
    span {
      cursor: pointer;
      border: 1px solid #787b86;
      border-radius: 3px;
    }
  }
  .kline-box {
    height: 96%;
    .line-one {
      width: 100%;
      height: 100%;
      display: flex;
      &-item {
        height: 100%;
        flex: 1;
      }
    }
    .line-two {
      width: 100%;
      height: 50%;
      display: flex;
      &-item {
        height: 100%;
        flex: 1;
      }
    }
    .line-three {
      width: 100%;
      height: 33.333%;
      display: flex;
      &-item {
        height: 100%;
        flex: 1;
      }
    }
    .line-four {
      width: 100%;
      height: 25%;
      display: flex;
      &-item {
        height: 100%;
        flex: 1;
      }
    }
  }
}
</style>
