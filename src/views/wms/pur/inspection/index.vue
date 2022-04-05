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
    <el-dialog
      title="打印预览"
      :visible.sync="printShow"
      :show-close="false"
      width="654px"
      refs
    >
      <div style="height:500px;overflow: auto">
        <div v-if="printShow" id="printWindow">
          <div
            v-for="item in Number(printRow.inspectionPiecesNum)"
            :key="item"
            style="display:inline;"
          >
            <svg :class="'barcode'+printRow.inspectionCode" />
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button @click="printShow = false">取 消</el-button>
        <el-button v-print="'#printWindow'" type="primary">打 印</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purinspection'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './inspection'
import dayjs from 'dayjs'
import jsbarcode from 'jsbarcode'
export default {
  name: 'InspectionIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const check_three = (rule, value, callback) => {
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (!this.Mixin_tabDate[index].quality && !Number(this.Mixin_tabDate[index].sweetness) && !this.Mixin_tabDate[index].flavor) {
        callback(new Error('至少填一项'))
      } else {
        callback()
      }
    }
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'ProductIndex' }],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:inspection:order:reviewer'] }
      ],
      loading: false,
      printShow: false,
      printRow: {},
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '抽检单号', prop: 'purInspectionNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '采购单号', prop: 'purOrderNo', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '抽检日期', prop: 'inspectionDate', show: true, width: 160, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '采购日期不能为空', trigger: 'change' }] },
        { title: '自动生成', prop: 'autoGenerate', show: true, width: 100, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatu', show: true, width: 160, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '生成核验单', prop: 'generateCheck', show: true, width: 120, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '制单人', prop: 'creatorName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 200, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 200, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商', prop: 'supplierName', width: 200, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: true, false: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifier', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '抽检单号', prop: 'purInspectionNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '抽检码', prop: 'inspectionCode', show: false, defaultValue: '系统生成', type: 'text', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs', tabWidth: 100 },
        { title: '商品ID', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, 'tableHidden': true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '供应商ID', prop: 'supplierId', show: false, click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '供应商', prop: 'supplierName', show: false, placeholder: '请选择', click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', focusFn: this.focusFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', defaultValue: '-', editShow: true, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '采购件数', prop: 'purPiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '抽检件数', prop: 'inspectionPiecesNum', show: false, type: 'number', float: { max: 100 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '抽检金额', prop: 'inspectionMoney', defaultValue: 0, readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '质量', prop: 'quality', show: false, type: 'select', selectData: 'quality', selectValueType: 'string', selectOption: { label: 'name', value: 'name' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: check_three, message: '至少填一项', trigger: 'change' }] },
        { title: '甜度', prop: 'sweetness', show: false, type: 'number', float: { max: 100, decimal: 2 }, suffixType: 'text', suffix: '%', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: check_three, message: '至少填一项', trigger: 'change' }] },
        { title: '口感', prop: 'flavor', show: false, type: 'select', selectValueType: 'string', selectData: 'flavor', selectOption: { label: 'name', value: 'name' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: check_three, message: '至少填一项', trigger: 'change' }] },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '打印抽检码', prop: 'opreatePrintCode', tabWidth: 100, show: false, click: this.printCode, opreateClickFn: this.printCode, funcTitle: '打印', type: 'func', editShow: true, detailShow: false, addFatherProp: 'detailReqs' }
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
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'opreatePrintCode', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'opreatePrintCode', 'detailShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPiecesNum', 'readonly', (operateItem.prop !== 'insert' && (operateItem.prop === 'edit' && this.currentRow.autoGenerate)))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        // getDetails({ 'purInspectionNo': this.currentRow.purInspectionNo }).then(res => {
        //   if (res.code === 200) {
        // this.currentRow.purInspectionDetailQueryResList
        const temp = this.deepClone(this.currentRow.purInspectionDetailQueryResList)
        temp.map(item => {
          item.sweetness = item.sweetness ? (item.sweetness / 100).toFixed(2) : item.sweetness
        })
        this.details = temp

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
        orderNo({ type: 'CGCJ' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data0 = { Req: {}, detailReqs: [] }, deleteDetails) { // 提交回调处理
      let data = this.deepClone(data0)
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
          data.Req.autoGenerate = false
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.purInspectionNo = data.Req.purInspectionNo
              item.sweetness = item.sweetness ? (item.sweetness * 100).toFixed(0) : item.sweetness
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
              item.purInspectionNo = data.Req.purInspectionNo
              item.sweetness = item.sweetness ? (item.sweetness * 100).toFixed(0) : item.sweetness
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
    printCode(row) {
      if (!row.inspectionPiecesNum || Number(row.inspectionPiecesNum) === 0) {
        this.$message.info('请先设置抽检总件数')
        return
      }
      this.printRow = row
      this.printShow = true
      this.$nextTick(() => {
        jsbarcode(
          `.barcode${row.inspectionCode}`,
          row.inspectionCode,
          {
            displayValue: true, // 是否在条形码下方显示文字
            height: 80,
            margin: 10,
            marginLeft: 20,
            fontSize: 16
          }
        )
      })
    },
    review(id = null, isSure = false) { // 审核
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purInspectionNo', this.table_data_arr)}「${item.purInspectionNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
