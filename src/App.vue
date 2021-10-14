<template>
  <div id="app">
    <!-- 量化回归分析 -->
    <k-line-page-re-analyse v-if="showMode == 'reAnalyse'"></k-line-page-re-analyse>
    <!-- 自定义页面 -->
    <k-line-page-custom @changeMode="changeMode" v-if="showMode == 'custom'"></k-line-page-custom>
    <!-- 删选页面 -->
    <k-line-page-screen @changeMode="changeMode" v-if="showMode == 'screen'"></k-line-page-screen>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      showMode: "reAnalyse",
      // showMode: "custom",
      // showMode: "screen",
    };
  },
  components: {
    KLinePageCustom: () => {
      return import("./views/KLinePageCustom.vue");
    },
    KLinePageScreen: () => {
      return import("./views/KLinePageScreen.vue");
    },
    KLinePageReAnalyse: () => {
      return import("./views/KlinePageReAnalyse.vue")
    },
  },
  methods: {
    changeMode(type) {
      this.showMode = type;
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
