<template>
  <div>
    <el-form ref="Form" class="form-fa" :model="$attrs.form[$attrs.form_prop]" :rules="rules" label-width="150px">
      <el-form-item
        v-for="(item,index) in ArrFilter($attrs['form-data'], $attrs.filtration)"
        v-show="formItemShow(item)"
        :key="index"
        :style="{'width':'25%'}"
        :label="item.type==='remark'?'':item.title"
        :prop="item.prop"
      >
        <!--        -->
        <el-input v-if="item.type==='text'" v-model="$attrs.form[$attrs.form_prop][item.prop]" :placeholder="item.placeholder" :readonly="item.readonly" />

        <el-input
          v-if="item.type==='Number'"
          v-model="$attrs.form[$attrs.form_prop][item.prop]"
          v-number-input="item.float"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>
        <el-input
          v-if="item.type==='number'"
          v-model="$attrs.form[$attrs.form_prop][item.prop]"
          v-number-input.float="Object.assign({decimal:2},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :disabled="item.disabled"
          :placeholder="item.placeholder"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>

        <el-input v-if="item.type==='selectState'" :value="MenuGetPropName(item.selectData,$attrs.form[$attrs.form_prop][item.prop])" :placeholder="item.placeholder" :readonly="item.readonly" />
        <el-select
          v-if="item.type==='select' && !item.readonly"
          v-model="$attrs.form[$attrs.form_prop][item.prop]"
          class="item-select-fa"
          placeholder="请选择"
          :disabled="item.disabled"
          @change="weightInit(item.prop,$attrs.form[$attrs.form_prop])"
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
          :value="MenuGetPropName(item.selectData,$attrs.form[$attrs.form_prop][item.prop])"
          :readonly="item.readonly"
        />
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,$attrs.form[$attrs.form_prop][item.prop]) }}
          </span>
          <el-switch
            v-if="!item.readonly"
            v-model="$attrs.form[$attrs.form_prop][item.prop]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </div>
        <!--        <template slot="error" slot-scope="{error}">-->
        <!--          <span style="position: absolute;left: 1rem;top:.7rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>-->
        <!--        </template>-->
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
// import { ArrFilter } from '@/utils'
export default {
  name: 'ProductPropForm',
  data() {
    return {
      form: {},
      goodTypeValue: '',
      idValue: ''
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
  watch: {},
  created() {},
  methods: {
    init() {
      console.log(`${this.$attrs.form_prop}数据已加载`)
      this.$refs.Form.clearValidate()
      // return new Promise(resolve => {
      //   this.loading = true
      //   const temp = {}
      //   if (['edits', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,批量修改
      //     ArrFilter(this.$attrs['form-data'], this.$attrs.filtration).map(item => {
      //       temp[item.prop] = typeof item.defaultValue === 'boolean' ? item.defaultValue : (item.defaultValue || '')
      //     })
      //     this.form = temp
      //   } else if (['edit'].includes(this.$attrs['operate-item'].prop)) { // 修改
      //     // this.form = this.deepClone(this.$attrs['current-row'])
      //     ArrFilter(this.$attrs['form-data'], this.$attrs.filtration).map(item => {
      //       temp[item.prop] = this.$attrs['current-row'][item.prop]
      //     })
      //     this.form = temp
      //
      //   }
      // })
    },
    weightInit(prop, value) {
      if (prop === 'basicWeightType') {
        value.purRate = 1
        value.purWeightType = value.basicWeightType
        value.saleRate = 1
        value.saleWeightType = value.basicWeightType
        value.stockRate = 1
        value.stockWeightType = value.basicWeightType
      }
      this.$listeners.weightChange(value.basicWeightType)
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
</style>

