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
      uploadFn(files['0'], o, {
        corpId: o.corpId
      });
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
      o.showTips.error(`图片大小不能大于2M`);
      this.value = '';
      return
    } else if (flag && o.type.indexOf(file.type) < 0) {
      o.error(o.type);
      o.showTips.error(`请上传png/jpg/jpeg格式的图片`);
      this.value = '';
      return
    } else {
      var formData = new FormData();
      o.showTips.success('正在上传文件...');
      if (o.multiple) {
        formData.append('media', file);
        formData.append('mediaType', flag ? 1 : 2);
      } else {
        formData.append('picture', file);
      }
      formData.append('corpId', params.corpId);
      
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
