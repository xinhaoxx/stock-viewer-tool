<template>
  <div id="box">
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
      <div v-for="(item,index) in indexs"
           :key="index"
           @contextmenu="showContext(item)"
           :class="{'gain-more':item.gain.percent>0,'gain-less':item.gain.percent<0}">
        <div class="upper-info">
          <h3>{{item.name}}</h3>
          <p>{{item.price}}</p>
        </div>
        <p class="index-gain">
          <span>{{item.gain.price>0?'+':''}}{{item.gain.price}}</span>
          <span>{{item.gain.percent>0?'+':''}}{{item.gain.percent}}%</span>
        </p>
      </div>
    </div>
    <!--自选部分-->
    <div class="table-container">
      <el-table class="optional-stock-table"
                height="500"
                size="small"
                row-key="code"
                :data="optionals"
                :header-cell-style="{padding:0}"
                @row-contextmenu="showContext">
        <el-table-column label="股票" width="100">
          <template slot-scope="props">
            <div class="stock-info">
              <div>
                <h3>{{props.row.name}}</h3>
                <span v-if="props.row.status">
                  {{props.row.status==='S'?'停':'退'}}
                </span>
              </div>
              <p>{{props.row.code.toUpperCase()}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="最新价" align="right" width="75" sortable>
          <template slot-scope="props">
            <p class="stock-price">{{props.row.price}}</p>
          </template>
        </el-table-column>
        <el-table-column label="成交量" align="right" width="90">
          <template slot-scope="props">
            <p class="stock-volume">
              {{transVolume(props.row.volume)}}{{props.row.code.indexOf('hk')>-1 ?
              '万股':(props.row.volume.length > 4 ? '万手':'手')}}
            </p>
          </template>
        </el-table-column>
        <el-table-column prop="gain.percent" label="涨跌幅" align="right" sortable>
          <template slot-scope="props">
            <template v-if="!props.row.status">
            <span class="gain-price"
                  :class="{'gain-more':props.row.gain.percent>0,'gain-less':props.row.gain.percent<0}">
              {{props.row.gain.price>0?'+':''}}{{props.row.gain.price}}
            </span>
              <span class="gain-percent"
                    :class="{'gain-more':props.row.gain.percent>0,'gain-less':props.row.gain.percent<0}">
              {{props.row.gain.percent>0?'+':''}}{{props.row.gain.percent}}%
            </span>
            </template>
            <template v-else>
              <span class="gain-price">-</span>
              <span class="gain-percent">0.00%</span>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <optional-dialog ref="optionalDialog"/>
  </div>
</template>


<script>
  import OptionalDialog from '../components/optional'
  import Sortable from 'sortablejs'

  const shell = require('electron').shell
  const ipc = window.require('electron').ipcRenderer
  const drag = require('electron-drag')

  const Mousetrap = require('mousetrap')

  const stocksIndex = ['sh000001', 'sz399001', 'sz399006'] // 指数

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
      // 轮训获取数据
      setInterval(this.fetchData, 1000)
      // 拖拽功能
      this.rowDrop()
      Mousetrap.bind(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], (e) => {
        this.$refs['optionalDialog'].show(e.key)
      })
      // 使用 electron-drag 解决顶栏无法捕获鼠标事件的问题（暂不支持linux）
      drag('.header')
      // 如果不支持则使用样式的方式
      if (!drag.supported) {
        document.querySelector('.header').style['-webkit-app-region'] = 'drag'
      }

      this.initIpcListener()
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
            price: parseFloat(content[3]),
            gain: {
              price: parseFloat(content[4]),
              percent: parseFloat(content[5])
            },
            volume: content[6],
            status: content[8] === '' ? null : content[8]
          }
          if (index < stocksIndex.length) {
            this.indexs.push(stock)
          } else {
            this.optionals.push(stock)
          }
        })
        this.updateToolTips(this.optionals)
      },

      // 关闭窗口
      setWinClose () {
        ipc.send('close')
      },
      // 最小化窗口
      setWinMin () {
        ipc.send('minimize')
      },
      // 添加自选
      addOptional () {
        this.$refs['optionalDialog'].show()
      },
      // 显示右键菜单
      showContext (row) {
        ipc.send('rightClick', row.code)
      },
      // 删除自选
      deleteStock (code) {
        let storage = localStorage.getItem('optionals')
        let storageOptional = storage.split(',')
        let final = []
        storageOptional.forEach(item => {
          if (item.toLowerCase() !== code.toLowerCase()) {
            final.push(item)
          }
        })
        localStorage.setItem('optionals', final.join(','))

        this.$toasted.show('已删除', {
          theme: 'toasted-primary',
          position: 'bottom-center',
          duration: 2000
        })
      },
      // 更新托盘提示
      updateToolTips (data) {
        let content = data.map(item => {
          return `${item.name}：当前价 ¥${item.price},涨跌 ¥${item.gain.price}（${item.gain.percent}%）`
        })
        ipc.send('update', content.join('\n'))
      },

      // 将金额转为万为单位
      transVolume (number) {
        number = parseInt(number) + ''
        if (number.length > 4) {
          let integer = number.substring(0, number.length - 4)
          let decimal = integer.length > 3 ? '' : ('.' + number.substring(number.length - 5, number.length - 3))
          return integer + decimal
        } else {
          return number
        }
      },
      // 主线程事件监听
      initIpcListener () {
        ipc.on('show-xueqiu', (event, code) => {
          this.openInXueQiu(code)
        })
        ipc.on('show-guba', (event, code) => {
          this.openInGuBa(code)
        })
        ipc.on('delete-stock', (event, code) => {
          this.deleteStock(code)
        })
      },
      // 点击跳转雪球网站
      openInXueQiu (code) {
        let marketPrefix = code.substring(0, 2).toLowerCase()
        shell.openExternal('https://xueqiu.com/S/' + (marketPrefix === 'hk' ? code.substring(2) : code))
      },
      // 点击跳转东方财富网站
      openInGuBa (code) {
        let marketPrefix = code.substring(0, 2).toLowerCase()
        shell.openExternal('http://guba.eastmoney.com/list,' + (marketPrefix === 'hk' ? code : (code === 'sh000001' ? 'szzs' : code.substring(2))) + '.html')
      },
      // 行拖拽
      rowDrop () {
        const tbody = document.querySelector('.el-table__body-wrapper tbody')
        const _this = this
        Sortable.create(tbody, {
          animation: 120,
          onEnd ({newIndex, oldIndex}) {
            const currRow = _this.optionals.splice(oldIndex, 1)[0]
            _this.optionals.splice(newIndex, 0, currRow)
            _this.modifyData()
          }
        })
      },
      // 修改数据
      modifyData () {
        const modified = this.optionals.map((item) => item.code)
        localStorage.setItem('optionals', modified.join(','))
      }
    }
  }
</script>

<style lang="scss">
  @import '../scss/index.scss';
</style>
