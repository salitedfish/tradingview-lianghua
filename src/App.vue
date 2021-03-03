<template>
  <div id="app">
    <k-line class="k-line" :symbol="item.symbol" :exchange="item.exchange" :interval="item.interval" :xkey="index" :key="index" v-for="item,index in list"></k-line>
  </div>
</template>

<script>
import KLine from "./views/KLine";
export default {
  data(){
    return{
      list:[],
    }
  },
  components: { KLine },
  mounted() {
    const query=this.$route.query;
    console.log(query)
    if(query.list){
      try{
        this.list=JSON.parse(query.list)
      }catch (e) {
        this.list=[];
      }

    }else{
      this.list=[{symbol:query.name,exchange:query.exchange,interval:query.interval}]
    }
  }
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
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  .k-line{

    /*border: 1px solid black;*/
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }
}
</style>
