<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <!-- <transition
      name="el-zoom-in-top"
      @before-leave="(e)=>{transition=false;transitionBegin(e)}"
      @after-leave="transition=true;transitionMarginTop=24"
      @before-enter="(e)=>{transitionBegin(e)}"
      @enter="transitionEnter"
    > -->
    <mix-search v-show="searchFormShow" ref="searchForm" :form="searchForm" :formlist="searchList" v-bind="$attrs" @search="search" />
    <!-- </transition> -->
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :ids="ids"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="searchFormShow=!searchFormShow"
    />
    <!--    表格  -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      style="margin:0 24px;"
      :header-cell-style="{background:'#F3F4F7',color:'#555',textAlign:'center'}"
      :style="{width:minxin_width_total(table_data_arr,{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :max-height="mixin_tab_max_height"
      :size="$attrs.is_child?'mini':'medium'"
      :data="tableData.records"
      @select-all="()=>{
        $refs.Tab.clearSelection()
      }"
      @row-click="(row) => {
        $refs.Tab.clearSelection()
        $refs.Tab.toggleRowSelection(row)
        currentRow = row
        $listeners.currentSelect(row)
      }"
    >
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        type="selection"
        :width="55"
        align="center"
      />
      <el-table-column
        v-for="(item,index) in table_data_arr"
        :key="index"
        :prop="item.prop"
        :align="item.align || 'center'"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row,column}">
          <el-tooltip
            v-if="mix_comp_row_product_data_deal(row,item).length>column.realWidth/(item.fontWidth || 18)"
            effect="dark"
            :content="mix_comp_row_product_data_deal(row,item)"
            placement="bottom"
          >
            <div>{{ mix_comp_row_product_data_deal(row,item) | sizeFilter(column.realWidth/(item.fontWidth || 18)) }}</div>
          </el-tooltip>
          <div v-else>
            {{ mix_comp_row_product_data_deal(row,item) }}
          </div>
        </template>
      </el-table-column>
      <!-- 操作单条 -->
      <el-table-column
        v-if="mixTableOprateLength"
        :width="(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
        class="my-op-fa"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            v-for="item in operateTableList"
            :key="item.prop"
            effect="light"
            :content="item.title"
            placement="top"
            :hide-after="1000"
            :enterable="false"
            :disabled="$store.state.app.tooltipDisabled"
          >
            <el-button
              v-show="item.show"
              v-permission="item.permission"
              class="my-op-class"
              type="text"
              size="mini"
              :disabled="comp_disabled_table(item,row)"
              :loading="item.loading"
              :icon="item.icon"
              @click.stop="
                if(operateTableList.every(item => !item.loading )){
                  currentRow=row;
                  $listeners.currentSelect(currentRow);
                  item.click(item)
                }"
            />
          </el-tooltip>
        </template>
      </el-table-column></el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'

import { NewProdList } from '@/api/core/product'
// import { queryImgByGoodsCode } from '@/api/core/productimg' match
// import ProductSearchForm from '@/views/core/product/components/ProductSearchForm'
// import { getCategoryList } from '@/api/core/goodscategory'

export default {
  name: 'Product',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      ids: [],
      goodsCodeArr: [],
      operateTableList: [
        { title: '导入', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:productArchive:add'], width: 80 }
      ],
      operateList: [ // 搜索栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:productArchive:getList'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      searchList: [
        // { title: '账套', prop: 'accountId', defaultValue: 0, type: 'select', width: '300px', sonprop: 'orgId' },
        { title: '组织', prop: 'orgId', type: 'select', defaultValue: 0, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '新品名', prop: 'name', type: 'text' },
        { title: '创建时间', prop: 'startTime', type: 'datetime' },
        { title: '结束时间', prop: 'endTime', type: 'datetime', defaultTime: '23:59:59' }
      ],
      searchListChild: [
        { title: '关键字', prop: 'keyWord', type: 'text', placeholder: '商品名称/商品代码/速记码' }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      formShow: false,
      formType: '',
      tableData: {
        records: [],
        total: 0
      },
      grantMenushow: false,
      ImgModelShow: false,
      imgData: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '品名', width: 300, prop: 'name', type: 'text' },
        { title: '规格', width: 200, prop: 'spec', type: 'text' },
        { title: '单位', width: 150, prop: 'unitId', type: 'select', selectData: 'weight_type' },
        { title: '创建时间', width: 200, prop: 'createTime', fontWidth: 10, type: 'text' }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map(item => { // 搜索栏数据初始化
      this.$set(this.searchForm, item.prop, item.defaultValue !== undefined ? item.defaultValue : '')
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
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) {
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      let searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => {
        searchForm[item] = searchForm[item] === true ? 1 : (searchForm[item] || null)
      })
      if (this.$attrs.child_search_data) {
        searchForm = Object.assign(searchForm, this.$attrs.child_search_data)
      }

      this.Mixin_loading = true
      NewProdList(searchForm).then(res => {
        this.currentRow = { id: '' }
        this.$listeners.currentSelect(this.currentRow)
        this.tableData = res.data
        this.Mixin_loading = false
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
.aaaa{
  justify-content: center;
}
/*.transition{*/
/*  !*position: absolute;*!*/
/*  transition:all .3s ease;*/
/*  margin-top: 0;*/
/*  top: 0;*/
/*}*/
/*.transition_start{*/
/*  !*position: relative;*!*/
/*  margin-top: -200px;*/
/*}*/
/*.transition_end{*/
/*  !*transition:null;*!*/
/*  !*margin-top: 0;*!*/
/*}*/
</style>

