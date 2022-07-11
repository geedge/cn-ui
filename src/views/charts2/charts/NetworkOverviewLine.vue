<template>
  <div class="line">
    <div id="chart"></div>
    <div class="line-select">
      <div class="line-select-metric">
        <span>{{$t('network.metric')}}:</span>
        <div class="line-select__operation">
          <el-select
              size="mini"
              v-model="value1"
              class="option__select select-topn"
              placeholder=""
              popper-class="option-popper"
          >
            <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
      </div>
      <div class="line-select-reference-line">
        <span>{{$t('network.referenceLine')}}:</span>
        <div class="line-select__operation">
          <el-select
              size="mini"
              v-model="value2"
              class="option__select select-topn"
              placeholder=""
              popper-class="option-popper"
          >
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div class="line-value">
      <div class="line-value-mpackets" v-for="item in mpackets" :key="item">
        <span>{{item}} </span><span>mpackets/s</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { stackedLineChartOption } from '@/views/charts2/charts/options/pie'
import unitConvert from '@/utils/unit-convert'
import { shallowRef } from 'vue'
export default {
  name: 'NetworkOverviewLine',
  props: {
    chart: Object
  },
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      options1: [
        {
          value: 'Bits',
          label: 'Bits'
        },
        {
          value: 'Option2',
          label: 'Option2'
        },
        {
          value: 'Option3',
          label: 'Option3'
        }
      ],
      value1: '',
      options2: [
        {
          value: 'Average',
          label: 'Average'
        },
        {
          value: 'Option2',
          label: 'Option2'
        },
        {
          value: 'Option3',
          label: 'Option3'
        }
      ],
      value2: '',
      mpackets: [42, 1, 2, 1, 12],
      unitConvert,
      chartDateObject: []
    }
  },
  methods: {
    init () {
      const dom = document.getElementById('chart')
      this.myChart = echarts.init(dom)
      this.chartOption = stackedLineChartOption
      this.chartDateObject = [
        {
          dateArr: [
            {
              stat_time: 1652544000000,
              rate: 100
            },
            {
              stat_time: 1652544300000,
              rate: 50
            },
            {
              stat_time: 1652544600000,
              rate: 20
            },
            {
              stat_time: 1652544900000,
              rate: 53932331
            },
            {
              stat_time: 1652545200000,
              rate: 45
            },
            {
              stat_time: 1652545500000,
              rate: 100
            },
            {
              stat_time: 1652545800000,
              rate: 27
            },
            {
              stat_time: 1652546100000,
              rate: 45
            },
            {
              stat_time: 1652546400000,
              rate: 67
            },
            {
              stat_time: 1652546700000,
              rate: 87
            },
            {
              stat_time: 1652547000000,
              rate: 32
            },
            {
              stat_time: 1652547300000,
              rate: 56
            },
            {
              stat_time: 1652547600000,
              rate: 25
            },
            {
              stat_time: 1652547900000,
              rate: 56
            },
            {
              stat_time: 1652548200000,
              rate: 15
            },
            {
              stat_time: 1652548500000,
              rate: 54
            },
            {
              stat_time: 1652548800000,
              rate: 56
            },
            {
              stat_time: 1652549100000,
              rate: 76
            },
            {
              stat_time: 1652549400000,
              rate: 79
            },
            {
              stat_time: 1652549700000,
              rate: 76
            },
            {
              stat_time: 1652550000000,
              rate: 34
            },
            {
              stat_time: 1652550300000,
              rate: 34
            },
            {
              stat_time: 1652550600000,
              rate: 34
            },
            {
              stat_time: 1652550900000,
              rate: 34
            },
            {
              stat_time: 1652551200000,
              rate: 34
            },
            {
              stat_time: 1652551500000,
              rate: 65
            },
            {
              stat_time: 1652551800000,
              rate: 66
            },
            {
              stat_time: 1652552100000,
              rate: 34
            },
            {
              stat_time: 1652552400000,
              rate: 23
            },
            {
              stat_time: 1652552700000,
              rate: 32
            },
            {
              stat_time: 1652553000000,
              rate: 54
            },
            {
              stat_time: 1652553300000,
              rate: 32
            },
            {
              stat_time: 1652553600000,
              rate: 43
            },
            {
              stat_time: 1652553900000,
              rate: 46
            },
            {
              stat_time: 1652554200000,
              rate: 6890352
            },
            {
              stat_time: 1652554500000,
              rate: 34
            },
            {
              stat_time: 1652554800000,
              rate: 6160476
            },
            {
              stat_time: 1652555100000,
              rate: 6128487
            },
            {
              stat_time: 1652555400000,
              rate: 5727151
            },
            {
              stat_time: 1652555700000,
              rate: 5112335
            },
            {
              stat_time: 1652556000000,
              rate: 4916237
            },
            {
              stat_time: 1652556300000,
              rate: 4332243
            },
            {
              stat_time: 1652556600000,
              rate: 4182951
            },
            {
              stat_time: 1652556900000,
              rate: 3935808
            },
            {
              stat_time: 1652557200000,
              rate: 3780119
            },
            {
              stat_time: 1652557500000,
              rate: 4287550
            },
            {
              stat_time: 1652557800000,
              rate: 3708335
            },
            {
              stat_time: 1652558100000,
              rate: 3579655
            },
            {
              stat_time: 1652558400000,
              rate: 4024462
            },
            {
              stat_time: 1652558700000,
              rate: 4067459
            },
            {
              stat_time: 1652559000000,
              rate: 3701036
            },
            {
              stat_time: 1652559300000,
              rate: 3614789
            },
            {
              stat_time: 1652559600000,
              rate: 3467837
            },
            {
              stat_time: 1652559900000,
              rate: 2900363
            },
            {
              stat_time: 1652560200000,
              rate: 2888851
            },
            {
              stat_time: 1652560500000,
              rate: 2701209
            },
            {
              stat_time: 1652560800000,
              rate: 2779434
            },
            {
              stat_time: 1652561100000,
              rate: 2926322
            },
            {
              stat_time: 1652561400000,
              rate: 2800990
            },
            {
              stat_time: 1652561700000,
              rate: 3086460
            },
            {
              stat_time: 1652562000000,
              rate: 2923915
            },
            {
              stat_time: 1652562300000,
              rate: 3367917
            },
            {
              stat_time: 1652562600000,
              rate: 3151884
            },
            {
              stat_time: 1652562900000,
              rate: 3463305
            },
            {
              stat_time: 1652563200000,
              rate: 4434079
            },
            {
              stat_time: 1652563500000,
              rate: 5466455
            },
            {
              stat_time: 1652563800000,
              rate: 6526085
            },
            {
              stat_time: 1652564100000,
              rate: 5890882
            },
            {
              stat_time: 1652564400000,
              rate: 6135859
            },
            {
              stat_time: 1652564700000,
              rate: 6336279
            },
            {
              stat_time: 1652565000000,
              rate: 6743536
            },
            {
              stat_time: 1652565300000,
              rate: 7273884
            },
            {
              stat_time: 1652565600000,
              rate: 7708789
            },
            {
              stat_time: 1652565900000,
              rate: 8080154
            },
            {
              stat_time: 1652566200000,
              rate: 8531700
            },
            {
              stat_time: 1652566500000,
              rate: 9233987
            },
            {
              stat_time: 1652566800000,
              rate: 9548847
            },
            {
              stat_time: 1652567100000,
              rate: 9394714
            },
            {
              stat_time: 1652567400000,
              rate: 9831384
            },
            {
              stat_time: 1652567700000,
              rate: 10411296
            },
            {
              stat_time: 1652568000000,
              rate: 10623099
            },
            {
              stat_time: 1652568300000,
              rate: 11010882
            },
            {
              stat_time: 1652568600000,
              rate: 10873315
            },
            {
              stat_time: 1652568900000,
              rate: 9761416
            },
            {
              stat_time: 1652569200000,
              rate: 10714727
            },
            {
              stat_time: 1652569500000,
              rate: 10590923
            },
            {
              stat_time: 1652569800000,
              rate: 11436613
            },
            {
              stat_time: 1652570100000,
              rate: 11730266
            },
            {
              stat_time: 1652570400000,
              rate: 12201731
            },
            {
              stat_time: 1652570700000,
              rate: 13052837
            },
            {
              stat_time: 1652571000000,
              rate: 12543164
            },
            {
              stat_time: 1652571300000,
              rate: 12959328
            },
            {
              stat_time: 1652571600000,
              rate: 13441235
            },
            {
              stat_time: 1652571900000,
              rate: 13409372
            },
            {
              stat_time: 1652572200000,
              rate: 14348181
            },
            {
              stat_time: 1652572500000,
              rate: 15048904
            },
            {
              stat_time: 1652572800000,
              rate: 15171239
            },
            {
              stat_time: 1652573100000,
              rate: 16367221
            },
            {
              stat_time: 1652573400000,
              rate: 17738880
            },
            {
              stat_time: 1652573700000,
              rate: 19852960
            },
            {
              stat_time: 1652574000000,
              rate: 18871128
            },
            {
              stat_time: 1652574300000,
              rate: 19117694
            },
            {
              stat_time: 1652574600000,
              rate: 19353638
            },
            {
              stat_time: 1652574900000,
              rate: 20863662
            },
            {
              stat_time: 1652575200000,
              rate: 19640832
            },
            {
              stat_time: 1652575500000,
              rate: 20050025
            },
            {
              stat_time: 1652575800000,
              rate: 22865748
            },
            {
              stat_time: 1652576100000,
              rate: 23341169
            },
            {
              stat_time: 1652576400000,
              rate: 23340054
            },
            {
              stat_time: 1652576700000,
              rate: 22748911
            },
            {
              stat_time: 1652577000000,
              rate: 19992563
            },
            {
              stat_time: 1652577300000,
              rate: 20559226
            },
            {
              stat_time: 1652577600000,
              rate: 22854285
            },
            {
              stat_time: 1652577900000,
              rate: 23906020
            },
            {
              stat_time: 1652578200000,
              rate: 24086505
            },
            {
              stat_time: 1652578500000,
              rate: 22715176
            },
            {
              stat_time: 1652578800000,
              rate: 23369407
            },
            {
              stat_time: 1652579100000,
              rate: 25487989
            },
            {
              stat_time: 1652579400000,
              rate: 26631762
            },
            {
              stat_time: 1652579700000,
              rate: 28738473
            },
            {
              stat_time: 1652580000000,
              rate: 30735243
            },
            {
              stat_time: 1652580300000,
              rate: 31611725
            },
            {
              stat_time: 1652580600000,
              rate: 31680369
            },
            {
              stat_time: 1652580900000,
              rate: 31233004
            },
            {
              stat_time: 1652581200000,
              rate: 32772112
            },
            {
              stat_time: 1652581500000,
              rate: 34210528
            },
            {
              stat_time: 1652581800000,
              rate: 35654000
            },
            {
              stat_time: 1652582100000,
              rate: 36687596
            },
            {
              stat_time: 1652582400000,
              rate: 36746922
            },
            {
              stat_time: 1652582700000,
              rate: 39254800
            },
            {
              stat_time: 1652583000000,
              rate: 39595388
            },
            {
              stat_time: 1652583300000,
              rate: 39972111
            },
            {
              stat_time: 1652583600000,
              rate: 40791647
            },
            {
              stat_time: 1652583900000,
              rate: 40963501
            },
            {
              stat_time: 1652584200000,
              rate: 42358692
            },
            {
              stat_time: 1652584500000,
              rate: 43856693
            },
            {
              stat_time: 1652584800000,
              rate: 44100684
            },
            {
              stat_time: 1652585100000,
              rate: 44437389
            },
            {
              stat_time: 1652585400000,
              rate: 45596587
            },
            {
              stat_time: 1652585700000,
              rate: 46154917
            },
            {
              stat_time: 1652586000000,
              rate: 45960880
            },
            {
              stat_time: 1652586300000,
              rate: 46431276
            },
            {
              stat_time: 1652586600000,
              rate: 49023068
            },
            {
              stat_time: 1652586900000,
              rate: 49592063
            },
            {
              stat_time: 1652587200000,
              rate: 50716723
            },
            {
              stat_time: 1652587500000,
              rate: 53741920
            },
            {
              stat_time: 1652587800000,
              rate: 56175285
            },
            {
              stat_time: 1652588100000,
              rate: 57680307
            },
            {
              stat_time: 1652588400000,
              rate: 59134913
            },
            {
              stat_time: 1652588700000,
              rate: 57337066
            },
            {
              stat_time: 1652589000000,
              rate: 57983261
            },
            {
              stat_time: 1652589300000,
              rate: 56700289
            },
            {
              stat_time: 1652589600000,
              rate: 55878496
            },
            {
              stat_time: 1652589900000,
              rate: 57804474
            },
            {
              stat_time: 1652590200000,
              rate: 58609166
            },
            {
              stat_time: 1652590500000,
              rate: 58516659
            },
            {
              stat_time: 1652590800000,
              rate: 56948867
            },
            {
              stat_time: 1652591100000,
              rate: 56219935
            },
            {
              stat_time: 1652591400000,
              rate: 54505463
            },
            {
              stat_time: 1652591700000,
              rate: 53446587
            },
            {
              stat_time: 1652592000000,
              rate: 52340375
            },
            {
              stat_time: 1652592300000,
              rate: 52356666
            },
            {
              stat_time: 1652592600000,
              rate: 51244146
            },
            {
              stat_time: 1652592900000,
              rate: 53680531
            },
            {
              stat_time: 1652593200000,
              rate: 54533580
            },
            {
              stat_time: 1652593500000,
              rate: 53306910
            },
            {
              stat_time: 1652593800000,
              rate: 52354353
            },
            {
              stat_time: 1652594100000,
              rate: 49977580
            },
            {
              stat_time: 1652594400000,
              rate: 46621574
            },
            {
              stat_time: 1652594700000,
              rate: 47127087
            },
            {
              stat_time: 1652595000000,
              rate: 49461339
            },
            {
              stat_time: 1652595300000,
              rate: 51031827
            },
            {
              stat_time: 1652595600000,
              rate: 51476867
            },
            {
              stat_time: 1652595900000,
              rate: 53283867
            },
            {
              stat_time: 1652596200000,
              rate: 54061215
            },
            {
              stat_time: 1652596500000,
              rate: 54541970
            },
            {
              stat_time: 1652596800000,
              rate: 55083629
            },
            {
              stat_time: 1652597100000,
              rate: 55246097
            },
            {
              stat_time: 1652597400000,
              rate: 53191619
            },
            {
              stat_time: 1652597700000,
              rate: 50731653
            },
            {
              stat_time: 1652598000000,
              rate: 51200237
            },
            {
              stat_time: 1652598300000,
              rate: 51534337
            },
            {
              stat_time: 1652598600000,
              rate: 50598044
            },
            {
              stat_time: 1652598900000,
              rate: 49776256
            },
            {
              stat_time: 1652599200000,
              rate: 49547090
            },
            {
              stat_time: 1652599500000,
              rate: 48760323
            },
            {
              stat_time: 1652599800000,
              rate: 48296686
            },
            {
              stat_time: 1652600100000,
              rate: 46449632
            },
            {
              stat_time: 1652600400000,
              rate: 49544863
            },
            {
              stat_time: 1652600700000,
              rate: 49467691
            },
            {
              stat_time: 1652601000000,
              rate: 49216775
            },
            {
              stat_time: 1652601300000,
              rate: 49433036
            },
            {
              stat_time: 1652601600000,
              rate: 48375747
            },
            {
              stat_time: 1652601900000,
              rate: 46592737
            },
            {
              stat_time: 1652602200000,
              rate: 48789567
            },
            {
              stat_time: 1652602500000,
              rate: 48680754
            },
            {
              stat_time: 1652602800000,
              rate: 48512774
            },
            {
              stat_time: 1652603100000,
              rate: 49527122
            },
            {
              stat_time: 1652603400000,
              rate: 48723705
            },
            {
              stat_time: 1652603700000,
              rate: 48324787
            },
            {
              stat_time: 1652604000000,
              rate: 46695340
            },
            {
              stat_time: 1652604300000,
              rate: 47933425
            },
            {
              stat_time: 1652604600000,
              rate: 48526356
            },
            {
              stat_time: 1652604900000,
              rate: 48410775
            },
            {
              stat_time: 1652605200000,
              rate: 48526193
            },
            {
              stat_time: 1652605500000,
              rate: 48716345
            },
            {
              stat_time: 1652605800000,
              rate: 48473771
            },
            {
              stat_time: 1652606100000,
              rate: 48728770
            },
            {
              stat_time: 1652606400000,
              rate: 50446075
            },
            {
              stat_time: 1652606700000,
              rate: 50854376
            },
            {
              stat_time: 1652607000000,
              rate: 50981863
            },
            {
              stat_time: 1652607300000,
              rate: 51019977
            },
            {
              stat_time: 1652607600000,
              rate: 51359469
            },
            {
              stat_time: 1652607900000,
              rate: 52568453
            },
            {
              stat_time: 1652608200000,
              rate: 54058483
            },
            {
              stat_time: 1652608500000,
              rate: 53466258
            },
            {
              stat_time: 1652608800000,
              rate: 52039836
            },
            {
              stat_time: 1652609100000,
              rate: 52360322
            },
            {
              stat_time: 1652609400000,
              rate: 52855579
            },
            {
              stat_time: 1652609700000,
              rate: 52866074
            },
            {
              stat_time: 1652610000000,
              rate: 52981945
            },
            {
              stat_time: 1652610300000,
              rate: 51579715
            },
            {
              stat_time: 1652610600000,
              rate: 52291658
            },
            {
              stat_time: 1652610900000,
              rate: 52758547
            },
            {
              stat_time: 1652611200000,
              rate: 55003147
            },
            {
              stat_time: 1652611500000,
              rate: 56643555
            },
            {
              stat_time: 1652611800000,
              rate: 54727710
            },
            {
              stat_time: 1652612100000,
              rate: 57998594
            },
            {
              stat_time: 1652612400000,
              rate: 53340115
            },
            {
              stat_time: 1652612700000,
              rate: 58519563
            },
            {
              stat_time: 1652613000000,
              rate: 57299719
            },
            {
              stat_time: 1652613300000,
              rate: 57614166
            },
            {
              stat_time: 1652613600000,
              rate: 57569555
            },
            {
              stat_time: 1652613900000,
              rate: 57108456
            },
            {
              stat_time: 1652614200000,
              rate: 55940414
            },
            {
              stat_time: 1652614500000,
              rate: 56422300
            },
            {
              stat_time: 1652614800000,
              rate: 58067580
            },
            {
              stat_time: 1652615100000,
              rate: 59305259
            },
            {
              stat_time: 1652615400000,
              rate: 59620542
            },
            {
              stat_time: 1652615700000,
              rate: 59511278
            },
            {
              stat_time: 1652616000000,
              rate: 58682948
            },
            {
              stat_time: 1652616300000,
              rate: 59474819
            },
            {
              stat_time: 1652616600000,
              rate: 60495833
            },
            {
              stat_time: 1652616900000,
              rate: 61534299
            },
            {
              stat_time: 1652617200000,
              rate: 62552948
            },
            {
              stat_time: 1652617500000,
              rate: 61501072
            },
            {
              stat_time: 1652617800000,
              rate: 59650889
            },
            {
              stat_time: 1652618100000,
              rate: 58985415
            },
            {
              stat_time: 1652618400000,
              rate: 59255183
            },
            {
              stat_time: 1652618700000,
              rate: 60608863
            },
            {
              stat_time: 1652619000000,
              rate: 61438380
            },
            {
              stat_time: 1652619300000,
              rate: 62420546
            },
            {
              stat_time: 1652619600000,
              rate: 62590594
            },
            {
              stat_time: 1652619900000,
              rate: 62095950
            },
            {
              stat_time: 1652620200000,
              rate: 63718903
            },
            {
              stat_time: 1652620500000,
              rate: 68762818
            },
            {
              stat_time: 1652620800000,
              rate: 70489441
            },
            {
              stat_time: 1652621100000,
              rate: 73844737
            },
            {
              stat_time: 1652621400000,
              rate: 73487290
            },
            {
              stat_time: 1652621700000,
              rate: 73311188
            },
            {
              stat_time: 1652622000000,
              rate: 73917769
            },
            {
              stat_time: 1652622300000,
              rate: 73800247
            },
            {
              stat_time: 1652622600000,
              rate: 76146932
            },
            {
              stat_time: 1652622900000,
              rate: 75958696
            },
            {
              stat_time: 1652623200000,
              rate: 74467543
            },
            {
              stat_time: 1652623500000,
              rate: 73889830
            },
            {
              stat_time: 1652623800000,
              rate: 74735585
            },
            {
              stat_time: 1652624100000,
              rate: 75843471
            },
            {
              stat_time: 1652624400000,
              rate: 77786588
            },
            {
              stat_time: 1652624700000,
              rate: 76156466
            },
            {
              stat_time: 1652625000000,
              rate: 73335410
            },
            {
              stat_time: 1652625300000,
              rate: 71284149
            },
            {
              stat_time: 1652625600000,
              rate: 69296435
            },
            {
              stat_time: 1652625900000,
              rate: 68404328
            },
            {
              stat_time: 1652626200000,
              rate: 67259702
            },
            {
              stat_time: 1652626500000,
              rate: 68115684
            },
            {
              stat_time: 1652626800000,
              rate: 67191500
            },
            {
              stat_time: 1652627100000,
              rate: 65596427
            },
            {
              stat_time: 1652627400000,
              rate: 62699903
            },
            {
              stat_time: 1652627700000,
              rate: 61535977
            },
            {
              stat_time: 1652628000000,
              rate: 61218758
            },
            {
              stat_time: 1652628300000,
              rate: 68813468
            },
            {
              stat_time: 1652628600000,
              rate: 71614061
            },
            {
              stat_time: 1652628900000,
              rate: 72200135
            },
            {
              stat_time: 1652629200000,
              rate: 72648480
            },
            {
              stat_time: 1652629500000,
              rate: 71132614
            },
            {
              stat_time: 1652629800000,
              rate: 70650928
            },
            {
              stat_time: 1652630100000,
              rate: 70844773
            }
          ]
        },
        {
          dateArr: [
            {
              stat_time: 1652544000000,
              rate: 59770054
            },
            {
              stat_time: 1652544300000,
              rate: 57705198
            },
            {
              stat_time: 1652544600000,
              rate: 54907153
            },
            {
              stat_time: 1652544900000,
              rate: 53932331
            },
            {
              stat_time: 1652545200000,
              rate: 50820084
            },
            {
              stat_time: 1652545500000,
              rate: 48744453
            },
            {
              stat_time: 1652545800000,
              rate: 46345590
            },
            {
              stat_time: 1652546100000,
              rate: 45092019
            },
            {
              stat_time: 1652546400000,
              rate: 43861024
            },
            {
              stat_time: 1652546700000,
              rate: 42635307
            },
            {
              stat_time: 1652547000000,
              rate: 39513137
            },
            {
              stat_time: 1652547300000,
              rate: 37251858
            },
            {
              stat_time: 1652547600000,
              rate: 35641395
            },
            {
              stat_time: 1652547900000,
              rate: 32593269
            },
            {
              stat_time: 1652548200000,
              rate: 29854584
            },
            {
              stat_time: 1652548500000,
              rate: 26270305
            },
            {
              stat_time: 1652548800000,
              rate: 24115244
            },
            {
              stat_time: 1652549100000,
              rate: 22159263
            },
            {
              stat_time: 1652549400000,
              rate: 20260208
            },
            {
              stat_time: 1652549700000,
              rate: 19824773
            },
            {
              stat_time: 1652550000000,
              rate: 19364713
            },
            {
              stat_time: 1652550300000,
              rate: 18511395
            },
            {
              stat_time: 1652550600000,
              rate: 16811691
            },
            {
              stat_time: 1652550900000,
              rate: 14849281
            },
            {
              stat_time: 1652551200000,
              rate: 14545834
            },
            {
              stat_time: 1652551500000,
              rate: 12822215
            },
            {
              stat_time: 1652551800000,
              rate: 12061919
            },
            {
              stat_time: 1652552100000,
              rate: 11483505
            },
            {
              stat_time: 1652552400000,
              rate: 8830222
            },
            {
              stat_time: 1652552700000,
              rate: 8316519
            },
            {
              stat_time: 1652553000000,
              rate: 8039651
            },
            {
              stat_time: 1652553300000,
              rate: 7780729
            },
            {
              stat_time: 1652553600000,
              rate: 6873645
            },
            {
              stat_time: 1652553900000,
              rate: 6960513
            },
            {
              stat_time: 1652554200000,
              rate: 6890352
            },
            {
              stat_time: 1652554500000,
              rate: 6319387
            },
            {
              stat_time: 1652554800000,
              rate: 6160476
            },
            {
              stat_time: 1652555100000,
              rate: 6128487
            },
            {
              stat_time: 1652555400000,
              rate: 5727151
            },
            {
              stat_time: 1652555700000,
              rate: 5112335
            },
            {
              stat_time: 1652556000000,
              rate: 4916237
            },
            {
              stat_time: 1652556300000,
              rate: 4332243
            },
            {
              stat_time: 1652556600000,
              rate: 4182951
            },
            {
              stat_time: 1652556900000,
              rate: 3935808
            },
            {
              stat_time: 1652557200000,
              rate: 3780119
            },
            {
              stat_time: 1652557500000,
              rate: 4287550
            },
            {
              stat_time: 1652557800000,
              rate: 3708335
            },
            {
              stat_time: 1652558100000,
              rate: 3579655
            },
            {
              stat_time: 1652558400000,
              rate: 4024462
            },
            {
              stat_time: 1652558700000,
              rate: 4067459
            },
            {
              stat_time: 1652559000000,
              rate: 3701036
            },
            {
              stat_time: 1652559300000,
              rate: 3614789
            },
            {
              stat_time: 1652559600000,
              rate: 3467837
            },
            {
              stat_time: 1652559900000,
              rate: 2900363
            },
            {
              stat_time: 1652560200000,
              rate: 2888851
            },
            {
              stat_time: 1652560500000,
              rate: 2701209
            },
            {
              stat_time: 1652560800000,
              rate: 2779434
            },
            {
              stat_time: 1652561100000,
              rate: 2926322
            },
            {
              stat_time: 1652561400000,
              rate: 2800990
            },
            {
              stat_time: 1652561700000,
              rate: 3086460
            },
            {
              stat_time: 1652562000000,
              rate: 2923915
            },
            {
              stat_time: 1652562300000,
              rate: 3367917
            },
            {
              stat_time: 1652562600000,
              rate: 3151884
            },
            {
              stat_time: 1652562900000,
              rate: 3463305
            },
            {
              stat_time: 1652563200000,
              rate: 4434079
            },
            {
              stat_time: 1652563500000,
              rate: 5466455
            },
            {
              stat_time: 1652563800000,
              rate: 6526085
            },
            {
              stat_time: 1652564100000,
              rate: 5890882
            },
            {
              stat_time: 1652564400000,
              rate: 6135859
            },
            {
              stat_time: 1652564700000,
              rate: 6336279
            },
            {
              stat_time: 1652565000000,
              rate: 6743536
            },
            {
              stat_time: 1652565300000,
              rate: 7273884
            },
            {
              stat_time: 1652565600000,
              rate: 7708789
            },
            {
              stat_time: 1652565900000,
              rate: 8080154
            },
            {
              stat_time: 1652566200000,
              rate: 8531700
            },
            {
              stat_time: 1652566500000,
              rate: 9233987
            },
            {
              stat_time: 1652566800000,
              rate: 9548847
            },
            {
              stat_time: 1652567100000,
              rate: 9394714
            },
            {
              stat_time: 1652567400000,
              rate: 9831384
            },
            {
              stat_time: 1652567700000,
              rate: 10411296
            },
            {
              stat_time: 1652568000000,
              rate: 10623099
            },
            {
              stat_time: 1652568300000,
              rate: 11010882
            },
            {
              stat_time: 1652568600000,
              rate: 10873315
            },
            {
              stat_time: 1652568900000,
              rate: 9761416
            },
            {
              stat_time: 1652569200000,
              rate: 10714727
            },
            {
              stat_time: 1652569500000,
              rate: 10590923
            },
            {
              stat_time: 1652569800000,
              rate: 11436613
            },
            {
              stat_time: 1652570100000,
              rate: 11730266
            },
            {
              stat_time: 1652570400000,
              rate: 12201731
            },
            {
              stat_time: 1652570700000,
              rate: 13052837
            },
            {
              stat_time: 1652571000000,
              rate: 12543164
            },
            {
              stat_time: 1652571300000,
              rate: 12959328
            },
            {
              stat_time: 1652571600000,
              rate: 13441235
            },
            {
              stat_time: 1652571900000,
              rate: 13409372
            },
            {
              stat_time: 1652572200000,
              rate: 14348181
            },
            {
              stat_time: 1652572500000,
              rate: 15048904
            },
            {
              stat_time: 1652572800000,
              rate: 15171239
            },
            {
              stat_time: 1652573100000,
              rate: 16367221
            },
            {
              stat_time: 1652573400000,
              rate: 17738880
            },
            {
              stat_time: 1652573700000,
              rate: 19852960
            },
            {
              stat_time: 1652574000000,
              rate: 18871128
            },
            {
              stat_time: 1652574300000,
              rate: 19117694
            },
            {
              stat_time: 1652574600000,
              rate: 19353638
            },
            {
              stat_time: 1652574900000,
              rate: 20863662
            },
            {
              stat_time: 1652575200000,
              rate: 19640832
            },
            {
              stat_time: 1652575500000,
              rate: 20050025
            },
            {
              stat_time: 1652575800000,
              rate: 22865748
            },
            {
              stat_time: 1652576100000,
              rate: 23341169
            },
            {
              stat_time: 1652576400000,
              rate: 23340054
            },
            {
              stat_time: 1652576700000,
              rate: 22748911
            },
            {
              stat_time: 1652577000000,
              rate: 19992563
            },
            {
              stat_time: 1652577300000,
              rate: 20559226
            },
            {
              stat_time: 1652577600000,
              rate: 22854285
            },
            {
              stat_time: 1652577900000,
              rate: 23906020
            },
            {
              stat_time: 1652578200000,
              rate: 24086505
            },
            {
              stat_time: 1652578500000,
              rate: 22715176
            },
            {
              stat_time: 1652578800000,
              rate: 23369407
            },
            {
              stat_time: 1652579100000,
              rate: 25487989
            },
            {
              stat_time: 1652579400000,
              rate: 26631762
            },
            {
              stat_time: 1652579700000,
              rate: 28738473
            },
            {
              stat_time: 1652580000000,
              rate: 30735243
            },
            {
              stat_time: 1652580300000,
              rate: 31611725
            },
            {
              stat_time: 1652580600000,
              rate: 31680369
            },
            {
              stat_time: 1652580900000,
              rate: 31233004
            },
            {
              stat_time: 1652581200000,
              rate: 32772112
            },
            {
              stat_time: 1652581500000,
              rate: 34210528
            },
            {
              stat_time: 1652581800000,
              rate: 35654000
            },
            {
              stat_time: 1652582100000,
              rate: 36687596
            },
            {
              stat_time: 1652582400000,
              rate: 36746922
            },
            {
              stat_time: 1652582700000,
              rate: 39254800
            },
            {
              stat_time: 1652583000000,
              rate: 39595388
            },
            {
              stat_time: 1652583300000,
              rate: 39972111
            },
            {
              stat_time: 1652583600000,
              rate: 40791647
            },
            {
              stat_time: 1652583900000,
              rate: 40963501
            },
            {
              stat_time: 1652584200000,
              rate: 42358692
            },
            {
              stat_time: 1652584500000,
              rate: 43856693
            },
            {
              stat_time: 1652584800000,
              rate: 44100684
            },
            {
              stat_time: 1652585100000,
              rate: 44437389
            },
            {
              stat_time: 1652585400000,
              rate: 45596587
            },
            {
              stat_time: 1652585700000,
              rate: 46154917
            },
            {
              stat_time: 1652586000000,
              rate: 45960880
            },
            {
              stat_time: 1652586300000,
              rate: 46431276
            },
            {
              stat_time: 1652586600000,
              rate: 49023068
            },
            {
              stat_time: 1652586900000,
              rate: 49592063
            },
            {
              stat_time: 1652587200000,
              rate: 50716723
            },
            {
              stat_time: 1652587500000,
              rate: 53741920
            },
            {
              stat_time: 1652587800000,
              rate: 56175285
            },
            {
              stat_time: 1652588100000,
              rate: 57680307
            },
            {
              stat_time: 1652588400000,
              rate: 59134913
            },
            {
              stat_time: 1652588700000,
              rate: 57337066
            },
            {
              stat_time: 1652589000000,
              rate: 57983261
            },
            {
              stat_time: 1652589300000,
              rate: 56700289
            },
            {
              stat_time: 1652589600000,
              rate: 55878496
            },
            {
              stat_time: 1652589900000,
              rate: 57804474
            },
            {
              stat_time: 1652590200000,
              rate: 58609166
            },
            {
              stat_time: 1652590500000,
              rate: 58516659
            },
            {
              stat_time: 1652590800000,
              rate: 56948867
            },
            {
              stat_time: 1652591100000,
              rate: 56219935
            },
            {
              stat_time: 1652591400000,
              rate: 54505463
            },
            {
              stat_time: 1652591700000,
              rate: 53446587
            },
            {
              stat_time: 1652592000000,
              rate: 52340375
            },
            {
              stat_time: 1652592300000,
              rate: 52356666
            },
            {
              stat_time: 1652592600000,
              rate: 51244146
            },
            {
              stat_time: 1652592900000,
              rate: 53680531
            },
            {
              stat_time: 1652593200000,
              rate: 54533580
            },
            {
              stat_time: 1652593500000,
              rate: 53306910
            },
            {
              stat_time: 1652593800000,
              rate: 52354353
            },
            {
              stat_time: 1652594100000,
              rate: 49977580
            },
            {
              stat_time: 1652594400000,
              rate: 46621574
            },
            {
              stat_time: 1652594700000,
              rate: 47127087
            },
            {
              stat_time: 1652595000000,
              rate: 49461339
            },
            {
              stat_time: 1652595300000,
              rate: 51031827
            },
            {
              stat_time: 1652595600000,
              rate: 51476867
            },
            {
              stat_time: 1652595900000,
              rate: 53283867
            },
            {
              stat_time: 1652596200000,
              rate: 54061215
            },
            {
              stat_time: 1652596500000,
              rate: 54541970
            },
            {
              stat_time: 1652596800000,
              rate: 55083629
            },
            {
              stat_time: 1652597100000,
              rate: 55246097
            },
            {
              stat_time: 1652597400000,
              rate: 53191619
            },
            {
              stat_time: 1652597700000,
              rate: 50731653
            },
            {
              stat_time: 1652598000000,
              rate: 51200237
            },
            {
              stat_time: 1652598300000,
              rate: 51534337
            },
            {
              stat_time: 1652598600000,
              rate: 50598044
            },
            {
              stat_time: 1652598900000,
              rate: 49776256
            },
            {
              stat_time: 1652599200000,
              rate: 49547090
            },
            {
              stat_time: 1652599500000,
              rate: 48760323
            },
            {
              stat_time: 1652599800000,
              rate: 48296686
            },
            {
              stat_time: 1652600100000,
              rate: 46449632
            },
            {
              stat_time: 1652600400000,
              rate: 49544863
            },
            {
              stat_time: 1652600700000,
              rate: 49467691
            },
            {
              stat_time: 1652601000000,
              rate: 49216775
            },
            {
              stat_time: 1652601300000,
              rate: 49433036
            },
            {
              stat_time: 1652601600000,
              rate: 48375747
            },
            {
              stat_time: 1652601900000,
              rate: 46592737
            },
            {
              stat_time: 1652602200000,
              rate: 48789567
            },
            {
              stat_time: 1652602500000,
              rate: 48680754
            },
            {
              stat_time: 1652602800000,
              rate: 48512774
            },
            {
              stat_time: 1652603100000,
              rate: 49527122
            },
            {
              stat_time: 1652603400000,
              rate: 48723705
            },
            {
              stat_time: 1652603700000,
              rate: 48324787
            },
            {
              stat_time: 1652604000000,
              rate: 46695340
            },
            {
              stat_time: 1652604300000,
              rate: 47933425
            },
            {
              stat_time: 1652604600000,
              rate: 48526356
            },
            {
              stat_time: 1652604900000,
              rate: 48410775
            },
            {
              stat_time: 1652605200000,
              rate: 48526193
            },
            {
              stat_time: 1652605500000,
              rate: 48716345
            },
            {
              stat_time: 1652605800000,
              rate: 48473771
            },
            {
              stat_time: 1652606100000,
              rate: 48728770
            },
            {
              stat_time: 1652606400000,
              rate: 50446075
            },
            {
              stat_time: 1652606700000,
              rate: 50854376
            },
            {
              stat_time: 1652607000000,
              rate: 50981863
            },
            {
              stat_time: 1652607300000,
              rate: 51019977
            },
            {
              stat_time: 1652607600000,
              rate: 51359469
            },
            {
              stat_time: 1652607900000,
              rate: 52568453
            },
            {
              stat_time: 1652608200000,
              rate: 54058483
            },
            {
              stat_time: 1652608500000,
              rate: 53466258
            },
            {
              stat_time: 1652608800000,
              rate: 52039836
            },
            {
              stat_time: 1652609100000,
              rate: 52360322
            },
            {
              stat_time: 1652609400000,
              rate: 52855579
            },
            {
              stat_time: 1652609700000,
              rate: 52866074
            },
            {
              stat_time: 1652610000000,
              rate: 52981945
            },
            {
              stat_time: 1652610300000,
              rate: 51579715
            },
            {
              stat_time: 1652610600000,
              rate: 52291658
            },
            {
              stat_time: 1652610900000,
              rate: 52758547
            },
            {
              stat_time: 1652611200000,
              rate: 55003147
            },
            {
              stat_time: 1652611500000,
              rate: 56643555
            },
            {
              stat_time: 1652611800000,
              rate: 54727710
            },
            {
              stat_time: 1652612100000,
              rate: 57998594
            },
            {
              stat_time: 1652612400000,
              rate: 53340115
            },
            {
              stat_time: 1652612700000,
              rate: 58519563
            },
            {
              stat_time: 1652613000000,
              rate: 57299719
            },
            {
              stat_time: 1652613300000,
              rate: 57614166
            },
            {
              stat_time: 1652613600000,
              rate: 57569555
            },
            {
              stat_time: 1652613900000,
              rate: 57108456
            },
            {
              stat_time: 1652614200000,
              rate: 55940414
            },
            {
              stat_time: 1652614500000,
              rate: 56422300
            },
            {
              stat_time: 1652614800000,
              rate: 58067580
            },
            {
              stat_time: 1652615100000,
              rate: 59305259
            },
            {
              stat_time: 1652615400000,
              rate: 59620542
            },
            {
              stat_time: 1652615700000,
              rate: 59511278
            },
            {
              stat_time: 1652616000000,
              rate: 58682948
            },
            {
              stat_time: 1652616300000,
              rate: 59474819
            },
            {
              stat_time: 1652616600000,
              rate: 60495833
            },
            {
              stat_time: 1652616900000,
              rate: 61534299
            },
            {
              stat_time: 1652617200000,
              rate: 62552948
            },
            {
              stat_time: 1652617500000,
              rate: 61501072
            },
            {
              stat_time: 1652617800000,
              rate: 59650889
            },
            {
              stat_time: 1652618100000,
              rate: 58985415
            },
            {
              stat_time: 1652618400000,
              rate: 59255183
            },
            {
              stat_time: 1652618700000,
              rate: 60608863
            },
            {
              stat_time: 1652619000000,
              rate: 61438380
            },
            {
              stat_time: 1652619300000,
              rate: 62420546
            },
            {
              stat_time: 1652619600000,
              rate: 62590594
            },
            {
              stat_time: 1652619900000,
              rate: 62095950
            },
            {
              stat_time: 1652620200000,
              rate: 63718903
            },
            {
              stat_time: 1652620500000,
              rate: 68762818
            },
            {
              stat_time: 1652620800000,
              rate: 70489441
            },
            {
              stat_time: 1652621100000,
              rate: 73844737
            },
            {
              stat_time: 1652621400000,
              rate: 73487290
            },
            {
              stat_time: 1652621700000,
              rate: 73311188
            },
            {
              stat_time: 1652622000000,
              rate: 73917769
            },
            {
              stat_time: 1652622300000,
              rate: 73800247
            },
            {
              stat_time: 1652622600000,
              rate: 76146932
            },
            {
              stat_time: 1652622900000,
              rate: 75958696
            },
            {
              stat_time: 1652623200000,
              rate: 74467543
            },
            {
              stat_time: 1652623500000,
              rate: 73889830
            },
            {
              stat_time: 1652623800000,
              rate: 74735585
            },
            {
              stat_time: 1652624100000,
              rate: 75843471
            },
            {
              stat_time: 1652624400000,
              rate: 77786588
            },
            {
              stat_time: 1652624700000,
              rate: 76156466
            },
            {
              stat_time: 1652625000000,
              rate: 73335410
            },
            {
              stat_time: 1652625300000,
              rate: 71284149
            },
            {
              stat_time: 1652625600000,
              rate: 69296435
            },
            {
              stat_time: 1652625900000,
              rate: 68404328
            },
            {
              stat_time: 1652626200000,
              rate: 67259702
            },
            {
              stat_time: 1652626500000,
              rate: 68115684
            },
            {
              stat_time: 1652626800000,
              rate: 67191500
            },
            {
              stat_time: 1652627100000,
              rate: 65596427
            },
            {
              stat_time: 1652627400000,
              rate: 62699903
            },
            {
              stat_time: 1652627700000,
              rate: 61535977
            },
            {
              stat_time: 1652628000000,
              rate: 61218758
            },
            {
              stat_time: 1652628300000,
              rate: 68813468
            },
            {
              stat_time: 1652628600000,
              rate: 71614061
            },
            {
              stat_time: 1652628900000,
              rate: 72200135
            },
            {
              stat_time: 1652629200000,
              rate: 72648480
            },
            {
              stat_time: 1652629500000,
              rate: 71132614
            },
            {
              stat_time: 1652629800000,
              rate: 70650928
            },
            {
              stat_time: 1652630100000,
              rate: 70844773
            }
          ]
        },
        {
          dateArr: [
            {
              stat_time: 1652544000000,
              rate: 59770054
            },
            {
              stat_time: 1652544300000,
              rate: 57705198
            },
            {
              stat_time: 1652544600000,
              rate: 54907153
            },
            {
              stat_time: 1652544900000,
              rate: 53932331
            },
            {
              stat_time: 1652545200000,
              rate: 50820084
            },
            {
              stat_time: 1652545500000,
              rate: 48744453
            },
            {
              stat_time: 1652545800000,
              rate: 46345590
            },
            {
              stat_time: 1652546100000,
              rate: 45092019
            },
            {
              stat_time: 1652546400000,
              rate: 43861024
            },
            {
              stat_time: 1652546700000,
              rate: 42635307
            },
            {
              stat_time: 1652547000000,
              rate: 39513137
            },
            {
              stat_time: 1652547300000,
              rate: 37251858
            },
            {
              stat_time: 1652547600000,
              rate: 35641395
            },
            {
              stat_time: 1652547900000,
              rate: 32593269
            },
            {
              stat_time: 1652548200000,
              rate: 29854584
            },
            {
              stat_time: 1652548500000,
              rate: 26270305
            },
            {
              stat_time: 1652548800000,
              rate: 24115244
            },
            {
              stat_time: 1652549100000,
              rate: 22159263
            },
            {
              stat_time: 1652549400000,
              rate: 20260208
            },
            {
              stat_time: 1652549700000,
              rate: 19824773
            },
            {
              stat_time: 1652550000000,
              rate: 19364713
            },
            {
              stat_time: 1652550300000,
              rate: 18511395
            },
            {
              stat_time: 1652550600000,
              rate: 16811691
            },
            {
              stat_time: 1652550900000,
              rate: 14849281
            },
            {
              stat_time: 1652551200000,
              rate: 14545834
            },
            {
              stat_time: 1652551500000,
              rate: 12822215
            },
            {
              stat_time: 1652551800000,
              rate: 12061919
            },
            {
              stat_time: 1652552100000,
              rate: 11483505
            },
            {
              stat_time: 1652552400000,
              rate: 8830222
            },
            {
              stat_time: 1652552700000,
              rate: 8316519
            },
            {
              stat_time: 1652553000000,
              rate: 8039651
            },
            {
              stat_time: 1652553300000,
              rate: 7780729
            },
            {
              stat_time: 1652553600000,
              rate: 6873645
            },
            {
              stat_time: 1652553900000,
              rate: 6960513
            },
            {
              stat_time: 1652554200000,
              rate: 6890352
            },
            {
              stat_time: 1652554500000,
              rate: 6319387
            },
            {
              stat_time: 1652554800000,
              rate: 6160476
            },
            {
              stat_time: 1652555100000,
              rate: 6128487
            },
            {
              stat_time: 1652555400000,
              rate: 5727151
            },
            {
              stat_time: 1652555700000,
              rate: 5112335
            },
            {
              stat_time: 1652556000000,
              rate: 4916237
            },
            {
              stat_time: 1652556300000,
              rate: 4332243
            },
            {
              stat_time: 1652556600000,
              rate: 4182951
            },
            {
              stat_time: 1652556900000,
              rate: 3935808
            },
            {
              stat_time: 1652557200000,
              rate: 3780119
            },
            {
              stat_time: 1652557500000,
              rate: 4287550
            },
            {
              stat_time: 1652557800000,
              rate: 3708335
            },
            {
              stat_time: 1652558100000,
              rate: 3579655
            },
            {
              stat_time: 1652558400000,
              rate: 4024462
            },
            {
              stat_time: 1652558700000,
              rate: 4067459
            },
            {
              stat_time: 1652559000000,
              rate: 3701036
            },
            {
              stat_time: 1652559300000,
              rate: 3614789
            },
            {
              stat_time: 1652559600000,
              rate: 3467837
            },
            {
              stat_time: 1652559900000,
              rate: 2900363
            },
            {
              stat_time: 1652560200000,
              rate: 2888851
            },
            {
              stat_time: 1652560500000,
              rate: 2701209
            },
            {
              stat_time: 1652560800000,
              rate: 2779434
            },
            {
              stat_time: 1652561100000,
              rate: 2926322
            },
            {
              stat_time: 1652561400000,
              rate: 2800990
            },
            {
              stat_time: 1652561700000,
              rate: 3086460
            },
            {
              stat_time: 1652562000000,
              rate: 2923915
            },
            {
              stat_time: 1652562300000,
              rate: 3367917
            },
            {
              stat_time: 1652562600000,
              rate: 3151884
            },
            {
              stat_time: 1652562900000,
              rate: 3463305
            },
            {
              stat_time: 1652563200000,
              rate: 4434079
            },
            {
              stat_time: 1652563500000,
              rate: 5466455
            },
            {
              stat_time: 1652563800000,
              rate: 6526085
            },
            {
              stat_time: 1652564100000,
              rate: 5890882
            },
            {
              stat_time: 1652564400000,
              rate: 6135859
            },
            {
              stat_time: 1652564700000,
              rate: 6336279
            },
            {
              stat_time: 1652565000000,
              rate: 6743536
            },
            {
              stat_time: 1652565300000,
              rate: 7273884
            },
            {
              stat_time: 1652565600000,
              rate: 7708789
            },
            {
              stat_time: 1652565900000,
              rate: 8080154
            },
            {
              stat_time: 1652566200000,
              rate: 8531700
            },
            {
              stat_time: 1652566500000,
              rate: 9233987
            },
            {
              stat_time: 1652566800000,
              rate: 9548847
            },
            {
              stat_time: 1652567100000,
              rate: 9394714
            },
            {
              stat_time: 1652567400000,
              rate: 9831384
            },
            {
              stat_time: 1652567700000,
              rate: 10411296
            },
            {
              stat_time: 1652568000000,
              rate: 10623099
            },
            {
              stat_time: 1652568300000,
              rate: 11010882
            },
            {
              stat_time: 1652568600000,
              rate: 10873315
            },
            {
              stat_time: 1652568900000,
              rate: 9761416
            },
            {
              stat_time: 1652569200000,
              rate: 10714727
            },
            {
              stat_time: 1652569500000,
              rate: 10590923
            },
            {
              stat_time: 1652569800000,
              rate: 11436613
            },
            {
              stat_time: 1652570100000,
              rate: 11730266
            },
            {
              stat_time: 1652570400000,
              rate: 12201731
            },
            {
              stat_time: 1652570700000,
              rate: 13052837
            },
            {
              stat_time: 1652571000000,
              rate: 12543164
            },
            {
              stat_time: 1652571300000,
              rate: 12959328
            },
            {
              stat_time: 1652571600000,
              rate: 13441235
            },
            {
              stat_time: 1652571900000,
              rate: 13409372
            },
            {
              stat_time: 1652572200000,
              rate: 14348181
            },
            {
              stat_time: 1652572500000,
              rate: 15048904
            },
            {
              stat_time: 1652572800000,
              rate: 15171239
            },
            {
              stat_time: 1652573100000,
              rate: 16367221
            },
            {
              stat_time: 1652573400000,
              rate: 17738880
            },
            {
              stat_time: 1652573700000,
              rate: 19852960
            },
            {
              stat_time: 1652574000000,
              rate: 18871128
            },
            {
              stat_time: 1652574300000,
              rate: 19117694
            },
            {
              stat_time: 1652574600000,
              rate: 19353638
            },
            {
              stat_time: 1652574900000,
              rate: 20863662
            },
            {
              stat_time: 1652575200000,
              rate: 19640832
            },
            {
              stat_time: 1652575500000,
              rate: 20050025
            },
            {
              stat_time: 1652575800000,
              rate: 22865748
            },
            {
              stat_time: 1652576100000,
              rate: 23341169
            },
            {
              stat_time: 1652576400000,
              rate: 23340054
            },
            {
              stat_time: 1652576700000,
              rate: 22748911
            },
            {
              stat_time: 1652577000000,
              rate: 19992563
            },
            {
              stat_time: 1652577300000,
              rate: 20559226
            },
            {
              stat_time: 1652577600000,
              rate: 22854285
            },
            {
              stat_time: 1652577900000,
              rate: 23906020
            },
            {
              stat_time: 1652578200000,
              rate: 24086505
            },
            {
              stat_time: 1652578500000,
              rate: 22715176
            },
            {
              stat_time: 1652578800000,
              rate: 23369407
            },
            {
              stat_time: 1652579100000,
              rate: 25487989
            },
            {
              stat_time: 1652579400000,
              rate: 26631762
            },
            {
              stat_time: 1652579700000,
              rate: 28738473
            },
            {
              stat_time: 1652580000000,
              rate: 30735243
            },
            {
              stat_time: 1652580300000,
              rate: 31611725
            },
            {
              stat_time: 1652580600000,
              rate: 31680369
            },
            {
              stat_time: 1652580900000,
              rate: 31233004
            },
            {
              stat_time: 1652581200000,
              rate: 32772112
            },
            {
              stat_time: 1652581500000,
              rate: 34210528
            },
            {
              stat_time: 1652581800000,
              rate: 35654000
            },
            {
              stat_time: 1652582100000,
              rate: 36687596
            },
            {
              stat_time: 1652582400000,
              rate: 36746922
            },
            {
              stat_time: 1652582700000,
              rate: 39254800
            },
            {
              stat_time: 1652583000000,
              rate: 39595388
            },
            {
              stat_time: 1652583300000,
              rate: 39972111
            },
            {
              stat_time: 1652583600000,
              rate: 40791647
            },
            {
              stat_time: 1652583900000,
              rate: 40963501
            },
            {
              stat_time: 1652584200000,
              rate: 42358692
            },
            {
              stat_time: 1652584500000,
              rate: 43856693
            },
            {
              stat_time: 1652584800000,
              rate: 44100684
            },
            {
              stat_time: 1652585100000,
              rate: 44437389
            },
            {
              stat_time: 1652585400000,
              rate: 45596587
            },
            {
              stat_time: 1652585700000,
              rate: 46154917
            },
            {
              stat_time: 1652586000000,
              rate: 45960880
            },
            {
              stat_time: 1652586300000,
              rate: 46431276
            },
            {
              stat_time: 1652586600000,
              rate: 49023068
            },
            {
              stat_time: 1652586900000,
              rate: 49592063
            },
            {
              stat_time: 1652587200000,
              rate: 50716723
            },
            {
              stat_time: 1652587500000,
              rate: 53741920
            },
            {
              stat_time: 1652587800000,
              rate: 56175285
            },
            {
              stat_time: 1652588100000,
              rate: 57680307
            },
            {
              stat_time: 1652588400000,
              rate: 59134913
            },
            {
              stat_time: 1652588700000,
              rate: 57337066
            },
            {
              stat_time: 1652589000000,
              rate: 57983261
            },
            {
              stat_time: 1652589300000,
              rate: 56700289
            },
            {
              stat_time: 1652589600000,
              rate: 55878496
            },
            {
              stat_time: 1652589900000,
              rate: 57804474
            },
            {
              stat_time: 1652590200000,
              rate: 58609166
            },
            {
              stat_time: 1652590500000,
              rate: 58516659
            },
            {
              stat_time: 1652590800000,
              rate: 56948867
            },
            {
              stat_time: 1652591100000,
              rate: 56219935
            },
            {
              stat_time: 1652591400000,
              rate: 54505463
            },
            {
              stat_time: 1652591700000,
              rate: 53446587
            },
            {
              stat_time: 1652592000000,
              rate: 52340375
            },
            {
              stat_time: 1652592300000,
              rate: 52356666
            },
            {
              stat_time: 1652592600000,
              rate: 51244146
            },
            {
              stat_time: 1652592900000,
              rate: 53680531
            },
            {
              stat_time: 1652593200000,
              rate: 54533580
            },
            {
              stat_time: 1652593500000,
              rate: 53306910
            },
            {
              stat_time: 1652593800000,
              rate: 52354353
            },
            {
              stat_time: 1652594100000,
              rate: 49977580
            },
            {
              stat_time: 1652594400000,
              rate: 46621574
            },
            {
              stat_time: 1652594700000,
              rate: 47127087
            },
            {
              stat_time: 1652595000000,
              rate: 49461339
            },
            {
              stat_time: 1652595300000,
              rate: 51031827
            },
            {
              stat_time: 1652595600000,
              rate: 51476867
            },
            {
              stat_time: 1652595900000,
              rate: 53283867
            },
            {
              stat_time: 1652596200000,
              rate: 54061215
            },
            {
              stat_time: 1652596500000,
              rate: 54541970
            },
            {
              stat_time: 1652596800000,
              rate: 55083629
            },
            {
              stat_time: 1652597100000,
              rate: 55246097
            },
            {
              stat_time: 1652597400000,
              rate: 53191619
            },
            {
              stat_time: 1652597700000,
              rate: 50731653
            },
            {
              stat_time: 1652598000000,
              rate: 51200237
            },
            {
              stat_time: 1652598300000,
              rate: 51534337
            },
            {
              stat_time: 1652598600000,
              rate: 50598044
            },
            {
              stat_time: 1652598900000,
              rate: 49776256
            },
            {
              stat_time: 1652599200000,
              rate: 49547090
            },
            {
              stat_time: 1652599500000,
              rate: 48760323
            },
            {
              stat_time: 1652599800000,
              rate: 48296686
            },
            {
              stat_time: 1652600100000,
              rate: 46449632
            },
            {
              stat_time: 1652600400000,
              rate: 49544863
            },
            {
              stat_time: 1652600700000,
              rate: 49467691
            },
            {
              stat_time: 1652601000000,
              rate: 49216775
            },
            {
              stat_time: 1652601300000,
              rate: 49433036
            },
            {
              stat_time: 1652601600000,
              rate: 48375747
            },
            {
              stat_time: 1652601900000,
              rate: 46592737
            },
            {
              stat_time: 1652602200000,
              rate: 48789567
            },
            {
              stat_time: 1652602500000,
              rate: 48680754
            },
            {
              stat_time: 1652602800000,
              rate: 48512774
            },
            {
              stat_time: 1652603100000,
              rate: 49527122
            },
            {
              stat_time: 1652603400000,
              rate: 48723705
            },
            {
              stat_time: 1652603700000,
              rate: 48324787
            },
            {
              stat_time: 1652604000000,
              rate: 46695340
            },
            {
              stat_time: 1652604300000,
              rate: 47933425
            },
            {
              stat_time: 1652604600000,
              rate: 48526356
            },
            {
              stat_time: 1652604900000,
              rate: 48410775
            },
            {
              stat_time: 1652605200000,
              rate: 48526193
            },
            {
              stat_time: 1652605500000,
              rate: 48716345
            },
            {
              stat_time: 1652605800000,
              rate: 48473771
            },
            {
              stat_time: 1652606100000,
              rate: 48728770
            },
            {
              stat_time: 1652606400000,
              rate: 50446075
            },
            {
              stat_time: 1652606700000,
              rate: 50854376
            },
            {
              stat_time: 1652607000000,
              rate: 50981863
            },
            {
              stat_time: 1652607300000,
              rate: 51019977
            },
            {
              stat_time: 1652607600000,
              rate: 51359469
            },
            {
              stat_time: 1652607900000,
              rate: 52568453
            },
            {
              stat_time: 1652608200000,
              rate: 54058483
            },
            {
              stat_time: 1652608500000,
              rate: 53466258
            },
            {
              stat_time: 1652608800000,
              rate: 52039836
            },
            {
              stat_time: 1652609100000,
              rate: 52360322
            },
            {
              stat_time: 1652609400000,
              rate: 52855579
            },
            {
              stat_time: 1652609700000,
              rate: 52866074
            },
            {
              stat_time: 1652610000000,
              rate: 52981945
            },
            {
              stat_time: 1652610300000,
              rate: 51579715
            },
            {
              stat_time: 1652610600000,
              rate: 52291658
            },
            {
              stat_time: 1652610900000,
              rate: 52758547
            },
            {
              stat_time: 1652611200000,
              rate: 55003147
            },
            {
              stat_time: 1652611500000,
              rate: 56643555
            },
            {
              stat_time: 1652611800000,
              rate: 54727710
            },
            {
              stat_time: 1652612100000,
              rate: 57998594
            },
            {
              stat_time: 1652612400000,
              rate: 53340115
            },
            {
              stat_time: 1652612700000,
              rate: 58519563
            },
            {
              stat_time: 1652613000000,
              rate: 57299719
            },
            {
              stat_time: 1652613300000,
              rate: 57614166
            },
            {
              stat_time: 1652613600000,
              rate: 57569555
            },
            {
              stat_time: 1652613900000,
              rate: 57108456
            },
            {
              stat_time: 1652614200000,
              rate: 55940414
            },
            {
              stat_time: 1652614500000,
              rate: 56422300
            },
            {
              stat_time: 1652614800000,
              rate: 58067580
            },
            {
              stat_time: 1652615100000,
              rate: 59305259
            },
            {
              stat_time: 1652615400000,
              rate: 59620542
            },
            {
              stat_time: 1652615700000,
              rate: 59511278
            },
            {
              stat_time: 1652616000000,
              rate: 58682948
            },
            {
              stat_time: 1652616300000,
              rate: 59474819
            },
            {
              stat_time: 1652616600000,
              rate: 60495833
            },
            {
              stat_time: 1652616900000,
              rate: 61534299
            },
            {
              stat_time: 1652617200000,
              rate: 62552948
            },
            {
              stat_time: 1652617500000,
              rate: 61501072
            },
            {
              stat_time: 1652617800000,
              rate: 59650889
            },
            {
              stat_time: 1652618100000,
              rate: 58985415
            },
            {
              stat_time: 1652618400000,
              rate: 59255183
            },
            {
              stat_time: 1652618700000,
              rate: 60608863
            },
            {
              stat_time: 1652619000000,
              rate: 61438380
            },
            {
              stat_time: 1652619300000,
              rate: 62420546
            },
            {
              stat_time: 1652619600000,
              rate: 62590594
            },
            {
              stat_time: 1652619900000,
              rate: 62095950
            },
            {
              stat_time: 1652620200000,
              rate: 63718903
            },
            {
              stat_time: 1652620500000,
              rate: 68762818
            },
            {
              stat_time: 1652620800000,
              rate: 70489441
            },
            {
              stat_time: 1652621100000,
              rate: 73844737
            },
            {
              stat_time: 1652621400000,
              rate: 73487290
            },
            {
              stat_time: 1652621700000,
              rate: 73311188
            },
            {
              stat_time: 1652622000000,
              rate: 73917769
            },
            {
              stat_time: 1652622300000,
              rate: 73800247
            },
            {
              stat_time: 1652622600000,
              rate: 76146932
            },
            {
              stat_time: 1652622900000,
              rate: 75958696
            },
            {
              stat_time: 1652623200000,
              rate: 74467543
            },
            {
              stat_time: 1652623500000,
              rate: 73889830
            },
            {
              stat_time: 1652623800000,
              rate: 74735585
            },
            {
              stat_time: 1652624100000,
              rate: 75843471
            },
            {
              stat_time: 1652624400000,
              rate: 77786588
            },
            {
              stat_time: 1652624700000,
              rate: 76156466
            },
            {
              stat_time: 1652625000000,
              rate: 73335410
            },
            {
              stat_time: 1652625300000,
              rate: 71284149
            },
            {
              stat_time: 1652625600000,
              rate: 69296435
            },
            {
              stat_time: 1652625900000,
              rate: 68404328
            },
            {
              stat_time: 1652626200000,
              rate: 67259702
            },
            {
              stat_time: 1652626500000,
              rate: 68115684
            },
            {
              stat_time: 1652626800000,
              rate: 67191500
            },
            {
              stat_time: 1652627100000,
              rate: 65596427
            },
            {
              stat_time: 1652627400000,
              rate: 62699903
            },
            {
              stat_time: 1652627700000,
              rate: 61535977
            },
            {
              stat_time: 1652628000000,
              rate: 61218758
            },
            {
              stat_time: 1652628300000,
              rate: 68813468
            },
            {
              stat_time: 1652628600000,
              rate: 71614061
            },
            {
              stat_time: 1652628900000,
              rate: 72200135
            },
            {
              stat_time: 1652629200000,
              rate: 72648480
            },
            {
              stat_time: 1652629500000,
              rate: 71132614
            },
            {
              stat_time: 1652629800000,
              rate: 70650928
            },
            {
              stat_time: 1652630100000,
              rate: 70844773
            }
          ]
        },
        {
          dateArr: [
            {
              stat_time: 1652544000000,
              rate: 59770054
            },
            {
              stat_time: 1652544300000,
              rate: 57705198
            },
            {
              stat_time: 1652544600000,
              rate: 54907153
            },
            {
              stat_time: 1652544900000,
              rate: 53932331
            },
            {
              stat_time: 1652545200000,
              rate: 50820084
            },
            {
              stat_time: 1652545500000,
              rate: 48744453
            },
            {
              stat_time: 1652545800000,
              rate: 46345590
            },
            {
              stat_time: 1652546100000,
              rate: 45092019
            },
            {
              stat_time: 1652546400000,
              rate: 43861024
            },
            {
              stat_time: 1652546700000,
              rate: 42635307
            },
            {
              stat_time: 1652547000000,
              rate: 39513137
            },
            {
              stat_time: 1652547300000,
              rate: 37251858
            },
            {
              stat_time: 1652547600000,
              rate: 35641395
            },
            {
              stat_time: 1652547900000,
              rate: 32593269
            },
            {
              stat_time: 1652548200000,
              rate: 29854584
            },
            {
              stat_time: 1652548500000,
              rate: 26270305
            },
            {
              stat_time: 1652548800000,
              rate: 24115244
            },
            {
              stat_time: 1652549100000,
              rate: 22159263
            },
            {
              stat_time: 1652549400000,
              rate: 20260208
            },
            {
              stat_time: 1652549700000,
              rate: 19824773
            },
            {
              stat_time: 1652550000000,
              rate: 19364713
            },
            {
              stat_time: 1652550300000,
              rate: 18511395
            },
            {
              stat_time: 1652550600000,
              rate: 16811691
            },
            {
              stat_time: 1652550900000,
              rate: 14849281
            },
            {
              stat_time: 1652551200000,
              rate: 14545834
            },
            {
              stat_time: 1652551500000,
              rate: 12822215
            },
            {
              stat_time: 1652551800000,
              rate: 12061919
            },
            {
              stat_time: 1652552100000,
              rate: 11483505
            },
            {
              stat_time: 1652552400000,
              rate: 8830222
            },
            {
              stat_time: 1652552700000,
              rate: 8316519
            },
            {
              stat_time: 1652553000000,
              rate: 8039651
            },
            {
              stat_time: 1652553300000,
              rate: 7780729
            },
            {
              stat_time: 1652553600000,
              rate: 6873645
            },
            {
              stat_time: 1652553900000,
              rate: 6960513
            },
            {
              stat_time: 1652554200000,
              rate: 6890352
            },
            {
              stat_time: 1652554500000,
              rate: 6319387
            },
            {
              stat_time: 1652554800000,
              rate: 6160476
            },
            {
              stat_time: 1652555100000,
              rate: 6128487
            },
            {
              stat_time: 1652555400000,
              rate: 5727151
            },
            {
              stat_time: 1652555700000,
              rate: 5112335
            },
            {
              stat_time: 1652556000000,
              rate: 4916237
            },
            {
              stat_time: 1652556300000,
              rate: 4332243
            },
            {
              stat_time: 1652556600000,
              rate: 4182951
            },
            {
              stat_time: 1652556900000,
              rate: 3935808
            },
            {
              stat_time: 1652557200000,
              rate: 3780119
            },
            {
              stat_time: 1652557500000,
              rate: 4287550
            },
            {
              stat_time: 1652557800000,
              rate: 3708335
            },
            {
              stat_time: 1652558100000,
              rate: 3579655
            },
            {
              stat_time: 1652558400000,
              rate: 4024462
            },
            {
              stat_time: 1652558700000,
              rate: 4067459
            },
            {
              stat_time: 1652559000000,
              rate: 3701036
            },
            {
              stat_time: 1652559300000,
              rate: 3614789
            },
            {
              stat_time: 1652559600000,
              rate: 3467837
            },
            {
              stat_time: 1652559900000,
              rate: 2900363
            },
            {
              stat_time: 1652560200000,
              rate: 2888851
            },
            {
              stat_time: 1652560500000,
              rate: 2701209
            },
            {
              stat_time: 1652560800000,
              rate: 2779434
            },
            {
              stat_time: 1652561100000,
              rate: 2926322
            },
            {
              stat_time: 1652561400000,
              rate: 2800990
            },
            {
              stat_time: 1652561700000,
              rate: 3086460
            },
            {
              stat_time: 1652562000000,
              rate: 2923915
            },
            {
              stat_time: 1652562300000,
              rate: 3367917
            },
            {
              stat_time: 1652562600000,
              rate: 3151884
            },
            {
              stat_time: 1652562900000,
              rate: 3463305
            },
            {
              stat_time: 1652563200000,
              rate: 4434079
            },
            {
              stat_time: 1652563500000,
              rate: 5466455
            },
            {
              stat_time: 1652563800000,
              rate: 6526085
            },
            {
              stat_time: 1652564100000,
              rate: 5890882
            },
            {
              stat_time: 1652564400000,
              rate: 6135859
            },
            {
              stat_time: 1652564700000,
              rate: 6336279
            },
            {
              stat_time: 1652565000000,
              rate: 6743536
            },
            {
              stat_time: 1652565300000,
              rate: 7273884
            },
            {
              stat_time: 1652565600000,
              rate: 7708789
            },
            {
              stat_time: 1652565900000,
              rate: 8080154
            },
            {
              stat_time: 1652566200000,
              rate: 8531700
            },
            {
              stat_time: 1652566500000,
              rate: 9233987
            },
            {
              stat_time: 1652566800000,
              rate: 9548847
            },
            {
              stat_time: 1652567100000,
              rate: 9394714
            },
            {
              stat_time: 1652567400000,
              rate: 9831384
            },
            {
              stat_time: 1652567700000,
              rate: 10411296
            },
            {
              stat_time: 1652568000000,
              rate: 10623099
            },
            {
              stat_time: 1652568300000,
              rate: 11010882
            },
            {
              stat_time: 1652568600000,
              rate: 10873315
            },
            {
              stat_time: 1652568900000,
              rate: 9761416
            },
            {
              stat_time: 1652569200000,
              rate: 10714727
            },
            {
              stat_time: 1652569500000,
              rate: 10590923
            },
            {
              stat_time: 1652569800000,
              rate: 11436613
            },
            {
              stat_time: 1652570100000,
              rate: 11730266
            },
            {
              stat_time: 1652570400000,
              rate: 12201731
            },
            {
              stat_time: 1652570700000,
              rate: 13052837
            },
            {
              stat_time: 1652571000000,
              rate: 12543164
            },
            {
              stat_time: 1652571300000,
              rate: 12959328
            },
            {
              stat_time: 1652571600000,
              rate: 13441235
            },
            {
              stat_time: 1652571900000,
              rate: 13409372
            },
            {
              stat_time: 1652572200000,
              rate: 14348181
            },
            {
              stat_time: 1652572500000,
              rate: 15048904
            },
            {
              stat_time: 1652572800000,
              rate: 15171239
            },
            {
              stat_time: 1652573100000,
              rate: 16367221
            },
            {
              stat_time: 1652573400000,
              rate: 17738880
            },
            {
              stat_time: 1652573700000,
              rate: 19852960
            },
            {
              stat_time: 1652574000000,
              rate: 18871128
            },
            {
              stat_time: 1652574300000,
              rate: 19117694
            },
            {
              stat_time: 1652574600000,
              rate: 19353638
            },
            {
              stat_time: 1652574900000,
              rate: 20863662
            },
            {
              stat_time: 1652575200000,
              rate: 19640832
            },
            {
              stat_time: 1652575500000,
              rate: 20050025
            },
            {
              stat_time: 1652575800000,
              rate: 22865748
            },
            {
              stat_time: 1652576100000,
              rate: 23341169
            },
            {
              stat_time: 1652576400000,
              rate: 23340054
            },
            {
              stat_time: 1652576700000,
              rate: 22748911
            },
            {
              stat_time: 1652577000000,
              rate: 19992563
            },
            {
              stat_time: 1652577300000,
              rate: 20559226
            },
            {
              stat_time: 1652577600000,
              rate: 22854285
            },
            {
              stat_time: 1652577900000,
              rate: 23906020
            },
            {
              stat_time: 1652578200000,
              rate: 24086505
            },
            {
              stat_time: 1652578500000,
              rate: 22715176
            },
            {
              stat_time: 1652578800000,
              rate: 23369407
            },
            {
              stat_time: 1652579100000,
              rate: 25487989
            },
            {
              stat_time: 1652579400000,
              rate: 26631762
            },
            {
              stat_time: 1652579700000,
              rate: 28738473
            },
            {
              stat_time: 1652580000000,
              rate: 30735243
            },
            {
              stat_time: 1652580300000,
              rate: 31611725
            },
            {
              stat_time: 1652580600000,
              rate: 31680369
            },
            {
              stat_time: 1652580900000,
              rate: 31233004
            },
            {
              stat_time: 1652581200000,
              rate: 32772112
            },
            {
              stat_time: 1652581500000,
              rate: 34210528
            },
            {
              stat_time: 1652581800000,
              rate: 35654000
            },
            {
              stat_time: 1652582100000,
              rate: 36687596
            },
            {
              stat_time: 1652582400000,
              rate: 36746922
            },
            {
              stat_time: 1652582700000,
              rate: 39254800
            },
            {
              stat_time: 1652583000000,
              rate: 39595388
            },
            {
              stat_time: 1652583300000,
              rate: 39972111
            },
            {
              stat_time: 1652583600000,
              rate: 40791647
            },
            {
              stat_time: 1652583900000,
              rate: 40963501
            },
            {
              stat_time: 1652584200000,
              rate: 42358692
            },
            {
              stat_time: 1652584500000,
              rate: 43856693
            },
            {
              stat_time: 1652584800000,
              rate: 44100684
            },
            {
              stat_time: 1652585100000,
              rate: 44437389
            },
            {
              stat_time: 1652585400000,
              rate: 45596587
            },
            {
              stat_time: 1652585700000,
              rate: 46154917
            },
            {
              stat_time: 1652586000000,
              rate: 45960880
            },
            {
              stat_time: 1652586300000,
              rate: 46431276
            },
            {
              stat_time: 1652586600000,
              rate: 49023068
            },
            {
              stat_time: 1652586900000,
              rate: 49592063
            },
            {
              stat_time: 1652587200000,
              rate: 50716723
            },
            {
              stat_time: 1652587500000,
              rate: 53741920
            },
            {
              stat_time: 1652587800000,
              rate: 56175285
            },
            {
              stat_time: 1652588100000,
              rate: 57680307
            },
            {
              stat_time: 1652588400000,
              rate: 59134913
            },
            {
              stat_time: 1652588700000,
              rate: 57337066
            },
            {
              stat_time: 1652589000000,
              rate: 57983261
            },
            {
              stat_time: 1652589300000,
              rate: 56700289
            },
            {
              stat_time: 1652589600000,
              rate: 55878496
            },
            {
              stat_time: 1652589900000,
              rate: 57804474
            },
            {
              stat_time: 1652590200000,
              rate: 58609166
            },
            {
              stat_time: 1652590500000,
              rate: 58516659
            },
            {
              stat_time: 1652590800000,
              rate: 56948867
            },
            {
              stat_time: 1652591100000,
              rate: 56219935
            },
            {
              stat_time: 1652591400000,
              rate: 54505463
            },
            {
              stat_time: 1652591700000,
              rate: 53446587
            },
            {
              stat_time: 1652592000000,
              rate: 52340375
            },
            {
              stat_time: 1652592300000,
              rate: 52356666
            },
            {
              stat_time: 1652592600000,
              rate: 51244146
            },
            {
              stat_time: 1652592900000,
              rate: 53680531
            },
            {
              stat_time: 1652593200000,
              rate: 54533580
            },
            {
              stat_time: 1652593500000,
              rate: 53306910
            },
            {
              stat_time: 1652593800000,
              rate: 52354353
            },
            {
              stat_time: 1652594100000,
              rate: 49977580
            },
            {
              stat_time: 1652594400000,
              rate: 46621574
            },
            {
              stat_time: 1652594700000,
              rate: 47127087
            },
            {
              stat_time: 1652595000000,
              rate: 49461339
            },
            {
              stat_time: 1652595300000,
              rate: 51031827
            },
            {
              stat_time: 1652595600000,
              rate: 51476867
            },
            {
              stat_time: 1652595900000,
              rate: 53283867
            },
            {
              stat_time: 1652596200000,
              rate: 54061215
            },
            {
              stat_time: 1652596500000,
              rate: 54541970
            },
            {
              stat_time: 1652596800000,
              rate: 55083629
            },
            {
              stat_time: 1652597100000,
              rate: 55246097
            },
            {
              stat_time: 1652597400000,
              rate: 53191619
            },
            {
              stat_time: 1652597700000,
              rate: 50731653
            },
            {
              stat_time: 1652598000000,
              rate: 51200237
            },
            {
              stat_time: 1652598300000,
              rate: 51534337
            },
            {
              stat_time: 1652598600000,
              rate: 50598044
            },
            {
              stat_time: 1652598900000,
              rate: 49776256
            },
            {
              stat_time: 1652599200000,
              rate: 49547090
            },
            {
              stat_time: 1652599500000,
              rate: 48760323
            },
            {
              stat_time: 1652599800000,
              rate: 48296686
            },
            {
              stat_time: 1652600100000,
              rate: 46449632
            },
            {
              stat_time: 1652600400000,
              rate: 49544863
            },
            {
              stat_time: 1652600700000,
              rate: 49467691
            },
            {
              stat_time: 1652601000000,
              rate: 49216775
            },
            {
              stat_time: 1652601300000,
              rate: 49433036
            },
            {
              stat_time: 1652601600000,
              rate: 48375747
            },
            {
              stat_time: 1652601900000,
              rate: 46592737
            },
            {
              stat_time: 1652602200000,
              rate: 48789567
            },
            {
              stat_time: 1652602500000,
              rate: 48680754
            },
            {
              stat_time: 1652602800000,
              rate: 48512774
            },
            {
              stat_time: 1652603100000,
              rate: 49527122
            },
            {
              stat_time: 1652603400000,
              rate: 48723705
            },
            {
              stat_time: 1652603700000,
              rate: 48324787
            },
            {
              stat_time: 1652604000000,
              rate: 46695340
            },
            {
              stat_time: 1652604300000,
              rate: 47933425
            },
            {
              stat_time: 1652604600000,
              rate: 48526356
            },
            {
              stat_time: 1652604900000,
              rate: 48410775
            },
            {
              stat_time: 1652605200000,
              rate: 48526193
            },
            {
              stat_time: 1652605500000,
              rate: 48716345
            },
            {
              stat_time: 1652605800000,
              rate: 48473771
            },
            {
              stat_time: 1652606100000,
              rate: 48728770
            },
            {
              stat_time: 1652606400000,
              rate: 50446075
            },
            {
              stat_time: 1652606700000,
              rate: 50854376
            },
            {
              stat_time: 1652607000000,
              rate: 50981863
            },
            {
              stat_time: 1652607300000,
              rate: 51019977
            },
            {
              stat_time: 1652607600000,
              rate: 51359469
            },
            {
              stat_time: 1652607900000,
              rate: 52568453
            },
            {
              stat_time: 1652608200000,
              rate: 54058483
            },
            {
              stat_time: 1652608500000,
              rate: 53466258
            },
            {
              stat_time: 1652608800000,
              rate: 52039836
            },
            {
              stat_time: 1652609100000,
              rate: 52360322
            },
            {
              stat_time: 1652609400000,
              rate: 52855579
            },
            {
              stat_time: 1652609700000,
              rate: 52866074
            },
            {
              stat_time: 1652610000000,
              rate: 52981945
            },
            {
              stat_time: 1652610300000,
              rate: 51579715
            },
            {
              stat_time: 1652610600000,
              rate: 52291658
            },
            {
              stat_time: 1652610900000,
              rate: 52758547
            },
            {
              stat_time: 1652611200000,
              rate: 55003147
            },
            {
              stat_time: 1652611500000,
              rate: 56643555
            },
            {
              stat_time: 1652611800000,
              rate: 54727710
            },
            {
              stat_time: 1652612100000,
              rate: 57998594
            },
            {
              stat_time: 1652612400000,
              rate: 53340115
            },
            {
              stat_time: 1652612700000,
              rate: 58519563
            },
            {
              stat_time: 1652613000000,
              rate: 57299719
            },
            {
              stat_time: 1652613300000,
              rate: 57614166
            },
            {
              stat_time: 1652613600000,
              rate: 57569555
            },
            {
              stat_time: 1652613900000,
              rate: 57108456
            },
            {
              stat_time: 1652614200000,
              rate: 55940414
            },
            {
              stat_time: 1652614500000,
              rate: 56422300
            },
            {
              stat_time: 1652614800000,
              rate: 58067580
            },
            {
              stat_time: 1652615100000,
              rate: 59305259
            },
            {
              stat_time: 1652615400000,
              rate: 59620542
            },
            {
              stat_time: 1652615700000,
              rate: 59511278
            },
            {
              stat_time: 1652616000000,
              rate: 58682948
            },
            {
              stat_time: 1652616300000,
              rate: 59474819
            },
            {
              stat_time: 1652616600000,
              rate: 60495833
            },
            {
              stat_time: 1652616900000,
              rate: 61534299
            },
            {
              stat_time: 1652617200000,
              rate: 62552948
            },
            {
              stat_time: 1652617500000,
              rate: 61501072
            },
            {
              stat_time: 1652617800000,
              rate: 59650889
            },
            {
              stat_time: 1652618100000,
              rate: 58985415
            },
            {
              stat_time: 1652618400000,
              rate: 59255183
            },
            {
              stat_time: 1652618700000,
              rate: 60608863
            },
            {
              stat_time: 1652619000000,
              rate: 61438380
            },
            {
              stat_time: 1652619300000,
              rate: 62420546
            },
            {
              stat_time: 1652619600000,
              rate: 62590594
            },
            {
              stat_time: 1652619900000,
              rate: 62095950
            },
            {
              stat_time: 1652620200000,
              rate: 63718903
            },
            {
              stat_time: 1652620500000,
              rate: 68762818
            },
            {
              stat_time: 1652620800000,
              rate: 70489441
            },
            {
              stat_time: 1652621100000,
              rate: 73844737
            },
            {
              stat_time: 1652621400000,
              rate: 73487290
            },
            {
              stat_time: 1652621700000,
              rate: 73311188
            },
            {
              stat_time: 1652622000000,
              rate: 73917769
            },
            {
              stat_time: 1652622300000,
              rate: 73800247
            },
            {
              stat_time: 1652622600000,
              rate: 76146932
            },
            {
              stat_time: 1652622900000,
              rate: 75958696
            },
            {
              stat_time: 1652623200000,
              rate: 74467543
            },
            {
              stat_time: 1652623500000,
              rate: 73889830
            },
            {
              stat_time: 1652623800000,
              rate: 74735585
            },
            {
              stat_time: 1652624100000,
              rate: 75843471
            },
            {
              stat_time: 1652624400000,
              rate: 77786588
            },
            {
              stat_time: 1652624700000,
              rate: 76156466
            },
            {
              stat_time: 1652625000000,
              rate: 73335410
            },
            {
              stat_time: 1652625300000,
              rate: 71284149
            },
            {
              stat_time: 1652625600000,
              rate: 69296435
            },
            {
              stat_time: 1652625900000,
              rate: 68404328
            },
            {
              stat_time: 1652626200000,
              rate: 67259702
            },
            {
              stat_time: 1652626500000,
              rate: 68115684
            },
            {
              stat_time: 1652626800000,
              rate: 67191500
            },
            {
              stat_time: 1652627100000,
              rate: 65596427
            },
            {
              stat_time: 1652627400000,
              rate: 62699903
            },
            {
              stat_time: 1652627700000,
              rate: 61535977
            },
            {
              stat_time: 1652628000000,
              rate: 61218758
            },
            {
              stat_time: 1652628300000,
              rate: 68813468
            },
            {
              stat_time: 1652628600000,
              rate: 71614061
            },
            {
              stat_time: 1652628900000,
              rate: 72200135
            },
            {
              stat_time: 1652629200000,
              rate: 72648480
            },
            {
              stat_time: 1652629500000,
              rate: 71132614
            },
            {
              stat_time: 1652629800000,
              rate: 70650928
            },
            {
              stat_time: 1652630100000,
              rate: 70844773
            }
          ]
        },
        {
          dateArr: [
            {
              stat_time: 1652544000000,
              rate: 59770054
            },
            {
              stat_time: 1652544300000,
              rate: 57705198
            },
            {
              stat_time: 1652544600000,
              rate: 54907153
            },
            {
              stat_time: 1652544900000,
              rate: 53932331
            },
            {
              stat_time: 1652545200000,
              rate: 50820084
            },
            {
              stat_time: 1652545500000,
              rate: 48744453
            },
            {
              stat_time: 1652545800000,
              rate: 46345590
            },
            {
              stat_time: 1652546100000,
              rate: 45092019
            },
            {
              stat_time: 1652546400000,
              rate: 43861024
            },
            {
              stat_time: 1652546700000,
              rate: 42635307
            },
            {
              stat_time: 1652547000000,
              rate: 39513137
            },
            {
              stat_time: 1652547300000,
              rate: 37251858
            },
            {
              stat_time: 1652547600000,
              rate: 35641395
            },
            {
              stat_time: 1652547900000,
              rate: 32593269
            },
            {
              stat_time: 1652548200000,
              rate: 29854584
            },
            {
              stat_time: 1652548500000,
              rate: 26270305
            },
            {
              stat_time: 1652548800000,
              rate: 24115244
            },
            {
              stat_time: 1652549100000,
              rate: 22159263
            },
            {
              stat_time: 1652549400000,
              rate: 20260208
            },
            {
              stat_time: 1652549700000,
              rate: 19824773
            },
            {
              stat_time: 1652550000000,
              rate: 19364713
            },
            {
              stat_time: 1652550300000,
              rate: 18511395
            },
            {
              stat_time: 1652550600000,
              rate: 16811691
            },
            {
              stat_time: 1652550900000,
              rate: 14849281
            },
            {
              stat_time: 1652551200000,
              rate: 14545834
            },
            {
              stat_time: 1652551500000,
              rate: 12822215
            },
            {
              stat_time: 1652551800000,
              rate: 12061919
            },
            {
              stat_time: 1652552100000,
              rate: 11483505
            },
            {
              stat_time: 1652552400000,
              rate: 8830222
            },
            {
              stat_time: 1652552700000,
              rate: 8316519
            },
            {
              stat_time: 1652553000000,
              rate: 8039651
            },
            {
              stat_time: 1652553300000,
              rate: 7780729
            },
            {
              stat_time: 1652553600000,
              rate: 6873645
            },
            {
              stat_time: 1652553900000,
              rate: 6960513
            },
            {
              stat_time: 1652554200000,
              rate: 6890352
            },
            {
              stat_time: 1652554500000,
              rate: 6319387
            },
            {
              stat_time: 1652554800000,
              rate: 6160476
            },
            {
              stat_time: 1652555100000,
              rate: 6128487
            },
            {
              stat_time: 1652555400000,
              rate: 5727151
            },
            {
              stat_time: 1652555700000,
              rate: 5112335
            },
            {
              stat_time: 1652556000000,
              rate: 4916237
            },
            {
              stat_time: 1652556300000,
              rate: 4332243
            },
            {
              stat_time: 1652556600000,
              rate: 4182951
            },
            {
              stat_time: 1652556900000,
              rate: 3935808
            },
            {
              stat_time: 1652557200000,
              rate: 3780119
            },
            {
              stat_time: 1652557500000,
              rate: 4287550
            },
            {
              stat_time: 1652557800000,
              rate: 3708335
            },
            {
              stat_time: 1652558100000,
              rate: 3579655
            },
            {
              stat_time: 1652558400000,
              rate: 4024462
            },
            {
              stat_time: 1652558700000,
              rate: 4067459
            },
            {
              stat_time: 1652559000000,
              rate: 3701036
            },
            {
              stat_time: 1652559300000,
              rate: 3614789
            },
            {
              stat_time: 1652559600000,
              rate: 3467837
            },
            {
              stat_time: 1652559900000,
              rate: 2900363
            },
            {
              stat_time: 1652560200000,
              rate: 2888851
            },
            {
              stat_time: 1652560500000,
              rate: 2701209
            },
            {
              stat_time: 1652560800000,
              rate: 2779434
            },
            {
              stat_time: 1652561100000,
              rate: 2926322
            },
            {
              stat_time: 1652561400000,
              rate: 2800990
            },
            {
              stat_time: 1652561700000,
              rate: 3086460
            },
            {
              stat_time: 1652562000000,
              rate: 2923915
            },
            {
              stat_time: 1652562300000,
              rate: 3367917
            },
            {
              stat_time: 1652562600000,
              rate: 3151884
            },
            {
              stat_time: 1652562900000,
              rate: 3463305
            },
            {
              stat_time: 1652563200000,
              rate: 4434079
            },
            {
              stat_time: 1652563500000,
              rate: 5466455
            },
            {
              stat_time: 1652563800000,
              rate: 6526085
            },
            {
              stat_time: 1652564100000,
              rate: 5890882
            },
            {
              stat_time: 1652564400000,
              rate: 6135859
            },
            {
              stat_time: 1652564700000,
              rate: 6336279
            },
            {
              stat_time: 1652565000000,
              rate: 6743536
            },
            {
              stat_time: 1652565300000,
              rate: 7273884
            },
            {
              stat_time: 1652565600000,
              rate: 7708789
            },
            {
              stat_time: 1652565900000,
              rate: 8080154
            },
            {
              stat_time: 1652566200000,
              rate: 8531700
            },
            {
              stat_time: 1652566500000,
              rate: 9233987
            },
            {
              stat_time: 1652566800000,
              rate: 9548847
            },
            {
              stat_time: 1652567100000,
              rate: 9394714
            },
            {
              stat_time: 1652567400000,
              rate: 9831384
            },
            {
              stat_time: 1652567700000,
              rate: 10411296
            },
            {
              stat_time: 1652568000000,
              rate: 10623099
            },
            {
              stat_time: 1652568300000,
              rate: 11010882
            },
            {
              stat_time: 1652568600000,
              rate: 10873315
            },
            {
              stat_time: 1652568900000,
              rate: 9761416
            },
            {
              stat_time: 1652569200000,
              rate: 10714727
            },
            {
              stat_time: 1652569500000,
              rate: 10590923
            },
            {
              stat_time: 1652569800000,
              rate: 11436613
            },
            {
              stat_time: 1652570100000,
              rate: 11730266
            },
            {
              stat_time: 1652570400000,
              rate: 12201731
            },
            {
              stat_time: 1652570700000,
              rate: 13052837
            },
            {
              stat_time: 1652571000000,
              rate: 12543164
            },
            {
              stat_time: 1652571300000,
              rate: 12959328
            },
            {
              stat_time: 1652571600000,
              rate: 13441235
            },
            {
              stat_time: 1652571900000,
              rate: 13409372
            },
            {
              stat_time: 1652572200000,
              rate: 14348181
            },
            {
              stat_time: 1652572500000,
              rate: 15048904
            },
            {
              stat_time: 1652572800000,
              rate: 15171239
            },
            {
              stat_time: 1652573100000,
              rate: 16367221
            },
            {
              stat_time: 1652573400000,
              rate: 17738880
            },
            {
              stat_time: 1652573700000,
              rate: 19852960
            },
            {
              stat_time: 1652574000000,
              rate: 18871128
            },
            {
              stat_time: 1652574300000,
              rate: 19117694
            },
            {
              stat_time: 1652574600000,
              rate: 19353638
            },
            {
              stat_time: 1652574900000,
              rate: 20863662
            },
            {
              stat_time: 1652575200000,
              rate: 19640832
            },
            {
              stat_time: 1652575500000,
              rate: 20050025
            },
            {
              stat_time: 1652575800000,
              rate: 22865748
            },
            {
              stat_time: 1652576100000,
              rate: 23341169
            },
            {
              stat_time: 1652576400000,
              rate: 23340054
            },
            {
              stat_time: 1652576700000,
              rate: 22748911
            },
            {
              stat_time: 1652577000000,
              rate: 19992563
            },
            {
              stat_time: 1652577300000,
              rate: 20559226
            },
            {
              stat_time: 1652577600000,
              rate: 22854285
            },
            {
              stat_time: 1652577900000,
              rate: 23906020
            },
            {
              stat_time: 1652578200000,
              rate: 24086505
            },
            {
              stat_time: 1652578500000,
              rate: 22715176
            },
            {
              stat_time: 1652578800000,
              rate: 23369407
            },
            {
              stat_time: 1652579100000,
              rate: 25487989
            },
            {
              stat_time: 1652579400000,
              rate: 26631762
            },
            {
              stat_time: 1652579700000,
              rate: 28738473
            },
            {
              stat_time: 1652580000000,
              rate: 30735243
            },
            {
              stat_time: 1652580300000,
              rate: 31611725
            },
            {
              stat_time: 1652580600000,
              rate: 31680369
            },
            {
              stat_time: 1652580900000,
              rate: 31233004
            },
            {
              stat_time: 1652581200000,
              rate: 32772112
            },
            {
              stat_time: 1652581500000,
              rate: 34210528
            },
            {
              stat_time: 1652581800000,
              rate: 35654000
            },
            {
              stat_time: 1652582100000,
              rate: 36687596
            },
            {
              stat_time: 1652582400000,
              rate: 36746922
            },
            {
              stat_time: 1652582700000,
              rate: 39254800
            },
            {
              stat_time: 1652583000000,
              rate: 39595388
            },
            {
              stat_time: 1652583300000,
              rate: 39972111
            },
            {
              stat_time: 1652583600000,
              rate: 40791647
            },
            {
              stat_time: 1652583900000,
              rate: 40963501
            },
            {
              stat_time: 1652584200000,
              rate: 42358692
            },
            {
              stat_time: 1652584500000,
              rate: 43856693
            },
            {
              stat_time: 1652584800000,
              rate: 44100684
            },
            {
              stat_time: 1652585100000,
              rate: 44437389
            },
            {
              stat_time: 1652585400000,
              rate: 45596587
            },
            {
              stat_time: 1652585700000,
              rate: 46154917
            },
            {
              stat_time: 1652586000000,
              rate: 45960880
            },
            {
              stat_time: 1652586300000,
              rate: 46431276
            },
            {
              stat_time: 1652586600000,
              rate: 49023068
            },
            {
              stat_time: 1652586900000,
              rate: 49592063
            },
            {
              stat_time: 1652587200000,
              rate: 50716723
            },
            {
              stat_time: 1652587500000,
              rate: 53741920
            },
            {
              stat_time: 1652587800000,
              rate: 56175285
            },
            {
              stat_time: 1652588100000,
              rate: 57680307
            },
            {
              stat_time: 1652588400000,
              rate: 59134913
            },
            {
              stat_time: 1652588700000,
              rate: 57337066
            },
            {
              stat_time: 1652589000000,
              rate: 57983261
            },
            {
              stat_time: 1652589300000,
              rate: 56700289
            },
            {
              stat_time: 1652589600000,
              rate: 55878496
            },
            {
              stat_time: 1652589900000,
              rate: 57804474
            },
            {
              stat_time: 1652590200000,
              rate: 58609166
            },
            {
              stat_time: 1652590500000,
              rate: 58516659
            },
            {
              stat_time: 1652590800000,
              rate: 56948867
            },
            {
              stat_time: 1652591100000,
              rate: 56219935
            },
            {
              stat_time: 1652591400000,
              rate: 54505463
            },
            {
              stat_time: 1652591700000,
              rate: 53446587
            },
            {
              stat_time: 1652592000000,
              rate: 52340375
            },
            {
              stat_time: 1652592300000,
              rate: 52356666
            },
            {
              stat_time: 1652592600000,
              rate: 51244146
            },
            {
              stat_time: 1652592900000,
              rate: 53680531
            },
            {
              stat_time: 1652593200000,
              rate: 54533580
            },
            {
              stat_time: 1652593500000,
              rate: 53306910
            },
            {
              stat_time: 1652593800000,
              rate: 52354353
            },
            {
              stat_time: 1652594100000,
              rate: 49977580
            },
            {
              stat_time: 1652594400000,
              rate: 46621574
            },
            {
              stat_time: 1652594700000,
              rate: 47127087
            },
            {
              stat_time: 1652595000000,
              rate: 49461339
            },
            {
              stat_time: 1652595300000,
              rate: 51031827
            },
            {
              stat_time: 1652595600000,
              rate: 51476867
            },
            {
              stat_time: 1652595900000,
              rate: 53283867
            },
            {
              stat_time: 1652596200000,
              rate: 54061215
            },
            {
              stat_time: 1652596500000,
              rate: 54541970
            },
            {
              stat_time: 1652596800000,
              rate: 55083629
            },
            {
              stat_time: 1652597100000,
              rate: 55246097
            },
            {
              stat_time: 1652597400000,
              rate: 53191619
            },
            {
              stat_time: 1652597700000,
              rate: 50731653
            },
            {
              stat_time: 1652598000000,
              rate: 51200237
            },
            {
              stat_time: 1652598300000,
              rate: 51534337
            },
            {
              stat_time: 1652598600000,
              rate: 50598044
            },
            {
              stat_time: 1652598900000,
              rate: 49776256
            },
            {
              stat_time: 1652599200000,
              rate: 49547090
            },
            {
              stat_time: 1652599500000,
              rate: 48760323
            },
            {
              stat_time: 1652599800000,
              rate: 48296686
            },
            {
              stat_time: 1652600100000,
              rate: 46449632
            },
            {
              stat_time: 1652600400000,
              rate: 49544863
            },
            {
              stat_time: 1652600700000,
              rate: 49467691
            },
            {
              stat_time: 1652601000000,
              rate: 49216775
            },
            {
              stat_time: 1652601300000,
              rate: 49433036
            },
            {
              stat_time: 1652601600000,
              rate: 48375747
            },
            {
              stat_time: 1652601900000,
              rate: 46592737
            },
            {
              stat_time: 1652602200000,
              rate: 48789567
            },
            {
              stat_time: 1652602500000,
              rate: 48680754
            },
            {
              stat_time: 1652602800000,
              rate: 48512774
            },
            {
              stat_time: 1652603100000,
              rate: 49527122
            },
            {
              stat_time: 1652603400000,
              rate: 48723705
            },
            {
              stat_time: 1652603700000,
              rate: 48324787
            },
            {
              stat_time: 1652604000000,
              rate: 46695340
            },
            {
              stat_time: 1652604300000,
              rate: 47933425
            },
            {
              stat_time: 1652604600000,
              rate: 48526356
            },
            {
              stat_time: 1652604900000,
              rate: 48410775
            },
            {
              stat_time: 1652605200000,
              rate: 48526193
            },
            {
              stat_time: 1652605500000,
              rate: 48716345
            },
            {
              stat_time: 1652605800000,
              rate: 48473771
            },
            {
              stat_time: 1652606100000,
              rate: 48728770
            },
            {
              stat_time: 1652606400000,
              rate: 50446075
            },
            {
              stat_time: 1652606700000,
              rate: 50854376
            },
            {
              stat_time: 1652607000000,
              rate: 50981863
            },
            {
              stat_time: 1652607300000,
              rate: 51019977
            },
            {
              stat_time: 1652607600000,
              rate: 51359469
            },
            {
              stat_time: 1652607900000,
              rate: 52568453
            },
            {
              stat_time: 1652608200000,
              rate: 54058483
            },
            {
              stat_time: 1652608500000,
              rate: 53466258
            },
            {
              stat_time: 1652608800000,
              rate: 52039836
            },
            {
              stat_time: 1652609100000,
              rate: 52360322
            },
            {
              stat_time: 1652609400000,
              rate: 52855579
            },
            {
              stat_time: 1652609700000,
              rate: 52866074
            },
            {
              stat_time: 1652610000000,
              rate: 52981945
            },
            {
              stat_time: 1652610300000,
              rate: 51579715
            },
            {
              stat_time: 1652610600000,
              rate: 52291658
            },
            {
              stat_time: 1652610900000,
              rate: 52758547
            },
            {
              stat_time: 1652611200000,
              rate: 55003147
            },
            {
              stat_time: 1652611500000,
              rate: 56643555
            },
            {
              stat_time: 1652611800000,
              rate: 54727710
            },
            {
              stat_time: 1652612100000,
              rate: 57998594
            },
            {
              stat_time: 1652612400000,
              rate: 53340115
            },
            {
              stat_time: 1652612700000,
              rate: 58519563
            },
            {
              stat_time: 1652613000000,
              rate: 57299719
            },
            {
              stat_time: 1652613300000,
              rate: 57614166
            },
            {
              stat_time: 1652613600000,
              rate: 57569555
            },
            {
              stat_time: 1652613900000,
              rate: 57108456
            },
            {
              stat_time: 1652614200000,
              rate: 55940414
            },
            {
              stat_time: 1652614500000,
              rate: 56422300
            },
            {
              stat_time: 1652614800000,
              rate: 58067580
            },
            {
              stat_time: 1652615100000,
              rate: 59305259
            },
            {
              stat_time: 1652615400000,
              rate: 59620542
            },
            {
              stat_time: 1652615700000,
              rate: 59511278
            },
            {
              stat_time: 1652616000000,
              rate: 58682948
            },
            {
              stat_time: 1652616300000,
              rate: 59474819
            },
            {
              stat_time: 1652616600000,
              rate: 60495833
            },
            {
              stat_time: 1652616900000,
              rate: 61534299
            },
            {
              stat_time: 1652617200000,
              rate: 62552948
            },
            {
              stat_time: 1652617500000,
              rate: 61501072
            },
            {
              stat_time: 1652617800000,
              rate: 59650889
            },
            {
              stat_time: 1652618100000,
              rate: 58985415
            },
            {
              stat_time: 1652618400000,
              rate: 59255183
            },
            {
              stat_time: 1652618700000,
              rate: 60608863
            },
            {
              stat_time: 1652619000000,
              rate: 61438380
            },
            {
              stat_time: 1652619300000,
              rate: 62420546
            },
            {
              stat_time: 1652619600000,
              rate: 62590594
            },
            {
              stat_time: 1652619900000,
              rate: 62095950
            },
            {
              stat_time: 1652620200000,
              rate: 63718903
            },
            {
              stat_time: 1652620500000,
              rate: 68762818
            },
            {
              stat_time: 1652620800000,
              rate: 70489441
            },
            {
              stat_time: 1652621100000,
              rate: 73844737
            },
            {
              stat_time: 1652621400000,
              rate: 73487290
            },
            {
              stat_time: 1652621700000,
              rate: 73311188
            },
            {
              stat_time: 1652622000000,
              rate: 73917769
            },
            {
              stat_time: 1652622300000,
              rate: 73800247
            },
            {
              stat_time: 1652622600000,
              rate: 76146932
            },
            {
              stat_time: 1652622900000,
              rate: 75958696
            },
            {
              stat_time: 1652623200000,
              rate: 74467543
            },
            {
              stat_time: 1652623500000,
              rate: 73889830
            },
            {
              stat_time: 1652623800000,
              rate: 74735585
            },
            {
              stat_time: 1652624100000,
              rate: 75843471
            },
            {
              stat_time: 1652624400000,
              rate: 77786588
            },
            {
              stat_time: 1652624700000,
              rate: 76156466
            },
            {
              stat_time: 1652625000000,
              rate: 73335410
            },
            {
              stat_time: 1652625300000,
              rate: 71284149
            },
            {
              stat_time: 1652625600000,
              rate: 69296435
            },
            {
              stat_time: 1652625900000,
              rate: 68404328
            },
            {
              stat_time: 1652626200000,
              rate: 67259702
            },
            {
              stat_time: 1652626500000,
              rate: 68115684
            },
            {
              stat_time: 1652626800000,
              rate: 67191500
            },
            {
              stat_time: 1652627100000,
              rate: 65596427
            },
            {
              stat_time: 1652627400000,
              rate: 62699903
            },
            {
              stat_time: 1652627700000,
              rate: 61535977
            },
            {
              stat_time: 1652628000000,
              rate: 61218758
            },
            {
              stat_time: 1652628300000,
              rate: 68813468
            },
            {
              stat_time: 1652628600000,
              rate: 71614061
            },
            {
              stat_time: 1652628900000,
              rate: 72200135
            },
            {
              stat_time: 1652629200000,
              rate: 72648480
            },
            {
              stat_time: 1652629500000,
              rate: 71132614
            },
            {
              stat_time: 1652629800000,
              rate: 70650928
            },
            {
              stat_time: 1652630100000,
              rate: 70844773
            }
          ]
        }
      ]
      if (this.chartDateObject.length > 1) { // 有多条曲线
        this.myChart.on('legendselectchanged', this.handleLegendClick)
      }
      this.chartOption.series.forEach((t, i) => {
        t.data = this.chartDateObject[i].dateArr.map(t => [t.stat_time, t.rate])
      })
      this.myChart.setOption(this.chartOption)
    },
    // 点击前，高亮legend个数
    getSelectedNum (params) {
      let selectedNum = 0
      const legendItem = params.selected
      for (const name in legendItem) {
        if (name === params.name) {
          if (!legendItem[name]) {
            selectedNum = selectedNum + 1
          }
        } else {
          if (legendItem[name]) {
            selectedNum = selectedNum + 1
          }
        }
      }
      return selectedNum
    },
    // 自定义legend的点击事件:此方法只处理多条曲线的情况（单条曲线正常切换legend和曲线）
    handleLegendClick (params) {
      // legend点击事件
      const legendNum = Object.keys(params.selected).length
      const selectedNum = this.getSelectedNum(params)

      const legendItem = params.selected
      if (selectedNum === legendNum) { // 点击前：全部曲线高亮
        for (const name in legendItem) {
          if (name === params.name) {
            legendItem[name] = true
          } else {
            legendItem[name] = false
          }
        }
      } else if (selectedNum === 1 && !params.selected[params.name]) { // 点击前：多条曲线，且只有一条曲线高亮时
        for (const name in legendItem) {
          legendItem[name] = true
        }
      }
      this.myChart.setOption({
        legend: {
          selected: legendItem
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
