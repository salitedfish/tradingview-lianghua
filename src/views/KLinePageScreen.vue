<template>
  <div id="app">
    <div id="banner-box">
      <div class="center-container">
        <span @click="changeMode('custom')">筛选模式</span>
        <div class="select-box">
          <span class="select-title">成交量：</span>
          <select
            name="交易量"
            id="selectBox"
            class="select-content"
            v-model="searchData.volume"
          >
            <option value="10000">{{ "> 10000" }}</option>
            <option value="5000">{{ "> 5000" }}</option>
            <option value="1000">{{ "> 1000" }}</option>
          </select>
        </div>
        <div class="select-box">
          <span class="select-title">周期：</span>
          <select
            name="周期"
            id=""
            class="select-content"
            v-model="searchData.interval"
          >
            <option value="15m">{{ "15分钟" }}</option>
            <option value="1h">{{ "1小时" }}</option>
            <option value="4h">{{ "4小时" }}</option>
            <option value="1d">{{ "1天" }}</option>
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
            <option value="4">{{ "4" }}</option>
            <option value="6">{{ "6" }}</option>
            <option value="9">{{ "9" }}</option>
            <option value="12">{{ "12" }}</option>
            <option value="16">{{ "16" }}</option>
          </select>
        </div>
        <span @click="searchByScreen()">查找</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchData: {
        volume: "",
        interval: "",
        rank: "",
      },
    };
  },
  methods: {
    changeMode(type) {
      this.$emit("changeMode", type);
    },
    searchByScreen() {
      console.log(this.searchData);
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
}
</style>