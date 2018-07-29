
import "../css/admin.scss";
(function (win, $) {
  console.log('test');
  
  class Login {
    constructor () {
      this.init();
    }
    init () {
      const api = '/api/admin/login';
      $('.submit').click(() => {
        const username = $('input[name="username"]').val().trim();
        const password = $('input[name="password"]').val().trim();
        if (!username || !password) {
          alert('用户名或密码不能为空');
          return;
        } else {
          console.log(username, password);
          
          $.post(api, {
            username,
            password
          }, res => {
            if (res.ret === 0) {
              window.location.href = '/admin/index';
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
