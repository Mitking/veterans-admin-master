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
        :form-bottons="form_bottons"
        v-bind="$attrs"
        v-on="$listeners"
        @deleteDetail="deleteDetail"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import MixinGlobal from '@/components/MixinGlobal'
import {
  getDetails,
  updateOrder,
  review,
  getPurFeeTmpList,
  generateOrderNo
} from '@/api/wms/purcosts'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './costs'
export default {
  name: 'PurCostsIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1, totalCost: '' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['pur:costs:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr_temp: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '费用单号', prop: 'purCostsOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '费用日期', prop: 'costDate', width: 150, show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '费用日期不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'totalCost', width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['totalCost'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        // { title: '采购任务单号', prop: 'purTaskOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatu', width: 100, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '已参与核算', prop: 'costCalculation', width: 120, show: true, type: 'if_type', selectData: 'audit_status', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '制单人ID', prop: 'creator', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人id', prop: 'reviewerId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '附加备注', prop: 'attachRemark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: true, type: 'remark', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '费用单号', prop: 'purCostsOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '组织', prop: 'orgId', show: false, type: 'select', selectData: 'organizes', tabWidth: 200, selectOption: { label: 'orgShortName', value: 'id' }, placeholder: '请选择', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '组织不能为空', trigger: 'change' }] },
        { title: '组织名称', prop: 'orgName', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '小计', prop: 'totalCost', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_cost, arg: ['costFees'], placeholder: '系统计算', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '附件', prop: 'fileNames', show: false, tableWidth: 100, type: 'fileNames', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purCostsOrderNo', this.table_data_arr)}「${item.purCostsOrderNo}」中的项目, 是否继续?`, '提示', {
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
    },
    async openModel(operateItem = {}) { // 修改、详情
      this.table_data_arr_temp = this.deepClone(this.table_data_arr)
      this.operateItem = operateItem
      this.operateItem.loading = true
      const costFeesTemp = []
      let arrTemp = []
      const { data: FeeTmpList } = await getPurFeeTmpList({}).catch(() => ({ data: 300 }))
      if (FeeTmpList === 300) {
        this.operateItem.loading = false
        return this.$message.info('获取模板失败!')
      }
      FeeTmpList.map(item => {
        costFeesTemp.push({
          id: null,
          feeName: item.feeName,
          feeId: item.id,
          fee: ''
        })
      })
      // if (this.currentRow.totalCost) { // 当总金额不为空时，可以显示审核按钮
      //           this.form_bottons[0].detailShowArgs.totalCost = this.currentRow.totalCost
      //         }

      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'id': this.currentRow.id }).then(res => {
          this.details = res.data.costDetailResList
          if (this.details.length > 0) {
            arrTemp = this.details[0].costFees.map(item => ({
              title: item.feeName,
              prop: 'fee_' + item.feeId,
              show: false,
              type: 'costFees',
              id: item.id,
              feeId: item.feeId,
              editShow: true,
              detailShow: true,
              addFatherProp: 'detailReqs'
            }))
          } else { // 长度为零
            FeeTmpList.map(item => {
              arrTemp.push({
                title: item.feeName,
                prop: 'fee_' + item.id,
                show: false,
                type: 'costFees',
                id: null,
                feeId: item.id,
                editShow: true,
                detailShow: true,
                addFatherProp: 'detailReqs'
              })
            })
            this.details = [{ costFees: costFeesTemp }]
          }
          this.table_data_arr.insert(this.table_data_arr.length - 3, ...arrTemp)
          this.currentComponent = 'WmsCompForm'
          operateItem.loading = false
        })
      }
      if (operateItem.prop === 'insert') {
        const { data: orderNo } = await generateOrderNo({ type: 'CGFY' })
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'purCostsOrderNo', 'defaultValue', orderNo)
        FeeTmpList.map(item => {
          arrTemp.push({
            title: item.feeName,
            prop: 'fee_' + item.id,
            show: false,
            type: 'costFees',
            id: null,
            feeId: item.id,
            editShow: true,
            detailShow: true,
            addFatherProp: 'detailReqs'
          })
        })
        this.details = [{ costFees: costFeesTemp }]
        this.table_data_arr.insert(this.table_data_arr.length - 3, ...arrTemp)
        this.currentComponent = 'WmsCompForm'
        this.operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails = []) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.table_data_arr = this.deepClone(this.table_data_arr_temp)
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          {
            data.Req.id = null
            const tempData = data.Req
            tempData.purCostDetailList = data.detailReqs.map(item => {
              item.purCostsOrderNo = data.Req.purCostsOrderNo
              item.orgName = this.MenuGetPropName('organizes', item.orgId, { label: 'orgShortName', value: 'id' })
              item.id = item.id || null
              return item
            })
            tempData.deleteDetails = []
            if (arg.review) { // 新增并审核
              this.$confirm(`确认审核吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                updateOrder(tempData).then(res => {
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
            updateOrder(tempData).then(res => {
              this.message(res)
            }).catch(err => {
              this.loading = false
              throw err
            })
          }
          break
        case 'edit': // 修改
          {
            const tempData = data.Req
            tempData.purCostDetailList = data.detailReqs.map(item => {
              item.purCostsOrderNo = data.Req.purCostsOrderNo
              item.orgName = this.MenuGetPropName('organizes', item.orgId, { label: 'orgShortName', value: 'id' })
              item.id = item.id || null
              return item
            })
            tempData.deleteIds = deleteDetails
            updateOrder(tempData).then(res => {
              if (res.code === 200 && arg.review) {
                this.review()
                return
              }
              this.message(res)
            }).catch(err => {
              this.loading = false
              throw err
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
    }
  }
}
</script>
<style scoped>
</style>
