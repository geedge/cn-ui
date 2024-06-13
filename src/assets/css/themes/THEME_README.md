# 主题功能说明

### 说明

- 对项目中的主题相关颜色进行归类、抽取变量
- 代码中设置元素的颜色时，对主题相关色应使用变量，不应使用颜色值
- 切换主题时，更改body标签上的class

### 源码改动
- theme-chalk/src/common/var.scss 首行增加$--theme属性
- theme-chalk/src/mixins/mixins.scss 改动较多，如需了解请比对文件差异
-   // $arrow-selector: #{& + '__arrow'};   
    改为 $arrow-selector: '.el-popper__arrow';

### 20240118__element-plus升级
#### 变动事项

- elemen-plus由1.0.2-beta.71升级至2.5.1，旧版本是将element-plus源文件放到theme/src中进行部分修改使用，现在弃用该方案，直接使用element-plus组件，部分组件有差异改动，对比界面进行调整并记录在cover-element.scss
- 弃用之前的主题写法，改为官网的主题切换方法。删除body上的class，在html上添加class="dark"。默认明亮主题light，暗黑主题dark，默认引入theme-light.scss样式文件，暗黑主题theme-dark.scss样式文件
- 如需添加暗黑样式，先在theme-light.scss添加唯一样式名，再到theme-dark中添加同名样式。如在light中添加字体颜色$--text-color-1: #353636;，则需要在dark中添加$--text-color-1: #d8d8d8;
- header.vue的第四级面包屑导航栏，以及NetworkOverviewTabs.vue第一列搜索的popover。原结构的popover被上一层div包裹，但在html中解析成两个div，原来的popper-class需要提出来，不要在原div的class下，否则样式错乱

#### 新旧组件差异

- table表格：自定义单元格样式cell-style。老版cell-style接受格式为string/object，新版疑似仅接受object，string格式会报错。表头格式header-cell-style同理。
- input输入框1：老版el-input是包含class为el-input__inner的input，新版el-input在此基础上被class="el-input__wrapper"的div包裹。在老版的el-input__inner改动的样式，需要在el-input__wrapper上修改
- input输入框2：老版给input添加icon，是给属性prefix-icon添加icon名。新版是在prefix插槽里添加icon标签
- icon图标：老版使用：<i class="el-icon-search" />。新版则是svg文件，需要单独引入封装成component的格式，使用时：<el-icon><Search /></el-icon>
- select选择器：新版被el-select__wrapper的div包裹，与旧版顺序不同。
- * input和select的右侧图标和maxlength间距新版比旧版略大
- drawer抽屉：在header.vue中遇到，custom-class="cn-menu"，渲染后class中没有cn-menu，也许是按需引入导致的，额外标注
- message-box弹窗：新版在旧版的el-message-box的外层包裹了一层父div el-overlay-message-box，导致原样式会错乱
- dialog: custom在2.4版本后被移除，使用class替代，插槽中的title也在2.4版本后移除，使用header替代
- tabs: 点击tabs，tab-click有延迟，v-model获取的信息是上一个路由的信息，使用tab-change获取的v-model则是实时的，根据使用内容进行取舍。tab-change在2.1.8版本上线
