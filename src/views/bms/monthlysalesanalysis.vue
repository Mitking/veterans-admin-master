<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <!-- type:1:组织，门店 -->
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item
        label="年"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="searchForm.year"
          :style="{width:'120px'}"
          type="year"
          value-format="yyyy"
          placeholder="选择年"
          :clearable="false"
        />
      </el-form-item>
      <!-- <el-input value="O2O新零售东港巡洋店,O2O新零售东港旗舰店" style="width: 300px;" /> -->
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="Tab"
      v-loading="table_loading"
      style="margin:0 24px;max-width:98%"
      :max-height="windowH-300"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="small"
      highlight-current-row
      :data="tableData.records"
      :class="{'check-all-none':$attrs.single}"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
    >
      <el-table-column
        prop="storeName"
        align="center"
        :width="'200'"
        label="门店"
      >
        <template slot="header">
          <span class="table-header">门店
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="门店:显示某月门店的营业额;会员:显示某月会员的营业额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ MenuGetPropName('stores', row.storeId,{value: 'id',label: 'name'}) }}
        </template>
      </el-table-column>
      <el-table-column
        v-for="item in 12"
        :key="item"
        align="center"
        :label="item+'月'"
      >
        <el-table-column
          :prop="'storeTurnover'+item"
          label="门店"
          align="center"
          width="100"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row['storeTurnover'+item]) }}
          </template>
        </el-table-column>
        <el-table-column
          :prop="'memberTurnover'+item"
          label="会员"
          align="center"
          width="100"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row['memberTurnover'+item]) }}
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <!-- <table v-if="showSummary" class="summary">
      <tr>
        <th colspan="3">合计</th>
      </tr>
      <tr>
        <th>门店</th>
        <th>金额(万元)</th>
        <th>含税(万元)</th>
      </tr>
      <tr>
        <td>新零售O2O东港巡洋店</td>
        <td>1227.6</td>
        <td>{{ 1227.6 * 1.09 }}</td>
      </tr>
      <tr>
        <td>新零售O2O东港旗舰店</td>
        <td>1087.8</td>
        <td>{{ 1087.8 * 1.09 }}</td>
      </tr>
    </table> -->
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
// import { data } from './temp/1'
import { getPage } from '@/api/bms/MonthlySales'
import dayjs from 'dayjs'
export default {
  name: 'MonthlySalesAnalysis',
  components: { SelectOrgStore },
  data() {
    return {
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        year: dayjs().format('YYYY'),
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
    idsLength() {
      return true
    }
  },
  mounted() { this.search() },
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
      if (!searchForm.year) {
        return this.$message.info('年份不能为空!')
      }
      Object.keys(searchForm).map(prop => {
        searchForm[prop] = searchForm[prop] || null
        if (prop === 'orgId') {
          searchForm.orgId = [1, 2].includes(this.$store.getters.accountType) ? this.$store.getters.orgId : searchForm.orgId
        }
        if (prop === 'storeId') {
          searchForm.storeId = this.$store.getters.accountType === 1 ? this.$store.getters.storeId : searchForm.storeId
        }
      })
      getPage(searchForm).then(res => {
        this.tableData.records = res.data
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
