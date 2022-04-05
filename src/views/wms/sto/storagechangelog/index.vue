<template>
  <div>
    <keep-alive :max="2" exclude="WmsCompForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
        :log_search_data="$attrs.log_search_data"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import Order from './storagechangelog.vue'
export default {
  name: 'StorageChangeLog',
  components: { Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentComponent: 'Order',
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        // { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '门店商品ID', prop: 'storeProductId', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '商品档案代码', width: 200, prop: 'goodsCode', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '商品名称', prop: 'goodsName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '门店', width: 200, prop: 'storeId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '仓库', width: 200, prop: 'stockId', show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '变化数量', width: 150, prop: 'changeNumber', show: true, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '变化个数', width: 150, prop: 'changeCount', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '库存单位', width: 100, prop: 'weightType', show: true, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '调整方式', width: 150, show: true, prop: 'stockChangeType', type: 'select', selectData: 'stock_change_type', addFatherProp: 'Req' },
        { title: '相关单号', width: 240, prop: 'relationNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '操作人', width: 220, prop: 'creatorName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '操作时间', width: 150, prop: 'createTime', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true }
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
