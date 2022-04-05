<template>
  <el-menu
    :default-active="String(activeIndex)"
    text-color="#ffffff"
    active-text-color="#ffffff"
    background-color="#2b2f3a"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item
      v-for="m in modules"
      :key="m.moduleId"
      class="my-menu-item"
      :index="String(m.moduleId)"
      @click="clickModule(m)"
    >{{ m.moduleName }}
    </el-menu-item>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Modules',
  data() {
    return {
      activeIndex: -1
    }
  },
  computed: {
    ...mapGetters(['modules'])
  },
  mounted() {
    console.log('模块', this.modules)
  },
  methods: {
    handleSelect(index) {
      this.activeIndex = index + ''
    },
    clickModule(module) {
      this.$store.dispatch('app/setModule', module)
    }
  }
}
</script>

<style scoped>
.my-menu-item {
  height: 61px;
}
.el-menu-item.is-active {
  background-color: #409EFF !important;
}
</style>
