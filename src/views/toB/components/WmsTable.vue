<template>
  <div class="my-class">
    <div v-if="!($attrs['operate-item'].prop==='detail') && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']" style="margin: 10px 15px 15px 10px">
      <el-button
        v-for="(item,index) in $attrs.detail_table_buttons"
        v-show="item.show"
        :key="index"
        size="small"
        type="primary"
        plain
        @click="opFunc(item)"
      >
        {{ item.title }}
      </el-button>
    </div>
    <!--   :rules="rules" :rules="rules"-->
    <el-form ref="Form" :model="form">
      <el-table
        ref="TabItem"
        v-loading="tab_loading"
        class="my-class-table"
        highlight-current-row
        :data="form.details"
        :style="{width:table_width_total(ArrFilter($attrs['form-data'],propObj),{op:!($attrs['operate-item'].prop==='detail') && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable'],opWidth:100}),margin:'10px'}"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']"
          :width="100"
          fixed
        >
          <template slot="header">
            <div class="table-header">操作</div>
          </template>
          <template slot-scope="{row,$index}">
            <div class="operator-father">
              <i style="color:#409EFF" class="el-icon-delete" @click="deleteItem(row,$index)" />
              <i style="color:#409EFF" class="el-icon-circle-plus-outline" @click="addItem(row,$index)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="$attrs['table-select']" :selectable="windowSelectable" type="selection" width="50" align="center" />
        <el-table-column
          v-for="(item) in ArrFilter( $attrs['form-data'],propObj)"
          :key="item.prop"
          :width="item.tabWidth || ''"
        >
          <template slot="header">
            <span class="table-header">{{ item.autoFormTitleFn?item.autoFormTitleFn(null,$attrs.form_data):item.title }}
              <el-tooltip v-if="item.tipAddFn" popper-class="path-lint-to" placement="bottom" effect="light">
                <div slot="content" @click="item.tipAddFn">没有适合的选项,点此设置</div>
                <i class="el-icon-warning-outline" />
              </el-tooltip>
              <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="bottom" effect="light">
                <i class="el-icon-warning-outline" />
              </el-tooltip>
            </span>
          </template>
          <template slot-scope="{row,$index}">
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail' || $attrs['edit-detail-disable']" class="flex-center">
              <span style="line-height:1rem" @click="item.opreateClickFn?item.opreateClickFn(row):''">{{
                item.type==='select' && (MenuGetPropName((item.selectDataFn?item.selectDataFn(row).selectData:item.selectData),row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }))
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') ||
                  item.type==='PRICE' && fen2yuan(row[item.prop]) ||
                  item.type==='COST_PRICE' && fen2yuan6cover(row[item.prop]) ||
                  item.type==='PRICE_AUTOMATIC' && (fen2yuan(row[item.prop])) ||
                  item.type==='COST_PRICE_AUTOMATIC' && (fen2yuan6cover(row[item.prop])) ||
                  item.type==='COST_PRICE_SEMI_AUTOMATIC' && (fen2yuan6cover(row[item.prop])) ||
                  item.type==='PRICE_SEMI_AUTOMATIC' && (fen2yuan(row[item.prop])) ||
                  item.type==='number' && row[item.prop] ||
                  item.type==='weight_number' && g2kg(row[item.prop]) ||
                  item.type==='WEIGHT_AUTOMATIC' && g2kg(row[item.prop]) ||
                  item.type==='costList' && costListDeal(row,item) ||
                  item.type==='RATE' && rateDeal(row) ||
                  item.type==='func' && item.funcTitle ||
                  item.type==='fileNames' && '查看' ||
                  (row[item.prop]===0?0:(row[item.prop]==='0'?'-':(row[item.prop] || '-'))) }}
              </span>
              <span v-if="row[item.prop] && item.suffix"> {{ item.suffix }}</span>
              <el-button
                v-if="item.focusFn && item.autoFormPropFilter && item.focusFn(item,row,$index)"
                type="text"
                icon="el-icon-search"
                style="height:1rem;line-height:1rem;padding:0;margin-left:5px"
                @click="autoFormPropFilter=item.autoFormPropFilter;autoFormData=row;aoto_form_show=true"
              />
              <div v-if="item.type==='fileNames'">
                <el-button
                  type="text"
                  icon="el-icon-search"
                  @click="files=row.fileNames?row.fileNames.split(','):[];currRow=row;file_name_show=true"
                />
              </div>
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item v-else :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30px'}">
              <!-- 附件 baseUrl -->
              <div v-if="item.type==='fileNames'" style="display:flex;justifyContent:center">
                查看
                <el-button
                  type="text"
                  icon="el-icon-search"
                  @click="files=row.fileNames?row.fileNames.split(','):[];currRow=row;file_name_show=true"
                />
              </div>

              <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder || ''" />
              <!-- 链表选择 -->
              <el-input
                v-if="item.type==='selectFromPage'"
                v-model="row[item.prop]"
                :readonly="true"
                :placeholder="item.placeholder"
                @focus="if(item.focusFn){
                  if(item.focusFn(item,row,$index)){
                    opFunc(item,$index,row)
                  }
                  return
                }else{
                  opFunc(item,$index,row)
                }"
              />
              <el-input
                v-if="item.type==='Number'"
                v-model="row[item.prop]"
                v-number-input="item.float"
                :placeholder="item.placeholder"
                :disabled="typeof item.fn_disabled==='function' && item.fn_disabled(row)"
              >
                <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
                  <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
                </div>
              </el-input>
              <el-input
                v-if="item.type==='number'"
                v-model="row[item.prop]"
                v-number-input.float="comp_price_float(item,row,1)"
                :max-value="typeof item.maxValue==='function' && item.maxValue(row)"
                :disabled="typeof item.disabledFn==='function' && item.disabledFn(row)"
                :placeholder="item.placeholder"
              >
                <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
                  <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
                </div>
              </el-input>
              <!-- 费用 -->
              <el-input
                v-if="item.type==='costList'"
                v-model="row[item.prop]"
                v-number-input.float="{max:999999,decimal:2}"
                :readonly="item.readonly"
                :placeholder="item.placeholder || ''"
                @input="()=>{row.costList.filter(itemZ=>itemZ.feeId===item.feeId)[0].feePrice=yuan2fen(row[item.prop])}"
              />
              <!-- 重量 -->
              <el-input
                v-if="item.type==='weight_number'"
                v-model="row[item.prop+'WeightShow']"
                v-number-input.float="comp_price_float(item,row,1000)"
                :max-value="typeof item.maxValue==='function' && item.maxValue(row)"
                :readonly="item.readonly"
                :placeholder="item.placeholder || ''"
                :disabled="item.fn_disabled?item.fn_disabled(row):false"
                @input="()=>{
                  row[item.prop]=kg2g(row[item.prop+'WeightShow'])
                  if(item.inputFn){
                    item.inputFn(row)
                  }
                }"
                @focus="()=>{
                  if(item.focusFn){
                    item.focusFn(row)
                  }
                }"
              />
              <!-- v-model="row[item.prop+'PriceAutoShow']"  class="flex-center"   @input="()=>{row[item.prop]=yuan2fen(row[item.prop+'PriceAutoShow'])}"           <div v-if="item.type==='PRICE_AUTOMATIC'">{{ item.prop }}</div>-->
              <!-- 价格计算 -->
              <div v-if="item.type==='PRICE_AUTOMATIC'" class="flex-center">
                <span class="prefix">&yen;</span>
                {{ comp_price_auto(row,item) || '0.00' }}
              </div>

              <!-- 价格计算6位 -->
              <div v-if="item.type==='COST_PRICE_AUTOMATIC'" class="flex-center">
                <span class="prefix">&yen;</span>
                {{ comp_price_auto_cost(row,item) || '0.000000' }}
                <!-- <el-button
                  v-if="item.focusFn"
                  type="text"
                  icon="el-icon-edit"
                  style="height:1rem;line-height:1rem;padding:0;margin-left:5px"
                  @click="
                    if(item.focusFn && item.focusFn(item,row,$index)){
                      autoFormPropFilter=item.autoFormPropFilter
                      autoFormData=row
                      aoto_form_show=true
                    }"
                /> -->
              </div>
              <!-- <el-input
                v-if="item.type==='COST_PRICE_AUTOMATIC'"
                v-number-input.float="Object.assign({decimal:6,max:999999},item.float)"
                class="my-class-auto"
                :value="comp_price_auto_cost(row,item)"
                :placeholder="item.placeholder || '系统计算'"
                :readonly="true"
                @focus="if(item.focusFn && item.focusFn(item,row,$index)){
                  autoFormPropFilter=item.autoFormPropFilter
                  autoFormData=row
                  aoto_form_show=true
                }"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input> -->

              <!-- 价格半自动计算 -->
              <el-input
                v-if="item.type==='PRICE_SEMI_AUTOMATIC'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
                class="my-class-semi-auto"
                :placeholder="item.placeholder || '系统辅助计算'"
                :readonly="!!item.focusFn"
                @focus="if(item.focusFn && item.focusFn(item,row,$index)){
                  autoFormPropFilter=item.autoFormPropFilter
                  autoFormData=row
                  aoto_form_show=true
                }"
                @input="()=>{if(item.inputFn){item.inputFn(row,item)}}"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>
              <!-- 价格半自动计算6位 -->
              <el-input
                v-if="item.type==='COST_PRICE_SEMI_AUTOMATIC'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="Object.assign({decimal:6,max:999999},item.float)"
                class="my-class-semi-auto"
                :placeholder="item.placeholder || '系统辅助计算'"
                :readonly="!!item.focusFn"
                @focus="if(item.focusFn && item.focusFn(item,row,$index)){
                  autoFormPropFilter=item.autoFormPropFilter
                  autoFormData=row
                  aoto_form_show=true
                }"
                @input="()=>{if(item.inputFn){item.inputFn(row,item)}}"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>

              <!-- 重量计算 -->
              <div v-if="item.type==='WEIGHT_AUTOMATIC' && !item.focusFn" class="flex-center">
                {{ comp_weight_auto(row,item) || '0.00' }}
              </div>
              <el-input
                v-if="item.type==='WEIGHT_AUTOMATIC' && !!item.focusFn"
                v-number-input.float="Object.assign({decimal:3,max:99999999},item.float)"
                class="my-number-weight-class"
                :value="comp_weight_auto(row,item)"
                :placeholder="item.placeholder || '系统计算'"
                :readonly="true"
                @focus="if(item.focusFn && item.focusFn(item,row,$index)){
                  autoFormPropFilter=item.autoFormPropFilter
                  autoFormData=row
                  aoto_form_show=true
                }"
              />

              <!-- 个数计算 -->
              <div v-if="item.type==='NUMBER_AUTOMATIC'" class="flex-center">
                {{ comp_number_auto(row,item) || '0.00' }}
              </div>
              <!-- <el-input
                v-if="item.type==='NUMBER_AUTOMATIC'"
                v-number-input.float="Object.assign({decimal:2,max:99999999},item.float)"
                class="my-number-weight-class"
                :value="comp_number_auto(row,item)"
                :placeholder="item.placeholder || '系统计算'"
                :readonly="true"
              /> -->
              <!-- 价格 -->
              <el-input
                v-if="item.type==='PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="comp_price_float(item,row,100)"
                :readonly="item.readonly"
                :placeholder="item.placeholder || ''"
                class="my-class-price"
                @input="()=>{
                  row[item.prop]=yuan2fen(row[item.prop+'Show'])
                  if(item.inputFn){
                    item.inputFn(row)
                  }
                }"
              >
                <div v-if="!item.suffixType" slot="prefix">
                  <span>￥</span>
                </div>
                <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
                  <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
                </div>
              </el-input>

              <!-- 价格6位 -->
              <el-input
                v-if="item.type==='COST_PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="comp_price_float(item,row,1000000)"
                :readonly="item.readonly"
                :placeholder="item.placeholder || ''"
                class="my-class-price"
                @input="()=>{
                  row[item.prop]=yuan2fen6cover(row[item.prop+'Show'])
                  if(item.inputFn){
                    item.inputFn(row)
                  }
                }"
              >
                <div v-if="!item.suffixType" slot="prefix">
                  <span>￥</span>
                </div>
                <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
                  <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
                </div>
              </el-input>

              <el-select
                v-if="item.type==='select' && !item.readonly"
                v-model="row[item.prop]"
                :disabled="item.disabled"
                class="item-select-fa"
                placeholder="请选择"
                :style="{'width':'100%'}"
              >
                <el-option
                  v-for="itemSon in selectComputed(item,row)"
                  :key="itemSon.id"
                  :label="itemSon[item.selectOption?item.selectOption.label:'name']"
                  :value="itemSon[item.selectOption?item.selectOption.value:'value']"
                />
              </el-select>
              <div v-if="item.type==='func'" class="flex-center">
                <el-button type="primary" size="small" @click="item.click(row)">{{ item.funcTitle }}</el-button>
              </div>
              <div v-if="item.type==='if_type' && !item.readonly" class="flex-center">
                <span style="margin:0 3px">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>
                <el-switch
                  v-model="row[item.prop]"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <!--  附件弹窗  -->
    <el-dialog
      v-if="file_name_show"
      :visible.sync="file_name_show"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
    >
      <div style="height:50vh">
        <el-table
          :data="files"
        >
          <el-table-column
            label="文件名"
            align="center"
          >
            <template slot-scope="{row}">
              {{ row }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template slot-scope="{row}">
              <el-button type="text" size="small" icon="el-icon-view" @click="click_view(row)">预览</el-button>
              <el-button type="text" size="small" icon="el-icon-download" @click="click_download(row)">下载</el-button>
              <el-button v-if="$attrs['operate-item'].prop!=='detail'" type="text" size="small" icon="el-icon-delete" @click="click_delete(row)">删除</el-button>
            </template>
          </el-table-column>

        </el-table>
      </div>
      <div slot="footer" style="height:40px">
        <el-col :span="8" :offset="$attrs['operate-item'].prop==='detail'?20:16">
          <div style="display: flex;">
            <el-upload
              v-if="$attrs['operate-item'].prop!=='detail'"
              :headers="getTokenStr()"
              :action="baseUrl+'/core/file/fileUpload'"
              :on-success="handleSuccess"
              :on-error="handleError"
              :show-file-list="false"
            >
              <el-button>上传文件</el-button>
            </el-upload>
            <el-button type="primary" style="margin-left:15px" @click="file_name_show = false">确 定</el-button>
          </div></el-col>
      </div>
    </el-dialog>
    <!-- 文件预览 -->
    <el-dialog
      v-if="viewShow"
      title="附件预览"
      :visible.sync="viewShow"
      fullscreen
    >
      <div style="height:80vh">
        <el-image v-if="['png','jpg','jpeg'].includes(fileType)" style="width: 100%; height: 100%" :src="viewSrc" fit="scale-down" />
        <div v-else>该文件类型({{ fileType }})不支持预览，
          <el-button type="text" @click="click_view_download(viewSrc)">点击下载</el-button>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="viewShow = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// $ref
// import AutoForm from '@/components/MixinForm/AutoForm'
import { getToken } from '@/utils/auth'
export default {
  name: 'WmsTable',
  components: { },
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      baseSrc: 'https://bdd-ns.oss-cn-beijing.aliyuncs.com/',
      files: [],
      currRow: {},
      viewShow: false,
      tab_loading: false,
      splitProds: [],
      realKeyObj: {}, // 真值映射
      aoto_form_show: false,
      file_name_show: false,
      autoFormData: {}, // 表单弹窗数据
      autoFormPropFilter: {}, // 表单字段过滤条件数据
      sss: '',
      form: { details: [] },
      initFormDetailsItem: {},
      deleteDetails: [],
      insertIndex: null,
      window_add_select_value: null
      // diff_deal_type_local: [{ value: 1, name: '补货' }, { value: 2, name: '挂账' }, { value: 3, name: '退款' }]
    }
  },
  computed: {
    table_width_total() { // 表格总宽度计算
      return function(arr, widthArg = null) {
        return arr.map(item => ((widthArg && item[widthArg.widthProp]) ? item[widthArg.widthProp] : item.tabWidth) || 180)
          .reduce((curr, prev) => (curr + prev), 1 + (widthArg && widthArg.op ? widthArg.opWidth : 0)) + 'px'
      }
    },
    costListDeal() { // 费用获取
      return function(row, item) {
        return this.fen2yuan(row.costList.filter(it => it.feeId === item.feeId)[0].feePrice)
      }
    },
    rateDeal() { // 费用获取
      return function(row, item) {
        return this.fen2yuan(row.rate) + '%'
      }
    },
    comp_price_float() {
      return function(item, row, n) {
        return Object.assign(
          { decimal: Math.log10(n), max: 999999 },
          item.float,
          {
            max: (item.float
              ? ((typeof item.float.max === 'string') && row[item.float.max] / n ||
                (typeof item.float.max === 'number') && (item.float.max || 999999) ||
                (typeof item.float.max === 'function') && (item.float.max(row) || 999999) ||
                (typeof item.float.max === 'undefined') && 999999)
              : 999999)
          })
      }
    },
    comp_price_auto() { // 自动计算价格
      return function(row, item) {
        const arg = item.arg.map(item => row[item])
        row[item.prop] = item.design(...arg)
        return this.fen2yuan(row[item.prop])
      }
    },

    comp_price_auto_cost() { // 自动计算价格
      return function(row, item) {
        const arg = item.arg.map(item => row[item])
        row[item.prop] = item.design(...arg)
        return this.fen2yuan6cover(row[item.prop])
      }
    },

    comp_weight_auto() { // 自动计算净重
      return function(row, item) {
        const arg = item.arg.map(item => row[item])
        row[item.prop] = item.design(...arg)
        return this.g2kg(row[item.prop])
      }
    },
    comp_number_auto() { // 自动计算数量
      return function(row, item) {
        const arg = item.arg.map(item => row[item])
        row[item.prop] = item.design(...arg)
        return row[item.prop]
      }
    },
    propObj() {
      if (this.$attrs['operate-item'].prop === 'detail') {
        return { addFatherProp: 'detailReqs', 'detailShow': true, 'tableHidden': undefined }
      }
      return { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined }
    },
    selectComputed() { // select选项集
      return function(propitem, row) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item.value).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        if (propitem.selectDataFn) {
          return this.enumGetproplist(propitem.selectDataFn(row))
        }
        return this.enumGetproplist(propitem)
      }
    },
    rules() {
      const temp_obj = { details: {}}
      this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
        if (item.rule) {
          this.$set(temp_obj.details, item.prop, item.rule)
          // temp_obj.details[item.prop] = item.rule
        }
        // Object.assign temp_obj
      })

      return temp_obj
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`wms列表${n ? '打开' : '关闭'}`)
          this.init().then(() => {
            this.$nextTick(() => {
              if (this.$listeners.dataIsChange && this.$attrs['operate-item'].prop !== 'insert') { this.$listeners.dataIsChange(false) }
            })
          })
        } else { // 关闭
          if (this.$refs.Form) {
            this.$refs.Form.resetFields()
          }
        }
      },
      immediate: true
    },
    'form.details': { // 监听表格数据
      handler(n) {
        if (n) {
          if (this.$listeners.tabDateChange) {
            this.$listeners.tabDateChange(n)
          }
          if (this.$listeners.dataIsChange) { this.$listeners.dataIsChange(true) }
        }
      },
      deep: true,
      immediate: true
    },

    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          let temp = []
          if (this.$attrs.select_window_name.split('_')[0] === 'form') {
            return
          }
          switch (this.$attrs.select_window_name) {
            case 'type_AgencyShipmentIndex': // 出货单选择
              console.log(n)
              temp = n.map(item => Object.assign(
                this.deepClone(this.initFormDetailsItem),
                {
                  relationNo: item.shipmentNo,
                  totalAmount: item.totalAmount,
                  rate: item.rate || 10000,
                  returnTotalAmount: item.returnTotalAmount
                }))
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_WhsSaleIndex': // 批发单选择
              console.log(n)
              temp = n.map(item => Object.assign(
                this.deepClone(this.initFormDetailsItem),
                {
                  whsSaleOrderId: item.id,
                  whsSaleOrderNo: item.whsOrderNo,
                  whsSaleAmount: item.totalAmount,
                  refundTotalAmount: item.whsRefundAmount || 0
                }))
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_StoreProductIndex':
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  item.by_order ? { // 走单据商品信息
                    goodsCode: item.goodsCode,
                    goodsName: item.goodsName,
                    spec: item.spec,
                    img: item.img,
                    whetherCount: item.whetherCount,
                    productId: item.goodsArchiveId,
                    unitId: item.weightType,
                    weightType: item.weightType,
                    returnPrice: item.price,
                    returnPriceShow: this.fen2yuan(item.price),
                    whsRefundPrice: item.price,
                    whsRefundPriceShow: this.fen2yuan(item.price)
                  }
                    : {
                      productId: item.goodsArchiveId,
                      storeProductId: item.id, // 门店商品id
                      goodsCode: item.goodsCode,
                      goodsName: item.goodsName,
                      img: (item.imgList && item.imgList.length) ? item.imgList[0] : '',
                      price: item.price,
                      priceShow: this.fen2yuan(item.price),

                      costPrice: item.costPrice || 0,
                      costPriceShow: this.fen2yuan6cover(item.costPrice) || 0,
                      // 批发价
                      whsPrice: item.wholesalePrice || 0,
                      whsPriceShow: this.fen2yuan(item.wholesalePrice) || 0,
                      //  会员价
                      originalMemberPrice: item.memberPrice || 0,
                      originalMemberPriceShow: this.fen2yuan(item.memberPrice) || 0,
                      nowMemberPrice: item.memberPrice || 0,
                      nowMemberPriceShow: this.fen2yuan(item.memberPrice) || 0,
                      //  零售价
                      originalPrice: item.price || 0,
                      originalPriceShow: this.fen2yuan(item.price) || 0,
                      nowPrice: item.price || 0,
                      nowPriceShow: this.fen2yuan(item.price) || 0,
                      //  VIP尊席价
                      nowVipPrice: item.vipPrice || 0,
                      nowVipPriceShow: this.fen2yuan(item.vipPrice) || 0,
                      originalVipPrice: item.vipPrice || 0,
                      originalVipPriceShow: this.fen2yuan(item.vipPrice) || 0,
                      // 失效后价格
                      priceAfterInvalid: item.memberPrice || 0,
                      priceAfterInvalidShow: this.fen2yuan(item.memberPrice) || 0,
                      // 最后一次采购价格
                      lastPurPrice: item.lastPurPrice || 0,
                      lastPurPriceShow: this.fen2yuan6cover(item.lastPurPrice) || 0,
                      // 最后一次配送价格
                      lastDeliveryPrice: item.lastDeliveryPrice ? item.lastDeliveryPrice : 0,
                      lastDeliveryPriceShow: item.lastDeliveryPrice ? this.fen2yuan6cover(item.lastDeliveryPrice) : 0,

                      // stockNum: (item.stockNumber || 0) + this.MenuGetPropName('weight_type', item.unitConversionRateRes.stockWeightType), 再议
                      stockNum: (item.totalStockNum || 0),
                      stockNumWeightShow: (this.g2kg(item.totalStockNum) || 0),
                      stockNumber: (item.stockNumber || 0),
                      purUnit: item.unitConversionRateRes.purWeightType,
                      weightType: item.unitConversionRateRes.stockWeightType,
                      unitId: item.weightType,
                      goodsCategoryId: item.goodsCategoryId,
                      spec: item.spec || '',
                      whetherWeigh: item.whetherWeigh,
                      weight: item.whetherWeigh ? '' : 0,
                      weightWeightShow: item.whetherWeigh ? '' : 0,
                      totalStockNumWeightShow: item.totalStockNum ? this.g2kg(item.totalStockNum) : '',
                      totalStockNum: item.totalStockNum >= 0 ? item.totalStockNum : 0,
                      totalStockCount: item.totalStockCount || 0,
                      whetherCount: item.whetherCount || false
                    })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_ProductIndex':
              temp = n.map(item => Object.assign(
                this.deepClone(this.initFormDetailsItem),
                {
                  goodsCode: item.goodsCode,
                  goodsName: item.goodsName,
                  img: item.imgList[0] || '',
                  productId: item.id,
                  purUnit: item.unitConversionRateRes.purWeightType,
                  weightType: item.unitConversionRateRes.stockWeightType,
                  unitId: item.weightType,
                  spec: item.spec,
                  price: item.price,
                  priceShow: this.fen2yuan(item.price),
                  costPrice: item.costPrice || 0,
                  costPriceShow: this.fen2yuan6cover(item.costPrice) || 0,
                  whetherWeigh: item.whetherWeigh,
                  whetherCount: item.whetherCount,
                  weight: item.whetherWeigh ? '' : 0,
                  weightWeightShow: item.whetherWeigh ? '' : 0,
                  //  会员价
                  originalMemberPrice: item.memberPrice || 0,
                  originalMemberPriceShow: this.fen2yuan(item.memberPrice) || 0,
                  nowMemberPrice: item.memberPrice || 0,
                  nowMemberPriceShow: this.fen2yuan(item.memberPrice) || 0,
                  //  零售价
                  originalPrice: item.price || 0,
                  originalPriceShow: this.fen2yuan(item.price) || 0,
                  nowPrice: item.price || 0,
                  nowPriceShow: this.fen2yuan(item.price) || 0
                }))
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
          }
          temp.map(item => {
            Object.keys(item).map(resItem => { // 去掉没用的字段
              if (!Object.keys(this.initFormDetailsItem).includes(resItem)) {
                delete item[resItem]
              }
            })
          })
          // 真实值赋值
          Object.keys(this.realKeyObj).map(itemK => {
            temp.map(item => {
              if (Object.keys(item).includes(itemK)) {
                item[itemK] = item[this.realKeyObj[itemK]]
                item[itemK + 'Show'] = item[this.realKeyObj[itemK] + 'Show']
              }
            })
          })
          if (this.insertIndex !== null) {
            this.form.details.insert(this.insertIndex + 1, ...temp)
            this.form.details.splice(this.insertIndex, 1)
          } else { // 批量添加
          // 如果只有第一条且第一条为模板
            if (this.form.details.length === 1 && JSON.stringify(this.form.details[0]) === JSON.stringify(this.initFormDetailsItem)) {
              this.form.details = []
            }
            this.form.details.push(...temp)
          }
          this.$listeners.clearAddArr()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleSelectionChange(rows) {
      this.splitProds = rows
    },
    windowSelectable() {
      return true
    },
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        this.deleteDetails = []
        this.form.details = this.deepClone(this.$attrs.details) // 详情
        const temp = {}
        const temp_null_temp = {}
        if (['edit', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改
          const priceK = []
          const priceCostK = []
          const weightK = []
          const selectK = []
          const selectToString = []
          this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
            temp[item.prop] = typeof item.defaultValue === 'undefined' ? '' : item.defaultValue
            temp_null_temp[item.prop] = typeof item.defaultValue === 'boolean' ? item.defaultValue : ''

            if (['PRICE', 'PRICE_SEMI_AUTOMATIC'].includes(item.type)) {
              priceK.push(item.prop)
              temp[item.prop + 'Show'] = ''
            }

            if (['COST_PRICE_AUTOMATIC', 'COST_PRICE_SEMI_AUTOMATIC', 'COST_PRICE'].includes(item.type)) {
              priceCostK.push(item.prop)
              temp[item.prop + 'Show'] = ''
            }

            if (item.type === 'weight_number') {
              weightK.push(item.prop)
              temp[item.prop + 'WeightShow'] = ''
            }
            if (item.type === 'select' && item.selectValueType === undefined) {
              selectK.push(item.prop)
            }

            if (item.type === 'select' && item.selectValueType === 'string') {
              selectToString.push(item.prop)
            }
            if (item.type === 'PRICE_AUTOMATIC') {
              temp[item.prop] = 0
            }

            if (item.type === 'costList') { // 费用单初始化
              temp.costList = this.form.details[0].costList.map(costItem => ({ feeId: costItem.feeId, feeName: costItem.feeName, feePrice: '0' }))
            }
            if (item.realProp) {
              this.realKeyObj[item.prop] = item.realProp
            }
          })
          this.initFormDetailsItem = this.deepClone(temp)

          if (this.$attrs['operate-item'].prop === 'insert') { // 创建
            this.form.details = [this.deepClone(this.initFormDetailsItem)]
          } else { // 修改 处理价格数据
            this.form.details = this.$attrs.details.length > 0
              ? this.$attrs.details.map(itemD => {
                Object.keys(itemD).map(key => {
                  if (priceK.includes(key)) {
                    itemD[key + 'Show'] = this.fen2yuan(itemD[key])
                  }
                  if (priceCostK.includes(key)) {
                    itemD[key + 'Show'] = this.fen2yuan6cover(itemD[key])
                  }
                  if (weightK.includes(key)) {
                    itemD[key + 'WeightShow'] = this.g2kg(itemD[key])
                  }
                  if (selectK.includes(key)) {
                    itemD[key] = itemD[key] === '' ? itemD[key] : (Number(itemD[key]) || '')
                  }

                  if (selectToString.includes(key)) {
                    itemD[key] = typeof itemD[key] !== 'string' ? itemD[key].toString() : itemD[key]
                  }

                  if (key === 'costList') { // 费用单字段
                    itemD.costList.map(item => {
                      itemD['fee_' + item.feeId] = this.fen2yuan(item.feePrice)
                    })
                  }
                })
                return this.deepClone(Object.assign(temp_null_temp, itemD))
              })
              : [this.deepClone(this.initFormDetailsItem)]
          }
        }
        resolve(true)
      })
    },
    fn_price_semi_auto(row, item) {
      const arg = item.argSemi.map(item => row[item])
      row[item.propSemiName] = item.designSemi(...arg)
      row[item.propSemiName + 'Show'] = this.fen2yuan(row[item.propSemiName])
    },
    deleteItem(row, i) {
      if (row.id) {
        this.$listeners.deleteDetail(row).then(res => {
          if (res) {
            this.deleteDetails.push(row.id)
            if (this.form.details.length === 1) {
              console.log('剩一项了')
              const temp = this.deepClone(this.initFormDetailsItem)
              this.$set(this.form.details, 0, temp)
            } else {
              this.form.details.splice(i, 1)
            }
          }
        })
      } else {
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          const temp = this.deepClone(this.initFormDetailsItem)
          this.$set(this.form.details, 0, temp)
        } else {
          this.form.details.splice(i, 1)
        }
      }
    },
    opFunc(e, i = null, row = { id: null }) {
      if (e.click === 'addItem') { // 末尾追加空行
        this.addItem(null, this.form.details.length)
        return
      }

      const temp = {}
      if (e.formProData) { // 存在检索范围
        Object.keys(e.formProData).map(key => {
          temp[key] = e.formProData[key] === '' ? this.$attrs.form_data[key] : e.formProData[key]
        })
      }
      if (Object.values(temp).some(value => (value === '' || value === undefined))) { // 字段先头选择较验
        const nameList = {
          shipmentId: '出货单号',
          customerId: '代销商',
          whsId: '批发商',
          storeId: '门店',
          whsStoreId: '销售门店',
          whsStorageId: '销售仓库',
          settleOrgId: '组织',
          settleStoreId: '门店',
          whsRefundStoreId: '批发单号',
          whsRefundStorageId: '批发单号',
          whsOrderNo: '批发单号',
          whsOrderId: '批发单号'
        }
        for (const key of Object.keys(temp)) {
          if (temp[key] === '' || temp[key] === undefined) {
            this.$message.info(`请先选择${nameList[key]}`)
            return
          }
        }
      }
      if (temp.receiveStoreId !== undefined) { // 代销商
        temp.receiveStoreId = this.$attrs.form_data.storeId
        delete temp.storeId
      }
      if (temp.whsStoreId !== undefined) { // 销售门店
        temp.storeId = this.$attrs.form_data.whsStoreId
        delete temp.whsStoreId
      }
      if (temp.settleOrgId !== undefined) { // 组织
        temp.whsOrgId = this.$attrs.form_data.settleOrgId
        delete temp.settleOrgId
      }
      if (temp.settleStoreId !== undefined) { // 组织
        temp.whsStoreId = this.$attrs.form_data.settleStoreId
        delete temp.settleStoreId
      }
      if (temp.whsStorageId !== undefined) { // 销售仓库
        temp.stockId = this.$attrs.form_data.whsStorageId
        delete temp.whsStorageId
      }
      if (temp.whsRefundStoreId !== undefined) { // 退货门店
        temp.storeId = this.$attrs.form_data.whsRefundStoreId
        delete temp.whsRefundStoreId
      }
      if (temp.whsRefundStorageId !== undefined) { // 退货仓库
        temp.stockId = this.$attrs.form_data.whsRefundStorageId
        delete temp.whsRefundStorageId
      }
      this.insertIndex = i
      if (i !== null && e.prop) {
        this.window_add_select_value = this.form.details[i][e.prop] // 被点击的值
      } else {
        this.window_add_select_value = null
      }
      switch (e.click) {
        case 'addItems': // 打开选择列表
          this.$listeners.openSelectWindow({ name: e.windowName, addedList: e.canRepet ? [] : this.form.details, formProData: temp, curr: row }) // 固定选择范围
          break
      }
    },
    addItem(row, i) {
      this.form.details.splice((i + 1), 0, this.deepClone(this.initFormDetailsItem))
    },
    // 附件
    handleSuccess(res, file) {
      if (res.code === 200) {
        this.files.push(file.response.data)
        this.currRow.fileNames = this.files.toString()
        this.dataIsChange = true
      } else if (res.code === 500) {
        this.$message.error(`上传失败:文件过大!`)
      } else {
        this.$message.error(`上传失败，请重试！`)
      }
    },

    handleError(res, file) {
      this.$message.error(`上传失败,请重试！`)
    },
    getTokenStr() {
      return { 'Authorization': getToken() }
    },
    click_view(e) {
      this.viewSrc = this.baseSrc + e
      this.fileType = e.split('.')[1]
      this.viewShow = true
    },
    click_download(e) {
      window.location.href = this.baseSrc + e
    },
    click_view_download(url) {
      window.location.href = url
      this.viewShow = false
    },
    click_delete(e, isSure = false) {
      if (!isSure) { // 拦截
        this.$confirm(`确认删除所选文件吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.click_delete(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
        })
        return
      }
      this.files.remove(e)
      this.currRow.fileNames = this.files.toString()
      this.dataIsChange = true
    }
  }
}
</script>

<style scoped>
/*  .el-form-item el-form-item__content */
.my-class >>> .el-table th  {
    padding: 10px 0px;
}
.my-class >>> .el-table td {
    padding: 6px 3px;
    /* margin: 10px 8px; */
}
.my-class .my-class-table >>> .el-form-item{
 margin-bottom:6px;
 /* margin-top:6px */
}
.el-table .cell{
 padding:8px
}
.my-class >>> .el-input__inner{
 padding:0 3px
}
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.table-header{
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer-fa{
  display: flex;
  /*border: 1px solid blue;*/
  flex-direction: column;
  width: 85%;
}
.operator-father{
  display: flex;
  width:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}
.my-class >>> .el-form-item{
  margin-bottom:10px
}
.my-class .my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
  padding:0 3px 0 20px
}
.my-class .my-class-price >>> .el-input__inner{
  padding:0 3px 0 20px
}

.my-class .my-number-weight-class >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}

.my-class .my-class-semi-auto >>> .el-input__inner{
  color: #493cff;
  font-weight: 600;
  padding:0 3px 0 20px

}
.flex-center{
 display: flex;
 justify-content: center;
 align-items: center;
}

</style>
