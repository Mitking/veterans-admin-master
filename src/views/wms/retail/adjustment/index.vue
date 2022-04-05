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
        @exportFn="exportFn"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { review, getSendNumber, addOrSaveOrder, printAutoPriceDetails } from '@/api/wms/retailadjustment'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './adjustment'
export default {
  name: 'AdjustmentIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { ifTotalStock: true }}
        // { title: '打印', show: true, prop: null, click: 'addItem' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['price:adjustment:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '调价单号', prop: 'adjustmentOrderNo', placeholder: '系统生成', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: [0, 3].includes(this.$store.getters.accountType), tabHidden: true, tableHidden: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '失效后类型 ', width: 200, prop: 'invalidAdjustType', show: true, type: 'select', defaultValue: '1', selectData: 'invalid_adjust_type', editShow: true, detailShow: true, addFatherProp: 'Req',
        //   rule: [{ required: true, message: '价格类型不能为空', trigger: 'change' }] },
        { title: '调价门店', width: 200, prop: 'storeIds', show: true, type: 'storeIds', multiple: true, formWidth: '50%', formItemWidth: 350, defaultValue: this.$store.getters.accountType === 1 ? [this.$store.state.user.storeId] : [], readonly: [1].includes(this.$store.getters.accountType), selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '调价门店不能为空', trigger: 'change' }] },
        // { title: '采购单位名称', prop: 'purUnitName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req', readonly: true },
        // { title: '永久有效', width: 100, prop: 'permanentlyValid', show: true, defaultValue: false, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false },
        // { title: '生效日期', width: 150, prop: 'validDate', show: true, type: 'date', pickerOptions: { disabledDate: (time) => time.getTime() < (new Date().getTime() - 24 * 60 * 60 * 1000) }, editShow: true, detailShow: true, addFatherProp: 'Req',
        // rule: [{ required: true, message: '生效日期不能为空', trigger: 'change' }] },
        // { title: '失效日期', width: 150, prop: 'invalidDate', show: true, fa_show: { permanentlyValid: false }, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', pickerOptions: { disabledDate: (time) => time.getTime() < (new Date().getTime() - 24 * 60 * 60 * 1000) },
        // rule: [{ validator: this.invalidDateCheck, trigger: 'change' }] },
        // { title: '是否失效', width: 100, prop: 'invalidFlag', show: true, type: 'if_type', editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '审核状态', width: 100, prop: 'auditStatu', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        // { title: '核验金额', prop: 'purCheckMoney', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '操作人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', width: 150, prop: 'reviewerName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', width: 200, prop: 'reviewerTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商名', prop: 'supplierName', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '调价单号', prop: 'adjustmentOrderNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', placeholder: '请选择', show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, formProData: { goodsType: null }, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '门店商品Id', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品名', prop: 'goodsName', placeholder: '请选择', show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', formProData: { goodsType: null }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '基本单位', prop: 'basicUnit', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '基本单位名', prop: 'basicUnitName', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },

        { title: '档案成本价', prop: 'costPrice', show: false, type: 'COST_PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        // { title: '原最低售价', prop: 'origianlLowestPrice', show: false, type: 'PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '现最低售价', prop: 'nowLowestPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '原最高售价', prop: 'origianlTopPrice', show: false, type: 'PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '现最高售价', prop: 'nowTopPrice', show: false, type: 'PRICE', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },

        { title: '档案会员价', prop: 'originalMemberPrice', show: false, readonly: true, defaultValue: '-', type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '调整会员价', prop: 'nowMemberPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空或0', trigger: 'blur' }] },

        { title: '档案零售价', prop: 'originalPrice', show: false, type: 'PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '调整零售价', prop: 'nowPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空或0', trigger: 'blur' }] },

        // { title: '原尊席价', prop: 'originalVipPrice', show: false, type: 'PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '现尊席价', prop: 'nowVipPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        // { title: '失效后价格', prop: 'priceAfterInvalid', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
        //   rule: [{ validator: this.mixin_check_amount, message: '不能为空或0', trigger: 'change' }] },

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
    invalidDateCheck(rule, value, callback) {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.permanentlyValid) {
        return callback()
      }
      if (form.validDate > value) {
        callback(new Error('失效日期晚于生效日期'))
      } else {
        callback()
      }
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
        // getDetails({ 'adjustmentOrderNo': this.currentRow.adjustmentOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.details
        // this.formShow = true
        this.currentComponent = 'WmsCompForm'
        operateItem.loading = false
        // } else {
        //   this.$message.error('获取失败')
        //   operateItem.loading = false
        // }
        // })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ noType: 'SPTJ' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data.orderNo
            this.currentComponent = 'WmsCompForm'
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
        case 'insert': // 新增
          data.Req.id = null
          data.Req.permanentlyValid = true //  永久有效
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.adjustmentOrderNo = data.Req.adjustmentOrderNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data.Req, data)
          delete data.Req
          data.deleteDetails = []

          addOrSaveOrder(data).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          data.Req.permanentlyValid = true //  永久有效
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.adjustmentOrderNo = data.Req.adjustmentOrderNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.invalidDate = data.invalidDate || null
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
    exportFn(e, item = null, isSure = false) {
      if (!isSure) {
        this.$confirm(`确认导出文件吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.exportFn(e, item, true)
        }).catch(() => {
          item.loading = false
          this.$message.info('已取消操作')
        })
        return
      }
      if (item) {
        item.loading = true
      }
      printAutoPriceDetails({ 'priceAdjustmentOrderNo': e.adjustmentOrderNo }).then(res => {
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['商品名称', '规格', '零售价', '会员价', '乐檬商品编码', '除2', '商品价格']
          const filterVal = ['goodsName', 'spec', 'salePrice', 'memberPrice', 'itemNum', 'divide2', 'ifProductPrice']
          const list = res.data
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '调价单号_' + e.adjustmentOrderNo,
            autoWidth: true,
            bookType: 'xlsx'
          })
        })
      }).finally(() => {
        if (item) {
          item.loading = false
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'weightType') {
          return this.MenuGetPropName('weight_type', v[j], { value: '', label: '' })
        } else if (['salePrice', 'memberPrice'].includes(j)) {
          return this.fen2yuan(v[j])
        } else {
          return v[j]
        }
      }))
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
      review({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
        this.message(res)
      })
    },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将删除${this.mix_comp_find_order_title_name('adjustmentOrderNo', this.table_data_arr)}「${item.adjustmentOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
