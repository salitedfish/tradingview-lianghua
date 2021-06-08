<template>
  <div id="app">
    <div id="banner-box">
      <div class="center-container">
        <span @click="changeMode('screen')">自定义模式</span>
        <span @click="changeTheme('light')">明亮</span>
        <span @click="changeTheme('dark')">暗黑</span>
        <span @click="changeRowCount('less')">减一列</span>
        <span @click="changeRowCount('more')">加一列</span>
        <span @click="changeLineCount('less')">减一行</span>
        <span @click="changeLineCount('more')">加一行</span>
        <div class="search-box">
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
    <div id="kline-box">
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
  </div>
</template>

<script>
import searchConfig from "../service/searchConfig";
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
    };
  },
  components: {
    KLine: () => {
      return import("./KLine");
    },
  },
  mounted() {
    //从其他页面跳转过来的路由获取参数
    const query = this.$route.query;
    //如果路由中list存在
    if (query.list) {
      try {
        this.list = JSON.parse(query.list);
      } catch (e) {
        this.list = [];
      }
    } else {
      //如果路由中list不存在
      this.list = [
        {
          symbol: 'BTCUSDT',
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
      if (this.addSymbol) {
        searchConfig
          .getSymbolListBySearch({
            query: this.addSymbol,
            limit: 30,
            type: "",
            exchange: "",
          })
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
    background-color: #131722;
    color: #787b86;
    height: 4%;
    // padding: 10px;
    border-bottom: 1px solid #787b86;
    .center-container {
      width: 50%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      align-items: center;
      min-width: 1000px;
      span {
        padding: 0 5px;
      }
      .search-box {
        position: relative;
        .input-box {
          background-color: #131722;
          border: 1px solid #787b86;
          border-radius: 3px;
          padding-left: 5px;
        }
        .search-list {
          position: absolute;
          top: 25px;
          left: 0;
          right: 0;
          background-color: #131722;
          border-radius: 3px;
          color: #787b86;
          opacity: 0.9;
          li {
            cursor: pointer;
            border: 1px solid #787b86;
            &:hover {
              background-color: #787b86;
              color: #131722;
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
  #kline-box {
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
