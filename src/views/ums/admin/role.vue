<!--Role-->
<template>
  <div style="margin:24px">
    <!--搜索栏目-->
    <mix-search :form="searchForm" :formlist="searchList" />
    <!-- 操作栏目 -->
    <mix-operate :ids="ids" :operate-list="operateList" :current-row="currentRow" />
    <!--    表格    -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row;}"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="$attrs.child"
        type="selection"
        width="55"
        align="center"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in table_title_arr.filter(itemF=>itemF.show)"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '200'"
      >
        <template v-if="item.show" slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type'">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="$attrs.child"
        fixed="right"
        :prop="table_title_arr_child.prop"
        align="center"
        :width="table_title_arr_child.width || '200'"
      >
        <template v-if="table_title_arr_child.show" slot="header">
          <div>{{ table_title_arr_child.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div><el-button size="mini" type="success" @click="$listeners.childChoose([row.id])">选择</el-button></div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
    <!--    Form弹窗栏目  -->
    <el-dialog
      :title="formType==='insert'?'添加':'修改'"
      :visible.sync="formShow"
    >
      <mix-form :form-loading="formLoading" :formshow="formShow" :current-row="currentRow" :formdata="table_title_arr" :form-type="formType" @formSave="formSave" />
    </el-dialog>
    <el-dialog
      title="角色授权"
      :visible.sync="grantMenushow"
    >
      <menu-select :form-loading="formLoading" :treedata="roleTreeData" :roletreeown="roleTreeOwn" :show="grantMenushow" @grantMenuCallback="grantMenuCallback" />
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import menuSelect from '@/views/ums/admin/components/menuSelect'
import { page, saveRole, grantMenu, roleInfo, removeRole } from '@/api/ums/role'
export default {
  name: 'Role',
  components: { menuSelect },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      ids: [],
      currentRow: { id: '' }, // 当前选择数据
      operateList: [ // 搜索栏项目
        { title: '查询列表', show: true, click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['ums:role:page', 'ums:role:page'], width: 80 },
        { title: '添加角色', show: !this.$attrs.child, click: this.save, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        { title: '角色授权', show: !this.$attrs.child, click: this.grantMenuButton, icon: 'el-icon-check', disabled: 'isRow', type: 'info', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        { title: '修改角色', show: !this.$attrs.child, click: this.save, icon: 'el-icon-edit-outline', disabled: 'isRow', type: '', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        { title: '删除角色', show: !this.$attrs.child, click: this.del, icon: 'el-icon-minus', disabled: 'isRow', type: 'danger', permission: ['ums:role:page'], width: 80 },
        { title: '批量选择', show: this.$attrs.child, click: this.idsChoose, icon: 'el-icon-finished', disabled: 'ids', permission: ['ums:role:saveRole', 'ums:role:page'], type: 'success', width: 80 }
      ],
      searchList: [
        { title: '角色名称', prop: 'roleName', type: 'text' },
        { title: '账套', prop: 'accountId', type: 'select', selectData: 'accounts', width: '200px', sonprop: 'orgId' },
        { title: '组织', prop: 'orgId', type: 'select', selectData: 'orgs', width: '200px', fatherProp: 'accountId' }
      ],
      searchForm: {
        roleName: '',
        orgId: 0,
        accountId: 0,
        pageNum: 1,
        pageSize: 10
      },
      formShow: false,
      formType: '',
      tableData: {
        records: [],
        total: 0
      },
      table_title_arr: [
        // 表头字段
        // id	ID
        // accountId	账套ID
        // orgId	组织ID
        // userId	所属账号
        // roleName	角色名称
        // deleted	删除标识：0未删除1已删除
        // createTime
        { title: '主键', prop: 'id', show: true, disabled: true, type: 'text', width: 80, defaultValue: null, formShow: true },
        { title: '角色名称', prop: 'roleName', show: true, type: 'text', formShow: true },
        { title: '账套ID', prop: 'accountId', show: true, type: 'text', formShow: true },
        { title: '组织ID', prop: 'orgId', show: true, type: 'text', formShow: true },
        { title: '所属账号', prop: 'userId', show: true, type: 'text', formShow: true },
        { title: '创建时间', prop: 'createTime', show: true, type: 'text', formShow: false }
      ],
      table_title_arr_child: { title: '操作', prop: 'operate', show: this.$attrs.child, type: 'child', formShow: false, width: 100 },
      roleTreeData: null,
      grantMenushow: false,
      roleTreeOwn: null
    }
  },
  computed: {
    // currentRow_comp(){ // currentrow
    //   return function(){
    //     if(this.currentRow){
    //       return (this.currentRow.id===''?true:false)
    //     }
    //   }
    // }
  },
  watch: {
    // currentRow(n) {
    //   if (n.id) {
    //     this.search()
    //   }
    // }
  },
  created() {
    this.search()
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    grantMenuButton() { // 角色授权
      roleInfo({ 'roleId': this.currentRow.id }).then(res => {
        this.roleTreeData = res.data.menus
        this.roleTreeOwn = res.data.ownMenuIds
        this.grantMenushow = true
      })
    },
    grantMenuCallback(e) {
      this.formLoading = true

      grantMenu({ id: this.currentRow.id, menuIds: e }).then(res => {
        this.message(res)
        this.grantMenushow = false
        this.formLoading = false
      })
    },
    save(operateItem = {}) { // 添加、修改角色
      this.formType = operateItem.title === '添加角色' ? 'insert' : 'edit'
      this.formShow = true
    },
    formSave(e) {
      //  "id": 0,
      // "accountId": 0,
      // "orgId": 0,
      // "userId": 0,
      // "roleName": ""
      const temp = { id: e.id, accountId: e.accountId, orgId: e.orgId, userId: e.userId, roleName: e.roleName }

      saveRole(temp).then(res => {
        res.data = (res.code === 200 && this.formType === 'edit') ? '修改成功' : res.data
        this.message(res)
        this.formShow = false
        this.formLoading = false
      })
    },
    search() {
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      page(searchForm).then(res => {
        this.currentRow = { id: '' }

        if (res.code === 200) {
          this.tableData = res.data
          this.Mixin_loading = false
        }
      })
    },
    del() {
      this.$confirm(`此操作将永久删除权限「${this.currentRow.roleName}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRole({ roleId: this.currentRow.id }).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange(val) {
      this.ids = val.map(item => item.id)
    },
    idsChoose() {
      this.$listeners.childChoose(this.ids)
    }
  }
}
</script>

<style scoped>

</style>

