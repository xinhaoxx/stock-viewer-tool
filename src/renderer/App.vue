<template>
  <div id="app" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <router-view></router-view>
  </div>
</template>

<script>
  const ipc = window.require('electron').ipcRenderer
  export default {
    name: 'stocktools',
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
