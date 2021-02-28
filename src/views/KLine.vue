<template>
  <div class="kline">
    <div id="kline_container"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      baseUrl: process.env.BASE_URL,
      config: {
        'ZHAOBI': ['HOLD'],
        'HUOBI':['HOLD'],
        'MT4': ['EASYFOREX', 'OANDA']
      }
    }
  },
  mounted() {
    let vm = this;
    const query=this.$route.query;
    let symbolQuery={name:query.name,exchange:query.exchange}

    if(symbolQuery.name&&!symbolQuery.exchange){
      symbolQuery.exchange='ZHAOBI'
    }
    if(!symbolQuery.name){
      symbolQuery=null;
    }

    const symbolInfo =symbolQuery || localStorage.getItem("SymbolInfo") && JSON.parse(localStorage.getItem("SymbolInfo")) ||  {name: "BTCUSDT", exchange: "ZHAOBI"};
    console.log(symbolInfo);
    vm.widget = window.tvWidget = new TradingView.widget({
      autosize: true,
      interval: query.interval||"60",
      symbol: symbolInfo.name,
      container_id: "kline_container",
      // datafeed: new Datafeeds.UDFCompatibleDatafeed("http://172.16.103.31:15921/kdata",10000),
      datafeed: new Datafeeds.UDFCompatibleDatafeed(
        "https://api.33.cn/kdata",
        // "https://kdata.zhaobi.tech/kdata",
        10000
      ),
      library_path: `${this.baseUrl}kline/charting_library/`,
      locale: "zh",
      timezone: "Asia/Shanghai", // 设置时区
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      debug: false,
      //loading_screen:{ backgroundColor: "#000000",foregroundColor: "#000000", }//todo:do it
      allow_symbol_change: true,
      time_frames: [
        { text: "1y", resolution: "1W" },
        { text: "6m", resolution: "3D" },
        { text: "3m", resolution: "1D" },
        { text: "1m", resolution: "1D" },
        { text: "1w", resolution: "30" },
        { text: "3d", resolution: "30" },
        { text: "1d", resolution: "30" },
        { text: "6h", resolution: "15" },
        { text: "1h", resolution: "1" }
      ],
      disabled_features: [
        // "edit_buttons_in_legend",
        // "header_widget",
        "left_toolbar",
        // "edit_buttons_in_legend",
        // "use_localstorage_for_settings",
        // "timeframes_toolbar",
        "display_market_status",
        // "border_around_the_chart",
        // "context_menus",
        // "property_pages",
        // "dont_show_boolean_study_argument",
        // "source_selection_markers",
        // "caption_buttons_text_if_possible",
        // "volume_force_overla",
        // "remove_library_container_border",
        // "fundamental_widget",
        "control_bar", //控制图表工具栏（鼠标移至底部会出现）
      ],
      enabled_features: [
        // "study_templates",
      ],
      studies_overrides: {
        "volume.volume.color.0": "rgba(95,189,123,.6)",
        "volume.volume.color.1": "rgba(180,82,94,.6)",
        // "volume.volume.transparency": 100
         //对比K线样式
        "Overlay.style": 1, // k线图
        "Overlay.candleStyle.upColor": "#B4525E", // 蜡烛图阳线颜色
        "Overlay.candleStyle.borderUpColor": "#B4525E", // 阳线边框颜色
        "Overlay.candleStyle.wickUpColor": "#B4525E", // 阳线的影线颜色
        "Overlay.candleStyle.downColor": "#5FBD7B", // 蜡烛图阴线颜色
        "Overlay.candleStyle.borderDownColor": "#5FBD7B", // 阴线边框颜色
        "Overlay.candleStyle.wickDownColor": "#5FBD7B", // 阴线的影线颜色

      },
      overrides: {
        "mainSeriesProperties.style": 1, // k线图
        // "paneProperties.background": "rgb(27,34,63)", // 背景色透明
        // "paneProperties.vertGridProperties.color": "transparent", // 垂直分割线透明
        // "paneProperties.horzGridProperties.color": "rgb(47, 55, 89)", // 水平分割线
        "paneProperties.vertGridProperties.style": 2, //分割线 solid = 0; dotted = 1; dashed = 2; large dashed = 3
        "paneProperties.horzGridProperties.style": 2,
        // 'paneProperties.legendProperties.showSeriesTitle': false, // 图表标题
        // 'mainSeriesProperties.lineStyle.color':'rgb(100,22,44)',

        //这些是蜡烛图 mainSeriesProperties为1时生效
        "mainSeriesProperties.candleStyle.upColor": "#B4525E", // 蜡烛图阳线颜色
        "mainSeriesProperties.candleStyle.borderUpColor": "#B4525E", // 阳线边框颜色
        "mainSeriesProperties.candleStyle.wickUpColor": "#B4525E", // 阳线的影线颜色
        "mainSeriesProperties.candleStyle.downColor": "#5FBD7B", // 蜡烛图阴线颜色
        "mainSeriesProperties.candleStyle.borderDownColor": "#5FBD7B", // 阴线边框颜色
        "mainSeriesProperties.candleStyle.wickDownColor": "#5FBD7B", // 阴线的影线颜色

        //这些是蜡烛图 mainSeriesProperties为9时生效
        "mainSeriesProperties.showPriceLine": 1, // 是否显示当前价格线
        "scalesProperties.lineColor": "rgb(255, 77, 107)", //每个panel之间的分割线的颜色
        "scalesProperties.textColor":'#767D99',
        "mainSeriesProperties.hollowCandleStyle.upColor": "#B4525E",
        "mainSeriesProperties.hollowCandleStyle.downColor": "#5FBD7B",
        "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#B4525E",
        "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#5FBD7B",
        "mainSeriesProperties.hollowCandleStyle.drawBorder": false,
        "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#B4525E",
        "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#5FBD7B",


      },
      // scalesProperties: {
      //     showLeftScale: !1,
      //     showRightScale: !0,
      //     backgroundColor: "#ffffff",
      //     lineColor: "#fff",
      //     textColor: "#fff",
      //     fontSize: 11,
      //     scaleSeriesOnly: !1,
      //     showSeriesLastValue: !0,
      //     showSeriesPrevCloseValue: !1,
      //     showStudyLastValue: !1,
      //     showSymbolLabels: !1,
      //     showStudyPlotLabels: !1
      // },
      

    });
    vm.widget.onChartReady(() => {
      var entityId = [];
      vm.widget.chart().createStudy(
        "Moving Average",
        false,
        false,
        [5, "close", 0],
        null,
        { "Plot.color": "#965fc4" }
      );
      vm.widget.chart().createStudy(
        "Moving Average",
        false,
        false,
        [10, "close", 0],
        null,
        { "Plot.color": "#84aad5" }
      );
      vm.widget.chart().createStudy(
        "Moving Average",
        false,
        false,
        [30, "close", 0],
        null,
        { "Plot.color": "#55b263" }
      );
      vm.widget.chart().createStudy(
        "Moving Average",
        false,
        false,
        [60, "close", 0],
        null,
        { "Plot.color": "#b7248a" }
      );
      vm.widget.chart().createStudy("Bollinger Bands",false,false,[20,2])
      vm.widget.chart().createStudy("Bollinger Bands",false,false,[50,2])
      vm.widget.chart().createStudy("Bollinger Bands",false,false,[100,2])
      // vm.widget.chart().createStudy("Bollinger Bands",false,false,[200,2])
      // vm.widget.chart().createStudy("Bollinger Bands",false,false,[500,2])
     
      this.config[symbolInfo.exchange] && this.config[symbolInfo.exchange].forEach( val => {
        vm.widget.chart().createStudy('Overlay', false, false, [val + ':' + symbolInfo.name], (val)=>{
          entityId.push(val);
        });
      })
      vm.widget.chart().onSymbolChanged().subscribe(null,(Subscription)=>{
        entityId.forEach(item => {
          vm.widget.chart().removeEntity(item)
        })
        entityId = [];
        localStorage.setItem('SymbolInfo', JSON.stringify(Subscription));
        this.config[Subscription.exchange] && this.config[Subscription.exchange].forEach( val => {
          vm.widget.chart().createStudy('Overlay', false, false, [val + ':' + Subscription.name], (val)=>{
            entityId.push(val);
          });
        })
      },false)
    });
  },
  beforeDestroy() {
    for (let id of window.KLINEINTERVALS) {
      // console.log(id);
      clearInterval(id);
    }
    window.KLINEINTERVALS = [];
  }
};
</script>
<style>
.kline,
#kline_container {
  height: 100%;
}
</style>


