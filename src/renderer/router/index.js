import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/index',
      name: 'index',
      component: require('@/view/index').default
    },
    {
      path: '/stock/:code',
      name: 'stock',
      component: require('@/view/stock').default
    }
  ]
})
