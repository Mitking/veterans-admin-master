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
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        @tabDateChange="Mixin_tabDate=$event"
        @deleteDetail="deleteDetail"
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
import { addOrSaveOrder, review, orderNo, getTaskSourceOrderNo } from '@/api/wms/purtask'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './task'
import dayjs from 'dayjs'
// import { deleteDetailById } from '@/api/wms/sendcall' pricePull
export default {
  name: 'TaskIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { ifTotalStock: true, orgId: 0 }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1, autoGenerate: false }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:task:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '任务单号', prop: 'purTaskNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '任务日期', prop: 'taskDate', width: 150, show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '任务日期不能为空', trigger: 'change' }] },
        { title: '任务金额', prop: 'amount', placeholder: '自动计算', width: 150, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatu', show: true, width: 100, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '审核状态', prop: 'auditStatuDes', width: 150, show: true, type: 'text', editShow: true, defaultValue: '暂存', detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '已生成采购订单', prop: 'generatePurOrder', width: 150, show: true, type: 'if_type', editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '已生成调度单', prop: 'generateSchedulOrder', width: 150, show: true, type: 'if_type', editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '自动生成', prop: 'autoGenerate', show: true, width: 100, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '订单来源', prop: 'orderFrom', show: false, type: 'orderFrom', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '采购任务编号', prop: 'purTaskNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '门店商品ID', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { orgId: 0, ifTotalStock: true, stopBuy: false }, show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        // { title: '商品ID', prop: 'productId', click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', click: 'addItems', tabWidth: 200, windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { orgId: 0, ifTotalStock: true, stopBuy: false }, show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', defaultValue: '-', readonly: true },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs', defaultValue: '-' },
        { title: '最近采购单价', prop: 'lastPurPrice', show: false, type: 'COST_PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', realProp: 'costPrice', show: false, type: 'COST_PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '需求数量', prop: 'needNum', show: false, type: 'weight_number', readonly: true, defaultValue: '0', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购数量', prop: 'number', show: false, editShow: true, placeholder: '手动录入', type: 'weight_number', detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }, { min: 0.001, transform: (v) => Number(v), type: 'number', message: '不能为0', trigger: 'change' }] },
        { title: '金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', placeholder: '自动计算', design: this.mixin_auto_amount, arg: ['price', 'number'], selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '采购员名', prop: 'purPersonName', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购员', prop: 'purPersonId', show: false, type: 'select', selectData: 'personListCG', selectOption: { label: 'surname', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
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
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      const auto = (['edit', 'detail'].includes(operateItem.prop) && this.currentRow.autoGenerate)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'needNum', 'editShow', auto)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'needNum', 'detailShow', auto)
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        this.details = this.currentRow.taskDetails
        if (auto) {
          getTaskSourceOrderNo({ 'taskNo': this.currentRow.purTaskNo }).then((res) => {
            const order_temp = res.data.demandNoList.join(',')
            this.mixin_arr_edit_by_prop(this.table_data_arr, 'orderFrom', 'defaultValue', order_temp)
            this.$set(this.currentRow, 'orderFrom', order_temp)

            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }).finally(() => {
            operateItem.loading = false
          })
        } else {
          this.$set(this.currentRow, 'orderFrom', false)

          this.currentComponent = 'WmsCompForm'
          operateItem.loading = false
        }
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo({ type: 'CGRW' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          if (arg.review) {
            this.review()
            return
          }
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.purTaskNo = data.Req.purTaskNo
              item.needNum = item.needNum || 0
            })
          }
          data.taskDetails = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req

          addOrSaveOrder(data).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id, data.purTaskNo)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          console.log(data.detailReqs)
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.purTaskNo = data.Req.purTaskNo
              item.needNum = item.needNum || 0
            })
          }
          data.taskDetails = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = deleteDetails
          addOrSaveOrder(data).then(res => {
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
    review(id = null, purTaskNo = null, isSure = null) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.review(id, purTaskNo, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          this.currentComponent = 'Order'
          this.loading = false
        }).finally(() => {
          this.loading = false
        })
        return
      }
      review({ 'details': [
        {
          'id': id || this.currentRow.id,
          'purTaskNo': purTaskNo || this.currentRow.purTaskNo
        }
      ] }).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purTaskNo', this.table_data_arr)}「${item.purTaskNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve(true)
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
