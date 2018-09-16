import "../css/admin.scss"
// 弹窗
const dialog = {
  open(options) {
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
  onOk(options) {
    options.onOk && options.onOk();
  },
  onCancel(options) {
    options.onCancel && options.onCancel();
    $('body').css('overflow', 'auto').find('#dialog').remove();
  },
  close() {
    $('body').css('overflow', 'auto').find('#dialog').remove();
  }
};

// 页面loading
const loading = {
  show() {
    $('body').append(`
      <div class="loading-cmp">
        <i class="iconfont icon-loading"></i>
      </div>
    `)
  },
  hide() {
    $('.loading-cmp').remove();
  }
}


// 全局toast 提示
const toast = {
  success(text) {
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
  class CreateSite {
    constructor () {
      this.init();
    }
    async init () {
      await $.get('/admin/api/getConfig', { corpId: this.corpId }, res => {
        if (res.ret === 0) {
          const mode = res.data.mode;
          this.config = res.data;
          if (res.data.corpId !== 'N83CXg2Arlw') {
            window.location.corpId = `/mobile/${red.data.corpId}/index`;
          }
          if (mode) {
            $(`.options li[data-mode="${mode}"]`).find('a').addClass('active');
          } else {
            $(`.options li[data-mode="1"]`).find('a').addClass('active');
          }
        } else {
          toast.error('网络错误，获取业务模式失败');
        }
      });
      this.bindEvents();
      this.getAccountList();
      this.changeStatus();
      this.modeSeting();
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
      $('.btn-create').click(e => {
        dialog.open({
          title: '创建站点',
          contentArea: ['370px'],
          contentText: `站点名称：<input type="text" name="siteName" class="form-control">`,
          maskClose: false,
          onOk() {
            const accountName = $('input[name="siteName"]').val().trim();
            if (!accountName) {
              toast.warning('站点名称不能为空');
              return;
            }
            $.post(`/admin/api/createAccount`, {
              name: accountName
            }, res => {
              if (res.ret === 0) {
                toast.success('创建成功');
                self.getAccountList();
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


    modeSeting() {
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
          onOk() {
            $.post(`/admin/api/updateConfig`, {
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
          onCancel() {
            $li.closest('ul.options').slideToggle();
            $li.closest('ul.options').toggleClass('show');
          }
        });
      });
    }
    getAccountList () {
      const $listContainer = $('table tbody');
      $.get('/admin/api/accounts').then(res => {
        const listData = res.data.map((item, index) => {
          const time = timeFormdata(item.createTime);
          return (`<tr>
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>${item.username}</td>
              <td><a href="${item.mobileUrl}" target="blank">${item.mobileUrl}</a></td>
              <td><a href="${item.adminUrl}" target="blank">${item.adminUrl}</a></td>
              <td>${time}</td>
              <td><a class="delete-account" data-id="${item.corpId}" data-status="${item.status === 1 ? 0 : 1}">${item.corpId === 1 ? '' : item.status === 1 ? '禁用' : '启用'}</a></td>
            </tr>`);
        });

        if (listData.length === 0) {
          listData.push(`<tr style="textAlign: center">暂无数据</tr>`)
        }
        $listContainer.html(listData.join(''));
      });
    }


    // 启用或者禁用 
    changeStatus () {
      const self = this;
      $('table').on('click', '.delete-account', e => {
        const $target = $(e.target);
        const status = $target.data('status');
        const id = $target.data('id');
        $.post(`/admin/api/accounts/${id}/disable`, {
          disable: status
        }).then(res => {
          if (res.ret === 0) {
            toast.success('操作成功');
            self.getAccountList();
          } else {
            toast.error('网络错误，稍后重试');
          }
        });
      });
    }
  }


  $(function () {
    new CreateSite();
    console.log('rest');
    
  });
})(window, jQuery)
