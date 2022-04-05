<template>
  <div>
    <!-- @indexPageFormChange="indexPageFormChange" -->
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
        :show="formShow"
        :details="details"
        :form-bottons="form_bottons"
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
import { addOrder, updateOrder, getStoNumber, review } from '@/api/wms/stockplan'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './plan'
export default {
  name: 'PlanIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const loopPeriodCheck = (r, v, callback) => {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (!Number(v)) {
        return callback(new Error('不能为0或空'))
      }
      if (form.loopTimeUnit === '2' && Number(v) > 31) { // 按月盘点
        return callback(new Error('按月盘点周期不能大于31'))
      }
      callback()
    }
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoInvPlanOrder:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '计划单号', prop: 'stoInvPlanNo', width: 240, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, outTabHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '门店', prop: 'storeId', width: 200, show: true, type: 'select', readonly: [1].includes(this.$store.getters.accountType), defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '仓库', prop: 'stockId', show: true, width: 200, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '盘点范围', prop: 'invRange', show: true, formItemWidth: 120, width: 160, type: 'select', selectData: 'inv_range', editShow: true, detailShow: true, addFatherProp: 'Req', valToStr: true,
          rule: [{ required: true, message: '盘点范围不能为空', trigger: 'change' }] },
        { title: '分类列表', prop: 'categoryIds', width: 180, show: true, fa_show: { invRange: '1' }, tabHidden: true, type: 'goodsCategory', selectData: 'categoryList', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.categoryIdsCheck, trigger: 'change' }] },
        { title: '单品盘点数量', prop: 'singleCount', show: true, width: 100, tabHidden: true, defaultValue: 0, type: 'number', editShow: true, detailShow: true, fa_show: { invRange: '2' }, addFatherProp: 'Req' },
        { title: '商品金额范围', type: 'range', show: true, tabHidden: true, editShow: true, addFatherProp: 'Req', detailShow: true, fa_show: { invRange: '2' }, range: [
          { prop: 'productStartPrice', placeholder: '起始价', type: 'number', float: { max: 9999, decimal: 2 }},
          { prop: 'productEndPrice', type: 'number', placeholder: '终止价', float: { max: 9999, decimal: 2 }}
        ] },

        // { title: '循环盘点', prop: 'ifLoop', show: true, width: 100, defaultValue: true, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '循环单位', formItemWidth: 80, prop: 'loopTimeUnit', show: true, width: 120, defaultValue: '2', type: 'select', selectData: 'loop_time', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '时间单位不能为空', trigger: 'change' }] },
        { title: '盘点周期', prop: 'loopPeriod', show: true, width: 100, type: 'number', placeholderFn: (form) => form.loopTimeUnit === '2' ? '每月几号' : '间隔几天', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: loopPeriodCheck, trigger: 'change' }] },
        // { title: '计划时间', prop: 'planTime', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
        //   rule: [{ required: true, message: '计划时间不能为空', trigger: 'change' }] },
        { title: '审核状态', width: 150, prop: 'auditStatus', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },

        // { title: '盘点金额', prop: 'amount', width: 150, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '是否停用', prop: 'ifStop', show: true, type: 'if_type', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', show: true, type: 'date', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: false, type: 'text', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: false, type: 'text', width: 150, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: false, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' }
        // { title: '附加备注', prop: 'attachRemark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '分拣单号', prop: 'storageSortedOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '门店', prop: 'store', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '仓库', prop: 'stock', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '分拣入库单号', prop: 'stoInvPlanNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '入库数', prop: 'number', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '个数', prop: 'count', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '单价', prop: 'price', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '金额', prop: 'amount', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: null // 详细数据
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
    categoryIdsCheck(rule, value, callback) {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.invRange === '1' && value.length === 0) {
        return callback(new Error('分类列表不能为空！'))
      }
      return callback()
    },
    // indexPageFormChange(form) { // 表单form数据变化
    //
    //   this.mixin_arr_edit_by_prop(this.ArrFilter(this.table_data_arr, { show: true, addFatherProp: 'Req' }), 'loopPeriod', 'editShow', form.ifLoop)
    //   this.mixin_arr_edit_by_prop(this.ArrFilter(this.table_data_arr, { show: true, addFatherProp: 'Req' }), 'loopTimeUnit', 'editShow', form.ifLoop)
    // },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        this.currentComponent = 'WmsCompForm'
        operateItem.loading = false
      } else if (operateItem.prop === 'insert') { // 新增
        getStoNumber({ stoType: 'CC_PDJH' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
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
              item.stoInvPlanNo = data.Req.stoInvPlanNo
            })
          }
          if (data.Req.invRange === '1') { // 类别盘点
            data.Req.categoryName = this.enumGetproplist({ selectData: 'categoryList', selectOption: { value: 'id' }}, data.Req.categoryIds).map(it => it.name).toString()
          }
          addOrder(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          data = Object.assign(data, data.Req)
          delete data.Req
          updateOrder(data).then(res => {
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
    }
    // deleteDetail(item) {
    //   return new Promise(resolve => {
    //     this.$confirm(`此操作将永久删除单号「${item.stoInvPlanNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     }).then(() => {
    //       // this.operateItem.loading = true
    //       deleteDetails({ ids: [item.id] }).then(res => {
    //         if (res.code === 200) {
    //           this.$success('操作成功')
    //         } else {
    //           this.$error(res.data)
    //         }
    //         resolve(true)
    //       }).catch(err => {
    //         throw err
    //       })
    //     }).catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: '已取消删除'
    //       })
    //       resolve(false)
    //     })
    //   })
    // }
  }
}
</script>
<style scoped>
</style>
