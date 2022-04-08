<template>
  <div>
    <!--搜索栏目-->
    <!--    <mix-search :form="searchForm" :formlist="searchList" />-->
    <!-- 操作栏目 -->
    <mix-operate :ids="ids" :operate-list="operateList" :current-row="currentRow" :style="{'margin-top':'24px','margin-bottom':'-10px'}" />
    <!--    表格    -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      class="m10-24-24-24"
      size="mini"
      border
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      highlight-current-row
      :style="{width:minxin_width_total(ArrFilter(table_title_arr,{show:true}),{op:$attrs.is_child,opWidth:55})}"
      :max-height="windowHeight-240"
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
        :width="item.width || '220'"
      >
        <template v-if="item.show" slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type'">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="$attrs.child"
        fixed="right"
        :prop="table_title_arr_child.prop"
        align="center"
        :width="table_title_arr_child.width || '300'"
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
    <!--    <mix-page :form="searchForm" :table-data="tableData" @search="search" />-->
    <!--    Form弹窗栏目  -->
    <el-dialog
      :title="formType.title"
      :visible.sync="formShow"
    >
      <mix-form :form-loading="formLoading" :formshow="formShow" :current-row="currentRow" :formdata="table_title_arr" :form-type="formType.prop" @formSave="formSave" />
    </el-dialog>
    <!--    <el-dialog-->
    <!--      fullscreen-->
    <!--      :title="`角色授权-${currentRow.roleName}`"-->
    <!--      :visible.sync="grantMenushow"-->
    <!--    >-->
    <!--      <menu-select :form-loading="formLoading" :treedata="roleTreeData" :roletreeown="roleTreeOwn" :show="grantMenushow" @grantMenuCallback="grantMenuCallback" />-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// import menuSelect from '@/views/admin/components/menuSelect'
import { page, updateMobileMenu, add, delItem } from '@/api/ums/menumobile'
export default {
  name: 'MenuMobile',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      transitionMarginTop: 24, // 上部
      ids: [],
      windowHeight: document.documentElement.clientHeight,
      currentRow: { id: '' }, // 当前选择数据
      operateList: [ // 搜索栏项目
        { title: '查询列表', show: true, click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: [], width: 80 },
        { title: '新增菜单', show: true, prop: 'insert', click: this.save, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: [], width: 80 },
        { title: '修改菜单', show: true, prop: 'edit', click: this.save, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: [], width: 80 },
        { title: '删除菜单', show: true, click: this.del, icon: 'el-icon-minus', disabled: 'isRow', type: 'danger', permission: [], width: 80 }
      ],

      formShow: false,
      formType: {},
      tableData: {
        records: [],
        total: 0
      },
      table_title_arr: [
        { title: '主键', prop: 'id', show: true, disabled: true, type: 'text', width: 80, defaultValue: null, formShow: true },
        { title: '模块', prop: 'module', show: true, type: 'select', selectData: 'mobile_module', formShow: true },
        { title: '菜单', prop: 'moduleItem', show: true, type: 'text', formShow: true },
        { title: '标题', prop: 'title', show: true, type: 'text', formShow: true },
        { title: '排序', prop: 'sort', show: true, type: 'text', formShow: true }
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
        this.formShow = false
        this.formLoading = false
      } else {
        this.$error(res.data)
      }
    },
    // grantMenuButton() { // 角色授权
    //   roleInfo({ 'roleId': this.currentRow.id }).then(res => {
    //
    //     if (res.code === 200) {
    //       this.roleTreeData = res.data.menus.map(item => ({
    //         id: item.module + 10000,
    //         label: item.moduleName,
    //         children: this.dataDeal(item.nodes)
    //       }))
    //       this.roleTreeOwn = res.data.ownMenuIds
    //       this.grantMenushow = true
    //     }
    //   })
    // },
    // dataDeal(data) {
    //   data.map(item => {
    //     if (typeof item.buttons === 'object') {
    //       item.children = item.buttons
    //     }
    //     // if (item.menuEntity) {
    //     //   const temp = item.menuEntity.type === 'B' && '按钮-' || item.menuEntity.type === 'M' && '菜单-' || item.menuEntity.type === 'D' && '目录-'
    //     //   item.label = temp + item.label
    //     // }
    //     if (item.children) {
    //       item.children = this.dataDeal(item.children)
    //     }
    //   })
    //   return data
    // },
    // grantMenuCallback(e) {
    //   this.formLoading = true
    //
    //   grantMenu({ id: this.currentRow.id, menuIds: e }).then(res => {
    //     this.message(res)
    //     this.grantMenushow = false
    //     this.formLoading = false
    //   })
    // },
    save(operateItem = {}) { // 添加、修改角色
      this.formType = operateItem
      this.formShow = true
    },
    formSave(e) {
      if (this.formType.prop === 'edit') { // 修改
        updateMobileMenu(e).then(res => {
          this.message(res)
        })
      }
      if (this.formType.prop === 'insert') { // 修改
        add(e).then(res => {
          this.message(res)
        })
      }
    },
    search() {
      page().then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          this.tableData.records = res.data
          this.Mixin_loading = false
        }
      })
    },
    del() {
      this.$confirm(`此操作将永久删除菜单「${this.currentRow.title}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delItem({ id: this.currentRow.id }).then(res => {
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

</style>

