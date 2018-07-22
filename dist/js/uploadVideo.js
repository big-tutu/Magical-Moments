//上传视频
$(function () {
  $('#upload_video').click(function () {
    $('#upload_video_').click();
  });

  $('#upload_video_').bind('change', function (evt) {
    //限制文件大小
    var fileSize = document.getElementById('upload_video_').files[0].size;
    if (fileSize >= 1024 * 1024 * 20) {
      box.msg('上传视频超出大小，请选择小一点的视频！');
      return false;
    }
    box.loading('正在上传...');
    //上传文件
    var fd = new FormData();
    fd.append("fileToUpload", document.getElementById('upload_video_').files[0]);
    var xhr = new XMLHttpRequest();
    //进度
    //			xhr.upload.addEventListener("progress", uploadProgress, false);
    //成功返回
    xhr.addEventListener("load", uploadComplete, false);
    //失败返回
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    //请求地址
    xhr.open("POST", "{:U('Upload/upload_video_form_tx')}");
    xhr.send(fd);
  });

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
  //删除视频
  function del_video() {
    var video_id = $('#upload_video').find('img').attr('video_id');
    if (video_id) {
      $.post("{:U('TechManager/album_video_del')}", { 'video_id': video_id }, function (ret) {
      });
    }
  }
});