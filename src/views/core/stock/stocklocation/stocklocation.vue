<template>
  <div>
    <mix-search v-show="searchFormShow" ref="searchForm" class="transition-box" :form="searchForm" :formlist="searchList" v-bind="$attrs" @search="search" />
    <!-- </transition> -->
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
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row;$listeners.currentSelect(row)}"
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
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select' || item.type==='selectFromPage'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else-if="item.type==='Number'">{{ row[item.prop] }}
            <span v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
              <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
            </span>
          </div>
          <!--          v-else-->
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
import { deleteStockLocationById, getStockLocationPage, getStockList } from '@/api/core/stock'
export default {
  name: 'Order',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '所属门店', prop: 'storeId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, width: '300px', fatherProp: 'orgId' },
        { title: '所属仓库', prop: 'stockId', disabled: false, type: 'select', defaultValue: 0, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', width: '300px' },
        { title: '库位名', prop: 'name', type: 'text', width: '300px' }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateTableList: [
        { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:stockLocation:update'], width: 80 },
        { title: '复制', show: true, prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-copy-document', disabled: 'isRow', type: 'primary', permission: ['core:stockLocation:add'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['core:stockLocation:delete'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:stockLocation:getList'], width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:stockLocation:add'], width: 80 }
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
  watch: {},
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    // 获取仓库列表，更新枚举表
    if (this.$store.state.enum.enumList.stockId.length === 0) {
      console.log('加载仓库列表...')
      getStockList().then(res => {
        if (res.code === 200) {
          this.$store.dispatch('enum/add_enum', { 'stockId': res.data }).then(res => { // 异步处理
            if (res) {
              console.log('已完成数据加载')
              this.search()
            }
          })
          // this.$store.commit('enum/ADD_ENUM_LIST', { 'store_group': res.data.records }) // 同步处理
        }
      })
    }
    console.log('重新加载')
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
        // getStockGroupList({}).then(res => { // 字典表强制更新
        //   if (res.code === 200) {
        //     this.$store.dispatch('enum/add_enum', { 'stock_group': res.data })
        //   }
        // })
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
      getStockLocationPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          this.tableData = res.data
          this.Mixin_loading = false
        }
      })
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除库位, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteStockLocationById({ 'ids': [this.currentRow.id] }).then(res => {
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

