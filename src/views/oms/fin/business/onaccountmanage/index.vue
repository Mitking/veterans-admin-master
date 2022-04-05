<template>
  <div>
    <keep-alive :max="2" :exclude="['OmsCompForm','OmsAddCardForm']">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :current-row="currentRow"
        :details="details"
        :show="formShow"
        :add_arr="$attrs.add_arr || []"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :onaccount-log="OnaccountRepayLog"
        @RepayLog="RepayLog"
        @tabDateChange="Mixin_tabDate=$event"
        @formChange="mixin_form=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=deepClone($event)"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrder, updateOrder, repay, getOnaccountRepayLog, getOnaccountLog } from '@/api/oms/fin/onaccountmanage'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import Order from './onaccountmanage'
import TableLog from './TableLog'
// import dayjs from 'dayjs'
export default {
  name: 'OnaccountManage',
  components: { OmsCompForm, Order, TableLog },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [],
      OnaccountRepayLog: [],
      form_bottons: [],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '挂账人', prop: 'name', width: 120, show: true, type: 'text', selectData: 'stores', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '待还金额', prop: 'repayAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '电话', prop: 'mobile', show: false, type: 'number', float: { max: 999999999999 }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }, { max: 99999999999, type: 'number', transform: (v) => Number(v), message: '长度不能超过11位', trigger: 'change' }] },
        { title: '挂账人类型', prop: 'onaccountType', width: 120, show: true, type: 'select', selectData: 'onaccount_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '公司', prop: 'company', show: true, width: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '地址', prop: 'address', show: true, width: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '创建人', prop: 'creatorName', show: true, width: 120, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' }
      ],
      opprop: '',
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsCompForm')
      return this.currentComponent === 'OmsCompForm'
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
    RepayLog(e, operateItem = null) {
      e.createTime = e.createTime || null
      this.loading = true
      if (this.operateItem.prop === 'repaylog') {
        getOnaccountRepayLog(e).then(res => {
          this.OnaccountRepayLog = res.data
          this.currentComponent = 'TableLog'
        }).catch(() => {
          this.OnaccountRepayLog = []
        }).finally(() => {
          this.loading = false
          if (operateItem) {
            operateItem.loading = false
          }
        })
      } else if (this.operateItem.prop === 'onaccountlog') {
        getOnaccountLog(e).then(res => {
          this.OnaccountRepayLog = res.data
          this.currentComponent = 'TableLog'
        }).catch(() => {
          this.OnaccountRepayLog = []
        }).finally(() => {
          this.loading = false
          if (operateItem) {
            operateItem.loading = false
          }
        })
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = this.deepClone(operateItem)
      this.opprop = operateItem.prop
      console.log(operateItem)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'name', 'readonly', this.opprop === 'repay')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'repayAmount', 'editShow', ['repay', 'detail'].includes(this.opprop))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'mobile', 'editShow', this.opprop !== 'repay')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'onaccountType', 'editShow', this.opprop !== 'repay')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'company', 'editShow', this.opprop !== 'repay')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'address', 'editShow', this.opprop !== 'repay')
      operateItem.loading = true
      if (['detail', 'edit', 'insert'].includes(operateItem.prop)) { // 详情，修改
        this.details = null
        this.currentComponent = 'OmsCompForm'
        operateItem.loading = false
      } else if (operateItem.prop === 'repay') { // 还款
        this.details = null
        this.operateItem.prop = 'edit'
        this.currentRow.repayAmount = ''
        this.currentComponent = 'OmsCompForm'
        operateItem.loading = false
      } else { // 还款流水
        this.RepayLog({ onaccountId: this.currentRow.id, createTime: null }, operateItem)
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg) {
        case 'detail': // 详情
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          if (this.opprop === 'repay') {
            repay(data.Req).then(res => {
              this.message(res)
            }).finally(() => {
              this.loading = false
              this.opprop = ''
            })
          } else {
            data.Req.id = null
            addOrder(data.Req).then(res => {
              this.message(res)
            }).catch(err => {
              this.loading = false
              throw err
            })
          }
          break
        case 'edit': // 修改
          if (this.opprop === 'repay') {
            repay(data.Req).then(res => {
              this.message(res)
            }).finally(() => {
              this.loading = false
              this.opprop = ''
            })
          } else {
            updateOrder(data.Req).then(res => {
              this.message(res)
            }).catch(err => {
              this.loading = false
              throw err
            })
          }
          break
        default:
          console.log(arg, data)
      }
    }
  }
}
</script>
<style scoped>
</style>
