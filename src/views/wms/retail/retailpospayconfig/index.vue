<template>
  <div>
    <keep-alive :max="2" :exclude="['WmsForm']">
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
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { save } from '@/api/oms/retailpospayconfig'
import Form from '@/views/wms/components/WmsForm'
import Order from './retailpospayconfig'
export default {
  name: 'RetailPosPayConfigIndex',
  components: { Form, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: null }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '支付方式', prop: 'payType', width: 200, formItemWidth: 150, show: true, type: 'select', selectData: 'pay_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '允许POS使用', prop: 'allowPos', width: 150, type: 'if_type', show: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '商品结算', prop: 'productSettle', width: 150, type: 'if_type', show: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '礼品卡结算', prop: 'cardSettle', width: 150, type: 'if_type', show: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '排序', prop: 'sort', width: 100, type: 'number', show: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '备注', prop: 'remark', show: true, type: 'remark', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'Form')
      return this.currentComponent === 'Form'
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
      if (['edit'].includes(operateItem.prop)) { // 修改
        this.details = null
        this.currentComponent = 'Form'
        operateItem.loading = false
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = null
        this.currentComponent = 'Form'
        operateItem.loading = false
      }
    },
    formSave(arg, data) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'close':case 'detail': // 详情关闭
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert':case 'edit': // 修改，新增
          save(data.Req).then(res => {
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
        default:
          console.log(arg, data)
      }
    },
    // review() { // 审核
    //   review({ 'ids': [this.currentRow.id], 'auditStatus': '3' }).then(res => {
    //     if (res.code === 200) {
    //       this.message(res)
    //     }
    //   }).catch(err => {
    //     this.loading = false
    //     throw err
    //   })
    // },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('adjustmentOrderNo', this.table_data_arr)}「${item.adjustmentOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
