module.exports={
  devServer: {
    proxy: {
      '/api':{
        // target: 'http://fd.33.cn:1293',
        // target: 'http://119.8.239.24:5062',
        // golang接口
        target: 'http://119.8.239.24:5062',
        pathRewrite: {
          '^/api': ''
        }
      },
      '/rank': {
        target: "http://119.8.239.24:18081",
        pathRewrite: {
          "^/rank": ''
        }
      }
    }
  },
}