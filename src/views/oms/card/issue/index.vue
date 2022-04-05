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
        v-bind="$attrs"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event"
        @formChange="mixin_form=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @addByOrder="addByOrder"
        @deleteDetail="deleteDetail"
        @review="review"
      />
    </keep-alive>
    <el-dialog
      title="批量添加"
      :visible.sync="orderSelectShow"
      fullscreen
      :modal-append-to-body="false"
    >
      <SelectByOrder v-if="dialog_component==='button_adds'" ref="refSelect" :search_lock="{state:'0'}" :single="true" :child="true" @selectedRows="selectItem=$event" />
      <SelectByList v-if="dialog_component==='cardNo'" ref="refSelect" :search_lock="{state:'0'}" :selectlist="cardNoList" :single="selectByListSingle" child="true" @selectedRows="selectItem=$event" />
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="orderSelectShow = false">取 消</el-button>
        <el-button :loading="dialogLoading" type="primary" :disabled="!selectItem.data.length" @click="selectOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import SelectByOrder from '../manage/index'
import SelectByList from '../getcardpage/getcardpage'
import { addOrder, getSendNumber, getDetails, reviews, updateOrder } from '@/api/oms/card/issue'
import { getDetails as manageOrderDetails } from '@/api/oms/card/manage'
import OmsCompForm from '@/views/oms/components/OmsCardComp'
import Order from './issue'
import dayjs from 'dayjs'
export default {
  name: 'CardIssueIndex',
  components: { OmsCompForm, Order, SelectByOrder, SelectByList },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '清空列表', show: true, prop: 'clearList' },
        { title: '追 加', show: true, prop: 'addItem' },
        { title: '批量下发', show: true, prop: 'addListIssue' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:cardIssue:review'] }
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
        { title: '下发单号', prop: 'cardIssueNo', show: true, width: 230, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '下发日期', width: 150, prop: 'issueDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '下发日期不能为空', trigger: 'change' }] },
        { title: '下发组织', width: 200, prop: 'orgId', show: true, type: 'select', defaultValue: this.$store.getters.orgId, readonly: false, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '组织不能为空', trigger: 'change' }] },
        { title: '下发门店', width: 200, prop: 'storeId', show: true, type: 'select', defaultValue: this.$store.getters.storeId, readonly: false, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '下发门店不能为空', trigger: 'change' }] },
        { title: '起始卡面号', prop: 'originCardNo', width: 150, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '结束卡面号', prop: 'endCardNo', width: 150, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '下发数量', width: 100, prop: 'count', show: true, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '总面值', width: 100, prop: 'totalAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, placeholder: '系统自动计算', addFatherProp: 'Req', readonly: true },
        { title: '领取人', width: 150, prop: 'recipientsId', placeholder: '请选择', propFromPageName: 'recipients', show: false, type: 'selectFromPage', click: 'addItems', windowName: 'User', editShow: true, detailShow: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '领取人不能为空', trigger: 'change' }] },
        { title: '领取人', width: 150, prop: 'recipients', show: true, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', width: 100, prop: 'auditStatus', show: true, readonly: true, defaultValue: '1', type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', width: 150, prop: 'reviewer', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', width: 160, prop: 'reviewTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '发卡单号', prop: 'cardIssueNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '卡面号', prop: 'faceNo', show: false, click: 'addItems', windowName: 'GetCardPageIndex', formProData: this.formProData(), type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false,
          rule: [{ required: true, message: '请选择卡号', trigger: 'change' }] },
        { title: '卡号', prop: 'cardNo', show: false, click: 'addItems', windowName: 'GetCardPageIndex', formProData: { orgId: '', storeId: '', state: '6' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true,
          rule: [{ required: true, message: '请选择卡号', trigger: 'change' }] },
        // { title: '卡状态', prop: 'state', defaultValue: '-', show: false, type: 'select', selectData: 'card_status', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '卡面值', prop: 'amount', defaultValue: '-', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '折扣金额', prop: 'discount', show: false, type: 'PRICE', readonly: true, defaultValue: 0, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '销售价', prop: 'salePrice', show: false, type: 'PRICE', readonly: true, arg: ['amount', 'discount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '充值金额', prop: 'balance', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
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
  watch: {},
  created() {},
  methods: {
    formProData() {
      // return ({ state: '6', orgId: this.$store.getters.orgId, storeId: this.$store.getters.storeId })
      if (this.$store.getters.accountType === 3) { // 账套级别
        return ({ state: '7' })
      } else if (this.$store.getters.accountType === 2) { // 组织级别
        return ({ state: '7', orgId: this.$store.getters.orgId })
      } else if (this.$store.getters.accountType === 1) {
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
        getDetails({ 'cardIssueNo': this.currentRow.cardIssueNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            // this.formShow = true
            this.currentComponent = 'OmsCompForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        }).finally(() => {
          operateItem.loading = false
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'LPK_XF' }).then(res => {
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
              item.cardIssueNo = data.Req.cardIssueNo
            })
          }
          data.issueReq = data.Req

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
              item.cardIssueNo = data.Req.cardIssueNo
            })
          }
          data.issueReq = data.Req
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
    addByOrder(type, prop, if_else = null) {
      if (if_else) {
        this.selectByListSingle = !!if_else.value
        this.insertIndex = if_else.index
      }
      this.dialog_component = prop
      this.orderSelectShow = true
    },
    selectOk() {
      this.dialogLoading = true
      // const cardNoList = this.$refs.Comp.$refs.Table.form.details.map(item => item.cardNo)
      if (this.selectItem.type === 'order') { // 单据导入
        manageOrderDetails({ 'cardManageNo': this.selectItem.data[0].cardManageNo }).then(res => {
          if (res.code === 200 && res.data.length > 0) {
            const temp = res.data.filter(item => (!this.cardNoList.includes(item.cardNo) && item.state === '0'))
            // const temp = res.data.filter(item => !this.cardNoList.includes(item.cardNo))
            const temp_key_value = Object.values(this.$refs.Comp.$refs.Table.form.details[this.$refs.Comp.$refs.Table.form.details.length - 1]).map(item => typeof item === 'boolean' ? '' : item)
            if (temp_key_value.every(item => (item === ''))) { // 最后一项为空
              this.$refs.Comp.$refs.Table.form.details.insert(this.$refs.Comp.$refs.Table.form.details.length - 1, ...temp)
              if (this.$refs.Comp.$refs.Table.form.details.length > 1) {
                this.$refs.Comp.$refs.Table.form.details.splice(-1, 1)
              }
              // this.$refs.Comp.$refs.Table.form.details.splice(-1, 1)
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
          this.$message.error('网络错误，请重试')
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
