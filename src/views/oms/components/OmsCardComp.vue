<template>
  <keep-alive :max="2">
    <component
      :is="Comp"
      ref="Comp"
      :select_window_name="window_name"
      :add_arr="addArr"
      :add_arr_form="addArrForm"
      :table_goods_code_arr="table_goods_code_arr"
      :child_search_data="formProData"
      :curr_id="curr_id"
      :no_multiple="opType === 'form'"
      v-bind="$attrs"
      @selectList="selectList"
      @addlist="addList"
      @clearAddArr="addArr=[];add_arr_form=[]"
      @openSelectWindow="openSelectWindow"
      @closeAddwindow="closeAddwindow"
      v-on="$listeners"
    />
  </keep-alive>
</template>

<script>
import OmsForm from '@/views/oms/components/OmsCardAddForm.vue'
import OmsAddCardForm from '@/views/oms/components/OmsAddCardForm'
export default {
  name: 'OmsCardComp',
  components: { OmsForm, OmsAddCardForm },
  data() {
    return {
      formProData: {}, // 固定搜索值
      Comp: 'OmsForm',
      window_name: '',
      addArr: [],
      addArrForm: [],
      table_goods_code_arr: [], // 已选商品code
      curr_id: null,
      scroll_top: 0,
      opType: 'table'
    }
  },
  watch: {
    'Comp': {
      handler(n) {
        console.log('返回新增页' + n)
        if (n === 'OmsForm') {
          this.$nextTick(() => {
            this.$refs.Comp.$refs.Form.$refs.form.clearValidate() // 跳页重置
          })
        }
      }
    }
  },
  methods: {
    selectList(e) { // 选择时反回函数
      if (this.opType === 'form') {
        this.addArrForm = e
      } else if (this.opType === 'table') {
        this.addArr = e
      }
    },
    openSelectWindow(e) {
      console.log(e)
      this.scroll_top = this.$refs.Comp.$refs.cardaddform.scrollTop
      if (e.type === 'form') {
        this.opType = 'form'
      } else {
        this.opType = 'table'
      }
      this.window_name = e.name
      console.log('打开表名称：', e.name)
      if (['ProductIndex', 'StoreProductIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.goodsCode)
      }
      if (['FinFranchiseeSettleIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.franchiseeSettlementNo)
      }

      if (['SupplierSettleIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.settlementOrderNo)
      }

      if (['SendDeliveryIndex', 'FinFranchiseeFeeIndex', 'SupplierFeeIndex', 'StockReceiveIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.orderNo)
      }
      if (['GetCardPageIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.cardNo)
      }
      if (e.curr.id) {
        this.curr_id = e.curr.id
      } else {
        this.curr_id = null
      }
      this.formProData = e.formProData
      this.Comp = 'OmsAddCardForm'
    },
    closeAddwindow() {
      this.addArr = []
      this.Comp = 'OmsForm'
      this.window_name = ''
      this.cardaddformScrollTo(this.scroll_top)
    },
    addList() {
      this.Comp = 'OmsForm'
      this.window_name = ((this.opType === 'form') ? 'form_' : 'type_') + this.window_name
      this.cardaddformScrollTo(this.scroll_top)
    },
    cardaddformScrollTo(top) {
      this.$nextTick(() => {
        this.$refs.Comp.$refs.cardaddform.scrollTo(0, top)
      })
    }
  }
}
</script>

<style scoped>

</style>
