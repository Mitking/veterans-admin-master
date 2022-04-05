<template>
  <!-- length querySelectorAll  -->
  <div>
    <div v-if="!($attrs['operate-item'].prop==='detail')" style="margin: 10px 15px 15px 10px">
      <el-button size="small" type="primary" plain @click="addItem(null,$attrs.details.length)">追 加</el-button>
      <!--      <el-button type="primary" plain @click="$listeners.closeModel">返回</el-button>-->
    </div>
    <!--   :rules="rules" :rules="rules"-->
    <el-form ref="Form" :model="form">
      <el-table
        :data="form.details"
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
            <div class="operator-father">
              <i style="color:#409EFF" class="el-icon-edit" @click="editNode(row,$index)" />
              <i style="color:#409EFF" class="el-icon-finished" @click="finishNode(row,$index)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item,index) in ArrFilter( $attrs['form-data'],{addFatherProp: 'detailReqs','tableHidden':undefined})"
          :key="index"
          :width="item.tabWidth || 180"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
          </template>
          <template slot-scope="{row,$index}">
            <!-- 详情，只读 -->
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail'" style="display: flex;justify-content: center">
              <div v-if="($index+1)%2===0 && item.prop==='carType'" style="display: flex;width: 100%;height: 200px;align-items: center">
                <el-steps
                  class="my-class"
                  :simple="false"
                  :active="row[item.prop].length"
                  align-center
                  style="width: 100%"
                >
                  <el-step
                    v-for="(itemZ,indexZ) in comp_sort(row[item.prop])"
                    :key="indexZ"
                    :title="itemZ.city"
                    :description="indexZ===0 && '始发地' || indexZ===row[item.prop].length-1 && '终点' || '途径'"
                  />
                </el-steps>
              </div>
              <div v-else>
                {{ item.type==='select' && MenuGetPropName(item.selectData,row[item.prop],item.selectOption)
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') || row[item.prop] }}
              </div>
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <!-- 修改，新增 -->
            <div v-else>
              <div
                v-if="($index+1)%2===0 && item.prop==='carType'"
                :style="{'display': 'flex','width': '100%','height': row.edit? '200px':'100px','align-items': row.edit? '':'center'}"
              >
                <el-steps
                  class="my-class"
                  :simple="false"
                  :active="row[item.prop].length"
                  align-center
                  style="width: 100%"
                >
                  <el-step
                    v-for="(itemZ,indexZ) in comp_sort(row[item.prop])"
                    :key="indexZ"
                    :title="itemZ.city"
                    :description="row.edit?'':(indexZ===0 && '始发地' || indexZ===row[item.prop].length-1 && '终点' || '途径')"
                  >
                    <div v-if="row.edit" slot="title" style="display: flex;flex-direction: column;align-items: center">
                      <!--                      {{ form.details[1].carType }}:model="form.details[$index].carType" "-->
                      <el-form
                        ref="nodeForm"
                        :model="row.carType[getIndex(row[item.prop], itemZ)]"
                        :inline-message="true"
                        class="my-class"
                        size="mini"
                        label-position="right"
                        style="width: 60%;max-width: 230px;min-width: 200px"
                      >
                        <el-form-item
                          v-for="(itemProp,indexProp) in ArrFilter($attrs['form-data'], { addFatherProp: 'nodes', 'editShow': true })"
                          :key="indexProp"
                          label-width="80px"
                          :rules="itemProp.rule"
                          :label="itemProp.title"
                          :prop="itemProp.prop"
                        >

                          <el-input
                            v-if="itemProp.type==='text'"
                            v-model="row[item.prop][getIndex(row[item.prop], itemZ)][itemProp.prop]"
                            :placeholder="itemProp.placeholder"
                            size="mini"
                          />
                          <span
                            slot="error"
                            slot-scope="{error}"
                            style="flex: 1;color:red;font-size: 0.6rem;position: absolute;left:1rem"
                          >{{ error }}</span>
                        </el-form-item>
                        <el-form-item>
                          <el-button icon="el-icon-map-location" size="mini" />
                          <el-button v-if="indexZ!==row[item.prop].length-1" size="mini" icon="el-icon-plus" @click="addNode(row,itemZ)" />
                          <el-button v-if="indexZ!==0 && indexZ!==row[item.prop].length-1" size="mini" icon="el-icon-minus" @click="delNode(row,itemZ)" />
                        </el-form-item>
                      </el-form>
                    </div>
                  </el-step>
                </el-steps>
              </div>
              <el-form-item v-else-if="$index%2===0" :rules="item.rule" :prop="`details[${$index}][${item.prop}]`">
                <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder || ''" />
                <el-input v-if="item.type==='number'" v-model.number="row[item.prop]" :placeholder="item.placeholder || ''" />
                <el-select v-if="item.type==='select'" v-model="row[item.prop]" class="item-select-fa" placeholder="请选择" :style="{'width':'100%'}">
                  <el-option
                    v-for="itemSon in selectComputed(item)"
                    :key="itemSon.value"
                    :label="itemSon[item.selectOption?item.selectOption.label:'name']"
                    :value="itemSon[item.selectOption?item.selectOption.value:'value']"
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
              </el-form-item>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>

export default {
  name: 'WmsTableNodes',
  data() {
    return {
      form: { details: [] },
      deleteDetails: [],
      initFormDetailsItem: {},
      propList: [],
      nodeInit: {
        edit: true,
        carType: [
          {
            addr: '始发地址',
            city: '始发城市',
            id: null,
            lat: '',
            lng: '',
            routeIndex: 0
          }, {
            addr: '到达地',
            city: '到达城市',
            id: null,
            lat: '',
            lng: '',
            routeIndex: 1
          }] }
    }
  },
  computed: {
    comp_sort() {
      return function(Arr) {
        const temp = this.deepClone(Arr)
        return temp.sort((a, b) => (a.routeIndex - b.routeIndex))
      }
    },
    selectComputed() { // select选项集
      return function(propitem) {
        return this.enumGetproplist(propitem)
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
  created() {
    console.log('新进入页面')
    this.deleteDetails = []
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('table数据开始初始化')
        this.deleteDetails = []
        this.loading = true
        const details = this.deepClone(this.$attrs.details)
        
        // detailsTemp.insert(detailsTemp.) carType
        const detailsTemp = []
        details.map(item => {
          item.driver = Number(item.driver)
          detailsTemp.push(item)
          detailsTemp.push({ carType: item.nodes })
        })
        this.propList = this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined })
        this.form.details = detailsTemp // 详情
        
        // 新增模板
        const temp = {}
        this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'tableHidden': undefined }).map(item => {
          temp[item.prop] = item.defaultValue || ''
        })

        this.initFormDetailsItem = this.deepClone(temp)
        if (this.$attrs['operate-item'].prop === 'insert') { // 创建
          this.form.details = [this.deepClone(this.initFormDetailsItem)]
          this.form.details.push(this.nodeInit)
        }
      })
    },
    arraySpanMethod({ rowIndex, columnIndex }) {
      if (this.$attrs['operate-item'].prop === 'detail') {
        if (rowIndex % 2 === 0) {
          return [1, 1]
        } else {
          return [1, this.propList.length]
        }
      }
      if (rowIndex % 2 === 0) {
        if (columnIndex === 0) {
          return [2, 1]
        } else {
          return [1, 1]
        }
      } else {
        // return [1, this.propList.length]
        if (columnIndex === 0) {
          return [0, 0]
        } else {
          return [1, this.propList.length]
        }
      }
    },
    deleteItem(row, i) {
      if (row.id) {
        this.$listeners.deleteDetail(row).then(res => {
          if (res) {
            this.deleteDetails.push(row.id)
            if (this.form.details.length === 2) {
              console.log('剩一项了')
              // const temp = this.deepClone(this.form)
              this.$set(this.form.details, 0, this.deepClone(this.initFormDetailsItem))
              this.$set(this.form.details, 1, this.deepClone(this.nodeInit))
            } else {
              this.form.details.splice(i, 2)
            }
          }
        })
      } else {
        if (this.form.details.length === 2) {
          console.log('剩一项了')
          this.$set(this.form.details, 0, this.deepClone(this.initFormDetailsItem))
          this.$set(this.form.details, 1, this.deepClone(this.nodeInit))
        } else {
          this.form.details.splice(i, 2)
        }
      }
    },
    addItem(row, i) {
      this.form.details.insert(i + 2, this.deepClone(this.initFormDetailsItem), this.deepClone(this.nodeInit))
      // this.form.details.splice((i + 1), 0, this.deepClone(this.form.details[0]))
      // this.form.details.splice((i + 1), 0, this.deepClone(this.initFormDetailsItem))
    },
    editNode(row, i) {
      console.log(i)
      this.$set(this.form.details[i + 1], 'edit', true)
    },
    finishNode(row, i) {
      if (this.$refs.nodeForm && this.$refs.nodeForm.length > 0) {
        Promise.all(this.$refs.nodeForm.map(item => item.validate())).then(res => {
          if (res.some(item => item === false)) {
            this.$message.error('请检查数据')
          } else {
            this.$set(this.form.details[i + 1], 'edit', false)
          }
        }).catch(() => {
          this.$message.error('请检查数据')
        })
      }
    },
    test() {
      // this.$refs.Form.resetField()
      this.$refs.Form.resetFields()
    },
    addNode(row, i) {
      row.carType.map(item => {
        item.routeIndex = item.routeIndex > i.routeIndex ? (item.routeIndex + 1) : item.routeIndex
      })
      row.carType.insert(i.routeIndex, {
        addr: '',
        city: '',
        id: null,
        lat: '',
        lng: '',
        routeIndex: i.routeIndex + 1
      })
      this.$listeners.updataWidth({ prop: 'remark', addFatherProp: 'detailReqs' }, row.carType.length)
    },
    delNode(row, i) {
      // if (i.id) { // 有id的notes调用删除接口
      this.$listeners.deleteNodes(i.id).then(res => {
        if (res) {
          row.carType.splice(this.getIndex(row.carType, i), 1)
          row.carType.map(item => {
            item.routeIndex = item.routeIndex > i.routeIndex ? (item.routeIndex - 1) : item.routeIndex
          })
          this.$nextTick(() => {
            this.$refs.nodeForm.map(item => item.validate())
          })
        }
      })
      this.$listeners.updataWidth({ prop: 'remark', addFatherProp: 'detailReqs' }, row.carType.length)
      if (row.carType.id && i.id) { // 行列id都存在，更新数据
        this.$listeners.updateDetailsNotes(row.carType.id, i.id)
      }
      // } else { // 无id的notes直接删除
      //   row.carType.slice(this.getIndex(row.carType, i), 1)
      //   row.carType.map(item => {
      //     item.routeIndex = item.routeIndex > i.routeIndex ? (item.routeIndex - 1) : item.routeIndex
      //   })
      // }
    },
    getIndex(_arr, _obj) {
      const len = _arr.length
      for (let i = 0; i < len; i++) {
        if (_arr[i].routeIndex === _obj.routeIndex) {
          return Number(i)
        }
      }
      return -1
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
  justify-content: space-around;
  font-size: 1.25rem;
  padding:1rem 0
}
.my-class >>> .el-step__description{
  color: #f17575;
}
.my-class >>> .el-form-item{
  margin:3px
}
</style>
