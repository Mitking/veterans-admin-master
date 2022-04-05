<template>
  <div>
    <keep-alive :max="2" exclude="CoreForm">
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
        v-bind="$attrs"
        v-on="$listeners"
        @formChange="formChange"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{ currentRow = e;currentRow.type=currentRow.markupRate?'1':'2' }"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addPriceAlg, updatePriceAlg } from '@/api/core/coreprice'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './pricealgnewui'
import { getAlgJson } from '@/api/core/product'
import store from '@/store'
export default {
  name: 'PriceAlgIndex',
  components: { CoreForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const checkMaxCost = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('最高成本价必填'))
      } else if (value <= this.$refs.Comp.$refs.Form.form.minCost) {
        callback(new Error('最高成本价要高于最低成本价'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, addFatherProp: 'Req', disabled: true, type: 'text', defaultValue: null, editShow: false },
        { title: '算法编号', width: 150, prop: 'algCode', show: false, addFatherProp: 'Req', type: 'text', editShow: false },
        { title: '算法名称', width: 200, prop: 'algName', show: true, addFatherProp: 'Req', type: 'text', editShow: true,
          rule: [{ required: true, message: '算法名称必填', trigger: 'change' }] },
        { title: '最低成本价', width: 150, prop: 'minCost', show: true, addFatherProp: 'Req', type: 'PRICE', editShow: true, formItemWidth: 100,
          rule: [{ required: true, message: '最低成本价必填', trigger: 'change' }] },
        { title: '最高成本价', width: 150, prop: 'maxCost', show: true, addFatherProp: 'Req', type: 'PRICE', editShow: true, formItemWidth: 100,
          rule: [{ validator: checkMaxCost, trigger: 'change' }, { required: true, message: '最低成本价必填', trigger: 'change' }] },
        { title: '算法类型', prop: 'type', show: true, tabHidden: true, addFatherProp: 'Req', type: 'select', selectData: 'alg_type', defaultValue: '2', editShow: true, formItemWidth: 150 },
        { title: '加价率', width: 100, prop: 'markupRate', show: true, addFatherProp: 'Req', type: 'number', suffixType: 'text', formItemWidth: 100, suffix: '%', float: { max: 100, decimal: 0 }, editShow: true, fa_show: { type: '1' },
          rule: [{ required: true, message: '加价率必填', trigger: 'change' }] },
        { title: '加价额度', width: 100, prop: 'markupQuota', show: true, addFatherProp: 'Req', type: 'PRICE', formItemWidth: 100, editShow: false, fa_show: { type: '2' },
          rule: [{ required: true, message: '加价额度必填', trigger: 'change' }] },
        { title: '小数取整', width: 100, tipMsg: "举例:'8'意为0.08元,精确到分,'80'意为0.80元,精确到角", prop: 'afterPointRound', show: true, addFatherProp: 'Req', float: { max: 99 }, type: 'Number', formItemWidth: 100, editShow: true,
          rule: [{ required: true, message: '小数点后取整必填', trigger: 'change' }] },
        // { title: '取整规则', prop: 'roundRule', show: true, addFatherProp: 'Req', type: 'select', selectData: 'round_rule', editShow: true },
        { title: '备注', prop: 'remark', show: true, addFatherProp: 'Req', type: 'remark', editShow: true }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      return this.currentComponent === 'CoreForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    formChange(form) {
      if (form !== false) {
        this.table_data_arr.map(item => {
          if (item.fa_show) {
            this.$set(item, 'editShow', Object.keys(item.fa_show).every(itemz => form[itemz] === item.fa_show[itemz]))
          }
        })
      }
    },
    message(res) {
      if (res.code === 200) {
        this.loading = false
        this.currentComponent = 'Order'
        this.$success('操作成功')
        getAlgJson({}).then(res => { // 强制更新数据字典
          store.dispatch('enum/add_enum', { algList: res.data })
        })
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情、复制
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改
        this.$set(this.table_data_arr[5], 'readonly', (operateItem.prop !== 'insert'))
        this.details = null
        if (operateItem.prop !== 'insert') {
          this.mixin_arr_edit_by_prop(this.table_data_arr, 'markupRate', 'editShow', this.currentRow.type === '1')
          this.mixin_arr_edit_by_prop(this.table_data_arr, 'markupQuota', 'editShow', this.currentRow.type !== '1')
        }
        this.currentComponent = 'CoreForm'
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
          delete data.Req.id
          if (data.Req.type === '1') { // 加价率
            delete data.Req.markupQuota
          } else {
            delete data.Req.markupRate
          }
          addPriceAlg(data.Req).then(res => {
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
          if (data.Req.type === '1') { // 加价率
            delete data.Req.markupQuota
          } else {
            delete data.Req.markupRate
          }
          delete data.Req.type
          updatePriceAlg(data.Req).then(res => {
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
