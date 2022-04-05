<template>
  <div>
    <el-form ref="Form" :model="form">
      <el-table
        :data="form.details"
        style="width: 641px;margin: 24px"
        width="640"
        border
      >
        <el-table-column v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable']" :width="100" fixed>
          <template slot="header">
            <div class="table-header">操作</div>
          </template>
          <template slot-scope="{row,$index}">
            <div class="operator-father">
              <i v-if="$index>1" style="color:#409EFF" class="el-icon-delete" @click="deleteItem(row,$index)" />
              <i v-if="$index>0" style="color:#409EFF" class="el-icon-circle-plus-outline" @click="addItem(row,$index)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item,index) in ArrFilter( $attrs['form-data'],{ addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined })"
          :key="index"
          :width="180"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
          </template>
          <template slot-scope="{row,$index}">
            <!--            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail' || $attrs['edit-detail-disable']" style="display: flex;justify-content: center">-->
            <!--              {{ item.type==='select' && MenuGetPropName(item.selectData,row[item.prop])-->
            <!--                || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') || row[item.prop] }}-->
            <!--            </div>-->
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30'}">
              <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder || ''" />
              <el-input
                v-if="item.type==='PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="{decimal:2,max:999999}"
                :disabled="$index<2"
                :placeholder="item.placeholder || ''"
                @input="()=>{row[item.prop]=yuan2fen(row[item.prop+'Show']);log(row)}"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>
              <el-select v-if="item.type==='select' && !item.readonly" v-model="row[item.prop]" :disabled="$index<2" class="item-select-fa" placeholder="请选择" :style="{'width':'100%'}">
                <el-option
                  v-for="itemSon in selectComputed(item)"
                  :key="itemSon.value"
                  :label="itemSon.name"
                  :value="itemSon.value"
                />
              </el-select>
              <div v-if="item.type==='if_type' && !item.readonly" class="table-header">
                <el-switch
                  v-model="row[item.prop]"
                  :inactive-text="MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false')"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div class="btn-footer">
      <el-button @click="$listeners.formSave('close')">返回</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'StoreProductPriceTable',
  data() {
    return {
      form: { details: [] },
      initFormDetailsItem: {},
      deleteDetails: []
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
          console.log(`wms列表${n ? '打开' : '关闭'}`)
          this.init()
        } else {
          if (this.$refs.Form) {
            this.$refs.Form.resetFields()
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    log(e) {

    },
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')

        const temp = {}
        // if (['edit', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改
        this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
          temp[item.prop] = item.defaultValue || ''
        })
        this.$set(this.form, 'details', this.deepClone(this.$attrs.details))
        temp.id = null
        temp.goodsPriceShow = ''
        this.initFormDetailsItem = Object.assign(this.deepClone(this.form.details[0]), this.deepClone(temp))
      })
    },
    deleteItem(row, i) {
      if (row.id) {
        this.$confirm(`此操作将删除「${this.MenuGetPropName('price_type', row.priceType)}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$listeners.deleteDetail(row).then(res => {
            if (res.code === 200) {
              this.form.details.splice(i, 1)
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        this.form.details.splice(i, 1)
      }
    },
    addItem(row, i) {
      this.form.details.insert(i + 1, this.deepClone(this.initFormDetailsItem))
    },
    submit() {
      this.$refs.Form.validate().then(res => {
        if (res) {
          this.$listeners.formSave(this.form.details)
        }
      })
    }
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
.btn-footer{
  margin-left: 510px;
}
</style>
