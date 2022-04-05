<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
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
        :add_arr="[]"
        :detail_table_buttons="[]"
        :form-bottons="form_bottons"
        :edit-detail-some-disable="true"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// import { addOrder, deleteOrder, deleteDetails, , getPage, review, updateOrder, getStoNumber } from '@/api/wms/stockinvreport'
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/wms/account'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './account'
import dayjs from 'dayjs'
export default {
  name: 'AccountIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:on:account:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      tabDate: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '挂账单号', prop: 'onAccountOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '差异单号', prop: 'purDiffOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', tabWidth: 300, readonly: true },

        { title: '挂账日期', prop: 'onAccountDate', show: true, defaultValue: dayjs().format('YYYY-MM-DD'), type: 'date', width: 160, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '采购员', prop: 'purPerson', show: true, width: 160, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '采购员ID', prop: 'purPersonId', width: 160, show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'Req', readonly: true },
        { title: '总金额', prop: 'onAccountAmount', width: 160, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['onAccountAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '自动生成', prop: 'autoGenerate', width: 100, show: true, type: 'if_type', editShow: false, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '处理方式', prop: 'treatmentMethod', width: 100, show: true, readonly: true, defaultValue: '1', type: 'select', selectData: 'diff_deal_type', valToStr: true, selectValueType: 'string', editShow: true, detailShow: true, addFatherProp: 'Req',
        //   rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatu', width: 100, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '制单人', prop: 'creatorName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 160, show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '挂账单号', prop: 'onAccountOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '挂账数量', prop: 'onAccountNumQuantity', show: false, type: 'weight_number', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', show: false, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '挂账金额', prop: 'onAccountAmount', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '挂账件数', prop: 'onAccountPiecesNum', show: false, type: 'number', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '供应商', prop: 'supplierName', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
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
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'id': this.currentRow.id }).then(res => {
          if (res.code === 200) {
            this.details = res.data.detailList
            this.currentRow = Object.assign(this.currentRow, res.data)
            // this.formShow = true
            this.currentComponent = 'WmsForm'
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
        getSendNumber({ sendType: 'PSSQ' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsForm'
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
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.onAccountOrderNo = data.Req.onAccountOrderNo
            })
          }
          data.sendApplyReq = data.Req
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
          {
            if (data.detailReqs.length > 0) {
              data.detailReqs.map(item => {
                item.id = item.id === '' ? null : item.id
                item.onAccountOrderNo = data.Req.onAccountOrderNo
              })
            }
            const detailReqs = this.deepClone(data.detailReqs)
            data = data.Req
            data.purOnAccountDetails = detailReqs
            delete data.Req
            delete data.detailReqs
            updateOrder(data).then(res => {
              if (res.code === 200 && arg.review) {
                this.review(null, false)
                return
              }
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
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除单号「${item.onAccountOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // this.operateItem.loading = true
          deleteDetails({ ids: [item.id] }).then(res => {
            if (res.code === 200) {
              this.$success('操作成功')
            } else {
              this.$error(res.data)
            }
            resolve(true)
          }).catch(err => {
            throw err
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          resolve(false)
        })
      })
    }
  }
}
</script>
<style scoped>
</style>
