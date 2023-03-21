<template>
  <div class="appearance" :class="from">
    <div class="appearance-form">
      <el-form ref="appearanceForm" :model="appearanceObject"  label-position="top" label-width="120px">
        <el-form-item :label="$t('config.appearance.dateFormat')" prop="date_format">
          <el-select id="appearance-dateFormat"
                     v-model="appearanceObject.date_format"
                     collapse-tags
                     placeholder=" "
                     popper-class="right-box-select-dropdown right-box-select-report "
                     size="small">
            <template v-for="dateFormat in dateFormatList" :key="dateFormat.id">
              <el-option :label="dateFormat.label" :value="dateFormat.value">
                <span style="float: left">{{ dateFormat.label }}</span>
                <span style="float: right;">{{ dateFormat.example }}</span>
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.appearance.lang')" prop="lang">
          <el-select id="appearance-lang"
                     v-model="appearanceObject.lang"
                     collapse-tags
                     placeholder=" "
                     popper-class="right-box-select-dropdown right-box-select-report "
                     size="small">
            <template v-for="lang in langList" :key="lang.id">
              <el-option :label="lang.label" :value="lang.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.appearance.timezone')" prop="timezone">
          <el-select id="appearance-timezone"
                     v-model="appearanceObject.timezone"
                     collapse-tags
                     filterable
                     placeholder=" "
                     popper-class="right-box-select-dropdown right-box-select-report "
                     size="small">
            <template v-for="timezone in timezoneList" :key="timezone.id">
              <el-option :label="timezone.name" :value="timezone.name">
                <span style="float: left">{{ timezone.name }}</span>
                <span style="float: right;">{{ timezone.offset}}</span>
              </el-option>
            </template>
          </el-select>

        </el-form-item>
      </el-form>
      <div class="edit-appearance-base__footer">
        <button style="position: relative;" :class="{'footer__btn--disabled': blockOperation.save}" :disabled="blockOperation.save" class="footer__btn" @click="save">
          <loading size="small" :loading="blockOperation.save"></loading>
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
  import { api,getDictList } from '@/utils/api'
  import { get, put } from '@/utils/http'
  import { storageKey } from '@/utils/constants'


  export default {
    name: 'Appearance',
    data () {
      return {
        url: api.appearance,
        appearanceObject: { // 空白对象
          date_format: '',
          lang: '',
          timezone: ''
        },
        timezoneList:[],
        dateFormatList:[
          {
            id:1,
            label:'DD/MM/YYYY HH:mm:ss',
            value:'DD/MM/YYYY HH:mm:ss',
            example:'20/03/2023 09:30:38'
          },
          {
            id:2,
            label:'MM/DD/YYYY HH:mm:ss',
            value:'MM/DD/YYYY HH:mm:ss',
            example:'03/20/2023 09:30:38'
          },
          {
            id:3,
            label:'YYYY-MM-DD HH:mm:ss',
            value:'YYYY-MM-DD HH:mm:ss',
            example:'2023-03-20 09:30:38'
          }
        ],
        langList:[
          {
            id:1,
            label:'English',
            value:'en'
          },
          {
            id:2,
            label:'中文',
            value:'zh'
          }
        ]
      }
    },
    mounted () {
      this.initData()
    },
    methods:{
      async initData () {
        this.dateFormatList.forEach(date => {
          date.example = window.$dayJs(new Date()).tz().format(date.value)
        })
        await get(api.timezone).then(response => {
          if (response.code === 200) {
            this.timezoneList = response.data
          }
        })

        if (this.timezoneList && this.timezoneList.length > 0) {
          this.timezoneList.forEach(mapData => {
            let offset = Number(mapData.offset)/3600000 //转换为小
            mapData.timezoneOffset = offset
            let hour = Math.abs(parseInt(offset))
            let offsetStr = offset.toString()
            let minute = 0
            if(offsetStr.indexOf('.') > -1){
              minute = Math.abs(Number(offsetStr.substring(offsetStr.indexOf('.')))*60)
            }
            let str = ''
            if(hour<10){
              str = '0'+hour
            }else {
              str = hour
            }
            str += ':'
            if(minute<10){
              str += '0'+minute
            }else {
              str += minute
            }
            if(offset > 0){
              mapData.offset = 'UTC+'+str
            }else if(offset === 0){
              mapData.offset = 'UTC'
            }else {
              mapData.offset = 'UTC-'+str
            }
          })
        }
        get(this.url, { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.appearanceObject = response.data
          }
        })
      },
      save () {
        if (this.blockOperation.save) { return }
        this.blockOperation.save = true
        put(this.url, this.appearanceObject).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          } else {
            this.$message.error(response.message)
          }
        }).catch(e => {
          console.error(e)
          if (e.response && e.response.message) {
            this.$message.error(e.response.message)
          } else {
            this.$message.error('Something went wrong...')
          }
        }).finally(() => {
          this.blockOperation.save = false
          if (this.appearanceObject.date_format !== localStorage.getItem(storageKey.dateFormat)) {
            localStorage.setItem(storageKey.dateFormat, this.appearanceObject.date_format)
          }
          if (this.appearanceObject.timezone !== localStorage.getItem(storageKey.sysTimezone)) {
            localStorage.setItem(storageKey.sysTimezone, this.appearanceObject.timezone)
          }
          let timezone = this.timezoneList.find(mapData => mapData.name === this.appearanceObject.timezone)
          if (timezone.timezoneOffset !== localStorage.getItem(storageKey.timezoneOffset)) {
            localStorage.setItem(storageKey.timezoneOffset, timezone.timezoneOffset)
          }
        })
      }
    }
  }
</script>
