import Vue from 'vue'
import moment from 'moment'
import App from './App.vue'
import router from './router'
import './assets/reset.css'
import 'element-ui/lib/theme-chalk/index.css';

Vue.filter('mapTime',(time,format)=>{
  return moment(time).format(format)
})
Vue.prototype.$moment = moment
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
