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
  error () {
    $('body').append(`<div class="toast toast-error"><p>${text}</p></div>`);
    $('.toast').addClass('toast-animate');
    setTimeout(() => {
      $('.toast').remove();
    }, 1000);
  },
  warning () {
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
      this.mode = 1;
      this.init();
    }
    async init () {
      // this.pagination();
      await $.get('/api/getMode', res => {
        if (res.ret === 0) {
          const mode = res.data.mode;
          this.mode = mode;
          $(`.options li[data-mode="${mode}"]`).find('a').addClass('active');
        } else {
          toast.error('网络错误，获取业务模式失败');
        }
      });
      this.bindEvents();
      this.getList();
      this.deleteItem();
      this.previePic();
      this.modeSeting();
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
      const url = '/api/media/list';
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
                  <a href="#" class="delete">删除</a>
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
                  <a href="#" class="delete">删除</a>
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
          maskClose: true,
          onOk () {
            $.post(`/api/media/${id}/delete`, res => {
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
        if (mode === self.mode) {
          return;
        }
        dialog.open({
          title: '确认修改模式',
          contentArea: ['280px'],
          maskClose: true,
          contentText: `确认将模式修改为【${mode === 1 ? "仅图片" : '图片和视频'}】模式?`,
          onOk () {
            $.post(`/api/updateMode`,{
              mode
            }, res => {
              if (res.ret === 0) {
                dialog.close();
                $li.find('a').addClass('active');
                $li.siblings().find('a').removeClass('active');
                self.mode = mode;
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


  }
  $(function () {
    new Admin();
  });
})(window, $)