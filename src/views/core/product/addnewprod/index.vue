<template>
  <div>
    <keep-alive :max="2" exclude="ProductAdd">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :form="formDetails"
        :show="currentComponent"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :price_list="priceList"
        :combo_list="comboList"
        :delete_tag_ids="deleteTagIds"
        :img-data="imageData"
        :imgloading="imageLoading"
        :detail_show="detailFormShow"
        v-bind="$attrs"
        @openModel="openModel"
        @formSave="formSave"
        @freshimg="freshImg"
        @currentSelect="currentRow=$event"
        @reset="reset"
        v-on="$listeners"
      />
    </keep-alive>
    <el-dialog
      class="my-class"
      title="商品详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'ProductAdd'"
        :form="formDetails"
        :show="detailFormShow?'ProductAdd':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :price_list="priceList"
        :combo_list="comboList"
        :img-data="imageData"
        :imgloading="imageLoading"
        :is_child="$attrs.is_child"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import ProductImg from '@/views/core/product/components/ProductImg'
import pinyin from 'chinese-to-pinyin'
import {
  getProductDetail,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductPrice,
  getComboList,
  // calculatePrice, match
  getProductWeightingBarcode
} from '@/api/core/product'
import { queryImgByGoodsCode } from '@/api/core/productimg'
import ProductAdd from '@/views/core/product/components/ProductAdd'
import Product from './addnewprod.vue'
export default {
  name: 'AddNewProd',
  components: { ProductAdd, Product, ProductImg },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const checkLemeng = (rule, value, callback) => {
      if (!!this.formDetails.itemNum && !value) {
        callback(new Error('乐檬单位转化率必填'))
      } else {
        callback()
      }
    }

    return {
      detailFormShow: false, // 弹窗详情
      deleteTagIds: [], // 标签删除
      imageLoading: false,
      imageData: [],
      priceList: [], // 价格列表
      comboList: [], // 组合品列表
      formDetails: { goodsName: '' },
      details: {}, // 详细信息
      currentRows: [], // 已打钩信息
      currentComponent: 'Product',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      tableData: {
        records: [],
        total: 0
      },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: '商品分类', prop: 'goodsCategoryId', disabled: false, show: false, type: 'goodsCategory', selectData: 'categoryList', selectOption: { value: 'id', label: 'name' }, formShow: true, addFather: 'basics',
          rule: [{ required: true, message: '商品分类不能为空', trigger: 'change' }] },
        { title: '商品代码', prop: 'goodsCode', readonly: true, show: true, type: 'text', formShow: true, addFather: 'basics', placeholder: '无需填写，系统生成',
          rule: [{ required: true, message: '请选择商品分类自动生成', trigger: 'change' }] },
        { title: '规格条码', prop: 'barcode', show: true, placeholder: '系统生成,可修改', type: 'text', formShow: true, addFather: 'basics', readonly: false,
          rule: [
            { required: true, message: '条码不能为空', trigger: 'change' }
          ] },
        { title: '商品名称', prop: 'goodsName', show: true, type: 'text', formShow: true, addFather: 'basics',
          rule: [{ required: true, message: '请填写商品名称', trigger: 'change' }] },
        { title: '商品速记码', prop: 'shorthandCode', show: true, type: 'text', formShow: true, addFather: 'basics',
          rule: [{ required: true, message: '请填写速记码', trigger: 'change' }] },
        { title: '规格', prop: 'spec', show: true, placeholder: '基础单位/采购单位', type: 'text', formShow: true, addFather: 'basics',
          rule: [{ required: true, message: '规格不能为空', trigger: 'change' }] },
        { title: '商品类型', prop: 'goodsType', show: true, type: 'select', formItemWidth: 120, readonly: true, selectData: 'goods_type', defaultValue: '1', formShow: true, addFather: 'basics' },
        { title: '品牌', prop: 'brandId', show: false, type: 'select', selectData: 'brandList', selectOption: { label: 'name', value: 'id' }, formShow: true, addFather: 'basics' },
        { title: '产地', prop: 'place', show: false, type: 'text', formShow: true, addFather: 'basics' },
        { title: '经营方式', prop: 'mode', show: false, type: 'select', formItemWidth: 100, selectData: 'opera_type', formShow: true, addFather: 'basics' },
        // fa_show: { mode: '2' }
        { title: '联营扣率', prop: 'deductionRate', suffixType: 'text', suffix: '%', type: 'number', float: { max: 100 }, formItemWidth: 100, show: false, formShow: true, addFather: 'basics' },
        { title: '标签', prop: 'label', show: false, type: 'text', formShow: true, addFather: 'basics',
          rule: [{ max: 5, message: '标签长度不能大于5', trigger: 'change' }] },
        { title: '等级', prop: 'level', show: false, type: 'select', selectData: 'product_level', formShow: true, addFather: 'basics' },
        { title: '含糖率', prop: 'sugarRate', show: false, suffixType: 'text', suffix: '%', type: 'number', formItemWidth: 100, float: { decimal: 2, max: 100 }, formShow: true, addFather: 'basics' },
        { title: '口感', prop: 'flavorId', show: false, type: 'select', selectData: 'FlavorList', selectOption: { value: 'id', label: 'name' }, formShow: true, addFather: 'basics' },
        { title: '应季月份', prop: 'season', show: false, type: 'text', formShow: true, addFather: 'basics' },
        { title: '售卖类型', prop: 'saleType', defaultValue: '0', show: false, formItemWidth: 100, type: 'select', selectData: 'sale_type', formShow: true, addFather: 'basics' },
        { title: '进项税率', prop: 'inputTaxRate', show: false, type: 'number', float: { max: 100 }, formItemWidth: 100, suffixType: 'text', suffix: '%', formShow: true, addFather: 'basics' },
        { title: '销项税率', prop: 'saleTaxRate', show: false, type: 'number', float: { max: 100 }, formItemWidth: 100, suffixType: 'text', suffix: '%', formShow: true, addFather: 'basics' },

        { title: '存储方式', prop: 'storageMode', formItemWidth: 100, show: false, type: 'select', selectData: 'storage', formShow: true, addFather: 'storage' },
        { title: '重量', prop: 'weight', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        { title: '皮重量', prop: 'tare', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        { title: '净重量', prop: 'netWeight', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        { title: '长', prop: 'length', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        { title: '宽', prop: 'width', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        { title: '高', prop: 'height', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        { title: '体积', prop: 'volume', show: false, type: 'text', formShow: true, addFather: 'storage', formItemWidth: 100 },
        // { title: '基础库存', prop: 'baseStock', show: false, type: 'number', float: { decimal: 3 }, formShow: true, addFather: 'storage', formItemWidth: 100 },
        // { title: '周转天数', prop: 'turnoverDay', show: false, type: 'Number', float: { max: 365 }, suffixType: 'text', suffix: '天', formShow: true, addFather: 'storage', formItemWidth: 100 },
        // { title: '首次入仓时间', prop: 'firstStorageTime', show: false, type: 'text', formShow: false, addFather: 'storage' },
        // { title: '周转率', prop: 'turnoverRate', formItemWidth: 100, suffixType: 'text', suffix: '%', type: 'number', float: { max: 100 }, show: false, formShow: true, addFather: 'marketing' },

        { title: '乐檬商品编码', prop: 'itemNum', show: false, placeholder: '不绑定乐檬不填写', decimal: 0, type: 'Number', float: { max: 999999999 }, formShow: true, addFather: 'marketing' },
        { title: '同步门店', prop: 'ifSyncToStore', show: false, type: 'if_type', defaultValue: true, formShow: false, addFather: 'marketing' },
        { title: '是否称重', prop: 'whetherWeigh', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        // { title: '是否减库存', prop: 'subtractStock', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '允许负库存', prop: 'negativeInventory', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '是否积分', prop: 'whetherScore', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '可用优惠劵', prop: 'whetherCoupon', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '允许调价', prop: 'whetherAdjustmentPrice', show: false, type: 'if_type', defaultValue: true, formShow: false, addFather: 'marketing' },
        { title: '停购', prop: 'stopBuy', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '允许赠送', prop: 'whetherHandsel', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '停售', prop: 'stopSale', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '是否特殊商品', prop: 'whetherSpecial', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '是否新品', prop: 'whetherNew', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '是否新奇货', prop: 'whetherNovel', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '是否计数', prop: 'whetherCount', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '是否分拣', prop: 'whetherSorted', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },

        { title: '主键', prop: 'id', show: false, type: 'text', defaultValue: null, formShow: false, addFather: 'unitConversionRateReq' },
        { title: '基本单位', prop: 'basicWeightType', show: false, type: 'select', selectData: 'weight_type', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '基本单位必填', trigger: 'change' }] },
        { title: '采购单位', prop: 'purWeightType', show: false, type: 'select', disabled: true, selectData: 'weight_type', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '采购单位必填', trigger: 'change' }] },
        { title: '采购单位转化率', prop: 'purRate', show: false, type: 'number', defaultValue: '1', disabled: true, float: { decimal: 3, max: 999 }, placeholder: '采购单位转基本单位数', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '采购单位转化率必填', trigger: 'change' }] },
        { title: '库存单位', prop: 'stockWeightType', show: false, type: 'select', disabled: true, selectData: 'weight_type', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '库存单位必填', trigger: 'change' }] },
        { title: '库存单位转化率', prop: 'stockRate', show: false, type: 'number', defaultValue: '1', disabled: true, float: { decimal: 3, max: 999 }, placeholder: '库存单位转基本单位数', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '库存单位转化率必填', trigger: 'change' }] },
        { title: '销售单位', prop: 'saleWeightType', show: false, type: 'select', disabled: true, selectData: 'weight_type', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '销售单位必填', trigger: 'change' }] },
        { title: '销售单位转化率', prop: 'saleRate', show: false, type: 'number', defaultValue: '1', disabled: true, float: { decimal: 3, max: 999 }, placeholder: '销售单位转基本单位数', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '销售单位转化率必填', trigger: 'change' }] },
        { title: '乐檬库存单位转化率', prop: 'lemengStockRate', show: false, type: 'number', defaultValue: '', float: { decimal: 3, max: 999 }, placeholder: '不绑定乐檬不填写',
          formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ validator: checkLemeng, trigger: 'blur' }] },

        // { title: '主键', prop: 'id', show: false, type: 'text', formShow: true },
        // { title: '价格类型', prop: 'priceType', show: false, type: 'select', selectData: 'price_type', readonly: true, formShow: true, width: 150, addFather: 'price_list' },
        // { title: '是否启用', prop: 'priceUseState', show: false, defaultValue: true, type: 'if_type', formShow: true, addFather: 'price_list', width: 100 },
        // { title: '金额', prop: 'amount', placeholder: '', show: false, type: 'PRICE', formShow: true, addFather: 'price_list', width: 150,
        //   rule: [{ validator: checkAmount, trigger: 'change' }] },
        { title: '算法编号', prop: 'algCode', show: false, type: 'select', selectData: 'algList', selectOption: { value: 'algCode', label: 'algName' }, formShow: true, addFather: 'price_list', width: 200 },
        // { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', disabled: true, formShow: false, addFather: 'price_list' },

        { title: '组合品id', prop: 'id', show: false, type: 'text', formShow: false, addFather: 'combo_list' },
        { title: '父级商品代码', prop: 'goodsParentCode', show: false, type: 'text', formShow: false, disabled: true, addFather: 'combo_list' },
        { title: '子品代码', prop: 'goodsCode', show: false, type: 'ProductSelect', formShow: true, addFather: 'combo_list',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '子品名', prop: 'goodsName', show: false, type: 'ProductSelect', formShow: true, addFather: 'combo_list' },
        { title: '扣减库存数量', prop: 'comboNum', show: false, type: 'text', formShow: true, addFather: 'combo_list',
          rule: [{ required: true, message: '不能为空', trigger: 'blur' }] },
        { title: '销售计量单位', prop: 'saleMeasurementUnit', show: false, type: 'select', selectData: 'weight_type', formShow: true, addFather: 'combo_list',
          rule: [{ required: true, message: '计量单位不能为空', trigger: 'blur' }] },
        { title: '是否停售', prop: 'stopSale', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'combo_list' }

        // // 价格属性
        // { title: '零售价', prop: 'price', show: true, type: 'PRICE', defaultValue: false, formShow: false },
        // { title: '成本价', prop: 'costPrice', show: true, type: 'PRICE', defaultValue: false, formShow: false },
        // { title: '采购价', prop: 'purPrice', show: true, type: 'PRICE', defaultValue: false, formShow: false },
        // { title: '会员价', prop: 'memberPrice', show: true, type: 'PRICE', defaultValue: false, formShow: false }

      ]
    }
  },
  computed: {},
  watch: {
    'formDetails.goodsName': {
      handler(n) {
        if (['insert', 'copy', 'edit'].includes(this.operateItem.prop) && n !== null) {
          this.formDetails.shorthandCode = pinyin(n, { firstCharacter: true, removeTone: true, removeSpace: true, keepRest: true }).toLocaleUpperCase()
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Product'
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    windowSelectable(row) {
      return !this.$attrs.table_goods_code_arr.includes(row.goodsCode)
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCategoryId', 'disabled', operateItem.prop === 'edit')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsType', 'readonly', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', !['insert', 'copy'].includes(operateItem.prop))
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'barcode', 'readonly', operateItem.prop !== 'insert')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'ifSyncToStore', 'formShow', ['insert', 'copy'].includes(operateItem.prop))
      this.operateItem = operateItem
      this.operateItem.loading = true
      switch (this.operateItem.prop) {
        case 'showImg': // 商品图片
          queryImgByGoodsCode({ 'goodsCode': this.currentRow.goodsCode }).then(res => {
            if (res.code === 200) {
              this.imageData = res.data
              this.operateItem.loading = false
              this.currentComponent = 'ProductImg'
            } else {
              this.$message.error(res.data)
            }
            this.operateItem.loading = false
          }).catch(err => {
            this.operateItem.loading = false
            throw err
          })
          break
        case 'detail':case 'edit':case 'copy': { // 详情 编辑 复制
          const PArr = [
            getProductDetail({ goodsCode: this.currentRow.goodsCode }),
            getProductPrice({ 'goodsCode': this.currentRow.goodsCode })
          ]
          if (this.currentRow.goodsType === '2') {
            PArr.push(getComboList({ 'goodsParentCode': this.currentRow.goodsCode }))
          }
          Promise.all(PArr)
            .then(res => {
              if (res.every(resCode => resCode.code === 200)) {
                operateItem.loading = false
                const temp = Object.assign(this.deepClone(this.currentRow), res[0].data)
                // temp.outProp = { itemNum: this.operateItem.prop === 'copy' ? '' : (temp.itemNum || ''), ifSyncToStore: false }
                temp.itemNum = this.operateItem.prop === 'copy' ? '' : (temp.itemNum || '')
                temp.ifSyncToStore = true
                this.priceList = [
                  { priceType: '2', id: null, amount: '0', amountShow: '0', algCode: '' },
                  { priceType: '3', id: null, amount: '0', amountShow: '0', algCode: '' },
                  { priceType: '4', id: null, amount: '0', amountShow: '0', algCode: '' },
                  { priceType: '5', id: null, amount: '0', amountShow: '0', algCode: '' },
                  { priceType: '8', id: null, amount: '0', amountShow: '0', algCode: '' }
                ]
                if (this.operateItem.prop !== 'copy') {
                  this.priceList.map((item, index) => {
                    const f = res[1].data.filter(inItem => inItem.priceType === item.priceType)
                    if (f.length >= 1) { // 过滤价格表
                      this.priceList[index] = Object.assign(this.priceList[index], f[0])
                      if (['2', '3'].includes(item.priceType)) {
                        this.priceList[index].amountShow = this.fen2yuan6cover(f[0].amount)
                      } else {
                        this.priceList[index].amountShow = this.fen2yuan(f[0].amount)
                      }
                    // if (this.operateItem.prop === 'copy') {
                    //   this.priceList[index].id = null
                    // }
                    }
                  })
                }
                if (res[2]) { // 组合品
                  this.comboList = res[2].data
                }
                if (this.operateItem.prop === 'copy') { // 商品复制
                  temp.goodsCategoryId = ''
                  temp.goodsCode = ''
                  temp.goodsName += '(复制)'
                  getProductWeightingBarcode({ prefix: 1234 }).then(res => { // 获取条码号
                    if (res.code === 200) {
                      temp.barcode = res.data
                      this.formDetails = this.deepClone(temp)
                      this.currentComponent = 'ProductAdd'
                    }
                  }).finally(() => {
                    this.operateItem.loading = false
                  })
                  return
                }

                this.formDetails = this.deepClone(temp)
                if (this.$attrs.is_child) { // 选品弹窗展示详情
                  this.detailFormShow = true
                  return
                }
                this.currentComponent = 'ProductAdd'
              } else {
                this.$message.error(res[0].message)
              }
            }).catch(err => {
              operateItem.loading = false
              throw err
            })
        }
          break
        case 'insert': // 新增
          {
            const form_temp = {}
            this.ArrSomeFilter(this.table_data_arr, { addFather: ['basics', 'storage', 'marketing'] }).map(item => {
              form_temp[item.prop] = typeof item.defaultValue === 'undefined' ? null : item.defaultValue
            })
            form_temp.unitConversionRateRes = {}
            this.ArrFilter(this.table_data_arr, { addFather: 'unitConversionRateReq' }).map(item => {
              form_temp.unitConversionRateRes[item.prop] = item.defaultValue === undefined ? this.currentRow.unitId : item.defaultValue
            })
            // form_temp.outProp = { itemNum: '', ifSyncToStore: true }
            this.formDetails = form_temp

            this.priceList = [
              { priceType: '2', id: null, amount: '0', amountShow: '0', algCode: '' },
              { priceType: '3', id: null, amount: '0', amountShow: '0', algCode: '' },
              { priceType: '4', id: null, amount: '0', amountShow: '0', algCode: '' },
              { priceType: '5', id: null, amount: '0', amountShow: '0', algCode: '' },
              { priceType: '8', id: null, amount: '0', amountShow: '0', algCode: '' }
            ]
            const combo_temp = {}
            this.ArrFilter(this.table_data_arr, { addFather: 'combo_list' }).map(item => {
              combo_temp[item.prop] = typeof item.defaultValue === 'undefined' ? null : item.defaultValue
            })
            this.comboList = [combo_temp]
            this.formDetails.goodsName = this.currentRow.name
            this.formDetails.spec = this.currentRow.spec
            getProductWeightingBarcode({ prefix: 1234 }).then(res => { // 获取条码号
              if (res.code === 200) {
                this.formDetails.barcode = res.data
                this.currentComponent = 'ProductAdd'
              }
            }).finally(() => {
              this.operateItem.loading = false
            })
          }
          break
      }
    },
    formSave(e) { // 提交回调处理
      if (e.action === 'close') {
        this.currentComponent = 'Product'
        return
      }
      switch (this.operateItem.prop) {
        case 'detail': // 详情
          this.currentComponent = 'Product'
          break
        case 'edit': case 'insert': case 'copy': // 修改,新增，复制
          {
            const temp = {}
            temp.addProductAchiveVo = this.deepClone(this.formDetails)
            temp.itemNum = temp.addProductAchiveVo.itemNum
            // temp.ifSyncToStore = temp.addProductAchiveVo.ifSyncToStore
            temp.ifSyncToStore = true
            temp.unitConversionRateReq = this.deepClone(this.formDetails.unitConversionRateRes)
            if (temp.unitConversionRateReq.goodsCode === undefined) { // 新增
              temp.unitConversionRateReq.goodsCode = temp.addProductAchiveVo.goodsCode
            }
            if (this.operateItem.prop === 'copy') { // 复制
              temp.unitConversionRateReq.goodsCode = temp.addProductAchiveVo.goodsCode
              temp.unitConversionRateReq.id = null
              temp.addProductAchiveVo.id = null
              delete temp.addProductAchiveVo.createTime
            }
            delete temp.addProductAchiveVo.unitConversionRateRes
            delete temp.addProductAchiveVo.outProp
            delete temp.addProductAchiveVo.itemNum
            delete temp.addProductAchiveVo.ifSyncToStore
            temp.priceVoList = this.priceList
            temp.priceVoList.map(item => { // 新增或复制
              if (item.goodsCode === undefined || this.operateItem.prop === 'copy') {
                item.goodsCode = temp.addProductAchiveVo.goodsCode
              }
            })
            if (temp.addProductAchiveVo.goodsType === '2') { // 组合品
              temp.comboVoList = this.$refs.Comp.$refs.combo_list.form.details
              temp.comboVoList.map(item => {
                item.goodsParentCode = this.formDetails.goodsCode
                if (item.goodsCode === undefined || this.operateItem.prop === 'copy') {
                  item.id = null
                }
              })
            }

            console.log('提交数据：', temp)
            if (e.action === 'edit') {
              delete temp.addProductAchiveVo.createTime
              updateProduct(temp).then(res => {
                this.message(res)
              })
            } else if (e.action === 'insert' || e.action === 'copy') {
              addProduct(temp).then(res => {
                this.message(res)
              })
            }
          }
          break
      }
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将删除商品「${this.currentRow.goodsName}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteProduct({ 'goodsCode': this.currentRow.goodsCode }).then(res => {
          this.message(res)
          operateItem.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        operateItem.loading = false
      })
    },
    freshImg() {
      this.imageLoading = true
      queryImgByGoodsCode({ 'goodsCode': this.currentRow.goodsCode }).then(res => {
        if (res.code === 200) {
          this.imageData = res.data
        }
      }).finally(() => {
        this.imageLoading = false
      })
    },
    rulerFunction(rule, value, callback) {
      if (value === null || value === '') {
        callback(new Error('请选择商品分类'))
      } else {
        callback()
      }
    },
    getPrice() {
      return new Promise(resolve => {
        if (['edit'].includes(this.operateItem.prop)) { // 详情，编辑
          getProductPrice({ 'goodsCode': this.$attrs['current-row'].goodsCode }).then(res => {
            if (res.code === 200) {
              resolve(res.data)
            } else {
              this.$message.error(res.data)
              resolve([])
            }
          })
        }
      })
    },
    reset(d0, d1, d2) {
      this.formDetails = this.deepClone(d0)
      this.price_list = this.deepClone(d1)
      this.combo_list = this.deepClone(d2)
      return Promise.resolve(true)
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
    }
  }
}
</script>

<style scoped>
.my-class >>> .el-dialog__body{
  padding:0;
  margin:10px 0;
  border-top:1px solid #cccccc;
  border-bottom:1px solid #cccccc;
}
.dialog-footer{
  margin-top: 30px;;
 }
</style>

