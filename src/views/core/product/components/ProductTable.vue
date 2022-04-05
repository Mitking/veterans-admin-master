<template>
  <div>
    <el-form ref="Form" size="mini" :model="form" status-icon>
      <el-table
        :data="form.details"
        style="width: 100%;margin: 10px"
        size="mini"
        class="my-class"
        :style="{width:table_width_total(ArrFilter( $attrs['form-data'],$attrs.filtration))}"
        border
      >
        <el-table-column v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-operate']" :width="op_width" fixed>
          <template slot="header">
            <div class="table-header">操作</div>
          </template>
          <template slot-scope="{row,$index}">
            <div class="operator-father">
              <i style="color:#409EFF" class="el-icon-delete" @click="deleteItem(row,$index)" />
              <i style="color:#409EFF" class="el-icon-circle-plus-outline" @click="addItem(row,$index)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item) in ArrFilter( $attrs['form-data'],$attrs.filtration)"
          :key="item.prop"
          :width="item.width"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
          </template>
          <template slot-scope="{row,$index}">
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail' || $attrs['edit-detail-disable']" style="display: flex;justify-content: center">
              {{
                (item.type==='select' && row[item.prop]) && MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false')
                  || item.type==='PRICE' && fen2yuan(row[item.prop])
                  || row[item.prop]
              }}
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item v-else :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30px'}" style="display: flex;align-items: center;justify-content: center">
              <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder || ''" />
              <el-input
                v-if="item.type==='ProductSelect'"
                v-model="row[item.prop]"
                :placeholder="item.placeholder || ''"
                :readonly="true"
                @focus="tipIndex=$index;select_window_name='ProductIndex';goods_select_form_show=true"
              />
              <el-input v-if="item.type==='number'" v-model.number="row[item.prop]" :placeholder="item.placeholder || ''" />
              <!-- :value="fen2yuan(row[item.prop])" v-model="row[item.prop]"  @input="row[item.prop]=$event"   :value="fen2yuan(row[item.prop])"        -->
              <!--:readonly="$index>1 && $attrs.filtration.addFather==='price_list'"   -->
              <!--                @keyup.native="priceKeyup(row)"-->
              <el-input
                v-if="item.type==='PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
                :placeholder="item.placeholder || ''"
                @input="()=>{row[item.prop]=yuan2fen(row[item.prop+'Show'])}"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>
              <el-select
                v-if="item.type==='select' && !item.readonly"
                v-model="row[item.prop]"
                :disabled="$index<2 && $attrs.filtration.addFather==='price_list'"
                class="item-select-fa"
                :placeholder="($index<2 && $attrs.filtration.addFather==='price_list')?'无需算法'
                  :$attrs.filtration.addFather==='price_list'?'请选择':(item.placeholder || '请选择')"
                :style="{'width':'100%'}"
                @change="algChange(row,$index)"
              >
                <el-option
                  v-for="(itemSon,indexSon) in selectComputed(item)"
                  :key="indexSon"
                  :disabled="alg_select_dis_comp(itemSon,row)"
                  :label="itemSon[item.selectOption?item.selectOption.label:'name']"
                  :value="itemSon[item.selectOption?item.selectOption.value:'value']"
                />
              </el-select>
              <div v-if="item.type==='if_type' && !item.readonly" class="table-header">
                <!--                <span style="margin:0 3px;font-size: 0.8rem">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>-->
                <el-switch
                  v-model="row[item.prop]"
                  :inactive-text="MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false')"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :width="30"
                />
              </div>
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: 2rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <!--     组合选品-->
    <el-dialog
      title="选择商品"
      :visible.sync="goods_select_form_show"
      :modal-append-to-body="false"
      width="80%"
    >
      <div style="width: 100%;padding-right:15px">
        <product-index
          :is_child="true"
          :add_arr="add_arr"
          :select_window_name="select_window_name"
          :table_goods_code_arr="table_goods_code_arr"
          :search_lock="{goodsType:'1'}"
          @selectList="add_arr=$event"
          @addlist="addGoods();goods_select_form_show=false;select_window_name=''"
        />
      </div>
      <template slot="footer">
        <el-button :loading="btnLoading" @click="goods_select_form_show=false;select_window_name='';btnLoading=false">取消</el-button>
        <el-button
          :loading="btnLoading"
          type="primary"
          :disabled="add_arr.length===0 || table_goods_code_arr.includes(add_arr.map(item=>item.goodsCode))"
          @click="addGoods"
        >确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { calculatePrice } from '@/api/core/product'
const ProductIndex = () => import ('@/views/core/product/product/index')
export default {
  name: 'ProductTable',
  components: { ProductIndex },
  // props: {
  //   type: String
  // },
  data() {
    return {
      btnLoading: false,
      tipIndex: 0,
      select_window_name: '',
      add_arr: [],
      goods_select_form_show: false,
      op_width: 100,
      form: { details: [] },
      initFormDetailsItem: {},
      deleteDetails: []
    }
  },
  computed: {
    table_width_total() { // 表格总宽度计算
      return function(arr) {
        return arr.map(item => item.width || 300).reduce((curr, prev) => (curr + prev), 1) + 'px'
      }
    },
    table_goods_code_arr() { // 已选品code
      return this.form.details.map(item => item.goodsCode)
    },
    alg_select_dis_comp() {
      return function(itemSon, row) {
        if (this.$attrs.filtration.addFather === 'price_list') {
          if (row.priceType === '2' || row.priceType === '3') {
            return true
          }
          const index = row.priceType === '5' ? 2 : 0
          return itemSon.maxCost < this.form.details[index].amount || itemSon.minCost > this.form.details[index].amount || this.form.details[index].amount === ''
        }
        return false
      }
    },
    propObj() {
      if (this.$attrs['operate-item'].prop === 'detail') {
        return { addFatherProp: 'detailReqs', 'detailShow': true, 'tableHidden': undefined }
      }
      return { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined }
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
    },
    rules() {
      const temp_obj = { details: {}}
      this.ArrFilter(this.$attrs['form-data'], this.$attrs.filtration).map(item => {
        if (item.rule) {
          this.$set(temp_obj.details, item.prop, item.rule)
          // temp_obj.details[item.prop] = item.rule
        }
        // Object.assign temp_obj
      })
      return temp_obj
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`产品价格列表${n ? '打开' : '关闭'}`)
          this.init()
        }
      },
      immediate: true
    }
    // 'form.details': {
    //   handler(n,o) {
    //     if (this.$attrs.filtration.addFather === 'price_list') { // 监听算法变化
    //
    //     }
    //   },
    //   deep: true
    // }
  },
  methods: {
    async addGoods() {
      this.btnLoading = true
      console.log(this.initFormDetailsItem)
      const pushArr = this.add_arr.map(item => Object.assign(
        this.deepClone(this.initFormDetailsItem),
        { goodsCode: item.goodsCode, goodsName: item.goodsName, saleMeasurementUnit: item.unitConversionRateRes.saleWeightType }))
      if (this.form.details[this.tipIndex].id) { // 被点击项有id
        pushArr[0].id = this.form.details[this.tipIndex].id
        // const { code } = await this.$listeners.deleteDetail({ id: this.form.details[this.tipIndex].id })
        // if (code === 200) {
        //   this.form.details.splice(this.tipIndex, 1)
        // }
      }
      this.form.details.splice(this.tipIndex, 1)
      this.form.details.insert(this.tipIndex, ...pushArr)
      this.add_arr = []
      this.select_window_name = ''
      this.goods_select_form_show = false
      this.btnLoading = false
    },
    // priceKeyup(row) {
    //   if (this.$attrs.filtration.addFather === 'price_list') {
    //     row.algCode = ''
    //   }
    // },
    textChange(e, r, p) {

    },
    init() {
      console.log(`${this.$attrs.filtration.addFather}表格数据开始初始化`)
      if (this.$attrs['operate-item'].prop === 'detail') { // 详情
        this.form.details = this.deepClone(this.$attrs[this.$attrs.filtration.addFather])
      }
      const temp = {}
      if (['edit', 'insert', 'copy'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改,复制
        this.ArrFilter(this.$attrs['form-data'], this.$attrs.filtration).map(item => {
          temp[item.prop] = item.defaultValue === undefined ? '' : item.defaultValue
        })
        this.initFormDetailsItem = this.deepClone(temp)
        this.form.details = this.deepClone(this.$attrs[this.$attrs.filtration.addFather])
      }
      if (this.$refs.Form) {
        this.$refs.Form.clearValidate()
      }
    },
    algChange(row) {
      if (this.$attrs.filtration.addFather === 'price_list') {
        const price = this.form.details[0].amount
        // const price = row.priceType === '5' && this.form.details[2].amount ||
        // row.priceType === '4' && this.form.details[0].amount ||
        // row.priceType === '8' && this.form.details[0].amount
        calculatePrice({ price: price, algCode: row.algCode }).then(res => {
          if (res.code === 200) {
            row.amount = res.data.calculatePrice
            row.amountShow = this.fen2yuan(row.amount)
          }
        })
      }
    },
    deleteItem(row, i) {
      if (this.form.details.length === 1) {
        this.$message.error('组合品至少要保留一项！')
        return
      }
      if (row.id) {
        if (this.$listeners.deleteDetail) {
          this.$confirm(`此操作将删除组合品「${row.goodsName}」, 是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$listeners.deleteDetail({ ids: [row.id] }).then(res => {
              if (res.code === 200) {
                if (this.form.details.length === 1) {
                  console.log('剩一项了')
                  this.$set(this.form.details, 0, this.deepClone(this.initFormDetailsItem))
                } else {
                  this.form.details.splice(i, 1)
                }
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
        }
      } else {
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          this.$set(this.form.details, 0, this.deepClone(this.initFormDetailsItem))
        } else {
          this.form.details.splice(i, 1)
        }
      }
    },
    addItem(row, i) {
      this.form.details.insert((i + 1), this.deepClone(this.initFormDetailsItem))
    }
    // test(e) {
    //
    //   return 123
    // }
  }
}
</script>

<style scoped>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.table-header{
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer-fa{
  display: flex;
  /*border: 1px solid blue;*/
  flex-direction: column;
  width: 85%;
}
.operator-father{
  display: flex;
  width:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}
.my-class >>> .el-form-item--mini.el-form-item{
  margin-bottom: 0
}
</style>
