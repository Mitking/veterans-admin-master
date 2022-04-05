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
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purdemand'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './demandcollect.vue'
import dayjs from 'dayjs'
export default {
  name: 'DemandCollectIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { ifTotalStock: true, orgId: 0 }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:demand:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '需求单号', prop: 'demandOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: [0, 3].includes(this.$store.getters.accountType), detailShow: false, tableHidden: true, addFatherProp: 'Req' },
        { title: '需求门店', width: 200, prop: 'storeId', readonly: [1].includes(this.$store.getters.accountType), show: true, type: 'select', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : '', fatherProp: 'orgId', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '需求门店不能为空', trigger: 'change' }] },
        { title: '需求日期', width: 150, prop: 'demandDate', show: true, defaultValue: dayjs().format('YYYY-MM-DD'), type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '需求日期不能为空', trigger: 'change' }] },
        { title: '审核状态', width: 100, prop: 'auditStatu', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '已生成任务', width: 120, prop: 'generateTask', show: true, type: 'if_type', selectData: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        // { title: '总金额', width: 150, prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req', placeholder: '系统计算',
        //   rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '制单人', width: 120, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, width: 100, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '门店名称', prop: 'storeName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '需求单号', prop: 'demandOrderNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '门店商品ID', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { orgId: 0, ifTotalStock: true }, show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { orgId: 0, ifTotalStock: true }, show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', defaultValue: '-', readonly: true },
        { title: '库存数量', prop: 'stockNum', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true, defaultValue: '-' },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true, defaultValue: '-' },
        // { title: '图片名', prop: 'img', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '单价', prop: 'price', show: false, type: 'COST_PRICE', defaultValue: '-', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '需求数量', prop: 'number', show: false, type: 'weight_number', placeholder: '手动录入', float: { decimal: 3 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        // { title: '金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], placeholder: '系统计算', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '路线节点', prop: 'nodes', show: false, type: 'nodes', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true }
      ],
      tabDate: [],
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
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        // getDetails({ 'demandOrderNo': this.currentRow.demandOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.demandOrderDetailList
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
        orderNo({ type: 'CGXQ' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
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
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.demandOrderNo = data.Req.demandOrderNo
              item.storeId = data.Req.storeId
              item.number = Number(item.number)
            })
          }
          data.demandDetails = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req

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
              item.demandOrderNo = data.Req.demandOrderNo
              item.storeId = data.Req.storeId
              item.number = Number(item.number)
            })
          }
          data.demandDetails = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          delete data.demandOrderDetailList
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
    review(id, isSure = null) { // 审核
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('demandOrderNo', this.table_data_arr)}「${item.demandOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
