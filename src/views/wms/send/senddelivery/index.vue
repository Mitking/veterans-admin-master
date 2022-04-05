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
        :edit-detail-disable="true"
        v-bind="$attrs"
        v-on="$listeners"
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
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/wms/senddelivery'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './senddelivery'
export default {
  name: 'SendDeliveryIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '配送单号', prop: 'deliveryNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '调出单号', prop: 'callNo', show: true, type: 'text', editShow: true, detailShow: false, addFatherProp: 'other', readonly: true },
        { title: '审核状态', prop: 'auditStatus', show: true, type: 'selectState', selectData: 'audit_status', defaultValue: '1', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'maker', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人id', prop: 'makerId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人id', prop: 'auditPersonId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'makeTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'auditTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '送货日期', prop: 'deliveryDate', show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'receiptStore	', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'other' },
        // { title: '收货仓库id', prop: 'receiptStockId',show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货仓库', prop: 'receiptStock	', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'other' },
        // { title: '收货门店id', prop: 'receiptStoreId', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '件数', prop: 'count', readonly: true, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '金额', prop: 'amount', readonly: true, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '司机id', prop: 'driverId', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '司机', prop: 'driver', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '车牌号', prop: 'plateNumber', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '配送单号', prop: 'deliveryNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '基本单位', prop: 'weightType', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '申请数量', prop: 'applyNumber', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', rule: [{ required: true, message: '请输入申请个数', trigger: 'blur' }] },
        { title: '调出数量', prop: 'callNumber', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '金额', prop: 'amount', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '个数', prop: 'count', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
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
        getDetails({ 'deliveryNo': this.currentRow.deliveryNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            // this.formShow = true
            this.currentComponent = 'WmsForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ sendType: 'PSPS' }).then(res => {
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
              item.deliveryNo = data.Req.deliveryNo
            })
          }
          data.sendDeliveryReq = data.Req
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
              item.deliveryNo = data.Req.deliveryNo
            })
          }
          data.sendDeliveryReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.deliveryNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
