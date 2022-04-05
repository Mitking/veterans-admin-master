<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
      />
      <!--       @review="review"@openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"-->
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// import { updateOrSave } from '@/api/wms/retaildistributional'
// import WmsForm from '@/views/wms/components/WmsForm'
import Order from './retaildistributional'
export default {
  name: 'RetailDistributionalIndex',
  components: { Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order'
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {}
}
</script>
<style scoped>
</style>
