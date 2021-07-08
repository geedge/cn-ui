<template>
  <div class="chart__legend"></div>
  <div class="char__table">
    <div class="char__table-top">
      <div class="char-table-min blue-top">Average</div>
      <div class="char-table-max blue-button">Maximum</div>
    </div>
    <div class="char__table-bottom">
        <div class="box__color" >
          <p v-for="i in chartColor" :style="{'background':i}" :key="i" :title="i"></p>
        </div>
        <div class="box__text">
          <p v-for="s in data" :key="s" :title="s.legend">{{s.legend}}</p>
        </div>
      <div class="char__table-bottom-min">
        <p  v-for="item in data" :key="item" :title="item.aggregation.avg">{{item.aggregation.avg}}</p>
       </div>
      <div class="char__table-bottom-max">
        <p  v-for="items in data" :key="items" :title="items.aggregation.max">{{items.aggregation.max}}</p>
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
        console.log(n)
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
  width: 455px;
  height: 111px;
  border: 1px solid #E7EAED;
  font-size: 10px;
  color:#5f6368;
  margin: auto;
}
.char__table-top{
  position: relative;
  width: 455px;
  height: 30px;
  line-height: 35px;
  display: flex;
  border-bottom: #E7EAED 1px solid;
}
.blue-button{
  position:absolute;
  right: 20px;
  top: -3px;
  font-family: Roboto-Regular;
  font-size: 14px;
  color: #0091FF;
  font-weight: 400;

}
.blue-top{
  position:absolute;
  right: 125px;
  top: -3px;
  font-family: Roboto-Regular;
  font-size: 14px;
  color: #0091FF;
  font-weight: 400;
}
.char__table-bottom{
  position: relative;
  color: #5f6368;
  width: 455px;
  height: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.char__table-bottom-max{
  position:absolute;
  width: 46px;
  height: 100%;
  right: 122px;
  top: -4px;
  overflow: scroll;
}
.char__table-bottom-max::-webkit-scrollbar{
  display: none;
}
.char__table-bottom-min{
  position:absolute;
  width: 66px;
  height: 100%;
  right: 16px;
  top: -4px;
  overflow: scroll;
}
.char__table-bottom-min::-webkit-scrollbar{
  display: none;
}
.box__color{
  width: 30px;
  height: 79px;
  position:absolute;
  left: 22px;
  top: 2px;
  box-sizing: border-box;
  margin-top: -4px;
  overflow: scroll;
}
.box__color::-webkit-scrollbar{
  display: none;
}
.box__color>p{
  width: 17px;
  height: 7px;
  border-radius: 24%;
  margin-top: 17px;
}
.box__text{
  position:absolute;
  left: 58px;
  top: 2px;
  width: 106px;
  height: 100%;
  overflow: scroll;
}
.box__text>p{
  margin-top: 5px;
  width: 115px;
}
.box__text::-webkit-scrollbar{
  display: none;
}
</style>
