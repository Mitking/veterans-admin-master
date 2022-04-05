<template>
  <div>
    <!-- 操作栏目 -->
    <el-form inline class="m24-24-10-24 my-class">
      <el-form-item>
        <el-upload
          class="upload-demo"
          :headers="getTokenStr()"
          :action="baseUrl+'/core/file/fileUpload'"
          :on-success="handleSuccess"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          accept="video/mp4,image/*"
          multiple
          :limit="9"
          :file-list="[]"
          :on-exceed="handleExceed"
        >
          <!--  :action="baseUrl + '/core/file/fileUpload'" :file-list="fileList"     -->
          <el-button v-permission="['core:achiveFirstImg:add']" size="small" icon="el-icon-upload" type="primary">上传</el-button>
        <!--        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过xxxkb</div>-->
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button size="small" icon="el-icon-close" type="primary" @click="$listeners.formSave({ action: 'close' })">返回</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="Mixin_loading || $attrs.imgloading"
      border
      highlight-current-row
      :data="$attrs['img-data']"
      class="m10-24-24-24"
      max-height="650"
      style="width:1201px"
    >
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter(table_data_arr,{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.tabwidth || '300'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else-if="item.type==='img'">
            <el-image
              style="width: 100px; height: 100px"
              :src="baseSrc+row[item.prop]"
              fit="scale-down"
              :preview-src-list="srcList"
            />
          </div>
          <div v-else-if="item.type==='operate'">
            <el-button v-permission="['core:achiveFirstImg:update']" size="mini" type="success" :loading="loading" :disabled="row.whetherFirstImage" @click="AchiveFirstImg(row)">设为主图</el-button>
            <el-button v-permission="['core:achiveFirstImg:delete']" size="mini" type="danger" :loading="loading" :disabled="row.whetherFirstImage" @click="del(row)">删除</el-button>
          </div>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addAchiveImg, deleteAchiveImg, updateAchiveFirstImg } from '@/api/core/productimg'
import { getToken } from '@/utils/auth'
export default {
  name: 'ProductImg',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      baseSrc: 'https://bdd-ns.oss-cn-beijing.aliyuncs.com/',
      operateList: [ // 操作栏项目
        { title: '新增', prop: 'insert', click: this.addproimg, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['ums:role:saveRole', 'ums:role:page'], width: 80 }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: '商品代码', prop: 'goodsCode', show: true, type: 'text', formShow: true, addDisabled: false },
        { title: '图片ID(预览)', prop: 'imgId', show: true, type: 'img', formShow: true },
        { title: '是否首图', prop: 'whetherFirstImage', show: true, type: 'if_type', defaultValue: true, formShow: false },
        { title: '操作', prop: 'operate', show: true, type: 'operate', formShow: false, tabwidth: '300' }
      ],
      loading: false
    }
  },
  computed: {
    srcList() {
      return this.$attrs['img-data'].map(item => (this.baseSrc + item.imgId))
    }
  },
  watch: {},

  methods: {
    getTokenStr() {
      return { 'Authorization': getToken() }
    },
    message(res) {
      if (res.code === 200) {
        this.$listeners.freshimg()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    addproimg(imgName) { // 添加图片
      addAchiveImg({
        'goodsCode': this.$attrs['current-row'].goodsCode,
        'imgId': imgName,
        'whetherFirstImage': (this.$attrs['img-data'].length === 0)
      }).then(res => {
        this.message(res)
      })
    },
    AchiveFirstImg(e) { // 设为主图
      this.loading = true
      updateAchiveFirstImg({
        'goodsCode': e.goodsCode,
        'imgId': e.imgId
      }).then(res => {
        this.message(res)
        this.loading = false
      }).catch(err => {
        setTimeout(() => { this.loading = false }, 500)
        throw err
      })
    },
    del(e) {
      if (e.whetherFirstImage) {
        this.$message.error('提示：不可以删除主图！')
        return
      }
      this.$confirm(`此操作将永久删除图片ID：「${e.imgId}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteAchiveImg({ 'id': e.id }).then(res => {
          this.message(res)
          this.Mixin_loading = false
        }).catch(err => {
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        this.Mixin_loading = false
      })
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 9 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.addproimg(response.data)
      }
    }
  }
}
</script>

<style scoped>
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
.my-class >>> .el-form-item{
  margin-bottom: 0
}
</style>

