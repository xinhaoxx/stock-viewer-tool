<template>
  <el-dialog :visible.sync="isVisible"
             :show-close="false"
             center
             class="optional-dialog">
    <el-select v-model="code"
               filterable
               remote
               reserve-keyword
               placeholder="股票代码 / 名称 / 缩写"
               :remote-method="fetchHint"
               :default-first-option="true"
               @change="handleAction"
               ref="codeSelect"
               class="code-select"
               loading-text="加载中...">
      <el-option
              v-for="(item,index) in hints"
              :key="index"
              :label="item.name"
              :value="item.market+item.code"
              :popper-append-to-body="false">
        <div class="hint-option-item">
          <span class="hint-market">{{ transMarketName(item.market) }}</span>
          <span class="hint-name">{{ item.name }}</span>
          <span class="hint-code">{{ item.code }}</span>
          <span class="hint-letter">{{ item.letter }}</span>
        </div>
      </el-option>
    </el-select>
  </el-dialog>
</template>

<script>
  import {stockIndex} from '../libs/constant'

  export default {
    data () {
      return {
        isVisible: false, // 是否显示弹窗
        code: null, // 输入的代码
        hints: [] // 下拉提示
      }
    },
    methods: {
      /**
       * 显示当前添加自选股的弹窗
       * @param key {string|*} - 按键映射的键值
       */
      show (key = null) {
        this.isVisible = !this.isVisible
        if (!this.isVisible) {
          this.$refs['codeSelect'].blur()
        } else {
          setTimeout(() => {
            this.code = key
            this.hints = []
            this.$refs['codeSelect'].focus()
          }, 1)
        }
      },
      /**
       * element-ui 下拉远程获取自选股关键字提示方法
       */
      fetchHint (query) {
        this.$http.get(`http://smartbox.gtimg.cn/s3/?t=all&q=${query}&cb=zepto_suggest_1553825409638`).then(res => {
          let data = res.data.substring(8, res.data.length - 1).split('^')
          const canBeUse = ['sh', 'sz', 'hk'] // 可以添加的市场
          // 将可用的存储起来
          let temp = []
          for (let i = 0; i < data.length; i++) {
            let splited = data[i].split('~')
            // 非可用市场则排除
            if (canBeUse.indexOf(splited[0]) > -1) {
              let hint = {
                market: splited[0],
                code: splited[1],
                name: unescape(splited[2].replace(/\\u/g, '%u')),
                letter: splited[3]
              }
              temp.push(hint)
            }
          }
          // 可用的赋值到hints数组中
          this.hints = []
          temp.forEach((item, index) => {
            this.$set(this.hints, index, item)
          })
        })
      },
      /**
       * 执行添加个股
       * @param code {string} - 需要添加的个股代码
       */
      handleAction (code) {
        let storage = localStorage.getItem('optionals')
        if (storage !== null && storage !== '') {
          let splitCode = storage.split(',') // 获取存储的代码
          // 判断是否存在
          if (splitCode.indexOf(code) > -1 || stockIndex.indexOf(code) > -1) {
            this.$toasted.show('已存在股票代码', {
              theme: 'toasted-primary',
              position: 'bottom-center',
              duration: 2000
            })
            this.refreshOptionals()
          } else {
            localStorage.setItem('optionals', `${code},${storage}`) // 非空的情况
            this.$toasted.show('添加完成', {
              theme: 'toasted-primary',
              position: 'bottom-center',
              duration: 2000
            })
            this.refreshOptionals()
          }
        } else {
          localStorage.setItem('optionals', code) // 空的情况
          this.$toasted.show('添加完成', {
            theme: 'toasted-primary',
            position: 'bottom-center',
            duration: 2000
          })
          this.refreshOptionals()
        }
      },
      /**
       * 重置下拉的所有提示选项
       */
      refreshOptionals () {
        this.code = null
        this.isVisible = false
        this.hints = []
        this.$emit('finish')
      }
    }
  }
</script>
<style lang="scss">
  @import '../scss/optional';
</style>
