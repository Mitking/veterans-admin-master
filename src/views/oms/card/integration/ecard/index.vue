<template>
  <div>
    <keep-alive :max="2" exclude="OmsCompForm">
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
import { recharge, ecardPointLogList, getEcardLogList } from '@/api/oms/card/ecard'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import Order from './ecard.vue'
import TableLog from './TableLog'
import TablePointLog from './TablePointLog'
export default {
  name: 'ECard',
  components: { OmsCompForm, Order, TableLog, TablePointLog },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [],
      OnaccountRepayLog: {},
      form_bottons: [],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '卡号', prop: 'cardNo', width: 140, show: true, type: 'text', editShow: true, detailShow: true },
        { title: '乐檬卡号', prop: 'lemengCardNo', width: 120, show: true, type: 'text', editShow: true, detailShow: true },
        { title: '持卡人姓名', prop: 'lemengCardNo', width: 120, show: true, type: 'text', editShow: true, detailShow: true },
        { title: '持卡人电话', prop: 'mobile', width: 140, show: true, type: 'number', readonly: true, float: { decimal: 0, max: 9999999999999 }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '开卡日期', prop: 'openDate', show: true, width: 150, type: 'text', editShow: true, detailShow: true },
        { title: '失效日期', prop: 'effectiveDate', show: true, width: 150, type: 'text', editShow: true, detailShow: true },
        { title: '余额', prop: 'balance', show: true, width: 100, type: 'PRICE', editShow: true, detailShow: true },
        { title: '积分', prop: 'point', show: true, width: 100, type: 'text', editShow: true, detailShow: true },
        { title: '累计存款', prop: 'totalDeposit', show: true, width: 100, type: 'PRICE', editShow: true, detailShow: true },
        { title: '累计消费', prop: 'totalPay', show: true, width: 100, type: 'PRICE', editShow: true, detailShow: true },
        { title: '存款次数', prop: 'depositCount', show: true, width: 100, type: 'text', editShow: true, detailShow: true },
        { title: '回收日期', prop: 'recoveryDate', show: true, width: 150, type: 'text', editShow: true, detailShow: true },
        { title: '是否启用', prop: 'cardValid', show: true, width: 100, type: 'if_type', editShow: true, detailShow: true },
        { title: '所属门店', prop: 'storeName', show: true, width: 200, type: 'text', editShow: true, detailShow: true },
        { title: '会员ID', prop: 'memberId', show: true, width: 100, type: 'text', editShow: true, detailShow: true },
        { title: '创建时间', prop: 'createTime', show: true, width: 150, type: 'text', editShow: true, detailShow: true },
        { title: '最后更新时间', prop: 'updateTime', show: true, width: 150, type: 'text', editShow: true, detailShow: true },
        { title: '充值金额', prop: 'amount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '金额不能为空', trigger: 'change' }] },
        { title: '备注', prop: 'bodyDescribe', show: false, type: 'remark', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false }
      ],
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
    RepayLog(e = {}, operateItem = null) {
      this.loading = true
      const searchForm = this.deepClone(e)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      searchForm.ecardId = this.currentRow.id
      if (this.operateItem.prop === 'repaylog') {
        getEcardLogList(searchForm).then(res => {
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
        ecardPointLogList(searchForm).then(res => {
          this.OnaccountRepayLog = res.data
          this.currentComponent = 'TablePointLog'
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
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'name', 'readonly', this.opprop === 'repay')
      operateItem.loading = true
      if (['detail', 'edit', 'insert'].includes(operateItem.prop)) { // 详情，修改
        this.details = null
        this.currentComponent = 'OmsCompForm'
        operateItem.loading = false
      } else if (operateItem.prop === 'repay') { // 充值
        this.details = null
        this.operateItem.prop = 'edit'
        this.currentRow.repayAmount = ''
        this.currentComponent = 'OmsCompForm'
        operateItem.loading = false
      } else { // 还款流水
        this.RepayLog({ ecardId: this.currentRow.id, pageNum: 1, pageSize: 10 }, operateItem)
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
        case 'edit': // 充值
          recharge(data.Req).then(res => {
            this.message(res)
          }).finally(() => {
            this.loading = false
          })
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
