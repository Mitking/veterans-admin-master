<template>
  <div>
    <el-form ref="Form" class="form-fa" :model="$attrs.form" :rules="rules" label-width="100px">
      <el-form-item
        v-for="(item,index) in ArrFilter($attrs['form-data'], $attrs.filtration)"
        v-show="formItemShow(item)"
        :key="index"
        :style="{'width':'25%'}"
        :prop="item.prop"
      >
        <!--   :label="item.type==='remark'?'':item.title"     -->
        <span slot="label">
          {{ item.type==='remark'?'':item.title }}
          <el-tooltip
            v-if="(item.tipMsg || item.tipMsgPath) && !$store.state.app.tooltipDisabled"
            v-permission="[item.tipMsgPath?item.permission:'core:productArchive:update']"
            placement="bottom"
            effect="light"
            :popper-class="item.tipMsgPath?'path-lint-to':''"
          >
            <div slot="content" @click="()=>{if(item.tipMsgPath)$router.push(item.tipMsgPath)}">{{ item.tipMsgPath?'没有适合的选项,点此设置':item.tipMsg }}</div>
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </span>

        <el-input v-if="item.type==='text'" v-model="$attrs.form[item.prop]" :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}" :placeholder="item.placeholder" :readonly="item.readonly">
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>
        <el-input
          v-if="item.type==='number'"
          v-model="$attrs.form[item.prop]"
          v-number-input.float="Object.assign({decimal:2},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>
        <!-- @input="()=>{$attrs.form[item.prop]=kg2g(form[item.prop+'WeightShow'])}" -->
        <el-input
          v-if="item.type==='weight_number'"
          v-model="$attrs.form[item.prop+'WeightShow']"
          v-number-input.float="Object.assign({decimal:3,max:999999999})"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
        />

        <el-input
          v-if="item.type==='Number'"
          v-model="$attrs.form[item.prop]"
          v-number-input="item.float"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>

        <el-input v-if="item.type==='selectState'" :value="MenuGetPropName(item.selectData,$attrs.form[item.prop])" :placeholder="item.placeholder" :readonly="item.readonly" />
        <el-select
          v-if="item.type==='select' && !item.readonly"
          v-model="$attrs.form[item.prop]"
          class="item-select-fa"
          placeholder="请选择"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
        >
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>
        <el-input v-if="item.type==='select' && item.readonly" :placeholder="item.placeholder" :value="MenuGetPropName(item.selectData,$attrs.form[item.prop])" :readonly="item.readonly" />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="$attrs.form[item.prop]"
          style="width: 100%"
          value-format="yyyy-MM-dd"
        />
        <el-date-picker
          v-if="item.type==='datetime'"
          v-model="$attrs.form[item.prop]"
          type="datetime"
          style="width: 100%"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ $attrs.form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,$attrs.form[item.prop]) }}
          </span>
          <el-switch
            v-if="!item.readonly"
            v-model="$attrs.form[item.prop]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </div>
        <!-- children -->
        <el-cascader
          v-if="item.type==='goodsCategory'"
          ref="goodsCategory"
          v-model="$attrs.form[item.prop]"
          :disabled="item.disabled"
          :options="options"
          placeholder="可关键字筛选"
          filterable
          :props="{
            value:item.valueProp || 'id',
            label:'name',
            emitPath:false,
            checkStrictly: true
          }"
          @focus="CategoryTreeInit"
          @change="(e)=>{goodTypeValue=e;closetab();getGoodCode(e)}"
        />
      </el-form-item>
      <!--      <el-form-item style="width: 100%;padding:0;margin:0" />-->
      <!--      <el-form-item-->
      <!--        v-for="(item,i) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true, type:'remark' })"-->
      <!--        :key="10000+i"-->
      <!--        label="备注"-->
      <!--        style="width: 50%;padding-right: 0"-->
      <!--      >-->
      <!--        <el-input v-model="form[item.prop]" :rows="3" type="textarea" />-->
      <!--      </el-form-item>-->
    </el-form>
  </div>
</template>
<script>
import { getCategoryTree } from '@/api/core/goodscategory'
import { generateGoodsCode } from '@/api/core/product'
export default {
  name: 'ProductForm',
  data() {
    return {
      form: {},
      goodTypeValue: '',
      options: []
      //
    }
  },
  computed: {
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
        if (typeof e.fa_show === 'undefined') {
          return true
        } else {
          return Object.keys(e.fa_show).every(item => this.$attrs.form[item] === e.fa_show[item])
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
          temp = temp.filter(item => this.form[propitem.fatherProp] === '' ? true : item[propitem.fatherPropName || propitem.fatherProp] === this.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.form[propitem.prop])) {
            this.form[propitem.prop] = (propitem.defaultAllValue !== undefined ? (temp.length > 0 ? temp[0][propitem.selectOption ? propitem.selectOption.value : 'value'] : '') : '')
          }
          return temp
        }
        return this.enumGetproplist(propitem, propitem.selectDataFilter) || []
      }
    } },
  watch: {
    // '$attrs.show': {
    //   handler(n) {
    //     if (n === 'ProductAdd') {
    //       this.init()
    //     }
    //   },
    //   immediate: true
    // }
  },
  created() {
    this.CategoryTreeInit()
  },
  methods: {
    CategoryTreeInit() {
      getCategoryTree().then(res => {
        res.data.map(item => { item.disabled = true }) // 一级分类不能选
        this.options = res.data
      })
    },
    closetab() {
      if (this.$refs.goodsCategory[0].getCheckedNodes &&
      this.$refs.goodsCategory[0].getCheckedNodes().length &&
      this.$refs.goodsCategory[0].getCheckedNodes()[0] &&
      this.$refs.goodsCategory[0].getCheckedNodes()[0].children &&
      this.$refs.goodsCategory[0].getCheckedNodes()[0].children.length < 1
      ) {
        setTimeout(() => {
          this.$refs.goodsCategory[0].dropDownVisible = false
        }, 300)
      }
    },
    init() {
      this.$refs.Form.clearValidate()
    },
    getGoodCode(gId) {
      if (gId && ['insert', 'copy'].includes(this.$attrs['operate-item'].prop)) {
        generateGoodsCode({ categoryId: gId }).then(res => {
          if (res.code === 200) {
            this.$set(this.$attrs.form, 'goodsCode', res.data)
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  margin-top:15px;
  /*padding-bottom:15px*/
}
.wid{
  width: 25%;
  padding:0 10px;
}
</style>

