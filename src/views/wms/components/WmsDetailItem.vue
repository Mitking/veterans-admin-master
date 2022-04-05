<template>
  <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">
    <el-form-item
      v-for="(item,index) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true })"
      v-show="formItemShow(item)"
      :key="index"
      class="wid"
      :style="{'width':['orderFrom','selectFromPageArr'].includes(item.type)?'50%':'25%'}"
      :label="item.type==='remark'?'':item.title"
      :prop="item.prop"
    >
      <div v-if="form[item.prop]==='' && item.type!=='PRICE_AUTOMATIC'"><span style="color:#cccccc">-</span></div>
      <div v-else>
        <div v-if="item.type==='text' || item.type==='date' || item.type==='selectFromPage' || item.type==='number'">{{ form[item.prop] || '-' }}</div>
        <div v-if="item.type==='selectState' || item.type==='select'">{{ MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) || '-' }}</div>
        <div v-if="item.type==='PRICE' || item.type==='PRICE_AUTOMATIC'">{{ fen2yuan(form[item.prop]) || '-' }}</div>
        <div v-if="item.type==='NUMBER_AUTOMATIC'">{{ comp_number_auto(item) || '-' }}</div>
        <!-- <div v-if="item.type==='selectFromPageArr'">{{ form[item.prop]? form[item.prop].toString() : '-' }}</div> -->
        <div v-if="item.type==='orderFrom'">{{ form.orderFrom || '-' }}</div>
        <el-button v-if="item.type==='buttonForm'" type="text" :loading="form_loading" @click="buttonFormClick(item)">点击查看</el-button>
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop]) }}
          </span>
        </div>
        <div v-if="item.type==='range'">{{ form[item.range[0].prop] }} - {{ form[item.range[1].prop] }}</div>
        <el-tooltip
          v-if="item.type==='storeIds'"
          effect="dark"
          :content="form[item.prop].map(item=>MenuGetPropName('stores',item,{ value: 'id', label: 'name' })).toString()"
          placement="top-start"
        >
          <div>
            {{ form[item.prop].map(item=>MenuGetPropName('stores',item,{ value: 'id', label: 'name' })).toString() | sizeFilter(10) }}
          </div>
        </el-tooltip>
        <el-tooltip
          v-if="item.type==='goodsCategory' && form[item.prop]"
          effect="dark"
          placement="top-start"
          :content="form[item.prop].map(item=>MenuGetPropName('categoryList',item,{ value: 'id', label: 'name' })).toString()"
        >
          <div>
            {{ form[item.prop].map(item=>MenuGetPropName('categoryList',item,{ value: 'id', label: 'name' })).toString() | sizeFilter(20) }}
          </div>
        </el-tooltip>

        <el-tooltip
          v-if="item.type==='selectFromPageArr'"
          effect="light"
          :content="form[item.prop]? form[item.prop].toString() : '-'"
          placement="bottom-start"
        >
          <div>
            {{ form[item.prop]? form[item.prop].toString() : '-' | sizeFilter(59) }}
          </div>
        </el-tooltip>

      </div>
    </el-form-item>
    <!-- <el-form-item
      v-if="!!form.orderFrom"
      :style="{'width':'25%'}"
      label="订单来源"
    >
      {{ form.orderFrom }}
    </el-form-item> -->
    <el-dialog
      title="费用单列表"
      :visible.sync="formListShow"
      width="80%"
    >
      <div>
        <el-table
          ref="FormTab"
          :data="dialogList"
          style="width: 80%;margin:0 10%"
          border
          max-height="500"
          highlight-current-row
          :header-cell-style="{background:'#F3F4F7',color:'#555'}"
        >
          <el-table-column
            prop="purCostsOrderNo"
            label="费用单号"
            align="center"
            width="260"
          />
          <el-table-column
            prop="costDate"
            label="费用日期"
            align="center"
          />
          <el-table-column
            prop="totalAmount"
            label="费用总金额"
            align="center"
          >
            <template slot-scope="{row}">
              {{ fen2yuan(row.totalAmount) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="formListShow = false">确 定</el-button>
      </div>
    </el-dialog>
  </el-form>
</template>

<script>
import { ArrFilter } from '@/utils'
export default {
  name: 'WmsDetailItem',
  data() {
    return {
      formListShow: false,
      form_loading: false,
      form: {},
      dialogList: []
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
        return this.fen2yuan(this.form[item.prop])
      }
    },

    comp_number_auto() {
      return function(item) { // 总金额自动计算
        return item.design()
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
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`wms表单${n ? '打开' : '关闭'}`)
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('详情数据开始初始化')
        this.loading = true
        const temp = {}
        // 详情
        ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true }).map(item => {
          const type1 = typeof this.$attrs['current-row'][item.prop] === 'boolean'
          temp[item.prop] = type1 ? this.$attrs['current-row'][item.prop]
            : (this.$attrs['current-row'][item.prop] || '-')
          if (item.type === 'range') {
            item.range.map(itemZ => {
              temp[itemZ.prop] = this.fen2yuan(this.$attrs['current-row'][itemZ.prop])
            })
          }
          if (item.valToStr) {
            temp[item.prop] = temp[item.prop].toString()
          }
        })
        this.form = temp
      })
    },
    buttonFormClick(e) {
      this.form_loading = true
      e.click(this.form[e.prop]).then(res => {
        this.dialogList = res.data
        this.formListShow = true
      }).finally(() => {
        this.form_loading = false
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
