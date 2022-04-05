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
import { addOrSaveOrder, review, orderNo, generateOrder } from '@/api/wms/purdiff'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './diff'
export default {
  name: 'DiffPurIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 999 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:diff:order:reviewer'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '差异单号', prop: 'purDiffOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '收货日期', prop: 'receiveDate', show: true, type: 'text', width: 160, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '收货门店', prop: 'storeId', show: true, type: 'select', width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: true, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货仓库', prop: 'stockId', show: true, type: 'select', width: 200, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, readonly: true, editShow: true, detailShow: false, addFatherProp: 'Req', fatherProp: 'storeId' },
        { title: '差异类型', prop: 'diffType', show: true, type: 'select', width: 200, selectData: 'diff_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '采购员', prop: 'personName', show: true, type: 'text', width: 160, readonly: true, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '差异金额', prop: 'amount', show: true, type: 'PRICE', width: 160, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '采购单位', prop: 'purUnit', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购单位名称', prop: 'purUnitName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req', readonly: true },
        // { title: '收货仓库', prop: 'stockName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '供应商名', prop: 'supplierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '相关单号', prop: 'relevantNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true, tabWidth: 300 },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '供应商', prop: 'supplierName', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品规格', prop: 'spec', show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, readonly: true, addFatherProp: 'detailReqs' },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        // { title: '采购数量', prop: 'purNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        // { title: '收货数量', prop: 'receiveNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '差异数量', prop: 'diffNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '单价', prop: 'price', show: false, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '差异金额', prop: 'amount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '处理方式', prop: 'billType', show: false, type: 'select', selectData: 'diff_deal_type', selectValueType: 'string', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
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
        // getDetails({ 'purDiffOrderNo': this.currentRow.purDiffOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.details
        // this.formShow = true
        this.currentComponent = 'WmsForm'
        operateItem.loading = false
        // } else {
        //   this.$message.error('获取失败')
        //   operateItem.loading = false
        // }
        // })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo({ type: 'CGCY' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'review': // 审核
          this.review()
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.purDiffOrderNo = data.Req.purDiffOrderNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrSaveOrder(data).then(res => {
                this.review(res.data.id, true)
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
          addOrSaveOrder(data).then(res => {
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
              item.purDiffOrderNo = data.Req.purDiffOrderNo
            })
          }

          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data.Req, data)
          delete data.Req
          // delete data.detailReqs
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
        generateOrder({ purDiffOrderNos: [this.currentRow.purDiffOrderNo] }).then(res => {
          this.message(res)
        }).finally(() => {
          this.loading = false
        })
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purDiffOrderNo', this.table_data_arr)}「${item.purDiffOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
