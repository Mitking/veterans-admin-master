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
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])"   -->
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
          <div v-if="item.type==='if_type'">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
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
// import menuSelect from '@/views/ums/admin/components/menuSelect'
import { getPriceAlgPage, updatePriceAlg, addPriceAlg, deletePriceAlg } from '@/api/core/coreprice'
export default {
  name: 'CorePrice',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: '算法编号', prop: 'algCode', type: 'text', width: '300px' },
        { title: '算法名称', prop: 'algName', type: 'text', width: '300px' }
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
        { title: '算法编号', prop: 'algCode', show: true, type: 'text', formShow: true },
        { title: '算法名称', prop: 'algName', show: true, type: 'text', formShow: true },
        { title: '最低成本价', prop: 'minCost', show: true, type: 'text', formShow: true },
        { title: '最高成本价', prop: 'maxCost', show: true, type: 'text', formShow: true },
        { title: '加价率(%)', prop: 'markupRate', show: true, type: 'text', formShow: true },
        { title: '加价额度', prop: 'markupQuota', show: true, type: 'text', formShow: true },
        { title: '小数点后取整', prop: 'afterPointRound', show: true, type: 'text', formShow: true },
        { title: '取整规则', prop: 'roundRule', show: true, type: 'select', selectData: 'round_rule', formShow: true },
        { title: '备注', prop: 'remark', show: true, type: 'text', formShow: true }
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
      this.Mixin_loading = true
      getPriceAlgPage(searchForm).then(res => {
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
      this.formShow = true
    },
    formSave(e) { // 提交回调处理
      switch (this.operateItem.prop) {
        case 'detail': // 详情
          this.formShow = false
          break
        case 'insert': // 新增
          addPriceAlg(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
        case 'edit': // 修改
          updatePriceAlg(e).then(res => {
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
      this.$confirm(`此操作将永久删除算法「${this.currentRow.algName}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deletePriceAlg({ 'id': this.currentRow.id }).then(res => {
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

