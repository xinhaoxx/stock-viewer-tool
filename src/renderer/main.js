import Vue from 'vue'
import axios from 'axios'
import {Table, TableColumn, Input, Select, Option, Form, FormItem, Dialog, Button, Loading} from 'element-ui'
import Toasted from 'vue-toasted'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'

Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Input)
Vue.use(Select)
Vue.use(Option)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Dialog)
Vue.use(Button)
Vue.use(Toasted)
Vue.use(Loading)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
axios.defaults.headers.get['Content-Type'] = 'text/plain'
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: {App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')
