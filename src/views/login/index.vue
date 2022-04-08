<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >

      <div class="title-container">
        <h3 class="title">{{ title }}</h3>
      </div>

      <el-form-item prop="username" :class="{'my-el-form-item':focusclassnum===2}">
        <span class="svg-container">
          <img class="svg-container-img" :src="require('@/assets/login/用户名.png')">
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="请输入用户名"
          name="username"
          type="text"
          tabindex="2"
          autocomplete="on"
          @input="checkHasLogin"
          @focus="focusclassnum=2"
          @blur="focusclassnum=0"
        />
      </el-form-item>
      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password" :class="{'my-el-form-item':focusclassnum===3}">
          <span class="svg-container">
            <img class="svg-container-img" :src="require('@/assets/login/密码.png')">
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="请输入密码"
            name="password"
            tabindex="3"
            autocomplete="on"
            @input="checkHasLogin"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false;focusclassnum=0"
            @keyup.enter.native="handleLogin"
            @focus="focusclassnum=3"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-button
        :loading="loading"
        type="primary"
        style="width:100%;height:3.2rem;font-size:1.4rem;background-color:rgba(83,168,255,0.5)"
        @click.native.prevent="handleLogin"
      >登 录
      </el-button>
      <!--      暂时隐藏，日后集成
      <div style="position:relative">
        <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
          其他登录方式
        </el-button>
      </div>-->
    </el-form>

    <el-dialog title="安全验证" :visible.sync="showDialog" :close-on-click-modal="false" width="500px" :show-close="false">
      <div><h2><el-icon class="el-icon-mobile-phone" />为了您的数据安全，请输入短信验证码</h2></div>
      <div><h3>验证码已经发送至 176****6869</h3></div>
      <div style="margin-top: 50px;">
        <el-input placeholder="请输入验证码" maxlength="4" minlength="4">
          <template slot="append">
            <el-button>重新获取</el-button>
          </template>
        </el-input>
      </div>
      <template slot="footer">
        <el-button type="primary">确认</el-button>
        <el-button @click="showDialog=false">返回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import defaultSettings from '@/settings'
import { getToken } from '@/utils/auth'

export default {
  name: 'Login',
  data() {
    return {
      focusclassnum: 0,
      title: defaultSettings.title,
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', message: '请输入账号' },
          { min: 5, max: 20, message: '请输入有效账号' }
        ],
        password: [
          { required: true, trigger: 'blur', message: '请输入密码' },
          { min: 6, max: 15, message: '请输入有效密码' }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    checkHasLogin() {
      const token = getToken()
      if (token) {
        this.$alert('已有登录账户将为您登录当下账户,如需登录其他账户，请退出当前账号。', '提示', {
          type: 'info',
          callback: action => {
            location.reload()
          }
        })
      }
    },
    handleLogin() {
      this.checkHasLogin()
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.login()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    login() {
      this.loading = true
      this.$store.dispatch('user/login', this.loginForm)
        .then(() => {
          this.$router.push({ path: '/', query: this.otherQuery })
        })
        .catch(() => {
          this.loading = false
        })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: rgba(0,0,0,0.5);
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
    font-size: 1rem;
  }
}
/* reset element-ui css */
.login-container .login-form{
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 20px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;
      &:-webkit-autofill {
        transition: background-color 5000s ease-in-out 0s;
         -webkit-text-fill-color: $cursor !important;
      }
      &::-webkit-input-placeholder{
           color:#888;
       }
      &:focus {
       &::-webkit-input-placeholder{
           color:#fff
       }
             }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0);
    border-radius: 5px;
    color: #454545;
  }
  .my-el-form-item.el-form-item{
     border: 1px solid #0C8BAF
   }
}

</style>
<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
 display: flex;
  min-height: 100%;
  width: 100%;
  height: 100%;
  background: url('../../assets/login/背景.png') no-repeat;
  background-size:100% 100%;
  // overflow: hidden;

  .login-form {
    // position: relative;
    width: 540px;
    height: 420px;
    border-radius: 12px;
    background-color: rgba(244,234,234,0.1);
    max-width: 100%;
    padding: 35px 65px;
    margin:10vh auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 0px 16px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    .svg-container-img{
      height:1.3rem;
      object-fit: contain;
    }
  }

  .title-container {
    position: relative;

    .title {
      font-size: 36px;
      color: #FEC171;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
