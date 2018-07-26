// import setHtmlFontSize from './js/rem';
import "../css/style.scss";
(function (win, $) {
  const getUrl = function () {
    var rootPath = location.origin + location.pathname;
    return rootPath;
  }
  class App {
    constructor() {
      this.music = {
        audio: {}
      };
      this.currentList = 'home';
      this.loading = false;
      this.hasMore = true;
      this.currentPage = 1;
      this.api = {
        LIST: '/api/media/list',
        WX_CONFIG: '/api/getConfig',
        UPLOAD: '/api/media/upload',
        MAKE_LOVE: '/api/meida/love',
      };
      this.init();
    }
    init() {
      // setHtmlFontSize();
      // this.wxJssdk();
      this.main();
      this.prefix();
      // this.waterfallsFlow();
      this.previewPic();
      this.handleLike();
      this.playVidoe();
      this.showTip();
      this.scrollLoadMore();
      this.getList({
        page: 1,
        patten: 1,
        count: 20
      }, 'home');
    }
    main() {
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


      // 上传图片
      $('#filedata').UploadImg({
        url: this.api.UPLOAD,
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

    // 图片瀑布流
    waterfallsFlow() {
      const $container = $('#masonry');
      const imgWidth = parseInt(window.screen.width) - 40;
      $container.masonry({
        itemSelector: '.item',
        gutterWidth: 0,
        isResizable: true,
      });
    }
    // 切换页面
    page(active) {
      const $activePage = $("#page-" + active);
      $activePage.addClass("active").siblings(".page").removeClass("active");
      // $activePage.find('.scroller').html('');
      this.getList({
        page: 1,
        count: 20,
        patten: 1
      }, active);
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
    getList (ops, page) {
      const url = this.api.LIST;
      const self = this;
      const patt = /.(jpg|jpeg|png|gif|x-png|bmp|pjpeg)/;
      const sendData = {
        ...ops
      };
      self.loading = true;
      $.get(url, sendData, res => {
        self.loading = false;
        if (res.ret === 0) {
          const data = res.data.dataList;
          if (data.length === 0) {
            self.showTost('已经是全部数据了');
            return;
          };
          self.hasMore = data.length < 20;
          const template = data.map(list => {
            const flag = patt.test(list.path);
            if (flag) {
              return `<div class="item masonry-brick" data-id="${list.id}" data-src="${list.path}" data-love="1">
                <img src="${list.path}">
                <div class="pick-info">
                  <i class="type iconfont icon-tupianx"></i>
                  <span class="btnLike">
                    <i class="iconfont icon-dianzanx"></i>
                    <b>${list.voteNum}</b>
                  </span>
                </div>
              </div>`
            } else {
              return `<div class="item masonry-brick video" data-id="${list.id}" data-love="1">
                <video
                controls 
                src="${list.path}"
                x5-video-player-type="h5" 
                x5-video-player-fullscreen="true"></video>
                <div class="poster">
                  <img src="imgs/test.png">
                  <i class="iconfont icon-play"></i>
                </div>
                <div class="pick-info">
                  <i class="type iconfont icon-shipinx"></i>
                  <span class="btnLike">
                    <i class="iconfont icon-dianzanx"></i>
                    <b>${list.voteNum}</b>
                  </span>
                </div>
              </div>`
            }
          });

          $(`#page-${page}`).find('.scroller').append(template.join(''));
          self.waterfallsFlow();
          setInterval(function () {
            $('#masonry').masonry('reload');
          }, 300);
        } else {
          self.showTost(res && res.msg || '网络错误，请稍后重试');
        }
      });
    }

    // 点击查看大图
    previewPic() {
      $('.preview').on('tap', '.item', (e) => {
        const $target = $(e.target);
        if ($target.hasClass('btnLike') || $target.parents('.btnLike').length) return;
        const url = getUrl();

        const imgs = $target.closest('.preview').find('.item').map((idx, item) => {
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

    wxJssdk() {
      const api = this.api.WX_CONFIG;
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
    handleLike() {
      const self = this;
      const url = this.api.MAKE_LOVE;
      $('.preview').on('tap', '.btnLike', function (e) {

        const _this = $(this).parents('.item');
        const $hint = $('#hint');
        if (_this.hasClass('disabled')) return;

        const id = _this.data('id');
        const act = _this.data('love');
        const res = {};
        _this.addClass('disabled');
        $.post(url, {
          id,
          act
        }, function (res) {
        if (res.ret === 0) {
          if (act === 1) {
            _this.find('.btnLike b').text(parseInt(_this.find('b').text()) + 1);
            _this.find('.btnLike i').addClass('icon-dianzanedx').removeClass('icon-dianzanx');
            _this.attr('data-love', 2);
            self.showTost('已点赞');
          } else {
            _this.find('.btnLike b').text(parseInt(_this.find('b').text()) - 1);
            _this.find('.btnLike i').removeClass('icon-dianzanedx').addClass('icon-dianzanx');
            _this.attr('data-love', 1);
            self.showTost('已取消点赞');
          }
        } else {
          self.showTost(res && res.msg || '网络错误请稍后重试');
        }
        setTimeout(function () {
          _this.removeClass('disabled');
        }, 300);
        }, 'json');
      });
    }

    playVidoe() {
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
    prefix() {
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

    scrollLoadMore () {
      const self = this;
      $('#masonry').on('scroll', function () {
        const $target = $(this);
        const contentH = parseInt($target.find('.item:last').css('top')) + parseInt($target.find('.item:last').css('height'));
        const scrollH = $target.scrollTop();
        console.log(contentH, scrollH);
        
        const distance = contentH - scrollH;
        let currentPage = self.currentPage;
        console.log(self.loading);
        
        if (distance < 1800 && !self.loading) {
          currentPage += 1;
          self.currentPage = currentPage;
          self.getList({
            page: currentPage,
            count: 20,
            patten: 1
          }, 'home');
        }
      });

    }

    showTost (text) {
      const $hint = $('#hint');
      $hint.text(text).show();
      setTimeout(() => {
        $hint.addClass('show-toast');
      }, 50);
      setTimeout(() => {
        $hint.removeClass('show-toast').one('webkitTransitionEnd', function () {
          $hint.hide();
        });
      }, 1400);
    }
  }

  $(function () {
    new App();
  });
})(window, $);
