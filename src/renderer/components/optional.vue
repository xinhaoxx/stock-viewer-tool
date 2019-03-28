<template>
  <el-dialog :visible.sync="isVisible"
             width="300px"
             :show-close="false"
             center
             class="optional-dialog">
    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item prop="code" style="width:100%;">
        <el-input v-model="form.code"
                  ref="codeInput"
                  placeholder="请输入股票代码"
                  style="width:100%;"
                  maxlength="6"
                  autofocus="true"
                  @keyup.enter.native="validate">
        </el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      const checkCode = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('股票代码不能为空'))
        } else if (!/^\d{5,6}$/.test(value)) {
          callback(new Error('股票代码不正确'))
        } else {
          callback()
        }
      }
      return {
        isVisible: false,
        form: {
          code: null
        },
        rules: {
          code: [
            {validator: checkCode, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      // 显示
      show () {
        this.isVisible = !this.isVisible
      },
      // 验证表单
      validate () {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.handleAction()
          }
        })
      },
      // 执行添加操作
      handleAction () {
        let market = this.checkMarket(this.form.code)
        let finalCode = market + this.form.code
        let storage = localStorage.getItem('optionals')
        if (storage !== null && storage !== '') {
          let splitCode = storage.split(',')
          if (splitCode.indexOf(finalCode) > -1) {
            this.$toasted.show('已存在股票代码', {
              theme: 'toasted-primary',
              position: 'bottom-center',
              duration: 2000
            })
          } else {
            localStorage.setItem('optionals', `${storage},${finalCode}`)
            this.$toasted.show('添加完成', {
              theme: 'toasted-primary',
              position: 'bottom-center',
              duration: 2000
            })
            this.form.code = null
            this.isVisible = false
          }
        } else {
          localStorage.setItem('optionals', finalCode)
          this.form.code = null
          this.isVisible = false
        }
      },
      // 获取代码所在市场
      checkMarket (code) {
        const shRules = [5, 6, 7, 9] // 沪配,沪A,沪新,沪B
        if (code.length === 6) {
          let firstNumber = parseInt(code.substring(0, 1))
          return shRules.indexOf(firstNumber) > -1 ? 'SH' : 'SZ' // 非沪开头均为深
        } else {
          return 'HK'
        }
      }
    }
  }
</script>
<style lang="scss">
  .optional-dialog {
    * {
      font-family: PingFang SC, 'Source Sans Pro', sans-serif;
      text-align: center;
    }

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      .el-form-item__error {
        width: 100%;
      }
    }

  }
</style>
