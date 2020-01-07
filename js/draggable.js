/**
 * Created by zhangsong on 2020/1/8.
 */

const position = { x: 0, y: 0 };

interact('.draggable').draggable({
  // 拖动使用惯性
  inertia: false,
  // 当拖动到浏览器窗口边缘时,滚动窗口
  autoScroll: true,
  // 忽略 button 上面的拖动事件
  ignoreFrom: 'button',
  modifiers: [
    interact.modifiers.restrictRect({
      restriction: 'parent',
      endOnly: true
    })
  ],
  listeners: {
    start(event) {
      console.log(event.type, event.target);
    },
    move(event) {
      position.x += event.dx;
      position.y += event.dy;

      event.target.style.transform =
        `translate(${position.x}px, ${position.y}px)`;
    },
  },
  // 拖动结束后执行
  onend: function (event) {
    var textEl = event.target.querySelector('area');

    textEl && (textEl.textContent =
      'moved a distance of ' +
      (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
        Math.pow(event.pageY - event.y0, 2) | 0))
        .toFixed(2) + 'px')
  }
}).dropzone({
  overlap: 0.5
});
