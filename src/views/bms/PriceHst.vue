<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <SelectOrgStore :type="1" default-store-name="基础档案" @updateData="searchForm=Object.assign(searchForm,$event)" />
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
      <el-form-item
        label="价格类型"
        style="width:300px"
      >
        <el-select
          v-model="searchForm.priceType"
          class="item-select-fa"
          multiple
          collapse-tags
          clearable
          placeholder="全部"
          style="width:100%"
        >
          <el-option
            v-for="(itemSon,indexSon) in enumGetproplist({selectData:'price_type'})"
            :key="indexSon+100"
            :label="itemSon.name"
            :value="itemSon.value"
          />
        </el-select>
      </el-form-item>
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
    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <div style="height:500px;">
      <chart
        ref="echart"
        height="100%"
        width="100%"
        :legend_arr="legendArr"
        :x_data="x_data"
        :line_data="tableData.records"
      />
    </div>
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      v-if="is_clear"
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
import { PriceHst } from '@/api/bms/PriceHst'
import { getCategoryTree } from '@/api/core/goodscategory'
import dayjs from 'dayjs'
import Chart from './components/LineMarker'
export default {
  name: 'PriceHst',
  components: { SelectOrgStore, MixPage, User, ProductIndex, Chart },
  data() {
    return {
      legendArr: [],
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      curr_date: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'goodsCode': '',
        'goodsName': '',
        'priceType': [],
        'startDate': dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        'endDate': dayjs().format('YYYY-MM-DD'),
        'storeId': 0
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      x_data: [],
      details: [] // 详细数据
    }
  },
  computed: {},
  watch: {
    'search_dialog_item.show': {
      handler(n) {
        if (n) {
          this.is_clear = n
        }
      }
    }
  },
  created() {},
  methods: {
    getCategoryFn() {
      getCategoryTree({}).then(res => {
        this.goodsOptions = res.data
      })
    },
    SearchDialogSelect(e) {
      switch (this.search_dialog_item.searchFormProp) {
        case 'ProductIndex':
          this.searchForm.goodsName = e[0].goodsName
          this.searchForm.goodsCode = e[0].goodsCode
          break
        case 'cashierName':
          this.searchForm.cashierId = e[0].id
          this.searchForm.cashierName = e[0].surname
          break
      }

      // this.searchForm
    },
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search() {
      if (this.searchForm.goodsName === '') {
        return this.$message.info('请先选择商品')
      }

      if (this.searchForm.startDate === null || this.searchForm.endDate === null) {
        return this.$message.info('请先选择时间段')
      }
      this.x_data = []
      const dateLength = dayjs(this.searchForm.endDate).diff(dayjs(this.searchForm.startDate), 'day')
      for (let index = 0; index <= dateLength; index++) {
        const date = dayjs(this.searchForm.startDate).add(index, 'day').format('YYYY-MM-DD')
        this.x_data.push(date)
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
      if (this.searchForm.priceType.length === 0) {
        searchForm.priceType = null
        this.legendArr = this.enumGetproplist({ selectData: 'price_type' })
      } else {
        this.legendArr = this.enumGetproplist({ selectData: 'price_type' }, this.searchForm.priceType)
      }
      searchForm.priceTypes = searchForm.priceType
      PriceHst(searchForm).then(res => {
        this.tableData.records = res.data
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
