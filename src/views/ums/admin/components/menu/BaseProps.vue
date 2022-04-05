<template>
  <el-card>
    <div slot="header" class="clearfix">
      <span>基础属性</span>
    </div>
    <div>
      <table v-if="props.title" class="table-props">
        <tr>
          <td>名称</td>
          <td>{{ props.title }}</td>
          <td>类型</td>
          <td>{{ props.type }}{{ props.type==='D' && '目录' || props.type==='M' && '菜单' || props.type==='B' && '按钮' }}</td>
          <td>路径</td>
          <td>{{ props.path }}</td>
          <td>组件</td>
          <td>{{ props.component }}</td>
        </tr>
        <tr>
          <td>NAME</td>
          <td>{{ props.name }}</td>
          <td>路径</td>
          <td>{{ props.path }}</td>
          <td>权限</td>
          <td>{{ props.perms }}</td>
          <td>图标</td>
          <td><i :class="props.icon" />{{ props.icon }}</td>
        </tr>
        <tr>
          <td>不缓存</td>
          <td>{{ props.noCache }}</td>
          <td>面包削展示</td>
          <td>{{ props.breadcrumb?'是':'否' }}</td>
          <td>不在侧边栏中显示</td>
          <td>{{ props.hidden?'是':'否' }}</td>
          <td>是否展示根菜单</td>
          <td>{{ props.alwaysShow?'是':'否' }}</td>
        </tr>
        <tr>
          <td>固定Tags</td>
          <td>{{ props.affix?'是':'否' }}</td>
          <td>排序</td>
          <td>{{ props.sort }}</td>
          <td>面包削展示</td>
          <td>{{ props.breadcrumb?'是':'否' }}</td>
          <td>创建时间</td>
          <td>{{ props.createTime }}</td>
        </tr>
      </table>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'BaseProps',
  props: {
    baseProps: {
      type: Object
    }
  },
  computed: {
    props() {
      return this.baseProps
    }
  }
}
</script>

<style scoped>
.table-props {
  border: solid 1px #dfdfdf;
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.table-props td {
  border: solid 1px #dfdfdf;
  text-align: center;
  padding: 5px;
}

.table-props td:nth-child(odd) {
  background-color: #f1f6fc;
}
</style>
