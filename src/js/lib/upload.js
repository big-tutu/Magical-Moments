$.fn.UploadImg = function (o) {
  console.log(o);
  
  this.change(function () {
    var file = this.files['0'];
    console.log(file);
    
    // $('#error').html(file.type);
    if (file.size && file.size > o.mixsize) {
      o.error('图片尺寸超出限制');
      this.value = '';
    } else if (o.type && o.type.indexOf(file.type) < 0) {
      o.error(o.type);
      this.value = '';
    } else {
      var URL = URL || webkitURL;
      var blob = URL.createObjectURL(file);
      console.log(blob);
      
      // o.before(blob);
      _compress(blob, file);
      this.value = '';
    }
  });


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
      //console.log(file);
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
    }, 'json');
  }
};