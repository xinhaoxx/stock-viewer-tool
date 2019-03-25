<template>
  <el-dialog :visible.sync="isVisible"
             width="300px"
             :show-close="false"
             center
             class="optional-dialog">
    <h3>请输入股票代码</h3>
    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item prop="code" style="width:100%;">
        <el-input v-model="form.code"
                  placeholder="请输入股票代码"
                  size="small"
                  style="width:100%;"
                  maxlength="6">
          <el-select v-model="form.market" slot="prepend" placeholder="请选择" style="width:80px;">
            <el-option label="上证" value="SH"></el-option>
            <el-option label="深证" value="SZ"></el-option>
            <el-option label="港股" value="HK"></el-option>
          </el-select>
        </el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button type="primary" size="small" @click="validate">确 定</el-button>
    <el-button @click="isVisible = false" size="small">取 消</el-button>
  </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      const checkCode = (rule, value, callback) => {
        console.log(value)
        if (!value) {
          return callback(new Error('股票代码不能为空'))
        } else if (!/^\d{4,6}$/.test(value)) {
          callback(new Error('股票代码不正确'))
        } else {
          callback()
        }
      }
      return {
        isVisible: false,
        form: {
          code: null,
          market: 'SH'
        },
        rules: {
          code: [
            {validator: checkCode, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      show () {
        this.isVisible = true
      },
      validate () {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.handleAction()
          }
        })
      },
      handleAction () {
        let finalCode = this.form.market + this.form.code
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
      }
    }
  }
</script>
<style lang="scss">
  .optional-dialog {
    * {
      font-family: PingFang SC, 'Source Sans Pro', sans-serif;
    }

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding-bottom: 0;

      h3 {
        margin-bottom: 10px;
        font-size: 14px;
        text-align: center;
      }
    }

    .el-dialog__footer {
      padding-top: 0;
    }
  }
</style>
