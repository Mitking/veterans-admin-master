<template>
  <div>
    <keep-alive :max="2" exclude="StoreProductPriceTable">
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
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @rowsList="rowsList"
        @currentSelect="currentRow=$event"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPriceDetails, updateOrder, deleteById } from '@/api/core/storeproductprice'
import FormTable from './components/StoreProductPriceTable'
import Order from './storeproductprice'
export default {
  name: 'StoreProductPriceIndex',
  components: { Order, FormTable },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const checkAmount = async(rule, value, callback) => { // 价格检验
      // return callback(new Error('请填写价格'))

      // const propIndex = Number(rule.field.substr(8, 1)) // 行号
      //
      if (value === '' || value === 0) {
        return callback(new Error('请填写价格'))
      }
      callback()
    }
    const checkType = async(rule, value, callback) => { // 价格检验
      if (value === '') {
        return callback(new Error('价格类型为空！'))
      }
      if (this.refrain(this.$refs.Comp.form.details.map(item => item.priceType)).includes(value)) {
        return callback(new Error('价格类型重复！'))
      }
      callback()
    }
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '门店', prop: 'storeId', show: true, type: 'select', width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: true, disabled: false, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '商品名称', prop: 'goodsName', show: true, type: 'text', readonly: true, disabled: false, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '商品代码', prop: 'goodsCode', show: true, fontWidth: 12, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '商品分类', prop: 'goodsCategoryId', show: true, width: 200, type: 'select', selectData: 'categoryList', selectOption: { value: 'id', label: 'name' }, readonly: true, disabled: false, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '成本价', prop: 'costPrice', show: true, width: 130, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '零售价', prop: 'price', show: true, width: 130, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '会员价', prop: 'memberPrice', show: true, width: 100, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '活动价', prop: 'activPrice', show: false, width: 100, type: 'PRICE', editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },

        // { title: '主键', prop: 'id', show: false, type: 'text', defaultValue: null, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '门店商品ID', prop: 'storeGoodsId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '价格类型', prop: 'priceType', show: false, type: 'select', selectData: 'price_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: checkType, trigger: 'change' }] },
        { title: '价格', prop: 'goodsPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: checkAmount, trigger: 'change' }] },
        { title: '可用', prop: 'priceUseState', show: false, type: 'if_type', defaultValue: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      detailsList: [],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      return this.currentComponent === 'FormTable'
    }
  },
  watch: {},
  created() {
    // this.$store.state.enum.enumList.price_type.map(item => {
    //   this.table_data_arr.push({
    //     title: item.name,
    //     prop: item.value,
    //     show: true,
    //     type: 'price',
    //     editShow: false,
    //     detailShow: true,
    //     width: 200,
    //     addFatherProp: 'detailReqs'
    //   })
    // })
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    deleteDetail(e) {
      return deleteById({ id: e.id })
    },
    openModel() {
      getPriceDetails({ 'storeGoodsId': this.currentRow.id }).then(res => {
        if (res.code === 200) {
          res.data.map(item => {
            if (['2', '3'].includes(item.priceType)) {
              item.goodsPriceShow = this.fen2yuan6cover(item.goodsPrice)
            } else {
              item.goodsPriceShow = this.fen2yuan(item.goodsPrice)
            }
          })
          this.details = res.data
          this.currentComponent = 'FormTable'
        }
      })
    },
    formSave(data) {
      if (data === 'close') {
        this.currentComponent = 'Order'
        return
      }
      updateOrder({ storeId: this.currentRow.storeId, goodsCode: this.currentRow.goodsCode, list: data }).then(res => {
        // if (res.code === 200) {
        //   this.currentComponent = 'Order'
        this.message(res)
        // }
      })
    },
    rowsList(e, ids) {
      this.detailsList = e.map(item => ({ storeId: item.storeId, goodsCode: item.goodsCode, goodsName: item.goodsName }))
      this.ids = ids
    }
  }
}
</script>
<style scoped>
</style>
