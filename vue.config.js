module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://fd.33.cn:1293',
        // 找币接口
        // target: 'http://47.56.83.226:5062',
        // PHP接口
        // target:'http://119.8.239.24:5062',
        // golang接口
        // target:'http://119.8.37.55:5062',
        // dydx
        // target:'http://119.8.37.55:6062',
        target:  "http://119.8.37.55:5062",
        pathRewrite: {
          '^/api': ''
        }
      },
      //代理到正式的筛选接口
      '/rank': {
        target: "http://123.60.6.107:18079",
        pathRewrite: {
          "^/rank": ''
        }
      },
      //这个找币接口支持持仓量
      '/zhaobiapi': {
        // target: "https://api.33.cn/kdata",
        target: "http://47.56.83.226:5062",
        pathRewrite: {
          "^/zhaobiapi": ''
        }
      },
      '/reAnalyse': {
        target: "http://159.138.40.136:8088",
        pathRewrite: {
          "^/reAnalyse": ''
        }
      }
    }
  },
}