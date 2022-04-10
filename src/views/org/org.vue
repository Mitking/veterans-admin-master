<template>
  <div>
    <el-form inline style="margin:24px 24px 0 0">
      <el-form-item label="所属地">
        <LocalAdd :check_strictly="true" :clearable="true" @localChange="searchLocalChange" />
      </el-form-item>
      <el-form-item>
        <el-button :loading="Mixin_loading" type="primary" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :loading="operateItem.formShow" type="primary" @click="openForm">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      :max-height="tab_max_height"
      style="margin:0 24px;max-width:98%"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row;}"
    >
      <el-table-column align="center" label="省份" prop="provinceName" />
      <el-table-column align="center" label="	市区" prop="cityName" />
      <el-table-column align="center" label="区县" prop="countyName" />
      <el-table-column align="center" label="街道/乡镇" prop="townName" />
      <el-table-column align="center" label="社区/村" prop="communityName" />
      <el-table-column align="center" label="小区/组" prop="groupName" />
      <el-table-column align="center" label="名称" prop="orgName" />
      <el-table-column align="center" label="负责人" prop="manager" />
      <el-table-column align="center" label="负责人联系电话" prop="managerMobile" />
      <!-- <el-table-column align="center" label="状态" prop="state" /> -->
      <el-table-column align="center" label="创建类型">
        <template slot-scope="{row}">
          {{ row.type===1 && '用户创建' || row.type===2 && '企业申请/平台创建' || '未知' }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="160px" label="创建时间" prop="createTime" />
      <el-table-column align="center" width="160px" fixed="right" label="操作">
        <template slot-scope="{row}">
          <el-button size="small" @click="openForm(row)">修改</el-button>
          <el-button :loading="delLoading" type="danger" size="small" @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <!-- <mix-page :form="searchForm" :table-data="tableData" @search="search" /> -->
    <!--    Form弹窗栏目  -->
    <el-dialog
      v-if="operateItem.formShow"
      :title="operateItem.title"
      :visible.sync="operateItem.formShow"
    >
      <el-form ref="form" :model="form.data" :rules="form.rules" label-width="80px">
        <el-form-item label="名称" prop="orgName">
          <el-input v-model="form.data.orgName" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="form.data.manager" />
        </el-form-item>
        <el-form-item label="联系电话" prop="managerMobile">
          <el-input v-model="form.data.managerMobile" />
        </el-form-item>
        <el-form-item label="所属地">
          <LocalAdd :placeholder="placeholder" @localChange="localChange" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button :loading="operateItem.loading" type="primary" @click="formSave">{{ operateItem.title }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import LocalAdd from '@/components/local/LocalAdd'
import { add, del, upd, getList } from '@/api/org'
export default {
  name: 'Org',
  components: { LocalAdd },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      tableData: { records: [] },
      searchForm: {},
      currentRow: {},
      delLoading: false,
      placeholder: '',
      operateItem: {
        title: '新增',
        formShow: false,
        loading: false
      },
      form: {
        data: {
          orgName: '',
          manager: '',
          managerMobile: '',
          provinceId: '',
          cityId: '',
          countyId: '',
          townId: '',
          communityId: '',
          groupId: '',
          localIds: []
        },
        rules: {
          orgName: [
            { required: true, message: '名称必填', trigger: 'blur' }
          ],
          manager: [
            { required: true, message: '负责人必填', trigger: 'blur' }
          ],
          managerMobile: [
            { required: true, message: '联系方式必填', trigger: 'blur' },
            { pattern: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/, message: '请输入合法手机号/电话号', trigger: 'blur' }
          ]
        }
      }
    }
  },
  computed: {
    // 表格最大高度
    tab_max_height() {
      const tabmaxheight = this.windowHeight - (this.$attrs.is_child ? 420 : 300)
      return tabmaxheight
    }
  },
  watch: {},
  created() {
    this.search()
  },
  methods: {
    searchLocalChange(e) {
      this.searchForm.provinceId = e[0] || null
      this.searchForm.cityId = e[1] || null
      this.searchForm.countyId = e[2] || null
      this.searchForm.communityId = e[3] || null
      this.searchForm.townId = e[4] || null
      this.searchForm.groupId = e[5] || null
    },
    search() {
      this.Mixin_loading = true
      getList(this.searchForm).then(res => {
        this.tableData.records = res.data
      }).finally(() => {
        this.Mixin_loading = false
      })
    },
    del(row) {
      console.log(row)
      this.$confirm(`此操作将删除「${row.orgName}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.delLoading = true
        del({ id: [row.id] }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).finally(() => {
          this.delLoading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    openForm(row = { id: null }) {
      if (row.id) {
        this.$set(this.form, 'data', this.deepClone(row))
        this.placeholder =
        this.form.data.provinceName + '/' + this.form.data.cityName + '/' +
        this.form.data.countyName + '/' + this.form.data.townName + '/' +
        this.form.data.communityName + '/' + this.form.data.groupName
      } else {
        this.form = this.$options.data().form
        this.placeholder = ''
      }
      this.operateItem = {
        title: row.id ? '修改' : '新增',
        formShow: true
      }
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },
    formSave() {
      this.operateItem.loading = true
      if (!this.form.data.groupId) {
        this.operateItem.loading = false
        return this.$message.error('所属地必须填到最后一级')
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.operateItem.title === '新增') {
            add(this.form.data).then(() => {
              this.$message.success('添加成功')
              this.operateItem.formShow = false
              this.form = this.$options.data().form
              this.$refs.form.resetFields()
              this.search()
            }).finally(() => {
              this.operateItem.loading = false
            })
          } else if (this.operateItem.title === '修改') {
            upd(this.form.data).then(() => {
              this.$message.success('修改成功')
              this.operateItem.formShow = false
              this.form = this.$options.data().form
              this.$refs.form.resetFields()
              this.search()
            }).finally(() => {
              this.operateItem.loading = false
            })
          }
        } else {
          this.operateItem.loading = false
        }
      })
    },
    localChange(e) {
      this.form.data.localIds = e
      this.form.data.provinceId = e[0]
      this.form.data.cityId = e[1]
      this.form.data.countyId = e[2]
      this.form.data.townId = e[3]
      this.form.data.communityId = e[4]
      this.form.data.groupId = e[5]
    }
  }

}
</script>

<style scoped>
</style>
