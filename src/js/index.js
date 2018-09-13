
// import VConsole from 'vconsole/dist/vconsole.min.js';
// let vConsole = new VConsole();
import "../css/style.scss";
(function (win, $) {
  win.canUploadLength = 9;
  class App {
    constructor() {
      this.currentList = 'home';
      this.uploadType = {
        imgs: ''
      }
      this.corpId = $('.container').data('corpid') || window.location.pathname.split('/')[2];
      this.currentImages = [];
      this.config = {};
      this.loading = false;
      this.hasMore = true;
      this.isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
      this.currentPage = 1;
      this.api = {
        LIST: '/api/media/list',
        UPLOAD: '/api/media/upload',
        MAKE_LOVE: '/api/media/love',
        BANNER_DATA: '/api/banner/data'
      };
      this.init();
    }
    init() {

      // 获取配置的基本数据，微信分享，站点模式，
      $.get('/api/getConfig', {
        corpId: this.corpId,
        path: window.location.href
      }).then(res => {
        if (res.ret === 0) {
          const data = res.data;
          this.mode = data.mode;
          this.config = data;
          // 回填站点介绍信息
          $('.page-rules .message .messages-content').html(data.accountDesc || `<p>No description</p>`)
          this.wxJssdk();
          this.main();
          this.renderBanner();
          this.prefix();
          this.waterfallsFlow();
          this.previewPic();
          this.handleLike();
          this.showTip();
          this.scrollLoadMore();
          this.handleConfirm();
          this.uploadPageEvents();
          this.getList({
            page: 1,
            patten: 1,
            count: 20
          }, 'home');
        } else {
          this.showToast('网络出现故障');
        }
      })

    }
    main() {
      const self = this;
      const $uploadPreview = $('.upload-preview');
      const $selectWrapper = $('.select-img');
      $('.btn-upload').on('tap', e => {
        e.preventDefault();
        if (self.mode === '2') {
          const $mask = $('.confirm-mask');
          $mask.show().find('.mask-contaner').addClass('show-mask');
          return;
        } else if (self === '3') {
          $('#fileVidoe').trigger('click');
          return;
        }
        $('#fileImage').trigger('click');
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
      $('#fileImage').UploadImg({
        type: 'img',
        showToast: this.showToast,
        mixsize: 1024 * 1024 * 3,
        imgType: 'image/png,image/jpg,image/jpeg,image/pjpeg,image/gif,image/bmp,image/x-png',
        onChange: (fileArr) => {
          $uploadPreview.show();
          $('.img-add.img').remove(); // 移除 添加 图标
          let flag = 0; // 全部图片加载完毕flag

          // 图片预览操作
          fileArr.forEach(function (cur, idx) {
            if(!cur) return;
            const reader = new FileReader();
            reader.onload = function () {
              const result = this.result;   //result为data url的形式
              $selectWrapper.append(
                `<div class="img img${cur.id}" data-id="${cur.id}">
                  <span>
                    <img class="image" src="${result}" alt="">
                  </span>
                  <a class="delete j-delete">+</a>
                  <i class="iconfont icon-loading style="color: rgba(0, 0, 0, .85)""></i>
                </div>`
              );
            }
            reader.onloadend = function () {
              $selectWrapper.find('.iconfont').remove(); // 图片加载完毕移除loading
              flag++;
              if (self.currentImages.length < 9) {
                self.currentImages.push(cur);
              }
              // 本次添加完成，并且多次添加的数量不足9张，保留添加按钮
              if (flag === fileArr.length && self.currentImages.length < 9) {
                flag = 0;
                $selectWrapper.append(`
                <div class="img img-add">
                  <a class="j-delete"><i class="iconfont icon-Addx"></i></a>
                </div>
              `);
              }
            }
            reader.readAsDataURL(cur.file);
          });

        },
      });

      // 上传视频
      $('#fileVidoe').UploadImg({
        url: this.api.UPLOAD,
        width: '750',
        type: 'video',
        showToast: this.showToast,
        quality: '0.8',
        corpId: self.corpId,
        videoSize: 1024 * 1024 * 50,
        videoType: 'video/ogg,video/mp4,video/WebM,video/quicktime,video/x-msvideo',
        sendBefore: () => {
          this.showToast('正在上传文件...');
        },
        success: (res) => {
          if (res.ret === 0) {
            this.showToast('上传成功');
            setTimeout(() => {
              this.page('home');
            }, 500);
            this.currentList = 'home';
          } else {
            this.showToast(res.msg || '上传失败稍后重试');
          }
        },
        error(res) {

        }
      });
    }

    // 上传页面 各种点击事件
    uploadPageEvents() {
      const self = this;
      const $uploadPreview = $('.upload-preview');
      // 确认上传
      $uploadPreview.find('.upload-ok').click(() => {
        const options =  {
          url: this.api.UPLOAD,
          corpId: self.corpId,
          type: 'img',
          showToast: this.showToast,
          sendBefore: (file, config) => {
            $('body').append(`
            <div class="is-img-uploading">
              <i class="iconfont icon-loading" style="color: rgba(0, 0, 0, .85); z-index: 320"></i>
              <p>图片上传中</p>
            </div>`
              );
          },
          success: (res, config) => {
            self.page('home'); // 跳转
            $uploadPreview.hide().find('.select-img').empty();
            win.canUploadLength = 9;
            self.currentImages = [];
            $('.is-img-uploading').remove();
            $uploadPreview.hide().find('.select-img').empty();
          },
          error(res) {
            $('.is-img-uploading').remove();
            this.showToast(res.msg || '上传出现错误');
          }
        }

        // 循环上传所添加的图片
        self.currentImages.forEach((item, index) => {
          uploadFn(item.file, options, { all: self.currentImages.length, cur: index});
        });
      });

      // 删除或者添加
      $uploadPreview.on('click', e => {
        const $target = $(e.target);
        // 确认操作
        if ($target.hasClass('delete')) {
          // 删除图片
          const $parent = $target.closest('.img');
          const id = $parent.data('id');
          $parent.remove();
          self.currentImages = self.currentImages.filter(item => item.id !== id);
          win.canUploadLength = 9 - self.currentImages.length;

          if ($uploadPreview.find('.img-add').length === 0) {
            $uploadPreview.find('.select-img').append(`
              <div class="img img-add">
                <a class="j-delete"><i class="iconfont icon-Addx"></i></a>
              </div> 
            `);
          }
          // $.post(`/admin/api/media/${id}/delete`, {corpId: self.corpId});
        } else if ($target.hasClass('iconfont')) {
          // 新增图片
          win.canUploadLength = 9 - self.currentImages.length;
          $('#fileImage').trigger('click');
        } else if ($target.hasClass('image')) {
          const curUrl = $target.attr('src');
          const urls = Array.from($uploadPreview.find('.image')).map(item => $(item).attr('src'));
          if (typeof wx !== 'undefined') {
            wx.previewImage({
              current: curUrl,
              urls: urls
            });
            return false;
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
    page(active, cb) {
      const $activePage = $("#page-" + active);
      $activePage.addClass("active").siblings(".page").removeClass("active");
      $activePage.find('.preview').html('');
      this.getList({
        page: 1,
        count: active === 'home' ? 20 : 10,
        patten: active === 'home' ? 1 : 2
      }, active, cb && cb);
    }

    // 显示和隐藏活动介绍信息
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

    // 获取资源列表
    getList (ops, page, callback) {
      const url = this.api.LIST;
      const self = this;
      const sendData = {
        ...ops,
        corpId: self.corpId
      };
      self.loading = true;
      $.get(url, sendData, res => {
        self.loading = false;
        if (callback) callback();
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
            let curTop = 0;
            if (page === 'rank') {
              curTop = (winHeight - 200) / 2;
            } else {
              curTop = (winHeight - 550) / 2;
            }
            $imgWrapper.html(`<div class="noResult" style="top: ${curTop}px">
            <p>Start sharing the splendid moments you've captured right now!</p>
            </div>`);
          }
          setInterval(function () {
            $('#masonry').masonry('reload');
          }, 100);
        } else {
          self.showToast(res && res.msg || '网络错误，请稍后重试');
        }
      });
    }

    // 点击查看大图 或播放视频
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
          self.playVidoe(videoPath, $Item.data('id'));
          
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

        // 微信预览
        if (typeof wx !== 'undefined') {
          wx.previewImage({
            current: $Item.data('src') || $Item.attr('src'),
            urls: imgs
          });
          return false;
        }
      });
    }

    // 微信jssdk
    wxJssdk() {
      const self = this;
      const api = self.api.WX_CONFIG;
      const config =  self.config;
      if (/MicroMessenger/i.test(navigator.userAgent)) {
        $.getScript("https://res.wx.qq.com/open/js/jweixin-1.0.0.js", function callback() {
          wx.config({
            debug: false,
            appId: config.appId,
            timestamp: config.timestamp,
            nonceStr: config.nonceStr,
            signature: config.signature,
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'hideMenuItems',
              'previewImage',
              'chooseImage',
              'uploadImage',
              'getLocalImgData',
              'downloadImage'
            ]
          });
          wx.ready(function () {
            const shareData = {
              title: config.wxShareTitle,
              link: config.url,
              desc: config.wxShareDesc,
              imgUrl: config.wxSharePic,
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
          act,
          corpId: self.corpId
        }, function (res) {
        if (res.ret === 0) {
          if (act === 1) {
            _this.find('.btnLike b').text(parseInt(_this.find('b').text()) + 1);
            _this.find('.btnLike i').addClass('icon-dianzanedx').removeClass('icon-dianzanx');
            _this.removeAttr('love');
            _this.attr('data-love', 2);
            self.showToast('已点赞');
          } else {
            _this.find('.btnLike b').text(parseInt(_this.find('b').text()) - 1);
            _this.find('.btnLike i').removeClass('icon-dianzanedx').addClass('icon-dianzanx');
            _this.removeAttr('love');
            _this.attr('data-love', 1);
            self.showToast('已取消点赞');
          }

          // 刷新列表
          if (current) {
            self.page('rank');
          }
        } else {
          self.showToast(res && res.msg || '网络错误请稍后重试');
        }
        setTimeout(function () {
          _this.removeClass('disabled');
        }, 300);
        }, 'json');
      });
    }

    // 视频播放控制
    playVidoe(video, id, callback) {
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

    // 列表滚动加载更多
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


    // Toast 提示
    showToast (text) {
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

    // banner 目前只有一张
    renderBanner () {
      const self = this;
      const bannerList = [
        {
          imgUrl: self.config.bannerDetail,
          id: 1
        },
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

    // 视频类型确认
    handleConfirm () {
      const $mask = $('.confirm-mask');
      const $container = $mask.find('.mask-contaner');
      $container.on('click', 'a', e => {
        const $target = $(e.target);
        if ($target.hasClass('cancel')) {
          $container.removeClass('show-mask');
          $mask.hide();
          return;
        } else if ($target.hasClass('video')) {
          $container.removeClass('show-mask');
          $mask.hide();
          $('#fileVidoe').trigger('click');
        } else {
          $container.removeClass('show-mask');
          $mask.hide();
          $('#fileImage').trigger('click');
        }
      })
    }



  }

  $(function () {
    new App();
  });
})(window, $);
