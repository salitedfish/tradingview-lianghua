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
        target: 'http://119.8.239.24:5062',
        pathRewrite: {
          '^/api': ''
        }
      },
      '/rank': {
        target: "http://119.8.239.24:18080",
        pathRewrite: {
          "^/rank": ''
        }
      },
      //这个找币接口支持持仓量
      '/zhaobiapi': {
        target: "https://api.33.cn/kdata",
        pathRewrite: {
          "^/zhaobiapi": ''
        }
      }
    }
  },
}