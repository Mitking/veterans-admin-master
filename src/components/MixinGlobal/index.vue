<script>
// 临时加入一个全局组件，后期封装
import MixForm from '@/components/MixinForm/MixinForm'
import MixFormUms from '@/components/MixinForm/MixFormUms'
import MixOperate from '@/components/MixinForm/MixinOperate'
import MixSearch from '@/components/MixinForm/MixinSearch'
import MixPage from '@/components/MixinForm/MixPage'
import MixAddModule from '@/components/MixinForm/MixAddModule'
import MixTree from '@/components/MixinForm/MixTree'
import MixWmsForm from '@/components/MixinForm/MixWmsForm'
import clipboard from '@/directive/clipboard/index.js'
export default {
  name: 'MixinGlobal',
  components: {
    MixForm,
    MixOperate,
    MixSearch,
    MixPage,
    MixAddModule,
    MixTree,
    MixWmsForm,
    MixFormUms
  },
  directives: {
    clipboard
  },
  filters: {
    sizeFilter: function(value, size) {
      if (!value) return ''
      if (value.length > size) {
        return value.substr(0, size) + '...'
      } else {
        return value
      }
    }
  },
  data: () => {
    return {
      searchFormHeight: 150,
      search_form_height: 100,
      windowHeight: document.documentElement.clientHeight,
      searchFormShow: true,
      searchFormShowT: true,
      mixTableOprateLength: 0, // 操作按钮个数
      Mixin_tabDate: [], // 详情数据
      Mixin_loading: true,
      formLoading: false,
      mixinPKey: {},
      mixin_dialog_item: { selectForm: 'SupplierIndex' },
      mixin_select_form_show: false,
      mixin_rows: [], // 已选商品
      mixin_select_pro_form_data: {}, // 条件
      mixin_form: {} // 表单数据
    }
  },
  computed: {
    // 表格最大高度
    mixin_tab_max_height() { // (this.windowHeight < 700 ? 24 : 0)
      const tabmaxheight = this.windowHeight + (this.windowHeight < 700 ? 24 : 0) -
       (this.searchFormShow ? (this.$attrs.search_form_height - (this.windowHeight < 700 ? 12 : 0)) : 0) -
       (this.$attrs.is_child ? 390 : 300)
      return tabmaxheight
    },
    comp_disabled_table() {
      // 按钮可否
      return function(val, currentRow) {
        switch (
          val.disabled //  isRowNoWillRev:没有将要审核的， isRowNoRevEd：没有已经处理的, idsNoRevEd:批量操作存在已处理的
        ) {
          case 'isRow':
            return currentRow.id === '' || currentRow.id === undefined || (val.disabledFn ? val.disabledFn(currentRow) : false)
          case 'isRowNoRevEd':
            return (
              currentRow.auditStatu >= 3 ||
              !currentRow.id ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'isRowNoWillRev':
            return (
              currentRow.auditStatu <= 2 ||
              !currentRow.id ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'isRowNoRevEds':
            return (
              currentRow.auditStatus >= 3 ||
              !currentRow.id ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'isRowNoWillRevs':
            return (
              currentRow.auditStatus <= 2 ||
              !currentRow.id ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )

          case 'ids':
            return this.$attrs.ids.length === 0 || (val.disabledFn ? val.disabledFn(currentRow) : false)
          case 'idsNoRevEd':
            return (
              this.$attrs.rows.some((item) => item.auditStatu >= 3) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'idsNoWillRev':
            return (
              this.$attrs.rows.some((item) => item.auditStatu <= 2) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'idsNoRevEds':
            return (
              this.$attrs.rows.some((item) => item.auditStatus >= 3) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'idsNoWillRevs':
            return (
              this.$attrs.rows.some((item) => item.auditStatus <= 2) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn(currentRow) : false)
            )
          case 'searchPropProuduct':
            return !this.$attrs['search-form'].goodsCode
          default:
            return !!val.disabled
        }
      }
    },
    mix_comp_row_data_deal() { // 表格数据展示处理
      return function(data, item) {
        data = data[item.prop]
        if (data === undefined || data === null) {
          return ''
        }
        switch (item.type) {
          case 'if_type':case 'if_enable':
            return this.MenuGetPropName(item.type, data, (item.selectOption ? item.selectOption : { value: '', label: '' }))
          case 'select':
            return this.MenuGetPropName(item.selectData, data, item.selectOption ? item.selectOption : { value: '', label: '' })
          case 'PRICE':
            return this.fen2yuan(data)
          case 'PercentNumber':
            return data + '%'
          default :
            return data
        }
      }
    },
    mix_comp_row_product_data_deal() { // 商品档案表格数据展示处理
      return function(data, item) {
        data = item.prop
          ? data[item.prop]
          : (data['unitConversionRateRes'] ? data['unitConversionRateRes']['basicWeightType']
            : (item.type === 'PRICELIST'
              ? (data.prices || [])
              : ''))
        if (data === undefined || data === null) {
          return ''
        }
        switch (item.type) {
          case 'if_type':case 'if_enable':
            return this.MenuGetPropName(item.type, data, (item.selectOption ? item.selectOption : { value: '', label: '' }))
          case 'select':
            return this.MenuGetPropName(item.selectData, data, item.selectOption ? item.selectOption : { value: '', label: '' })
          case 'PRICE':
            return this.fen2yuan(data) || ''
          case 'PercentNumber':
            return data + '%'
          case 'PRICELIST':
            return data.filter(itemS => itemS.priceType === item.propName)
          default :
            return data
        }
      }
    },
    mix_comp_find_order_title_name() {
      return function(prop, list) {
        return list.filter(item => item.prop === prop)[0].title
      }
    },
    minxin_width_total() { // 表格总宽度计算
      return function(arr, widthArg = null) {
        return arr.map(item => ((widthArg && item[widthArg.widthProp]) ? item[widthArg.widthProp] : item.width) || 220)
          .reduce((curr, prev) => (curr + prev), 1 + (widthArg && widthArg.op ? widthArg.opWidth : 0)) + 'px'
      }
    }
  },
  watch: {},
  mounted() {},
  methods: {
    mix_copy_text(e) {
      this.$message.success({
        message: '已复制内容:' + e.text,
        offset: 65
      })
    },
    mix_oprate_length(arg) {
      // return this.$store.getters.roles.filter(item => arg.map(itemZ => itemZ.permission[0]).includes(item)).length
      return arg.filter(itF => itF.show || itF.show === undefined).map(itemZ => itemZ.permission[0]).filter(item => this.$store.getters.roles.includes(item)).length
    },
    MixinOpenForm(e) { // 打开弹窗
      this.mixin_dialog_item = e
      this.mixin_select_pro_form_data = e.formProData || {}
      this.mixin_select_form_show = true
    },
    MixinDialogSelect(e) { // 弹窗选择返回
      console.log('弹窗返回数据:', e)
      console.log('弹窗返回数据:', this.mixin_dialog_item)
      const prop = this.mixin_dialog_item.prop === 'supplierName' && 'name' ||
        this.mixin_dialog_item.prop === 'creatorName' && 'surname' ||
        this.mixin_dialog_item.prop === 'sortedPersonName' && 'surname' ||
        this.mixin_dialog_item.prop === 'operatorName' && 'surname' ||
        this.mixin_dialog_item.prop === 'storagePersonName' && 'surname' ||
        this.mixin_dialog_item.prop === 'loanPersonName' && 'surname' ||
        this.mixin_dialog_item.prop === 'expensePersonName' && 'surname' ||
        this.mixin_dialog_item.prop === 'driverName' && 'surname' ||
        this.mixin_dialog_item.prop === 'goodsName' && 'goodsName' ||
        this.mixin_dialog_item.prop === 'customerName' && 'name' ||
        this.mixin_dialog_item.prop === 'whsName' && 'name' ||
        this.mixin_dialog_item.prop === 'reviewer' && 'surname'
      this.searchForm[this.mixin_dialog_item.prop] = e[0][prop]
      if (this.mixin_dialog_item.prop === 'goodsName') {
        this.searchForm[this.mixin_dialog_item.reallyProp] = e[0].goodsCode
        if (this.goodsInfo) {
          this.goodsInfo = e[0]
        }
      } else {
        this.searchForm[this.mixin_dialog_item.reallyProp] = e[0].id
      }
    },
    mixin_arr_edit_by_prop(list, propName, propEdit, value) { // 修改tab data
      list.filter(item => item.prop === propName)[0][propEdit] = value
    },
    mixin_price_show_deal(arrKey, data, detailsProp = null, weightKeys = []) { // 价格数据检索处理=》已改为开弹窗时处理
      data.records.map(item => {
        Object.keys(item).map(key => {
          if (arrKey.includes(key)) { // 存在价格字段
            item[key + 'Show'] = this.fen2yuan(item[key])
          }
        })
        if (detailsProp) {
          item[detailsProp].map(itemz => {
            Object.keys(itemz).map(keyz => {
              if (arrKey.includes(keyz)) { // 存在价格字段
                itemz[keyz + 'Show'] = this.fen2yuan(itemz[keyz])
              }
            })
          })
        }
      })
      if (weightKeys.length > 0) {
        data.records.map(item => {
          Object.keys(item).map(key => {
            if (weightKeys.includes(key)) { // 存在价格字段
              item[key + 'WeightShow'] = this.g2kg(item[key])
            }
          })
          if (detailsProp) {
            item[detailsProp].map(itemz => {
              Object.keys(itemz).map(keyz => {
                if (weightKeys.includes(keyz)) { // 存在价格字段
                  itemz[keyz + 'WeightShow'] = this.g2kg(itemz[keyz])
                }
              })
            })
          }
        })
      }
      return data
    },
    // 批发结算
    mixin_auto_whs_settle_amount(arg1, arg2, arg3) { // 计算费用单总金额
      const temp = new this.DECIMAL(arg1 || '0').sub(arg2 || '0').sub(arg3 || '0').toNumber()
      return temp
    },
    mixin_auto_commission(arg1, arg2) { // 佣金计算
      return new this.DECIMAL(arg1 || 0).mul(arg2 || 0).mul('0.01').toNumber()
    },
    mixin_auto_fee_amount() { // 费用合计计算
      const arr = this.Mixin_tabDate.map(item => item.costList ? item.costList.map(i => i.feePrice || '0').reduce((p, c) => this.DECIMAL.add(p, c).toNumber(), 0) : 0)
      return arr.reduce((p, c) => this.DECIMAL.add(p, c).toNumber(), 0)
    },
    // DECIMAL处理
    mixin_auto_total_cost(arg1) { // 计算费用单总金额
      return arg1.map(item => item.fee || '0').reduce((prev, curr) => this.DECIMAL.add(prev, curr).toNumber(), 0)
    },
    // 保留小数后2位有效数字
    mixin_auto_amount(arg1, arg2) { // 自动计算表格金额
      console.log('表格金额计算:', arg1, arg2)
      if (isNaN(arg1)) {
        return ''
      } else {
        const temp = new this.DECIMAL(arg1 || '0').mul(arg2 || '0').mul('0.001').toFixed(0)
        // temp = this.DECIMAL.mul(temp, '10000').toNumber()
        return temp
      }
    },
    // 保留小数后2位有效数字
    mixin_auto_total_amount(arg) { // 自动总金额计算
      console.log('自动计算总金额')
      console.log(this.Mixin_tabDate)
      return this.Mixin_tabDate.map(item => (Number(item[arg]) || 0)).reduce((curr, perv) => this.DECIMAL.add(curr, perv).toNumber(), 0) || ''
    },
    mixin_auto_tab_length() { // 自动计算总条数
      console.log('自动计算总条数', this.Mixin_tabDate.length)
      return this.Mixin_tabDate.length
    },
    mixin_auto_add_amount(arg1, arg2) { // 自动计算合计
      console.log('自动计算合计', arg1, arg2)
      return this.DECIMAL.add(arg1 || '0', arg2 || '0').toNumber()
    },
    // 通过条件计算总金额
    mixin_auto_total_amount_by_condition(arg1, arg2) { // 自动总金额计算
      console.log('自动计算条件总金额', arg2)
      return this.ArrSomeFilter(this.Mixin_tabDate, arg2).map(item => this.DECIMAL.add(item[arg1] || 0, item.discountAmount || '0').toNumber()).reduce((curr, perv) => this.DECIMAL.add(curr, perv).toNumber(), 0) || ''
    },
    // 供应商单算
    mixin_auto_total_amount_by_condition_supplier(arg1, arg2) { // 供应商费用总金额计算
      console.log('自动计算供应商费用总金额', arg2, arg1)
      // return this.ArrFilter(this.Mixin_tabDate, arg2).map(item => (Number(item[arg1]) || 0) + (Number(item.discountAmount) || 0)).reduce((curr, perv) => (curr + perv), 0) || ''
      return this.ArrFilter(this.Mixin_tabDate, arg2).map(item => this.DECIMAL.add(item[arg1] || '0', (item.discountAmount || '0')).toNumber()).reduce((curr, perv) => this.DECIMAL.add(curr, perv).toNumber(), 0) || ''
    },

    mixin_check_amount(rule, value, callback) { // 金额空值检验
      if (value === '' || value === 0 || Number(value) === 0) {
        callback(new Error('金额不能为空'))
      } else {
        callback()
      }
    },
    // 保留小数后2/6位有效数字
    mixin_auto_price(arg1, arg2, arg3 = 0) { // 采购单价计算
      console.log('单价自动计算:', arg1, arg2)
      if (Number(this.g2kg(arg2)) !== 0 && arg1) {
        return new this.DECIMAL(arg1).add(arg3).div(arg2).mul('1000').toFixed(0) * 1
      } else {
        return 0
      }
    },
    mixin_auto_pur_num_weight(arg1, arg2 = 0, arg3 = 0, arg4 = false) { // 采购数量计算
      let res = ''
      if (arg4) { // 称重品
        const temp = this.DECIMAL.mul(arg2 || 0, arg3 || 0).toNumber()
        res = this.DECIMAL.sub(arg1 || 0, temp).toNumber()
      } else {
        res = this.DECIMAL.mul(arg2 || 0, arg3 || 0).toNumber()
      }
      return res
    },
    mixin_auto_pur_weight_diff(arg1, arg2) { // 采购数量差异计算
      console.log('差异自动计算：', arg1, arg2)
      if (arg1 !== '' && arg1 !== undefined && arg2 !== '') {
        console.log('计算值：', this.DECIMAL.sub(arg1, arg2).toNumber())
        return this.DECIMAL.sub(arg1, arg2).toNumber()
      }
      return ''
    },
    mixin_auto_form_diff(arg1, arg2) { // 表单差异计算
      console.log('差异计算')
      return this.DECIMAL.sub(this.mixin_form[arg1] || 0, this.mixin_form[arg2] || 0).toNumber()
    },
    mix_comp_buttons_show(val) {
      switch (this.operateItem.prop) {
        case 'insert':
          if (val.insertShow !== undefined) {
            return val.insertShow
          }
          return true
        case 'detail':
          return typeof val.detailShowArgs === 'boolean' ? val.detailShowArgs : Object.keys(val.detailShowArgs).every(key => this.currentRow[key] === val.detailShowArgs[key])
        case 'edit':
          return typeof val.detailShowArgs === 'boolean' ? val.detailShowArgs : Object.keys(val.editShowArgs).every(key => this.currentRow[key] === val.editShowArgs[key])
        default:
          return false
      }
    }
  }
}
</script>

<style scoped>

</style>
