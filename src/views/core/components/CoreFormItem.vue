<template>
  <div>
    <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="120px">
      <!--  v-show="formItemShow(item)"    -->
      <el-form-item
        v-for="(item) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true,tableHidden:undefined })"
        :key="item.prop"
        :style="{'width':item.formWidth || '25%'}"
        :prop="item.prop"
      >
        <span slot="label">
          {{ item.type==='remark'?'':item.title }}
          <el-tooltip
            v-if="(item.tipMsg || item.tipMsgPath)
              && !$store.state.app.tooltipDisabled
              && (item.permission?$store.getters.roles.includes(item.permission):true)"
            placement="bottom"
            effect="light"
            :popper-class="item.tipMsgPath?'path-lint-to':''"
          >
            <div slot="content" @click="()=>{if(item.tipMsgPath)$router.push(item.tipMsgPath)}">{{ item.tipMsgPath?'没有适合的选项,点此设置':item.tipMsg }}</div>
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </span>
        <!-- <span slot="label">
          {{ item.type==='remark'?'':item.title }}
          <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="bottom" effect="light">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </span> -->
        <!--        -->
        <el-input
          v-if="item.type==='text'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :placeholder="item.placeholder"
          :readonly="item.readonly"
        />
        <el-input
          v-if="item.type==='number'"
          v-model="form[item.prop]"
          v-number-input.float="Object.assign({decimal:2},item.float)"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder"
        >
          <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </div>
        </el-input>

        <el-input
          v-if="item.type==='numberPoint'"
          v-model="form[item.prop]"
          v-number-point-input
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder"
        />

        <el-input
          v-if="item.type==='Number'"
          v-model="form[item.prop]"
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
          v-if="item.type==='PRICE'"
          v-model="form[item.prop+'Show']"
          v-number-input.float="{decimal:2,max:999999999}"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :readonly="item.readonly"
          :placeholder="item.placeholder || ''"
          @input="()=>{form[item.prop]=yuan2fen(form[item.prop+'Show'])}"
        >
          <div slot="prefix">
            <span>￥</span>
          </div>
        </el-input>
        <el-input v-if="item.type==='selectState'" :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })" :placeholder="item.placeholder" :readonly="item.readonly" />
        <el-select
          v-if="item.type==='select' && !item.readonly"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          class="item-select-fa"
          :disabled="item.disabled"
          :placeholder="item.placeholder || '请选择'"
        >
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon"
            :disabled="item.unselect && item.unselect.includes(itemSon[item.selectOption?item.selectOption.value:'value'])"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>
        <el-select
          v-if="item.type==='storeIdList' && !item.readonly"
          v-model="form.storeId"
          placeholder="请选择"
          multiple
          collapse-tags
          style="width:70%"
        >
          <el-option
            v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'}).filter(item=>item.orgId===$store.getters.orgId)"
            :key="indexSon"
            :label="itemSon.name"
            :value="itemSon.id"
          />
        </el-select>

        <el-input
          v-if="['select','storeIdList'].includes(item.type) && item.readonly"
          :placeholder="item.placeholder"
          :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })"
          :readonly="item.readonly"
        />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="form[item.prop]"
          style="width: 100%"
          value-format="yyyy-MM-dd"
        />
        <el-date-picker
          v-if="item.type==='time'"
          v-model="form[item.prop]"
          type="datetime"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <el-time-select
          v-if="item.type==='timeSf'"
          v-model="form[item.prop]"
          :clearable="false"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :disabled="item.disabled"
          :picker-options="{
            start: '00:00',
            step: '00:30',
            end: '23:30'
          }"
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
        <!--       :placeholder=""  -->
        <el-cascader
          v-if="item.type==='goodsCategory'"
          v-model="form[item.prop]"
          :disabled="item.disabled"
          placeholder="默认起始类"
          clearable
          filterable
          :options="goodsOptions"
          :props="{
            value:item.valueProp || 'id',
            label:'name',
            emitPath:false,
            checkStrictly: true
          }"
        />

        <el-cascader
          v-if="item.type==='FeeList'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :placeholder="item.placeholder || '请选择'"
          clearable
          :props="{
            value:'sujectCode',
            label:'showName',
            leaf:'ifLast',
            emitPath:false,
            checkStrictly: item.checkStrictly
          }"
          :options="$store.state.enum.enumList[item.selectData]"
          @change="form.sujectCode=$event?($event+'.'):''"
        />
        <el-cascader
          v-if="item.type==='FeeListId'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          clearable
          :placeholder="item.placeholder || '请选择'"
          :props="{
            value:'id',
            label:'showName',
            leaf:'ifLast',
            emitPath:false,
            checkStrictly: item.checkStrictly
          }"
          :options="$store.state.enum.enumList[item.selectData]"
        />

        <el-cascader v-if="item.type==='area'" v-model="form[item.prop]" :placeholder="area" clearable style="width: 100%" :options="options" @change="areaChange" />
        <el-cascader
          v-if="item.type==='storeIds'"
          v-model="form[item.prop]"
          :style="{'width': item.formItemWidth?(item.formItemWidth+'px'):'100%'}"
          :options="storesOptions"
          :props="{ multiple: true,emitPath:false }"
          collapse-tags
          clearable
        />
        <!--  弹窗  -->
        <el-input
          v-if="item.type==='selectFromPage'"
          :value="item.selectData?MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }):(form[item.prop+'Name'] || '')"
          :placeholder="item.placeholder"
          :readonly="true"
          :disabled="item.disabled"
          @focus="$listeners.openSelectWindow({name:item.windowName,curr:{id:null},type:'form',addedList:[]})"
        />
      </el-form-item>
      <el-form-item style="width: 100%;padding:0;margin:0" />
      <el-form-item
        v-for="(item,i) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'editShow': true, type:'remark' })"
        :key="10000+i"
        :label="item.title"
        style="width: 50%;padding-right: 0"
      >
        <el-input v-model="form[item.prop]" :rows="3" type="textarea" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ArrFilter } from '@/utils'
import { getCategoryList, getCategoryTree } from '@/api/core/goodscategory'
import { regionData, CodeToText } from 'element-china-area-data'
export default {
  name: 'CoreFormItem',
  data() {
    return {
      options: regionData,
      goodsOptions: [],
      form: {}
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
    placeholderTxt() {
      return function(item) {
        if (this.$store.state.enum.enumList.categoryList.filter(itemz => itemz.code === this.form[item.prop]).length > 0) {
          return this.$store.state.enum.enumList.categoryList.filter(itemz => itemz.code === this.form[item.prop])[0].name
        }
        return '起始类（默认）'
      }
    },
    area() {
      const temp1 = this.form.province ? this.form.province + '/' : ''
      const temp2 = this.form.city ? this.form.city + '/' : ''
      const temp3 = this.form.district || ''
      return temp1 + temp2 + temp3
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem)
          temp = temp.filter(item => item[propitem.fatherProp] === this.form[propitem.fatherProp])
          if (!temp.map(item => item.id).includes(this.form[propitem.prop])) {
            this.form[propitem.prop] = ''
          }
          return temp
        }
        return this.enumGetproplist(propitem)
      }
    } },

  // filter fa_show
  watch: {
    'form': {
      handler(n) {
        console.log('表单变化', n)
        if (this.$listeners.formChange) {
          this.$listeners.formChange(n)
        }
      },
      deep: true
    },
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
              if (this.$listeners.formChange) {
                this.$listeners.formChange(false)
              }
            }
          })
        }
      },
      immediate: true
    },
    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          switch (this.$attrs.select_window_name) {
            case 'form_User': // 联系人选择
              this.form.contactPerson = n[0].id
              this.form.contactPersonName = n[0].surname
              this.form.contactPhone = n[0].phone
              break
          }
        }
      } }
  },
  created() {
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        const temp = {}
        ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req' }).map(item => {
          if (item.type === 'goodsCategory') {
            getCategoryTree().then(res => {
              this.goodsOptions = res.data
            })
          }
          temp[item.prop] = typeof item.defaultValue !== 'undefined' ? item.defaultValue : ''
        })
        // debugger
        if (['edits', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,批量修改
          this.form = temp
        } else if (['edit', 'copy'].includes(this.$attrs['operate-item'].prop)) { // 修改,复制
          const temp_form = Object.assign(temp, this.$attrs['current-row'])
          this.form = this.deepClone(temp_form)
          if (this.$attrs['operate-item'].prop === 'copy') { // 复制
            this.form.id = null
          }
        } else if (this.$attrs['operate-item'].prop === 'withinAdd') { // 追加
          this.form.id = null
          const temp_form = Object.assign(temp, this.$attrs['within-add-row'])
          this.form = this.deepClone(temp_form)
        }
        resolve(true)
      })
    },
    // 省市区
    areaChange(e) {
      this.$set(this.form, 'province', CodeToText[e[0]] || '')
      this.$set(this.form, 'city', CodeToText[e[1]] || '')
      this.$set(this.form, 'district', CodeToText[e[2]] || '')
    },
    lazyLoad(node, resolve) {
      this.codeOnfocus(node.level === 0 ? '' : node.data.code, node).then(res => {
        resolve(res)
      })
    },
    // 商品分类
    codeOnfocus(e = '', node) {
      if (node.hasChildren === false) {
        return Promise.resolve([])
      }
      return new Promise((resolve, reject) => {
        getCategoryList({ 'parentCode': (e === '' ? '0' : e) }).then(res => {
          if (res.code === 200) {
            if (res.data && res.data.length > 0) {
              const treeData = res.data.map(item => ({
                leaf: !item.haveChild,
                value: this.$attrs.cascaderbycode ? item.code : item.id,
                code: item.code,
                label: item.name,
                disabled: (!item.enable || this.form.code === item.code || node.isDisabled) // 不能选自己，和自己的子集
              }))
              if (e === '') {
                treeData.unshift({
                  leaf: true,
                  value: this.$attrs.cascaderbycode ? '0' : 1,
                  code: '0',
                  label: '起始类',
                  disabled: false
                })
              }
              resolve(treeData)
            } else {
              resolve([{
                leaf: true,
                value: this.$attrs.cascaderbycode ? '0' : 1,
                code: '0',
                label: '起始类',
                disabled: false
              }])
            }
          }
        })
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
</style>
