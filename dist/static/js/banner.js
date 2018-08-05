/*
 * slider
 */
;
(function ($) {
  $.extend($.fn, {
    slider: function (obj) {
      this.each(function () {
        // 当前Zepto对象
        var $self = $(this);
        var dom = {
          "wrap": $self.find(".slider-list"),
          "item": $self.find(".slider-item"),
          "firstItem": $self.find(".slider-item").first(),
          "lastItem": $self.find(".slider-item").last(),
          "pagelist": null,
          "pageItem": null,
        };
        var settings = {
          "len": dom.item.length,
          "width": dom.wrap.width(),
          "startX": 0,
          "startY": 0,
          "index": obj ? (obj.infinite ? 1 : 0) : 0,
          "distance": 0,
          "timer": null,
          "autoScroll": obj ? (obj.autoScroll ? true : false) : false,
          "infinite": obj ? (obj.infinite ? true : false) : false
        };
        var funs = {
          init: function () {
            if (settings.len > 1) {
              funs.initUI();
              funs.bindEvent();
              if (settings.autoScroll) {
                settings.timer = setInterval(funs.autoAnimate, 3000);
              }
            }
          },
          initUI: function () {
            if (settings.infinite) {
              var cloneFisrt = dom.firstItem.clone();
              var cloneLast = dom.lastItem.clone();
              dom.wrap.append(cloneFisrt);
              cloneLast.insertBefore(dom.firstItem);
            }
            funs.creatPage();
            dom.item = $self.find(".slider-item");
            settings.count = dom.item.length;
            settings.distance = settings.width / 5;
            if (settings.infinite) {
              dom.wrap.css("-webkit-transform", "translate3d(" + -settings.width + "px,0,0)");
            }
          },
          creatPage: function () {
            var pagelist = '<div class="slider-page"><ul>';
            for (var i = 0; i < settings.len; i++) {
              if (i == 0) {
                pagelist += '<li class="active"></li>';
              } else {
                pagelist += '<li></li>';
              }
            }
            pagelist += '</ul></div>';
            $self.append(pagelist);
            dom.pagelist = $self.find(".slider-page");
            dom.pageItem = dom.pagelist.find("li");
          },
          bindEvent: function () {
            $self.off().on({
              "touchstart": function (e) {
                e.stopPropagation();
                clearInterval(settings.timer);
                settings.startX = e.touches ? e.touches[0].pageX : e.originalEvent.touches[0].pageX;
                settings.startY = e.touches ? e.touches[0].pageY : e.originalEvent.touches[0].pageY;
              },
              "touchmove": function (e) {
                e.stopPropagation();
                e.preventDefault();
                var curX = e.touches ? e.touches[0].pageX : e.originalEvent.touches[0].pageX;
                var curY = e.touches ? e.touches[0].pageY : e.originalEvent.touches[0].pageY;
                var moveX = curX - settings.startX;
                var moveY = curY - settings.startY;
                //避免禁用了下拉事件
                if (Math.abs(moveY) > Math.abs(moveX)) {
                  window.event.returnValue = true;
                }
                var x = -settings.index * settings.width + moveX;
                dom.wrap.css("-webkit-transform", "translate3d(" + x + "px,0,0)");
              },
              "touchend": function (e) {
                e.stopPropagation();
                var curX = e.changedTouches ? e.changedTouches[0].pageX : e.originalEvent.changedTouches[0].pageX;
                var moveX = curX - settings.startX;
                if (Math.abs(moveX) >= settings.distance) {
                  settings.index = settings.index - Math.abs(moveX) / moveX; //判断是向左还是向右
                }
                if (settings.index >= settings.count - 1) {
                  settings.index = settings.count - 1;
                }
                if (settings.index <= 0) {
                  settings.index = 0;
                }
                funs.animate();
                if (settings.autoScroll) {
                  settings.timer = setInterval(funs.autoAnimate, 3000);
                }
              },
              "touchcancel": function (e) {
                dom.wrap.css("-webkit-transform", "translate3d(" + -settings.index * settings.width + "px,0,0)");
              },
              "webkitTransitionEnd": function (e) {
                e.stopPropagation();
                e.preventDefault();
                dom.wrap.removeClass("transitionable");
                if (settings.infinite) {
                  if (settings.index <= 0) {
                    settings.index = settings.count - 2;
                  }
                  if (settings.index >= settings.count - 1) {
                    settings.index = 1;
                  }
                }
                var itemIndex = settings.infinite ? settings.index - 1 : settings.index;
                dom.pageItem.removeClass("active");
                dom.pageItem.eq("" + itemIndex + "").addClass("active");
                dom.wrap.css("-webkit-transform", "translate3d(" + -settings.index * settings.width + "px,0,0)");
              }
            });
            $(window).on({
              "resize": function () {
                console.log(settings);
                
                // setTimeout(() => {
                //   // funs.adjustPos();
                // }, 500);
              },
              "orientationchange": function () {
                setTimeout(() => {
                  funs.adjustPos();
                }, 500);
              }
            })
          },
          adjustPos: function () {
            settings.width = dom.wrap.width();
            settings.distance = settings.width / 5;
            dom.wrap.css("-webkit-transform", "translate3d(" + -settings.index * settings.width + "px,0,0)");
          },
          animate: function () {
            dom.wrap.addClass("transitionable");
            dom.wrap.css("-webkit-transform", "translate3d(" + -settings.index * settings.width + "px,0,0)");
          },
          autoAnimate: function () {
            if (settings.width > 0) {
              settings.index++;
              funs.animate();
            }
          }
        };

        funs.init();
      });
      return this;
    }
  });
})(window.jQuery || window.Zepto);