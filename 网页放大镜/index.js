// -- 触发按钮
const triggerButton = document.querySelector(".triggerButton");
// -- 创建放大镜实例
const magnifier = new Magnifier();
// -- 标识放大镜激活状态
let isActive = false;
triggerButton.onclick = function () {
  // 切换状态
  isActive = !isActive;
  if (isActive) {
    // 挂载放大镜
    magnifier.mount();
  } else {
    // 移除放大镜
    magnifier.destroy();
  }
};
