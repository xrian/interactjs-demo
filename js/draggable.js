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

// 標記當前拖動元素是否在放置區外
var isDragLeave = false;
var startX = 0;
var startY = 0;

// 隱藏擺放區設備列表
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
  // 點擊隱藏按鈕,將全部設備列表都隱藏
  mainDom.on('click', '.hidden-device-list', function (e) {
    e.preventDefault();
    hiddenMainDeviceListModal();
  });
  // 移除該設備
  mainDom.on('click', '.remove', function (e) {
    e.preventDefault();
    // 獲取到當前點擊設備最外層div
    var dom = this.parentNode.parentNode;
    // 獲取到列表 dom
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
      // 沒有剩下的設備了,清除該div
      listDom.remove();
    }
    syncDevices();
  });
});

// 設置可以放置區域
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
  console.log('拖動結束', event);
  var target = event.target;
  if (isDragLeave) {
    // 重置標記
    isDragLeave = false;
    // 如果不在main里,提示是否刪除
    var flag = window.confirm('你確定從擺放區移除該設備嗎?');
    if (flag) {
      var id = target.getAttribute('data-group-id');

      for (var item in devices) {
        var device = devices[item];
        if (device.groupId == id) {
          // 將設備列表中對應的設備重新設置為可以拖動
          var deviceDom = device.dom;
          deviceDom.classList.add('draggable');
          device.groupId = null;
        }
      }
      // 刪除該元素
      target.remove();
    } else {
      // 刪除提示框
      var tips = target.querySelector('p');
      tips && tips.remove();
      // 更新位置屬性,默認放置在擺放區起始位置
      moveDomByCss(target, startX, startY);
      startX = 0;
      startY = 0;
    }
  }
}

// 分組可以拖動
var interactGroup = interact('.group').draggable({
    // 拖動使用慣性
    inertia: false,
    // 當拖動到瀏覽器窗口邊緣時,滾動窗口
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
        target.appendChild($('<p class="white">鼠標放下移除該設備</p>')[0]);
        // 標記該元素被脫離父元素
        isDragLeave = true;
      }
      if (event.dragEnter) {
        var tips = target.querySelector('p');
        tips && tips.remove();
        // 標記該元素被脫離父元素
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
    var target = event.target;
    startX = target.getAttribute('data-x');
    startY = target.getAttribute('data-y');
    console.log('開始拖動數字', event);
  })
  .on('dragend', moveEnd)
  // 雙擊展開設備列表詳情
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
          '<div class="device-name"><span>設備名稱:</span><span class="green">' + obj.name + '</span></div>' +
          '<div class="device-type"><span>設備類型:</span><span class="green">' + deviceTypeMap[obj.type] +
          '</span></div>' +
          '<div><button type="button" class="remove">移除設備</button></div>' +
          '</div>';
      }
    }
    html = '<div><button type="button" class="hidden-device-list">隱藏</button></div><div class="title"><span>當前位置共<span class="total">' + total + '</span>台設備</span></div>' + html;
    $(target).html(html);
  });

interact('.draggable').draggable({
    // 拖動使用慣性
    inertia: false,
    // 當拖動到瀏覽器窗口邊緣時,滾動窗口
    autoScroll: true,
    // 忽略 button 上面的拖動事件
    ignoreFrom: 'button',
    modifiers: [
//      interact.modifiers.restrictRect({
//        restriction: 'parent',
//        endOnly: true,
//      }),
    ],
    // 啓用手動控制
    manualStart: true,
    onmove: function (event) {
      var target = event.target;

      if (event.dragLeave) {
        target.appendChild($('<p class="white">鼠標放下移除該設備</p>')[0]);
        // 標記該元素被脫離父元素
        isDragLeave = true;
      }
      if (event.dragEnter) {
        var tips = target.querySelector('p');
        tips && tips.remove();
        // 標記該元素被脫離父元素
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
      // 隱藏全部詳情框
      hiddenMainDeviceListModal();
      // 拖動開始時,創建一個新元素
      var original = event.currentTarget;
      // 將設備列表中對應的設備設置為禁止拖動
      original.classList.remove('draggable');
      var id = original.getAttribute('data-id');
      var obj = devices[id];
      if (!obj.groupId) {
        // 如果對象中沒有位置,說明該對象沒有被拖動到擺放區
        // 該元素樣式可以自定義
        var drag = $('<div class="flag group" data-group-id="' + id + '" style="border: 1px solid #ccc;">1<p class="white">請拖放置紅框中</p></div>')[0];
        obj.groupId = id;

        mainDom.append(drag);
        interaction.start({ name: 'drag' },
          event.interactable,
          drag);
        // 標記當前拖動對象在擺放區外
        isDragLeave = true;
        // 將新創建的元素移動到鼠標位置
        var offsetX = mainDom.offset().left - $(window).scrollLeft();
        var offsetY = mainDom.offset().top - $(window).scrollTop();
        var x = parseFloat(event.clientX - offsetX);
        var y = parseFloat(event.clientY - offsetY);
        moveDomByCss(drag, x, y);
      }
    }
  }).on('dragend', moveEnd);
