<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :current-row="currentRow"
        :show="formShow"
        :details="details"
        @currentSelect="currentRow=$event"
        @getProductById="getProductById"
      />
      <!--       @review="review"@openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"-->
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// import { addOrder, updateOrder, getStoNumber, review } from '@/api/wms/retailpriceprint'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './retailpriceprint'
import { getPage } from '@/api/core/storeproduct'
export default {
  name: 'RetailPricePrintIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const barcodeCheckFunc = async(rule, value, callback) => { // 品名检验
      if (value === '') {
        return callback(new Error('规格条码不能为空'))
      }
      const propIndex = Number(rule.field.substr(8, 1)) // 行号
      if (this.$refs.Comp.form.details.filter((itemF, index) => propIndex !== index).map(item => item.barcode).includes(this.$refs.Comp.form.details[propIndex].barcode)) {
        return callback(new Error('商品重复！'))
      }
      callback()
    }

    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '门店商品Id', prop: 'id', show: false },
        { title: '门店商品Code', prop: 'goodsCode', show: false },
        { title: '规格条码', prop: 'barcode', show: true, width: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: barcodeCheckFunc, trigger: 'change' }] },
        { title: '商品名称', width: 300, prop: 'goodsName', click: this.MixinOpenForm, windowName: 'StoreProductIndex', type: 'selectFromPage', show: true, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        // { title: '商品名称', prop: 'goodsName', show: true, width: 300, type: 'inputSearch', editShow: true, detailShow: true, placeholder: '请输入并选择商品', addFatherProp: 'Req',
        //   rule: [{ validator: goodsNameCheckFunc, trigger: 'change' }] },
        { title: '会员价', prop: 'memberPrice', show: true, width: 100, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '零售价', prop: 'price', show: true, width: 100, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '销售单位', prop: 'saleWeightType', show: true, width: 100, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '打印数量', prop: 'printNum', show: true, width: 150, type: 'Number', float: { max: 1000, decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空或0', trigger: 'change' }] },
        { title: '库存数量', prop: 'totalStockNum', show: true, width: 150, type: 'WEIGHT', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    async getProductById(storeProductId, stockID = null) {
      if (!storeProductId) {
        return true
      }
      const { code, data } = await getPage({ id: storeProductId, pageNum: 1, pageSize: 10, stockId: stockID })
      if (code === 200 && data.records.length === 1) {
        return data.records[0]
      } else {
        return false
      }
    }
  }
}
</script>
<style scoped>
</style>
