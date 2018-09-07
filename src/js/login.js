
import "../css/admin.scss";
(function (win, $) {
  class Login {
    constructor () {
      this.init();
    }
    init () {
      const api = '/admin/api/login';
      $('.submit').click(() => {
        const username = $('input[name="username"]').val().trim();
        const password = $('input[name="password"]').val().trim();

        const corpId = window.location.pathname.split('/')[2];
        if (!username || !password) {
          alert('用户名或密码不能为空');
          return;
        } else {
          $.post(api, {
            username,
            password,
            corpId
          }, res => {
            if (res.ret === 0) {
              window.location.href = res.data;
            } else {
              alert(res.msg || '网络发生错误，请稍后重试');
            }
          })
        }
      });
    }
  }

  $(function () {
    new Login();
  });
})(window, $)
