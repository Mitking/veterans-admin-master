<template>
  <div class="heightParent" :style="{height:$attrs.is_child?(windowHeight-180)+'px':(windowHeight-167)+'px'}">
    <div v-if="!$attrs.is_child" class="title-add-form">{{ $attrs['operate-item'].title }}</div>
    <div :class="$attrs.is_child?'formFeatherChild':'formFeather'">
      <!--   基础信息   -->
      <el-card key="basics" class="formCard my-class my-class-line">
        <div class="my-class-form-title">基础信息</div>
        <product-form v-if="$attrs['operate-item'].prop!=='detail'" ref="basics" style="padding-bottom: 10px" :filtration="{addFather: 'basics',formShow: true}" class="my-class-edit" v-bind="$attrs" v-on="$listeners" />
        <product-detail-item v-if="$attrs['operate-item'].prop==='detail'" :filtration="{addFather: 'basics',formShow: true}" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
      </el-card>

      <!--组合品数据 -->
      <el-card v-show="$attrs.form.goodsType==='2'" key="combo_list" class="formCard my-class my-class-line">
        <div class="my-class-form-title">组合品信息</div>
        <product-table
          ref="combo_list"
          :filtration="{addFather: 'combo_list',formShow: true}"
          :edit-operate="false"
          v-bind="$attrs"
          @deleteDetail="deleteComboFn"
          v-on="$listeners"
        />
      </el-card>

      <!--   单位数据   -->
      <el-card class="formCard my-class my-class-line">
        <div class="my-class-form-title">计量单位</div>
        <product-prop-form
          v-if="$attrs['operate-item'].prop!=='detail'"
          ref="unitConversionRateReq"
          style="padding-bottom: 10px"
          form_prop="unitConversionRateRes"
          :filtration="{addFather: 'unitConversionRateReq',formShow: true}"
          class="my-class-edit"
          v-bind="$attrs"
          v-on="$listeners"
        />
        <product-detail-prop-form v-if="$attrs['operate-item'].prop==='detail'" :filtration="{addFather: 'unitConversionRateReq',formShow: true}" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
      </el-card>

      <!--   价格数据     -->
      <el-card v-if="$attrs.price_list" class="formCard my-class my-class-line">
        <div class="my-class-form-title">价格信息</div>
        <product-table-form
          ref="price_list"
          :filtration="{addFather: 'price_list',formShow: true}"
          :edit-operate="true"
          v-bind="$attrs"
          v-on="$listeners"
        />
      </el-card>

      <!--   仓储数据   -->
      <el-card class="formCard my-class my-class-line">
        <div class="my-class-form-title">仓储信息</div>
        <product-form v-if="$attrs['operate-item'].prop!=='detail'" ref="storage" :filtration="{addFather: 'storage',formShow: true}" class="my-class-edit" v-bind="$attrs" v-on="$listeners" />
        <product-detail-item v-if="$attrs['operate-item'].prop==='detail'" :filtration="{addFather: 'storage',formShow: true}" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
      </el-card>

      <!--   其他信息   -->
      <el-card class="formCard my-class my-class-line">
        <div class="my-class-form-title">其他信息</div>
        <product-form v-if="$attrs['operate-item'].prop!=='detail'" ref="marketing" :filtration="{addFather: 'marketing',formShow: true}" class="my-class-edit" v-bind="$attrs" v-on="$listeners" />
        <product-detail-item v-if="$attrs['operate-item'].prop==='detail'" :filtration="{addFather: 'marketing',formShow: true}" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
      </el-card>

    </div>
    <!--    底部    -->
    <div v-if="!$attrs.is_child" class="footer">
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" :loading="loading" type="primary" @click="onSubmit($attrs['operate-item'].prop)">
        <template v-if="['insert','withinAdd','edit','edits','copy'].includes($attrs['operate-item'].prop)">
          {{ $attrs['operate-item'].showTitle || $attrs['operate-item'].title }}
        </template>
      </el-button>
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" type="success" :loading="loading" @click="reset">{{
        $attrs['operate-item'].prop==='insert' && '重置' ||
          ['edit','withinAdd','edits','copy'].includes($attrs['operate-item'].prop) && '还原'
      }}
      </el-button>
      <el-button :loading="loading" @click="onSubmit('detail')">
        <template>
          关闭
        </template>
      </el-button>
    </div>
  </div>
</template>

<script>
// itemNum match
import { deleteCombo } from '@/api/core/product'
import MixinGlobal from '@/components/MixinGlobal'
import ProductForm from './ProductForm'
import ProductDetailItem from './ProductDetailItem'
import ProductPropForm from './ProductPropForm'
import ProductDetailPropForm from './ProductDetailPropForm'
import ProductTable from './ProductTable'
import ProductTableForm from './ProductTableForm'

export default {
  name: 'ProductAdd',
  components: { ProductForm, ProductTable, ProductPropForm, ProductDetailItem, ProductDetailPropForm, ProductTableForm },
  mixins: [MixinGlobal],
  data() {
    return {
      table_operate_width: 100,
      collapseNames: ['basics', 'combo_list', 'storage', 'unitConversionRateReq', 'marketing', 'price_list'],
      loading: false,
      windowHeight: document.documentElement.clientHeight,
      form_temp: {},
      form_price_list_temp: [],
      form_combo_list_temp: [],
      opened: false
    }
  },
  computed: {
    isChange_comp() {
      if (this.opened) {
        return this.isChange()
      } else {
        return this.opened
      }
    }
  },
  watch: {
    // isChange_comp(n) {
    //   if (n) {
    //     const collapseAll = ['basics', 'storage', 'marketing', 'shopping', 'unitConversionRateReq']
    //     if (this.$attrs.form.goodsType === '2') {
    //       collapseAll.push('combo_list')
    //     }
    //     setTimeout(() => {
    //       collapseAll.map(item => {
    //         if (this.$refs[item]) {
    //           this.$refs[item].init()
    //         }
    //       })
    //     }, 0)
    //   }
    // },
    // '$attrs.form': {
    //   handler(n) {
    //   },
    //   deep: true,
    //   immediate: true
    // },
    // '$attrs.form.goodsCategoryId': {
    //   handler(n) {
    //
    //   },
    //   deep: true
    //   // immediate: true
    // },
    '$attrs.show': {
      handler(n) {
        if (n === 'ProductAdd') { // 打开页面
          console.log('缓存复制')
          this.form_temp = this.deepClone(this.$attrs.form) // 缓存数据，方便关闭时对比数据
          this.form_price_list_temp = this.$json_copy(this.$attrs.price_list) // 缓存数据，方便关闭时对比数据
          this.form_combo_list_temp = this.$json_copy(this.$attrs.combo_list) // 缓存数据，方便关闭时对比数据
        }
      },
      immediate: true
    },
    '$attrs.form.goodsType': {
      handler(n) {
        const collapseAll = ['basics', 'storage', 'marketing', 'unitConversionRateReq']
        if (n === '2') {
          collapseAll.push('combo_list')
        }
        this.$refs.combo_list.op_width = n === '2' ? 101 : 100
        setTimeout(() => {
          collapseAll.map(item => {
            if (this.$refs[item]) {
              this.$refs[item].init()
            }
          })
        }, 0)
      }
    }
  },
  created() {},
  mounted() {
    this.opened = true
  },
  methods: {
    onSubmit(e) {
      // if (e === 'detail') {
      //   console.log('关闭表单')
      //   this.$listeners.formSave({ action: 'close', opt: 'detail' })
      //   return
      // }
      if (this.isChange() && e === 'detail') { // 点击修改且无变动直接关闭，点击且无变动直接关闭
        console.log('关闭表单')
        // this.$message.info('表单无变动')
        this.$listeners.formSave({ action: 'close' })
        return
      }
      switch (this.$attrs['operate-item'].prop) {
        case 'detail':
          this.loading = false
          this.$listeners.formSave({ action: 'close' })
          break
        case 'edit': case 'insert':case 'copy': { // 修改，新增,复制
          if (e === 'detail') { // 关闭且有变动，提示弹窗
            this.$confirm(`系统发现有变动项目，关闭后这些项目不会被保存，直接关闭表单？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.$listeners.formSave({ action: 'close' })
            }).catch(() => {
              this.loading = false
              this.$message({
                type: 'info',
                message: `请点击${this.$attrs['operate-item'].title}保存`
              })
            })
            return
          }
          this.loading = true
          const collapseAll = ['basics', 'storage', 'unitConversionRateReq', 'marketing', 'price_list']
          const collapseAllName = ['基础信息', '仓储信息', '计量单位', '其他信息', '价格信息']
          if (this.$attrs.form.goodsType === '2') {
            collapseAll.push('combo_list')
            collapseAllName.push('组合品信息')
          }
          const Parr = collapseAll.map(item => this.$refs[item].$refs.Form.validate())
          // const Parr = [this.$refs[collapseAll[2]].$refs.Form.validate()]
          Promise.all(Parr.map((p) => p.catch(error => error))) // 捕获错误返回
            .then(valid => {
              if (valid.every(validItem => validItem)) { // 校验通过
                console.log('this.$attrs.form', this.$attrs.form)
                this.$listeners.formSave({ action: this.$attrs['operate-item'].prop })
                // this.loading = false
              } else { // 数据检验不通过
                this.collapseNames = []
                valid.map((item, index) => {
                  if (!item) {
                    this.collapseNames.push(collapseAll[index])
                    this.$message.error(`请检查「${collapseAllName[index]}」数据`)
                  }
                })
                this.loading = false
              }
            })
          // this.$listeners.formSave({ action: 'close' })
        }
          break
      }
    },
    deleteComboFn(e) {
      return deleteCombo(e)
    },
    isChange() {
      return JSON.stringify(this.form_temp) === JSON.stringify(this.$attrs.form)
    },
    reset() { // 重置
      this.$listeners.reset(this.form_temp, this.form_price_list_temp, this.form_combo_list_temp).then(() => {
        const collapseAll = ['basics', 'storage', 'unitConversionRateReq', 'marketing', 'price_list']
        if (this.$attrs.form.goodsType === '2') {
          collapseAll.push('combo_list')
        }
        collapseAll.map(item => {
          this.$refs[item].init()
        })
      })
    }
  }
}
</script>

<style scoped>
.heightParent{
  display: flex;
  flex-direction: column;
  /*border:1px solid red;*/
}
.title{
  width: 100%;
  background-color: #ffffff;
  line-height: 2.6rem;
  padding-left: 20px;
}
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  flex: 1;
  /*margin-left: -5%;*/
  /*border:1px solid blue;*/
  border-bottom: 1px solid #cccccc;
}
.formFeatherChild{
  background-color: #f5f5f5;
  /*height: 60vh;*/
  overflow-y: auto;
  width: 100%;
  flex: 1;
  /*margin-left: -5%;*/
  /*border:1px solid blue;*/
  /*border: 1px solid blue;*/
}
.formCard:nth-of-type(1){
  margin: 20px 20px 10px 20px;
}
.formCard:last-of-type{
  margin: 10px 20px 20px 20px;
}
.formCard{
  margin: 10px 20px;
}
.footer{
  /*border:1px solid blue;*/
  padding-top: 12px;
  margin-right: 1%;
  align-self: flex-end;
  z-index: 100;
}
.my-class >>> .el-collapse-item__header{
  border:none;
  border-bottom-color: #e6ebf5;
}
.my-class >>> .el-collapse-item__header.collapse-transition{
  border:none;
}
.my-class >>> .el-collapse-item__content{
  padding-bottom: 0
}
.my-class >>> .el-collapse{
  border:none
}
.my-class >>> .el-collapse-item__wrap{
  border:none
}
.my-class-line >>> .el-collapse-item__header.is-active{
  border-bottom:1px solid #e6ebf5;
}
.my-class-edit >>> .el-form-item{
  margin-bottom: 10px;
  margin-top: 10px
}
.my-class-detail >>> .el-form-item{
  margin-bottom: 0;
  margin-top: 10px
}
.my-class-form-title{
  font-size:1.05rem;
  border-bottom:1px solid #ccc;
  line-height:2rem
}
</style>
