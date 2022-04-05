<template>
  <div class="formFeather" :style="{height:(windowHeight-150)+'px'}">
    <el-card style="margin:24px">
      <div style="color:#42b983;font-size: 1.2rem;font-weight:500">金额流水</div>
      <el-form size="mini" label-width="80px" inline style="margin-top:24px">
        <el-form-item label="时间">
          <el-date-picker
            v-model="rangeTime"
            style="width:330px"
            type="datetimerange"
            :default-time="['00:00:00', '23:59:59']"
            placeholder="全部"
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="form.startTime=$event?$event[0]:null;form.endTime=$event?$event[1]:null"
          />
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="form.changeType">
            <el-option
              :key="0"
              label="全部"
              :value="0"
            />
            <el-option
              v-for="(itemSon,indexSon) in enumList.ecard_log_type"
              :key="indexSon+100"
              :label="itemSon.name"
              :value="itemSon.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="form.pageNum=1;$listeners.RepayLog(form)">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="$attrs.loading"
        size="mini"
        :header-cell-style="{background:'#F3F4F7',color:'#555'}"
        style="margin-left:24px;max-width: 97%;width:1361px"
        border
        :max-height="windowHeight-450"
        :data="$attrs['onaccount-log'].records"
      >
        <el-table-column
          align="center"
          prop="createTime"
          label="时间"
          width="160"
        />
        <el-table-column
          prop="mobile"
          label="手机号"
          width="120"
          align="center"
        />
        <el-table-column
          prop="changeAmount"
          label="变动金额"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.changeAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="afterBalance"
          label="余额"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.afterBalance) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="changeType"
          label="变动类型"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            {{ MenuGetPropName('ecard_log_type',row.changeType,{ value: '', label: '' }) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fid"
          label="关联订单"
          align="center"
          width="200"
        />
        <el-table-column
          prop="storeName"
          label="关联门店"
          align="center"
          width="220"
        />
        <el-table-column
          prop="body_describe"
          label="备注"
          align="center"
          width="300"
        />
      </el-table>
      <!--  -->
      <el-pagination
        style="margin:12px;max-width: 97%;"
        background
        :page-size.sync="form.pageSize"
        :current-page.sync="form.pageNum"
        :page-sizes="[10, 20, 30, 50]"
        layout="total,sizes,prev, pager, next,jumper"
        :total="$attrs['onaccount-log'].total"
        @size-change="$listeners.RepayLog(form)"
        @current-change="$listeners.RepayLog(form)"
      />
      <!--    底部    -->
      <div class="footer">
        <el-button @click="$listeners.formSave('detail')">关 闭</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TableLog',
  components: { },
  data() {
    return {
      rangeTime: [],
      form: {
        // ecardId: this.$attrs['current-row'].id,
        startTime: null,
        endTime: null,
        changeType: 0,
        pageNum: 1,
        pageSize: 10
      },
      windowHeight: document.documentElement.clientHeight
    }
  },
  computed: {
    ...mapGetters(['enumList'])
  },
  watch: {
    '$attrs.select_window_name': {
      handler(n) {
        this.Comp = n
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  height: 200%;
}
.footer{
  /*border:1px solid blue;*/
  position: relative;
  padding: 12px 24px 36px 0;
  float: right;
  z-index: 100;
}
</style>
