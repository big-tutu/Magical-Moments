// import setHtmlFontSize from './js/rem';
import "../css/style.scss";

const getUrl = function () {
  var rootPath = location.origin + location.pathname;
  return rootPath;
}
class App {
  constructor () {
    this.music = {
      audio: {}
    };
    this.init();
  }
  init () {
    // setHtmlFontSize();
    // this.wxJssdk();
    this.main();
    this.prefix();
    this.waterfallsFlow();
    this.previewPic();
    this.handleLike();
    this.playVidoe();
    this.showTip();
    // this.scroll('message');
  }
  main () {
    $('.btn-upload').on('tap', e => {
      e.preventDefault();
      $('#filedata').trigger('click');
    });

    $('.btn-home').on('tap', e => {
      e.preventDefault();
      this.page('home');
    });

    $('.btn-rank').on('tap', e => {
      e.preventDefault();
      this.page('rank');
    });
    // $('.page-rules')[0].addEventListener('touchmove', function (e) {     //对蒙版绑定touchmove的属性
    //   //判断条件,条件成立才阻止背景页面滚动,其他情况不会再影响到页面滚动
    //   if (!$(e.target).hasClass('scroll')) {
    //     e.preventDefault();
    //   }
    // });


    // 上传图片
    $('#filedata').UploadImg({
      url: 'api/picture.php?act=upload',
      width: '750',
      quality: '0.8',
      mixsize: '10000000',
      type: 'image/png,image/jpg,image/jpeg,image/pjpeg,image/gif,image/bmp,image/x-png',
      success: function (res) {
        if (res.code == 1) {
          page('index');
        } else {
          hint(res.msg);
        }
      }
    });
  }

  renderPicker () {
    // const data = [
    //   {
    //     p_id:
    //   }
    // ]
    // let tmplate;

    // for (var i = 0; i < res.data.length; i++) {
    //   template = `<div class="item item-${data[i].p_id} masonry-brick" data-id="${data[i].p_id}" data-src="${data[i].p_picurl}" style="position: absolute; top: 10px; left: 320px;"> 
    //   <img src="${data[i].p_picurl}">
    //   <span class="btnLike"><i class="ico-like"></i> <b>${data[i].p_vote}</b></span>                            
    //   </div>`;
    // };
  }

  // 图片瀑布流
  waterfallsFlow () {
    const $container = $('#masonry');
    const imgWidth = parseInt(window.screen.width) - 40;
    $container.masonry({
      itemSelector: '.item',
      gutterWidth: 0,
      isResizable: true,
    });
  }
  // 切换页面
  page (active) {
    const $activePage = $("#page-" + active);
    console.log($activePage);
    
    $activePage.addClass("active").siblings(".page").removeClass("active");
  }


  // 显示和隐藏提示
  showTip() {
    const $tips = $('#page-rules');
    $('.btn-rules').on('tap', e => {
      e.preventDefault();
      $tips.show();
      setTimeout(function () {
        $tips.addClass('show');
      }, 50);
    });
    $('.close').on('tap', e => {
      $tips.removeClass('show').one('webkitTransitionEnd', function () {
        $(this).hide();
      });
    });
  }

  // 点击查看大图
  previewPic () {
    $('.preview').on('tap', '.item', (e) => {
      const $target = $(e.target);
      if ($target.hasClass('btnLike') || $target.parents('.btnLike').length) return;
      const url = getUrl();
      
      const imgs = $target.closest('.preview').find('.item').map((idx,item) => {
        const $current = $(item);
        return url + $current.data('src');
      });
      
      if (typeof wx !== 'undefined') {
        wx.previewImage({
          current: url + $target.data('src') || $target.attr('src'),
          urls: imgs
        });
      }
    });
  }

  wxJssdk () {
    if (/MicroMessenger/i.test(navigator.userAgent)) {
      document.addEventListener("WeixinJSBridgeReady", function () {
        this.music.play('music');
        this.music.play('time');
        this.music.stop('time');
      }, false);

      document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
        WeixinJSBridge.call('hideToolbar');
      });


      $.getScript("https://res.wx.qq.com/open/js/jweixin-1.0.0.js", function callback() {
        console.log('test');
        
        // $.ajax({
        //   type: "post",
        //   url: "api/jssdk.php",
        //   dataType: 'json',
        //   data: {
        //     url: window.location.href.split('#')[0]
        //   },
        //   success: function (data) {
        //     wx.config({
        //       debug: false,
        //       appId: data.appid,
        //       timestamp: data.timestamp,
        //       nonceStr: data.noncestr,
        //       signature: data.signature,
        //       jsApiList: [
        //         'onMenuShareTimeline',
        //         'onMenuShareAppMessage',
        //         'hideMenuItems'
        //       ]
        //     })
        //     wx.ready(function () {
        //       App.shareData = {
        //         title: 'Magical moments for Nike Direct FY19 Kick Off Day',
        //         link: getUrl(),
        //         desc: '銆€',
        //         imgUrl: getUrl() + 'img/share.jpg?v=2',
        //         success: function () {
        //         },
        //         cancel: function () {
        //         }
        //       };
        //       wx.onMenuShareTimeline(App.shareData);
        //       wx.onMenuShareAppMessage(App.shareData);
        //       wx.hideMenuItems({
        //         menuList: [
        //           'menuItem:share:qq',
        //           'menuItem:share:weiboApp',
        //           'menuItem:share:facebook',
        //           'menuItem:share:QZone',
        //           'menuItem:favorite',
        //           'menuItem:copyUrl',
        //           'menuItem:readMode',
        //           'menuItem:openWithQQBrowser',
        //           'menuItem:openWithSafari',
        //         ]
        //       });
        //     })
        //     wx.error(function (res) {
        //       // alert(res)
        //     })
        //   },
        //   error: function (xhr, ajaxOptions, thrownError) {
        //   }
        // });


          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来
            appId: 'wx6fede0c9989aa98c', // 必填，公众号的唯一标识
            timestamp: "1513666450", // 必填，生成签名的时间戳
            nonceStr: "b5f88ccf-227a-41c9-9db3-d585ef6a933d", // 必填，生成签名的随机串
            signature: "843f834527fc605de31303af5a5bfba97f406e1e",// 必填，签名，见附录1
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'hideMenuItems'
            ]
          })
          wx.ready(function () {
            App.shareData = {
              title: 'Magical moments for Nike Direct FY19 Kick Off Day',
              link: getUrl(),
              desc: '銆€',
              imgUrl: getUrl() + 'img/share.jpg?v=2',
              success: function () {
              },
              cancel: function () {
              }
            };
            wx.onMenuShareTimeline(App.shareData);
            wx.onMenuShareAppMessage(App.shareData);
            wx.hideMenuItems({
              menuList: [
                'menuItem:share:qq',
                'menuItem:share:weiboApp',
                'menuItem:share:facebook',
                'menuItem:share:QZone',
                'menuItem:favorite',
                'menuItem:copyUrl',
                'menuItem:readMode',
                'menuItem:openWithQQBrowser',
                'menuItem:openWithSafari',
              ]
            });
          })
          wx.error(function (res) {
            // alert(res)
          });
      })
    }
  }

  // 点赞取消点赞
  handleLike () {
    $('.preview').on('tap', '.btnLike', function (e) {

      const _this = $(this).parents('.item');
      const $hint = $('#hint');
      if (_this.hasClass('disabled')) return;

      const p_id = _this.data('id');
      const res = {};
      _this.addClass('disabled');
      // $.post('api/picture.php?act=vote', {
      //   p_id: p_id
      // }, function (res) {
        res.code = 1;
        if (res.code == 1) {
          _this.find('.btnLike b').text(parseInt(_this.find('b').text()) + 1);
          _this.find('.btnLike i').addClass('icon-dianzanedx').removeClass('icon-dianzanx');
          $hint.text('已点赞').show();
          setTimeout(() => {
            $hint.addClass('show-toast');
          }, 50);
          setTimeout(() => {
            $hint.removeClass('show-toast').one('webkitTransitionEnd', function () {
              $hint.hide();
            });
          }, 1400);
        } else if (res.code == 2) {
          _this.find('.btnLike b').text(parseInt(_this.find('b').text()) - 1);
          _this.find('.btnLike i').removeClass('icon-dianzanedx').addClass('icon-dianzanx');
          $hint.text('已取消点赞').show();
          setTimeout(() => {
            $hint.addClass('show-toast');
          }, 50);
          setTimeout(() => {
            $hint.removeClass('show-toast').one('webkitTransitionEnd', function () {
              $hint.hide();
            });
          }, 1400);
        } else {
          hint(res.msg);
        }
        setTimeout(function () {
          _this.removeClass('disabled');
        }, 300);
      // }, 'json');
    });
  }

  playVidoe () {
    const $playBtn = $('.item .poster');
    const $videos = $('.item video');
    $videos.on('playing', e => {
      const $target = $(e.target)
      $target.closest('.item').find('.poster').hide();
      $target.closest('.item').find('.pick-info').hide();
    });
    $videos.on('ended', e => {
      const $target = $(e.target);
      $target.closest('.item').find('.poster').show();
      $target.closest('.item').find('.pick-info').show();
    });
    $videos.on('pause', e => {
      const $target = $(e.target);
      $target.closest('.item').find('.poster').show();
      $target.closest('.item').find('.pick-info').show();
      $target.closest('.item').find('.poster i').addClass('icon-play').removeClass('icon-loading1')
    });
    $playBtn.on('tap', (e) => {
      e.preventDefault();
      const $target = $(e.target);
      const $parentItem = $target.closest('.item').find('video');
      const $icon = $target.closest('.item').find('.poster i');
      $icon.removeClass('icon-play').addClass('icon-loading1');
      $parentItem[0].play();
    });
  }


  // 解决滚动穿透问题
  prefix () {
    $(document).ready(function (e) {
      $(window).on('orientationchange', function (e) {
        var htmlBox = $('body');
        if (window.orientation == 180 || window.orientation == 0) {
          $(".turnBox").remove();
        }
        if (window.orientation == 90 || window.orientation == -90) {
          $("body").append('<aside class="turnBox"><img src="imgs/turn.png" class="turn"><p>请将手机调至竖屏状态，获得最佳浏览体验</p></aside>');
        }
      });
      $('.container').on('touchmove', function (e) {
        var fix = $(e.target).parents('.scroller').length || $(e.target).hasClass('scroller');
        if (!fix) e.preventDefault();
        else {
          var _fix = $(e.target).hasClass('scroller') ? $(e.target)[0] : $(e.target).parents('.scroller')[0];
          if (_fix.scrollHeight == _fix.offsetHeight) e.preventDefault();
        }
      });
      $('.scroller').on('scroll', function (e) {
        var _this = $(e.target)[0];
        if (_this.scrollTop == 0) {
          _this.scrollTop = 1;
        } else if (_this.scrollTop == _this.scrollHeight - _this.offsetHeight) {
          _this.scrollTop = _this.scrollTop - 1;
        }
      }).trigger('scroll');
    });
  }

}

new App();