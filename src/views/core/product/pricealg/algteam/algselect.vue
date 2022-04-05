<template>
  <div>
    <el-button style="margin:24px" type="primary" size="mini" @click="search">刷 新</el-button>
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      :max-height="tab_max_height"
      style="margin:0 24px;max-width:98%;width:756px"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {if(windowSelectable(row)){$refs.Tab.toggleRowSelection(row)}}"
      @selection-change="handleSelectionChange"
      @row-dblclick="(row)=>{
        if($attrs.is_child && windowSelectable(row)){
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
        prop="algName"
        align="center"
        width="200"
        label="算法名"
      />
      <el-table-column
        prop="minCost"
        align="center"
        width="100"
        label="最低成本价"
      >
        <template slot-scope="{row}">{{ fen2yuan(row.minCost) }}</template>
      </el-table-column>
      <el-table-column
        prop="maxCost"
        align="center"
        width="100"
        label="最高成本价"
      >
        <template slot-scope="{row}">{{ fen2yuan(row.maxCost) }}</template>
      </el-table-column>
      <el-table-column
        prop="afterPointRound"
        align="center"
        width="100"
        label="末尾取整"
      />
      <el-table-column
        prop="markupRate"
        align="center"
        width="100"
        label="加价率(%)"
      />
      <el-table-column
        prop="markupQuota"
        align="center"
        width="100"
        label="加价额度"
      >
        <template slot-scope="{row}">{{ fen2yuan(row.markupQuota) }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPriceAlgEntity } from '@/api/core/algteam'
export default {
  name: 'AlgSelect',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      }
    }
  },
  computed: {
    tab_max_height() {
      return this.windowH - 150
    }
  },
  watch: {
    '$attrs.add_arr': {
      handler(n) {
        console.log(n)
        if (this.$refs.Tab && !n.length) { // 初始化禁用的项目
          this.$refs.Tab.clearSelection()
        }
      },
      deep: true
    }
  },
  created() {
    this.search()
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
    search() {
      this.Mixin_loading = true
      getPriceAlgEntity({ teamId: this.$attrs.child_search_data.id }).then(res => {
        this.currentRow = { id: '' }
        this.tableData.records = res.data
        this.Mixin_loading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
