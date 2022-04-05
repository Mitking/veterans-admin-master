<template>
  <el-form class="my-auto-class" :model="$attrs.form" :label-width="$attrs.is_readonly?'200px':'120px'" style="width:90%">
    <el-form-item
      v-for="(item) in $attrs['arr-prop-list']"
      v-show="(item.fn_disabled?!item.fn_disabled($attrs.form):true)"
      :key="item.prop"
      :label="item.autoFormTitleFn?item.autoFormTitleFn($attrs.form,$attrs.out_form):item.title"
      :rules="item.rule"
      :prop="item.prop"
    >
      <div v-if="item.readonly || $attrs.is_readonly">
        {{ item.type==='select' && (MenuGetPropName(item.selectData,$attrs.form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }))
          || item.type==='if_type' && MenuGetPropName(item.type,$attrs.form[item.prop]?$attrs.form[item.prop].toString():'false') ||
          item.type==='PRICE' && fen2yuan($attrs.form[item.prop]) ||
          item.type==='COST_PRICE' && fen2yuan6cover($attrs.form[item.prop]) ||
          item.type==='PRICE_AUTOMATIC' && (fen2yuan($attrs.form[item.prop])) ||
          item.type==='COST_PRICE_AUTOMATIC' && (fen2yuan6cover($attrs.form[item.prop])) ||
          item.type==='PRICE_SEMI_AUTOMATIC' && (fen2yuan($attrs.form[item.prop])) ||
          item.type==='COST_PRICE_SEMI_AUTOMATIC' && (fen2yuan6cover($attrs.form[item.prop])) ||
          item.type==='number' && $attrs.form[item.prop] ||
          item.type==='weight_number' && g2kg($attrs.form[item.prop]) ||
          item.type==='WEIGHT_AUTOMATIC' && g2kg($attrs.form[item.prop]) ||
          item.type==='costFees' && costFeesDeal($attrs.form,item) ||
          ($attrs.form[item.prop]===0?'0':($attrs.form[item.prop] || '-')) | sizeFilter(15) }}
      </div>
      <div v-else>
        <el-input
          v-if="item.type==='text'"
          v-model="$attrs.form[item.prop]"
          :placeholder="item.placeholder"
          :readonly="item.readonly || $attrs.is_readonly"
        />
        <!-- 重量 -->
        <el-input
          v-if="item.type==='weight_number'"
          v-model="$attrs.form[item.prop+'WeightShow']"
          v-number-input.float="comp_price_float(item,$attrs.form,1000)"
          :max-value="typeof item.maxValue==='function' && item.maxValue($attrs.form)"
          :readonly="item.readonly || $attrs.is_readonly"
          :placeholder="item.placeholder || ''"
          :disabled="item.fn_disabled?item.fn_disabled($attrs.form):false"
          @input="()=>{$attrs.form[item.prop]=kg2g($attrs.form[item.prop+'WeightShow'])}"
        />
        <!-- 价格计算 -->
        <div v-if="item.type==='PRICE_AUTOMATIC'" class="auto-price"><span class="prefix">&yen;</span>{{ comp_price_auto($attrs.form,item) }}</div>

        <!-- <el-input
          v-if="item.type==='PRICE_AUTOMATIC'"
          v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
          class="my-auto-class-auto"
          :value="comp_price_auto($attrs.form,item)"
          :placeholder="item.placeholder || '系统计算'"
          :readonly="true"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input> -->

        <!-- 价格计算6位 -->
        <div v-if="item.type==='COST_PRICE_AUTOMATIC'" class="auto-price"><span class="prefix">&yen;</span>{{ comp_price_auto_cost($attrs.form,item) }}</div>

        <!-- <el-input
          v-if="item.type==='COST_PRICE_AUTOMATIC'"
          v-number-input.float="Object.assign({decimal:6,max:999999},item.float)"
          class="my-auto-class-auto"
          :value="comp_price_auto_cost($attrs.form,item)"
          :placeholder="item.placeholder || '系统计算'"
          :readonly="true"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input> -->

        <!-- 价格半自动计算 -->
        <el-input
          v-if="item.type==='PRICE_SEMI_AUTOMATIC'"
          v-model="$attrs.form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
          class="my-auto-class-semi-auto"
          :placeholder="item.placeholder || '系统辅助计算'"
          :readonly="false"
          @input="()=>{$attrs.form[item.prop]=yuan2fen($attrs.form[item.prop+'Show']);fn_price_semi_auto($attrs.form,item)}"
          @focus="()=>{if(item.design){fn_price_semi_focus_auto($attrs.form,item)}}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>

        <!-- 价格半自动计算6为 -->
        <el-input
          v-if="item.type==='COST_PRICE_SEMI_AUTOMATIC'"
          v-model="$attrs.form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:6,max:999999},item.float)"
          class="my-auto-class-semi-auto"
          :placeholder="item.placeholder || '系统辅助计算'"
          :readonly="false"
          @input="()=>{$attrs.form[item.prop]=yuan2fen6cover($attrs.form[item.prop+'Show']);fn_price_semi_auto($attrs.form,item)}"
          @focus="()=>{if(item.design){fn_price_semi_focus_auto($attrs.form,item)}}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>

        <!-- 重量计算 -->
        <div v-if="item.type==='WEIGHT_AUTOMATIC'" class="auto-price">{{ comp_weight_auto($attrs.form,item) }}</div>
        <!-- <el-input
          v-if="item.type==='WEIGHT_AUTOMATIC'"
          v-number-input.float="Object.assign({decimal:3,max:99999999},item.float)"
          class="my-auto-class-auto"
          :value="comp_weight_auto($attrs.form,item)"
          :placeholder="item.placeholder || '系统计算'"
          :readonly="true"
        /> -->
        <el-input
          v-if="item.type==='Number'"
          v-model="$attrs.form[item.prop]"
          v-number-input="item.float"
          :placeholder="item.placeholder"
          :readonly="item.readonly || $attrs.is_readonly"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>
        <div v-if="item.type==='if_type'">
          {{ $attrs.form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,$attrs.form[item.prop]) }}
        </div>
        <el-input
          v-if="item.type==='number'"
          v-model="$attrs.form[item.prop]"
          v-number-input.float="comp_price_float(item,$attrs.form,1)"
          :max-value="typeof item.maxValue==='function' && item.maxValue($attrs.form)"
          :placeholder="item.placeholder"
          :readonly="item.readonly || $attrs.is_readonly"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>
        <el-input
          v-if="item.type==='PRICE'"
          v-model="$attrs.form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly || $attrs.is_readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{$attrs.form[item.prop]=yuan2fen($attrs.form[item.prop+'Show'])}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>
        <!-- 价格6位 -->
        <el-input
          v-if="item.type==='COST_PRICE'"
          v-model="$attrs.form[item.prop+'Show']"
          v-number-input.float="Object.assign({decimal:6,max:999999},item.float)"
          class="my-auto-class-auto"
          :placeholder="item.placeholder || ''"
          @input="()=>{$attrs.form[item.prop]=yuan2fen6cover($attrs.form[item.prop+'Show'])}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>
        <div v-if="item.type==='selectFromPage'">{{ $attrs.form[item.prop] }}</div>
        <!-- <el-input
          v-if="item.type==='selectFromPage'"
          v-model="$attrs.form[item.prop]"
          placeholder="请先选择商品"
          :readonly="true"
        /> -->
      </div>
      <template slot="error" slot-scope="{error}">
        <span style="position: absolute;right: .5rem;top:0;z-index:100;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
      </template>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'AutoForm',
  components: { },
  data() {
    return {

    }
  },
  computed: {
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
    }
  },
  watch: {

  },
  created() {

  },
  methods: {
    fn_price_semi_auto(row, item) {
      const arg = item.argSemi.map(itemz => row[itemz])
      row[item.propSemiName] = item.designSemi(...arg)
      if (item.propSemiType === 'COST_PRICE') {
        row[item.propSemiName + 'Show'] = this.fen2yuan6cover(row[item.propSemiName])
      } else {
        row[item.propSemiName + 'Show'] = this.fen2yuan(row[item.propSemiName])
      }
    },
    fn_price_semi_focus_auto(row, item) {
      const arg = item.arg.map(itemz => row[itemz])
      row[item.prop] = item.design(...arg)
      if (['COST_PRICE', 'COST_PRICE_SEMI_AUTOMATIC'].includes(item.type)) {
        row[item.prop + 'Show'] = this.fen2yuan6cover(row[item.prop])
      } else {
        row[item.prop + 'Show'] = this.fen2yuan(row[item.prop])
      }
    }
  }
}
</script>
<style scoped>
/* my-class */
.my-class .my-auto-class >>> .el-input__inner{
 padding:0px 20px
}
/* .my-class .my-auto-class >>> .el-form-item{
  margin-bottom:10px
} */
.my-class .my-auto-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}
.my-class .my-auto-class-semi-auto >>> .el-input__inner{
  color: #493cff;
  font-weight: 600;
}
.auto-price{
 color:#e01818;
 font-weight: 600;
 font-size: 1.01rem;
}
.prefix{
 font-size: .6rem;
}
</style>
