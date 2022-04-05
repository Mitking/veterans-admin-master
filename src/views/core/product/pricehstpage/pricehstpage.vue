<template>
  <div class="my-class">
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <transition
      name="el-zoom-in-top"
      @before-leave="(e)=>{transition=false;transitionBegin(e)}"
      @after-leave="transition=true;transitionMarginTop=24"
      @before-enter="(e)=>{transitionBegin(e)}"
      @enter="transitionEnter"
    >
      <mix-search
        v-show="searchFormShow"
        class="transition-box"
        :form="searchForm"
        :formlist="searchList"
        :form-data="table_data_arr"
        @opForm="MixinOpenForm"
        @clickClear="searchForm[$event]='';goodsInfo={};tableData.records=[]"
      />
    </transition>
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :search-form="searchForm"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="searchFormShow=!searchFormShow"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])"   -->
    <el-card class="formCard">
      <el-collapse :value="collapseNames" @change="collapseValue = $event[0]">
        <el-collapse-item name="1">
          <div slot="title" style="font-size:1.05rem">商品信息</div>
          <el-form inline size="mini" style="margin: 0 24px">
            <el-form-item
              v-for="(item) in ArrFilter(table_data_arr, { addFatherProp: 'searchForm' })"
              :key="item.prop"
              :style="{'width':item.formWidth || '18%'}"
              :label="item.title"
              label-width="68px"
            >
              <el-input
                v-if="item.type==='text'"
                v-model="goodsInfo[item.prop]"
                :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
                :placeholder="item.placeholder"
                :readonly="true"
              />
              <el-input
                v-if="item.type==='select'"
                :placeholder="item.placeholder"
                :value="MenuGetPropName(item.selectData,goodsInfo[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })"
                :readonly="true"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-card class="formCard">
      <el-collapse :value="collapseNames" @change="collapseValue = $event[0]">
        <el-collapse-item name="2">
          <div slot="title" style="font-size:1.05rem">历史价格</div>
          <el-table
            v-loading="Mixin_loading"
            border
            highlight-current-row
            size="mini"
            style="margin:0 24px;"
            :header-cell-style="{background:'#F3F4F7',color:'#555'}"
            :style="{width:minxin_width_total(ArrFilter(table_data_arr,{show:true}))}"
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
                <div v-else-if="item.type==='PRICE'">{{ fen2yuan(row[item.prop]) }}</div>
                <!--          v-else-->
                <div v-else>{{ row[item.prop] }}</div>
              </template>
            </el-table-column>
          </el-table>
          <!--分页-->
          <mix-page :form="searchForm" :table-data="tableData" @search="search" />
        </el-collapse-item>
      </el-collapse>
    </el-card>
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="'商品档案'"
      :visible.sync="mixin_select_form_show"
      width="80%"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :no_multiple="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPriceHstPage } from '@/api/core/pricehstpage'
import ProductIndex from '@/views/core/product/product/index.vue'
export default {
  name: 'PriceHstPage',
  components: { ProductIndex },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      collapseNames: ['1', '2'],
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: '商品档案', prop: 'goodsName', reallyProp: 'goodsCode', placeholder: '请先选择商品', type: 'selectFromPage', selectForm: 'ProductIndex', width: '300px' },
        { title: '价格类型', prop: 'priceType', type: 'select', selectData: 'price_type', defaultValue: 0, width: '300px' },
        { title: '门店', prop: 'storeId', type: 'select', selectData: 'stores', defaultValue: 0, defaultName: '全部', width: '300px', selectOption: { label: 'name', value: 'id' }}
      ],
      goodsInfo: {},

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        goodsCode: '',
        pageNum: 1,
        pageSize: 10
      },
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: 'searchPropProuduct', type: 'primary', permission: ['core:productArchivePriceHst:getList'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: '金额', prop: 'amount', show: true, width: 100, type: 'PRICE', formShow: true },
        { title: '算法', prop: 'algName', show: true, width: 200, type: 'text', formShow: true },
        { title: '价格类型', prop: 'priceType', show: true, width: 150, type: 'select', selectData: 'price_type', formShow: false },
        { title: '修改时间 ', prop: 'updateTime', show: true, width: 160, type: 'text', selectData: 'weight_type', formShow: false },
        { title: '操作人', prop: 'operatorName', show: true, width: 150, type: 'text', formShow: false },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', formShow: false, addFatherProp: 'searchForm' },
        { title: '规格条码', prop: 'barcode', show: false, type: 'text', formShow: false, addFatherProp: 'searchForm' },
        { title: '规格', prop: 'spec', show: false, type: 'text', formShow: false, addFatherProp: 'searchForm' },
        { title: '商品类型', prop: 'goodsType', show: false, type: 'select', selectData: 'goods_type', formShow: false, addFatherProp: 'searchForm' },
        { title: '商品分类', prop: 'goodsCategoryId', show: false, type: 'select', selectData: 'categoryList', selectOption: { value: 'id', label: 'name' }, formShow: false, addFatherProp: 'searchForm' }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {
    this.searchList.map(item => {
      if (item.type === 'range') {
        item.range.map(itemRange => {
          this.$set(this.searchForm, itemRange.prop, itemRange.defaultValue === 0 ? 0 : '')
        })
      } else {
        this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
      }
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
      const searchForm = this.deepClone(this.searchForm)

      this.Mixin_loading = true
      getPriceHstPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          this.tableData = res.data
          this.Mixin_loading = false
        }
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
.my-class >>> .el-collapse-item__header{
  border:none;
  border-bottom-color: #e6ebf5;
 }
.my-class >>> .el-collapse-item__header.collapse-transition{
  border:none;
}
.my-class >>> .el-collapse-item__content{
  padding-bottom: 0
}
.my-class >>> .el-collapse{
  border:none
}
.my-class >>> .el-collapse-item__wrap{
  border:none
}
.my-class >>> .el-card__body{
  padding:0 10px 0 10px
}
.formCard{
  margin: 10px 20px;
}
</style>

