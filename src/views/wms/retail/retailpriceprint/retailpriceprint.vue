<template>
  <div>
    <!-- 搜索栏目 @enter="transition=false;transitionMarginTop=0" -->
    <mix-search
      v-show="searchFormShow"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @handsearch="print(operateList[0])"
    />
    <!-- 操作栏目 -->
    <div :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}">
      <mix-operate
        :operate-list="operateList"
        :ids="ids"
        :current-row="currentRow"
        :back="false"
        :search-form-show="searchFormShow"
        @search-form-act="searchFormShow = !searchFormShow"
      />
    </div>

    <!-- v-loading="Mixin_loading"   表单 -->
    <el-form ref="Form" :model="form">
      <el-table
        style="margin:0 24px"
        :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:155})}"
        :header-cell-style="{background:'#F3F4F7',color:'#555'}"
        border
        :max-height="mixin_tab_max_height"
        highlight-current-row
        :data="form.details"
      >
        <el-table-column
          type="index"
          width="55"
          align="center"
          label="#"
        />
        <el-table-column
          :width="100"
          align="center"
        >
          <template slot="header">
            <div class="table-header">操作</div>
          </template>
          <!--  -->
          <template slot-scope="{$index}">
            <div class="operator-father">
              <i style="color:#409EFF" class="el-icon-delete" @click="deleteItem($index)" />
              <i style="color:#409EFF" class="el-icon-circle-plus-outline" @click="addItem($index)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item) in ArrFilter($attrs['form-data'],{show:true})"
          :key="item.prop"
          :prop="item.prop"
          align="center"
          :width="item.width || '220'"
        >
          <template slot="header">
            <div>{{ item.title }}</div>
          </template>
          <template slot-scope="{row,$index}">
            <el-form-item :prop="`details[${$index}][${item.prop}]`" :rules="item.rule">
              <!-- :fetch-suggestions="querySearchAsync" -->
              <el-autocomplete
                v-if="item.type==='inputSearch'"
                v-model="row[item.prop]"
                style="width:280px"
                :fetch-suggestions="querySearchAsync"
                :placeholder="item.placeholder"
                @select="(e)=>{handleSelect(e,$index)}"
              />
              <el-input
                v-if="item.type==='selectFromPage'"
                v-model="row[item.prop]"
                :readonly="true"
                style="width:280px"
                @focus="MixinOpenForm(item);index=$index"
              />

              <el-input
                v-else-if="item.type==='Number'"
                v-model.number="row[item.prop]"
                v-number-input="item.float"
                :placeholder="item.placeholder"
              />
              <div v-else>{{
                item.type==='PRICE' && fen2yuan(row[item.prop])
                  || item.type==='WEIGHT' && g2kg(row[item.prop])
                  || item.type==='select' && MenuGetPropName(item.selectData,row[item.prop])
                  || row[item.prop] || '-' }}
              </div>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-dialog
      title="打印预览"
      :visible.sync="printShow"
      :show-close="false"
      width="430px"
      refs
    >
      <div style="height:500px;overflow-y:auto">
        <div v-if="printShow" id="printWindow" style="font-size:6px">
          <div
            v-for="(item,indexM) in form.details"
            :key="indexM"
            style="display:inline"
          >
            <div v-for="(itemZ,indexZ) in Number(item.printNum)" :key="indexZ" style="display:inline-block;margin-right:24px;margin-top:10px">
              <!-- <div style="margin:15px 15px 0 15px;z-index:10"> -->
              <div style="width:165px;padding-left:5px;z-index:10;height:.9rem;overflow: hidden;" class="print-font">{{ item.goodsName }}</div>
              <!--  -->
              <!-- </div> -->
              <!-- style="display:flex;justify-content:center;align-items:center;" -->
              <div style="width:165px;display:flex;align-items:center;justify-content:space-around">
                <svg style="width:100px;margin-bottom:10px" :class="'barcode'+item.barcode" />
                <div class="print-font">单位:
                  <div> {{ MenuGetPropName('weight_type',item.saleWeightType) }}</div>
                </div>
              </div>
              <div style="width:170px;margin-right:-10px;height:.9rem;display:flex;align-items:center;justify-content:space-around">
                <span class="print-font">零售价:{{ fen2yuan(item.price) }}</span>
                <span class="print-font">会员价:{{ fen2yuan(item.memberPrice) }}</span>
              </div>
              <!-- <span class="print-font" style="padding-left:5px">零售价: {{ fen2yuan(item.price) }}</span>
              <span class="print-font" style="padding-left:5px">会员价: {{ fen2yuan(item.memberPrice) }}</span> -->
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="printShow = false">取 消</el-button>
        <el-button v-print="printObj" type="primary">打 印</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="商品选择"
      :visible.sync="mixin_select_form_show"
      width="80%"
    >
      <div style="width: 100%; padding-right: 15px">
        <component
          :is="'StoreProductIndex'"
          :is_child="true"
          select_window_name="StoreProductIndex"
          :add_arr="selectList"
          :child_search_data="childSearchData"
          :table_goods_code_arr="form.details.map(item=>item.goodsCode)"
          @selectList="selectList=$event"
          @addlist="insertItem();mixin_select_form_show=false"
        />
      </div>
      <div slot="footer">
        <el-button @click="mixin_select_form_show=false">
          取 消
        </el-button>
        <el-button type="primary" :disabled="selectList.length===0" @click="insertItem">
          确 认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import StoreProductIndex from '@/views/core/product/storeproduct/index'
import jsbarcode from 'jsbarcode'
// import { pricePrint } from '@/api/wms/retailpriceprint'
import { getPage } from '@/api/core/storeproduct'
export default {
  name: 'Order',
  components: { StoreProductIndex },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      printObj: {
        id: 'printWindow',
        extraCss: 'print-font-10'
      },
      index: 0,
      printShow: false,
      form: { details: [] },
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', width: '300px', type: 'select', defaultAllValue: true, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: this.$store.getters.storeId, selectData: 'stores', fatherProp: 'orgId', selectOption: { label: 'name', value: 'id' }},
        { title: '仓库', prop: 'stockId', defaultValue: 0, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', width: '300px' }
      ],
      operateList: [ // 操作栏项目
        { title: '打印', show: true, prop: 'print', click: this.print, loading: false, icon: 'el-icon-search', disabled: false, type: 'primary', permission: [], width: 80 },
        { title: '刷新库存', show: true, prop: 'freshStockNum', loading: false, click: this.opreat, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:storeProduct:getList:mobile'], width: 80 },
        { title: '设置当前库存为打印份数', show: true, prop: 'setCount', loading: false, click: this.opreat, icon: 'el-icon-search', disabled: false, type: 'primary', permission: [], width: 80 },
        { title: '清空列表', show: true, prop: 'clearList', click: this.opreat, loading: false, icon: 'el-icon-delete', disabled: false, type: 'primary', permission: [], width: 80 }
        // { title: '导出', show: true, prop: 'export', click: this.opreat, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: [], width: 80 }
      ],
      init_temp: {},
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        goodsName: '',
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      selectList: [],
      details: [] // 详细数据
    }
  },
  computed: {
    childSearchData() {
      if ([0, 3].includes(this.$store.getters.accountType)) {
        return { storeId: this.searchForm.storeId || null, stopSale: false }
      } else if ([2].includes(this.$store.getters.accountType)) {
        return { orgId: this.$store.getters.orgId, storeId: this.searchForm.storeId, stopSale: false }
      } else {
        return { orgId: this.$store.getters.orgId, storeId: this.$store.getters.storeId, stopSale: false }
      }
    }
  },
  watch: {},
  created() {
    console.log('重新加载')
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$attrs['form-data'].map(item => { this.init_temp[item.prop] = '' })
    console.log('this.init_temp:', this.init_temp)
    this.form.details.push(this.deepClone(this.init_temp))
  },

  methods: {
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    opreat(e) {
      e.loading = true
      switch (e.prop) {
        case 'freshStockNum':
          this.form.details.map(item => {
            this.$listeners.getProductById(item.id, this.searchForm.stockId || null).then(res => {
              if (res === false) { // 仓库中未查到该品
                item.totalStockNum = '未查到数据'
              } else {
                item.totalStockNum = res.totalStockNum
              }
            })
          })
          setTimeout(() => {
            e.loading = false
          }, 1000)
          break
        case 'setCount':
          this.form.details.map(item => {
            item.printNum = isNaN(this.g2kg(item.totalStockNum)) ? 0 : this.g2kg(item.totalStockNum)
          })
          e.loading = false
          break
        case 'clearList':
          this.form.details = [this.deepClone(this.init_temp)]
          this.$nextTick(() => {
            this.$refs.Form.clearValidate()
          })
          e.loading = false
          break
        case 'export':
          console.log('export')
          e.loading = false
          break
      }
    },
    print(e) { // 打印
      if (this.mixin_select_form_show) {
        return
      }
      e.loading = true
      if (this.form.details.map(item => item.printNum).reduce((prev, curr) => Number(prev) + Number(curr), 0) > 1000) {
        this.$message.error('打印失败：打印数量之和不能超过1000条')
        e.loading = false
        return
      }
      this.$refs.Form.validate().then(() => { // 打印
        this.printShow = true
        this.$nextTick(() => {
          this.form.details.map(item => {
            jsbarcode(
              `.barcode${item.barcode}`,
              item.barcode,
              {
                displayValue: true, // 是否在条形码下方显示文字
                height: 50,
                margin: 3,
                width: 1.2,
                marginLeft: 3,
                fontSize: 12
              }
            )
          })
          e.loading = false
        })
      }).catch(() => {
        e.loading = false
        this.$message.error('打印失败：请检查数据')
      })
    },
    surePrint() {
      this.printShow = false
    },
    handleSelect(item, i) {
      Object.keys(this.init_temp).map(key => {
        this.form.details[i][key] = item[key] || ''
      })
    },
    insertItem() {
      const arr = this.selectList.map(item => {
        const temp = {}
        Object.keys(this.init_temp).map(key => {
          temp[key] = item[key] || ''
        })
        temp.saleWeightType = item.unitConversionRateRes.saleWeightType
        return temp
      })
      this.form.details.insert(this.index + 1, ...arr)
      this.form.details.splice(this.index, 1)
      this.selectList = []
      this.mixin_select_form_show = false
    },
    querySearchAsync(queryString, cb) {
      if (queryString) {
        this.searchForm.goodsName = queryString
        const searchForm = this.deepClone(this.searchForm)
        Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
        getPage(searchForm).then(res => {
          if (res.code === 200) {
            console.log('res.data:', res.data)
            res.data.records.map(item => {
              item.value = item.goodsName
              item.saleWeightType = item.unitConversionRateRes.saleWeightType
            })
            cb(res.data.records)
          }
        })
      } else {
        cb([])
      }
    },

    deleteItem(i) {
      if (this.form.details.length === 1) {
        console.log('剩一项了')
        const temp = this.deepClone(this.init_temp)
        this.$set(this.form.details, 0, temp)
      } else {
        this.form.details.splice(i, 1)
      }
      this.$nextTick(() => {
        this.$refs.Form.clearValidate()
      })
    },
    addItem(i) {
      this.form.details.splice((i + 1), 0, this.deepClone(this.init_temp))
      this.$nextTick(() => {
        this.$refs.Form.clearValidate()
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
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
.operator-father{
  display: flex;
  width:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}
.print-font{
 font-size:10px;
 color:#000;
 /* font-family:SimHei; */
 /* font-weight:bold; */
}
/* #printWindow{
 width:100px
} */
.print-font-10{
 font-size: 10px;
}
</style>
