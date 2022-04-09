<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search v-show="searchFormShow" ref="searchForm" class="transition-box" :form="searchForm" :formlist="searchList" @search="search" />
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
          search_form_height = $refs.searchForm.$el.offsetHeight
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])"   -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      :max-height="mixin_tab_max_height"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter(table_data_arr,{show:true}))}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row;}"
    >
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter(table_data_arr,{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.tabwidth || '300'"
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
        ref="mixForm"
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
import { getEnumPage, deleteEnum, insertEnum, updateEnum } from '@/api/enum'
export default {
  name: 'Enum',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: '枚举类型', prop: 'type', show: true, type: 'text', formShow: true },
        { title: '枚举类型名', prop: 'typeName', show: true, type: 'text', formShow: true },
        { title: '枚举名', prop: 'name', show: true, type: 'text', formShow: true },
        { title: '枚举值', prop: 'value', show: true, type: 'text', formShow: true }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: [], width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['basicEnum:add'], width: 80 },
        { title: '修改', show: true, prop: 'edit', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['basicEnum:update'], width: 80 },
        { title: '追加', show: true, prop: 'withinAdd', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['basicEnum:add'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['basicEnum:delete'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: '枚举类型', prop: 'type', show: true, type: 'text', formShow: true },
        { title: '枚举类型名', prop: 'typeName', show: true, type: 'text', formShow: true },
        { title: '枚举名', prop: 'name', show: true, type: 'text', formShow: true, addDisabled: true },
        { title: '枚举值', prop: 'value', show: true, type: 'Number', float: { max: 999, decimal: 0 }, formShow: true, addDisabled: true, placeholder: '纯数字',
          rule: [{ required: true, message: '枚举值不能为空' }, { max: 999, type: 'number', transform: (v) => Number(v), message: '枚举值最大值不能超过3位' }] },
        { title: '备注', prop: 'remark', show: true, type: 'text', formWidth: '90%', formShow: true, addDisabled: true } // addDisabled：追加时可编辑
      ]
    }
  },
  computed: {
    // 表格最大高度
    mixin_tab_max_height() {
      const tabmaxheight = this.windowHeight -
       (this.searchFormShow ? this.search_form_height : 0) -
       (this.$attrs.is_child ? 420 : 300)
      return tabmaxheight
    }
  },
  watch: {},
  created() {
    console.log('重新加载')
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.search_form_height = this.$refs.searchForm.$el.offsetHeight
    })
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$store.dispatch('enum/get_enum') // 更新Vuex字典
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.Mixin_loading = true
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      getEnumPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            this.tableData = res.data
            this.Mixin_loading = false
          }
        }
      })
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      // this.operateItem.loading = true
      // if (this.operateItem.prop === 'withinAdd') {
      //   this.currentRow.id = ''
      // }
      this.formShow = true
    },
    formSave(e) { // 提交回调处理
      switch (this.operateItem.prop) {
        case 'detail': // 详情
          this.formShow = false
          break
        case 'insert': case 'withinAdd': // 新增 追加
          if (e.id) { e.id = '' }
          // 判断追加项目是否重复
          if (this.MenuGetPropName(e.type, e.value)) {
            this.$message.error('枚举值已存在！')
            this.$refs['mixForm'].loading = false
            return
          }
          insertEnum(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
        case 'edit': // 修改
          if (this.MenuGetPropName(e.type, e.value) && e.value !== this.currentRow.value) { // 可以改本身内容，不可以串枚举值
            this.$message.error('枚举值已存在！')
            this.$refs['mixForm'].loading = false
            return
          }
          updateEnum(e).then(res => {
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
      this.$confirm(`此操作将永久删除枚举「${this.currentRow.typeName}>>>${this.currentRow.name}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteEnum({ 'id': [this.currentRow.id] }).then(res => {
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

