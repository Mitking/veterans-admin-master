<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      class="form-fa"
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item
        label="时间段"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="curr_date"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['07:00:00', '23:59:59']"
          align="right"
          @change="searchForm.startTime=$event?$event[0]:$event;searchForm.endTime=$event?$event[1]:$event"
        />
      </el-form-item>
    </el-form>
    <div style="margin:0 24px">
      <el-button type="primary" @click="search">查询</el-button>
    </div>
    <div style="height:340px;">
      <chart
        ref="echart"
        height="100%"
        width="100%"
        :legend_arr="[{name:'入客流'},{name:'出客流'}]"
        :x_data="x_data"
        :line_data="deepClone(tableData)"
      />
    </div>
    <el-table
      :loading="table_loading"
      :data="tableData"
      style="margin:48px 24px;max-width:98%"
      :style="{width:(cloumnObj.length+1)*120+1+'px'}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >
      <el-table-column width="120" prop="title" label="时段" align="center" />
      <el-table-column
        v-for="(item,index) in cloumnObj"
        :key="index"
        :label="item.time"
        :prop="'item_'+item.index"
        width="120"
        align="center"
      />
    </el-table>

  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import { getCustomerCountRes } from '@/api/bms/CustomerCountRes'
import Chart from './components/LineCustomerCountRes'
import dayjs from 'dayjs'
export default {
  name: 'CustomerCountRes',
  components: { SelectOrgStore, Chart },
  data() {
    return {
      curr_date: [dayjs().format('YYYY-MM-DD 07:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
      table_loading: false,
      ids: [],
      cloumnObj: [],
      x_data: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'startTime': dayjs().format('YYYY-MM-DD 07:00:00'),
        'endTime': dayjs().format('YYYY-MM-DD 23:59:59')
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: [],
      details: [] // 详细数据
    }
  },
  computed: {
    datetimeLenth() {
      return dayjs(this.searchForm.endTime).diff(this.searchForm.startTime, 'hour')
    }
  },
  created() {
    this.table_loading = true
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
    search() {
      if (!this.searchForm.startTime || !this.searchForm.endTime) {
        return this.$message.info('时间段不能为空')
      }
      if (this.searchForm.startTime.substr(0, 10) !== this.searchForm.endTime.substr(0, 10)) {
        return this.$message.info('时间段不可以跨天')
      }
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
      getCustomerCountRes(searchForm).then(res => {
        this.tableData = []
        this.x_data = []
        const temp_inNum = { title: '入客流' }
        const temp_outNum = { title: '出客流' }
        this.cloumnObj = res.data.map(item => {
          temp_inNum['item_' + item.period] = item.inNum
          temp_outNum['item_' + item.period] = item.outNum
          this.x_data.push(`${item.period}:00-${item.period + 1}:00`)
          return { time: `${item.period}:00-${item.period + 1}:00`, index: item.period }
        })
        this.tableData.push(temp_inNum, temp_outNum)
        this.$nextTick(() => {
          this.$refs.echart.refresh()
        })
      }).finally(() => {
        this.table_loading = false
      })
    }
  }
}
</script>

<style>

</style>
