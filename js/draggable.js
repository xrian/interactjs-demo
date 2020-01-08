/**
 * Created by zhangsong on 2020/1/8.
 */

const position = { x: 0, y: 0 };

interact.dynamicDrop(true);

// 标记当前拖动元素是否在放置区外
var isDragLeave = false;

interact('#main')
  .dropzone({
    dragleave: function (event) {
      console.log('dropzone dragleave', event);
    }
  })
  .on('dragleave', function (event) {
    console.log('dropzone dragleave', event);
  })
  .on('dragenter', function (event) {
    console.log('dropzone dragenter', event);
  });

function moveEnd(event) {
  console.log('拖动结束', event);
  var target = event.target;
  if (isDragLeave) {
    // 重置标记
    isDragLeave = false;
    // 如果不在main里,提示是否删除
    var flag = window.confirm('你确定从摆放区删除该设备吗?');
    if(flag){
      var id = target.getAttribute('data-id');
      var device = devices[id];
      // 将设备列表中对应的设备重新设置为可以拖动
      var deviceDom = device.dom;
      deviceDom.classList.add('draggable');
      device.drag = null;
      // 删除该元素
      target.remove();
    }else {
      // \删除提示框
      var tips = target.querySelector('p');
      tips && tips.remove();
      // 更新位置属性,默认放置在摆放区起始位置
      var x = target.offsetLeft;
      var y = target.offsetTop;
      target.style.webkitTransform =
        target.style.transform = 'none';
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
  }
}

// 分组可以拖动
var interactGroup = interact('.group').draggable({
  // 拖动使用惯性
  inertia: false,
  // 当拖动到浏览器窗口边缘时,滚动窗口
  autoScroll: true,
  // keep the element within the area of it's parent
  modifiers: [
//    interact.modifiers.restrictRect({
//      restriction: 'parent',
//    }),
  ],

  // call this function on every dragmove event
  onmove: function (event) {
    var target = event.target;
    if(event.dragLeave){
      target.appendChild($('<p class="white">鼠标放下删除该设备</p>')[0]);
      // 标记该元素被脱离父元素
      isDragLeave = true;
    }
    if(event.dragEnter){
      var tips = target.querySelector('p');
      tips && tips.remove();
      // 标记该元素被脱离父元素
      isDragLeave = false;
    }

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
  // call this function on every dragend event
}).on('dragend', moveEnd);

interact('.draggable').draggable({
    // 拖动使用惯性
    inertia: false,
    // 当拖动到浏览器窗口边缘时,滚动窗口
    autoScroll: true,
    // 忽略 button 上面的拖动事件
    ignoreFrom: 'button',
    modifiers: [
//      interact.modifiers.restrictRect({
//        restriction: 'parent',
//        endOnly: true,
//      }),
    ],
    // 启用手动控制
    manualStart: true,
    onmove: function (event) {
      var target = event.target;

      if(event.dragLeave){
        target.appendChild($('<p class="white">鼠标放下删除该设备</p>')[0]);
        // 标记该元素被脱离父元素
        isDragLeave = true;
      }
      if(event.dragEnter){
        var tips = target.querySelector('p');
        tips && tips.remove();
        // 标记该元素被脱离父元素
        isDragLeave = false;
      }

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
  })
  .on('move', function (event) {
    var interaction = event.interaction;
    if (interaction.pointerIsDown && !interaction.interacting()) {
      // 拖动开始时,创建一个新元素
      var original = event.currentTarget;
      // 将设备列表中对应的设备设置为禁止拖动
      original.classList.remove('draggable');
      var id = original.getAttribute('data-id');
      var obj = devices[id];
      if (!obj.drag) {
        // 如果对象中没有位置,说明该对象没有被拖动到摆放区
        // 该元素样式可以自定义
        var drag = $('<div class="flag group" data-id="'+id+'" style="border: 1px solid #ccc;">1<p class="white">请拖放置红框中</p></div>')[0];
        obj.drag = drag;
        mainDom.append(drag);
        interaction.start({ name: 'drag' },
          event.interactable,
          drag);
        isDragLeave = true;
        // 拖动区域距离窗口顶部的距离
        var offsetX = mainDom.offset().left - $(window).scrollLeft();
        var offsetY = mainDom.offset().top - $(window).scrollTop();
        // 将新创建的元素移动到鼠标位置
        var x = parseFloat(event.clientX - offsetX);
        var y = parseFloat(event.clientY - offsetY);
        // translate the element
        drag.style.webkitTransform =
          drag.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';
        // update the posiion attributes
        drag.setAttribute('data-x', x);
        drag.setAttribute('data-y', y);
      }
    }
  }).on('dragend', moveEnd);
