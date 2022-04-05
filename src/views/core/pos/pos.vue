<template>
  <div>
    <h1>不再维护</h1>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <transition
      name="el-zoom-in-top"
      @before-leave="(e)=>{transition=false;transitionBegin(e)}"
      @after-leave="transition=true;transitionMarginTop=0"
      @before-enter="(e)=>{transition=true;transitionMarginTop=-otherOffsetHeight}"
      @enter="transitionEnter"
    >
      <mix-search v-show="searchFormShow" class="transition-box" :form="searchForm" :formlist="searchList" />
    </transition>
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])"  " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row;}"
    >
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter(table_data_arr,{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
    <!--    Form弹窗栏目  -->
    <el-dialog
      :title="operateItem.title"
      :visible.sync="formShow"
    >
      <mix-form
        :formdata="table_data_arr"
        :form-type="operateItem.prop"
        :current-row="currentRow"
        :formshow="formShow"
        @close="operateItem.loading = false"
        @formSave="formSave"
      />
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { selectPos, addPos, deletePos, updatePos } from '@/api/core/pos'
export default {
  name: 'Pos',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        // { title: '账套', prop: 'accountId', defaultValue: 0, type: 'select', width: '300px', sonprop: 'orgId' },fatherProp: 'accountId'
        { title: '组织', prop: 'companyId', type: 'select', defaultValue: 0, selectData: 'orgs', width: '300px' },
        { title: '门店', prop: 'storeName', type: 'select', defaultValue: 0, selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }, fatherProp: 'companyId' }, // !!!!!!!!!!!!!!!!!!!!!!!
        { title: '状态', prop: 'cond', type: 'select', selectData: 'pos_status', defaultValue: 0, width: '300px' }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateList: [ // 操作栏项目
        { title: '查询', prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['ums:role:page', 'ums:role:page'], width: 80 },
        { title: '新增', prop: 'insert', click: this.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        { title: '修改', prop: 'edit', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        { title: '复制', prop: 'copy', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        { title: '删除', prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['ums:role:page'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: 'POS机', prop: 'deviceName', show: true, type: 'text', formShow: true },
        { title: '所属组织', prop: 'orgName', show: true, type: 'text', formShow: true },
        { title: '所属门店', prop: 'storeName', show: true, type: 'text', formShow: true },
        { title: '默认仓库', prop: 'defaultDepository', show: true, type: 'text', formShow: true }, // !!!!!!!!!!!!!!!!!!!!!!!!!!!
        { title: '设备识别码', prop: 'deviceCode', show: true, type: 'text', formShow: true },
        { title: '状态', prop: 'cond', show: true, type: 'select', selectData: 'pos_status', formShow: true }, // !!!!!!!!!!!!!!!!!!!!!!!!!!!
        { title: '备注', prop: 'remark', show: true, type: 'text', width: '90%', formShow: true }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
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
    search() {
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      searchForm.cond = searchForm.cond === null ? '-1' : searchForm.cond

      this.Mixin_loading = true
      selectPos(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          this.tableData = res.data
          this.Mixin_loading = false
        }
      })
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      this.operateItem.loading = true
      console.log('this.currentRow:', this.currentRow)
      this.formShow = true
    },
    formSave(e) { // 提交回调处理
      switch (this.operateItem.prop) {
        case 'detail': // 详情
          this.formShow = false
          break
        case 'insert': // 新增
          addPos(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
        case 'edit': // 修改

          updatePos(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
      }
    },

    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除POS机「${this.currentRow.deviceName}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deletePos({ 'id': this.currentRow.id }).then(res => {
          this.message(res)
          operateItem.loading = false
        }).catch(err => {
          operateItem.loading = false
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        operateItem.loading = false
      })
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
    }
  }
}
</script>

<style scoped>
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
</style>

