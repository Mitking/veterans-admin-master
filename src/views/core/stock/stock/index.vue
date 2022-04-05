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
        @formChange="formV=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addStock, getStockList, updateStock } from '@/api/core/stock'
// import CoreCompForm from '@/views/core/components/CoreCompForm'
import CoreCompForm from '@/views/core/components/CoreCompForm'
import Order from './stock'
import store from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'StockIndex',
  components: { CoreCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const whetherSaleV = (rule, value, callback) => {
      // 金额空值检验
      const saleStock = this.addStockList.filter(item => item.whetherSale)
      if (saleStock.length === 1) { // 有默认仓库
        if (!value && this.formV.id === saleStock[0].id) { // 默认仓库就是当前修改的仓库
          callback(new Error('不可关闭默认销售仓库！'))
        } else {
          callback()
        }
      } else if (saleStock.length === 0) { // 没有默认仓库
        if (!value) {
          callback(new Error('该门店下默认销售仓库为空！'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      formV: {},
      addStockList: [], // 已选门店中，仓库列表
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false },
        { title: '组织', width: 200, prop: 'orgId', readonly: true, show: false, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: [0, 3].includes(this.$store.getters.accountType), detailShow: false, addFatherProp: 'Req' },
        { title: '门店', prop: 'storeId', width: 200, readonly: true, show: true, defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '仓库名', prop: 'stockName', width: 240, show: true, type: 'text', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '仓库名必填', trigger: 'change' }] },
        { title: '默认销售仓', prop: 'whetherSale', width: 120, show: true, type: 'if_type', defaultValue: false, addFatherProp: 'Req', editShow: true,
          rule: [{ validator: whetherSaleV, trigger: 'change' }] },
        // { title: '仓库分组', prop: 'stockGroupId', width: 150, show: false, type: 'select', selectData: 'stock_group', selectOption: { label: 'groupName', value: 'id' }, addFatherProp: 'Req', editShow: true,
        //   rule: [{ required: true, message: '仓库分组必填', trigger: 'change' }] }, // selectOption:下拉框参数
        // { title: '仓库代码', prop: 'stockCode', width: 150, show: false, type: 'Number', addFatherProp: 'Req', editShow: true, readonly: true,
        //   rule: [{ required: true, message: '仓库代码必填', trigger: 'change' }, { max: 6, message: '代码不能超过6位', trigger: 'change' }] },
        { title: '仓库级别', prop: 'level', width: 100, show: true, type: 'select', selectData: 'stock_level', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '仓库级别不能为空', trigger: 'change' }] },
        // { title: '仓库别名', prop: 'storeAlias', width: 200, show: false, type: 'text', addFatherProp: 'Req', editShow: true },
        { title: '仓库属性', prop: 'attribute', width: 150, show: true, type: 'select', selectData: 'stock_attr', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '仓库属性不能为空', trigger: 'change' }] },
        { title: '联系人', prop: 'contactPerson', width: 150, show: true, windowName: 'User', type: 'text', addFatherProp: 'Req', editShow: true },
        { title: '联系电话', prop: 'contactPhone', width: 150, show: true, type: 'Number', float: { max: 99999999999 }, addFatherProp: 'Req', editShow: true },
        { title: '是否启用', prop: 'enable', show: true, width: 100, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true },
        { title: '备注', prop: 'remark', show: true, type: 'remark', addFatherProp: 'Req', editShow: true }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    ...mapGetters(['enumList']),
    formShow() {
      console.log('formShow', this.currentComponent === 'CoreCompForm')
      return this.currentComponent === 'CoreCompForm'
    }
  },
  watch: {
    'formV': {
      handler(n) {
        this.addStockList = this.enumList.stockId.filter(item => item.storeId === n.storeId)
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.loading = false
        getStockList({}).then(resM => {
          if (resM.code === 200) {
            store.dispatch('enum/add_enum', { 'stockId': resM.data }) // 更新枚举表
          }
        })
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', operateItem.prop !== 'insert')

      operateItem.loading = true
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'stockCode', 'readonly', operateItem.prop !== 'insert')
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
        getStockList({}).then(res => {
          if (res.code === 200) {
            store.dispatch('enum/add_enum', { 'stockId': res.data }).then(() => { // 更新枚举表
              this.currentComponent = 'CoreCompForm'
              operateItem.loading = false
            })
          }
        })
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
          addStock(data.Req).then(res => {
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
          delete data.Req.stockCode
          updateStock(data.Req).then(res => {
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
