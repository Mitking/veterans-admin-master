<template>
  <div class="my-class">
    <div v-if="!($attrs['operate-item'].prop==='detail') && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']" style="margin: 10px 15px 15px 10px">
      <el-button size="small" type="primary" plain @click="form.details.push(deepClone(initFormDetailsItem))">追加</el-button>
      <el-button size="small" type="primary" plain @click="addItems">批量追加</el-button>
    </div>
    <!--   :rules="rules" :rules="rules"-->
    <el-form ref="Form" :model="form">
      <el-table ref="TabItem" :data="form.details" border>
        <el-table-column
          v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']"
          :width="100"
          fixed
        >
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
          :width="50"
          label="序号"
          type="index"
          align="center"
        />
        <el-table-column :width="150" align="center" label="商品代码">
          <template slot-scope="{row,$index}">
            <span v-if="$attrs['operate-item'].prop==='detail'">{{ row.goodsCode || '-' }}</span>
            <el-form-item v-else :prop="`details[${$index}].goodsCode`" :style="{'width':'100%','height':'30px'}" :rules="[{ required: true, message: '不能为空', trigger: 'change' }]">
              <el-input
                v-model="row.goodsCode"
                placeholder=""
                :readonly="true"
                @focus="insertIndex = $index;$listeners.openSelectWindow({ name: $store.getters.accountType===1?'StoreProductIndex':'ProductIndex', addedList: form.details, formProData: {}, curr: row })"
              />
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :width="240" align="center" label="商品名称">
          <template slot-scope="{row,$index}">
            <span v-if="$attrs['operate-item'].prop==='detail'">{{ row.goodsName || '-' }}</span>
            <el-form-item v-else :prop="`details[${$index}].goodsName`" :style="{'width':'100%','height':'30px'}" :rules="[{ required: true, message: '不能为空', trigger: 'change' }]">
              <el-input
                v-model="row.goodsName"
                placeholder=""
                :readonly="true"
                @focus="insertIndex = $index;$listeners.openSelectWindow({ name: $store.getters.accountType===1?'StoreProductIndex':'ProductIndex', addedList: form.details, formProData: {}, curr: row })"
              />
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :width="120" align="center" label="条码">
          <template slot-scope="{row}">
            <span>{{ row.barcode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :width="100" align="center" label="单位">
          <template slot-scope="{row}">
            <span>{{ row.weightType?MenuGetPropName('weight_type',row.weightType):'-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :width="100" align="center" label="零售价">
          <template slot-scope="{row}">
            <span>{{ row.retailPrice?fen2yuan(row.retailPrice): '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :width="100" align="center" label="会员价">
          <template slot-scope="{row}">
            <span>{{ row.memberPrice?fen2yuan(row.memberPrice): '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :width="100" align="center" label="促销价">
          <template slot-scope="{row,$index}">
            <span v-if="$attrs['operate-item'].prop==='detail'">{{ row.activPrice?fen2yuan(row.activPrice) : '-' }}</span>
            <el-form-item v-else :prop="`details[${$index}].activPrice`" :rules="[{ required: true, message: '不能为空', trigger: 'change' }]" :style="{'width':'100%','height':'30px'}">
              <el-input
                v-model="row.activPriceShow"
                v-number-input.float="{decimal:2}"
                placeholder=""
                :readonly="false"
                @input="row.activPrice=row.activPriceShow?yuan2fen(row.activPriceShow):''"
              />
              <!--   -->
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :width="100" align="center" label="每单限量">
          <template slot-scope="{row,$index}">
            <span v-if="$attrs['operate-item'].prop==='detail'">{{ row.orderLimited?g2kg(row.orderLimited) : '-' }}</span>
            <el-form-item v-else :prop="`details[${$index}].orderLimited`" :style="{'width':'100%','height':'30px'}">
              <el-input
                v-model="row.orderLimitedWeightShow"
                v-number-input.float="{decimal:3}"
                placeholder=""
                :readonly="false"
                @input="row.orderLimited=row.orderLimitedWeightShow?kg2g(row.orderLimitedWeightShow):''"
              />
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注">
          <template slot-scope="{row,$index}">
            <!-- :rules="item.rule" -->
            <span v-if="$attrs['operate-item'].prop==='detail'">{{ row.remark || '-' }}</span>
            <el-form-item v-else :prop="`details[${$index}].remark`" :style="{'width':'100%','height':'30px'}">
              <el-input v-model="row.remark" placeholder="" :readonly="false" />
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'WmsTable',
  components: {},
  data() {
    return {
      form: { details: [] },
      initFormDetailsItem: {
        'id': 0,
        'singleNo': '',
        'goodsCode': '',
        'barcode': '',
        'goodsName': '',
        'weightType': '',
        'retailPrice': 0,
        'activPrice': 0,
        'activPriceShow': '0',
        'memberPrice': 0,
        'orderLimited': 0,
        'orderLimitedWeightShow': 0,
        'remark': ''
      },
      deleteDetails: [],
      insertIndex: null,
      window_add_select_value: null
    }
  },
  computed: {
    rules() {
      const temp_obj = { details: {}}
      this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
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
          console.log(`tabble列表${n ? '打开' : '关闭'}`)
          this.init().then(() => {
            this.$nextTick(() => {
              if (this.$listeners.dataIsChange && this.$attrs['operate-item'].prop !== 'insert') { this.$listeners.dataIsChange(false) }
            })
          })
        } else { // 关闭
          if (this.$refs.Form) {
            this.$refs.Form.resetFields()
          }
        }
      },
      immediate: true
    },
    'form.details': { // 监听表格数据
      handler(n) {
        if (n) {
          if (this.$listeners.tabDateChange) {
            this.$listeners.tabDateChange(n)
          }
          if (this.$listeners.dataIsChange) { this.$listeners.dataIsChange(true) }
        }
      },
      deep: true,
      immediate: true
    },

    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          let temp = []

          if (this.$attrs.select_window_name.split('_')[0] === 'form') {
            return
          }
          switch (this.$attrs.select_window_name) {
            case 'type_ProductIndex':
              temp = n.map(item => Object.assign(
                this.deepClone(this.initFormDetailsItem),
                {
                  goodsCode: item.goodsCode,
                  barcode: item.barcode,
                  goodsName: item.goodsName,
                  weightType: item.weightType,
                  retailPrice: item.price,
                  memberPrice: item.memberPrice
                }))
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_StoreProductIndex':
              temp = n.map(item => Object.assign(
                this.deepClone(this.initFormDetailsItem),
                {
                  goodsCode: item.goodsCode,
                  barcode: item.barcode,
                  goodsName: item.goodsName,
                  weightType: item.weightType,
                  retailPrice: item.price,
                  memberPrice: item.memberPrice
                }))
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
          }

          if (this.insertIndex !== null) {
            this.form.details.insert(this.insertIndex + 1, ...temp)
            this.form.details.splice(this.insertIndex, 1)
          } else { // 批量添加
          // 如果只有第一条且第一条为模板
            if (this.form.details.length === 1 && JSON.stringify(this.form.details[0]) === JSON.stringify(this.initFormDetailsItem)) {
              this.form.details = []
            }
            this.form.details.push(...temp)
          }
          this.$listeners.clearAddArr()
        }
      },
      immediate: true
    }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('表格数据开始初始化')
        this.loading = true
        this.deleteDetails = []
        this.form.details = this.deepClone(this.$attrs.details) // 详情
        if (['insert'].includes(this.$attrs['operate-item'].prop)) { // 创建
          this.form.details = [this.deepClone(this.initFormDetailsItem)]
        } else if ((['edit'].includes(this.$attrs['operate-item'].prop))) { // 修改
          console.log('修改')
          this.form.details.map(item => { this.$set(item, 'activPriceShow', this.fen2yuan(item.activPrice)) })
          this.form.details.map(item => { this.$set(item, 'orderLimitedWeightShow', this.g2kg(item.orderLimited)) })
        }

        resolve(true)
      })
    },
    addItems() {
      this.insertIndex = null
      this.$listeners.openSelectWindow({ name: this.$store.getters.accountType === 1 ? 'StoreProductIndex' : 'ProductIndex', addedList: this.form.details, formProData: {}, curr: { id: null }})
    },
    deleteItem(row, i) {
      if (row.id) {
        this.deleteDetails.push(row.id)
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          const temp = this.deepClone(this.initFormDetailsItem)
          this.$set(this.form.details, 0, temp)
        } else {
          this.form.details.splice(i, 1)
        }
      } else {
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          const temp = this.deepClone(this.initFormDetailsItem)
          this.$set(this.form.details, 0, temp)
        } else {
          this.form.details.splice(i, 1)
        }
      }
    },
    addItem(row, i) {
      this.form.details.splice((i + 1), 0, this.deepClone(this.initFormDetailsItem))
    }

  }
}
</script>

<style scoped>
.my-class >>> .el-table td {
    padding: 6px 3px;
    /* margin: 10px 8px; */
}
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.table-header{
  display: flex;
  justify-content: center;
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
.my-class >>> .el-form-item{
  margin-bottom:10px
}
.my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}
.my-class-semi-auto >>> .el-input__inner{
  color: #493cff;
  font-weight: 600;
}
.flex-center{
 display: flex;
 justify-content: center;
 align-items: center;
}
</style>
