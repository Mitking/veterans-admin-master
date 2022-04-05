<template>
  <div>
    <div v-if="!($attrs['operate-item'].prop==='detail') && !$attrs['edit-detail-disable']" style="margin: 10px 15px 15px 10px">
      <el-button
        v-for="(item,index) in $attrs.detail_table_buttons"
        :key="index"
        size="small"
        type="primary"
        plain
        @click="opFunc(item)"
      >
        {{ item.title }}
      </el-button>
    </div>
    <!--   :rules="rules" :rules="rules"-->
    <el-form ref="Form" :model="form">
      <el-table
        :data="form.details"
        class="my-class"
        style="width: 100%;margin: 10px"
        :style="{width:minxin_width_total( ArrFilter( $attrs['form-data'],propObj),{widthProp:'tableWidth',op:operate_show,opWidth:100} )}"
        :header-cell-style="{background:'#F3F4F7',color:'#555'}"
        border
      >
        <el-table-column v-if="operate_show" :width="100" fixed>
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
          v-for="(item,index) in ArrFilter( $attrs['form-data'],propObj)"
          :key="index"
          :width="item.tableWidth || 300"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
          </template>
          <template slot-scope="{row,column,$index}">
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail' || $attrs['edit-detail-disable']" style="display: flex;justify-content: center">
              {{
                item.type==='select' && MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') ||
                  item.type==='PRICE' && fen2yuan(row[item.prop]) || row[item.prop] | sizeFilter(column.realWidth/(item.fontWidth || 18))
              }}
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item v-else :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30px'}">
              <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder || ''" />
              <el-input
                v-if="item.type==='selectFromPage'"
                v-model="row[item.prop]"
                :readonly="true"
                @focus="opFunc(item,$index)"
              />

              <el-input v-if="item.type==='number'" v-model.number="row[item.prop]" :placeholder="item.placeholder || ''" />
              <el-select v-if="item.type==='select' && !item.readonly" v-model="row[item.prop]" class="item-select-fa" placeholder="请选择" :style="{'width':'100%'}">
                <el-option
                  v-for="itemSon in selectComputed(item)"
                  :key="itemSon.value"
                  :label="itemSon.name"
                  :value="itemSon.value"
                />
              </el-select>
              <div v-if="item.type==='if_type' && !item.readonly" class="table-header">
                <span style="margin:0 3px">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>
                <el-switch
                  v-model="row[item.prop]"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
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
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
export default {
  name: 'CoreTable',
  mixins: [MixinGlobal],
  data() {
    return {
      form: { details: [] },
      initFormDetailsItem: {},
      deleteDetails: [],
      insertIndex: null,
      window_add_select_value: null
    }
  },
  computed: {
    propObj() {
      if (this.$attrs['operate-item'].prop === 'detail') {
        return { addFatherProp: 'detailReqs', 'detailShow': true, 'tableHidden': undefined }
      }
      return { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined }
    },
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
    operate_show() { // 显示操作栏
      return (!(this.$attrs['operate-item'].prop === 'detail') && this.form.details.length > 0 && !this.$attrs['edit-detail-disable'])
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
    },
    '$attrs.add_arr': {
      handler(n) {
        if (n.length > 0) {
          const temp = n.map(item => ({ goodsCode: item.goodsCode, goodsName: item.goodsName, goodsCategoryId: item.goodsCategoryId }))
          if (this.insertIndex !== null) {
            // if (this.window_add_select_value === '' && (this.insertIndex + 1) === this.form.details.length) { // 被点击输入框内容为空并且是最后一个
            //   this.form.details.insert(this.insertIndex, ...temp)
            // } else { // 不为空，插入并拿掉被选择项目
            this.form.details.insert(this.insertIndex + 1, ...temp)
            this.form.details.splice(this.insertIndex, 1)
            // }
          } else {
            this.form.details.push(...temp)
          }

          this.$listeners.clearAddArr()
        }
      },
      immediate: true
    }
  },
  methods: {
    opFunc(e, i = null) {
      this.insertIndex = i
      if (i !== null && e.prop) {
        this.window_add_select_value = this.form.details[i][e.prop]
      } else {
        this.window_add_select_value = null
      }
      switch (e.click) {
        case 'addItem':
          this.addItem(null, this.form.details.length)
          break
        case 'addItems':
          this.$listeners.openSelectWindow({ name: e.windowName, addedList: this.form.details })
          break
      }
    },
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        this.deleteDetails = []
        this.form.details = this.deepClone(this.$attrs.details) // 详情
        const temp = {}
        if (['edit', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改
          this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
            temp[item.prop] = item.defaultValue || ''
          })
          this.initFormDetailsItem = this.deepClone(temp)

          if (this.$attrs['operate-item'].prop === 'insert') { // 创建
            this.form.details = [this.deepClone(this.initFormDetailsItem)]
          } else { // 修改
            this.form.details = this.deepClone(this.$attrs.details)
          }
        }
      })
    },
    deleteItem(row, i) {
      if (row.id) {
        this.$listeners.deleteDetail(row).then(res => {
          if (res) {
            this.deleteDetails.push(row.id)
            if (this.form.details.length === 1) {
              console.log('剩一项了')
              const temp = this.deepClone(this.form)
              this.$set(this.form.details, 0, temp.details[0])
            } else {
              this.form.details.splice(i, 1)
            }
          }
        })
      } else {
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          const temp = this.deepClone(this.form)
          this.$set(this.form.details, 0, temp.details[0])
        } else {
          this.form.details.splice(i, 1)
        }
      }
    },
    addItem(row, i) {
      this.form.details.splice((i + 1), 0, this.deepClone(this.initFormDetailsItem))
    },
    test() {
      // this.$refs.Form.resetField()
      this.$refs.Form.resetFields()
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
  weight:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}

.my-class >>> .el-form-item.el-form-item{
  margin-bottom: 10px
}
</style>
