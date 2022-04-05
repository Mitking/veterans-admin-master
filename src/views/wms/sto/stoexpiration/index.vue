<template>
  <div>
    <!-- @indexPageFormChange="indexPageFormChange" -->
    <keep-alive :max="2" exclude="WmsCompForm">
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
        :form-bottons="form_bottons"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrder } from '@/api/wms/expiration'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './expiration'
export default {
  name: 'ExpirationIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '商品id(隐藏)', prop: 'productId', width: 240, show: false, click: 'addItems', windowName: 'ProductIndex', type: 'text', tabHidden: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '商品条码(隐藏)', prop: 'barcode', width: 240, show: false, click: 'addItems', windowName: 'ProductIndex', type: 'text', tabHidden: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '商品代码', prop: 'goodsCode', width: 240, show: true, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true,
          rule: [{ required: true, message: '商品代码不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', width: 240, show: true, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true,
          rule: [{ required: true, message: '商品名称不能为空', trigger: 'change' }] },
        { title: '保质期(天)', prop: 'shelfLife', formItemWidth: '100', width: 120, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true,
          rule: [{ required: true, message: '请在商品档案设置保质期', trigger: 'change' }] },
        { title: '保质期提醒天数', prop: 'remindDay', formItemWidth: '100', width: 120, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true,
          rule: [{ required: true, message: '请在商品档案设置预警天数', trigger: 'change' }] },
        { title: '生产日期', prop: 'manufactureDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '生产日期不能为空', trigger: 'change' }] }
      ],
      details: null // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsCompForm')
      return this.currentComponent === 'WmsCompForm'
    }
  },
  watch: {},
  created() {},
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
    categoryIdsCheck(rule, value, callback) {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.invRange === '1' && value.length === 0) {
        return callback(new Error('分类列表不能为空！'))
      }
      return callback()
    },
    // indexPageFormChange(form) { // 表单form数据变化
    //
    //   this.mixin_arr_edit_by_prop(this.ArrFilter(this.table_data_arr, { show: true, addFatherProp: 'Req' }), 'loopPeriod', 'editShow', form.ifLoop)
    //   this.mixin_arr_edit_by_prop(this.ArrFilter(this.table_data_arr, { show: true, addFatherProp: 'Req' }), 'loopTimeUnit', 'editShow', form.ifLoop)
    // },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit', 'insert'].includes(operateItem.prop)) { // 详情，修改,新增
        this.currentComponent = 'WmsCompForm'
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.stoInvPlanNo = data.Req.stoInvPlanNo
            })
          }
          if (data.Req.invRange === '1') { // 类别盘点
            data.Req.categoryName = this.enumGetproplist({ selectData: 'categoryList', selectOption: { value: 'id' }}, data.Req.categoryIds).map(it => it.name).toString()
          }
          addOrder(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        // case 'edit': // 修改
        //   data = Object.assign(data, data.Req)
        //   delete data.Req
        //   updateOrder(data).then(res => {
        //     this.message(res)
        //   }).catch(err => {
        //     this.loading = false
        //     throw err
        //   })
        //   break
        default:
          console.log(arg, data)
      }
    }
  }
}
</script>
<style scoped>
</style>
