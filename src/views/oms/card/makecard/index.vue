<template>
  <div>
    <keep-alive :max="2" exclude="OmsCardComp">
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
        :form-bottons="form_bottons"
        :show="formShow"
        :detail_table_buttons="detail_table_buttons"
        v-bind="$attrs"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event"
        @formChange="mixin_form=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrder, getSendNumber, getDetails, updateOrder, reviews } from '@/api/oms/card/makecard'
import OmsForm from '@/views/oms/components/OmsCardComp'
import Order from './makecard'
import dayjs from 'dayjs'
export default {
  name: 'MakeCardIndex',
  components: { OmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:cardMake:review'] }
      ],
      detail_table_buttons: [
        { title: '清空列表', show: true, prop: 'clearList' },
        { title: '追 加', show: true, prop: 'addItem' },
        { title: '批量折扣', show: true, prop: 'edits_discounts' },
        { title: '批量制卡', show: true, prop: 'addListMake', formProData: { orgId: '', storeId: '' }}
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '单据号', prop: 'cardMakeNo', show: true, width: 230, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '制卡日期', prop: 'makeDate', width: 150, defaultValue: dayjs().format('YYYY-MM-DD'), show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '制卡日期不能为空', trigger: 'change' }] },
        { title: '制卡组织', width: 200, prop: 'orgId', show: true, type: 'select', defaultValue: this.$store.getters.orgId, readonly: true, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '制卡组织不能为空', trigger: 'change' }] },
        { title: '制卡门店', width: 200, prop: 'storeId', show: true, type: 'select', defaultValue: this.$store.getters.storeId, readonly: true, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '制卡门店不能为空', trigger: 'change' }] },
        { title: '起始卡面号', prop: 'originCardNo', width: 200, show: true, type: 'number', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '结束卡面号', prop: 'endCardNo', width: 200, show: true, type: 'number', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '单卡折扣金额', prop: 'discount', width: 120, show: true, type: 'PRICE', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '单卡充值金额', prop: 'rechargeAmount', width: 100, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '总充值金额', prop: 'totalAmount', width: 100, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['balance'], editShow: true, detailShow: true, placeholder: '系统计算', addFatherProp: 'Req', readonly: true },
        { title: '制卡数量', prop: 'count', width: 100, show: true, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatus', width: 100, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 180, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewTime', width: 180, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '卡面号', prop: 'faceNo', show: false, click: 'addItems', windowName: 'GetCardPageIndex', formProData: { state: '6' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false,
          rule: [{ required: true, message: '请选择卡号', trigger: 'change' }] },
        { title: '卡号', prop: 'cardNo', show: false, click: 'addItems', windowName: 'GetCardPageIndex', formProData: { state: '6' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true,
          rule: [{ required: true, message: '请选择卡号', trigger: 'change' }] },
        // { title: '卡状态', prop: 'state', show: false, type: 'select', selectData: 'card_status', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '面值', prop: 'amount', show: false, readonly: true, defaultValue: '-', type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '折扣金额', prop: 'discount', show: false, type: 'PRICE', defaultValue: 0, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '销售价', prop: 'salePrice', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_pur_weight_diff, arg: ['amount', 'discount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '不能为负数', trigger: 'change' }] },
        { title: '充值金额', prop: 'balance', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '不能为负数', trigger: 'change' }] }

        // { title: '是否写磁', prop: 'ifRead', show: false, type: 'if_type', readonly: true, defaultValue: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '制卡日期', prop: 'makeDate', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsForm')
      return this.currentComponent === 'OmsForm'
    }
  },
  watch: {
    Mixin_tabDate(data) {
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', [1].includes(this.$store.getters.accountType) || data.some(item => !!item.cardNo))
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType) || data.some(item => !!item.cardNo))
    }
  },
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.loading = false
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.msg)
      }
    },
    formProData() {
      // return ({ state: '3', orgId: this.$store.getters.orgId, storeId: this.$store.getters.storeId })
      if (this.$store.getters.accountType === 3) { // 账套级别
        return ({ state: '3' })
      } else if (this.$store.getters.accountType === 2) { // 组织级别
        return ({ state: '3', orgId: this.$store.getters.orgId })
      } else {
        return ({ state: '3', orgId: this.$store.getters.orgId, storeId: this.$store.getters.storeId })
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情
        getDetails({ 'cardMakeNo': this.currentRow.cardMakeNo }).then(res => {
          this.details = res.data
          this.currentComponent = 'OmsForm'
        }).finally(() => {
          operateItem.loading = false
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'LPK_ZK' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'OmsForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          data.Req.id = null
          data.orgId = data.Req.orgId
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.cardMakeNo = data.Req.cardMakeNo
            })
          }
          data.makeCardReq = data.Req

          delete data.Req
          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrder(data).then(res => {
                if (res.code === 200) {
                  this.review(res.data.id, true)
                }
              }).catch(err => {
                this.loading = false
                throw err
              })
            }).catch(() => {
              this.$message.info('已取消审核')
              this.loading = false
            })
            return
          }
          addOrder(data).then(res => {
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          data.orgId = data.Req.orgId
          data.detailDeleteIds = data.deleteDetailIds
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.cardMakeNo = data.Req.cardMakeNo
            })
          }
          data.makeCardReq = data.Req

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
      reviews({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
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
    }
  }
}
</script>
<style scoped>
</style>
