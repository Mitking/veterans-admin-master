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
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purreceive'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './receive'
export default {
  name: 'ReceiveIndex',
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
        { title: '收货单号', prop: 'receiveOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '收货仓库ID', prop: 'stockId', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货仓库', prop: 'stockName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货门店ID', prop: 'storeId', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'storeName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货日期', prop: 'receiveDate', show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '单据金额', prop: 'money', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '采购员', prop: 'personName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '单据类型', prop: 'type', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '供应商名', prop: 'supplierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '供应商ID', prop: 'supplierId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '采购单位名称', prop: 'purUnitName', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '个数', prop: 'number', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购数量', prop: 'purNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货数量', prop: 'recevieNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货件数', prop: 'receviePiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货皮重', prop: 'recevieTareWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购件数', prop: 'purPiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货毛重', prop: 'recevieWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '皮重', prop: 'purTareWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'purUnitPrice', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '总毛重', prop: 'purWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '金额', prop: 'amount', show: false, type: 'text', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
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
        // getDetails({ 'receiveOrderNo': this.currentRow.receiveOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.purInspectionDetailQueryResList
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
        orderNo({ type: 'CGSH' }).then(res => {
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
              item.receiveOrderNo = data.Req.receiveOrderNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []

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
        case 'edit': // 修改
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.receiveOrderNo = data.Req.receiveOrderNo
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('receiveOrderNo', this.table_data_arr)}「${item.receiveOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
