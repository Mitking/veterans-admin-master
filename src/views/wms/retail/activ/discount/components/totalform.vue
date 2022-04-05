<template>
  <div class="heightParent" :style="{height:(windowHeight-167)+'px'}">
    <div v-if="!$attrs.is_child" class="title-add-form">{{ $attrs['operate-item'].title }}</div>
    <div ref="wmsform" class="formFeather">
      <!--   基础信息   -->
      <el-card class="formCard my-class my-class-line">
        <el-collapse :value="collapseNames" @change="collapseValue = $event[0]">
          <el-collapse-item name="1">
            <div slot="title" style="font-size:1.05rem">基础信息</div>
            <form-item v-if="$attrs['operate-item'].prop!=='detail'" ref="Form" class="my-class-edit" v-bind="$attrs" @formChange="formData=$event" @dataIsChange="dataIsChange=$event" v-on="$listeners" />
            <detail-item v-if="$attrs['operate-item'].prop==='detail'" ref="Form" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
          </el-collapse-item>
        </el-collapse>
      </el-card>
      <!--  详情备注  -->
      <transition name="el-zoom-in-top">
        <el-card v-if="$attrs['operate-item'].prop==='detail' && $attrs['current-row'].remark" v-show="collapseValue==='1'" class="formCard">
          <el-form label-width="100px">
            <el-form-item label="备注信息">
              <div style="padding-top: 0.25rem;padding-right: 0.5rem;line-height: 1.5rem;">{{ $attrs['current-row'].remark }}</div>
            </el-form-item>
          </el-form>
        </el-card>
      </transition>
      <!--   表格数据     -->
      <el-card v-if="formData.discountType==='1' || $attrs.details.length>0" class="formCard">
        <local-table ref="Table" :form_data="formData" :add_arr="$attrs.add_arr?$attrs.add_arr:[]" v-bind="$attrs" @onSubmit="onSubmit" @dataIsChange="dataIsChange=$event" v-on="$listeners" />
        <!--        <div>{{ $refs.Form  }}</div>-->
      </el-card>
    </div>
    <!--    底部    -->
    <div v-if="!$attrs.is_child" class="footer">
      <!-- <el-button
        v-for="(item, index) in $attrs['form-bottons'] || []"
        v-show="item.mix_comp_buttons_show(item)"
        :key="index"
        v-permission="item.permission"
        :loading="loading"
        type="primary"
        @click="()=>{if(item.prop==='review'){onSubmit({opt:$attrs['operate-item'].prop,review:true})}else{item.click($refs.Form.form)}}"
      >
        <template>
          {{ item.title }}
        </template>
      </el-button> -->
      <el-button v-if="$attrs['current-row'].auditStatus==='1' || $attrs['operate-item'].prop === 'insert'" v-permission="['oms:activDiscount:review']" :loading="loading" type="primary" @click="onSubmit({opt:$attrs['operate-item'].prop,review:true})">
        <template>
          审核
        </template>
      </el-button>
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" :loading="loading" type="primary" @click="onSubmit({opt:$attrs['operate-item'].prop,review:false})">
        <template v-if="['insert','withinAdd','edit','edits'].includes($attrs['operate-item'].prop)">
          {{ $attrs['operate-item'].title }}
        </template>
      </el-button>
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" type="success" :loading="loading" @click="reset">{{
        $attrs['operate-item'].prop==='insert' && '重置' ||
          ['edit','withinAdd','edits'].includes($attrs['operate-item'].prop) && '还原'
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
import FormItem from './form.vue'
import DetailItem from './formdetail.vue'
import LocalTable from './table.vue'
// import { deleteOrders } from '@/api/wms/purdemand'
export default {
  name: 'WmsForm',
  components: { FormItem, LocalTable, DetailItem },
  props: {
    loading: {
      type: Boolean,
      defaultValue: () => false
    }
  },
  data() {
    return {
      formData: {},
      collapseValue: '1',
      collapseNames: ['1'],
      windowHeight: document.documentElement.clientHeight,
      form: {},
      RootArrayForm: {},
      dataIsChange: false
    }
  },
  computed: {
    // formdata() {
    //   if (this.$refs.Form) {
    //     return this.$refs.Form.form
    //   }
    // }
  },
  watch: {},
  mounted() {},
  methods: {
    log(e) {

    },
    onSubmit(arg) {
      if (arg === 'detail') { // 关闭
        console.log('数据变化了：', this.dataIsChange)
        if (this.dataIsChange) {
          this.$confirm(`系统发现有变动项目，关闭后这些项目不会被保存，直接关闭表单？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$listeners.formSave(arg)
          }).catch(() => {
            this.$emit('update:loading', false)
            this.$message({
              offset: 150,
              type: 'info',
              message: '请点击修改或者新增保存'
            })
          })
        } else {
          this.$listeners.formSave(arg)
        }
        return
      }
      this.$emit('update:loading', true)
      const promise = []
      promise.push(this.$refs.Form.$refs.form.validate())
      if (this.$refs.Table) {
        promise.push(this.$refs.Table.$refs.Form.validate())
      }
      Promise.all(promise).then(res => {
        console.log('通过检验')
        const temp = { detailReqs: [] }
        this.$set(temp, 'discountReq', this.deepClone(this.$refs.Form.form))

        if (this.$refs.Table) {
          this.$set(temp, 'detailReqs', this.$refs.Table.form.details)
          this.$set(temp, 'deleteIds', this.$refs.Table.deleteDetails)
          this.$listeners.formSave(arg, temp)
        } else {
          this.$listeners.formSave(arg, temp)
        }
      }).catch(err => {
        this.$message.error('数据有误，请检查')
        this.$emit('update:loading', false)
        throw err
      })
    },
    reset() {
      this.$refs.Form.init().then(() => {
        this.$refs.Form.$refs.form.resetFields()
        this.$nextTick(() => {
          this.dataIsChange = false
        })
      })
      if (this.$refs.Table) {
        this.$refs.Table.$refs.Form.resetFields()
        this.$refs.Table.init().then(() => {
          this.$nextTick(() => {
            this.dataIsChange = false
          })
        })
      }
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
</style>
