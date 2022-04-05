<template>
  <div>
    <keep-alive :max="2" exclude="CoreCompForm">
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
        :cascaderbycode="true"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addStockLocation, updateStockLocation } from '@/api/core/stock'
// import CoreCompForm from '@/views/core/components/CoreCompForm'
import CoreCompForm from '@/views/core/components/CoreCompForm'
import Order from './stocklocation'
export default {
  name: 'StockLocationIndex',
  components: { CoreCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值,
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false },
        { title: '组织', prop: 'orgId', show: false, defaultValue: [0, 3].includes(this.$store.getters.accountType) ? '' : this.$store.getters.orgId, width: '300px', type: 'select', editShow: [0, 3].includes(this.$store.getters.accountType), addFatherProp: 'Req', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '所属门店', prop: 'storeId', width: 200, show: true, type: 'select', selectData: 'stores', fatherProp: 'orgId', selectOption: { label: 'name', value: 'id' }, addFatherProp: 'Req', editShow: true, readonly: true,
          rule: [{ required: true, message: '所属门店不能为空', trigger: 'change' }] },
        { title: '仓库', prop: 'stockId', width: 200, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '仓库不能为空', trigger: 'change' }] },
        // { title: '所属仓库', prop: 'stockName', show: true, type: 'text', addFatherProp: 'Req', editShow: false },
        { title: '库位名', prop: 'name', width: 200, show: true, type: 'text', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '库位名必填', trigger: 'change' }] },
        { title: '仓库位置描述', prop: 'postion', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true },
        { title: '是否启用', prop: 'enable', show: true, width: 100, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true },
        { title: '长', prop: 'length', show: true, width: 100, type: 'number', float: { max: 9999, decimal: 3 }, suffixType: 'text', suffix: 'M', addFatherProp: 'Req', editShow: true, formItemWidth: 150 },
        { title: '宽', prop: 'width', show: true, width: 100, type: 'number', float: { max: 9999, decimal: 3 }, suffixType: 'text', suffix: 'M', addFatherProp: 'Req', editShow: true, formItemWidth: 150 },
        { title: '高', prop: 'height', show: true, width: 100, type: 'number', float: { max: 9999, decimal: 3 }, suffixType: 'text', suffix: 'M', addFatherProp: 'Req', editShow: true, formItemWidth: 150 },
        { title: '面积', prop: 'area', show: true, width: 100, type: 'Number', float: { max: 9999 }, suffixType: 'text', suffix: '㎡', addFatherProp: 'Req', editShow: true, formItemWidth: 150 },
        { title: '存储率', prop: 'storageRate', width: 100, show: true, type: 'Number', float: { max: 100 }, suffixType: 'text', suffix: '%', addFatherProp: 'Req', editShow: true, formItemWidth: 100 },
        { title: '联系人', prop: 'contactPerson', width: 150, formItemwidth: 160, show: false, windowName: 'User', type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '联系电话', prop: 'contactPhone', width: 150, show: true, type: 'text', addFatherProp: 'Req', editShow: true },
        { title: '备注', prop: 'remark', show: true, type: 'remark', addFatherProp: 'Req', editShow: true }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'CoreCompForm')
      return this.currentComponent === 'CoreCompForm'
    }
  },
  watch: {},
  created() {

  },
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
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'stockId', 'readonly', operateItem.prop !== 'insert')
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
        this.currentComponent = 'CoreCompForm'
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理

      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': case 'copy': // 新增,复制
          data.Req.id = null
          addStockLocation(data.Req).then(res => {
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
          updateStockLocation(data.Req).then(res => {
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
    }
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
    // deleteDetail(item) {
    //   return new Promise(resolve => {
    //     this.$confirm(`此操作将永久删除单号「${item.acceptNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
