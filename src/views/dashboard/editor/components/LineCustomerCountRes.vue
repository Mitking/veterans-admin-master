<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './line/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    },
    category: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      chart: null,
      colorList: ['#c23531', '#59dd78']
    }
  },
  watch: {
    'category': {
      handler() {
        if (this.$attrs.line_data.length) {
          this.refresh()
        }
      },
      deep: false,
      immediate: true
    }

  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        backgroundColor: '#ffffff',
        title: {
          top: 0,
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#333333'
          },
          left: '1%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        legend: {
          icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          left: 'center',
          bottom: 'bottom',
          textStyle: {
            fontSize: 12,
            color: '#333333'
          }
        },
        grid: {
          top: 60,
          left: '50px',
          right: '100px',
          bottom: '40',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: true,
          name: '日期',
          nameLocation: 'end',
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          name: '金额',
          // offset:
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          },
          splitLine: {
            lineStyle: {
              color: '#eeeeee'
            }
          }
        }]
      })
    },
    refresh() {
      this.chart.setOption({
        series: [{
          type: 'bar',
          data: this.$attrs.line_data,
          position: 'inside',
          itemStyle: {
            color: '#4A4AFF'
          }
        }],
        xAxis: { data: this.$attrs.x_data, name: this.$attrs['x-name'] },
        yAxis: { name: this.$attrs['y-name'] },
        replaceMerge: ['xAxis', 'yAxis', 'legend', 'series']
      })
    }
  }
}
</script>
