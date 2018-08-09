
// import VConsole from 'vconsole/dist/vconsole.min.js';
// let vConsole = new VConsole();
import "../css/style.scss";
(function (win, $) {
  class App {
    constructor() {
      this.currentList = 'home';
      this.uploadType = {
        imgs: ''
      }
      this.loading = false;
      this.hasMore = true;
      this.isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
      this.currentPage = 1;
      this.api = {
        LIST: '/api/media/list',
        WX_CONFIG: '/api/getConfig',
        UPLOAD: '/api/media/upload',
        MAKE_LOVE: '/api/media/love',
      };
      this.init();
    }
    async init() {
      await $.get('/api/getMode', res => {
        if (res.ret === 0) {
          const mode = res.data.mode;
          this.mode = mode;
          if (mode === 1) {
            $('#filedata').attr('accept', 'image/*');
          }
        } else {
          this.showTost('网络出现故障');
        }
      });



      this.wxJssdk();
      this.main();
      this.renderBanner();
      this.prefix();
      this.waterfallsFlow();
      this.previewPic();
      this.handleLike();
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
        window.location.href = window.location.href;
        this.page('home');
      });

      $('.btn-rank').on('tap', e => {
        e.preventDefault();
        this.page('rank');
      });

      $(window).on('resize', () => {
        setInterval(function () {
          $('#masonry').masonry('reload');
        }, 100);
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
      $activePage.find('.preview').html('');
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
      const self = this;
      const sendData = ops;
      self.loading = true;
      $.get(url, sendData, res => {
        self.loading = false;
        if (res.ret === 0) {
          const data = res.data.dataList;
          // const data = [];
          if (data.length < 20) {
            this.hasMore = false;
          };
          self.hasMore = data.length === 20;
          const template = data.map(list => {
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
              return `<div class="item video masonry-brick" data-id="${list.id}" data-love="${list.isVoted === 0 ? 1 : 2}" data-videoPath="${list.path}">
                <img src="${list.videoCover}">
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
          const $imgWrapper = $(`#page-${page}`).find('.preview');
          $(`#page-${page}`).find('.preview').append(template.join(''));
          if ($imgWrapper.find('.item') .length === 0) {
            const winHeight = $(window).height();
            console.log(winHeight);
            
            let curTop = 0;
            if (page === 'rank') {
              curTop = (winHeight - 200) / 2;
            } else {
              curTop = (winHeight - 550) / 2;
            }
            console.log(curTop);
            
            $imgWrapper.html(`<div class="noResult" style="top: ${curTop}px">
            <p>Start sharing the splendid moments you've captured right now!</p>
            </div>`);
          }
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
      const self = this;
      $('.preview').on('tap', ':not(".btnLike")', (e) => {
        e.preventDefault();
        const $target = $(e.target);
        if ($target.hasClass('btnLike') || $target.parents('.btnLike').length) {
          return;
        }
        const $Item = $target.parents('.item');
        // 如果是视屏，则播放视频
        if ($Item.hasClass('video')){
          const videoPath = $Item.attr('data-videoPath');
          const imgPath = $Item.attr('videoPath');
          self.playVidoeIOS(videoPath, $Item.data('id'));
          
          return false;
        }
        const imgs = [];
        const urls = $Item.parents('.preview').find('.item').map((idx, item) => {
          const $current = $(item);
          const url = $current.attr('data-src');
          if (url) {
            imgs.push(url);
          }
          return url;
        });
        if (typeof wx !== 'undefined') {
          wx.previewImage({
            current: $Item.data('src') || $Item.attr('src'),
            urls: imgs
          });
          return false;
        }
      });
    }

    wxJssdk() {
      const api = this.api.WX_CONFIG;
      if (/MicroMessenger/i.test(navigator.userAgent)) {
        $.getScript("https://res.wx.qq.com/open/js/jweixin-1.0.0.js", function callback() {
          $.get(api, {
            path: window.location.href.split('#')[0]
          }, res => {
            if (res.ret === 0) {
              const data = res.data;
              wx.config({
                debug: false,
                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: [
                  'onMenuShareTimeline',
                  'onMenuShareAppMessage',
                  'hideMenuItems',
                  'previewImage'
                ]
              });
              wx.ready(function () {
                const shareData = {
                  title: 'Photo Moments for FY19 IRM SUMMIT',
                  link: 'http://photo-moments.yxking.xyz/mobile/index',
                  desc: 'Welcome to the Photo Moments for the FY19 IRM SUMMIT, here you can upload and get real-time photos of the meeting!',
                  imgUrl: 'http://photo-moments.yxking.xyz/static/imgs/avatar.png',
                  success: function () {
                    // alert('success');
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
                // window.console('error', res)
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
        const current = _this.closest('.page-rank').length === 1;
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

          // 刷新列表
          if (current) {
            self.page('rank');
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

    // paly
    playVidoeIOS(video, id, callback) {
      const $videoContainer = $('.videoContainer');
      const $video = $videoContainer.find('video');
      $video.attr('src', video);
      $videoContainer.find('.close-icon').show();
      $videoContainer.addClass('active');
      const $newVideo = $('.videoContainer video');
      const $playBtn = $('.scroller');
      $newVideo.on('playing', e => {
        $videoContainer.find('.close-icon').hide();
        $videoContainer.css('opacity', 1);
      });
      if (this.isAndroid) {
        $newVideo[0].play();
        $newVideo[0].addEventListener("x5videoexitfullscreen", function () {
          $videoContainer.find('video').replaceWith(`
          <video 
            id="j-video"
            class="wrapper"
            playsinline 
            webkit-playsinline
            x-webkit-airplay="allow"
            preload="auto"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
          >
            你的浏览器不支持H5播放器
          </video>`);
          $videoContainer.removeClass('active');
          setInterval(function () {
            $('#masonry').masonry('reload');
          }, 100);
        });
      } else {
        $newVideo[0].addEventListener('webkitendfullscreen', function () {
          $videoContainer.removeClass('active');
          setInterval(function () {
            $('#masonry').masonry('reload');
          }, 100);
        });
      }
      // 快熟切换播放视频还未加载导致报错
      setTimeout(() => {
        $newVideo[0].play();
      }, 500);
      $videoContainer.on('tap', (e) => {
        const $target = $(e.target);
        if ($target.hasClass('videoContainer')) {
          e.preventDefault();
          $target.find('video')[0].pause();
          $videoContainer.removeClass('active');
        } else {
          e.preventDefault();
          e.target.pause();
          $videoContainer.removeClass('active');
        }
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
            const $videoContainer = $('.videoContainer');
            if ($videoContainer.hasClass('active')) {
              return;
            }
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
      $('#page-home').on('scroll', function () {
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

    renderBanner () {
      const bannerList = [
        {
          imgUrl: '/static/imgs/banner.png',
          id: 1
        },
        // {
        //   imgUrl: '/static/imgs/banner.png',
        //   id: 2
        // },
        // {
        //   imgUrl: '/static/imgs/banner.png',
        //   id: 3
        // }
      ];
      const sliders = bannerList.map(slide => {
        return `<li id="${slide.id}" class="slider-item openParam" data-param="">
          <div class="img-wrap">
              <img class="banner-image" src="${slide.imgUrl}">
          </div>
        </li>`
      });
      $("#banner").html('');
      $("#banner").html(`<ul class="slider-list">${sliders.join('')}</ul>`);
      $("#banner").slider({
        "autoScroll": true,
        "infinite": true
      });
    }


    bannerList (bannerList) {
      const sliders = bannerList.map(slide => {
        return `<li id="${slide.id}" class="slider-item openParam" data-param="">
          <div class="img-wrap">
              <img class="banner-image" src="${slide.imgPath}">
          </div>
        </li>`
      });

      return `<ul class="slider-list">${sliders.join('')}</ul>`;
    }


  }

  $(function () {
    new App();
  });
})(window, $);
