import "../css/admin.scss";


// 弹窗
const dialog = {
  open (options) {
    $('body').css('overflow', 'hidden').append(
      `<div id="dialog" class="dialog-mask">
        <div class="content-layout">
          <div class="dialog-title">${options.title}</div>
          <div class="dialog-content"  style="width:${options.contentArea[0] || '400px'}; height:${options.contentArea[1] || 'auto'}; overflow: auto">
            ${options.contentText}
          </div>
          <div class="dialog-footer">
            <button class="dialog-cancel">${options.cancelText || '取消'}</button>
            <button class="dialog-ok">${options.okText || '确定'}</button>
          </div>
        </div>
      </div>`
    );
    this.onClick(options);
  },

  onClick(options) {
    $("#dialog").on('click', e => {
      const $target = $(e.target);
      if ($target.hasClass('dialog-ok')) {
        this.onOk(options);
      } else if ($target.hasClass('dialog-cancel')) {
        this.onCancel(options);
      } else if ($target.hasClass('dialog-mask')) {
        if (options.maskClose) {
          this.close();
        }
      }
    });
  },
  onOk (options) {
    options.onOk && options.onOk();
  },
  onCancel (options) {
    options.onCancel && options.onCancel();
    $('body').css('overflow', 'auto').find('#dialog').remove();
  },
  close() {
    $('body').css('overflow', 'auto').find('#dialog').remove();
  }
};

// 页面loading
const loading = {
  show () {
    $('body').append(`
      <div class="loading-cmp">
        <i class="iconfont icon-loading"></i>
      </div>
    `)
  },
  hide () {
    $('.loading-cmp').remove();
  }
}


// 全局toast 提示
const toast = {
  success (text) {
    $('body').append(`<div class="toast toast-success"><p>${text}</p></div>`);
    $('.toast').addClass('toast-animate');
    setTimeout(() => {
      $('.toast').remove();
    }, 1000);
  },
  error(text) {
    $('body').append(`<div class="toast toast-error"><p>${text}</p></div>`);
    $('.toast').addClass('toast-animate');
    setTimeout(() => {
      $('.toast').remove();
    }, 1000);
  },
  warning(text) {
    $('body').append(`<div class="toast toast-warning"><p>${text}</p></div>`);
    $('.toast').addClass('toast-animate');
    setTimeout(() => {
      $('.toast').remove();
    }, 1000);
  }
};

// 时间格式
function timeFormdata(params) {
  const time = new Date(params);
  const year = time.getFullYear();
  let mounth = time.getMonth();
  let day = time.getDate();
  mounth = mounth < 9 ? `0${mounth + 1}` : mounth + 1;
  day = day < 10 ? `0${day}` : day;
  return `${year}-${mounth}-${day}`;
}






(function (win, $) {
  class Admin {
    constructor () {
      this.currentPage = 1;
      this.totalCount = null;
      this.isList = $('#listPage').length === 1;
      this.pageId = 0;
      this.config = {};
      this.corpId = window.location.pathname.split('/')[2];
      this.init();
    }
    async init () {
      await $.get('/admin/api/getConfig', { corpId: this.corpId }, res => {
        if (res.ret === 0) {
          const mode = res.data.mode;
          this.config = res.data;
          if (res.data.corpId !== 'N83CXg2Arlw') {
            $('.create_site').hide();
          }
          this.handleDataBackFill(res.data);
        } else {
          toast.error('网络错误，获取业务模式失败');
        }
      });
      this.bindEvents();
      this.modeSeting();
      this.slideEvents();
      this.uploadImage();
      if (this.isList) {
        // 列表页面
        $.get('/admin/api/getData', { corpId: this.corpId }).then(res => {
          if (res && res.ret === 0) {
            $('.btn-group').append(`<p class="baseData">
          图片: <span class="count-img">${res.data.pictureCount}</span> &nbsp;&nbsp;&nbsp; 
          视频: <span class="count-video">${res.data.videoCount}</span> &nbsp;&nbsp;&nbsp;
          浏览量: <span class="view-count">${res.data.accessCount}</span></p>`)
          } else {
            toast.error(res && res.msg || '网络异常，刷新页面');
          }
        });
        this.getList();
        this.deleteItem();
        this.changeLikeCount();
        this.downloadAll();
        this.previePic();
      } else {
        // 系统设置页面
        this.wangEditor();
        this.handleSystemConfig();
      }
    }

    bindEvents () {
      const self = this;
      $('.j-handle-event').click(e => {
        const $parent = $(e.target).closest('.nav-item');
        const $currentUl = $parent.find('ul.options');
        if ($currentUl.hasClass('show')) {
          $currentUl.slideUp().removeClass('show');
          return;
        }
        $parent.siblings().find('ul.options').slideUp().removeClass('show');
        $currentUl.slideDown().addClass('show');
      });

      // 上传图片
      if (!self.isList) {
        $('#filedata').UploadImg({
          url: '/admin/api/uploadPicture',
          width: '750',
          showTips: toast,
          multiple: this.isList,
          quality: '0.8',
          corpId: self.corpId,
          // corpId: 'N83CXg2Arlw',
          mixsize: 1024 * 1024 * 3,
          type: 'image/png,image/jpg,image/jpeg,image/pjpeg,image/gif,image/bmp,image/x-png',
          sendBefore: () => {

          },
          success: (res) => {
            toast.success('上传成功');
            if (res.ret === 0) {
              if (self.pageId === 1) {
                $('.shareImg').html(`<img src=${res.data} alt="">`);
              } else if (self.pageId === 2) {
                $('.waterMarkImg').html(`<img src=${res.data} alt="">`)
              } else {
                $('.banners').html(`<img src=${res.data} alt="">`)
              }
            } else {
              toast.error(res.msg || '上传出现错误');
            }
          },
          error: (res) => {
            toast.error('上传出错');
          }
        });
      } else {
        $('#filedata').UploadImg({
          url: '/admin/api/media/upload',
          width: '750',
          showTips: toast,
          multiple: this.isList,
          quality: '0.8',
          // corpId: 'N83CXg2Arlw',
          corpId: self.corpId,
          mixsize: 1024 * 1024 * 3,
          videoSize: 1024 * 1024 * 50,
          videoType: 'video/ogg,video/mp4,video/WebM,video/quicktime,video/x-msvideo',
          type: 'image/png,image/jpg,image/jpeg,image/pjpeg,image/gif,image/bmp,image/x-png',
          sendBefore: (config) => {
            if (config, config.current === '0') {
              toast.success('开始上传');
            }
          },
          success: (res, config) => {
            if (res.ret !== 0) {
              toast.error(res.msg);
              return;
            }
            if (config && (config.all - 1) === +config.current) {
              toast.success('上传完成');
              this.getList();
            }
          },
          error: (err, config) => {
            if (config) {
              toast.error(`第${config.current}文件上传出错`);
            }
          }
        })
      }
      
    }


    getList (ops = {}) {
      const self = this;
      const url = '/admin/api/media/list';
      const patt = /.(jpg|jpeg|png|gif|x-png|bmp|pjpeg)/;
      const $wrapper = $('.content ul');
      const sendData = {
        page: 1,
        count: 20,
        patten: 1,
        ...ops
      }
      loading.show();
      $.get(url, sendData, res => {
        loading.hide();
        if (res.ret === 0) {
          
          const data = res.data.dataList;
          self.totalCount = res.data.totalCount;
          self.currentPage = sendData.page;
          const template = data.map((item) => {
            const flag = patt.test(item.path);
            if (flag) {
              return `
              <li class="item" data-id="${item.id}">
                <div class="img">
                  <img src="${item.path}" alt="">
                </div>
                <div class="info">
                  <p><span>类型：</span><span>图片</span></p>
                  <p><span>上传时间：</span><span>${timeFormdata(item.createTime)}</span></p>
                  <p><span>点赞数：</span><span class="like-count">${item.voteNum}</span><a class="j-change-like">修改</a></p>
                  <p class="handle">
                    <a class="j-down down">下载</a>
                    <a class="delete">删除</a>
                  </p>
                </div>
              </li>`
            } else {
              return `<li class="item" data-id="${item.id}">
                <div class="img">
                  <video 
                    x5-video-player-type="h5"
                    x5-video-player-fullscreen="true"
                    controls src="${item.path}"></video>
                </div>
                <div class="info">
                  <p><span>类型：</span><span>视频</span></p>
                  <p><span>上传时间：</span><span>${timeFormdata(item.createTime)}</span></p>
                  <p><span>点赞数：</span><span class="like-count">${item.voteNum}</span><a class="j-change-like">修改</a></p>
                  <p class="handle">
                    <a class="j-down down">下载</a>
                    <a class="delete">删除</a>
                  </p>
                </div>
              </li>`
            }
          });

          $wrapper.html(template.join(''));
          window.scrollTo(0, 0);
          if (res.data.totalCount > sendData.count) {
            self.pagination({
              current: self.currentPage,
              totalData: self.totalCount,
            });
          }
        } else {
          toast.error(res.msg || '网络错误，稍后重试');
        }
      })
    }



    // 分页
    pagination (ops) {
      const self = this;
      $(".paginate").pagination(
        {
          // pageCount: 3,
          showData: 20,
          current: ops.current,
          totalData: ops.totalData,
          jump: true,
          isHide: true,
          coping: true,
          homePage: '首页',
          endPage: '末页',
          prevContent: '上页',
          nextContent: '下页',
          callback: function (api) {
            const sendData = {
              page: api.getCurrent(),
              count: 20,
              patten: 1
            };
            self.getList(sendData);
          }
        }
      );
    }


    // 删除
    deleteItem () {
      const self = this;
      $('.content').on('click', '.delete', e => {
        const id = $(e.target).closest('.item').data('id');
        dialog.open({
          contentArea: ['280px'],
          title: '确认删除',
          contentText: '确认要删除该项吗？',
          maskClose: 1,
          onOk () {
            $.post(`/admin/api/media/${id}/delete`, res => {
              if (res.ret === 0) {
                const sendData = {
                  count: 20,
                  page: this.currentPage,
                  patten: 1
                };
                self.getList(sendData);
                dialog.close();
                toast.success('删除成功');
              } else {
                toast.error(res && res.msg || '网络错误，稍后重试');
              }
            });
          },
          onCancel () {
          }
        });
      });
    }



    // 点击查看大图
    previePic () {
      $('.content').on('click', 'img', e => {
        const $target = $(e.target);
        const url = $target.attr('src');
        $('body').append(`<div class="mask">
        <img src="${url}"/>
        </div>`)
      });

      $('body').on('click', '.mask', function () {
        $(this).remove();
      })
    }

    // 业务模式设置
    modeSeting () {
      const self = this;
      $('.modle-seting ul.options').on('click', '.j-mode-item', (e) => {
        const $target = $(e.target);
        const $li = $target.closest('li');
        const mode = $li.data('mode');
        const textStr = $li.text();
        if (mode === self.config.mode) {
          return;
        }
        dialog.open({
          title: '确认修改模式',
          contentArea: ['280px'],
          maskClose: true,
          contentText: `确认将模式修改为【${textStr}】模式?`,
          onOk () {
            $.post(`/admin/api/updateConfig`,{
              ...self.config,
              mode
            }, res => {
              if (res.ret === 0) {
                dialog.close();
                $li.find('a').addClass('active');
                $li.siblings().find('a').removeClass('active');
                self.config.mode = mode;
                toast.success('模式修改成功');
                if (self.isList) {
                  self.getList();
                }
              } else {
                toast.error(res.msg || '网络错误，请稍后重试');
              }
            });
          },
          onCancel () {
            $li.closest('ul.options').slideToggle();
            $li.closest('ul.options').toggleClass('show');
          }
        });
      });
    }


    // 侧边栏交互
    slideEvents() {
      const $slideContainer = $('.photo-slide');
      const $lis = $('.photo-slide .level-2 li');
      $slideContainer.on('click', '.level-2 li a', e => {
        const $currentLi = $(e.target).closest('li');
        $lis.removeClass('active');
        $currentLi.addClass('active');
        const currentSetPage = $currentLi.data('page');
        $(`.set-${currentSetPage}`).show().siblings('.set-page').hide();
      });
    }

    // 资源上传时间
    uploadImage () {
      const self = this;
      $('.btn-upload').on('click', e => {
        e.preventDefault();
        if (self.isList) {
          $('#filedata').trigger('click');
        } else {
          const pageId = $(e.target).closest('.set-page').data('pageid');
          self.pageId = pageId;
          $('#filedata').trigger('click');
        }
      });
    }

    // 下载本页内容
    downloadAll () {
      const corpId = this.config.corpId;
      $('.btn-download').click(() => {
        const ids = Array.from($('.list .item')).map(item => $(item).data('id')).join(',');
        $('#downLoadSource').attr('src', `/admin/api/downloadMedias?mediaIds=${ids}`);
      });
      $('.content').on('click', '.j-down', e => {
        const id = $(e.target).closest('.item').data('id');
        $('#downLoadSource').attr('src', `/admin/api/downloadMedias?mediaIds=${id}`);
      });
    }

    // 编辑器
    wangEditor () {
      const self = this;
      const E = win.wangEditor;
      this.editor = new E('#editor');

      // 配置项
      this.editor.customConfig = {
        menus:[
          'head',
          'bold',
          'image'
        ],
        uploadImgServer: '/admin/api/uploadPicture',
        eshowLinkImg: false,
        uploadImgMaxLength: self.isList ? 9 : null,
        uploadFileName: 'picture',
        uploadImgMaxSize: 3 * 1024 * 1024,
        uploadImgHooks: {
          customInsert: (fn, res, n) => {
            fn(res.data);
          },
        }
      };
      this.editor.create();
      this.editor.txt.html(self.config.accountDesc);
    }


    // 修改点赞数
    changeLikeCount () {
      const self = this;
      $('.list-container').on('click', '.j-change-like', e => {
        const $currentItem = $(e.target).closest('.item');
        const id = $currentItem.data('id');
        dialog.open({
          contentArea: ['280px'],
          title: '修改点赞数',
          contentText: `<input type="number" name="likeCount" class="form-control">`,
          maskClose: false,
          onOk() {
            const count = $('input[name="likeCount"]').val().trim();
            if (!count) {
              toast.warning('点赞数量不能为空');
              return;
            }
            if (!+count) {
              toast.warning('点赞数应该为数字');
              return;
            }
            $.post(`/admin/api/modifyVoteNum`, {
              mediaId: id,
              corpId: self.corpId,
              count: parseInt(count)
            }, res => {
              if (res.ret === 0) {
                toast.success('修改成功');
                $currentItem.find('.like-count').text(count);
                dialog.close();
              } else {
                toast.error(res && res.msg || '网络错误，稍后重试');
              }
            });
          },
          onCancel() {
          }
        });
      });
    }


    // 对系统配置修改保存
    handleSystemConfig () {
      const self = this;
      $('.j-save-config').click(e => {
        e.preventDefault();
        const $target = $(e.target);
        const $content = $target.closest('.set-page');
        const pageId = $content.data('pageid');
        // pageId 分别代表 微信分享设置、水印设置、站点描述和轮播图片设置
        let sendData = {};
        if (pageId === 1) {
          const wxShareDesc = $content.find('#wxShareDesc').val().trim();
          const wxShareTitle = $content.find('input[name="wxShareTitle"]').val().trim();
          const wxSharePic =  $content.find('.shareImg img').attr('src');
          if (!wxShareDesc) {
            toast.error('请填写分享描述');
          }
          if (!wxShareTitle) {
            toast.error('请填写分享标题');
          }
          if (!wxSharePic) {
            toast.error('请上传分享图片');
          }
          sendData = {
            ...sendData,
            wxShareDesc,
            wxShareTitle,
            wxSharePic
          };
        } else if (pageId === 2) {
          const enableWatermark = parseInt($content.find('input[type="radio"]:checked').val());
          const watermarkPic = $content.find('.waterMarkImg img').attr('src');
          if (!watermarkPic) {
            toast.error('请上传水印图片');

            return;
          }
          sendData = {
            ...sendData,
            enableWatermark,
            watermarkPic
          };
        } else {
          const accountDesc =  self.editor.txt.html();
          const banners = $content.find('.banners img').attr('src');
          if (!accountDesc) {
            toast.error('请填写网址介绍信息');
          }
          if (!banners) {
            toast.error('请上传轮播图图片');
          }
          sendData = {
            ...sendData,
            accountDesc,
            banners
          };
        }
        sendData = {
          ...self.config,
          ...sendData
        };
        loading.show();
        $.post('/admin/api/updateConfig', sendData, res => {
          loading.hide();
          if (res.ret === 0) {
            toast.success('更新成功');
          } else {
            toast.error(res.msg || '网络错无情稍后重试');
          }
        });
      });
    }


    // 数据回填
    handleDataBackFill (data) {
      if (data.mode) {
        $(`.options li[data-mode="${data.mode}"]`).find('a').addClass('active');
      } else {
        $(`.options li[data-mode="1"]`).find('a').addClass('active');
      }
      data.wxShareDesc && $('input[name="wxShareDesc"]').val(data.wxShareDesc);
      data.wxShareTitle && $('input[name="wxShareTitle"]').val(data.wxShareTitle);
      if (data.enableWatermark === 1) {
        $(`input[name="enableWatermark"][value="1"]`).prop('checked', true);
      } else {
        $(`input[name="enableWatermark"][value="0"]`).prop('checked', true);
      }
      data.wxShareDesc && $('textarea[name="wxShareDesc"]').val(data.wxShareDesc);

      // 微信分享图片
      data.wxSharePic && $('.set-wx_share .shareImg').html(`<img src="${data.wxSharePic}"/>`);
      
      if (data.banners) {
        const bannerTemplate = [data.banners].map(item => `<img src="${item}"/>`);

        
        $('.set-account .banners').html(bannerTemplate.join(''));
      }
      data.watermarkPic && $('.set-watermark .waterMarkImg').html(`<img src="${data.watermarkPic}"/>`);

      // 活动描述回填
      data.accountDesc && this.editor && this.editor.txt.html(data.accountDesc);
    }

  }
  $(function () {
    new Admin();
  });
})(window, $)