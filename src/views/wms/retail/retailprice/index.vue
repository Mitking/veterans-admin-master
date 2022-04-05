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
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// import { addOrder, updateOrder, getStoNumber, review } from '@/api/wms/retailprice'
// import WmsForm from '@/views/wms/components/WmsForm'
import Order from './retailprice'
export default {
  name: 'RetailPriceIndex',
  components: { Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '商品分类', width: 150, prop: 'categoryName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '商品代码', width: 180, prop: 'goodsCode', fontWidth: 10, show: true, type: 'text', copy: true, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '商品名', width: 300, prop: 'goodsName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '单位', width: 100, prop: 'weightType', show: true, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '门店商品Id', prop: 'productId', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '所属门店', width: 200, prop: 'storeId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' }
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
  mounted() {
    setTimeout(() => {
      const temp = this.$store.state.enum.enumList.price_type.filter(itemF => !['2', '3', '6', '7'].includes(itemF.value))
        .map(item => ({ title: item.name, propName: item.value, type: 'PRICELIST', width: 100, addFatherProp: 'Req', show: true }))
      const tmp = temp[2]
      temp[2] = temp[1]
      temp[1] = tmp
      this.table_data_arr.push(...temp)
    }, 0)
  },
  methods: {}
}
</script>
<style scoped>

</style>
