/**
 * Created by zhangsong on 2020/1/8.
 */

function moveDomByCss(dom, x, y) {
  dom.style.webkitTransform =
    dom.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  dom.setAttribute('data-x', x);
  dom.setAttribute('data-y', y);
}

const position = { x: 0, y: 0 };

interact.dynamicDrop(true);

// 标记当前拖动元素是否在放置区外
var isDragLeave = false;

// 隐藏摆放区设备列表
function hiddenMainDeviceListModal() {
  var lists = mainDom.find('.main-device-list-modal');
  if (lists.length > 0) {
    lists.each(function (index, item) {
      var groupId = item.getAttribute('data-group-id');
      var total = 0;
      for (var deviceId in devices) {
        var device = devices[deviceId];
        if (device.groupId == groupId) {
          total += 1;
        }
      }
      item.classList.add('group');
      item.classList.remove('main-device-list-modal');
      item.innerHTML = total;
    });
  }

}

$(function () {
  // 点击隐藏按钮,将全部设备列表都隐藏
  mainDom.on('click', '.hidden-device-list', function (e) {
    e.preventDefault();
    hiddenMainDeviceListModal();
  });
  // 移除该设备
  mainDom.on('click', '.remove', function (e) {
    e.preventDefault();
    // 获取到当前点击设备最外层div
    var dom = this.parentNode.parentNode;
    // 获取到列表 dom
    var listDom = dom.parentNode;
    var id = dom.getAttribute('data-id');
    var device = devices[id];
    var deviceDom = device.dom;
    deviceDom.classList.add('draggable');
    device.groupId = null;
    dom.remove();
    var leftoverDevices = listDom.querySelectorAll('.device-wrapper');
    if (leftoverDevices.length > 0) {
      listDom.querySelector('.total').textContent = leftoverDevices.length;
    } else {
      // 没有剩下的设备了,清除该div
      listDom.remove();
    }
    syncDevices();
  });
});

// 设置可以放置区域
interact('#main')
  .dropzone({
    dragleave: function (event) {
      console.log('dropzone dragleave', event);
    },
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
    var flag = window.confirm('你确定从摆放区移除该设备吗?');
    if (flag) {
      var id = target.getAttribute('data-group-id');

      for (var item in devices) {
        var device = devices[item];
        if (device.groupId == id) {
          // 将设备列表中对应的设备重新设置为可以拖动
          var deviceDom = device.dom;
          deviceDom.classList.add('draggable');
          device.groupId = null;
        }
      }
      // 删除该元素
      target.remove();
    } else {
      // 删除提示框
      var tips = target.querySelector('p');
      tips && tips.remove();
      // 更新位置属性,默认放置在摆放区起始位置
      moveDomByCss(target, target.x0, target.y0);
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
      if (event.dragLeave) {
        target.appendChild($('<p class="white">鼠标放下移除该设备</p>')[0]);
        // 标记该元素被脱离父元素
        isDragLeave = true;
      }
      if (event.dragEnter) {
        var tips = target.querySelector('p');
        tips && tips.remove();
        // 标记该元素被脱离父元素
        isDragLeave = false;
      }

      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      moveDomByCss(target, x, y);
    },
    // call this function on every dragend event
  })
  .on('dragstart', function (event) {
    hiddenMainDeviceListModal();
    console.log('开始拖动数字', event);
  })
  .on('dragend', moveEnd)
  // 双击展开设备列表详情
  .on('doubletap', function (event) {
    event.preventDefault();
    hiddenMainDeviceListModal();
    var target = event.currentTarget;
    target.classList.remove('group');
    target.classList.add('main-device-list-modal');
    var groupId = target.getAttribute('data-group-id');
    var html = '';
    var total = 0;
    for (var item in devices) {
      var obj = devices[item];
      if (obj.groupId == groupId) {
        total += 1;
        html += '<div class="device-wrapper main-draggable" data-id="' + obj.id + '">' +
          '<div class="device-name"><span>设备名称:</span><span class="green">' + obj.name + '</span></div>' +
          '<div class="device-type"><span>设备类型:</span><span class="green">' + deviceTypeMap[obj.type] +
          '</span></div>' +
          '<div><button type="button" class="remove">移除设备</button></div>' +
          '</div>';
      }
    }
    html = '<div><button type="button" class="hidden-device-list">隐藏</button></div><div class="title"><span>当前位置共<span class="total">' + total + '</span>台设备</span></div>' + html;
    $(target).html(html);
  });

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

      if (event.dragLeave) {
        target.appendChild($('<p class="white">鼠标放下移除该设备</p>')[0]);
        // 标记该元素被脱离父元素
        isDragLeave = true;
      }
      if (event.dragEnter) {
        var tips = target.querySelector('p');
        tips && tips.remove();
        // 标记该元素被脱离父元素
        isDragLeave = false;
      }

      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      moveDomByCss(target, x, y);
    },
  })
  .on('move', function (event) {
    var interaction = event.interaction;
    if (interaction.pointerIsDown && !interaction.interacting()) {
      // 隐藏全部详情框
      hiddenMainDeviceListModal();
      // 拖动开始时,创建一个新元素
      var original = event.currentTarget;
      // 将设备列表中对应的设备设置为禁止拖动
      original.classList.remove('draggable');
      var id = original.getAttribute('data-id');
      var obj = devices[id];
      if (!obj.groupId) {
        // 如果对象中没有位置,说明该对象没有被拖动到摆放区
        // 该元素样式可以自定义
        var drag = $('<div class="flag group" data-group-id="' + id + '" style="border: 1px solid #ccc;">1<p class="white">请拖放置红框中</p></div>')[0];
        obj.groupId = id;

        mainDom.append(drag);
        interaction.start({ name: 'drag' },
          event.interactable,
          drag);
        // 标记当前拖动对象在摆放区外
        isDragLeave = true;
        // 将新创建的元素移动到鼠标位置
        var offsetX = mainDom.offset().left - $(window).scrollLeft();
        var offsetY = mainDom.offset().top - $(window).scrollTop();
        var x = parseFloat(event.clientX - offsetX);
        var y = parseFloat(event.clientY - offsetY);
        moveDomByCss(drag, x, y);
      }
    }
  }).on('dragend', moveEnd);
