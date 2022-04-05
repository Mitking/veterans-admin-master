<template>
  <div>
    <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="120px">
      <el-form-item
        v-for="(item) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true,tableHidden: undefined })"
        v-show="formItemShow(item)"
        :key="item.prop"
        :style="{'width':item.formWidth?item.formWidth:'25%'}"
        :prop="item.prop"
      >
        <span slot="label">
          {{ item.type==='remark'?'':item.title }}
          <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="bottom" effect="light">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </span>
        <!--        -->
        <el-input
          v-if="item.type==='text'"
          v-model="form[item.prop]"
          :placeholder="item.placeholder"
          :readonly="item.readonly"
        />
        <div v-if="item.type==='PRICE_AUTOMATIC'" class="auto-price"><span class="prefix">&yen;</span>{{ comp_price_auto(item) }}</div>
        <div v-if="item.type==='PRICE_FORM_AUTOMATIC'" class="auto-price"><span class="prefix">&yen;</span>{{ comp_price_form_auto(item) }}</div>
        <el-input
          v-if="item.type==='PRICE_AUTOMATIC_SWITCH'"
          v-model="form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :placeholder="item.placeholder || '手动计算'"
          @input="()=>{form[item.prop]=yuan2fen(form[item.prop+'Show'])}"
        >
          <div slot="prefix" class="yuan-c">
            <span>&yen;</span>
          </div>
          <el-button
            slot="append"
            @click="comp_price_auto_switch(item)"
          >合计</el-button>
        </el-input>

        <el-input
          v-if="item.type==='NUMBER_AUTOMATIC'"
          :value="comp_number_auto(item)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          :readonly="true"
          :placeholder="item.placeholder || '系统计算'"
        />

        <el-input
          v-if="item.type==='PRICE'"
          v-model="form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{form[item.prop]=yuan2fen(form[item.prop+'Show'])}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>
        <el-input
          v-if="item.type==='RATE'"
          v-model="form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:1,max:100},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{form[item.prop]=yuan2fen(form[item.prop+'Show'])}"
        >
          <div slot="suffix">
            <span>%</span>
          </div>
        </el-input>

        <el-input
          v-if="item.type==='COST_PRICE'"
          v-model="form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:6,max:999999},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{form[item.prop]=yuan2fen6cover(form[item.prop+'Show'])}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>

        <el-input
          v-if="item.type==='number'"
          v-model="form[item.prop]"
          v-number-input.float="Object.assign({decimal:2},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          :readonly="item.readonly"
          :disabled="item.disabledFn?item.disabledFn(form):false"
          :placeholder="item.placeholder || item.placeholderFn && item.placeholderFn(form) || ''"
        />
        <el-input
          v-if="item.type==='weight_number'"
          v-model="form[item.prop+'WeightShow']"
          v-number-input.float="Object.assign({decimal:3,max:999999},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{form[item.prop]=kg2g(form[item.prop+'WeightShow'])}"
        />
        <el-input
          v-if="item.type==='selectFromPage'"
          v-model="form[item.propFromPageName]"
          :placeholder="item.placeholder"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="true"
          @focus="openFromPage(item)"
        />
        <el-input
          v-if="item.type==='selectFromPageArr'"
          :value="form[item.prop]?form[item.prop].toString():null"
          :placeholder="item.placeholder"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="true"
          @focus="openFromPage(item)"
        />
        <!-- <el-input v-if="item.type==='selectState'" style="width:100px" :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })" :placeholder="item.placeholder" :readonly="item.readonly" /> -->
        <div v-if="item.type==='selectState'" style="width:100px;color:#666666">{{ MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
        <el-select
          v-if="item.type==='select' && !item.readonly"
          v-model="form[item.prop]"
          class="item-select-fa"
          placeholder="请选择"
          :multiple="item.multiple || false"
          collapse-tags
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          @change="()=>{if($listeners.formItemSelectChange)$listeners.formItemSelectChange({prop:item.prop,value:form[item.prop]})}"
        >
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>
        <el-input
          v-if="item.type==='select' && item.readonly"
          :placeholder="item.placeholder"
          :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })"
          :readonly="item.readonly"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
        />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          value-format="yyyy-MM-dd"
          :picker-options="item.pickerOptions || {}"
        />
        <el-date-picker
          v-if="item.type==='time'"
          v-model="form[item.prop]"
          type="datetime"
          style="width: 100%"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop]) }}
          </span>
          <el-switch
            v-if="!item.readonly"
            v-model="form[item.prop]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </div>
        <el-cascader
          v-if="item.type==='goodTypes'"
          v-model="form[item.prop]"
          clearable
          filterable
          collapse-tags
          :props="{
            multiple: true,
            lazy:true,
            selfdata:item.prop,
            lazyLoad:lazyLoad,
            checkStrictly: true,
            emitPath:false
          }"
        />
        <el-cascader
          v-if="item.type==='goodsCategory'"
          v-model="form[item.prop]"
          style="width: 100%"
          :disabled="item.disabled"
          placeholder=""
          clearable
          filterable
          :options="goodsOptions"
          collapse-tags
          :props="{
            value:item.valueProp || 'id',
            label:'name',
            emitPath:false,
            multiple: true,
            checkStrictly: true
          }"
        />
        <div v-if="item.type==='range'" class="rang-fa">
          <el-input
            v-for="(itemRange,indexRange) in item.range"
            :key="indexRange"
            v-model="form[itemRange.prop+'Show']"
            v-number-input.float="Object.assign({decimal:2},itemRange.float)"
            style="width: 45%"
            :placeholder="itemRange.placeholder"
            @input="()=>{form[itemRange.prop]=yuan2fen(form[itemRange.prop+'Show'])}"
          />
          <div class="line">-</div>
        </div>
        <el-cascader
          v-if="item.type==='storeIds'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :options="storesOptions"
          :props="{ multiple: true,emitPath:false }"
          collapse-tags
          clearable
        />
      </el-form-item>
      <el-form-item
        v-for="(item,i) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true, type:'orderFrom' })"
        :key="100+i"
        v-model="form[item.prop]"
        label="订单来源"
        :style="{'width':'50%'}"
        label-width="100px"
      >
        <el-input
          :placeholder="item.placeholder"
          :value="form[item.prop]"
          :readonly="true"
        />
      </el-form-item>
      <el-form-item style="width: 100%;padding-right: 0" />
      <el-form-item
        v-for="(item,i) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true, type:'remark' })"
        :key="10000+i"
        label="备注"
        style="width: 50%;padding-right: 0"
      >
        <el-input v-model="form[item.prop]" :rows="3" type="textarea" placeholder="备注最多120字数" :maxlength="120" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ArrFilter } from '@/utils'
import { getCategoryList, getCategoryTree } from '@/api/core/goodscategory'

export default {
  name: 'WmsFormItem',
  data() {
    return {
      form: {},
      goodsOptions: []
    }
  },
  computed: {
    storesOptions() {
      const store_org = this.groupByProp(this.$store.getters.enumList.stores, 'orgId')
      const res = store_org.map(item => ({
        label: this.MenuGetPropName('organizes', item.orgId, { label: 'orgShortName', value: 'id' }),
        value: item.id,
        children: item.children.map(itemC => ({
          label: itemC.name,
          value: itemC.id
        }))
      }))

      return res
    },
    comp_price_auto() {
      return function(item) { // 总金额自动计算
        this.form[item.prop] = item.design(...item.arg)
        return this.fen2yuan(this.form[item.prop]) || '0'
      }
    },
    comp_price_form_auto() {
      return function(item) { // 总金额自动计算
        this.form[item.prop] = item.design(...item.arg.map((i) => this.form[i]))
        return this.fen2yuan(this.form[item.prop]) || '0'
      }
    },
    comp_number_auto() {
      return function(item) { // 个数自动计算
        this.form[item.prop] = item.design()
        return this.form[item.prop]
      }
    },

    // 提交校验
    rules() {
      const temp_obj = {}
      this.$attrs['form-data'].map(item => {
        if (item.rule) {
          temp_obj[item.prop] = item.rule
        }
        // Object.assign temp_obj
      })
      return temp_obj
    },
    formItemShow() { // 父级数据联动渲染 tableHidden
      return function(e) {
        if (e.show === false) {
          return false
        }
        if (typeof e.fa_show === 'undefined') {
          return true
        } else {
          this.form[e.prop] = (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
            ? (this.form[e.prop] || ((typeof e.defaultValue === 'undefined') ? '' : e.defaultValue)) : null
          return (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
        }
      }
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) || []
          temp = temp.filter(item => this.form[propitem.fatherProp] === '' ? false : item[propitem.fatherPropName || propitem.fatherProp] === this.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.form[propitem.prop])) {
            this.form[propitem.prop] = (propitem.defaultAllValue !== undefined ? (temp.length > 0 ? temp[0][propitem.selectOption ? propitem.selectOption.value : 'value'] : '') : '')
          }
          return temp
        }
        return this.enumGetproplist(propitem, propitem.selectDataFilter) || []
      }
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`wms表单${n ? '打开' : '关闭'}`)
          this.init().then(res => {
            console.log('强制重置')
            if (this.$refs.form) {
              this.$refs.form.resetFields()
            }
            if (res) {
              this.$nextTick(() => {
                if (this.$listeners.dataIsChange && this.$attrs['operate-item'].prop !== 'insert') { this.$listeners.dataIsChange(false) }
              })
            }
          })
        }
      },
      immediate: true
    },
    form: {
      handler(n) {
        if (this.$listeners.formChange) { this.$listeners.formChange(n) }
        if (this.$listeners.indexPageFormChange) { this.$listeners.indexPageFormChange(n) }
        if (this.$listeners.dataIsChange) { this.$listeners.dataIsChange(true) }
      },
      immediate: true,
      deep: true
    },
    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          console.log(n)
          switch (this.$attrs.select_window_name) {
            case 'form_AgencyShipmentIndex': // 代销出货选择
              this.form.storeId = n[0].storeId
              this.form.stockId = n[0].stockId
              this.form.shipmentNo = n[0].shipmentNo
              this.form.shipmentId = n[0].id
              // this.form.customerName = n[0].customerName
              break
            case 'form_WhsSaleIndex': // 批发销售单选择
              this.form.whsOrgId = n[0].whsOrgId
              this.form.whsRefundStoreId = n[0].whsStoreId
              this.form.whsRefundStorageId = n[0].whsStorageId
              this.form.whsOrderNo = n[0].whsOrderNo
              this.form.whsOrderId = n[0].id
              // this.form.customerName = n[0].customerName
              break
            case 'form_Customer': // 客户选择
              console.log(n)
              if (this.form.whsId !== undefined) { // 批发商
                this.form.whsId = n[0].id
                this.form.whsName = n[0].name
                if (this.$route.name === 'WhsRefundIndex') { // 退款单改变批发商时清空出货单号
                  this.form.whsOrderNo = ''
                }
                return
              }
              this.form.customerId = n[0].id
              this.form.customerName = n[0].name
              if (this.$route.name === 'AgencyReturnIndex') { // 退货单改变代销商时清空出货单号
                this.form.shipmentNo = ''
              }
              break
            case 'form_StoreProductIndex': // 商品选择
              this.form.goodsCode = n[0].goodsCode
              this.form.goodsName = n[0].goodsName
              this.form.weightType = n[0].unitConversionRateRes.stockWeightType
              this.form.price = n[0].price
              this.form.priceShow = this.fen2yuan(n[0].price)
              this.form.costPrice = n[0].costPrice
              this.form.costPriceShow = this.fen2yuan6cover(n[0].costPrice)
              this.form.whetherCount = n[0].whetherCount
              break
          }
        }
      } }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        const temp = {}
        if (['edits', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,批量修改
          ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'editShow': true }).map(item => {
            if (item.type === 'goodsCategory') {
              getCategoryTree().then(res => {
                this.goodsOptions = res.data
              })
            }
            temp[item.prop] = typeof item.defaultValue === 'boolean' ? item.defaultValue : (item.defaultValue || '')
            if (item.type === 'PRICE' || item.type === 'COST_PRICE' || item.type === 'PRICE_AUTOMATIC_SWITCH' || item.type === 'RATE') {
              temp[item.prop + 'Show'] = ''
            }
            if (item.type === 'weight_number') {
              temp[item.prop + 'WeightShow'] = ''
            }
          })
          this.form = temp
        } else if (['edit'].includes(this.$attrs['operate-item'].prop)) { // 修改
          // this.form = this.deepClone(this.$attrs['current-row'])
          ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'editShow': true }).map(item => {
            if (item.type === 'selectFromPage') {
              temp[item.propFromPageName] = this.$attrs['current-row'][item.propFromPageName]
            }
            if (item.type === 'goodsCategory') {
              getCategoryTree().then(res => {
                this.goodsOptions = res.data
              })
            }
            temp[item.prop] = this.$attrs['current-row'][item.prop] === undefined ? item.defaultValue : this.$attrs['current-row'][item.prop]
            if (item.type === 'PRICE' || item.type === 'PRICE_AUTOMATIC_SWITCH' || item.type === 'RATE') {
              temp[item.prop + 'Show'] = this.fen2yuan(temp[item.prop])
            }
            if (item.type === 'range') {
              item.range.map(itemZ => {
                temp[itemZ.prop + 'Show'] = this.fen2yuan(this.$attrs['current-row'][itemZ.prop])
              })
            }
            if (item.type === 'COST_PRICE') {
              temp[item.prop + 'Show'] = this.fen2yuan6cover(temp[item.prop])
            }
            if (item.type === 'weight_number') {
              temp[item.prop + 'WeightShow'] = this.g2kg(temp[item.prop])
            }
            if (item.type === 'select' && item.selectOption && (item.selectOption.value === 'id' || item.valToNum) && typeof this.$attrs['current-row'][item.prop] === 'string') { // 转换id为数字
              temp[item.prop] = Number(this.$attrs['current-row'][item.prop])
            }
            if (item.type === 'select' && item.valToStr && typeof this.$attrs['current-row'][item.prop] === 'number') { // 转换为文本
              temp[item.prop] = this.$attrs['current-row'][item.prop].toString()
            }
          })
          this.form = temp
        }
        resolve(true)
      })
    },
    openFromPage(item) {
      if (item.readonly) {
        return
      }
      if (item.formProData) {
        const temp = {}
        Object.keys(item.formProData).map(key => {
          temp[key] = item.formProData[key] === '' ? this.form[key] : item.formProData[key]
        })
        if (Object.values(temp).some(value => (value === '' || value === undefined))) { // 字段先头选择较验
          const nameList = {
            whsId: '批发商',
            customerId: '代销商',
            storeId: '门店',
            stockId: '仓库',
            personId: '采购员'
          }
          for (const key of Object.keys(temp)) {
            if (temp[key] === '' || temp[key] === undefined) {
              this.$message.error(`请先选择${nameList[key]}`)
              return
            }
          }
        }
        if (temp.whsId) {
          temp.customerId = temp.whsId
        }
        this.$listeners.openSelectWindow({ name: item.windowName, curr: { id: null }, type: 'form', addedList: ([this.form[item.prop]] || []), formProData: temp, transformvalFn: item.transformvalFn })
        return
      }
      this.$listeners.openSelectWindow({ name: item.windowName, curr: { id: null }, type: 'form', addedList: [] })
    },
    comp_price_auto_switch(item) { // 手动合计
      console.log(item)
      this.form[item.prop] = item.design(...item.arg)
      this.$set(this.form, item.prop + 'Show', this.fen2yuan(this.form[item.prop]))
      console.log(this.form)
    },
    // 商品分类
    codeOnfocus(e = '', node) {
      return new Promise((resolve, reject) => {
        getCategoryList({ 'parentCode': e }).then(res => {
          if (res.code === 200) {
            const treeData = res.data.map(item => ({
              leaf: !item.haveChild,
              value: this.$attrs.cascaderbycode ? item.code : item.id,
              code: item.code,
              label: item.name,
              disabled: (!item.enable)
            }))
            resolve(treeData)
          }
        })
      })
    },
    lazyLoad(node, resolve) {
      this.codeOnfocus(node.level === 0 ? '0' : node.data.code, node).then(res => {
        resolve(res)
      })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  /*padding-bottom:15px*/
}
.wid{
  width: 25%;
  padding:0 10px;
}
.my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}
.rang-fa{
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.line{
  position: absolute;
  left: 48%;
  /*width: 100px; !* 要设定宽度 *!*/
  /*border:1px solid blue;*/
  /*transform: translateX(-150%);*/
  color: #b4b4b4;
}
.auto-price{
 color:#e01818;
 font-weight: 600;
 font-size: 1.03rem;
}
.prefix{
 font-size: .6rem;
}
.yuan-c{
  height:100%;
  display:flex;
  flex-direction:column;
  justify-content:center
}
</style>
