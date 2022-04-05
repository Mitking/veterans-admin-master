<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      ref="searchForm"
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <SelectOrgStore :type="2" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item
        label="结算日期"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="searchForm.settleDate"
          type="date"
          value-format="yyyy-MM-dd"
          align="right"
          :clearable="false"
          :editable="false"
        />
      </el-form-item>
      <el-form-item style="width:300px" label="商品">
        <el-input
          v-model="searchForm.goodsName"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='ProductIndex';search_dialog_item.show=true"
          @clear="searchForm.goodsCode='';searchForm.goodsName=''"
        />
      </el-form-item>
    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search(null, null, 1)">查询</el-button>
    </div>
    <el-row :gutter="60">
      <el-col :span="18">
        <el-table
          v-loading="table_loading"
          :data="tableData.records"
          :width="1000"
          style="margin:12px 24px"
          :header-cell-style="{background:'#F3F4F7',color:'#555'}"
          border
          size="normal"
          :max-height="maxHeight"
          highlight-current-row
        >
          <el-table-column prop="goodsCode" label="商品代码" width="160" align="center" />
          <el-table-column prop="goodsName" label="商品名称" width="200" align="center">
            <template slot-scope="{row}">
              <el-tooltip
                v-if="row.goodsName.length>12"
                effect="dark"
                :content="row.goodsName"
                placement="top-start"
              >
                <div>
                  {{ row.goodsName | sizeFilter(12) }}
                </div>
              </el-tooltip>
              <div v-else>{{ row.goodsName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="beginPeriodNumber" label="期初库存数量" align="center">
            <template slot-scope="{row}">
              {{ g2kg(row.beginPeriodNumber) }}
            </template>
          </el-table-column>

          <el-table-column prop="endPeriodNumber" label="期末库存数量" align="center">
            <template slot-scope="{row}">
              {{ g2kg(row.endPeriodNumber) }}
            </template>
          </el-table-column>

          <el-table-column prop="beginPeriodAmount" label="期初库存金额" align="center">
            <template slot-scope="{row}">
              {{ fen2yuan(row.beginPeriodAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="endPeriodAmount" label="期未库存金额" align="center">
            <template slot-scope="{row}">
              {{ fen2yuan(row.endPeriodAmount) }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="5">
        <el-table
          v-loading="table_loading"
          :data="totalData"
          :width="150"
          style="margin-top:12px"
          :header-cell-style="{background:'#F3F4F7',color:'#555'}"
          border
        >
          <el-table-column
            prop="name"
            label="项目"
            align="center"
          />
          <el-table-column
            prop="value"
            label="合计"
            align="center"
          />
        </el-table>
      </el-col>
    </el-row>
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!-- 合计表 -->

    <!--搜索条件弹窗-->
    <el-dialog
      v-if="is_clear"
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
      <div slot="footer">
        <!-- <el-button @click="search_dialog_item.show=false">关 闭</el-button> -->
        <el-button type="primary" @click="search_dialog_item.show=false">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import MixPage from '@/components/MixinForm/MixPage.vue'
import User from '@/views/ums/admin/userSelectPage.vue'
import ProductIndex from '@/views/core/product/product/index.vue'
import { getRetailPage, getTotalStockSettle } from '@/api/bms/StockSettle'
import dayjs from 'dayjs'
export default {
  name: 'StockSettle',
  components: { SelectOrgStore, MixPage, User, ProductIndex },
  data() {
    return {
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      totalData: [],
      curr_date: [],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': this.$store.getters.orgId,
        'storeId': this.$store.state.user.storeId,
        'goodsCode': '',
        'goodsName': '',
        'settleDate': dayjs().format('YYYY-MM-DD'),
        'pageNum': 1,
        'pageSize': 10
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
    maxHeight() {
      if (this.table_loading) {
        return this.windowH - 300
      }
      return this.windowH - 300 - this.$refs.searchForm.$el.offsetHeight
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
    this.search(null, null, 1)
  },
  methods: {
    SearchDialogSelect(e, un) {
      switch (this.search_dialog_item.searchFormProp) {
        case 'ProductIndex':
          this.searchForm.goodsCode = e[0].goodsCode
          this.searchForm.goodsName = e[0].goodsName
          break
      }

      // this.searchForm
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(e, ps = null, pn = null) {
      this.table_loading = true
      this.searchForm.pageNum = pn || this.searchForm.pageNum
      this.searchForm.pageSize = ps || this.searchForm.pageSize
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
      Promise.all([getRetailPage(searchForm), getTotalStockSettle(searchForm)]).then((res) => {
        this.tableData = res[0].data
        this.totalData = Object.keys(res[1].data).filter(f => f !== 'goodsName').map(item => {
          const name = item === 'beginPeriodNumber' && '期初库存数量' ||
                       item === 'endPeriodNumber' && '期末库存数量' ||
                       item === 'beginPeriodAmount' && '期初库存金额' ||
                       item === 'endPeriodAmount' && '期未库存金额'
          const value = item === 'beginPeriodNumber' && this.g2kg(res[1].data[item]) ||
                       item === 'endPeriodNumber' && this.g2kg(res[1].data[item]) ||
                       item === 'beginPeriodAmount' && this.fen2yuan(res[1].data[item]) ||
                       item === 'endPeriodAmount' && this.fen2yuan(res[1].data[item]) || '0'
          return { name, value }
        })
      }).finally(() => {
        this.table_loading = false
      })
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
  margin-bottom:10px;
}
</style>
