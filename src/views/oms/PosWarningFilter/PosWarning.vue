<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      :form-data="dataList"
      v-bind="$attrs"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :back="true"
      :ids="ids"
      :current-row="currentRow"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter(dataList,{show:true}),{op:false})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-for="(item,index) in dataList"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if=" ['orgId'].includes(item.prop)">
            {{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption || {}) }}
          </div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="mixin_dialog_item.selectForm==='SupplierIndex' && '供应商' ||
        mixin_dialog_item.selectForm==='ProductIndex' && '商品列表' ||
        mixin_dialog_item.selectForm==='User' && '员工选择'"
      :visible.sync="mixin_select_form_show"
      :width="mixin_dialog_item.selectForm==='User' && '50%' || '80%'"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import User from '@/views/ums/admin/userSelectPage'
import MixinGlobal from '@/components/MixinGlobal'
import { getPosWarningPage } from '@/api/oms/PosWarningFilter'
import dayjs from 'dayjs'
export default {
  name: 'PosWarning',
  components: { User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' },
      ids: [],
      editShow: false,
      searchList: [ // 搜索栏项目
        { title: '会员名', prop: 'surname', type: 'text', width: '300px' },
        { title: '卡号', prop: 'cardNo', type: 'text', width: '300px' },
        { title: '手机号', prop: 'mobile', type: 'text', width: '300px' },
        { title: '日期', prop: 'days', type: 'date', width: '300px' }

        // { title: '门店', prop: 'storeId', type: 'select', accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: [0, 3, 2].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', width: '300px' },
        // { title: '开始时间', prop: 'startDate', type: 'datetime', width: '300px' },
        // { title: '结束时间', prop: 'endDate', defaultTime: '23:59:59', type: 'datetime', width: '300px' },
        // { title: '操作员', prop: 'creatorName', reallyProp: 'operatorId', type: 'selectFromPage', selectForm: 'User', width: '300px' }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, loading: false, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:posWarning:getPage'], width: 80 }
      ],
      dataList: [
        // { title: 'ID', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '组织', width: 200, prop: 'orgId', show: true, ValueToNumber: true, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '门店', width: 200, prop: 'storeId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '会员名', width: 120, prop: 'surname', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '会员卡号', prop: 'cardNo', width: 150, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '会员手机号', width: 150, prop: 'mobile', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '预警次数', width: 100, prop: 'number', show: true, type: 'select', selectData: 'sys_log_action', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],

      searchForm: {
        days: dayjs().format('YYYY-MM-DD'),
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: { records: [] },
      details: [], // 详细数据
      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0
    }
  },
  computed: {
    idsLength() {
      return true
    },
    dayComp() {
      return function(v) {
        return dayjs(Number(v)).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
      }
    }
  },
  watch: {},
  created() {
    console.log('重新加载')
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    edit() {
      console.log('edit')
      this.editShow = true
    },
    output() {
      console.log('output')
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      // searchForm.updateType = searchForm.updateType ? Number(searchForm.updateType) : null

      this.Mixin_loading = true
      getPosWarningPage(searchForm).then(res => {
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
