<template>
  <div>
    <keep-alive :max="2" exclude="WmsCompForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import Order from './stockstorage'
export default {
  name: 'StockStorage',
  components: { Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentComponent: 'Order',
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '门店名称', width: 200, prop: 'storeName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '仓库', width: 200, prop: 'stockName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '商品代码', width: 200, prop: 'goodsCode', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '商品条码', width: 120, prop: 'barcode', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '规格', width: 150, prop: 'spec', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '库存单位', width: 100, prop: 'weightType', show: true, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '库存数量', width: 150, prop: 'stockNum', show: true, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '成本单价', width: 200, prop: 'costPrice', show: true, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '金额', width: 150, prop: 'amount', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '零售价', width: 150, prop: 'price', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '会员价', width: 150, prop: 'memberPrice', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '最近收货日期', width: 160, prop: 'lastReceiveDate', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true }

      ]
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {}
}
</script>
<style scoped>
</style>
