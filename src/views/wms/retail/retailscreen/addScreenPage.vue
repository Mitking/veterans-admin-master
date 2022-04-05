<template>
  <div class="heightParent" :style="{height:(windowHeight-167)+'px'}">
    <div class="title">添加副屏图片</div>
    <div class="formFeather">
      <el-card class="formCard my-class my-class-line">
        <el-form ref="form" :model="form" class="form-fa" label-width="150px">
          <el-form-item label="标题" style="width: 80%" prop="title" :rules="[{required:true,message:'请填写标题'}]">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item
            v-if="[0, 3].includes(this.$store.getters.accountType)"
            label="门店(可多选)"
            style="width: 80%"
            prop="setStoreIds"
            :rules="[{required:true,message:'请选择门店'}]"
          >
            <el-cascader
              v-model="form.setStoreIds"
              :rules="[{required:true,message:'请选择门店'}]"
              style="width:100%"
              :options="storesOptions"
              :props="{ multiple: true,emitPath:false }"
              collapse-tags
              clearable
            />
          </el-form-item>
          <el-form-item v-if="[2].includes($store.getters.accountType)" label="门店" style="width: 60%" prop="setStoreIds">
            <el-select
              v-model="form.setStoreIds"
              :rules="[{required:true,message:'请选择门店'}]"
              placeholder="请选择"
              multiple
              collapse-tags
              style="width:100%"
            >
              <el-option
                v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'}).filter(item=>item.orgId===$store.getters.orgId)"
                :key="indexSon"
                :label="itemSon.name"
                :value="itemSon.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="有效时间" prop="showEndTime" :rules="[{required:true,message:'请选择有效时间'}]">
            <el-date-picker
              v-model="showTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              type="datetimerange"
              placeholder="选择时间"
              style="width: 100%;"
              :default-time="['00:00:00', '23:59:59']"
              @change="dateChange"
            />
          </el-form-item>
          <el-form-item label="状态" style="width: 100%;">
            <el-radio-group v-model="form.state">
              <el-radio :label="true">有效</el-radio>
              <el-radio :label="false">无效</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图片">
            <el-upload
              v-loading="loading"
              :headers="getTokenStr()"
              :action="baseUrl+'/core/file/fileUpload'"
              accept="video/mp4,image/*"
              list-type="picture-card"
              :class="{hide:hideUploadCard}"
              :limit="1"
              :file-list="fileList"
              :on-progress="handleProgress"
              :on-success="handleSuccess"
              :on-error="handleError"
              :on-exceed="handleExceed"
              :disabled="fileList.length!==0"
              :on-change="()=>{$emit('update:loading',false)}"
            >
              <i slot="default" class="el-icon-plus" />
              <div slot="file" slot-scope="{file}">
                <img
                  class="el-upload-list__item-thumbnail"
                  :src="file.url"
                  alt=""
                >
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in" />
                  </span>
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete" />
                  </span>
                </span>
              </div>
            </el-upload>
            <!-- <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog> -->
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <!--    底部    -->
    <div class="footer">
      <el-button :loading="loading" type="primary" @click="onSubmit('sub')">
        <template>
          提交
        </template>
      </el-button>
      <el-button :loading="loading" @click="onSubmit('close')">
        <template>
          关闭
        </template>
      </el-button>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { addOrSaveOrder } from '@/api/wms/retailscreen'
export default {
  name: 'AddScreenPage',
  components: {},
  props: {
    loading: {
      type: Boolean,
      defaultValue: () => false
    }
  },
  data() {
    return {
      fileList: [],
      showTime: [],
      form: {
        'id': null,
        'setOrgId': '',
        'setStoreIds': [0, 3].includes(this.$store.getters.accountType) ? [] : [this.$store.getters.storeId],
        'showEndTime': '',
        'showStartTime': '',
        'state': true,
        'title': '',
        'imgs': []
      },
      baseUrl: process.env.VUE_APP_BASE_API,
      windowHeight: document.documentElement.clientHeight,
      imageUrl: '',
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false
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
    hideUploadCard() {
      return !!this.fileList.length
    }
  },
  watch: {},
  mounted() {},
  methods: {
    onSubmit(arg) {
      this.$emit('update:loading', true)
      if (arg === 'close') {
        this.$emit('update:loading', false)
        this.$listeners.formSave('close')
        return
      }
      if (arg === 'sub') {
        if (this.fileList.length === 0) {
          this.$message.error('请至少上传一张图片！')
          this.$emit('update:loading', false)
          return
        }
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.form.imgPath = this.fileList[0].response.data
            const pArr = []
            this.fileList.map(item => {
              this.form.imgPath = item.response.data
              const form = this.deepClone(this.form)
              pArr.push(addOrSaveOrder(form).catch(err => err))
            })
            Promise.all(pArr).then(res => {
              if (res.every(it => it.code === 200)) {
                this.$listeners.formSave('sub', res[0])
              } else {
                this.$message.error('服务出错,请重试')
              }
            })
          } else {
            this.$message.error('请检查数据！')
          }
          this.$emit('update:loading', false)
        })
        return
      }
      console.log('onSubmit')
    },
    dateChange(e) {
      if (e) {
        this.form.showEndTime = e[1]
        this.form.showStartTime = e[0]
      }
    },
    getTokenStr() {
      return { 'Authorization': getToken() }
    },
    handleRemove(file) {
      this.$confirm(`确定移除 ${file.name}?`).then(() => {
        for (let i = 0; i < this.fileList.length; i++) {
          if (file.uid === this.fileList[i].uid) { // 删除指定项
            this.fileList.splice(i, 1)
            return
          }
        }
      }).catch(() => {
        console.log('已取消删除')
      })
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleProgress(file) {
      this.$emit('update:loading', true)
    },
    handleExceed() {
      this.$message.info(`每次只能上传一张图片`)
    },
    handleSuccess(response, file) {
      if (response.code === 200) {
        this.fileList.push(file)
        // this.$emit('update:loading', false)
        // this.form.imgs.push({ id: null, imgPath: response.data })
      } else {
        this.$message.info('上传失败:上传文件过大或网络环境差')
        this.fileList = []
      }
      this.$emit('update:loading', false)
    },
    handleError(err) {
      console.log(err)
    }
  }
}
</script>

  <style scoped>
  .form-fa{
    display: flex;
    flex-wrap: wrap;
    padding:0 14rem;
    /*padding-bottom:15px*/
  }
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
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
.hide >>> .el-upload--picture-card {
  display: none;
}
  </style>
