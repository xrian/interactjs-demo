/**
 * Created by zhangsong on 2020/1/8.
 */

const position = { x: 0, y: 0 };

interact.dynamicDrop(true);

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
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true,
      }),
    ],
    manualStart: true,
//  onstart: function (event) {
//    console.log(event.type, event.target);
//    var original = event.currentTarget;
//    var id = original.getAttribute('data-id');
//    console.log(id);
//    var obj = devices[id];
//    if(!obj.position){
//      // 如果对象中没有位置,说明该对象没有被拖动到摆放区
//      var drag = $('<div style="border: 1px solid #ccc">1</div>');
//      obj.drag = drag;
//      mainDom.append(drag);
//      interaction.start({ name: 'drag' },
//        event.interactable,
//        drag);
//    }
//    console.log(event);
//  },
    onmove: function (event) {
      var target = event.target;
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },
    // 拖动结束后执行
    onend: function (event) {
      var textEl = event.target.querySelector('#main');
      if (!textEl) {
        // 如果不在main里,重置到摆放区中
        var current = event.currentTarget;
        console.log(event);
        // 更新位置属性
        var x = current.offsetLeft;
        var y = current.offsetTop;
        current.style.webkitTransform =
          current.style.transform = 'none';
        current.setAttribute('data-x', x);
        current.setAttribute('data-y', y);
      }
    },
  })
  .on('move', function (event) {
    var interaction = event.interaction;
    if (interaction.pointerIsDown && !interaction.interacting()) {
      var original = event.currentTarget;
      var id = original.getAttribute('data-id');
      console.log(id);
      var obj = devices[id];
      if (!obj.drag) {
        // 如果对象中没有位置,说明该对象没有被拖动到摆放区
        // 该元素样式可以自定义
        var drag = $('<div class="flag group" style="border: 1px solid #ccc;background-color: red">1</div>')[0];
        obj.drag = drag;
        mainDom.append(drag);
        interaction.start({ name: 'drag' },
          event.interactable,
          drag);

        // 拖动区域距离窗口顶部的距离
        var offsetX = mainDom.offset().left - $(window).scrollLeft();
        var offsetY = mainDom.offset().top - $(window).scrollTop();
        // 将新穿件的元素移动到鼠标位置
        var x = parseFloat(event.pageX - offsetX);
        var y = parseFloat(event.pageY - offsetY);
        // translate the element
        drag.style.webkitTransform =
          drag.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';
        // update the posiion attributes
        drag.setAttribute('data-x', x);
        drag.setAttribute('data-y', y);
      }
      console.log(event);
    }
  });
//  .dropzone({})
//  .dynamicDrop(true);
