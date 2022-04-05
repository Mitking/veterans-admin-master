<template>
  <keep-alive :max="2">
    <component
      :is="Comp"
      ref="Comp"
      :select_window_name="window_name"
      :add_arr="addArr"
      :table_goods_code_arr="table_goods_code_arr"
      v-bind="$attrs"
      @selectList="addArr=$event"
      @addlist="addlist"
      @clearAddArr="addArr=[]"
      @openSelectWindow="openSelectWindow"
      @closeAddwindow="closeAddwindow"
      v-on="$listeners"
    />
  </keep-alive>
</template>

<script>
import CoreForm from '@/views/core/components/CoreForm'
import CoreAddCardForm from '@/views/core/components/CoreAddCardForm'
export default {
  name: 'CoreCompForm',
  components: { CoreForm, CoreAddCardForm },
  data() {
    return {
      Comp: 'CoreForm',
      opType: 'table',
      window_name: '',
      addArr: [],
      table_goods_code_arr: []
    }
  },
  watch: {
    'Comp': {
      handler(n) {
        console.log('返回新增页' + n)
        if (n === 'CoreForm') {
          this.$nextTick(() => {
            this.$refs.Comp.$refs.Form.$refs.form.clearValidate() // 跳页重置
          })
        }
      }
    }
  },
  methods: {
    openSelectWindow(e) {
      if (e.type === 'form') {
        this.opType = 'form'
      } else {
        this.opType = 'table'
      }
      this.window_name = e.name
      this.table_goods_code_arr = e.addedList.map(item => item.goodsCode)
      this.Comp = 'CoreAddCardForm'
    },
    closeAddwindow() {
      this.addArr = []
      this.Comp = 'CoreForm'
      this.window_name = ''
    },
    addlist() {
      this.Comp = 'CoreForm'
      this.window_name = ((this.opType === 'form') ? 'form_' : 'type_') + this.window_name
    }
  }
}
</script>

<style scoped>

</style>
