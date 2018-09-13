// var vConsole = new VConsole();
$.fn.UploadImg = function (o) {
  this.change(function (e) {
    const files = this.files;


    // input 触发上传
    // 如果是图片
    if (o.type === 'img') {
      let fileArr = Object.keys(files);


      // 图片大小格式判断，数据格式化
      fileArr = fileArr.map(function(cur, idx) {
        const curId = parseInt(Math.random() * 10000);
        const file = files[cur];
        if (file.size < o.mixsize || o.imgType.indexOf(file.type) > 0) {
          return {
            file: file,
            id: curId,
          }
        } else {
          o.showToast('图片尺寸过大大或格式不符');
        } 
      });

      // 当前可添加的数量
      fileArr = fileArr.slice(0, window.canUploadLength);
      o.onChange(fileArr);
      
      this.value = '';
    } else {

      // 视频则直接上传
      uploadFn(files['0'], o);
    } 
  });
};

/**
 * 
 * @param {*} file 上传的文件
 * @param {*} o 上传需要配置项，
 * @param {*} config  一些判断参数，
 */
function uploadFn(file, o, config) {
  const $progress = $('.progress');
  const size = file.size;
  const mediaName = file.name;
  if (o.type === 'video' && size >= o.videoSize) {
    o.showToast(`视频不能超出40M`);
    this.value = '';
    return;
  } else if (o.type === 'video' && o.videoType.indexOf(file.type) < 0) {
    o.error(o.type);
    o.showToast(`请上传mp4格式的视频`);
    this.value = '';
    return;
  } else {

    // formData 上传
    var formData = new FormData();
    formData.append('media', file);
    formData.append('mediaType', o.type === 'img' ? 1 : 2);
    formData.append('corpId', o.corpId);

    $.ajax({
      url: o.url,
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      beforeSend: function () {
        if (o.type === 'video') {
          o.sendBefore && o.sendBefore(file, config);
          $progress.show().animate({ 'width': '600px' }, 1500, 'linear').animate({ 'width': '700px' }, 10000, 'linear');
        } else {
          if (config.cur === 0) {
            o.sendBefore && o.sendBefore(file, config);
          }
        }
      },
      success: function (res) {
        if (o.type === 'video') {
          o.success && o.success(res, config);
          $progress.animate().stop().animate({ 'width': '750px' }, 500, 'linear', () => {
            $progress.hide().css('width', '3px');
          });
        } else {
          if (config.all - 1 === config.cur) {
            o.success && o.success(res, config);
          }
        }
      },
      error: function (res) {
        o.error && o.error(res, config);
        if (o.type === 'video') {
          $progress.hide().css('width', '3px');
        }
      }
    });
    this.value = '';
  }
}


// 图片处理
function _compress(blob, file) {
  var orientation = 0;
  EXIF.getData(file, function () {
    orientation = EXIF.getTag(this, 'Orientation');
  });
  var img = new Image();
  img.src = blob;
  img.onload = function () {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    if (!o.width && !o.height && o.quality == 1) {
      var w = this.width;
      var h = this.height;
    } else {
      var w = o.width || this.width;
      var h = o.height || w / this.width * this.height;
    }
    $(canvas).attr({ width: w, height: h });
    ctx.drawImage(this, 0, 0, w, h);
    var base64 = canvas.toDataURL(file.type, (o.quality || 0.8) * 1);
    if (navigator.userAgent.match(/iphone/i)) {
      var mpImg = new MegaPixImage(img);
      mpImg.render(canvas, { maxWidth: w, maxHeight: h, quality: o.quality || 0.8, orientation: orientation || 0 });
      base64 = canvas.toDataURL(file.type, o.quality || 0.8);
    }

    // 淇android
    if (navigator.userAgent.match(/Android/i)) {
      var encoder = new JPEGEncoder();
      base64 = encoder.encode(ctx.getImageData(0, 0, w, h), o.quality * 100 || 80);
      //alert(base64);
    }
    function exten(file_name) {
      var result = /\.[^\.]{3,}$/.exec(file_name);
      return result;
    }
    if (file.type == '') {
      if (file.fileName == undefined) {
        filepre = base64.split(";")[0].split(":")[1];
      } else {
        var myre = exten(file.fileName),
          fileee = "image/" + myre,
          filepre = fileee.replace('.', '');
      }
    } else {
      var filepre = file.type;
    }
    if (o.url) {
      _ajaximg(base64, filepre);
    } else {
      o.success(base64, filepre);
    }
  };
}

function _ajaximg(base64, type, file) {
  $.post(o.url, {
    media: base64
  }, function (res) {
    o.success(res);
  }, 'form-data');
  var formData = new FormData();
  formData.append('media', type);
  $.ajax({
    type: 'post',
    url: o.url,
    data: formData,
    success: (res) => {
      o.success(res);
    }
  })
}