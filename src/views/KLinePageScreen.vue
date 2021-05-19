<template>
  <div id="app">
    <div id="banner-box">
      <div class="center-container">
        <span @click="changeMode('custom')">筛选模式</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    methods: {
        changeMode(type){
            this.$emit('changeMode',type)
        }
    }
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