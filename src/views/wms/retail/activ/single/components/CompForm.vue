<template>
  <keep-alive :max="2">
    <component
      :is="Comp"
      ref="Comp"
      :select_window_name="window_name"
      :add_arr="addArr"
      :table_goods_code_arr="table_goods_code_arr"
      :child_search_data="formProData"
      :curr_id="curr_id"
      :no_multiple="opType === 'form'"
      v-bind="$attrs"
      @selectList="addArr=$event"
      @addlist="addList"
      @clearAddArr="addArr=[]"
      @openSelectWindow="openSelectWindow"
      @closeAddwindow="closeAddwindow"
      v-on="$listeners"
    />
  </keep-alive>
</template>

<script>
import Form from './totalform.vue'
import WmsAddCardForm from '@/views/wms/components/WmsAddCardForm'
export default {
  name: 'CompForm',
  components: { Form, WmsAddCardForm },
  data() {
    return {
      formProData: {}, // 固定搜索值
      Comp: 'Form',
      window_name: '',
      addArr: [],
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
        if (n === 'Form') {
          this.$nextTick(() => {
            this.$refs.Comp.$refs.Form.$refs.form.clearValidate() // 跳页重置
          })
        }
      }
    }
  },
  methods: {
    openSelectWindow(e) {
      this.scroll_top = this.$refs.Comp.$refs.wmsform.scrollTop
      if (e.type === 'form') {
        this.opType = 'form'
      } else {
        this.opType = 'table'
      }
      this.window_name = e.name
      if (['ProductIndex', 'StoreProductIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.goodsCode)
      }
      if (e.curr.id) {
        this.curr_id = e.curr.id
      } else {
        this.curr_id = null
      }
      this.formProData = e.formProData
      this.Comp = 'WmsAddCardForm'
    },
    closeAddwindow() {
      this.addArr = []
      this.Comp = 'Form'
      this.window_name = ''
      this.wmsformScrollTo(this.scroll_top)
    },
    addList() {
      this.Comp = 'Form'
      this.window_name = ((this.opType === 'form') ? 'form_' : 'type_') + this.window_name
      this.wmsformScrollTo(this.scroll_top)
    },
    wmsformScrollTo(top) {
      this.$nextTick(() => {
        this.$refs.Comp.$refs.wmsform.scrollTo(0, top)
      })
    }
  }
}
</script>

<style scoped>

</style>
