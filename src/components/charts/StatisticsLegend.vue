<template>
  <div class="chart__legend"></div>
  <div class="char__table">
    <div class="char__table-top">
      <div class="char-table-min blue-top">Average</div>
      <div class="char-table-max blue-button">Maximum</div>
    </div>
    <div class="char__table-bottom">
      <div class="char__table-bottom-box">
        <div class="box__color" >
          <p v-for="i in chartColor" :style="{'background':i}" :key="i" title="5370C6

#90CC74

#FAC858

#EE6666

#73BFDE

#3BA172

#FC8452

#9960B4

#E97CCC

#FEA69E

#0F8AB2

#57CBAC

#5888BC

#63B6AC

#EDC6B2

">{{i}}</p>
        </div>
        <div class="box__text">
          <p title="yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001

yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001.lyf-ssl.handshake.extensions_server_name-baidu

yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001.fwh-app-test.yyq-正则-yandex.ru

yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001.yyq-twitter-002.yyq-twitter-003

yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001.yyq-twitter-003

yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001.yyq-youtube-c2s-首包.yyq-skype-001.zw_test.app.abc.

yyq-源or目的IP.yyq-ios-yandex-2.yyq-tcp_dstport.yyq-instagram-001.lyf-s" v-for="s in data" :key="s">{{s.legend}}</p>
        </div>
      </div>
      <div class="char__table-bottom-min">
        <p  v-for="item in data" :key="item">{{item.aggregation.avg}}</p>
       </div>
      <div class="char__table-bottom-max">
        <p  v-for="items in data" :key="items" title="16764

16610

22181

12036

15723

45856

13721

23309

26498

17562">{{items.aggregation.max}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getChartColor } from '@/components/charts/chart-options'
import {chartColor} from "./chart-options";
export default {
  name: 'StatisticsLegend',
  props: {
    data: Array
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler (n) {
      }
    }
  },
  setup () {
    return {
      getChartColor,
      chartColor }
  }
}

</script>

<style scoped>
.char__table{
  width: 513px;
  height: 127px;
  border:#cccccc 1px solid;
  font-size: 10px;
  color:#5f6368;
  margin: auto;
}
.char__table-top{
  position: relative;
  width: 513px;
  height: 35px;
  line-height: 35px;
  display: flex;
  border-bottom: #cccccc 1px solid;
}
.blue-button{
  color: deepskyblue;
  position:absolute;
  right: 44px;
  top: 2px;

}
.blue-top{
color: deepskyblue;
  position:absolute;
  right: 143px;
  top: 2px;
}
.char__table-bottom{
  position: relative;
  color: #5f6368;
  width: 390px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.char__table-bottom-max{
  position:absolute;
  width: 170px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  right: -44px;
  top: 2px;
}
.char__table-bottom-min{
  position:absolute;
  width: 170px;
  height: 100%;
  right: -140px;
  top: 2px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.char__table-bottom-box{
  width: 97px;
  height: 100%;
  display: flex;
  justify-content: space-around;
}
.box__color{
  width: 30px;
  height: 79px;
  position:absolute;
  left: 22px;
  top: 2px;
  box-sizing: border-box;
  margin-top: 2px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.box__text{
  position:absolute;
  left: 58px;
  top: 2px;
  width: 47px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
