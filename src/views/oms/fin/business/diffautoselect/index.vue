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
        v-bind="$attrs"
        @tabDateChange="Mixin_tabDate=$event"
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
        v-on="$listeners"
      />
    </keep-alive>
    <!-- 详情弹窗 -->
    <el-dialog
      class="my-class"
      title="单据详情"
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
        :add_arr="[]"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, financeReviewer, orderNo, getDetails } from '@/api/wms/purdiff'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './diffautoselect'
import dayjs from 'dayjs'
export default {
  name: 'DiffAutoSelect',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const diffMountCheck = (rule, value, callback) => { // 数量校验
      if (rule.field === 'amount') {
        if (Number(value) === 0) {
          return callback(new Error('不能为空或0'))
        }
        return callback()
      }

      if (Number(value) === 0) {
        return callback(new Error('不能为空或0'))
      }
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.DECIMAL('0.001').mul(this.Mixin_tabDate[index].diffNumQuantity || '0').mul(this.Mixin_tabDate[index].price || '0').mul('0.0001').toNumber().toFixed(0) !== this.DECIMAL('0.0001').mul(this.Mixin_tabDate[index].amount).toNumber().toFixed(0)) {
        callback(new Error('计算有误'))
      } else {
        callback()
      }
    }
    return {
      detailFormShow: false,
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      form_bottons: [
        // { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { financialAudit: 1 }, detailShowArgs: { financialAudit: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:diff:order:financeReviewer'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '系统差异单号', prop: 'id', show: true, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货单号', prop: 'receiveOrderNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        { title: '收货日期', prop: 'receiveDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '差异总金额', prop: 'amount', show: true, type: 'PRICE', width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货类型', prop: 'receiveType', show: true, type: 'selectState', width: 160, selectData: 'receive_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '采购员', prop: 'purPerson', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人', prop: 'financialReviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核时间', prop: 'financialReviewerTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '差异单号', prop: 'purDiffOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tabWidth: 300 },
        { title: '商品ID(隐藏)', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { stopBuy: 0, storeId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { stopBuy: 0, storeId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '供应商', prop: 'supplierName', show: false, placeholder: '请选择', click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', focusFn: this.focusFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
        //   rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        // { title: '规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: 120, addFatherProp: 'detailReqs' },
        // { title: '采购单位', prop: 'purUnit', show: false, tabWidth: 100, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异件数', prop: 'diffPiecesNum', show: false, type: 'text', inputFn: (row) => this.changeComputed(row), editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购金额', prop: 'purAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购数量', prop: 'purQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货数量', prop: 'recvQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异数量', prop: 'diffQuantity', show: false, type: 'weight_number', inputFn: (row) => this.changeComputed(row), editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购单价', prop: 'receivePrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异金额', prop: 'diffAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: diffMountCheck, trigger: 'change' }] },
        { title: '制单时间', prop: 'createTime', tabWidth: 150, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
        getDetails({ 'recordId': this.currentRow.id }).then(res => {
          this.details = res.data
          if (this.$attrs.is_child) { // 选单时弹窗展示详情
            this.detailFormShow = true
          } else {
            this.currentComponent = 'WmsForm'
          }
          operateItem.loading = false
        })
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
            // if (res.code === 200 && arg.review) {
            //   this.review()
            //   return
            // }
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
    changeComputed(row) {
      row.amount = this.DECIMAL(row.price).mul(row.diffNumQuantity).mul('0.001')
      row.amountShow = this.fen2yuan(row.amount)
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
      financeReviewer({ 'ids': [id || this.currentRow.id] }).then(res => {
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
