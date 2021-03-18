<template>
  <div id="app">
    <!-- 通过list循环展示k线图 -->
    <k-line
      :class="switchKline"
      :symbol="item.symbol"
      :exchange="item.exchange"
      :interval="item.interval"
      :xkey="index"
      :key="index"
      v-for="(item, index) in list"
    ></k-line>
  </div>
</template>

<script>
import KLine from "./views/KLine";
export default {
  data() {
    return {
      list: [],
    };
  },
  components: { KLine },
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
    switchKline() {
      let lineType = "";
      switch (this.list.length) {
        case 1:
          lineType = "k-line-large";
          break;
        case 2:
          lineType = "k-line-middle";
          break;
        case 3:
          lineType = "k-line-small";
          break;
        default:
          lineType = "k-line-supersmall";
      }
      return lineType;
    },
  },
};
</script>


<style lang="less">
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
  display: flex;
  // align-items: center;
  flex-flow: wrap;
  //根据图表数量的不同添加不同的class以充满屏幕
  .k-line-supersmall {
    /*border: 1px solid black;*/
    width: 50%;
    height: 50%;
    flex-shrink: 1;
  }
  .k-line-small {
    width: 50%;
    height: 50%;
    flex-shrink: 1;
    &:nth-child(3) {
      width: 100%;
    }
  }
  .k-line-middle {
    /*border: 1px solid black;*/
    width: 50%;
    height: 100%;
    flex-shrink: 1;
  }
  .k-line-large {
    /*border: 1px solid black;*/
    width: 100%;
    height: 100%;
    flex-shrink: 1;
  }
}
</style>
