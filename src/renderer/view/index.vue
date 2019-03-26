<template>
  <div id="box" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <!--顶栏部分-->
    <div class="header">
      <h1>自选小工具</h1>
      <div class="action-buttons">
        <a class="button-pin" @click="addOptional">
          <i class="icon-add"></i>
        </a>
        <a class="button-min" @click="setWinMin">
          <i class="icon-min"></i>
        </a>
        <a class="button-close" @click="setWinClose">
          <i class="icon-close"></i>
        </a>
      </div>
    </div>
    <!--指数部分-->
    <div class="stock-index">
      <div v-for="(item,index) in indexs" :key="index">
        <div class="upper-info">
          <h3>{{item.name}}</h3>
          <p>{{item.price}}</p>
        </div>
        <p class="index-gain"
           :class="{'gain-more':item.gain.percent>0,'gain-less':item.gain.percent<0}">
          {{item.gain.price>0?'+':''}}{{item.gain.price}}
          ({{item.gain.percent>0?'+':''}}{{item.gain.percent}}%)
        </p>
      </div>
    </div>
    <!--自选部分-->
    <div class="table-container">
      <el-table class="optional-stock-table" :data="optionals"
                height="310" size="small" :header-cell-style="{padding:0}"
                @row-dblclick="redirectToSnowBall"
                @row-contextmenu="deleteStock">
        <el-table-column
                label="股票">
          <template slot-scope="props">
            <div class="stock-info">
              <h3>{{props.row.name}}</h3>
              <p>{{props.row.code.toUpperCase()}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最新价" align="right">
          <template slot-scope="props">
            <p class="stock-price">{{props.row.price}}</p>
          </template>
        </el-table-column>
        <el-table-column prop="gain.price" label="涨跌价" align="right" sortable>
          <template slot-scope="props">
            <span class="gain-price"
                  :class="{'gain-more':props.row.gain.percent>0,'gain-less':props.row.gain.percent<0}">{{props.row.gain.price>0?'+':''}}{{props.row.gain.price}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gain.percent" label="涨跌幅" align="right" width="85" sortable>
          <template slot-scope="props">
            <span class="gain-percent"
                  :class="{'gain-more':props.row.gain.percent>0,'gain-less':props.row.gain.percent<0}">{{props.row.gain.percent>0?'+':''}}{{props.row.gain.percent}}%</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <optional-dialog ref="optionalDialog"/>
  </div>
</template>


<script>
  import OptionalDialog from '../components/optional'

  const shell = require('electron').shell
  const ipc = window.require('electron').ipcRenderer

  const stocksIndex = ['sh000001', 'sz399001'] // 指数

  const apiUrl = 'http://qt.gtimg.cn/' // 接口地址

  export default {
    components: {
      OptionalDialog
    },
    data () {
      return {
        indexs: [],
        optionals: []
      }
    },
    mounted () {
      setInterval(this.fetchData, 1000)
    },
    methods: {
      // 获取自选股数据
      fetchData () {
        let index = stocksIndex.map(item => 's_' + item) // 接口需要加前缀
        let storage = localStorage.getItem('optionals')
        let storageOptional = []
        if (storage !== '' && storage !== null) {
          storageOptional = storage.split(',')
        }
        let optionals = storageOptional.map(item => 's_' + item.toLowerCase())
        let all = index.concat(optionals)
        let query = all.join(',')
        this.$http.get(apiUrl, {params: {q: query}}).then(res => {
          this.resolveData(res.data)
        })
      },
      // 解析内容
      resolveData (data) {
        this.indexs = []
        this.optionals = []
        data = data.replace(/[\r\n]/g, '') // 去掉回车换行
        data = data.substring(0, data.length - 1) // 删除最后一位字符
        let splitData = data.split(';')
        splitData.forEach((item, index) => {
          let splitItem = item.split('=') // 按照等于号截取前后部分

          let prefix = splitItem[0] // 前缀部分 // 等号前
          let suffix = splitItem[1].match(/"(.*?)"/)[1] // 后缀内容，只取双引号内容

          let content = suffix.substring(0, suffix.length - 1).split('~')
          let stock = {
            code: prefix.substring(4, 12),
            name: content[1],
            price: content[3],
            gain: {
              price: content[4],
              percent: content[5]
            }
          }
          if (index < 2) {
            this.indexs.push(stock)
          } else {
            this.optionals.push(stock)
          }
        })
        this.updateToolTips(this.optionals)
      },
      redirectToSnowBall (row) {
        shell.openExternal('https://xueqiu.com/S/' + row.code)
        console.log(row)
      },
      setWinClose () {
        ipc.send('close')
      },
      setWinMin () {
        ipc.send('minimize')
      },
      addOptional () {
        this.$refs['optionalDialog'].show()
      },
      deleteStock (row) {
        let storage = localStorage.getItem('optionals')
        let storageOptional = storage.split(',')
        let final = []
        storageOptional.forEach(item => {
          if (item.toLowerCase() !== row.code.toLowerCase()) {
            final.push(item)
          }
        })
        localStorage.setItem('optionals', final.join(','))
      },
      updateToolTips (data) {
        let content = data.map(item => {
          return `${item.name}：当前价 ¥${item.price},涨跌 ¥${item.gain.price}（${item.gain.percent}%）`
        })
        ipc.send('update', content.join('\n'))
      },
      mouseEnter () {
        ipc.send('mouseenter')
      },
      mouseLeave () {
        console.log('mouseleave')
        ipc.send('mouseleave')
      }
    }
  }
</script>

<style lang="scss">
  @import '../scss/index.scss';
</style>
