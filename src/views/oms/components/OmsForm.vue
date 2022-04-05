<template>
  <div class="heightParent" :style="{height:(windowHeight-167)+'px'}">
    <div v-if="!$attrs.is_child" class="title-add-form">{{ $attrs['operate-item'].title }}</div>
    <div ref="omsform" class="formFeather">
      <!--   基础信息   -->
      <el-card class="formCard my-class my-class-line">
        <el-collapse :value="collapseNames" @change="collapseValue = $event[0]">
          <el-collapse-item name="1">
            <div slot="title" style="font-size:1.05rem">基础信息</div>
            <wms-form-item v-if="$attrs['operate-item'].prop!=='detail'" ref="Form" class="my-class-edit" v-bind="$attrs" @formChange="formData=$event" @dataIsChange="dataIsChange=$event" v-on="$listeners" />
            <wms-detail-item v-if="$attrs['operate-item'].prop==='detail'" ref="Form" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
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
      <el-card v-if="$attrs.details" class="formCard">
        <wms-table-nodes v-if="$attrs.type==='node'" ref="TableNodes" v-bind="$attrs" v-on="$listeners" />
        <wms-table v-else ref="Table" :form_data="formData" :affix-show.sync="affixShow" v-bind="$attrs" @dataIsChange="dataIsChange=$event" v-on="$listeners" />
      </el-card>
    </div>
    <!--    底部    -->
    <div v-if="!$attrs.is_child" class="footer">
      <el-button
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
      </el-button>
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" :loading="loading" type="primary" @click="onSubmit($attrs['operate-item'].prop)">
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
    <!-- 附件 -->
    <el-dialog
      v-if="affixShow"
      title="附件列表"
      :visible.sync="affixShow"
      width="width"
    >
      <div style="height:60vh">
        <el-table
          :data="files"
        >
          <el-table-column
            label="文件名"
            align="center"
            prop="fileAlias"
          />
          <el-table-column
            label="操作"
            align="center"
          >
            <template slot-scope="{row}">
              <el-button type="text" size="small" icon="el-icon-view" @click="click_view(row)">预览</el-button>
              <el-button type="text" size="small" icon="el-icon-download" @click="click_download(row)">下载</el-button>
              <el-button v-if="$attrs['operate-item'].prop!=='detail'" type="text" size="small" icon="el-icon-delete" @click="click_delete(row)">删除</el-button>
            </template>
          </el-table-column>

        </el-table>
      </div>
      <el-row slot="footer">
        <el-col :span="8" :offset="$attrs['operate-item'].prop==='detail'?20:16">
          <div style="display: flex;">
            <el-upload
              v-if="$attrs['operate-item'].prop!=='detail'"
              :headers="getTokenStr()"
              :action="baseUrl+'/core/file/fileUpload'"
              :on-success="handleSuccess"
              :on-error="handleError"
              :show-file-list="false"
            >
              <el-button>上传文件</el-button>
            </el-upload>
            <el-button type="primary" style="margin-left:5px" @click.prevent="affixShow = false">关 闭</el-button>
            <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png/doc/xls文件，且不超过500kb</div> -->
          </div></el-col>
      </el-row>
    </el-dialog>
    <!-- 文件预览 -->
    <el-dialog
      v-if="viewShow"
      title="附件预览"
      :visible.sync="viewShow"
      fullscreen
    >
      <div style="height:80vh">
        <el-image v-if="['png','jpg','jpeg'].includes(fileType)" style="width: 100%; height: 100%" :src="viewSrc" fit="scale-down" />
        <div v-else>该文件类型({{ fileType }})不支持预览，
          <el-button type="text" @click="click_view_download(viewSrc)">点击下载</el-button>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="viewShow = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import WmsFormItem from '@/views/oms/components/OmsFormItem'
import WmsDetailItem from '@/views/oms/components/OmsDetailItem'
import WmsTable from '@/views/oms/components/OmsTable'
import WmsTableNodes from '@/views/oms/components/OmsTableNodes'
import { getToken } from '@/utils/auth'
export default {
  name: 'OmsForm',
  components: { WmsFormItem, WmsTable, WmsDetailItem, WmsTableNodes },
  props: {
    loading: {
      type: Boolean,
      defaultValue: () => false
    }
  },
  data() {
    return {
      files: this.$attrs['operate-item'].prop === 'insert' ? [] : (this.$attrs['current-row'].files ? this.deepClone(this.$attrs['current-row'].files) : []),
      affixShow: false,
      viewSrc: '',
      viewShow: false,
      baseUrl: process.env.VUE_APP_BASE_API,
      baseSrc: 'https://bdd-ns.oss-cn-beijing.aliyuncs.com/',
      dataIsChange: false,
      formData: {},
      collapseValue: '1',
      collapseNames: ['1'],
      windowHeight: document.documentElement.clientHeight,
      form: {},
      RootArrayForm: {},
      fileDeleteIds: [],
      fileType: ''
    }
  },
  watch: {},
  methods: {
    getTokenStr() {
      return { 'Authorization': getToken() }
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
      if (arg === 'review') {
        this.$listeners.formSave(arg)
        return
      }
      const promise = []
      promise.push(this.$refs.Form.$refs.form.validate())
      if (this.$refs.Table) {
        promise.push(this.$refs.Table.$refs.Form.validate())
      }
      Promise.all(promise).then(res => {
        console.log('通过检验')
        const temp = {}
        this.$set(temp, 'Req', this.deepClone(this.$refs.Form.form))
        if (this.$attrs.detail_table_buttons && this.$attrs.detail_table_buttons.some(item => item.click === 'affix')) {
          temp.Req.files = this.deepClone(this.files.filter(item => !item.id))
          temp.Req.fileDeleteIds = this.deepClone(this.fileDeleteIds)
        }
        if (this.$refs.Table) {
          this.$set(temp, 'detailReqs', this.$refs.Table.form.details)
          this.$listeners.formSave(arg, temp, this.$refs.Table.deleteDetails)
        } else {
          this.$listeners.formSave(arg, temp)
        }
      }).catch(err => {
        this.$message.error('数据有误，请检查')
        this.$emit('update:loading', false)
        throw err
      })
    },
    handleSuccess(res, file) {
      if (res.code === 200) {
        this.files.push({ fileName: file.response.data, fileAlias: file.name })
        this.dataIsChange = true
      } else if (res.code === 500) {
        this.$message.error(`上传失败:文件过大!`)
      } else {
        this.$message.error(`上传失败，请重试！`)
      }
    },

    handleError(res, file) {
      this.$message.error(`上传失败,请重试！`)
    },

    reset() {
      this.files = (this.$attrs['operate-item'].prop !== 'insert' && this.$attrs['current-row'].files) ? this.deepClone(this.$attrs['current-row'].files) : []
      this.fileDeleteIds = []
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
    },
    click_view(e) {
      this.viewSrc = this.baseSrc + e.fileName
      this.fileType = e.fileName.split('.')[1]
      this.viewShow = true
    },
    click_download(e) {
      window.location.href = this.baseSrc + e.fileName
    },
    click_view_download(url) {
      window.location.href = url
      this.viewShow = false
    },
    click_delete(e, isSure = false) {
      if (!isSure) { // 拦截
        this.$confirm(`确认删除所选文件吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.click_delete(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
        })
        return
      }
      if (e.id) {
        this.fileDeleteIds.push(e.id)
      }
      this.files.remove(e)
      this.dataIsChange = true
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
