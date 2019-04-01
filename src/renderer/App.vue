<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  const ipc = window.require('electron').ipcRenderer
  export default {
    name: 'stocktools',
    mounted () {
      // 单独为页面做事件监听可以防止出现部分处于 body 中的 element ui 元素监听不到的问题
      document.addEventListener('mouseenter', this.mouseEnter)
      document.addEventListener('mouseleave', this.mouseLeave)
    },
    methods: {
      // 鼠标进入
      mouseEnter () {
        ipc.send('mouseenter')
      },
      // 鼠标移出
      mouseLeave () {
        ipc.send('mouseleave')
      }
    }
  }
</script>

<style>
  html {
    padding: 10px;
  }
</style>
