import "../css/admin.scss";


// 确认弹窗
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
    console.log('close');
    
    $('body').css('overflow', 'auto').find('#dialog').remove();
  }
};

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






(function (win, $) {
  class Admin {
    constructor () {
      this.currentPage = 1;
      this.totalCount = null;
      this.isList = $('#listPage').length === 1;
      // this.mode = 1;
      this.config = {};
      this.corpId = window.location.pathname.split('/')[2];
      this.init();
    }
    async init () {
      await $.get('/admin/api/getConfig', res => {
        if (res.ret === 0) {
          const mode = res.data.mode;
          this.config = res.data;
          // this.mode = mode;
          // $(`.options li[data-mode="${mode}"]`).find('a').addClass('active');
          this.handleDataBackFill(res.data);
        } else {
          toast.error('网络错误，获取业务模式失败');
        }
      });
      console.log('init');
      
      this.bindEvents();
      this.previePic();
      this.modeSeting();
      this.slideEvents();
      this.uploadImage();
      // $(`input[name="enableWatermark"][value="1"]`).prop('checked', true)
      if (this.isList) {
        this.getList();
        this.deleteItem();
        this.changeLikeCount();
        this.downLoadSources();
      } else {
        this.wangEditor();
      }
        
    }

    bindEvents () {
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
      $.get(url, sendData, res => {
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
                  <p><span>上传时间：</span><span>2018-20-30</span></p>
                  <p><span>点赞数：</span><span class="like-count">20</span><a class="j-change-like">修改</a></p>
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
                  <p><span>上传时间：</span><span>2018-20-30</span></p>
                  <p><span>点赞数：</span><span class="like-count">20</span><a class="j-change-like">修改</a></p>
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
          self.pagination({
            current: self.currentPage,
            totalData: self.totalCount,
          });
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

    // 模式设置
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
                self.getList();
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


    uploadImage () {
      $('.btn-upload').on('click', e => {
        e.preventDefault();
        try {
          const $currentPage = $(e.target).closest('form');
          if (currentPage === 'watermarkForm') {
            $('#filedata').attr('multiple', true).trigger('click');
          } else {
            $('#filedata').trigger('click');
          }
        } catch (error) {
          $('#filedata').trigger('click');
        }
      });
    }


    downLoadSources () {
      // 单个下载
      $('.content').on('click', '.j-down', e => {
        const $currentItem = $(e.target).closest('.item');
        const imgUrl = $currentItem.find('img').attr('src');
        // 下载
        function downloadIamge(imgUrl, name) {
          var image = new Image()
          // 解决跨域 Canvas 污染问题
          image.setAttribute('crossOrigin', 'anonymous')
          image.onload = function () {
            var canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height

            var context = canvas.getContext('2d')
            context.drawImage(image, 0, 0, image.width, image.height)
            var url = canvas.toDataURL('image/png')

            // 生成一个a元素
            var a = document.createElement('a')
            // 创建一个单击事件
            var event = new MouseEvent('click')

            // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
            a.download = name || '下载图片名称'
            // 将生成的URL设置为a.href属性
            a.href = url

            // 触发a的单击事件
            a.dispatchEvent(event)
          }

          image.src = imgUrl;
        }

        // 调用方式
        // 参数一： 选择器，代表img标签
        // 参数二： 图片名称，可选
        downloadIamge(imgUrl, 'test.png');
      });
    }

    wangEditor () {
      const self = this;
      const E = win.wangEditor;
      this.editor = new E('#editor');
      this.editor.customConfig = {
        menus:[
          'image'
        ],
        uploadImgServer: '/admin/api/uploadPicture',
        uploadImgMaxSize: 3 * 1024 * 1024,
        uploadImgHooks: {
          success: function success(xhr, editor, result) {
            // 图片上传并返回结果，图片插入成功之后触发
          },
          fail: (xhr, editor, result) => {
            // 图片上传并返回结果，但图片插入错误时触发
            console.log('sadasdf');
            return false;
          },
          error: (xhr, editor) => {
            console.log('sadasdf');
            
            return false;
          },
          linkImgCallback: (params) => {
            
          }
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
            console.log(id);
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


    // 对系统配置的内容进行回填，保存
    handleSystemConfig () {
      $('j-save-config').click(e => {
        const $target = $(e.target);
        const $content = $target.closest('.set-page');
        const pageId = $content.data('pageId');
        const sendData = {};
        if (pageId === 1) {
          sendData = {
            ...sendData,
            wxShareDesc: $content.find('name="wxShareDesc"').val().trim(),
            wxShareTitle: $content.find('name="wxShareTitle"').val().trim(),
            wxSharePic: self.config.wxSharePic
          };
        } else if (pageId === 2) {
          sendData = {
            ...sendData,
            enableWatermark: parseInt($content.find('input[type="radio]:checked').val()),
            watermarkPic: self.config.watermarkPic
          };
        } else {
          sendData = {
            ...sendData,
            accountDesc: self.config.accountDesc,
            banners: self.config.banners
          };
        }

        sendData = {
          ...self.config,
          ...sendData
        };
        console.log(sendData);
        $.post('/admin/api/updateConfig', sendData, res => {
          console.log(res);
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
        const bannerTemplate = data.banners.map(item => `<img src="${item}/>`);
        $('.set-account .banners').html(bannerTemplate.join(''));
      }
      data.watermarkPic && $('.set-watermark .waterMarkImg').html(`<img src="${data.watermarkPic}/>`);

      // 活动描述回填
      data.accountDesc && this.editor && this.editor.txt.html(data.accountDesc);
    }





  }
  $(function () {
    new Admin();
  });
})(window, $)