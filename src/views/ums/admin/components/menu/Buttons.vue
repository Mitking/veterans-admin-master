<template>
  <el-card class="mt10">
    <div slot="header" class="headerTitle">
      <span>按钮权限</span>
      <el-button v-if="$attrs.current.id && ['M','B'].includes($attrs.current.menuEntity.type)" size="small" @click="this.$listeners.addButton">创建</el-button>
    </div>
    <div>
      <ul class="buttons-ul">
        <li v-for="b in buttonList" :key="b.id">
          <div class="buttons-flex">
            <span><el-button type="text" plain size="small">{{ b.label }}</el-button><el-button
              type="text"
              disabled
              size="small"
            >{{ b.menuEntity.perms }}</el-button></span>
            <span>
              <el-button type="text" size="small" icon="el-icon-edit" @click="$listeners.editButton(b)" />
              <el-button type="text" size="small" icon="el-icon-delete" @click="$listeners.delButton(b,'按钮')" />
            </span>
          </div>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'Buttons',
  props: {
    buttons: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    buttonList() {
      return this.buttons
    }
  },
  methods: {}
}
</script>

<style scoped>
.headerTitle{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
