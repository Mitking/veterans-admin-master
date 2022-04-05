<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      class="transition-box"
      v-bind="$attrs"
      :form="searchForm"
      :formlist="searchList"
      @search="search"
    />
    <!-- </transition> -->
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="!$attrs.is_child"
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
      :max-height="mixin_tab_max_height"
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {if(windowSelectable(row)){$refs.Tab.toggleRowSelection(row)}}"
      @selection-change="handleSelectionChange"
      @row-dblclick="(row)=>{
        if($attrs.is_child){
          $listeners.selectList([row])
          $listeners.addlist()
        }}"
    >
      <!-- 可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="windowSelectable"
        :fixed="!!tableData.records.length?'left':false"
      />
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined})"
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
          <div v-else-if="item.type==='PRICE'">{{ fen2yuan(row[item.prop]) }}</div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
      <!-- 操作单条 -->
      <el-table-column
        v-if="mixTableOprateLength"
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
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// import menuSelect from '@/views/ums/admin/components/menuSelect'
import { getPriceAlgPage, deletePriceAlg } from '@/api/core/coreprice'
export default {
  name: 'PriceAlg',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        // { title: '算法编号', prop: 'algCode', type: 'text', width: '300px' },
        { title: '算法名称', prop: 'algName', type: 'text', width: '300px' }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateTableList: [
        { title: '修改', show: !this.$attrs.is_child, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:priceAlg:update'], width: 80 },
        { title: '复制', showTitle: '新增', show: !this.$attrs.is_child, prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-copy-document', disabled: 'isRow', type: 'primary', permission: ['core:priceAlg:add'], width: 80 },
        { title: '删除', show: !this.$attrs.is_child, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['core:priceAlg:delete'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: !this.$attrs.is_child, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:priceAlg:getList'], width: 80 },
        { title: '新增', show: !this.$attrs.is_child, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:priceAlg:add'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      }
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
    }
  },
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
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
    windowSelectable(row) {
      if (this.$attrs.is_child) {
        return !this.$attrs.table_goods_code_arr.includes(row.id)
      }
      return true
    },
    handleSelectionChange(rows) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(rows)
      }
      this.mixin_rows = rows
      this.ids = rows.map(item => item.id)
      if (this.$listeners.rowsList) {
        this.$listeners.rowsList(rows, this.ids)
      }
    },
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
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      this.Mixin_loading = true
      getPriceAlgPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          const keys = this.ArrFilter(this.$attrs['form-data'], { type: 'PRICE' }).map(item => item.prop)
          if (keys.length > 0) {
            this.tableData = this.mixin_price_show_deal(keys, res.data)
          } else {
            this.tableData = res.data
          }
          this.Mixin_loading = false
        }
      })
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将删除算法「${this.currentRow.algName}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deletePriceAlg({ 'ids': [this.currentRow.id] }).then(res => {
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

