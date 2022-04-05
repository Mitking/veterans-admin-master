<template>
  <div>
    <keep-alive :max="5" :exclude="['CoreCompForm','ProductAdd']">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :form="formDetails"
        :form-data="operateItem.prop==='detail'?table_data_arr_detail:table_data_arr"
        :form-data-table="table_data_arr"
        :price_list="priceList"
        :combo_list="comboList"
        :operate-item="operateItem"
        :current-row="currentRow"
        :show="formShow"
        :detail_show="detailFormShow"
        :details="details"
        :edit-detail-disable="editDetailDisable"
        :detail_table_buttons="detail_table_buttons"
        v-bind="$attrs"
        v-on="$listeners"
        @rowsList="rowsList"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @changeTableArr="changeTableArr"
      />
    </keep-alive>
    <!-- 商品详情弹窗 -->
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
        :form-data="table_data_arr_detail"
        :operate-item="operateItem"
        :details="details"
        :price_list="priceList"
        :combo_list="comboList"
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
import { addStoreProduct, updateStoreProduct } from '@/api/core/storeproduct'
import CoreForm from '@/views/core/components/CoreForm'
import CoreCompForm from '@/views/core/components/CoreCompForm'
import Order from './storeproduct'
import { getProductDetail, getComboList } from '@/api/core/product'
import ProductAdd from '@/views/core/product/components/ProductAdd'
export default {
  name: 'StoreProductIndex',
  components: { Order, CoreCompForm, CoreForm, ProductAdd },
  // 全局常用字段 readonly
  mixins: [MixinGlobal],
  data() {
    return {
      detailFormShow: false,
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [],
      table_data_arr_def: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: false, detailShow: false, addFatherProp: 'Reqq' },
        { title: '门店(可多选)', prop: 'storeIds', show: false, type: 'storeIds', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: true, disabled: false, editShow: false, formWidth: '50%', formItemWidth: 350, detailShow: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'blur' }] },
        { title: '档案代码', width: 180, copy: true, prop: 'goodsCode', fontWidth: 10, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '规格条码', width: 100, copy: true, prop: 'barcode', fontWidth: 14, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '商品名称', prop: 'goodsName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Reqq' },
        { title: '所属门店', prop: 'storeId', show: true, formWidth: this.$store.getters.accountType === 1 ? '30%' : '50%', type: 'storeIdList', selectData: 'stores', defaultValue: this.$store.getters.accountType === 1 ? [this.$store.getters.storeId] : [], selectOption: { label: 'name', value: 'id' }, readonly: this.$store.getters.accountType === 1, editShow: false, detailShow: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'blur' }] },
        { title: '销售单位', width: 100, prop: '', show: true, type: 'selectObj', selectData: 'weight_type', editShow: false, detailShow: false, addFatherProp: 'Reqq' },
        { title: '库存总数量', width: 120, prop: 'totalStockNum', show: true, type: 'weight_number', editShow: false, detailShow: true, addFatherProp: 'Reqq' },
        { title: '库存总个数', width: 120, prop: 'totalStockCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Reqq' },
        { title: '是否停售', width: 100, prop: 'stopSale', show: true, type: 'if_type', defaultValue: false, editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '是否积分', width: 100, prop: 'whetherScore', show: true, type: 'if_type', defaultValue: true, editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '特殊品', width: 100, prop: 'whetherSpecial', show: true, type: 'if_type', defaultValue: false, editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '是否计数', width: 100, prop: 'whetherCount', show: true, type: 'if_type', defaultValue: false, editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '允许负库存', width: 120, prop: 'negativeInventory', show: true, type: 'if_type', defaultValue: true, editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '允许调价', width: 100, prop: 'whetherAdjustmentPrice', show: false, type: 'if_type', defaultValue: true, editShow: false, detailShow: false, addFatherProp: 'Reqq', readonly: false },
        { title: '新奇货', width: 100, prop: 'whetherNovel', show: true, type: 'if_type', defaultValue: false, editShow: false, detailShow: true, addFatherProp: 'Reqq', readonly: false },
        { title: '称重商品', width: 100, prop: 'whetherWeigh', show: true, type: 'if_type', defaultValue: true, selectData: 'weight_type', editShow: false, detailShow: true, addFatherProp: 'Reqq' },
        { title: '优惠劵可用', width: 120, prop: 'whetherCoupon', show: true, type: 'if_type', defaultValue: true, selectData: 'weight_type', editShow: false, detailShow: true, addFatherProp: 'Reqq' },
        // { title: '销项税率', width: 100, prop: 'saleTaxRate', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '允许赠送', width: 100, prop: 'whetherHandsel', show: true, type: 'if_type', defaultValue: true, editShow: false, detailShow: true, addFatherProp: 'Req' },

        { title: '所属门店', prop: 'storeId', show: false, placeholder: '门店不可改', type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: true, editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', fontWidth: 12, show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableWidth: 200,
          rule: [{ required: true, message: '请选择产品', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tableWidth: 300, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '分类', prop: 'goodsCategoryId', tableWidth: 150, show: false, defaultValue: '与所选商品同步', readonly: true, type: 'select', selectData: 'categoryList', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      table_data_arr_select_by_order: [
        { title: '档案代码', width: 180, prop: 'goodsCode', fontWidth: 10, show: true, type: 'text' },
        { title: '商品名称', prop: 'goodsName', show: true, type: 'text' },
        { title: '规格', width: 100, prop: 'spec', show: true, type: 'text' },
        { title: '单价', width: 100, prop: 'price', show: true, type: 'PRICE' },
        { title: '数量', width: 100, prop: 'num', show: true, type: 'weight_number' },
        { title: '个数', width: 100, prop: 'count', show: true, type: 'text' },
        { title: '销售单位', width: 100, prop: 'weightType', show: true, type: 'select', selectData: 'weight_type' },
        { title: '所属门店', width: 220, prop: 'storeId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }},
        { title: '是否计数', width: 100, prop: 'whetherCount', show: true, type: 'if_type' }
      ],
      table_data_arr_detail: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: '商品分类', prop: 'goodsCategoryId', disabled: false, show: false, type: 'goodsCategory', selectData: 'categoryList', selectOption: { value: 'id', label: 'name' }, formShow: true, addFather: 'basics',
          rule: [{ required: true, message: '商品分类不能为空', trigger: 'change' }] },
        { title: '商品代码', prop: 'goodsCode', readonly: true, show: true, type: 'text', formShow: true, addFather: 'basics', placeholder: '无需填写，系统生成',
          rule: [{ required: true, message: '请选择商品分类自动生成', trigger: 'change' }] },
        { title: '规格条码', prop: 'barcode', show: true, placeholder: '系统生成,可修改', type: 'text', formShow: true, addFather: 'basics', readonly: false },
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
        { title: '乐檬商品编码', prop: 'itemNum', show: false, placeholder: '不绑定乐檬不填写', decimal: 0, type: 'Number', float: { max: 999999999 }, formShow: true, addFather: 'marketing' },
        { title: '是否称重', prop: 'whetherWeigh', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '允许负库存', prop: 'negativeInventory', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '是否积分', prop: 'whetherScore', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '可用优惠劵', prop: 'whetherCoupon', show: false, type: 'if_type', defaultValue: true, formShow: true, addFather: 'marketing' },
        { title: '允许调价', prop: 'whetherAdjustmentPrice', show: false, type: 'if_type', defaultValue: true, formShow: false, addFather: 'marketing' },
        { title: '停购', prop: 'stopBuy', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '停售', prop: 'stopSale', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
        { title: '允许赠送', prop: 'whetherHandsel', show: false, type: 'if_type', defaultValue: false, formShow: true, addFather: 'marketing' },
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
        { title: '采购单位转化率', prop: 'purRate', show: false, type: 'number', disabled: true, float: { decimal: 3, max: 999 }, placeholder: '采购单位转基本单位数', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '采购单位转化率必填', trigger: 'change' }] },
        { title: '库存单位', prop: 'stockWeightType', show: false, type: 'select', disabled: true, selectData: 'weight_type', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '库存单位必填', trigger: 'change' }] },
        { title: '库存单位转化率', prop: 'stockRate', show: false, type: 'number', disabled: true, float: { decimal: 3, max: 999 }, placeholder: '库存单位转基本单位数', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '库存单位转化率必填', trigger: 'change' }] },
        { title: '销售单位', prop: 'saleWeightType', show: false, type: 'select', disabled: true, selectData: 'weight_type', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '销售单位必填', trigger: 'change' }] },
        { title: '销售单位转化率', prop: 'saleRate', show: false, type: 'number', disabled: true, float: { decimal: 3, max: 999 }, placeholder: '销售单位转基本单位数', formShow: true, addFather: 'unitConversionRateReq',
          rule: [{ required: true, message: '销售单位转化率必填', trigger: 'change' }] },
        { title: '乐檬库存单位转化率', prop: 'lemengStockRate', show: false, type: 'number', float: { decimal: 3, max: 999 }, placeholder: '不绑定乐檬不填写',
          formShow: true, addFather: 'unitConversionRateReq' },
        { title: '算法编号', prop: 'algCode', show: false, type: 'select', selectData: 'algList', selectOption: { value: 'algCode', label: 'algName' }, formShow: true, addFather: 'price_list', width: 200 },

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
      ],
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'ProductIndex' }
      ],
      table_data_arr_temp: [],
      detailsList: [],
      details: [], // 详细数据
      formDetails: {}, // 接口详情
      priceList: false,
      comboList: []
    }
  },
  computed: {
    formShow() {
      return ['CoreCompForm', 'ProductAdd'].includes(this.currentComponent)
    },
    editDetailDisable() {
      return ['edit', 'edits'].includes(this.operateItem.prop)
    }
  },
  watch: {
    searchFormShow() {
      this.search_form_height = this.$refs.Comp.$refs.searchForm
    }
  },
  created() {
    this.table_data_arr = this.table_data_arr_def
  },
  methods: {
    changeTableArr(e) {
      this.table_data_arr = e ? this.table_data_arr_select_by_order : this.table_data_arr_def
    },
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
    rowsList(e, ids) {
      // this.detailsList = e.map(item => ({ storeId: item.storeId, goodsCode: item.goodsCode, goodsName: item.goodsName }))
      this.detailsList = e
      this.ids = ids
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.table_data_arr_temp = this.deepClone(this.table_data_arr)
      this.operateItem = operateItem
      operateItem.loading = true

      if (['detail'].includes(operateItem.prop)) { // 详情
        const PArr = [
          getProductDetail({ goodsCode: this.currentRow.goodsCode, storeId: this.currentRow.storeId })
        ]
        if (this.currentRow.goodsType === '2') {
          PArr.push(getComboList({ 'goodsParentCode': this.currentRow.goodsCode }))
        }
        Promise.all(PArr)
          .then(res => {
            if (res.every(resCode => resCode.code === 200)) {
              operateItem.loading = false
              const temp = Object.assign(this.deepClone(this.currentRow), res[0].data)
              if (res[1]) { // 组合品
                this.comboList = res[1].data
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
      if (operateItem.prop === 'insert') { // 新增
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'editShow', [1, 2].includes(this.$store.getters.accountType))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeIds', 'editShow', [0, 3].includes(this.$store.getters.accountType))
        // this.$set(this.table_data_arr[1], 'editShow', true)
        this.details = [{}]
        // this.table_data_arr[1].editShow = false
        // this.table_data_arr[2].editShow = true
        // this.mixin_arr_edit_by_prop(this.ArrFilter(this.table_data_arr, { addFatherProp: 'detailReqs' }), 'storeId', 'editShow', false)
        this.currentComponent = 'CoreCompForm'
        operateItem.loading = false
        // }
        // })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      console.log(arg)
      switch (arg.action || arg) {
        case 'close': case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          this.table_data_arr = this.table_data_arr_temp // 还原数据结构
          break
        case 'review': // 审核
          this.review()
          this.table_data_arr = this.table_data_arr_temp // 还原数据结构
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length === 0) {
            this.$message.error('商品列表不可以为空')
            this.loading = false
            return
          } else {
            data.goodsInfos = data.detailReqs.map(item => ({ goodsCode: item.goodsCode, goodsCategoryId: item.goodsCategoryId }))
          }
          delete data.detailReqs
          data.Req.storeIds = data.Req.storeId.length ? data.Req.storeId : data.Req.storeIds
          delete data.Req.storeId
          data = Object.assign(data, data.Req)
          delete data.Req

          // data.ids = []
          addStoreProduct(data).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.currentComponent = 'Order'
              this.table_data_arr = this.table_data_arr_temp // 还原数据结构
            }
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': case 'edits': // 修改,批量修改
          data.ids = arg === 'edits' ? this.ids : [this.currentRow.id]
          data = Object.assign(data, data.Req)
          // data.storeIds = arg === 'edits' ? data.storeIds : [this.currentRow.storeId]
          data.storeIds = [data.detailReqs[0].storeId]
          delete data.Req
          delete data.id
          delete data.detailReqs
          updateStoreProduct(data).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.currentComponent = 'Order'
              this.table_data_arr = this.table_data_arr_temp // 还原数据结构
            }
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        default:
          console.log(arg, data)
          this.table_data_arr = this.table_data_arr_temp // 还原数据结构
      }
    }
  }
}
</script>
<style scoped>

</style>
