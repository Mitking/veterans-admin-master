<template>
  <!-- <div>
    {{ $attrs['current-row'] }}
  </div> -->
  <keep-alive :max="2" :exclude="['WhsSaleIndex','AgencyShipmentIndex'].includes(window_name)?'WmsAddCardForm':''">
    <component
      :is="Comp"
      ref="Comp"
      :select_window_name="window_name"
      :add_arr="addArr"
      :un_select="unSelect"
      :table_goods_code_arr="table_goods_code_arr"
      :child_search_data="formProData"
      :curr_id="curr_id"
      :no_multiple="opType === 'form'"
      :is_selected_arr="is_selected_arr"
      v-bind="$attrs"
      @selectList="selectList"
      @addlist="addList"
      @clearAddArr="addArr=[]"
      @openSelectWindow="openSelectWindow"
      @closeAddwindow="closeAddwindow"
      v-on="$listeners"
    />
  </keep-alive>
</template>

<script>
import WmsForm from '@/views/toB/components/WmsForm'
import WmsAddCardForm from '@/views/toB/components/WmsAddCardForm'
export default {
  name: 'WmsCompForm',
  components: { WmsForm, WmsAddCardForm },
  data() {
    return {
      formProData: {}, // 固定搜索值
      Comp: 'WmsForm',
      window_name: '',
      is_selected_arr: null,
      addArr: [],
      unSelect: [],
      table_goods_code_arr: [], // 已选商品code
      curr_id: null,
      opType: 'table',
      scroll_top: 0,
      transformvalFn: null
    }
  },
  watch: {
    'Comp': {
      handler(n) {
        console.log('返回新增页' + n)
        if (n === 'WmsForm') {
          this.$nextTick(() => {
            this.$refs.Comp.$refs.Form.$refs.form.clearValidate() // 跳页重置
          })
        }
      }
    }
  },
  methods: {
    selectList(selectList, un) { // 选择数据处理
      this.addArr = selectList
      this.unSelect = un || []
      if (this.transformvalFn) {
        this.is_selected_arr = this.transformvalFn(this.is_selected_arr, this.addArr, this.unSelect)
        // this.addArr = this.is_selected_arr
      }
    },
    openSelectWindow(e) {
      this.scroll_top = this.$refs.Comp.$refs.wmsform.scrollTop
      if (e.type === 'form') {
        this.opType = 'form'
      } else {
        this.opType = 'table'
      }
      this.window_name = e.name
      this.is_selected_arr = e.addedList // 已多选的id数组
      this.transformvalFn = e.transformvalFn || null
      if (['ProductIndex', 'StoreProductIndex'].includes(this.window_name)) {
        this.table_goods_code_arr = e.addedList.map(item => item.goodsCode)
        // if (this.$route.name === 'WhsRefundIndex') { // 表格选品
        //   console.log('退款单！！！！')
        // }
      }
      if (this.window_name === 'AgencyShipmentIndex') {
        this.table_goods_code_arr = e.addedList.map(item => item.relationNo)
      }
      if (this.window_name === 'WhsSaleIndex') {
        this.table_goods_code_arr = e.addedList.map(item => item.whsSaleOrderNo)
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
      this.Comp = 'WmsForm'
      this.window_name = ''
      this.wmsformScrollTo(this.scroll_top)
    },
    addList() {
      this.Comp = 'WmsForm'
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
