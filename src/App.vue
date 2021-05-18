<template>
  <div id="app">
    <div id="banner-box">
      <div class="center-container">
        <span @click="changeTheme('light')">明亮</span>
        <span @click="changeTheme('dark')">暗黑</span>
        <span @click="changeRowCount('less')">减一列</span>
        <span @click="changeRowCount('more')">加一列</span>
        <span @click="changeLineCount('less')">减一行</span>
        <span @click="changeLineCount('more')">加一行</span>
        <input
          type="text"
          class="input-box"
          placeholder="请输入要添加的币种..."
          v-model="addSymbol"
        />
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
          :xkey="SymbolItem.symbol + index.toString() + SymbolIndex.toString()"
          v-for="(item, index) in RowListDate[RowCount - 1]"
          :key="item"
          :createDelay="KLineDelayTime(index, SymbolIndex)"
          ref="kLine"
        ></k-line>
      </div>
    </div>
  </div>
</template>

<script>
const RowListDate = [
  ["15"],
  ["15", "60"],
  ["15", "60", "240"],
  ["15", "60", "240", "1D"],
];
export default {
  data() {
    return {
      list: [],
      RowCount: 2,
      RowListDate,
      addSymbol: "",
      addSymbolCase: "",
    };
  },
  components: {
    KLine: () => {
      return import("./views/KLine");
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
          symbol: query.name,
          exchange: query.exchange,
          interval: query.interval,
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
        this.list.push({ symbol: this.addSymbol });
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
      for(let kLineItem of this.$refs.kLine) {
        kLineItem.changeTheme(theme)
      }
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
      width: 30%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      align-items: center;
      span {
        padding: 0 5px;
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
  #kline-box {
    height: 96%;
    .line-one {
      width: 100%;
      height: 100%;
      display: flex;
      // flex-shrink: 1;
      &-item {
        height: 100%;
        flex: 1;
        // width: 100%;
      }
    }
    .line-two {
      /*border: 1px solid black;*/
      width: 100%;
      height: 50%;
      display: flex;
      // flex-shrink: 1;
      &-item {
        height: 100%;
        flex: 1;
        // width: 50%;
      }
    }
    .line-three {
      /*border: 1px solid black;*/
      width: 100%;
      height: 33.333%;
      display: flex;
      // flex-shrink: 1;
      &-item {
        height: 100%;
        flex: 1;
      }
    }
    .line-four {
      /*border: 1px solid black;*/
      width: 100%;
      height: 25%;
      display: flex;
      // flex-shrink: 1;
      &-item {
        height: 100%;
        flex: 1;
      }
    }
  }
}


</style>
