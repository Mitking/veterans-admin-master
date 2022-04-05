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
        :show="formShow"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        @tabDateChange="Mixin_tabDate=$event"
        @formChange="mixin_form=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @deleteDetail="deleteDetail"
        @review="review"
        @addByList="addByList"
        @addByOrder="addByOrder"
      />
    </keep-alive>
    <el-dialog
      title="批量添加"
      :visible.sync="orderSelectShow"
      fullscreen
      :modal-append-to-body="false"
    >
      <SelectByOrder v-if="dialog_component==='button_adds'" ref="refSelect" :single="true" :search_lock="{state:'3'}" :child="true" @selectedRows="selectItem=$event" />
      <SelectByList v-if="dialog_component==='cardNo'" ref="refSelect" :selectlist="cardNoList" :search_lock="{state:'3'}" :single="selectByListSingle" child="true" @selectedRows="selectItem=$event" />
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="orderSelectShow = false">取 消</el-button>
        <el-button :loading="dialogLoading" type="primary" :disabled="!selectItem.data.length" @click="selectOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import SelectByOrder from '../issue/index'
import SelectByList from '../getcardpage/getcardpage'
import { addOrder, getSendNumber, getDetails, reviews, updateOrder } from '@/api/oms/card/sale'
import { getDetails as manageOrderDetails } from '@/api/oms/card/issue'
import OmsCompForm from '@/views/oms/components/OmsCardComp'
import Order from './sale'
import dayjs from 'dayjs'
export default {
  name: 'CardSaleIndex',
  components: { OmsCompForm, Order, SelectByOrder, SelectByList },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '清空列表', show: true, prop: 'clearList' },
        { title: '追 加', show: true, prop: 'addItem' },
        { title: '批量销售', show: true, prop: 'addListSale', formProData: { orgId: '', storeId: '' }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:cardSale:update:review'] }
      ],
      selectByListSingle: false, // 是否单选
      insertIndex: '', // 行间插入位置
      dialogLoading: false,
      orderSelectShow: false,
      loading: false,
      dialog_component: '',
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '卡销售单号', prop: 'cardSaleNo', width: 230, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '销售日期', width: 150, prop: 'saleDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '销售日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', show: true, type: 'select', defaultValue: this.$store.getters.orgId, readonly: [1, 2].includes(this.$store.getters.accountType), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '组织不能为空', trigger: 'change' }] },
        { title: '门店', width: 200, prop: 'storeId', show: true, type: 'select', defaultValue: this.$store.getters.storeId, readonly: [1].includes(this.$store.getters.accountType), selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '下发门店不能为空', trigger: 'change' }] },
        // { title: '客户', width: 150, prop: 'customerId', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '客户', width: 150, prop: 'customerId', propFromPageName: 'customerName', show: true, click: 'addItems', windowName: 'Customer', type: 'selectFromPage', formProData: { typeName: '礼品卡' }, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '起始卡面号', prop: 'originCardNo', width: 200, show: true, type: 'number', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '结束卡面号', prop: 'endCardNo', width: 200, show: true, type: 'number', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '总面值', width: 100, prop: 'totalAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, placeholder: '系统计算', addFatherProp: 'Req', readonly: true },
        { title: '总售价', width: 100, prop: 'totalSalePrice', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['salePrice'], editShow: true, detailShow: true, placeholder: '系统计算', addFatherProp: 'Req', readonly: false },
        { title: '销售数量', width: 100, prop: 'count', show: true, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', width: 100, prop: 'auditStatus', readonly: true, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', width: 150, prop: 'reviewer', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', width: 160, prop: 'reviewTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '发卡单号', prop: 'cardSaleNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '卡面号', prop: 'faceNo', show: false, click: 'addItems', windowName: 'GetCardPageIndex', formProData: { orgId: '', storeId: '', state: '3' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false,
          rule: [{ required: true, message: '请选择卡号', trigger: 'change' }] },
        { title: '卡号', prop: 'cardNo', show: false, click: 'addItems', windowName: 'GetCardPageIndex', formProData: { orgId: '', storeId: '', state: '6' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true,
          rule: [{ required: true, message: '请选择卡号', trigger: 'change' }] },
        // { title: '卡状态', prop: 'state', defaultValue: '-', show: false, type: 'select', selectData: 'card_status', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '面值', prop: 'amount', defaultValue: '-', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '折扣金额', prop: 'discount', defaultValue: '-', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '售卖价', prop: 'salePrice', defaultValue: '-', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_pur_weight_diff, arg: ['amount', 'discount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '余额', prop: 'balance', defaultValue: '-', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true }
        // { title: '是否写磁', prop: 'ifRead', show: false, type: 'if_type', defaultValue: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true }
      ],
      details: [], // 详细数据
      selectItem: { data: [], type: '' } // 已选择列表
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsCompForm')
      return this.currentComponent === 'OmsCompForm'
    },
    cardNoList() {
      if (this.$refs.Comp.$refs.Table) {
        return this.$refs.Comp.$refs.Table.form.details.map(item => item.cardNo)
      } else {
        return []
      }
    }
  },
  watch: {
    Mixin_tabDate(data) {
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', [1].includes(this.$store.getters.accountType) || data.some(item => !!item.cardNo))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType) || data.some(item => !!item.cardNo))
    }
  },
  created() {},
  methods: {
    formProData() {
      if (this.$store.getters.accountType === 3) { // 账套级别
        return ({ state: '7' })
      } else if (this.$store.getters.accountType === 2) { // 组织级别
        return ({ state: '7', orgId: this.$store.getters.orgId })
      } else {
        return ({ state: '7', orgId: this.$store.getters.orgId, storeId: this.$store.getters.storeId })
      }
    },
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.msg)
      }
      this.loading = false
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情
        getDetails({ 'cardSaleNo': this.currentRow.cardSaleNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            // this.formShow = true
            this.currentComponent = 'OmsCompForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'LPK_XS' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'OmsCompForm'
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
              item.cardSaleNo = data.Req.cardSaleNo
            })
          }
          data.saleReq = data.Req

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
              item.cardSaleNo = data.Req.cardSaleNo
            })
          }
          data.saleReq = data.Req

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
    },
    addByList(type, prop, if_else = null) {
      if (if_else) { // 点选输入框有无文字内容
        this.selectByListSingle = !!if_else.value
        this.insertIndex = if_else.index
      }
      this.dialog_component = prop

      this.orderSelectShow = true
    },
    addByOrder(type, prop, if_else = null) {
      if (if_else) { // 点选输入框有无文字内容
        this.selectByListSingle = !!if_else.value
        this.insertIndex = if_else.index
      }
      this.dialog_component = prop

      this.orderSelectShow = true
    },
    selectOk() {
      this.dialogLoading = true
      console.log('this.selectItem', this.selectItem)
      // const cardNoList = this.$refs.Comp.$refs.Table.form.details.map(item => item.cardNo)
      if (this.selectItem.type === 'order') { // 单据导入
        manageOrderDetails({ 'cardSaleNo': this.selectItem.data[0].cardSaleNo }).then(res => {
          if (res.code === 200 && res.data.length > 0) {
            const temp = res.data.filter(item => (!this.cardNoList.includes(item.cardNo) && item.state === '3'))
            const temp_key_value = Object.values(this.$refs.Comp.$refs.Table.form.details[this.$refs.Comp.$refs.Table.form.details.length - 1]).map(item => typeof item === 'boolean' ? '' : item)
            if (temp_key_value.every(item => (item === ''))) { // 最后一项为空
              this.$refs.Comp.$refs.Table.form.details.insert(this.$refs.Comp.$refs.Table.form.details.length - 1, ...temp)
              if (this.$refs.Comp.$refs.Table.form.details.length > 1) {
                this.$refs.Comp.$refs.Table.form.details.splice(-1, 1)
              }
            } else {
              this.$refs.Comp.$refs.Table.form.details.push(...temp)
            }
            this.dialog_component = ''
            this.$message.success(`已成功添加${temp.length}条数据`)
            this.orderSelectShow = false
          } else if (res.data.length === 0) {
            this.$message.error('单据中无数据')
          } else {
            this.$message.error('网络错误，请重试')
          }
        }).catch(() => {
          this.$message.error('网络错误，请重试:errorCode')
        }).finally(() => {
          this.dialogLoading = false
        })
      } else if (this.selectItem.type === 'list') { // id导入
        if (this.selectByListSingle) {
          if (this.selectItem.data.filter(item => this.cardNoList.includes(item.cardNo)).length > 0) {
            this.$message.error(`已存在所选数据`)
            this.dialogLoading = false
            return
          }
          this.$set(this.$refs.Comp.$refs.Table.form.details, this.insertIndex, this.selectItem.data[0])
          this.dialog_component = ''
          this.$message.success(`已成功更新1条数据`)
        } else {
          const temp = this.selectItem.data.filter(item => !this.cardNoList.includes(item.cardNo))
          this.$refs.Comp.$refs.Table.form.details.insert(this.insertIndex, ...temp)
          this.dialog_component = ''
          this.$message.success(`已成功添加${temp.length}条数据`)
        }
        this.dialogLoading = false
        this.orderSelectShow = false
      }
    },
    deleteDetail() {
      return new Promise(resolve => {
        resolve(true)
      })
    }
  }
}
</script>
<style scoped>
</style>
