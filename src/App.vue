<template>
  <div id="app">
    <k-line></k-line>
  </div>
</template>

<script>
import KLine from "./views/KLine";
export default {
  components: { KLine }
};
</script>


<style lang="less">
html, body {
  height: 100%;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
