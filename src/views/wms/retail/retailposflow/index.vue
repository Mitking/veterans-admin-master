<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :btnloading.sync="btnloading"
        :style="{margin:'0px'}"
        :operate-item="operateItem"
        :current-row="currentRow"
        :show="formShow"
        :details="details"
        @currentSelect="openForm"
        @closeForm="closeForm"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPosFlowDetail } from '@/api/wms/posflow'
import WmsForm from './components/details'
import Order from './posflow.vue'
export default {
  name: 'RetailPosFlowIndex',
  components: { Order, WmsForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      btnloading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      details: {} // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
    }
  },
  watch: {},
  mounted() {},
  methods: {
    openForm(row) {
      this.currentRow = row
      this.btnloading = true
      getPosFlowDetail({ 'orderNo': row.orderNo, 'dealOrderType': row.dealOrderType }).then(res => {
        this.details = res.data
        // this.details.payTypeInfos = [{
        //   'payType': 1,
        //   'receiveAmount': 10000,
        //   'referenceNo': '1234897'
        // }]
        // this.details.productInfos = [{
        //   'goodsName': '三生三世',
        //   'weightType': '1',
        //   'weightTypeName': '斤',
        //   'number': 5110,
        //   'salePrice': 888870000,
        //   'amount': 7770000,
        //   'actualAmount': 9990000
        // }]
        this.currentComponent = 'WmsForm'
      }).finally(() => {
        this.btnloading = false
      })
    },
    closeForm() {
      this.currentComponent = 'Order'
    }
  }
}
</script>
<style scoped>

</style>
