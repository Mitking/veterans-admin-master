<template>
  <!--:formData="table_data_arr"-->
  <!--:operate-item="operateItem"-->
  <!--:current-row="currentRow"-->
  <!--:details="details"-->
  <!--:formshow="formShow"-->
  <!--@close="operateItem.loading = false"-->
  <!--@formSave="formSave"  @tab-click="handleClick"-->
  <!--@deleteDetail="deleteDetail"-->
  <div>
    <div v-if="!($attrs['operate-item'].prop==='detail')" style="margin: 10px 15px 15px 10px">
      <el-button size="small" type="primary" plain @click="test">全 选</el-button>
      <el-button size="small" type="primary" plain>删 除</el-button>
      <el-button size="small" type="primary" plain @click="addItem(null,$attrs.details.length)">追 加</el-button>
      <el-button size="small" type="primary" plain>批量添加</el-button>
      <!--      <el-button type="primary" plain @click="$listeners.closeModel">返回</el-button>-->
    </div>
    <!--   :rules="rules" :rules="rules"-->
    <el-form ref="Form" :model="form">
      <el-table
        v-for="(itemF,indexF) in form.details"
        :key="indexF"
        :data="compArr(itemF)"
        style="width: 100%;margin: 10px"
        :span-method="arraySpanMethod"
        :header-cell-style="{background:'#eeeeee',color:'#666666'}"
        border
      >
        <el-table-column v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0" :width="100" fixed>
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
          v-for="(item,index) in ArrFilter( $attrs['form-data'],{addFatherProp: 'detailReqs','editShow': true,'tableHidden':undefined})"
          :key="index"
          :width="180"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
          </template>
          <template slot-scope="{row,$index}">
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail'" style="display: flex;justify-content: center">
              <div v-if="item.prop==='carType' && $index===1" style="display: flex;width: 100%;height: 200px;align-items: center">
                <el-steps :simple="false" :active="100" align-center style="width: 100%">
                  <el-step title="沈阳" description="起始点" />
                  <el-step title="本溪" description="途径" />
                  <el-step title="丹东" description="途径" />
                  <el-step title="东港" description="终点" />
                </el-steps>
              </div>
              <div v-else>
                {{ item.type==='select' && MenuGetPropName(item.selectData,row[item.prop])
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') || row[item.prop] }}
              </div>
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item v-else :style="{'width':'100%','height':$index===1?'200px':'30px'}">
              <div v-if="$index===1" style="display: flex;width: 100%;height: 200px;align-items: center">
                <el-steps :active="100" align-center style="width: 100%">
                  <el-step title="沈阳" description="起始点" />
                  <el-step title="本溪" description="途径" />
                  <el-step title="丹东" description="途径" />
                  <el-step title="东港" description="终点" />
                </el-steps>
              </div>
              <div v-else>
                <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder || ''" />
                <el-input v-if="item.type==='number'" v-model.number="row[item.prop]" :placeholder="item.placeholder || ''" />
                <el-select v-if="item.type==='select'" v-model="row[item.prop]" class="item-select-fa" placeholder="请选择" :style="{'width':'100%'}">
                  <el-option
                    v-for="itemSon in selectComputed(item)"
                    :key="itemSon.value"
                    :label="itemSon.name"
                    :value="itemSon.value"
                  />
                </el-select>
                <div v-if="item.type==='if_type'" class="table-header">
                  <span style="margin:0 3px">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>
                  <el-switch
                    v-model="row[item.prop]"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                </div>
              </div>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>

export default {
  name: 'OmsTableNodes',
  data() {
    return {
      form: { details: [] },
      initFormDetailsItem: {}
    }
  },
  computed: {
    compArr() {
      return function(item) {
        const temp = [item]
        // const propNode = this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined })
        temp.push({ propNode: item.node })
        return temp
      }
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
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        // 路线nodes处理

        const detailsTemp = this.deepClone(this.$attrs.details)
        const prop = this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined })[0].prop
        // detailsTemp.map(item => {
        //   item.push({
        //     prop: item.node || []
        //   })
        // })
        // detailsTemp.push({prop:detailsTemp[0].node})
        this.form.details = detailsTemp // 详情
        const temp = {}
        this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
          temp[item.prop] = item.defaultValue || ''
        })

        this.initFormDetailsItem = this.deepClone(temp)

        if (['edit', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改
          if (this.$attrs['operate-item'].prop === 'insert') { // 创建
            this.form.details = [this.deepClone(this.initFormDetailsItem)]
          } else { // 修改
            this.form.details = detailsTemp
          }
        }
      })
    },
    arraySpanMethod({ rowIndex, columnIndex }) {
      if (rowIndex === 1) {
        if (columnIndex === 1) {
          return [1, 6]
        } else if (columnIndex === 1) {
          return [0, 0]
        }
      }
    },
    deleteItem(row, i) {
      if (row.id) {
        this.$listeners.deleteDetail(row).then(res => {
          if (res) {
            if (this.form.details.length === 1) {
              console.log('剩一项了')
              const temp = this.deepClone(this.initFormDetailsItem)
              this.$set(this.form.details, 0, temp)
            } else {
              this.form.details.splice(i, 1)
            }
          }
        })
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
</style>
