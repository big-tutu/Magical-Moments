// var vConsole = new VConsole();
$.fn.UploadImg = function (o) {
  const patt = /.(jpg|jpeg|png|gif|x-png|bmp|pjpeg)/;
  const $progress = $('.progress');
  this.change(function (e) {
    const files = this.files;

    if (o.multiple) {
      let fileArr = Object.keys(files);
      if (fileArr.length > 9) {
        o.showTips.error('每次最多上传9个文件');
        fileArr = fileArr.slice(0, 9);
      }
      (function () {
        
      })()
      fileArr.forEach(function (cur)  {

        (function (file, o, params, config) {
          uploadFn(file, o, params, config)
        })(files[cur], o, {
          corpId: o.corpId
        }, { all: fileArr.length, current: cur })
        
      });
    } else {
      uploadFn(files['0'], o);
    } 
  });





  function uploadFn(file, o, params, config) {
    const size = file.size;
    const mediaName = file.name;
    const flag = patt.test(mediaName);
    if (!flag && size >= o.videoSize) {
      o.showTips.error(`视频不能超出40M`);
      this.value = '';
      return;
    } else if (!flag && o.videoType.indexOf(file.type) < 0) {
      o.error && o.error(o.type);
      o.showTips.error(`请上传mp4格式的视频`);
      this.value = '';
      return;
    } else if (flag && size > o.mixsize) {
      o.showTips.error(`图片大小不能大于3M`);
      this.value = '';
      return
    } else if (flag && o.type.indexOf(file.type) < 0) {
      o.error(o.type);
      o.showTips.error(`请上传png/jpg/jpeg格式的图片`);
      this.value = '';
      return
    } else {
      var URL = URL || webkitURL;
      var blob = URL.createObjectURL(file);
      // o.before(blob);
     const result =  _compress(blob, file);
      console.log(result);
      



      var formData = new FormData();
      o.showTips.success('正在上传文件...');
      if (o.multiple) {
        formData.append('media', file);
        formData.append('mediaType', flag ? 1 : 2);
        formData.append('corpId', params.corpId);
      } else {
        formData.append('picture', file);
      }
      
      $.ajax({
        url: o.url,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
          o.sendBefore && o.sendBefore(config);
        },
        success: function (res) {
          o.success(res, config);
        },
        error: function (res) {
          o.error(res, config);
        }
      });
      this.value = '';
    }
  }
}


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
    // if (o.url) {
    //   _ajaximg(base64, filepre);
    // } else {
    //   o.success(base64, filepre);
    // }


    return {
      base: base64,
      filepre: filepre
    }
  };
}