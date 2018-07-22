# Magical-Moments
移动端H5页面
## 主要功能
* 图片上传
* 左右滑动预览大图
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