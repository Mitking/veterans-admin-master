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
        :edit-detail-some-disable="true"
        :form-bottons="form_bottons"
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
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purcheck'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './check'
export default {
  name: 'CheckIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [ // 审核二段检验，不适合详情审核
        // { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '核验单号', prop: 'purCheckOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '抽检单号', prop: 'purInspectionNo', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '抽检单号', prop: 'purInspectionNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购单位', prop: 'purUnit', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购单位名称', prop: 'purUnitName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req', readonly: true },
        { title: '核验日期', prop: 'purCheckDate', show: true, type: 'date', width: 150, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '采购日期不能为空', trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', width: 150, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        // { title: '自动生成', prop: 'autoGenerate', show: true, type: 'if_type', editShow: true, defaultValue: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '核验金额', prop: 'purCheckMoney', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '抽检人', prop: 'inspectionPersonId', width: 160, show: true, type: 'select', selectData: 'personListCCRK', selectOption: { label: 'surname', value: 'id' }, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '核验操作人', prop: 'modifierName', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'date', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商名', prop: 'supplierName', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '更新时间', prop: 'updateTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '核验单号', prop: 'purCheckOrderNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '抽检码', prop: 'randomInspectionCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true, tabWidth: 300 },
        { title: '是否检验', prop: 'inspection', show: false, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '供应商', prop: 'supplierName', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '抽检件数', prop: 'inspectionPiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '核验件数', prop: 'purCheckPiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '质量', prop: 'quality', show: false, type: 'select', selectData: 'quality', selectValueType: 'string', selectOption: { label: 'name', value: 'name' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '甜度', prop: 'sweetness', show: false, type: 'number', float: { max: 100, decimal: 2 }, suffixType: 'text', suffix: '%', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '口感', prop: 'flavor', show: false, type: 'select', selectValueType: 'string', selectData: 'flavor', selectOption: { label: 'name', value: 'name' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
        const temp = this.deepClone(this.currentRow.details)
        temp.map(item => {
          item.sweetness = item.sweetness ? (item.sweetness / 100).toFixed(2) : item.sweetness
        })
        this.details = temp
        // this.details = this.currentRow.details
        this.currentComponent = 'WmsForm'
        operateItem.loading = false
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo({ type: 'CGHY' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsForm'
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
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.purCheckOrderNo = data.Req.purCheckOrderNo
              item.sweetness = item.sweetness ? (item.sweetness * 100).toFixed(0) : item.sweetness
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
              item.purCheckOrderNo = data.Req.purCheckOrderNo
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purCheckOrderNo', this.table_data_arr)}「${item.purCheckOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
