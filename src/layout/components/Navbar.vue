<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="全局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div>
          {{ name }}
          <i class="el-icon-caret-bottom" />
        </div>
        <!--  <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div> -->
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile/index">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="editPasswordShow=true">
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>

          <el-dropdown-item @click.native="$store.dispatch('app/switchTooltip');$message.info(`已${ $store.state.app.tooltipDisabled?'关闭':'开启'}全局提示`)">
            <span style="display:block;">{{ $store.state.app.tooltipDisabled?'开启提示':'关闭提示' }}</span>
          </el-dropdown-item>

          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!--  修改密码  -->
    <el-dialog title="修改密码" width="500px" :visible.sync="editPasswordShow">
      <el-form ref="form" :rules="rules" :model="form" label-width="100px">
        <el-form-item label="原密码" prop="opwd">
          <el-input v-model="form.opwd" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="npwd">
          <el-input v-model="form.npwd" type="password" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="npwdReinput">
          <el-input v-model="form.npwdReinput" type="password" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPasswordShow = false">取 消</el-button>
        <el-button type="primary" @click="upsetPassword">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import { updatePwd } from '@/api/user'
export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.npwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      editPasswordShow: false,
      form: { opwd: '',
        npwd: '',
        npwdReinput: '' },
      rules: {
        opwd: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        npwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '长度至少6个字符', trigger: 'blur' }
        ],
        npwdReinput: [{ validator: validatePass, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device', 'name'])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    upsetPassword() {
      this.$refs.form
        .validate()
        .then(pass => {
          if (pass) {
            updatePwd({
              id: this.$store.getters.operatorId,
              opwd: this.form.opwd,
              npwd: this.form.npwd
            }).then(() => {
              this.$message.success('修改成功')
              this.editPasswordShow = false
              this.form = { opwd: '', npwd: '', npwdReinput: '' }
            })
          } else {
            this.$message.error('请检查提交数据')
          }
        })
        .catch(err => {
          this.$message.error('请检查提交数据')
          throw err
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background 0.3s;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }

    .breadcrumb-container {
      float: left;
    }

    .errLog-container {
      display: inline-block;
      vertical-align: top;
    }

    .right-menu {
      float: right;
      height: 100%;
      line-height: 50px;

      &:focus {
        outline: none;
      }

      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        height: 100%;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: text-bottom;

        &.hover-effect {
          cursor: pointer;
          transition: background 0.3s;

          &:hover {
            background: rgba(0, 0, 0, 0.025);
          }
        }
      }

      .avatar-container {
        margin-right: 30px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
