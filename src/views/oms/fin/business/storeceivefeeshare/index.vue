<template>
  <!--  -->
  <div>
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
        :details="details"
        :show="formShow"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :edit-detail-some-disable="true"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, review, updateOrder } from '@/api/oms/fin/storeceivefeeshare'
import { getPurCostListForFeeShare } from '@/api/wms/purcosts'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './order'
export default {
  name: 'StoReceiveFeeShare',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'ProductIndex' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finFeeShare:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货单号', prop: 'receiveOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '收货日期', prop: 'receiveDate', show: true, type: 'text', readonly: true, width: 120, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货类型 ', prop: 'receiveType', width: 120, show: true, type: 'select', selectData: 'receive_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '单据金额', prop: 'orderAmount', show: true, type: 'PRICE_AUTOMATIC', width: 100, design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '费用金额', prop: 'feeAmount', show: true, type: 'PRICE', width: 100, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatus', show: true, type: 'select', selectData: 'audit_status', width: 100, editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '生成定价单', prop: 'isGeneratePrice', show: true, type: 'if_type', width: 120, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '费用单列表', prop: 'purCostsOrderNos', click: this.getFeeList, show: false, type: 'buttonForm', width: 160, editShow: false, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', show: true, type: 'text', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', width: 200, editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, readonly: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', show: false, readonly: true, tabWidth: 300, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品规格', prop: 'spec', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'weightType', show: false, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '供应商名', prop: 'supplier', show: false, type: 'text', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货单价', prop: 'receivePrice', placeholder: '系统计算', readonly: false, show: false, type: 'COST_PRICE_SEMI_AUTOMATIC', inputFn: this.inputPriceFn, propSemiName: 'amount', designSemi: this.mixin_auto_amount, argSemi: ['receivePrice', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '金额', prop: 'amount', placeholder: '手动录入', show: false, readonly: false, type: 'PRICE_SEMI_AUTOMATIC', inputFn: this.inputAmountFn, propSemiName: 'receivePrice', designSemi: this.mixin_auto_price, argSemi: ['amount', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '计算费用', tipMsg: '生成定价单时成本单价是否包含分摊的费用金额', tabWidth: 100, prop: 'ifCalculateFee', placeholder: '手动录入', show: false, type: 'if_type', defaultValue: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '费用', prop: 'fee', placeholder: '手动录入', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }

      ],
      tabDate: [],
      details: [] // 详细数据
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
    getFeeList(list) {
      return getPurCostListForFeeShare({ purCostsOrderNos: list })
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receivePrice', 'readonly', !!this.currentRow.feeAmount)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'ifCalculateFee', 'readonly', !!this.currentRow.feeAmount)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'readonly', !!this.currentRow.feeAmount)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'purCostsOrderNos', 'detailShow', !!this.currentRow.purCostsOrderNos.length)

      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        if (operateItem.prop === 'edit' && this.currentRow.feeAmount) {
          this.$message.info('该单据已经分摊过费用不可修改价格')
        }
        getDetails({ 'shareId': this.currentRow.id }).then((res) => {
          this.details = res.data
          this.currentComponent = 'WmsCompForm'
        }).finally(() => {
          operateItem.loading = false
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'edit': // 修改
          data = Object.assign(data.Req, data)
          delete data.Req
          updateOrder(data).then(res => {
            if (res.code === 200 && arg.review) {
              this.review()
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        default:
          console.log(arg, data)
      }
    },
    review(id, isSure = false) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.review(id, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          if (this.operateItem.prop === 'insert') {
            this.currentComponent = 'Order'
            setTimeout(() => {
              this.$refs.Comp.search()
            }, 0)
          }
          this.loading = false
        })
        return
      }
      review({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
        if (res.code === 200) {
          this.message(res)
        }
      }).catch(() => {
        if (this.operateItem.prop === 'insert') {
          this.currentComponent = 'Order'
          setTimeout(() => {
            this.$refs.Comp.search()
          }, 0)
        }
        this.loading = false
      })
    },
    inputAmountFn(row, item) {
      row[item.prop] = this.yuan2fen(row[item.prop + 'Show'])
      row[item.propSemiName] = item.designSemi(...item.argSemi.map(key => row[key]))
      row[item.propSemiName + 'Show'] = this.fen2yuan6cover(row[item.propSemiName])
    },
    inputPriceFn(row, item) {
      row[item.prop] = this.yuan2fen(row[item.prop + 'Show'])
      row[item.propSemiName] = item.designSemi(...item.argSemi.map(key => row[key]))
      row[item.propSemiName + 'Show'] = this.fen2yuan(row[item.propSemiName])
    }
  }
}
</script>
<style scoped>
</style>
