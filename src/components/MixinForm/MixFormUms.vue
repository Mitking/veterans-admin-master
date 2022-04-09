<template>
  <div>
    <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">
      <el-form-item
        v-for="(item,index) in datafilter(formData,{'addType':formTypeValue,'formShow':true})"
        v-show="formitemshow(item)"
        :key="index"
        class="wid"
        :style="{'width':item.width?item.width:($attrs.full?'25%':'45%')}"
        :label="item.title"
        :prop="item.prop"
      >
        <el-input v-if="item.type==='text'" v-model="form[item.prop]" :placeholder="item.placeholder" :disabled="item.disabled || formTypeValue === 'M' && item.addDisabled || formTypeValue === 'B' && item.butDisabled" />
        <!--     @change="areaChange"   -->
        <el-select
          v-if="item.type==='select'"
          v-model="form[item.prop]"
          class="item-select-fa"
          placeholder="请选择"
          :disabled="item.disabled || formTypeValue === 'M' && item.addDisabled || formTypeValue === 'B' && item.butDisabled"
        >
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
        <el-cascader v-if="item.type==='area'" v-model="form[item.prop]" :placeholder="area" clearable style="width: 100%" :options="options" @change="areaChange" />
        <!-- .name:''       <div v-if="item.type==='cascader' && formshow">{{ (typeof form[item.prop]) }}{{ (typeof form[item.prop])==='string'?item.dataArr[form[item.prop]]:'起始类' }}</div>-->
        <!--       :placeholder="(typeof form[item.prop])==='string' && form[item.prop]?$store.state.enum.enumList[item.dataArr].filter(itemz=>itemz.code===form[item.prop])[0].name:''"     -->
        <el-cascader
          v-if="item.type==='cascader'"
          v-model="form[item.prop]"
          clearable
          :disabled="parentIdDisabled"
          :options="item.dataArr()"
          :props="{ checkStrictly: true,emitPath:false }"
        />
        <div v-if="item.type==='if_type'">
          <span>{{
            form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,((form[item.prop]===0 || form[item.prop]===false)?false:true))
          }}
          </span>
          <el-switch
            v-if="!item.readonly"
            v-model="form[item.prop]"
            :active-value="true"
            :inactive-value="false"
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
            <template v-if="['insertD','insertM','addButton'].includes(formType)">
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
  name: 'MixFormUms',
  components: { },
  props: {
    formData: { // 添加数据栏，prop字段，
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
    formShow: {
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
      treeData: [],
      parentIdDisabled: false
    }
  },
  computed: {
    selectComputed() { // select选项集 不包括
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item.value).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        // if (propitem.exclude && this.formTypeValue === 'D') { // 已存在模块不显示
        //   return this.enumGetproplist(propitem).filter(item => !(propitem.exclude().includes(item.value)))
        // }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
      }
    },
    // 提交校验
    rules() {
      const temp_obj = {}
      if (this.formShow) {
        this.formData.map(item => {
          if (item.rule) {
            temp_obj[item.prop] = item.rule.filter(itemz => itemz.formShow.includes(this.formTypeValue))
          }
        })
      }
      return temp_obj
    },
    // formData_bool(){
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
    },
    formTypeValue() {
      if (this.form.id === null) {
        if (this.form.type === 'D') {
          return 'D'
        }
        return (this.formType === 'insertD' && 'D' || this.formType === 'insertM' && 'M' || this.formType === 'addButton' && 'B')
      }
      // if (this.formType === 'addButton') {
      //   return 'B'
      // }
      return this.form.type
    }
  },
  watch: {
    formShow: {
      handler(n) {
        if (n === true) {
          this.init()
        }
        if (n === false) {
          console.log('关闭表单')
          this.$listeners.close()
          this.loading = false
          if (this.$refs.form) {
            console.log('重置')
            this.form = {}
            this.$refs.form.resetFields()
            // setTimeout(() => {  }, 0)
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    init() { // 初始化数据
      const temp_obj = {}
      switch (this.formType) {
        case 'insertD': // 添加目录
          console.log('添加目录')
          this.formData.filter(itemFilter => (itemFilter.formShow && itemFilter.addType.includes('D'))).map(item => {
            temp_obj[item.prop] = item.defaultValue === undefined ? null : item.defaultValue
          })
          temp_obj.path = '/'
          temp_obj.parentId = -1
          temp_obj.type = 'D'
          break
        case 'insertM': // 追加菜单
          console.log('追加菜单')
          temp_obj.type = this.currentRow.id === -1 ? 'D' : 'M'
          this.formData.filter(itemFilter => (itemFilter.formShow && itemFilter.addType.includes(temp_obj.type))).map(item => {
            temp_obj[item.prop] = item.defaultValue === undefined ? null : item.defaultValue
          })
          temp_obj.path = ''
          temp_obj.type = this.currentRow.id === -1 ? 'D' : 'M'
          temp_obj.parentId = this.currentRow.id === -1 ? 0 : this.currentRow.menuEntity.id
          // if (this.currentRow.menuEntity.type === 'D') {
          //   temp_obj.parentId = this.currentRow.menuEntity.id
          // }
          temp_obj.module = this.currentRow.menuEntity.module
          break
        case 'addButton': // 追加按扭
          console.log('添加按扭')
          this.formData.filter(itemFilter => (itemFilter.formShow && itemFilter.addType.includes('B'))).map(item => {
            temp_obj[item.prop] = item.defaultValue === undefined ? null : item.defaultValue
          })
          temp_obj.type = 'B'
          // temp_obj.module = this.currentRow.menuEntity.module
          this.$set(temp_obj, 'module', this.currentRow.menuEntity.module)
          this.$set(temp_obj, 'path', this.currentRow.menuEntity.path)
          this.$set(temp_obj, 'parentId', this.currentRow.menuEntity.id)
          break
        case 'edit': // 修改
          console.log('修改')
          this.formData.filter(itemFilter => (itemFilter.formShow && itemFilter.addType.includes(this.currentRow.menuEntity.type))).map(item => {
            temp_obj[item.prop] = this.currentRow.menuEntity[item.prop] === undefined ? null : this.currentRow.menuEntity[item.prop]
          })
          break
        case 'editButton': // 修改按扭
          console.log('修改按扭')
          this.formData.filter(itemFilter => (itemFilter.formShow && itemFilter.addType.includes('B'))).map(item => {
            temp_obj[item.prop] = this.currentRow.menuEntity[item.prop] === undefined ? null : this.currentRow.menuEntity[item.prop]
          })
          break
      }
      if (temp_obj.parentId === -1 || temp_obj.parentId === 0) {
        temp_obj.parentId = -1
        this.parentIdDisabled = true
      } else {
        this.parentIdDisabled = false
      }
      this.form = this.deepClone(temp_obj)
      if (this.$refs.form) {
        console.log('重置')
        setTimeout(() => { this.$refs.form.resetFields() }, 0)
      }
    },
    // 数据过滤
    datafilter(arr = [], propObj) {
      return arr.filter(item => Object.keys(propObj).every(itemSon => {
        if (typeof item[itemSon] === 'boolean') {
          return (propObj[itemSon] === item[itemSon])
        }
        if (typeof item[itemSon] === 'object') {
          return item[itemSon].includes(propObj[itemSon])
        }
      }
      ))
    },
    onSubmit() {
      console.log('提交this.form:', this.form)
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          this.$listeners.formSave(this.form)
        } else {
          this.$message.error('请检查提交数据')
        }
      })
    },
    reset() {
      this.init()
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
