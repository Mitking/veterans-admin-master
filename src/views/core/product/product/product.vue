<template>
  <div>
    <ProductSearchForm
      v-show="searchFormShow"
      ref="searchForm"
      class="transition-box"
      :form="searchForm"
      :formlist="$attrs.is_child?searchListChild:searchList"
      :search-loading="Mixin_loading"
      v-bind="$attrs"
      @search="search({ prop: true })"
    />
    <!-- 操作栏目 -->
    <mix-operate
      v-show="!this.$attrs.is_child"
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :ids="ids"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow=!searchFormShow
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--  表格  -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(table_data_arr,{op:true,opWidth:110+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555',textAlign:'center'}"
      :max-height="mixin_tab_max_height"
      :size="$attrs.is_child?'mini':'medium'"
      :data="tableData.records"
      @selection-change="windowSelect"
      @row-click="(row) => {
        if(!$attrs.no_multiple && windowSelectable(row)){$refs.Tab.toggleRowSelection(row)}
        if($attrs.is_child && $attrs.no_multiple){
          $listeners.selectList([row])
        }
      }"
      @row-dblclick="(row)=>{
        if($attrs.is_child && windowSelectable(row)){
          if($attrs.no_multiple){
            $listeners.selectList([row])
          }else{
            $refs.Tab.clearSelection()
            $refs.Tab.toggleRowSelection(row)
            windowSelect([row])
          }
          $listeners.addlist()
        }}"
    >
      <!--  -->
      <!--   v-show="item.show" 表头  -->
      <el-table-column
        v-if="!$attrs.no_multiple"
        type="selection"
        :width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
        :selectable="windowSelectable"
      />
      <!-- <el-table-column
        type="index"
        :width="55"
        align="center"
        :index="(e)=>e+1"
      /> -->
      <el-table-column
        v-for="(item,index) in table_data_arr"
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
            v-if="mix_comp_row_product_data_deal(row,item).length>column.realWidth/(item.fontWidth || 18)"
            effect="dark"
            :content="mix_comp_row_product_data_deal(row,item)"
            placement="bottom"
          >
            <div>{{ mix_comp_row_product_data_deal(row,item) | sizeFilter(column.realWidth/(item.fontWidth || 18)) }}
              <i
                v-if="item.copy"
                v-clipboard:copy="mix_comp_row_product_data_deal(row,item)"
                v-clipboard:success="mix_copy_text"
                class="el-icon-copy-document"
              />
            </div>

          </el-tooltip>
          <div v-else :style="{color:mix_comp_row_product_data_deal(row,item)==='否'?'#999999':null}">
            <!--            {{ item.prop['unitConversionRateRes']['basicWeightType'] }}-->
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
      <!-- 操作单条 -->
      <el-table-column
        v-show="mixTableOprateLength"
        :width="mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0"
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
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
    <!--导入弹窗-->
    <el-dialog
      title="导入商品"
      :visible.sync="inputShow"
      :before-close="(done)=>{if(uploading){return};operateList[3].loading=false;done()}"
      width="400px"
    >
      <div style="display:flex;justify-content:center">

        <el-upload
          v-loading="uploading"
          :show-file-list="false"
          action=""
          drag
          :http-request="handleSuccess"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </div>
      <div slot="footer">
        <el-button type="text" @click="downloadModle">下载模板</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'

import { getProductPage, deleteProduct, importProduct } from '@/api/core/product'
// import { queryImgByGoodsCode } from '@/api/core/productimg' match
import ProductSearchForm from '@/views/core/product/components/ProductSearchForm'
// import { getCategoryList } from '@/api/core/goodscategory'

export default {
  name: 'Product',
  components: { ProductSearchForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      inputShow: false,
      uploading: false,
      ids: [],
      goodsCodeArr: [],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['core:productArchive:getDetail'], width: 80 },
        { title: '修改', show: !this.$attrs.is_child, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:productArchive:update'], width: 80 },
        { title: '复制', showTitle: '新增', show: !this.$attrs.is_child, prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-copy-document', disabled: 'isRow', type: 'primary', permission: ['core:productArchive:add'], width: 80 },
        { title: '商品图片', show: !this.$attrs.is_child, prop: 'showImg', click: this.$listeners.openModel, icon: 'el-icon-picture-outline', disabled: 'isRow', type: 'primary', permission: ['core:achiveFirstImg:query'], width: 80 }
      ],
      operateList: [ // 搜索栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:productArchive:getList'], width: 80 },
        { title: '新增', show: !this.$attrs.is_child, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:productArchive:add'], width: 80 },
        { title: '删除', show: !this.$attrs.is_child, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'ids', type: 'primary', permission: ['core:productArchive:delete'], width: 80 },
        { title: '导入', show: !this.$attrs.is_child, prop: 'import', click: this.inputProduct, icon: 'el-icon-download', disabled: false, type: 'primary', permission: ['core:product:archive:import'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      searchList: [
        // { title: '账套', prop: 'accountId', defaultValue: 0, type: 'select', width: '300px', sonprop: 'orgId' },
        // { title: '组织', prop: 'orgId', type: 'select', defaultValue: 0, selectData: 'orgs', width: '300px', fatherProp: 'accountId' },
        { title: '关键字', prop: 'keyWord', type: 'text', placeholder: '商品名称/代码/条码/速记码' },
        // { title: '商品分类', prop: 'goodsCategoryId', type: 'text' },
        { title: '商品分类', prop: 'goodsCategoryId', type: 'goodsCategory', width: '300px', dataArr: {}},
        { title: '商品类型', prop: 'goodsType', type: 'select', selectData: 'goods_type', defaultValue: 0, disabled: false },
        // { title: '标签', prop: 'tagId', type: 'text' },
        // { title: '商品代码', prop: 'goodsCode', type: 'text' },
        { title: '成本价范围', type: 'range', range: [
          { prop: 'costBeginPrice', placeholder: '起始价', type: 'number', float: { max: 9999, decimal: 2 }},
          { prop: 'costEndPrice', type: 'text', placeholder: '终止价', float: { max: 9999, decimal: 2 }}
        ] },
        { title: '零售价范围', type: 'range', range: [
          { prop: 'unMemberBeginPrice', type: 'number', placeholder: '起始价', float: { max: 9999, decimal: 2 }},
          { prop: 'unMemberEndPrice', type: 'number', placeholder: '终止价', float: { max: 9999, decimal: 2 }}
        ] },
        { title: '会员价范围', type: 'range', range: [
          { prop: 'memberBeginPrice', type: 'number', placeholder: '起始价', float: { max: 9999, decimal: 2 }},
          { prop: 'memberEndPrice', type: 'number', placeholder: '终止价', float: { max: 9999, decimal: 2 }}
        ] },
        // { title: '高级选项', prop: 'advanced', type: 'checkbox', width: '120px' },
        { title: '停售', prop: 'stopSale', type: 'checkbox', defaultValue: false, width: '100px', disabled: false },
        { title: '停购', prop: 'stopBuy', type: 'checkbox', defaultValue: false, width: '100px', disabled: false },
        { title: '新品', prop: 'whetherNew', type: 'checkbox', defaultValue: false, width: '100px', disabled: false },
        { title: '允许赠送', prop: 'whetherHandsel', type: 'checkbox', defaultValue: false, width: '120px', disabled: false },
        { title: '特殊', prop: 'whetherSpecial', type: 'checkbox', defaultValue: false, width: '100px', disabled: false }
      ],
      searchListChild: [
        { title: '关键字', prop: 'keyWord', type: 'text', placeholder: '商品名称/代码/条码/速记码' }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 24, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        goodsName: ''
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
        { title: '商品代码', prop: 'goodsCode', copy: true, fontWidth: 10, type: 'text', width: 200 },
        { title: '规格条码', prop: 'barcode', copy: true, fontWidth: 14, type: 'text', width: 100 },
        { title: '乐檬编码', prop: 'itemNum', fontWidth: 12, type: 'text', width: 120 },
        { title: '商品名称', prop: 'goodsName', align: 'center', type: 'text', width: 300 },
        { title: '商品类型', prop: 'goodsType', type: 'select', selectData: 'goods_type', width: 100 },
        { title: '商品速记码', prop: 'shorthandCode', type: 'text', fontWidth: 12, width: 150 },
        { title: '商品分类', prop: 'goodsCategoryId', type: 'select', selectData: 'categoryList', selectOption: { value: 'id', label: 'name' }, width: 120 },
        { title: '进项税率', prop: 'inputTaxRate', type: 'PercentNumber', width: 120 },
        { title: '销项税率', prop: 'saleTaxRate', type: 'PercentNumber', width: 120 },
        { title: '基本单位', prop: '', type: 'select', selectData: 'weight_type', width: 120 },
        { title: '停购', prop: 'stopBuy', type: 'if_type', width: 80 },
        { title: '停售', prop: 'stopSale', type: 'if_type', width: 80 },
        { title: '允许负库存', prop: 'negativeInventory', type: 'if_type', width: 120 },
        { title: '建档时间', prop: 'createTime', type: 'text', fontWidth: 8, width: 180 }
      ]
    }
  },
  computed: {},
  watch: {
    '$attrs.detail_show': {
      handler(n) {
        if (this.$refs.Tab && !this.windowSelectable(this.currentRow) && n === false) { // 选取了禁用的项目
          this.$refs.Tab.clearSelection()
        }
      }
    },
    '$attrs.select_window_name': {
      handler(n) {
        if (n === 'ProductIndex' && this.$attrs.add_arr.length === 0) {
          console.log('选择窗口打开了')
          if (this.$attrs.child_search_data) {
            Object.keys(this.$attrs.child_search_data).map(item => {
              this.mixin_arr_edit_by_prop(this.searchList, item, 'disabled', true)
            })
          }
          if (this.$refs.Tab) {
            this.$refs.Tab.clearSelection()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map(item => { // 搜索栏数据初始化
      if (item.type === 'range') {
        item.range.map(itemRange => {
          this.$set(this.searchForm, itemRange.prop, itemRange.defaultValue === 0 ? 0 : '')
        })
      } else {
        this.$set(this.searchForm, item.prop, item.defaultValue !== undefined ? item.defaultValue : '')
        // this.searchForm[item.prop] = item.defaultValue === 0 ? 0 : ''
      }
    })
    if (this.$attrs.search_lock) {
      Object.keys(this.$attrs.search_lock).map(item => {
        this.mixin_arr_edit_by_prop(this.searchList, item, 'disabled', true)
        this.$set(this.searchForm, item, this.$attrs.search_lock[item])
      })
    }
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
        searchForm.goodsType = '1'
        searchForm = Object.assign(searchForm, this.$attrs.child_search_data)
        // 选品时只能选标准品
      }
      this.Mixin_loading = true
      getProductPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        this.tableData = res.data
        if (this.$attrs.is_selected_arr && this.$attrs.is_selected_arr.length) {
          this.tableData.records.map(item => {
            if (this.$attrs.is_selected_arr.includes(item.goodsCode)) {
              this.$nextTick(() => {
                this.$refs.Tab.toggleRowSelection(item, true)
              })
            }
          })
          this.$nextTick(() => {
            this.Mixin_loading = false
          })
        } else {
          this.Mixin_loading = false
        }
      }).catch(() => {
        this.Mixin_loading = false
      })
    },
    inputProduct(e) {
      e.loading = true
      this.inputShow = true
    },
    handleSuccess(files) {
      this.uploading = true
      const file = new FormData()
      file.append('file', files.file)
      importProduct(file).then(res => {
        console.log(res)
        if (res.data.length) {
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['商品名称', '条码', '问题描述']
            excel.export_json_to_excel({
              header: tHeader,
              data: res.data.map(item => Object.values(item)),
              filename: '导入商品失败问题描述',
              autoWidth: true,
              bookType: 'xlsx'
            })
          })
          return this.$message.error({ message: '导入失败,修改后重试', offset: 60 })
        }
        this.$message.success({ message: '导入完成', offset: 60 })
      }).finally(() => {
        this.inputShow = false
        this.operateList[3].loading = false
        this.uploading = false
      })
    },
    windowSelect(rows) {
      if (this.$attrs.is_child) {
        const rowsTemp = rows
        // if (this.$attrs.is_selected_arr && this.$attrs.is_selected_arr.length && this.Mixin_loading) {
        //   console.log(this.$attrs.is_selected_arr)
        //   // rowsTemp.push(...this.$attrs.is_selected_arr)
        // }
        const unSelectList = this.$refs.Tab.data.filter(item => !rows.includes(item))

        this.$listeners.selectList(rowsTemp, unSelectList)
      }
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
      this.goodsCodeArr = rows
    },
    windowSelectable(row) {
      if (this.Mixin_loading) {
        return false
      }
      if (this.$attrs.table_goods_code_arr) {
        return !this.$attrs.table_goods_code_arr.includes(row.goodsCode)
      }
      return true
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将删除商品「${this.goodsCodeArr.map(item => item.goodsName)}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteProduct({ 'goodsCode': this.goodsCodeArr.map(item => item.goodsCode) }).then(res => {
          this.message(res)
          operateItem.loading = false
        }).finally(() => {
          operateItem.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        operateItem.loading = false
      })
    },
    downloadModle() {
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '商品条码', '商品名称', '规格', '速记码', '计量单位',
          '标准售价', '售价2', '商品类型', '商品分类', '停购标记',
          '停售标记', '进货价', '配送价', '批发价', '系统编码',
          '休眠标记', '是否称重', '产地', '是否积分', '商品品牌', '销项税率%'
        ]
        excel.export_json_to_excel({
          header: tHeader,
          data: [],
          filename: '商品档案导入模板',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    }
  }
}
</script>

<style scoped>
.aaaa{
  justify-content: center;
}
.my-op-class{
 padding:0;
 font-size:20px;
 line-height:24px;
 height: 26px;
 box-sizing:border-box
}
.my-op-class:hover {
  font-size:22px;
  color:rgb(0, 68, 195);
}
</style>

