$.fn.UploadImg = function (o) {
  const patt = /.(jpg|jpeg|png|gif|x-png|bmp|pjpeg)/;
  this.change(function () {
    var file = this.files['0'];
    const mediaName = file.name;
    const flag = patt.test(mediaName);
    if (!flag) {
      // 视频上传
      uploadVideo(file);
      return;
    }
    
    // $('#error').html(file.type);
    if (file.size && file.size > o.mixsize) {
      o.showTips('图片尺寸超出限制');
      this.value = '';
    } else if (o.type && o.type.indexOf(file.type) < 0) {
      o.error(o.type);
      this.value = '';
    } else {
      var URL = URL || webkitURL;
      var blob = URL.createObjectURL(file);
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


  function uploadVideo(file) {
    //限制文件大小
    // const $hint = $('#hint');/
    console.log(file);
    
    var fileSize = file.size;
    if (fileSize >= 1024 * 1024 * 50) {
      // box.msg('上传视频超出大小，请选择小一点的视频！');
      o.showTips('上传视频超出大小，请选择小一点的视频！');
      return false;
    }
    // box.loading('正在上传...');
    //上传文件
    var fd = new FormData();
    fd.append("media", file);
    var xhr = new XMLHttpRequest();
    //进度
    //			xhr.upload.addEventListener("progress", uploadProgress, false);
    //成功返回
    xhr.addEventListener("load", uploadComplete, false);
    //失败返回
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    //请求地址
    xhr.open("POST", o.url);
    console.log(fd);
    
    xhr.send(fd);
  };

  //进度条
  function uploadProgress(evt) {
    if (evt.lengthComputable) {
      //计算进度
      var percent = parseInt(Math.round(evt.loaded * 100 / evt.total));
      $('#progressNumber').html(percent + '%');
      if (percent == 100) {
        $('#progressNumber').hide();
        box.loading('正在处理视频..');
      }
    }
    else {
      box.loading('正在上传...');
    }
  }

  //返回值
  function uploadComplete(evt) {
    console.log(evt);
    
    var data = JSON.parse(evt.target.responseText);
    if (data.ret == 1) {
      //视频信息存储
      save_video(data.path);
      box.close();
      box.msg('上传成功!');
    }
  }
  //视频存入数据库
  function save_video(path) {
    $.post("{:U('TechManager/saveVideo')}", { path: path }, function (data) {
      if (data.ret == false) {
        box.msg('上传失败，请重新尝试！');
      } else {
        path = 'http://huijing10-10046087.video.myqcloud.com' + path;
        save_video_for_tech(data.id);
        album_video(data.id, path);
      }
    }, 'json');
  }
  //显示上传的视频
  function album_video(id, path) {
    //删除之前上传的视频
    del_video();
    //显示上传的视频
    html = '<img src="__IMG__/vd_sing_min.png" style="width: 100%;height:100%" video_id="' + id + '" />'; //审核中封面
    //			html =	'<video  src="' + path + '" video_id="' + id + '" width=100% height=100% poster="'+video_cover+'" >' +	//video标签去掉
    //					'<source src="' + path + '" type="video/ogg">' +
    //					'<source src="' + path + '" type="video/mp4">' +
    //					'<source src="' + path + '" type="video/webm">' +
    //					'<object data="' + path + '" >' +
    //					'<embed  src="' + path + '">' +
    //					'</object>' +
    //					'</video>';
    var album_id = id;
    $('#album_video').attr('album_id', album_id);
    $('#upload_video').html(html);
  }
  function uploadFailed(evt) {
    box.close();
    box.msg('上传失败，请重新尝试！');
  }
  function uploadCanceled(evt) {
    box.close();
    box.msg('上传失败，请重新尝试！');
  }

  //把上传的视频放到数据库
  function save_video_for_tech(album_video) {
    $.post("{:U('TechManager/ajaxPackage')}", { data_type: 3, album_video: album_video }, function (data) {
    });
  }
};