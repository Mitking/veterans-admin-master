<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <!-- type:1:组织，门店 -->
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item
        label="时间段"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="curr_date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          align="right"
          @change="searchForm.startDate=$event?$event[0]:$event;searchForm.endDate=$event?$event[1]:$event"
        />
      </el-form-item>
      <el-form-item class="item-fa" label="商品">
        <el-input
          v-model="searchForm.goodsName"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='ProductIndex';search_dialog_item.show=true"
          @clear="searchForm.goodsCode='';searchForm.goodsName=''"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="Tab"
      v-loading="table_loading"
      style="margin:0 24px;max-width:98%;max-width:1800px"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="small"
      :max-height="windowH-300"
      highlight-current-row
      :data="tableData.records"
    >
      <el-table-column
        prop="storeId"
        align="center"
        :width="'200'"
        label="门店"
      >
        <template slot="header">
          <span class="table-header">门店
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="门店:显示某日门店的营业额;会员:显示某日会员的营业额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ MenuGetPropName('stores', row.storeId,{value: 'id',label: 'name'}) }}
        </template>
      </el-table-column>
      <el-table-column
        v-for="item in dayArr"
        :key="item"
        align="center"
        :label="item+'日'"
      >
        <el-table-column
          :prop="'s_'+item"
          label="门店"
          align="center"
        />
        <el-table-column
          :prop="'m_'+item"
          label="会员"
          align="center"
        />
      </el-table-column>
    </el-table>
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="search_dialog_item.selectForm==='SupplierIndex' && '供应商' ||
        search_dialog_item.selectForm==='ProductIndex' && '商品列表' ||
        search_dialog_item.selectForm==='User' && '员工选择' || ''"
      :visible.sync="search_dialog_item.show"
      width="80%"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="search_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="SearchDialogSelect"
          @addlist="search_dialog_item.show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import ProductIndex from '@/views/core/product/product/index.vue'
import { dalySalesGroup } from '@/api/bms/dalySalesGroup'
import dayjs from 'dayjs'
export default {
  name: 'DalySalesGroup',
  components: { SelectOrgStore, ProductIndex },
  data() {
    return {
      dayArr: [],
      curr_date: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        goodsCode: '',
        goodsName: '',
        endDate: dayjs().format('YYYY-MM-DD'),
        startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        orgId: 0,
        storeId: 0
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
    dateLength() {
      if (this.searchForm.startDate && this.searchForm.endDate) {
        return dayjs(this.searchForm.endDate).diff(dayjs(this.searchForm.startDate), 'day')
      }
      return false
    }
  },
  created() {
    this.search()
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    SearchDialogSelect(e) {
      switch (this.search_dialog_item.searchFormProp) {
        case 'ProductIndex':
          this.searchForm.goodsCode = e[0].goodsCode
          this.searchForm.goodsName = e[0].goodsName
          break
        case 'reviewer':
          this.searchForm.reviewerId = e[0].id
          this.searchForm.reviewerName = e[0].surname
          break
        case 'creator':
          this.searchForm.creator = e[0].id
          this.searchForm.creatorName = e[0].surname
          break
      }

      // this.searchForm
    },
    search() {
      console.log(this.searchForm)
      if (this.dateLength === false) {
        return this.$message.info('先选择时间段')
      }
      // 初始化表头数据
      this.dayArr = []
      const init = {}
      for (let index = 0; index <= this.dateLength; index++) {
        const date = dayjs(this.searchForm.startDate).add(index, 'day').format('MMDD')
        init['s_' + date] = '-'
        init['m_' + date] = '-'
        this.dayArr.push(date)
      }
      this.table_loading = true
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).map(prop => {
        searchForm[prop] = searchForm[prop] || null
        if (prop === 'orgId') {
          searchForm.orgId = [1, 2].includes(this.$store.getters.accountType) ? this.$store.getters.orgId : searchForm.orgId
        }
        if (prop === 'storeId') {
          searchForm.storeId = this.$store.getters.accountType === 1 ? this.$store.getters.storeId : searchForm.storeId
        }
      })
      dalySalesGroup(searchForm).then(res => {
        const temp = res.data.map(item => {
          const storeTurnoverMap = {}
          const memberTurnoverMap = {}
          Object.keys(item.storeTurnoverMap).map(sKey => { storeTurnoverMap['s_' + sKey] = this.fen2yuan(item.storeTurnoverMap[sKey]) })
          Object.keys(item.memberTurnoverMap).map(mKey => { memberTurnoverMap['m_' + mKey] = this.fen2yuan(item.memberTurnoverMap[mKey]) })
          return Object.assign(item, init, storeTurnoverMap, memberTurnoverMap)
        })
        this.tableData.records = temp
      }).finally(() => {
        this.table_loading = false
      })
    }
  }
}
</script>

<style scoped>
.check-all-none >>> .el-table__header .el-checkbox {
  display: none
}

.form-fa {
  display: flex;
  flex-wrap: wrap;
}
.summary{
  margin-top: 10px;
  margin-left: 23px;
  border: solid 1px #c1c1c1;
  border-collapse: collapse;
  width: 30%;
}
.summary th, td{
  border: solid 1px #c1c1c1;
  text-align: center;
  height: 34px;
  color: #5d5d60;
}
</style>
