# Magical-Moments
移动端H5页面
## 主要功能
* 图片/视频上传
* 图片预览
* 视频播放
* 瀑布流展示图片
## 问题
* 1、屏幕适配
设计稿实际宽度为750 在head中加入下代码,其原理是按比列缩放页面所有内容
```
<script>

  var b = parseInt(window.screen.width),
    c = b / 750;
  if (/Android (\d+\.\d+)/.test(navigator.userAgent)) {
    var d = parseFloat(RegExp.$1);
    document.write(d > 2 ? '<meta name="viewport" content="width=750, user-scalable=no,maximum-scale = 1">' : '<meta name="viewport" content="width=750, target-densitydpi=device-dpi">');
  } else document.write('<meta name="viewport"        content="width=750, user-scalable=no,           minimum-scale = ' + c + ',maximum-scale = 1,target-densitydpi=device-dpi">');

  </script>
```

* 2 on('tap', fn), 用于解决滚动触摸、长按和点击的触发问题
* 3 同事调用手机的视频和图片上传： accept属性接受image/\*,vidoe/\* 
```
<input type="file" id="filedata" name="filedata" accept="image/*,video/*"/>
```
* 4 背景图片使用绝对路径： background: url('/imgs/background.jpg');

* 5 table 表格的border去除问题：border-collapse: collapse;

* 6 flex 布局：
  父元素 .box 样式运用, 设置flex布局之后，子元素的所有 float或者定位将会失效
```
  .box {
    display: flex;
  }
```
* 6.1 flex-direction 用于决定主轴的方向
```
  .box {
    flex-direction: row | row-reverse | column | column-reverse
  }
```
* 6.2 flex-wrap 决定子元素在一行显示不下时的换行方式
```
  .box {
    flex-wrap: wrap | nowrap | wrap-reverse
  }
```
* 6.3 flex-flow 这个属性时flex-direction 和 flex-wrap 的简写形式, 即可以使他们的一个字或者两个值
```
  .box {
    flex-flow: <flex-directon> || <flex-wrap>
  }
```

* 6.4 justify-content 定义子元素在主轴方向的对其方式
```
  .box {
    justify-content: flex-start | flex-end | center  | space-between | space-around
  }
```
* 6.5 align-items 定义子元素在交叉轴上的对得起方式
``` {
  .box {
    align-items: flex-start | flex-end | center | baseline | stretch(子元素高度一致，撑满)
  }
}
```

* 6.6 align-content 定义了多根轴线的对其方式
```
  .box {
    align-content: flex-start | flex-end | center | space-between | space-around | stretch
  }
```

子元素 .item 属性设置

* 6.7 order属性，定义项与项之间的排列顺序，数值越小，排序与靠前。
```
.item {
    order: 1
  }
```
* 6.8 flex-grow 定义项的放大比例，用于占用间隔的空间，默认为 0。
``` 
  .item {
    flex-grow: 0
  }
```
* 6.9 flex-shrink 第一项目的缩小比例，默认为 0 。
```
 .item {
   flex-shrink: 0
 }
```
* 6.10 felx-basis 定义了项目在分配多余空间之前，项目占据的主轴空间的大小，浏览器根据这个属性来计算是否有多余的空间。默认值 auto，即项的本来大小。
```
  .item {
    flex-basis: auto
  }
```
* 6.11 flex 属性，是flex-grow、flex-shrink、flex-basis的合并属性值，该属性有两个快捷值：auto (1 1 auto) 和 none (0 0 auto)，建议优先使用默认值。
```
  .item {
    flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
  }
```

* 6.12 align-self，即选项单个项有与其他项不同的对齐方式，可以覆盖 align-items 属性值, 默认值auto，表示基础父元素的align-items属性的值，如果没有父元素，则如同 stretch
``` 
  .item {
    align-self: none | flex-start | flex-end | center | baseline | stretch
  }
```


* 7 webpack 反向代理post请求不成功？

* 8 输入框黄色去除
```
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
-webkit-text-fill-color: #fff !important;
 transition: background-color 5000s ease-in-out 0s;
}
```

* 关于视频封面 https://segmentfault.com/a/1190000006857675   ‘在ios下，视频被嵌入后，媒体的元数据加载完成后，会以全屏的形式显示出来，或者加个poster，可以看到画面。但在android下，多数机子是不显示视频画面的，要不就是显示一个黑色的还不是全屏的播放控件，即使及加个poster封面也不济于是。因为poster在android兼容的并不好，不如在视频上层加个div铺张图片，这个比较好的处理方式应该是：视频上加一层div做封面，由于android不允许视频上层有东西，所以首先将视频设为的width：1px，当播放后，上层的封面remove掉，同时width：100%或者你想要的宽度’