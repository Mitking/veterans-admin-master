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
        :detail_show="detailFormShow"
        :form-bottons="form_bottons"
        v-bind="$attrs"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
    <!-- 详情弹窗 -->
    <el-dialog
      class="my-class"
      title="单据详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'OmsForm'"
        :show="detailFormShow?'OmsForm':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :is_child="$attrs.is_child"
        :add_arr="[]"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/oms/fin/supplierfee'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import OmsForm from '@/views/oms/components/OmsForm'
import Order from './supplierfee'
import dayjs from 'dayjs'
export default {
  name: 'SupplierFeeIndex',
  components: { OmsCompForm, Order, OmsForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detailFormShow: false,
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finSupplierFee:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '费用单号', prop: 'supplierFeeNo', width: 250, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '费用日期', prop: 'busDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '供应商', prop: 'supplier', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '供应商', prop: 'supplier', show: true, click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, detailShow: false, addFatherProp: 'Req', tabHidden: true,
          rule: [{ required: true, message: '供应商不能为空', trigger: 'change' }] },
        { title: '费用金额', prop: 'totalFee', width: 100, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['feeAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', show: true, width: 100, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '供应商费用单号', prop: 'supplierFeeNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '业务类别', prop: 'feeCategory', show: false, type: 'select', selectData: 'business_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs', selectChangeFunc: this.feeAmountDealFn,
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '业务类型', prop: 'businessType', show: false, type: 'select', selectData: 'business_cate', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true,
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '费用名称', prop: 'feeNameId', firstValue: 'businessType', lastValue: 'feeNameId', show: false, tableWidth: 300, type: 'FeeList', selectData: 'feeSelectListLast', fatherPropName: 'assoProjectList', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '费用说明', prop: 'feeExplain', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '参与人', prop: 'participant', show: false, type: 'text', propFromPageName: 'participant', click: 'addItems', windowName: 'User', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        // { title: '参与人', width: 150, prop: 'participant', show: true, type: 'text', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'Req' },
        { title: '费用金额', prop: 'feeAmount', show: false, type: 'PRICE', float: { minus: true, max: 999999 }, inputFunc: this.feeAmountDealFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空或0', trigger: 'change' }] },
        // { title: '发生时间', prop: 'whenTime', show: false, type: 'date', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', tableWidth: 300, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
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
    feeAmountDealFn(row) { // 正负数处理
      if (row.feeCategory === '2' && Number(row.feeAmountShow) > 0) { // 应付
        row.feeAmountShow = '-' + row.feeAmountShow
      } else if (row.feeCategory === '1' && Number(row.feeAmountShow) < 0) { // 应收
        row.feeAmountShow = row.feeAmountShow.substr(1)
      }
      row.feeAmount = this.yuan2fen(row.feeAmountShow)
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'supplierFeeNo': this.currentRow.supplierFeeNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            if (this.$attrs.is_child) { // 选单时弹窗展示详情
              this.detailFormShow = true
            } else {
              this.currentComponent = 'OmsCompForm'
            }
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'CW_GY_FY' }).then(res => {
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
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.supplierFeeNo = data.Req.supplierFeeNo
            })
          }
          data.supplierFeeReq = data.Req
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
              item.supplierFeeNo = data.Req.supplierFeeNo
            })
          }
          data.supplierFeeReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.supplierFeeNo}」中的项目, 是否继续?`, '提示', {
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
