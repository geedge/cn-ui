# Cyber Narrator(CN)

## 安装
```
npm install
```

### 开发环境
```
npm run serve
```

### 生产环境
```
npm run build
```

### Lints
```
npm run lint
```

## 技术选型

### 1.VUE3

### 2.基础UI库
项目UI设计与NEZHA相似度较高，考虑到工作量、学习成本，结合NEZHA的体验，选用element-plus

### 3.图表组件库
图表：echarts5.0  
地图：amCharts  
拖拽 & Resize：Vue-grid-layout &nbsp;https://jbaysolutions.github.io/vue-grid-layout/guide/

### 4.响应式方案
lib-flexible + postcss-px2rem-exclude + 媒体查询  
lib-flexible 将px自动转为rem，postcss-px2rem-exclude 避免将ui库的css转换，媒体查询根据不同屏幕大小使用不同的root font size

### 5.工具
lodash库，该库包含大部分常用工具方法，包括数组操作、函数功能扩展、对象操作等，且高性能、一致。开发中应该优先使用该库的方法  
https://www.lodashjs.com/

## 开发规范 & 要求

### 1.语义化
- 所有命名要求使用语义化英文，意思表达清晰、准确
- 除如IP、SNMP这类特殊名词外，避免将单词缩略简写
- **禁用汉语拼音**

### 2.命名
多个单词时，应该以高阶的 (通常是一般化描述的) 单词开头，以描述性的修饰词结尾  
eg：`SearchButtonClear.vue` 反例：`ClearSearchButton.vue`
- **文件夹**  
使用小写，单词间使用连字符`-`连接  
eg：`right-box`


- **VUE组件文件**  
使用大写开头的驼峰格式  
eg：`AssetBox.vue`
  

- **JS/CSS/SCSS/png等**  
使用小写，单词间使用连字符`-`连接  
eg：`table-common.scss`
  

- **JS标识符**
使用小写开头的驼峰格式  
eg：`const tableTitle = 'Role'`
  

- **CLASS**  
使用BEM规范命名： B__E--M，其中B名称必须是唯一的  
BEM具体内容见 http://getbem.com/introduction/
  
**推荐阅读**  
VUE官方风格指南 https://v3.cn.vuejs.org/style-guide/

### 3.开发
- 功能开发之初应考虑未来复用的可能性，将可能复用的功能代码提取为组件或使用混入，合理暴露参数、插槽，降低耦合；时间紧迫时优先级放后  
- **性能**  
1.组件销毁前注意解绑挂载在window对象和其他组件实例上的事件  
2.减少能够触发浏览器回流、重绘的代码，必须使用时将使用次数尽量减少  
**触发回流、重绘的js函数**  
`offsetTop、offsetLeft、offsetWidth、offsetHeight
scrollTop、scrollLeft、scrollWidth、scrollHeight
clientTop、clientLeft、clientWidth、clientHeight
getComputedStyle()
getBoundingClientRect()`  
**需要使用js修改style时，一次性赋值而不是分为多次**  
eg：  
`const el = document.getElementById('el')`  
`el.style.cssText += 'border-left: 1px; border-right: 2px; padding: 5px;';`  
反例：  
`const el = document.getElementById('el')`  
`el.style.padding = 'xxx'`  
`el.style.margin = 'xxx'`  
`el.style.border = 'xxx'`

- **布局**  
避免使用float，视情况使用position，建议使用flex和grid