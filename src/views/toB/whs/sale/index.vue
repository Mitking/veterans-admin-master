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
        v-bind="$attrs"
        @formChange="formData=$event"
        @tabDateChange="Mixin_tabDate=$event"
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
        v-on="$listeners"
      />
    </keep-alive>
    <el-dialog
      class="my-class"
      title="详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'WmsForm'"
        :show="detailFormShow?'WmsForm':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :is_child="$attrs.is_child"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, orderReviewer, orderNo, getDetails } from '@/api/tob/whssale'
import WmsForm from '@/views/toB/components/WmsCompForm'
import Order from './sale'
import dayjs from 'dayjs'
export default {
  name: 'WhsSaleIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && !this.Mixin_tabDate[index].whsCnt) {
        callback(new Error('个数必填'))
      } else {
        callback()
      }
    }
    return {
      detailFormShow: false,
      formData: { relevantNo: '' },
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:consignmentShipment:update:review'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '批发单号', prop: 'whsOrderNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        { title: '销售日期', prop: 'saleDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '组织', prop: 'whsOrgId', show: true, tabHidden: true, defaultValue: [0, 3].includes(this.$store.getters.accountType) ? '' : this.$store.getters.orgId, width: '300px', type: 'select', readonly: false, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, addFatherProp: 'Req', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '销售门店', prop: 'whsStoreId', show: true, type: 'select', defaultValue: this.$store.getters.storeId, width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'whsOrgId', fatherPropName: 'orgId', readonly: this.$store.getters.accountType === 1, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '销售门店不能为空', trigger: 'change' }] },
        { title: '销售仓库', prop: 'whsStorageId', show: true, type: 'select', width: 200, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, readonly: false, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'whsStoreId', fatherPropName: 'storeId',
          rule: [{ required: true, message: '销售仓库不能为空', trigger: 'change' }] },
        { title: '批发商', width: 150, prop: 'whsId', propFromPageName: 'whsName', show: true, click: 'addItems', windowName: 'Customer', type: 'selectFromPage', formProData: { typeName: '批发商' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '代销商不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'totalAmount', width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['whsAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '退货金额', prop: 'whsRefundAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品ID(隐藏)', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '门店商品ID(隐藏)', prop: 'storeProductId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重(隐藏)', prop: 'whetherCount', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { stopSale: 0, whsStoreId: '', whsStorageId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { stopSale: 0, whsStoreId: '', whsStorageId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: 120, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'unitId', show: false, tabWidth: 100, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '批发价', prop: 'whsPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为0', trigger: 'change' }] },
        { title: '批发数量', prop: 'whsNumber', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为0', trigger: 'change' }] },
        { title: '金额', prop: 'whsAmount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['whsPrice', 'whsNumber'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '个数', prop: 'whsCnt', show: false, placeholder: '计数商品必填', type: 'Number', fn_disabled: (row) => !row.whetherCount, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: countCheck, trigger: 'change' }] },
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
    // 'formData': {
    //   handler(n) {
    //     this.mixin_arr_edit_by_prop(this.table_data_arr, 'personId', 'readonly', !!n.relevantNo.length)
    //   },
    //   deep: true,
    //   immediate: true
    // }
    'Mixin_tabDate': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'whsOrgId', 'readonly', n.some(item => item.goodsCode !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'whsStoreId', 'readonly', n.some(item => item.goodsCode !== '') || this.$store.getters.accountType === 1)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'whsStorageId', 'readonly', n.some(item => item.goodsCode !== ''))
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
            this.details = res.data.details
            if (this.$attrs.is_child) { // 选品弹窗展示详情
              this.detailFormShow = true
            } else {
              this.currentComponent = 'WmsForm'
            }
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
        orderNo().then(res => {
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
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'review': // 审核
          this.review()
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            // let amountTemp = 0
            data.detailReqs.map(item => {
              item.id = null
              item.whsOrderNo = data.Req.whsOrderNo
            })
          }
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteIds = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrSaveOrder(data).then(res => {
                this.review(res.data, true)
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
              item.whsOrderNo = data.Req.whsOrderNo
            })
          }
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteIds = deleteDetails

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
    changeComputed(row) {
      row.amount = this.DECIMAL(row.whsPrice || '0').mul(row.whsNumber || '0').mul('0.001')
      row.amountShow = this.fen2yuan(row.amount)
    },
    changeDiffNumFcurs(row) {
      if (!row.goodsName) {
        return this.$message.info('请先选择商品')
      }
      if (!row.amount || !row.whsPrice) {
        return
      }
      row.whsNumber = this.DECIMAL(row.amount).div(row.whsPrice).mul('1000').toNumber().toFixed(0)
      row.whsNumberWeightShow = this.g2kg(row.whsNumber)
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
      orderReviewer({ 'ids': [id || this.currentRow.id] }).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('whsOrderNo', this.table_data_arr)}「${this.currentRow.whsOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
