/**
 * Created by zhangsong on 2020/1/8.
 */

const position = { x: 0, y: 0 };

// 设置可以拖动的空间
//interact('.body').dropzone({});


interact('.draggable').draggable({
  // 拖动使用惯性
  inertia: false,
  // 当拖动到浏览器窗口边缘时,滚动窗口
  autoScroll: true,
  // 忽略 button 上面的拖动事件
  ignoreFrom: 'button',
  modifiers: [
//    interact.modifiers.restrictRect({
//      restriction: 'parent',
//      endOnly: true
//    })
  ],
  onmove: function(event){
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)'

    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
  },
//  listeners: {
//    start(event) {
//      console.log(event.type, event.target);
//    },
//    move(event) {
//      position.x += event.dx;
//      position.y += event.dy;
//
//      event.target.style.transform =
//        `translate(${position.x}px, ${position.y}px)`;
//    },
//  },
  // 拖动结束后执行
  onend: function (event) {
    var textEl = event.target.querySelector('#main');

    textEl && (textEl.textContent =
      'moved a distance of ' +
      (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
        Math.pow(event.pageY - event.y0, 2) | 0))
        .toFixed(2) + 'px')
  }
})
//  .dropzone({})
  .dynamicDrop(true);
