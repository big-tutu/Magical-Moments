# Photo-Moments
## 项目整体
项目分两部分H5、后台，webpack打包多页面。<br>
开始：
```js
npm i     =>    npm run start
```
打包：
```js
npm run build
```
项目结构：
```js                              
├── webpack.config.js                            // webpack配置
├── src                                          // 项目代码
│   ├── css                                      // 样式资源
│   │   ├── fonts                                // 指令方法 
│   │   │   ├── TradeGothicforNike365-BdCn_2.ttf // Nike 字体
│   │   ├── admin.scss                           // 后台
│   │   ├── style.scss                           // h5
│   │   ├── wangEditor.min.scss                  // 编辑器
│   ├── imgs                                     // 静态图片
│   ├── js                                       // 全局公用方法
│   │   ├── lib                                  // js插件等
│   │   │   ├── jquery.min.js                    
│   │   │   ├── zepto.min.js                     
│   │   │   ├── jquery.masonry.min.js            // 瀑布流
│   │   │   ├── jquery.pagination.js             // 分页插件
│   │   │   ├── banner.js                        // H5轮播图
│   │   │   ├── upload.js                        // H5上传
│   │   │   ├── upPicture.js                     // 后台上传
│   │   │   ├── wangEditor.min.js                // 后台编辑器
│   │   │   ├── mobileBUGFix.mini.js             // 移动端
│   │   │   ├── exif.js                          // 上传图片处理
│   │   ├── admin.js                             // 后台两个页面主要业务，
│   │   ├── index.js                             // h5业务
│   │   ├── login.js                             // 后台登陆
│   ├── pages
│   │   ├── index.html                           // H5页面
│   │   ├── 404.html                             // H5404
│   │   ├── list.html                            // 后台首页
│   │   ├── login.html                           // 后台登陆页面
│   │   ├── system_set.html                      // 系统配置页面
```


## 移动端H5页面
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
* 2、input 标签上传资源
* 3、video 播放视频
* 4、微信图片预览
* 5、FileReader 图片预览
* 6、formData 上传图片


## 后台页面

* 1、资源上传
* 2、资源下载
* 3、业务模式修改
* 4、系统设置
* 5、登陆
