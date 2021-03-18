const createTradingView = (vm, config = {}) => {
    //定义symbol,从vue实例的参数中获取数据
    // console.log(vm.exchange)
    // console.log(vm.symbol)
    // console.log(vm.interval)
    // console.log(vm.xkey)
    const symbolInfo = vm.symbol
        ? { name: vm.symbol, exchange: vm.exchange || "ZHAOBI" }
        : {
            name: "BTCUSDT",
            exchange: "ZHAOBI",
        };

    //设置tradingview的默认参数
    const defaultConfig = {
        //根据屏幕自适应大小
        autosize: true,
        // fullscreen: true,
        // width: "100%",
        // height: "100%",
        //周期，可以设置60s或60，没写单位代表60分钟，小时必须用分钟表示。用来设置每个K线间隔的时间
        interval: vm.interval || "60",
        //初始商品名
        symbol: symbolInfo.name,
        //挂载的dom元素
        container_id: "kline_container_" + vm.xkey,
        // datafeed: new Datafeeds.UDFCompatibleDatafeed("http://172.16.103.31:15921/kdata",10000),
        //采用接口提供数据
        datafeed: new Datafeeds.UDFCompatibleDatafeed(
            "/api",
            // "https://api.33.cn/kdata",
            // "https://kdata.zhaobi.tech/kdata",
            10000
        ),
        //设置static文件夹路径
        library_path: `${vm.baseUrl}kline/charting_library/`,
        locale: "zh",
        timezone: "Asia/Shanghai", // 设置时区
        charts_storage_api_version: "1.2",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        debug: false,
        // loading_screen: { backgroundColor: "#000000", foregroundColor: "#000000", },//todo:do it
        allow_symbol_change: true,
        // theme: "Dark",
        timeframe: "1m",//设置初始的时间展示范围
        // toolbar_bg: "#222",
        //点击改变周期，将周期转化为resolution写的周期
        time_frames: [
            { text: "1y", resolution: "1W" },
            { text: "6m", resolution: "2D" },
            { text: "3m", resolution: "1D" },
            { text: "1m", resolution: "1D" },
            { text: "7d", resolution: "60" },
            { text: "3d", resolution: "30" },
            { text: "1d", resolution: "15" },
            { text: "6h", resolution: "15" },
            { text: "3h", resolution: "5" }
        ]
        ,

        //设置禁用哪些特性
        disabled_features: [
            // "edit_buttons_in_legend",
            // "header_widget",
            // "left_toolbar",
            // "edit_buttons_in_legend",
            // "use_localstorage_for_settings",
            // "timeframes_toolbar",
            // "display_market_status",
            // "border_around_the_chart",
            // "context_menus",
            // "property_pages",
            // "dont_show_boolean_study_argument",
            // "source_selection_markers",
            // "caption_buttons_text_if_possible",
            // "volume_force_overlay",
            // "remove_library_container_border",
            // "fundamental_widget",
            // "control_bar", //控制图表工具栏（鼠标移至底部会出现）
        ],

        //设置开启哪些特性
        enabled_features: [
            // "study_templates",
        ],

        overrides: {
            "mainSeriesProperties.style": 3, // k线图
            // "paneProperties.background": "rgb(27,34,63)", // 背景色透明
            "paneProperties.background": "#000000",
            "paneProperties.vertGridProperties.color": "transparent", // 垂直分割线透明
            "paneProperties.horzGridProperties.color": "rgb(47, 55, 89)", // 水平分割线
            "paneProperties.vertGridProperties.style": 2, //分割线 solid = 0; dotted = 1; dashed = 2; large dashed = 3
            "paneProperties.horzGridProperties.style": 2,

            // 'paneProperties.legendProperties.showSeriesTitle': false, // 图表标题
            // 'mainSeriesProperties.lineStyle.color':'rgb(100,22,44)',

            //这些是k线图 mainSeriesProperties为1时生效
            "mainSeriesProperties.candleStyle.upColor": "#B4525E", // 蜡烛图阳线颜色
            "mainSeriesProperties.candleStyle.borderUpColor": "#B4525E", // 阳线边框颜色
            "mainSeriesProperties.candleStyle.wickUpColor": "#B4525E", // 阳线的影线颜色
            "mainSeriesProperties.candleStyle.downColor": "#5FBD7B", // 蜡烛图阴线颜色
            "mainSeriesProperties.candleStyle.borderDownColor": "#5FBD7B", // 阴线边框颜色
            "mainSeriesProperties.candleStyle.wickDownColor": "#5FBD7B", // 阴线的影线颜色

            //这些是空心k线图 mainSeriesProperties为9时生效
            "mainSeriesProperties.showPriceLine": 1, // 是否显示当前价格线
            "scalesProperties.lineColor": "rgb(255, 77, 107)", //每个panel之间的分割线的颜色
            "scalesProperties.textColor": "#767D99",
            "mainSeriesProperties.hollowCandleStyle.upColor": "#B4525E",
            "mainSeriesProperties.hollowCandleStyle.downColor": "#5FBD7B",
            "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#B4525E",
            "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#5FBD7B",
            "mainSeriesProperties.hollowCandleStyle.drawBorder": false,
            "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#B4525E",
            "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#5FBD7B",
        },

        //统一设置指标的属性
        studies_overrides: {
            "volume.volume.color.0": "rgba(95,189,123,.6)",//设置成交量的颜色，0代表跌的时候
            "volume.volume.color.1": "rgba(180,82,94,.6)",//设置成交量颜色，1代表涨的时候
            // "volume.volume.transparency": 100
            //对比K线样式
            "Overlay.style": 1, // k线图
            "Overlay.candleStyle.upColor": "#B4525E", // 蜡烛图阳线颜色
            "Overlay.candleStyle.borderUpColor": "#B4525E", // 阳线边框颜色
            "Overlay.candleStyle.wickUpColor": "#B4525E", // 阳线的影线颜色
            "Overlay.candleStyle.downColor": "#5FBD7B", // 蜡烛图阴线颜色
            "Overlay.candleStyle.borderDownColor": "#5FBD7B", // 阴线边框颜色
            "Overlay.candleStyle.wickDownColor": "#5FBD7B", // 阴线的影线颜色
            // "bollinger bands.upper.linewidth": 10,//用来设置布林带的上规宽度
            // "bollinger bands.lower.linewidth": 10,
            // "Moving Average.plot.color": "#333333",//设置全部均线的默认颜色，后续每次创建均线指标时可以覆盖
        },


        scalesProperties: {
            // showLeftScale: 1,
            // showRightScale: !0,
            // backgroundColor: "#fff",
            // lineColor: "#fff",
            // textColor: "#fff",
            // fontSize: 11,
            // scaleSeriesOnly: !1,
            // showSeriesLastValue: !0,
            // showSeriesPrevCloseValue: !1,
            // showStudyLastValue: !1,
            // showSymbolLabels: !1,
            // showStudyPlotLabels: !1
        },
    }
    //将用户配置与默认参数合并
    const currentConfig = {}
    Object.assign(currentConfig, defaultConfig, config)
    console.log('cc',currentConfig)
    //返回tradingview实例
    return new TradingView.widget(currentConfig);

}

export {
    createTradingView
}