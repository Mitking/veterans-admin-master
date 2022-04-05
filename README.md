# 奔多多新零售管理系统
## 框架采用vue-element-admin
参考文档
- [ElementUI](https://element.eleme.cn/#/zh-CN/component/installation)
- [vue-element-admin](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)
## WebStorm配置
[配置地址](https://www.yuque.com/docs/share/1180f467-98ca-44b4-8176-136e3d787460?#%20%E3%80%8AWebStorm-Editor%E9%85%8D%E7%BD%AE%E3%80%8B)
## 全局
### 状态&删除
- 权限
```
<el-form-item v-permission="['ums:user:add']">
   <el-button :disabled="!currentRow" icon="el-icon-edit" @click="update">修改</el-button>
</el-form-item>
```
- 状态

```
import StateTag from '@/components/StateTag'
<state-tag :state="状态标识" @change="函数[返回state变化后的值]" :validText="[可选]默认有效" :invalidText="[可选]默认无效"/>
```
### css
```
#用于控制全局按钮和DIV等之间的上下边距，禁止自定义编写style。
.m10{
  margin: 10px;
}
.ml10 {
  margin-left: 10px;
}
.mr10 {
  margin-right: 10px;
}
.mt10 {
  margin-top: 10px;
}
.mb10 {
  margin-bottom: 10px;
}
```
