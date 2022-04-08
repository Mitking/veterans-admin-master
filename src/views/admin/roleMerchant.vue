<!--Role-->
<template>
  <div>
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
      style="margin:0px 24px;width:201px"
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
        v-for="(item,index) in table_title_arr.filter(itemF=>itemF.show && !itemF.tableHidden)"
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
      fullscreen
      :title="`角色授权-${currentRow.roleName}`"
      :visible.sync="grantMenushow"
    >
      <menu-select :form-loading="formLoading" :treedata="roleTreeData" :roletreeown="roleTreeOwn" :show="grantMenushow" @grantMenuCallback="grantMenuCallback" />
    </el-dialog>
    <el-dialog
      width="60%"
      :title="`移动端菜单授权-${currentRow.roleName}`"
      :visible.sync="grantMobileMenuShow"
    >
      <!--  :filter-method="filterMethod"    -->
      <div style="display: flex;justify-content: center;">
        <el-transfer
          v-model="mobileMenuIds"
          class="my-class"
          filterable
          filter-placeholder="关键字过滤"
          :data="menuMobileListRes"
          style="height: 500px"
          :titles="['未选取菜单','已选取菜单']"
        />
      </div>
      <div slot="footer">
        <el-button type="primary" @click="grantMobileMenuCallback">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="grantMenuShow" :title="`授权权限 → ${currentRow.roleName}`" :visible.sync="grantMenuShow" fullscreen>
      <menu-grant :role-id="currentRow.id" @close="grantMenuShow=false" />
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { roleMerchant, saveRole, grantMenu, changeMobileMenu, removeRole } from '@/api/ums/role'
import { roleMobileInfo } from '@/api/ums/menumobile'
import MenuGrant from './components/menu/MenuGrant.vue'

export default {
  name: 'RoleMerchant',
  components: { MenuGrant },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      grantMobileMenuShow: false,
      grantMenuShow: false,
      mobileMenuIds: [],
      ownMenuIds: [],
      menuMobileListRes: [],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据
      operateList: [ // 搜索栏项目
        { title: '查询列表', show: true, click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: [], width: 80 },
        { title: '添加角色', show: !this.$attrs.child, click: this.save, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['role:saveRole'], width: 80 },
        { title: '角色授权', show: !this.$attrs.child, click: this.grantMenuButton, icon: 'el-icon-check', disabled: 'isRow', type: 'info', permission: ['role:grantMenu'], width: 80 },
        { title: '移动端授权', loading: false, show: !this.$attrs.child, click: this.grantMobileMenuButton, icon: 'el-icon-check', disabled: 'isRow', type: 'success', permission: ['role:grantMenu'], width: 80 },
        { title: '修改角色', show: !this.$attrs.child, click: this.save, icon: 'el-icon-edit-outline', disabled: 'isRow', type: '', permission: ['role:saveRole'], width: 80 },
        { title: '删除角色', show: !this.$attrs.child, click: this.del, icon: 'el-icon-minus', disabled: 'isRow', type: 'danger', permission: ['role:remove'], width: 80 }
      ],
      searchList: [
        // { title: '角色名称', prop: 'roleName', type: 'text' }
        // { title: '组织', prop: 'orgId', type: 'select', selectData: 'orgs', width: '200px', fatherProp: 'accountId' }
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
        { title: '主键', prop: 'id', show: true, tableHidden: true, disabled: true, type: 'text', width: 80, defaultValue: null, formShow: true },
        { title: '角色名称', prop: 'roleName', show: true, type: 'text', formShow: true,
          rule: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 25, message: '长度2 - 25' }
          ]
        }
      ],
      table_title_arr_child: { title: '操作', prop: 'operate', show: this.$attrs.child, type: 'child', formShow: false, width: 100 },
      roleTreeData: null,
      grantMenushow: false,
      roleTreeOwn: null
    }
  },
  computed: {

  },
  watch: {

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
    grantMobileMenuCallback() { // 手机端授权
      changeMobileMenu({ 'roleId': this.currentRow.id, 'mobileMenuIds': this.mobileMenuIds }).then(res => {
        if (res.code === 200) {
          this.$success('授权成功')
          this.grantMobileMenuShow = false
        }
      })
    },
    grantMobileMenuButton(itemProp) { // 移动端角色授权'roleId': this.currentRow.id
      itemProp.loading = true
      roleMobileInfo({ 'roleId': this.currentRow.id }).then(res => {
        if (res.code === 200) {
          this.menuMobileListRes = res.data.menuMobileListRes.map(item => ({ key: item.id, label: item.title }))
          this.mobileMenuIds = res.data.mobileMenuIds
          itemProp.loading = false
          this.grantMobileMenuShow = true
        }
      })
    },
    grantMenuButton() { // 触发角色授权
      this.grantMenuShow = true
    },
    dataDeal(data) {
      data.map(item => {
        if (typeof item.buttons === 'object') {
          item.children = item.buttons
        }
        if (item.children) {
          item.children = this.dataDeal(item.children)
        }
      })
      return data
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
      const data = { id: e.id, roleName: e.roleName }
      saveRole(data).then(res => {
        res.data = (res.code === 200 && this.formType === 'edit') ? '修改成功' : res.data
        this.message(res)
        this.formShow = false
        this.formLoading = false
      }).catch(res => {
        console.log('res=', res)
        this.formLoading = false
      })
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) {
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum

      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      roleMerchant(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
          this.search({ prop: '' }, null, searchForm.pageNum - 1)
        } else {
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
          this.message(res)
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
.my-class >>> .el-transfer-panel{
  height: 500px;
  margin-left: 10px;
}
.my-class >>> .el-transfer-panel__body{
  height: 400px;
}
.my-class >>> .el-transfer-panel__list.is-filterable{
  height: 400px;
}
</style>

