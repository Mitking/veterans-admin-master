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
        :add_arr="[]"
        :detail_table_buttons="[]"
        :form-bottons="form_bottons"
        @formChange="formData=$event"
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
import { addOrSaveOrder, orderReviewer, orderNo, getDetails, saveOrder, getFeeTmpList } from '@/api/tob/agencysettlement'
import WmsForm from '@/views/toB/components/WmsCompForm'
import Order from './settlement'
// import dayjs from 'dayjs'
export default {
  name: 'AgencySettlementIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      formData: { relevantNo: '' },
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:consignmentShipment:update:review'] }
      ],
      table_data_arr_temp: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '结算单号', prop: 'settlementNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        // { title: '结算日期', prop: 'returnDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '组织', prop: 'orgId', show: true, tabHidden: true, defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', readonly: false, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, addFatherProp: 'Req', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', propName: 'storeName', show: true, type: 'select', defaultValue: this.$store.getters.storeId, width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: this.$store.getters.accountType === 1, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '结算门店不能为空', trigger: 'change' }] },
        { title: '代销商', width: 150, formWidth: '20%', prop: 'customerId', propFromPageName: 'customerName', formProData: { typeName: '代销商' }, show: true, click: 'addItems', windowName: 'Customer', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '代销商不能为空', trigger: 'change' }] },
        { title: '进账金额', prop: 'incomingAmount', tipMsg: '销售总金额-代销佣金-费用总金额-退货总金额', width: 120, show: true, type: 'PRICE_FORM_AUTOMATIC', design: this.auto_incomingAmount, arg: ['salesAmount', 'commission', 'cost', 'returnAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '销售总金额', prop: 'salesAmount', tabHidden: true, width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['salesAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '总代销佣金', prop: 'commission', width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['commission'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '费用总金额', prop: 'cost', tabHidden: true, width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_fee_amount, arg: [], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '退货总金额', prop: 'returnAmount', tabHidden: true, width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['returnTotalAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'makerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPersonName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'auditTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '出货单号', tabWidth: 220, prop: 'relationNo', show: false, placeholder: '请选择', click: 'addItems', windowName: 'AgencyShipmentIndex', formProData: { customerId: '', auditStatus: '3', isSettlement: 1, storeId: '', orgId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'totalAmount', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '销售金额', prop: 'salesAmount', show: false, type: 'PRICE', defaultValue: '0', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货金额', prop: 'returnTotalAmount', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '代销费率', prop: 'rate', show: false, type: 'RATE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '佣金', prop: 'commission', tipMsg: '销售金额x代销费率', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_commission, arg: ['salesAmountShow', 'rate'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '费用数组', prop: 'cost', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: 120, addFatherProp: 'detailReqs' },
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
  watch: {
    // new this.DECIMAL(item.totalAmount).mul(item.rate).mul('0.000001').toNumber()
    // 'formData': {
    //   handler(n) {
    //     this.mixin_arr_edit_by_prop(this.table_data_arr, 'personId', 'readonly', !!n.relevantNo.length)
    //   },
    //   deep: true,
    //   immediate: true
    // }
    'Mixin_tabDate': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', n.some(item => item.relationNo !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', n.some(item => item.relationNo !== '') || this.$store.getters.accountType === 1)
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    transformvalFn(selected, n, un_select) {
      return this.MergeArray(selected, n.map(item => item.id)).filter(itemF => !un_select.map((u) => u.id).includes(itemF))
    },
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.table_data_arr = this.deepClone(this.table_data_arr_temp)
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    auto_incomingAmount(a, b, c, d) {
      return new this.DECIMAL(a || 0).sub(b || 0).sub(c || 0).sub(d || 0).toNumber()
    },
    async openModel(operateItem = {}) { // 添加、修改、详情
      this.table_data_arr_temp = this.deepClone(this.table_data_arr)
      this.operateItem = operateItem
      operateItem.loading = true
      const costListTemp = []
      let arrTemp = []
      const { data: FeeTmpList } = await getFeeTmpList({}).catch(() => ({ data: 300 }))
      if (FeeTmpList === 300) {
        this.operateItem.loading = false
        return this.$message.info('获取模板失败!')
      }
      FeeTmpList.map(item => {
        costListTemp.push({
          id: null,
          feeName: item.feeName,
          feeId: item.id,
          feePrice: '0'
        })
      })

      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'id': this.currentRow.id }).then(res => {
          if (res.code === 200) {
            this.currentRow = res.data.pageRes
            this.details = res.data.detailsRes
            if (this.details.length > 0) {
              arrTemp = this.details[0].costList.map(item => ({
                title: item.feeName,
                prop: 'fee_' + item.feeId,
                show: false,
                type: 'costList',
                id: item.id,
                feeId: item.feeId,
                editShow: true,
                detailShow: true,
                defaultValue: '0',
                addFatherProp: 'detailReqs'
              }))
            } else { // 长度为零
              FeeTmpList.map(item => {
                arrTemp.push({
                  title: item.feeName,
                  prop: 'fee_' + item.id,
                  show: false,
                  type: 'costList',
                  id: null,
                  feeId: item.id,
                  defaultValue: '0',
                  editShow: true,
                  detailShow: true,
                  addFatherProp: 'detailReqs'
                })
              })
              this.details = [{ costList: costListTemp }]
            }
            this.table_data_arr.insert(this.table_data_arr.length - 1, ...arrTemp)
            this.currentComponent = 'WmsForm'
            this.operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            this.operateItem.loading = false
          }
        }).finally(() => {
          this.operateItem.loading = false
        })
      } else if (this.operateItem.prop === 'insert') { // 新增
        this.details = []
        const res = await orderNo({ type: 'DXJS' })
        this.table_data_arr[1].defaultValue = res.data
        FeeTmpList.map(item => {
          arrTemp.push({
            title: item.feeName,
            prop: 'fee_' + item.id,
            show: false,
            type: 'costList',
            id: null,
            feeId: item.id,
            defaultValue: '0',
            editShow: true,
            detailShow: true,
            addFatherProp: 'detailReqs'
          })
        })
        this.details = [{ costList: costListTemp }]
        this.table_data_arr.insert(this.table_data_arr.length - 1, ...arrTemp)
        this.currentComponent = 'WmsForm'
        this.operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.table_data_arr = this.deepClone(this.table_data_arr_temp)
          this.currentComponent = 'Order'
          break
        case 'review': // 审核
          this.review()
          break
        case 'insert': // 新增
          data.Req.id = null
          // data.Req.relevantNo = data.Req.relevantNo.length ? data.Req.relevantNo.toString() : ''
          if (data.detailReqs.length > 0) {
            // let amountTemp = 0
            data.detailReqs.map(item => {
              item.id = null
              item.settlementNo = data.Req.settlementNo
            })
          }
          data.settlementReq = data.Req
          delete data.Req
          data.orgId = data.settlementReq.orgId
          // data = Object.assign(data, data.Req)
          data.deleteIds = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗?`, '提示', {
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
          console.log(data)
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.settlementNo = data.Req.settlementNo
              item.settlementId = data.Req.id
            })
          }
          data.settlementReq = data.Req
          data.orgId = data.settlementReq.orgId
          delete data.Req
          data.deleteIds = deleteDetails

          saveOrder(data).then(res => {
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
    changeComputed(row) {
      row.amount = this.DECIMAL(row.consignmentPrice || '0').mul(row.consignmentQuantity || '0').mul('0.001')
      row.amountShow = this.fen2yuan(row.amount)
    },
    changeDiffNumFcurs(row) {
      if (!row.goodsName) {
        return this.$message.info('请先选择商品')
      }
      if (!row.amount || !row.consignmentPrice) {
        return
      }
      row.consignmentQuantity = this.DECIMAL(row.amount).div(row.consignmentPrice).mul('1000').toNumber().toFixed(0)
      row.consignmentQuantityWeightShow = this.g2kg(row.consignmentQuantity)
    },
    review(id, isSure = false) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗?`, '提示', {
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
      orderReviewer({ 'ids': [id || this.currentRow.id], auditStatus: '3' }).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('settlementNo', this.table_data_arr)}「${this.currentRow.settlementNo}」中的「${item.relationNo}」, 是否继续?`, '提示', {
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
