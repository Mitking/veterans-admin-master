<template>
  <div class="chain-fa" :style="{height:((windowHeight-160)+'px')}">
    <h1>停止维护</h1>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
    />
    <!-- </transition> -->
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :ids="ids"
      :rows="mixin_rows"
      :current-row="currentRow"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--  -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(table_header_prop,{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
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
        v-for="(item,index) in table_header_prop"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.prop==='orderNo'">{{ row.orderType===0 && row.applyNo || row.orderType===1 && row.callNo || row.orderType===2 && row.rejectNo }}</div>
          <div v-if="item.prop==='amount'">{{ fen2yuan(row.amount) }}</div>
          <div v-if="item.prop==='orderType'">{{ row.orderType===0 && '申请单' || row.orderType===1 && '调出单' || row.orderType===2 && '退货单' }}</div>
          <div v-if="item.prop==='orderDate'">{{ row.orderType===0 && row.applyDate || row.orderType===1 && row.calloutDate || row.orderType===2 && row.rejectDate }}</div>
          <div v-if="item.prop==='orderMaker'">{{ row.orderType===0 && row.maker || row.orderType===1 && row.creatorName || row.orderType===2 && row.maker }}</div>
          <div v-if="item.prop==='orderStoreId'">{{ row.orderType===0 && row.applyStoreName || row.orderType===1 && row.shipStoreName || row.orderType===2 && row.rejectStore }}</div>
          <div v-if="item.prop==='orderStockId'">{{ row.orderType===0 && '-' || row.orderType===1 && row.shipStockName || row.orderType===2 && row.rejectStock }}</div>
          <div v-if="item.prop==='orderCreateTime'">{{ row.orderType===0 && row.createTime || row.orderType===1 && row.createTime || row.orderType===2 && row.makeTime }}</div>
          <div v-if="item.prop==='auditPerson'">{{ row.auditPerson }}</div>
        </template>
      </el-table-column>
      <!-- 操作单条 -->
      <el-table-column
        v-if="mixTableOprateLength"
        :width="mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
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
                  $listeners.currentRowSelected(currentRow);
                  item.click(item)
                }"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage } from '@/api/wms/sendapply'
import { getSendCallPage, batchDeal } from '@/api/wms/sendcall'
import { getPage as sendRejectPage } from '@/api/wms/sendreject'
export default {
  name: 'Order',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      level_1_storeId: '',
      searchList: [ // 搜索栏项目
        { title: '单号', prop: 'orderNo', type: 'text', width: '300px' },
        { title: '日期', prop: 'orderDate', type: 'date', width: '300px' },
        { title: '来源门店', prop: 'storeId', defaultValue: 0, type: 'select', selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }},
        { title: '单据类型', prop: 'orderType', width: '200px', type: 'select', selectData: 'order_type_center' }
      ],
      ids: [],
      currentRow: { id: '' },

      searchForm: {
        orderDate: '',
        orderType: 0,
        storeId: 0,
        pageNum: 1,
        pageSize: 100
      },
      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      windowHeight: document.documentElement.clientHeight,
      getPageList: [],
      tableData: { records: [] },
      applyNos: [],
      callNos: [],
      rejectNos: [],
      table_header_prop: [
        { title: '单据号', prop: 'orderNo' },
        { title: '日期', prop: 'orderDate', width: 150 },
        { title: '门店', prop: 'orderStoreId', width: 200 },
        { title: '仓库', prop: 'orderStockId', width: 200 },
        { title: '金额', prop: 'amount', width: 150 },
        { title: '单据类型', prop: 'orderType', width: 150 },
        { title: '制单人', prop: 'orderMaker', width: 150 },
        { title: '审核人', prop: 'auditPerson', width: 150 },
        { title: '创建时间', prop: 'orderCreateTime', width: 200 }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['wms:sendCall:getList'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['wms:sendCall:getList'], width: 80 },
        { title: '生成相关单据', show: true, prop: 'deal', click: this.dealOrders, loading: false, icon: 'el-icon-edit-outline', disabled: 'ids', type: 'primary', permission: ['wms:stoCenter:deal'], width: 80 }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    search() {
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).map(key => {
        searchForm[key] = searchForm[key] || null
      })
      console.log(searchForm)
      this.level_1_storeId = this.$store.getters.enumList.stores.filter(item => item.storeLevel === '1')[0].id
      const P0 = Promise.resolve({ code: 200, data: { records: [] }})
      const P1 = { auditStatus: '3', applyNo: searchForm.orderNo, isGenerateCall: false, pageNum: 1, pageSize: 100, sendStoreId: this.level_1_storeId, orgId: [0, 3].includes(this.$store.getters.accountType) ? null : this.$store.getters.orgId }
      const P2 = { auditStatus: '3', callNo: searchForm.orderNo, isGenerateStorage: false, pageNum: 1, pageSize: 100, receiptStoreId: this.level_1_storeId, orgId: [0, 3].includes(this.$store.getters.accountType) ? null : this.$store.getters.orgId }
      const P3 = { auditStatus: '3', rejectNo: searchForm.orderNo, isGenerateStorage: false, pageNum: 1, pageSize: 100, deliveryStoreId: this.level_1_storeId, orgId: [0, 3].includes(this.$store.getters.accountType) ? null : this.$store.getters.orgId }
      this.getPageList = [
        ['1', null].includes(searchForm.orderType) ? getPage(P1) : P0,
        ['2', null].includes(searchForm.orderType) ? getSendCallPage(P2) : P0,
        ['3', null].includes(searchForm.orderType) ? sendRejectPage(P3) : P0
      ]
      this.Mixin_loading = true
      Promise.all(this.getPageList).then(res => {
        this.tableData.records = []
        if (res.every(item => item.code === 200)) {
          const temp0 = res[0].data.records.map(item => Object.assign({ orderType: 0 }, item))
          const temp1 = res[1].data.records.map(item => Object.assign({ orderType: 1 }, item))
          const temp2 = res[2].data.records.map(item => Object.assign({ orderType: 2 }, item))
          this.tableData.records = this.tableData.records.concat(temp0, temp1, temp2)
          this.Mixin_loading = false
        }
      })
    },
    handleSelectionChange(rows) {
      if (rows.length === 1) {
        this.currentRow = rows[0]
      } else {
        this.currentRow = { id: '' }
      }
      this.$listeners.currentRowSelected(this.currentRow)
      this.applyNos = []
      this.ids = rows.map(item => {
        switch (item.orderType) {
          case 0:
            this.applyNos.push(item.applyNo)
            break
          case 1:
            this.applyNos.push(item.callNo)
            break
          case 2:
            this.applyNos.push(item.rejectNo)
            break
        }
        return item.id
      })
    },
    dealOrders(e, isSure = false) { // 处理单据
      if (!isSure) {
        this.$confirm(`确认生成吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.dealOrders(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
        })
        return
      }
      e.loading = true
      // const P0 = Promise.resolve({ code: 200 })
      // const pArr = [
      //   this.applyNos.length > 0 ? generate({ applyNoList: this.applyNos, isGenerateDelivery: true }) : P0,
      //   this.callNos.length > 0 ? generateOrder({ callNoList: this.callNos, isGenerateDelivery: true }) : P0,
      //   this.rejectNos.length > 0 ? generateRejectOrder({ rejectNoList: this.rejectNos }) : P0
      // ]
      batchDeal({ orderNos: this.applyNos }).then(() => {
        this.$message.success('已生成相关单据')
        this.search()
      }).catch(() => {
        this.$message.error('网络错误')
      }).finally(() => {
        e.loading = false
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
.chain-fa{
  overflow-y: auto;
}
.chain-box-card{
  position: relative;
  width: 90%;
  left: 5%;
  margin-top: 24px;
}
.chain-clearfix{
  width: 100%;
  /*border:1px solid blue;*/
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
