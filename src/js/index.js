// import setHtmlFontSize from './js/rem';
import VConsole from 'vconsole/dist/vconsole.min.js';
let vConsole = new VConsole();
import "../css/style.scss";
(function (win, $) {
  const getUrl = function () {
    var rootPath = location.origin + location.pathname;
    return rootPath;
  }
  class App {
    constructor() {
      this.currentList = 'home';
      this.loading = false;
      this.hasMore = true;
      this.currentPage = 1;
      this.api = {
        LIST: '/api/media/list',
        WX_CONFIG: '/api/getConfig',
        UPLOAD: '/api/media/upload',
        MAKE_LOVE: '/api/media/love',
      };
      this.init();
    }
    init() {
      this.wxJssdk();
      this.main();
      this.prefix();
      this.waterfallsFlow();
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
      $.get('/api/mockCookie', res => {
        console.log(res);
      });
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
        showTips: this.showTost,
        quality: '0.8',
        mixsize: 1024 * 1024 * 3,
        videoSize: 1024 * 1024 * 50,
        videoType: 'video/ogg,video/mp4,video/WebM,video/quicktime,video/x-msvideo',
        type: 'image/png,image/jpg,image/jpeg,image/pjpeg,image/gif,image/bmp,image/x-png',
        success:  (res) => {
          if (res.ret === 0) {
            this.showTost('上传成功');
            setTimeout(() => {
              this.page('home');
            }, 500);
            this.currentList = 'home';
          } else {
            this.showTost(res.msg || '上传失败稍后重试');
          }
        },
        error (res) {
          console.log(res);
          
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
      $activePage.find('.scroller').html('');
      this.getList({
        page: 1,
        count: active === 'home' ? 20 : 10,
        patten: active === 'home' ? 1 : 2
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
      const ua = navigator.userAgent.toLowerCase();
      const isWeixin = ua.indexOf('micromessenger') !== -1;
      const self = this;
      // const patt = /.(jpg|jpeg|png|gif|x-png|bmp|pjpeg)/;
      const sendData = {
        ...ops
      };
      self.loading = true;
      $.get(url, sendData, res => {
        self.loading = false;
        if (res.ret === 0) {
          const data = res.data.dataList;
          self.videoId = [];
          if (data.length < 20) {
            // self.showTost('已经是全部数据了');
            this.hasMore = false;
            // return;
          };
          self.hasMore = data.length === 20;
          const template = data.map(list => {
            // const flag = patt.test(list.path);
            if (list.mediaType === 1) {
              return `<div class="item masonry-brick" data-id="${list.id}" data-src="${list.path}" data-love="${list.isVoted === 0 ? 1 : 2}">
                <img src="${list.path}">
                <div class="pick-info">
                  <i class="type iconfont icon-tupianx"></i>
                  <span class="btnLike">
                    <i class="iconfont ${list.isVoted === 1 ? 'icon-dianzanedx' : 'icon-dianzanx'}"></i>
                    <b>${list.voteNum}</b>
                  </span>
                </div>
              </div>`
            } else {
              self.videoId.push(list.id);
              return `<div class="item video masonry-brick video" data-id="${list.id}" data-love="${list.isVoted === 0 ? 1 : 2}">
                <video
                class="videoTag-${list.id}"
                src="${list.path}"
                x5-video-player-type="h5" 
                x5-video-player-fullscreen="true"></video>
                <div class="poster">
                  <img src="/static/imgs/test.png">
                  <i class="iconfont icon-play"></i>
                </div>
                <div class="pick-info">
                  <i class="type iconfont icon-shipinx"></i>
                  <span class="btnLike">
                    <i class="iconfont ${list.isVoted === 1 ? 'icon-dianzanedx' : 'icon-dianzanx'}"></i>
                    <b>${list.voteNum}</b>
                  </span>
                </div>
              </div>`
            }
          });

          $(`#page-${page}`).find('.scroller').append(template.join(''));
          // 获取第一帧作为封面
          for (const val of self.videoId) {
            const $videos = $(`.videoTag-${val}`);
            $videos.on("loadeddata", function (e) {
              const $target = $(e.target);
              const canvas = document.createElement("canvas");
              canvas.width = 335;
              canvas.height = 175;
              canvas.getContext('2d').drawImage(e.target, 0, 0, canvas.width, canvas.height);
              $target.attr("poster", canvas.toDataURL("image/png"));
              $target.siblings('.poster').find('img').attr('src', canvas.toDataURL("image/png") || '/static/imgs/test.png');
            });
          }
          self.playVidoe();
          setInterval(function () {
            $('#masonry').masonry('reload');
          }, 100);
        } else {
          self.showTost(res && res.msg || '网络错误，请稍后重试');
        }
      });
    }

    // 点击查看大图
    previewPic() {
      $('.preview').on('tap', '.item img', (e) => {
        const $target = $(e.target).parents('.item');
        if ($target.hasClass('btnLike') || $target.parents('.btnLike').length) return;
        if ($target.hasClass('video')) return;
        const imgs = [];
        const urls = $target.parents('.preview').find('.item').map((idx, item) => {
          const $current = $(item);
          const url = $current.attr('data-src');
          if (url) {
            imgs.push(url);
          }
          return url;
        });
        if (typeof wx !== 'undefined') {
          wx.previewImage({
            current: $target.data('src') || $target.attr('src'),
            urls: imgs
          });
        }
      });
    }

    wxJssdk() {
      const api = this.api.WX_CONFIG;
      if (/MicroMessenger/i.test(navigator.userAgent)) {

        document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
          WeixinJSBridge.call('hideToolbar');
        });


        $.getScript("https://res.wx.qq.com/open/js/jweixin-1.0.0.js", function callback() {
          $.get(api, res => {
            if (res.ret === 0) {
              const data = res.data;
              console.log('jssdk', data);
              wx.config({
                debug: true,
                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.noncestr,
                signature: data.signature,
                jsApiList: [
                  'onMenuShareTimeline',
                  'onMenuShareAppMessage',
                  'hideMenuItems',
                  'previewImage'
                ]
              });
              alert('data');
              
              wx.ready(function () {
                const shareData = {
                  title: 'Magical moments for Nike Direct FY19 Kick Off Day',
                  link: 'http://photo-moments.xyz/mobile/index',
                  desc: '这是分享的描述部分',
                  imgUrl: 'http://photo-moments.xyz/static/imgs/background.jpg',
                  success: function () {
                    alert('success');
                  },
                  cancel: function () {
                  }
                };
                wx.onMenuShareTimeline(shareData);
                wx.onMenuShareAppMessage(shareData);
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
                console('error', res)
              });
            }
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
        const act = parseInt(_this.attr('data-love'));
        _this.addClass('disabled');
        $.post(url, {
          id,
          act
        }, function (res) {
        if (res.ret === 0) {
          if (act === 1) {
            _this.find('.btnLike b').text(parseInt(_this.find('b').text()) + 1);
            _this.find('.btnLike i').addClass('icon-dianzanedx').removeClass('icon-dianzanx');
            _this.removeAttr('love');
            _this.attr('data-love', 2);
            self.showTost('已点赞');
          } else {
            _this.find('.btnLike b').text(parseInt(_this.find('b').text()) - 1);
            _this.find('.btnLike i').removeClass('icon-dianzanedx').addClass('icon-dianzanx');
            _this.removeAttr('love');
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
      const $playBtn = $('.scroller');
      const $videos = $('.item video');
      $videos.on('playing', e => {
        const $target = $(e.target);
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
        $target.closest('.item').find('.poster i').addClass('icon-play').removeClass('icon-loading1');
      });
      $playBtn.on('tap', '.poster', (e) => {
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
            $("body").append('<aside class="turnBox"><img src="/static/imgs/turn.png" class="turn"><p>请将手机调至竖屏状态，获得最佳浏览体验</p></aside>');
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
        const distance = contentH - scrollH;
        let currentPage = self.currentPage;
        if (distance < 1800 && !self.loading && self.hasMore) {
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
