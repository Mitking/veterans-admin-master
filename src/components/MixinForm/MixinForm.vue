<template>
  <div>
    <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">
      <el-form-item
        v-for="(item,index) in datafilter(formdata,{'formShow':true,tableHidden:undefined})"
        v-show="formitemshow(item)"
        :key="index"
        class="wid"
        :style="{'width':item.formWidth?item.formWidth:($attrs.full?'25%':'45%')}"
        :label="item.title"
        :prop="item.prop"
      >
        <el-input v-if="item.type==='text'" v-model="form[item.prop]" :placeholder="item.placeholder" :disabled="item.disabled || (formType === 'withinAdd' && !item.addDisabled)" />
        <!--     @change="areaChange"   -->
        <el-input
          v-if="item.type==='Number'"
          v-model="form[item.prop]"
          v-number-input="item.float"
          :readonly="item.readonly"
          :placeholder="item.placeholder"
        />
        <el-select v-if="item.type==='select' && !$attrs.readonly" v-model="form[item.prop]" class="item-select-fa" placeholder="请选择">
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>

        <el-time-select
          v-if="item.type==='time' && formshow"
          ref="timefocus"
          v-model="form[item.prop]"
          style="width: 100%"
          :disabled="item.disabled"
          :picker-options="{
            start: '00:00',
            step: '00:30',
            end: '23:30'
          }"
        />
        <el-date-picker
          v-if="item.type==='datetime'"
          v-model="form[item.prop]"
          type="datetime"
          style="width: 100%"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="item.defaultTime || '00:00:00'"
        />
        <el-cascader v-if="item.type==='area'" v-model="form[item.prop]" :placeholder="area" clearable style="width: 100%" :options="options" @change="areaChange" />
        <!-- .name:''       <div v-if="item.type==='cascader' && formshow">{{ (typeof form[item.prop]) }}{{ (typeof form[item.prop])==='string'?item.dataArr[form[item.prop]]:'起始类' }}</div>-->
        <!--        :placeholder="(typeof form[item.prop])==='string' && form[item.prop]?$store.state.enum.enumList[item.dataArr].filter(itemz=>itemz.code===form[item.prop])[0].name:''"-->
        <el-cascader
          v-if="item.type==='goodType' && formshow"
          v-model="form[item.prop]"
          :placeholder="(typeof form[item.prop])==='string' && form[item.prop]?$store.state.enum.enumList[item.dataArr].filter(itemz=>itemz.code===form[item.prop])[0].name:''"
          clearable
          :props="{
            lazy:true,
            lazyLoad:lazyLoad,
            checkStrictly: true,
            emitPath:false
          }"
        />

        <div v-if="item.type==='if_type'">
          <span>{{
            form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop])
          }}
          </span>
          <el-switch
            v-if="!item.readonly"
            v-model="form[item.prop]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </div>
        <div v-if="item.type==='if_enable'">
          <span>{{
            form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop])
          }}
          </span>
          <el-switch
            v-model="form[item.prop]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </div>

      </el-form-item>
      <div :class="'footer '+ ($attrs.full?'footer-full':'')">
        <el-form-item>
          <el-button :loading="loading" type="primary" @click="onSubmit">
            <template v-if="formType === 'insert'">
              创建
            </template>
            <template v-else-if="formType === 'withinAdd'">
              追加
            </template>
            <template v-else>
              修改
            </template>
          </el-button>
          <el-button @click="reset">{{ formType==='insert'?'重置':'还原' }}</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { regionData, CodeToText } from 'element-china-area-data'
export default {
  name: 'MixinForm',
  components: { },
  props: {
    formdata: { // 添加数据栏，prop字段，
      type: Array,
      default: () => []
    },
    formType: { // 表单类型
      type: String,
      default: 'insert'
    },
    currentRow: { // 当前行数据
      type: Object,
      default: () => {}
    },
    formshow: {
      type: Boolean
    }
  },
  data() {
    return {
      options: regionData,
      goodstypeshowvalue: '',
      goodstypeShow: false,
      loading: false,
      form: {},
      treeData: []
    }
  },
  computed: {
    selectComputed() { // select选项集
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item.value).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
      }
    },
    // 提交校验
    rules() {
      const temp_obj = {}
      this.formdata.map(item => {
        if (item.rule) {
          temp_obj[item.prop] = item.rule
        }
        // Object.assign temp_obj
      })
      return temp_obj
    },
    // formdata_bool(){
    //   return
    // }
    area() {
      const temp1 = this.form.province ? this.form.province + '/' : ''
      const temp2 = this.form.city ? this.form.city + '/' : ''
      const temp3 = this.form.district || ''
      return temp1 + temp2 + temp3
    },
    formitemshow() { // 父级数据联动渲染
      return function(e) {
        if (typeof e.fa_show === 'undefined') {
          return true
        } else {
          this.form[e.prop] = (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
            ? (this.form[e.prop] || ((typeof e.defaultValue === 'undefined') ? '' : e.defaultValue)) : null
          // if (this.form[Object.keys(e.son_show)] !== null) {
          //   this.form[e.prop] =
          // } else {
          //   this.form[e.prop] = null
          // }
          return (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
        }
      }
    }
  },
  watch: {
    formshow: {
      handler(n) {
        if (this.$refs['form']) {
          this.$refs['form'].resetFields()
        }
        this.goodstypeShow = false
        this.goodstypeshowvalue = ''
        if (n === true) {
          this.init()
        }
        if (n === false) {
          console.log('已关闭表单')
          // this.$listeners.close()
          this.loading = false
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    init() { // 初始化数据
      // if (n === true) {
      const temp_obj = {}
      if (this.formType === 'edit') { // 修改
        this.formdata.filter(itemFilter => itemFilter.formShow).map(item => {
          temp_obj[item.prop] = this.currentRow[item.prop] ? this.currentRow[item.prop] : (typeof (item.defaultValue) === 'undefined' ? '' : item.defaultValue)
        })
      } else if (this.formType === 'withinAdd') { // 追加
        const temp = this.deepClone(this.currentRow)
        this.formdata.filter(itemFilter => itemFilter.formShow).map(item => {
          temp_obj[item.prop] =
            item.addDisabled ? (typeof (item.defaultValue) === 'undefined' ? '' : item.defaultValue) : (temp[item.prop] || (typeof (item.defaultValue) === 'undefined' ? '' : item.defaultValue))
        })
        // temp_obj = Object.assign(temp_obj, temp)
      } else { // 新增
        this.formdata.filter(itemFilter => itemFilter.formShow).map(item => {
          temp_obj[item.prop] = typeof (item.defaultValue) === 'undefined' ? '' : item.defaultValue
        })
      }
      this.form = temp_obj
    },
    // 数据过滤
    datafilter(arr = [], propObj) {
      return arr.filter(item => Object.keys(propObj).every(itemSon => propObj[itemSon] === item[itemSon]))
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          this.$listeners.formSave(this.form)
        }
      })
    },
    reset() {
      this.init()
    },
    lazyLoad(node, resolve) {
      this.codeOnfocus(node.level === 0 ? '' : node.data.value).then(res => {
        resolve(res)
      })
    },
    // 省市区
    areaChange(e) {
      this.$set(this.form, 'province', CodeToText[e[0]] || '')
      this.$set(this.form, 'city', CodeToText[e[1]] || '')
      this.$set(this.form, 'district', CodeToText[e[2]] || '')
    }
  }
}
</script>

<style scoped>
    .form-fa{
      display: flex;
      flex-wrap: wrap;
      padding-bottom:50px
    }
    .wid{
      width: 45%;
      padding:0 10px;
    }
    .footer{
      /*border:1px solid blue;*/
      position: absolute;
      right: 40px;
      align-self: flex-end;
      bottom: 10px;
    }
    .footer-full{
      position: fixed;
    }
    .goodstype{
      z-index: 100;
      position: absolute;
      background-color: #ffffff;
      border: 1px solid #cccccc;
      top:50%;
      width:60%;
      left:30%;
      padding:30px
    }
</style>
