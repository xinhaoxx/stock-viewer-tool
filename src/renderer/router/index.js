import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'index',
      component: require('@/view/index').default
    },
    {
      path: '/stock',
      name: 'stock',
      component: require('@/view/stock').default
    }
  ]
})
