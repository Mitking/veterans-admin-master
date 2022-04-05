<template>
  <el-form :ref="$attrs['ref-name']" class="form-fa" :model="$attrs.form" :rules="rules" inline-message>
    <!--    <div class="mix-add-model-item-title">{{ $attrs.title }}</div>-->
    <el-form-item
      v-for="(item,index) in $attrs['form-data']"
      :key="index"
      :style="{'width':item.width || '300px'}"
      :label="item.title"
      :prop="item.prop"
    >
      <el-input v-if="item.type==='text' && !$attrs.readonly" v-model="$attrs.form[item.prop]" :placeholder="item.placeholder || ''" :disabled="item.disabled" />
      <el-input v-if="item.type==='text' && $attrs.readonly" :value="$attrs.form[item.prop]" placeholder="-" />
      <el-select v-if="item.type==='select' && !$attrs.readonly" v-model="$attrs.form[item.prop]" class="item-select-fa" placeholder="请选择" :style="{width:item.width || '300px'}">
        <!--        <el-option-->
        <!--          :key="0"-->
        <!--          label="全部"-->
        <!--          :value="0"-->
        <!--        />-->
        <el-option
          v-for="itemSon in selectComputed(item)"
          :key="itemSon.value"
          :label="itemSon.name"
          :value="itemSon.value"
        />
      </el-select>
      <el-input v-if="item.type==='select' && $attrs.readonly" :readonly="$attrs.readonly" :value="selectComputed(item).filter(itemSon=>itemSon.value===$attrs.form[item.prop])[0].name" />
      <div v-if="item.type==='if_type'">
        <span style="margin:0 3px">{{ MenuGetPropName(item.type,$attrs.form[item.prop]?$attrs.form[item.prop].toString():'false') }}</span>
        <!--      active-value="1" inactive-value="0"-->
        <el-switch
          v-if="!$attrs.readonly"
          v-model="$attrs.form[item.prop]"
          active-color="#13ce66"
          inactive-color="#ff4949"
        />
      </div>
      <!--    :placeholder="(typeof $attrs.form[item.prop])==='string'?item.dataArr[$attrs.form[item.prop]]:''"   产品分类-->
      <el-cascader
        v-if="item.type==='goodType'"
        v-model="$attrs.form[item.prop]"
        :placeholder="$store.state.enum.enumList[item.dataArr].filter(itemz=>itemz.id===$attrs.form[item.prop]).length>0?$store.state.enum.enumList[item.dataArr].filter(itemz=>itemz.id===$attrs.form[item.prop])[0].name:''"
        clearable
        :props="{
          lazy:true,
          lazyLoad:lazyLoad,
          checkStrictly: true,
          emitPath:false
        }"
      />
      <!--      <div v-if="$attrs.readonly">{{ $attrs.form[item.prop]?$attrs.form[item.prop].toString():'-' }}</div>-->
    </el-form-item>
  </el-form>
<!--  </el-collapse-item>-->
</template>

<script>
import { getCategoryList } from '@/api/core/goodscategory'

export default {
  name: 'MixAddModule',
  data() {
    return {
      rules: {
        // id: [{ required: true, message: '请输入ID', trigger: 'blur' }]
      }
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
    }
  },
  created() {},
  methods: {
    // 商品分类
    codeOnfocus(e = '', node) {
      return new Promise((resolve, reject) => {
        getCategoryList({ 'parentCode': (e === '' ? '0' : e) }).then(res => {
          if (res.code === 200) {
            const treeData = res.data.map(item => ({
              leaf: !item.haveChild,
              value: item.id,
              code: item.code,
              label: item.name,
              disabled: (!item.enable)
            }))
            // if (e === '') {
            //   treeData.unshift({
            //     leaf: true,
            //     value: this.$attrs.cascaderbycode ? '0' : 1,
            //     code: '0',
            //     label: '起始类',
            //     disabled: false
            //   })
            // }
            resolve(treeData)
          }
        })
      })
    },
    lazyLoad(node, resolve) {
      this.codeOnfocus(node.level === 0 ? '' : node.data.code, node).then(res => {
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
  padding-bottom:0px
}
.form-fa{
  display: flex;
  flex-wrap: wrap;
  padding: 15px 20px;
}
.form-fa >>> .el-form-item__content{
  display: flex;
  /*justify-content: flex-start;*/
  /*align-items:center;*/
  padding:0px 30px 0px 0px;
  margin: 0px;
  /*margin:5px;*/
  /*flex: 1;*/
}
.form-fa >>> .el-form-item{
  margin-bottom:10px
}

.mix-add-model-item-title{
  /*border: 1px solid blue;*/
  color: #ffffff;
  width: 100%;
  font-size: 1.15rem;
  padding-left: .5rem;
  line-height: 2rem;
  background-color: #2d8bef;
  margin-bottom: 10px;
}
</style>
