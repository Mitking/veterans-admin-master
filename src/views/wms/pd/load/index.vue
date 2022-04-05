<template>
  <div>
    <keep-alive :max="2" exclude="WmsPdLoadForm">
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
        :details_fee="detailsFee"
        :details_destination="destination"
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
//, ,
import { addOrSaveOrder, review, getStoNumber, getDetail, getLoadFeeList, loadFeeSave } from '@/api/wms/pdload'
import WmsForm from '@/views/wms/components/WmsPdLoadForm'
import Order from './load'
export default {
  name: 'LoadIndex',
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
        { title: '装车单号', prop: 'pdLoadCarNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '车辆调度单号', prop: 'vehicleSchedulOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '车型', prop: 'carType', show: true, type: 'select', selectData: 'CAR_TYPE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '司机', prop: 'driver', show: true, type: 'text', selectData: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '电话', prop: 'phone', show: true, type: 'text', selectData: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '车牌号', prop: 'carNumber', show: true, type: 'text', selectData: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: 'GPS编码', prop: 'gpsCode', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '装车时间', prop: 'pdLoadCarTime', show: true, type: 'time', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '发车时间', prop: 'startTime', show: true, type: 'time', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '总金额', prop: 'totalAmount', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '总费用', prop: 'totalFee', placeholder: '系统计算', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商名', prop: 'supplierName', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '装车数量', prop: 'loadNum', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '装车件数', prop: 'loadPiecesNum', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '装车单号', prop: 'pdLoadCarNo', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'productName', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单皮重', prop: 'singleTareWeight', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '总皮重', prop: 'tareWeight', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        { title: '主键', prop: 'id', show: false, formShow: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },
        { title: '路线ID', prop: 'routeId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },
        { title: '城市', prop: 'city', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },
        { title: '地址', prop: 'addr', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },
        { title: '纬度', prop: 'lat', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },
        { title: '经度', prop: 'lng', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },
        { title: '路径索引', prop: 'routeIndex', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'destination' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'loadFee', tableHidden: true },
        // { title: '装车单号', prop: 'pdLoadCarNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'loadFee', tableHidden: true },
        { title: '装车费用类型', prop: 'loadCarFeeType', show: false, type: 'select', selectData: 'load_car_fee_type', editShow: true, detailShow: true, addFatherProp: 'loadFee', rule: [{ required: true, message: '费用类型必填', trigger: 'blur' }] },
        { title: '金额', prop: 'amount', summary: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'loadFee' },
        { title: '装车费用描述', prop: 'loadCarFeeDescribe', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'loadFee' }

      ],
      details: [], // 详细数据
      detailsFee: [], // 详细数据
      destination: {}
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
    openModel(operateItem = {}) { // 添加、修改、详情      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        Promise.all([getDetail({ 'id': this.currentRow.id }), getLoadFeeList({ pdLoadCarNo: this.currentRow.pdLoadCarNo })]).then(res => {
          if (res[0].code === 200) {
            this.details = res[0].data.products
            // this.destination = res[0].data.destination
            this.destination = {}
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
          if (res[1].code === 200) {
            this.detailsFee = res[1].data
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
          if (res[0].code === 200 && res[1].code === 200) {
            this.currentComponent = 'WmsForm'
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        this.detailsFee = []
        getStoNumber({ type: 'WLZC' }).then(res => {
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
              item.pdLoadCarNo = data.Req.pdLoadCarNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []
          // const fee_temp = this.deepClone(data.loadCarFees)
          delete data.loadCarFees

          Promise.all([addOrSaveOrder(data)])
            .then(res => {
              this.message(res[0])
              // this.message(res[1])
              if (res[0].code === 200) {
                this.currentComponent = 'Order'
              }
            }).catch(() => {
              this.loading = false
              this.$message.error('操作失败')
            })
          break
        case 'edit': // 修改
          {
            if (data.detailReqs.length > 0) {
              data.detailReqs.map(item => {
                item.id = item.id || null
                item.pdLoadCarNo = data.Req.pdLoadCarNo
              })
            }
            data.details = data.detailReqs
            delete data.detailReqs
            data = Object.assign(data, data.Req)
            delete data.Req
            data.deleteDetails = deleteDetails
            const fee_temp = this.deepClone(data.loadCarFees)
            fee_temp.map(item => {
              item.id = item.id || null
              item.deleted = false
            })
            delete data.loadCarFees

            Promise.all([addOrSaveOrder(data), loadFeeSave({ pdLoadCarNo: data.pdLoadCarNo, loadCarFees: fee_temp })])
              .then(res => {
                this.message(res[0])
                this.message(res[1])
                if (res[0].code === 200 && res[1].code === 200) {
                  this.currentComponent = 'Order'
                }
              }).catch(() => {
                this.loading = false
                this.$message.error('操作失败')
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('pdLoadCarNo', this.table_data_arr)}「${item.pdLoadCarNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
