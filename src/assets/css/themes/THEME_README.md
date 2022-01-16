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
