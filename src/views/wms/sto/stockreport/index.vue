<template>
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
        :edit-detail-some-disable="true"
        :form-bottons="form_bottons"
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
        @tipAddShow="tipAddShow"
      />
    </keep-alive>
    <el-dialog
      v-if="tip_add_show"
      :visible.sync="tip_add_show"
      title="盘点报告原因"
      width="750px"
    >
      <InvDiffReason :is_child="true" />
      <div slot="footer">
        <el-button type="primary" @click="tip_add_show = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, getStoNumber, review } from '@/api/wms/stockreport'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './stockreport'
import InvDiffReason from '../invdiffreason/index'
export default {
  name: 'StockReportIndex',
  components: { WmsCompForm, Order, InvDiffReason },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoInvReport:update:review'] }
      ],
      loading: false,
      tip_add_show: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据 propitemFn selectDataFn
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '盘点报告单号', prop: 'stoInvReportNo', width: 240, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '盘点单号', prop: 'stoInvNo', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '盘点日期', prop: 'invTime', width: 150, readonly: true, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '门店', prop: 'storeId', width: 200, readonly: true, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '仓库', prop: 'stockId', width: 200, readonly: true, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '盘点范围', prop: 'invRange', formItemWidth: 120, width: 150, readonly: true, show: true, type: 'select', selectData: 'inv_range', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '总金额', prop: 'amount', width: 100, readonly: true, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '差异金额', prop: 'totalDiffAmount', width: 100, readonly: true, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, readonly: true, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, readonly: true, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, readonly: true, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, readonly: true, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, readonly: true, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '盘点报告单号', prop: 'stoInvReportNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', readonly: true, show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', readonly: true, show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '盘点数量', prop: 'number', readonly: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '库存数量', prop: 'stockNumber', readonly: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异数量', prop: 'diffNumber', readonly: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异金额', prop: 'diffAmount', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '盘点个数', prop: 'count', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '库存个数', prop: 'stockCount', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异个数', prop: 'diffCount', readonly: true, show: false, type: 'text', selectData: 'loss_reason', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '原因', prop: 'reasonId', show: false, type: 'select', tipAddFn: this.tipAddShow, selectValueType: 'string', selectData: 'diff_reason', selectOption: { label: 'reason', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '原因', prop: 'reason', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
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
    tipAddShow() {
      this.tip_add_show = true
    },
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
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'stoInvReportNo': this.currentRow.stoInvReportNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            // this.formShow = true
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getStoNumber({ stoType: 'CC_PDBG' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
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
              item.stoInvReportNo = data.Req.stoInvReportNo
            })
          }
          data.invReportReq = data.Req
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
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.stoInvReportNo = data.Req.stoInvReportNo
            })
          }
          data.invReportReq = data.Req
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
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除单号「${item.stoInvReportNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
