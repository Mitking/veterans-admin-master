<template>
  <div class="heightParent" :style="{height:(windowHeight-167)+'px'}">
    <div class="title">副屏图片预览</div>
    <div class="formFeather">
      <el-card class="formCard my-class my-class-line">
        <el-carousel ref="imgItem" :interval="5000" indicator-position="none" :height="(windowHeight-500)+'px'" arrow="always" @change="carouselChange">
          <el-carousel-item v-for="(item,index) in $attrs.imgs" :key="index">
            <el-image
              style="width: 100%; height: 100%"
              :src="'https://bdd-ns.oss-cn-beijing.aliyuncs.com/'+item.imgPath"
              fit="scale-down"
            />
          </el-carousel-item>
        </el-carousel>
        <div class="img-fa">
          <div v-for="(item,index) in $attrs.imgs" :key="index" class="img-item" @click="setActiveItem(index)">
            <el-image
              :class="'elimg'+((index===activeIndex)?' active':'')"
              style="width: 100px; height: 80px"
              :src="baseUrl+item.imgPath"
              fit="fill"
            />
          </div>
        </div>
      </el-card>
    </div>
    <!--    底部    -->
    <div class="footer">
      <el-button :loading="loading" @click="onSubmit('close')">
        <template>
          关闭
        </template>
      </el-button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Preview',
  components: {},
  props: {
    loading: {
      type: Boolean,
      defaultValue: () => false
    }
  },
  data() {
    return {
      showTime: [],
      form: {
        'id': null,
        'setOrgId': '',
        'setOrgName': '',
        'setStoreId': '',
        'showEndTime': '',
        'showStartTime': '',
        'state': true,
        'title': '',
        'imgs': []
      },
      baseUrl: 'https://bdd-ns.oss-cn-beijing.aliyuncs.com/',
      windowHeight: document.documentElement.clientHeight,
      activeIndex: ''
    }
  },
  created() {
    //  没有检索下拉框数据时自动加载
    // this.selectDataLoad(['stores'])
  },
  methods: {
    onSubmit() {
      this.$emit('update:loading', false)
      this.$listeners.formSave('close')
    },
    carouselChange(e) {
      this.activeIndex = e
    },
    setActiveItem(index) {
      this.$refs.imgItem.setActiveItem(index)
    }
  }
}
</script>

<style scoped>
.img-fa{
  height: 100px;
  border:1px solid #dddddd;
  /*border-width: 0 1px 1px 1px;*/
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-y:auto;
  background-color: #ffddee;
}
.img-item{
  display: flex;
  padding:10px;
  align-items: center;
}
.elimg{
  border:2px solid #eeeeee;
}
.elimg.active{
  border:2px solid #f9944a;
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
.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}

.my-class >>> .el-carousel__item{
  background-color: #eeeeee;
}

</style>
