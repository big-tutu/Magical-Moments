import "../css/admin.scss";

(function (win, $) {
  class Admin {
    constructor () {
      this.currentPage = 1;
      this.totalCount = null;
      this.init();
    }
    init () {
      // this.pagination();
      // this.menu();
      this.getList();
      this.deleteItem();
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
                  <video controls poster="imgs/timg.jpg" src="${item.path}"></video>
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
          self.pagination({
            current: self.currentPage,
            totalData: self.totalCount,
          });
        } else {
          alert(res.msg || '网络错误，稍后重试');
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

    // // 唤起菜单
    // menu () {
    //   const $menu = $('.dropdown-menu');
    //   $('.user-info').mouseenter(e => {
    //     e.stopPropagation();
    //     $('.dropdown-menu').stop().slideDown();
    //   });
    //   $('.user-info').mouseleave(e => {
    //     e.stopPropagation();
    //     $('.dropdown-menu').stop().slideUp();
    //   });
    // }

    // // 退出登录
    // logout () {
    //   $('.logout').click(() => {

    //   });
    // }

    // 删除
    deleteItem () {
      const self = this;
      $('.content').on('click', '.delete', e => {
        const id = $(e.target).closest('.item').data('id');
        console.log(id);
        
        $.post(`/api/media/${id}/delete`,res => {
          if (res.ret === 0) {
            const sendData = {
              count: 20,
              page: this.currentPage,
              patten: 1
            };
            self.getList(sendData);
          } else {
            alert(res && res.msg || '网络错误，稍后重试');
          }
        });
      })
    }
  }
  $(function () {
    new Admin();
  });
})(window, $)