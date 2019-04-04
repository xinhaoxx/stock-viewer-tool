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
          <span class="hint-market">{{ getMarketName(item.market) }}</span>
          <span class="hint-name">{{ item.name }}</span>
          <span class="hint-code">{{ item.code }}</span>
          <span class="hint-letter">{{ item.letter }}</span>
        </div>
      </el-option>
    </el-select>
  </el-dialog>
</template>

<script>
  const indexs = ['sh000001', 'sz399001', 'sz399006'] // 指数

  export default {
    data () {
      return {
        isVisible: false, // 是否显示弹窗
        code: null, // 输入的代码
        hints: [] // 下拉提示
      }
    },
    methods: {
      // 显示
      show (number = null) {
        this.isVisible = !this.isVisible
        if (!this.isVisible) {
          this.$refs['codeSelect'].blur()
        } else {
          setTimeout(() => {
            this.code = number
            this.hints = []
            this.$refs['codeSelect'].focus()
          }, 1)
        }
      },
      // 获取提示
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
      // 执行添加操作
      handleAction (code) {
        let storage = localStorage.getItem('optionals')
        if (storage !== null && storage !== '') {
          let splitCode = storage.split(',') // 获取存储的代码
          // 判断是否存在
          if (splitCode.indexOf(code) > -1 || indexs.indexOf(code) > -1) {
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
      // 获取市场名称
      getMarketName (mk) {
        switch (mk) {
          case 'sh':
            return '上证'
          case 'sz':
            return '深证'
          case 'hk':
            return '港股'
        }
      },
      // 刷新
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
