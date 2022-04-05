<template>
  <div>
    <!--    <input v-model="$attrs.form.goodsCode" type="text">-->
    <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">
      <el-form-item
        v-for="(item,index) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true })"
        v-show="formItemShow(item)"
        :key="index"
        :style="{'width':'25%'}"
        :label="item.type==='remark'?'':item.title"
        :prop="item.prop"
      >
        <!--        -->
        <el-input v-if="item.type==='text'" v-model="form[item.prop]" :placeholder="item.placeholder" :readonly="item.readonly" />
        <div v-if="item.type==='selectState'" style="width:100px;color:#666666">{{ MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
        <!-- <el-input v-if="item.type==='selectState'" :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })" :placeholder="item.placeholder" :readonly="item.readonly" /> -->
        <el-select v-if="item.type==='select' && !item.readonly" v-model="form[item.prop]" class="item-select-fa" placeholder="请选择" style="width:100%" @change="(e)=>{$listeners.selectChange(e,item.prop)}">
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>
        <el-input v-if="item.type==='select' && item.readonly" :placeholder="item.placeholder" :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })" :readonly="item.readonly" />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'150px'}"
          value-format="yyyy-MM-dd"
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
        <!--  价格  -->
        <el-input
          v-if="item.type==='PRICE'"
          v-model="form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{form[item.prop]=yuan2fen(form[item.prop+'Show'])}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>
        <!--  自动计算价格  -->
        <div v-if="item.type==='PRICE_AUTOMATIC'" class="auto-price"><span class="prefix">&yen;</span>{{ comp_price_auto(item) }}</div>
        <!-- <el-input
          v-if="item.type==='PRICE_AUTOMATIC'"
          :value="comp_price_auto(item)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="true"
          :placeholder="item.placeholder || '系统计算'"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input> -->
        <!--  自动计算：普通  -->
        <div v-if="item.type==='NUMBER_AUTOMATIC'">{{ comp_number_auto(item) }}</div>
        <!-- <el-input
          v-if="item.type==='NUMBER_AUTOMATIC'"
          :value="comp_number_auto(item)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="true"
          :placeholder="item.placeholder || '系统计算'"
        /> -->
        <!--  弹窗  -->
        <el-input
          v-if="item.type==='selectFromPage'"
          v-model="form[item.prop]"
          :placeholder="item.placeholder"
          :readonly="true"
          :disabled="item.disabled"
          @focus="$listeners.openSelectWindow({name:item.windowName,curr:{id:null},type:'form',addedList:[]})"
        />
      </el-form-item>
      </el-form-item>
      <el-form-item style="width: 100%;padding:0;margin:0" />
      <el-form-item
        v-for="(item,i) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true, type:'remark' })"
        :key="10000+i"
        label="备注"
        style="width: 50%;padding-right: 0"
      >
        <el-input v-model="form[item.prop]" :rows="3" type="textarea" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ArrFilter } from '@/utils'
export default {
  name: 'OmsInvoiceFormItem',
  data() {
    return {
      form: {}
    }
  },
  computed: {
    comp_price_auto() {
      return function(item) { // 金额自动计算
        this.form[item.prop] = item.design(...item.arg)
        return this.fen2yuan(this.form[item.prop]) || '0'
      }
    },
    comp_number_auto() {
      return function(item) { // 金额自动计算
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
    formItemShow() { // 父级数据联动渲染
      return function(e) {
        if (e.prop === 'id') {
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
    } },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`wms表单${n ? '打开' : '关闭'}`)
          this.init().then(res => {
            console.log('强制重置检验', res)
            if (res) {
              if (this.$refs.form) {
                this.$refs.form.resetFields()
              }
            }
          })
        }
      },
      immediate: true
    },
    'form': {
      handler(n) {
        if (n) { // 表单变化
          if (this.$listeners.formDataChange) {
            this.$listeners.formDataChange(n)
          }
        }
      },
      deep: true,
      immediate: true
    },
    '$attrs.add_arr_form': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          switch (this.$attrs.select_window_name) {
            case 'form_SupplierIndex': // 供应商选择

              this.form.supplierId = n[0].id
              this.form.supplier = n[0].name
              this.$listeners.selectChange(n[0].id)
              break
            case 'form_ProductIndex': // 商品选择
              //
              this.form.goodsCode = n[0].goodsCode
              this.form.goodsName = n[0].goodsName
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
            temp[item.prop] = typeof item.defaultValue === 'boolean' ? item.defaultValue : (item.defaultValue || '')
          })
          this.form = temp
        } else if (['edit'].includes(this.$attrs['operate-item'].prop)) { // 修改
          // this.form = this.deepClone(this.$attrs['current-row'])
          ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'editShow': true }).map(item => {
            if (item.type === 'selectFromPage') {
              temp[item.prop + 'Id'] = this.$attrs['current-row'][item.prop + 'Id']
            }
            temp[item.prop] = this.$attrs['current-row'][item.prop]
          })
          this.form = temp
        }

        if (this.$refs.form) {
          this.$refs.form.resetFields()
        }
        resolve(true)
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
.auto-price{
 color:#e01818;
 font-weight: 600;
 font-size: 1.03rem;
}
</style>

