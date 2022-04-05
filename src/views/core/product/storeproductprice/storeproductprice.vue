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
      :operate-list="operateList"
      :ids="ids"
      :current-row="currentRow"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    自动计算-->
    <AutoComputed v-if="operateList[2].title === '保存'" :auto-list="autoList" :auto_switch.sync="auto_switch" @pushItem="pushItem" />
    <!--    <div>{{ autoList }}</div>-->
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:55})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="operateList[2].title === '保存'?300:600"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row,column}">
          <el-tooltip
            v-if="mix_comp_row_data_deal(row,item).length>column.realWidth/(item.fontWidth || 18)"
            effect="dark"
            :content="mix_comp_row_data_deal(row,item)"
            placement="bottom"
          >
            <div>{{ mix_comp_row_data_deal(row,item) | sizeFilter(column.realWidth/(item.fontWidth || 18)) }}</div>
          </el-tooltip>
          <div v-else>
            <!--            {{ item.prop['unitConversionRateRes']['basicWeightType'] }}-->
            {{ mix_comp_row_data_deal(row,item) }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--    复制门店商品   -->
    <el-dialog
      title="门店商品复制"
      :visible.sync="copyFormShow"
    >
      <el-form style="display: flex;width: 100%;justify-content: space-around">
        <el-form-item label="被复制门店">
          <el-select v-model="copyForm.sourceStoreId" class="item-select-fa" placeholder="请选择">
            <el-option
              v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'})"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标门店">
          <el-select v-model="copyForm.targetStoreId" class="item-select-fa" placeholder="请选择">
            <el-option
              v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'})"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="copyFormShow = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="productCopySubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="pricePullShow" width="30%">
      <template slot="title">
        <div>提示:<span style="font-size: 0.8rem;color:#ff0000">商品档案数据将会覆盖被拉取项目相关价格数据</span></div>
      </template>
      <el-form style="display: flex;width: 100%;">
        <el-form-item label-width="100px" label="门店">
          <el-select v-model="pullStoreId" class="item-select-fa" placeholder="请选择">
            <el-option
              v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'})"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="pricePullShow = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="pricePullSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="pricePullIdsShow"
    >
      <template slot="title">
        <div>提示:<span style="font-size: 0.8rem;color:#ff0000">商品档案数据将会覆盖被拉取项目相关价格数据</span></div>
      </template>
      <el-table
        :data="rows"
        style="width: 70%;margin-left: 15%;"
        max-height="500"
      >
        <el-table-column
          prop="storeId"
          label="门店"
          width="180"
          sortable
        >
          <template slot-scope="{row}">
            <div>{{ MenuGetPropName('stores',row.storeId,{value: 'id', label: 'name'}) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="goodsCode"
          label="商品Code"
          width="180"
        />
        <el-table-column
          prop="goodsName"
          label="商品名称"
          sortable
        />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="pricePullIdsShow = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="pricePullIdsSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import AutoComputed from './components/autocomputed'
import { getPage } from '@/api/core/storeproductprice'
import { copyStoreProduct, storeProductPricePull } from '@/api/core/storeproduct'
export default {
  name: 'Order',
  components: { AutoComputed },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        { title: '商品名称', prop: 'goodsName', type: 'text', width: '300px' },
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId' },
        { title: '仓库', prop: 'stockId', type: 'select', defaultValue: 0, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', width: '300px' },
        { title: '分类', prop: 'goodsCategoryId', type: 'goodsCategory', width: '300px', valueProp: 'id' }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:storeProduct:getList:mobile'], width: 80 },
        { title: '价格修改', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:storeProductPrice:update'], width: 80 },
        // { title: '批量新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        // { title: '修改', show: true, prop: 'edit', click: this.edit, loading: false, icon: 'el-icon-plus', disabled: 'isRow', type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        // { title: '批量修改', show: true, prop: 'edits', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: 'ids', type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        { title: '门店价格更新', show: true, prop: 'pricePull', click: this.pricePull, loading: false, icon: 'el-icon-download', disabled: false, type: 'primary', permission: ['core:storeProductPrice:add'], width: 80 },
        { title: '商品价格拉取', show: true, prop: 'pricePull', click: this.pricePullIds, loading: false, icon: 'el-icon-download', disabled: 'ids', type: 'primary', permission: ['core:storeProductPrice:add'], width: 80 }
      ],
      editShow: false,
      ids: [],
      rows: [],
      currentRow: { id: '' }, // 当前选择数据
      
      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: []
      },
      details: [], // 详细数据
      copyFormShow: false,
      copyForm: { sourceStoreId: '', targetStoreId: '' },
      loading: false,
      pricePullIdsShow: false,
      pullForm: {},
      pricePullShow: false,
      pullStoreId: '',
      updateList: [],
      auto_switch: false,
      autoList: [
        {
          targetPrice: '',
          basicPrice: '',
          multiple: '1',
          round: '',
          switch: true
        }
      ] // 自动计算列表
    }
  },
  computed: {
    idsLength() {
      return true
    },
    comp_value() {
      // get() {
      return function(e) {
        return e[0].price
      }
      // }
    }
  },
  watch: {
    'tableData.records': {
      handler(n) {
        //
        n.filter(item => item.edit).map(itemEdit => {
          const priceTypeList0 = this.autoList.filter(item => item.switch && item.basicPrice !== '' && item.targetPrice !== '').map(itemType => itemType.targetPrice)
          const priceTypeList1 = this.autoList.filter(item => item.switch && item.basicPrice !== '' && item.targetPrice !== '').map(itemType => itemType.basicPrice)
          const priceTypeList = priceTypeList0.concat(priceTypeList1)
          priceTypeList.map(item => { // 添加没有的价格
            if (!itemEdit.list.map(priceTypeItem => priceTypeItem.priceType).includes(item)) {
              itemEdit.list.push({ priceType: item, price: 0, goodsPrice: 0, priceUseState: true })
            }
          })
          this.autoList.filter(itemF => itemF.switch && itemF.basicPrice !== '' && itemF.targetPrice !== '').map(item => {
            const temp = Number(this.filterF(itemEdit.list, item, 'basicPrice')) * Number(item.multiple)

            itemEdit.list.filter(itemFF => itemFF.priceType === item.targetPrice)[0].goodsPrice = temp.toFixed(2).toString()
          })
        })
      },
      deep: true
    }
  },
  created() {
    this.searchList.map(item => {
      if (item.type === 'range') {
        item.range.map(itemRange => {
          this.$set(this.searchForm, itemRange.prop, item.defaultValue === undefined ? '' : item.defaultValue)
        })
      } else {
        this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
      }
    })
  },
  methods: {
    pushItem() {
      this.autoList.push({ targetPrice: '', basicPrice: '', multiple: '1', round: '2', switch: true })
    },
    filterF(list, itemF, prop) {
      return list.filter(item => item.priceType === itemF[prop])[0].goodsPrice
    },
    insertPrice(List, itemObj) {
      List.push({ priceType: itemObj.prop, price: 360, goodsPrice: '3.60', priceUseState: true })
    },
    querySearch(queryString, cb) {
      cb([])
    },
    // 外层批量修改价格，已砍掉
    // edit(itemProp) {
    //   itemProp.loading = true
    //   if (this.operateList[2].title === '保存') {
    //     const data = []
    //     const temp = this.tableData.records.filter(item => item.edit)
    //     temp.map(item => {
    //       item.list.map(itemZ => { itemZ.goodsPrice = Number(itemZ.goodsPrice) })
    //       data.push({
    //         list: item.list,
    //         storeId: item.storeName,
    //         goodsCode: item.goodsName
    //       })
    //     })
    //
    //     updateOrder(data).then(res => {
    //
    //     })
    //     this.tableData.records.map(item => {
    //       if (item.edit) {
    //         item.edit = false
    //       }
    //     })
    //   } else {
    //     this.currentRow.edit = true
    //   }
    //   if (this.tableData.records.filter(item => item.edit).length > 0) {
    //     this.operateList[2].title = '保存'
    //   } else {
    //     this.operateList[2].title = '修改'
    //   }
    //   itemProp.loading = false
    // },
    // db_edit(row) {
    //   row.edit = true
    //   if (this.tableData.records.filter(item => item.edit).length > 0) {
    //     this.operateList[2].title = '保存'
    //   } else {
    //     this.operateList[2].title = '修改'
    //   }
    // },
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.rows = rows
      this.updateList = this.rows
      this.ids = rows.map(item => item.id)
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.pullStoreId = ''
        this.copyFormShow = false
        this.pricePullIdsShow = false
        this.pricePullShow = false
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    productCopy() {
      this.copyFormShow = true
    },
    productCopySubmit() {
      if (this.copyForm.sourceStoreId === '' || this.copyForm.targetStoreId === '') {
        this.$message.error('请选择门店')
        return
      }
      if (this.copyForm.sourceStoreId === this.copyForm.targetStoreId) {
        this.$message.error('门店不能相同')
        return
      }
      this.loading = true
      copyStoreProduct(this.copyForm).then(res => {
        this.message(res)
        if (res.code === 200) {
          this.copyFormShow = false
          this.loading = false
          this.copyForm = { sourceStoreId: '', targetStoreId: '' }
        }
      })
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      getPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          // this.operateList[2].title = '修改'
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            res.data.records.map(item => {
              item.edit = false
              // item.list = [{ priceType: '1', price: 120, goodsPrice: '1.20', priceUseState: true }]
              item.list = []
            })
            this.tableData = res.data
            this.Mixin_loading = false
          }
        }
      })
    },
    pricePull() { // 拉取价格
      this.pricePullShow = true
    },
    pricePullIds() { // 拉取选中商品价格弹窗
      this.pricePullIdsShow = true
    },
    pricePullIdsSubmit() { // 拉取选中商品价格
      const summary_temp = this.groupByProp(this.rows, 'storeId')
      Promise.all(summary_temp.map(item => {
        const temp = {}
        temp.selectAll = false
        temp.list = item.children.map(itemSon => ({ goodsCode: itemSon.goodsCode, id: itemSon.id }))
        temp.storeId = item.storeId
        return storeProductPricePull(temp)
      })).then(res => {

      }).catch(() => {
        this.$message.error('拉取失败请重新操作')
      })
    },
    pricePullSubmit() { // 拉取门店商品价格
      storeProductPricePull({ storeId: this.pullStoreId, selectAll: true }).then(res => {
        this.message(res)
      }).catch(() => {
        this.$message.error('拉取失败请重新操作')
      })
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = this.searchFormShow ? 0 : 0 - this.otherOffsetHeight
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
