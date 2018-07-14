export default function setHtmlFontSize() {
    const docEl = document.documentElement
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    const recalc = function () {
      let clientWidth = docEl.clientWidth;
      if (!clientWidth) return;

      //这里是假设在640px宽度设计稿的情况下，1rem = 20px；
      //可以根据实际需要修改
      if (clientWidth > 750) {
        clientWidth = 750;
      }
      docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
    };
  if (!document.addEventListener) return;
  window.addEventListener(resizeEvt, recalc, false);
  document.addEventListener('DOMContentLoaded', recalc, false);
}