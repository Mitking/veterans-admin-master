<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
    />
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
    <!--  filter  表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:false})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row}"
      @selection-change="handleSelectionChange"
    >
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
            v-if="(typeof mix_comp_row_product_data_deal(row,item)==='string' && mix_comp_row_product_data_deal(row,item).length)>column.realWidth/(item.fontWidth || 18)"
            effect="dark"
            :content="mix_comp_row_product_data_deal(row,item)"
            placement="bottom"
          >
            <div>
              {{ mix_comp_row_product_data_deal(row,item) | sizeFilter(column.realWidth/(item.fontWidth || 18)) }}
              <i
                v-if="item.copy"
                v-clipboard:copy="mix_comp_row_product_data_deal(row,item)"
                v-clipboard:success="mix_copy_text"
                class="el-icon-copy-document"
              />
            </div>
          </el-tooltip>
          <div v-else-if="typeof mix_comp_row_product_data_deal(row,item)==='object'">
            {{ mix_comp_row_product_data_deal(row,item)[0]?fen2yuan(mix_comp_row_product_data_deal(row,item)[0].goodsPrice):'-' }}
          </div>
          <div v-else>
            {{ mix_comp_row_product_data_deal(row,item) }}
            <i
              v-if="item.copy"
              v-clipboard:copy="mix_comp_row_product_data_deal(row,item)"
              v-clipboard:success="mix_copy_text"
              class="el-icon-copy-document"
            />
          </div>

        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
  </div>
</template>

<script>
// length
import MixinGlobal from '@/components/MixinGlobal'
import { getRetailPrice } from '@/api/wms/retailprice'

export default {
  name: 'Order',
  components: {},
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', disabled: false, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '门店', prop: 'storeId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', width: '300px' },
        { title: '关键字', prop: 'keyWord', type: 'text', width: '300px' },
        { title: '商品类别', prop: 'productType', type: 'goodsCategory', valueProp: 'id', width: '300px', dataArr: {}}
        // { title: '商品分类', prop: 'goodsCategoryId', type: 'goodsCategory', valueProp: 'id', width: '300px', dataArr: {}}

      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['retail:getRetailPrice'], width: 80 }
        // { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        // { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 },
        // { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        // { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-minus', disabled: 'isRow', type: 'primary', permission: ['ums:role:page'], width: 80 },
        // { title: '审核', show: true, prop: 'edit', click: this.$listeners.review, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        // { title: '审核', prop: 'edit', click: this.reviews, loading: false, icon: 'el-icon-edit-outline', disabled: 'ids', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
      ],
      ids: [],
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
        records: [],
        total: 0
      },
      details: [] // 详细数据
    }
  },
  computed: {
    idsLength() {
      return true
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
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      getRetailPrice(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
          this.search({ prop: '' }, null, searchForm.pageNum - 1)
        } else {
          this.tableData = res.data
          this.Mixin_loading = false
        }
      })
    },
    // del(operateItem = {}) {
    //   operateItem.loading = true
    //   this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('stoInvPlanNo', this.$attrs['form-data'])}「${this.currentRow.stoInvPlanNo}」, 是否继续?`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     // this.operateItem.loading = true
    //     deleteOrder({ 'stoInvPlanNo': this.currentRow.stoInvPlanNo }).then(res => {
    //       this.message(res)
    //       operateItem.loading = false
    //     }).catch(err => {
    //       operateItem.loading = false
    //       throw err
    //     })
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '已取消删除'
    //     })
    //     operateItem.loading = false
    //   })
    // },
    // reviews() { // 批量审核
    //   review({ 'ids': this.ids, 'auditStatus': '3' }).then(res => {
    //     this.message(res)
    //   })
    // },
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
