<template>
  <div class="stock-window" v-if="stock" v-loading.fullscreen.lock="loading">
    <div class="window-content">
      <div class="stock-top">
        <h2 class="stock-name">
          {{stock.name}}
        </h2>
        <span class="stock-code">({{this.code.toUpperCase()}})</span>
        <div class="action-buttons">
          <a class="button-close" @click="setWinClose">
            <i class="icon-close"></i>
          </a>
        </div>
      </div>
      <div class="price-row">
        <div class="left-part" :class="comparePrice(stock.gain.price,0)">
          <span class="current-price">
          ¥{{stock.current.toFixed(2)}}
        </span>
          <span class="gain-price">
          {{stock.gain.price.toFixed(2)}}
        </span>
          <span class="gain-percent">
          {{stock.gain.percent.toFixed(2)}}%
        </span>
        </div>
        <div class="right-part">
          <span class="market-status">交易中</span>
          <span class="current-time"> {{stock.time}}（北京时间）</span>
        </div>
      </div>
      <el-form label-position="left" inline class="stock-info-form">
        <el-form-item label="最高:" :class="comparePrice(stock.highest,stock.yesterday)">
          <span>{{stock.highest.toFixed(2)}}</span>
        </el-form-item>
        <el-form-item label="今开:" :class="comparePrice(stock.today,stock.yesterday)">
          <span>{{stock.today.toFixed(2)}}</span>
        </el-form-item>
        <el-form-item label="涨停:" :class="comparePrice(stock.limit.up,stock.yesterday)">
          <span>{{stock.limit.up.toFixed(2)}}</span>
        </el-form-item>
        <el-form-item label="成交量:">
          <span>{{stock.volume.total}}</span>
        </el-form-item>
        <el-form-item label="最低:" :class="comparePrice(stock.lowest,stock.yesterday)">
          <span>{{stock.lowest.toFixed(2)}}</span>
        </el-form-item>
        <el-form-item label="昨收:">
          <span>{{stock.yesterday.toFixed(2)}}</span>
        </el-form-item>
        <el-form-item label="跌停:" :class="comparePrice(stock.limit.down,stock.yesterday)">
          <span>{{stock.limit.down.toFixed(2)}}</span>
        </el-form-item>
        <el-form-item label="成交额:">
          <span>{{stock.volume.turn}}</span>
        </el-form-item>
        <el-form-item label="换手:">
          <span>{{stock.turnover.toFixed(2)}}%</span>
        </el-form-item>
        <el-form-item label="总市值:">
          <span>{{stock.cap}}亿</span>
        </el-form-item>
        <el-form-item label="市净率:">
          <span>{{stock.ratio}}</span>
        </el-form-item>
        <el-form-item label="振幅:">
          <span>{{stock.swing.toFixed(2)}}%</span>
        </el-form-item>
        <el-form-item label="流通值:">
          <span>{{stock.float}}亿</span>
        </el-form-item>
      </el-form>
      <div class="k-line">
        <img :src="kline" draggable="false">
      </div>
    </div>
  </div>
</template>

<script>
  const ipc = window.require('electron').ipcRenderer

  export default {
    data () {
      return {
        stock: null,
        loading: false,
        kline: null
      }
    },
    mounted () {
      // 轮训获取数据
      if (this.code) {
        setInterval(this.fetchData, 5000)
      }
      ipc.on('change-code', (event, arg) => {
        this.loading = true
        this.fetchData()
        this.$router.replace({name: 'stock', params: {code: arg}})
      })
    },
    methods: {
      // 获取数据
      fetchData () {
        this.$http.get('http://qt.gtimg.cn/q=' + this.code).then(res => {
          const item = res.data.split('"')[1].split('~')
          this.stock = {
            name: item[1], // 名称
            code: item[2], // 代码
            current: parseFloat(item[3]), // 当前价
            yesterday: parseFloat(item[4]), // 昨收
            today: parseFloat(item[5]), // 今开
            volume: {
              total: item[6], // 成交量
              turn: item[37] // 成交额
            },
            out: item[7], // 外盘
            in: item[8], // 内盘
            time: item[30], // 时间
            gain: {
              price: parseFloat(item[31]), // 涨跌
              percent: parseFloat(item[32])// 涨跌%
            },
            highest: parseFloat(item[33]), // 最高
            lowest: parseFloat(item[34]), // 最低
            turnover: parseFloat(item[38]), // 换手率
            swing: parseFloat(item[43]), // 振幅
            float: item[44], // 流通市值
            cap: item[45], // 总市值
            ratio: item[46], // 市净率
            limit: {
              up: parseFloat(item[47]), // 涨停
              down: parseFloat(item[48])// 跌停
            }
          }
          this.loading = false
        })
        this.$http.get(`http://imgnode.gtimg.cn/hq_img`, {
          params: {
            code: this.code,
            type: 'minute',
            size: 1
            // proj: 'news?0.0680712785669062'
          },
          responseType: 'arraybuffer'
        }).then(res => {
          const result = 'data:image/png;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
          this.kline = result
        })
      },
      // 关闭窗口
      setWinClose () {
        ipc.send('sub-window-close')
      },
      /**
       * 比较两个值
       * @param value 被比较值
       * @param compare 比较值
       * @returns {string} 类名
       */
      comparePrice (value, compare) {
        return value > compare ? 'gain-more' : (value < compare ? 'gain-less' : '')
      }
    },
    computed: {
      code () {
        return this.$route.params['code']
      }
    }
  }
</script>

<style lang="scss">
  @import '../scss/stock';
</style>
