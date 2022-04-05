<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item
        label="时间段"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="curr_date_time"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          align="right"
          @change="searchForm.startTime=$event?$event[0]:$event;searchForm.endTime=$event?$event[1]:$event"
        />
      </el-form-item>

    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;max-width:98%"
      :style="{width:$store.state.enum.enumList.FinTaxRateList.length*120+301+'px'}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
      :summary-method="getSummaries"
      :show-summary="true"
    >
      <el-table-column prop="createTime" width="150" label="日期" align="center" fixed="left" />

      <!-- <el-table-column prop="list" label="税率名称" align="center"> -->
      <el-table-column v-for="(item,index) in $store.state.enum.enumList.FinTaxRateList" :key="index" :prop="item.id.toString()" width="120" :label="item.name" align="center">
        <template slot-scope="{row}">
          {{ comp(row.list,item) }}
        </template>
      </el-table-column>
      <!-- </el-table-column> -->

      <el-table-column prop="total" label="合计" width="150" align="center" fixed="right">
        <template slot-scope="{row}">
          {{ fen2yuan2cover(row.total) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import { finTaxRateStatisticsPage, getFinTaxRateList } from '@/api/oms/fin/finTaxRate'
import store from '@/store'
import dayjs from 'dayjs'
export default {
  name: 'Phone1',
  components: { SelectOrgStore },
  data() {
    return {
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      curr_date_time: [dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'startTime': dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'),
        'endTime': dayjs().format('YYYY-MM-DD 23:59:59')
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
    comp() {
      return function(list, item) {
        const temp = list.filter(itemF => itemF.id === item.id)[0].actualAmount
        return temp === -1 ? '-' : this.fen2yuan2cover(temp)
      }
    }
  },
  watch: {
    'search_dialog_item.show': {
      handler(n) {
        if (n) {
          this.is_clear = n
        }
      }
    }
  },
  created() {
    getFinTaxRateList({}).then(res => { // 强制更新数据字典
      store.dispatch('enum/add_enum', { FinTaxRateList: res.data })
      this.search()
    })
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
    search() {
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
      finTaxRateStatisticsPage(searchForm).then(res => {
        this.tableData.records = res.data
      }).finally(() => {
        this.table_loading = false
      })
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map(item => {
          if (item[column.property] !== undefined) {
            return Number(item[column.property])
          } else {
            const temp = item.list.filter(itemF => itemF.id === Number(column.property))
            return temp.length ? (temp[0].actualAmount === -1 ? '-' : temp[0].actualAmount) : '-'
          }
        })
        if (values.every(value => isNaN(value))) {
          sums[index] = '-'
        } else {
          sums[index] = this.fen2yuan2cover(values.reduce((prev, curr) => ((isNaN(prev) ? 0 : prev) + (isNaN(curr) ? 0 : curr)), 0))
        }
      })
      // console.log(sums)
      return sums
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
}
.form-fa >>> .el-form-item__content{
  display: flex;
  padding:0 30px 0 0;
  margin: 0;
}
.form-fa >>> .el-form-item{
  margin-bottom:10px
}
</style>
