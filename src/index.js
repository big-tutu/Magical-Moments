import setHtmlFontSize from './js/rem';
import "./css/style.scss";

class App {
  constructor () {
    this.init();
  }
  init () {
    // setHtmlFontSize();
    this.main();
    this.waterfallsFlow();
    
  }
  main () {
    console.log($('.btnUpload'));
    
    $('.btn-upload').on('touchend', e => {
      e.preventDefault();
      $('#filedata').trigger('click');
    });

    $('.btn-home').on('touchend', e => {
      e.preventDefault();
      this.page('home');
    });

    $('.btn-rank').on('touchend', e => {
      e.preventDefault();
      this.page('rank');
    });

    $('.btn-rules').on('touchend', e => {
      e.preventDefault();
      console.log('sdfasdf');
      
      this.showTip('#page-rules');
    });



    // 上传图片
    $('#filedata').UploadImg({
      url: 'api/picture.php?act=upload',
      width: '750',
      quality: '0.8',
      mixsize: '10000000',
      type: 'image/png,image/jpg,image/jpeg,image/pjpeg,image/gif,image/bmp,image/x-png',
      success: function (res) {
        if (res.code == 1) {
          page('index');
        } else {
          hint(res.msg);
        }
      }
    });
  }

  renderPicker () {
    // const data = [
    //   {
    //     p_id:
    //   }
    // ]
    // let tmplate;

    // for (var i = 0; i < res.data.length; i++) {
    //   template = `<div class="item item-${data[i].p_id} masonry-brick" data-id="${data[i].p_id}" data-src="${data[i].p_picurl}" style="position: absolute; top: 10px; left: 320px;"> 
    //   <img src="${data[i].p_picurl}">
    //   <span class="btnLike"><i class="ico-like"></i> <b>${data[i].p_vote}</b></span>                            
    //   </div>`;
    // };
  }

  // 图片瀑布流
  waterfallsFlow () {
    const $container = $('#masonry');
    const imgWidth = parseInt(window.screen.width) - 20;
    console.log(window.screen);
    
    // $('.item').css("width", `${imgWidth/2}px`);
    console.log(imgWidth);
    
    $container.masonry({
      itemSelector: '.item',
      gutterWidth: 0,
      isResizable: true,
    });
  }
  // 切换页面
  page (active) {
    const $activePage = $("#page-" + active);
    console.log($activePage);
    
    $activePage.addClass("active").siblings(".page").removeClass("active");
  }
  showTip(tipEle, callback, keep) {
    $(tipEle).on('touchstart', e => {
      e.preventDefault();
    })
    // if (!keep) {
    //   $(tipEle).one('tap', function () {
    //     hideTip(this, callback);
    //   });
    // } else {
    //   $(tipEle).find('.btnClose').one('tap', function () {
    //     hideTip(tipEle, callback);
    //   });
    // }
    setTimeout(function () {
      $(tipEle).addClass('active');
    }, 50);
  }
}

new App();