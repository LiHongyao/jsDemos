
const draglist = document.querySelector(".dragsort");
let currentItem;

draglist.addEventListener("dragstart", (e) => {
  e.dataTransfer.effectAllowed = "move";
  currentItem = e.target;
  setTimeout(() => {
    currentItem.classList.add("moving");
  });
});

draglist.addEventListener("dragenter", (e) => {
  e.preventDefault(); // 阻止默认事件
  if (e.target === currentItem || e.target === draglist) {
    // 当移动到当前拖动元素，或者父元素上面我们不做操作
    return;
  }
  let childNodes = Array.from(draglist.childNodes);
  let currentIndex = childNodes.indexOf(currentItem); // 获取到拖动元素的下标
  let targetindex = childNodes.indexOf(e.target); // 获取到目标元素的下标

  if (currentIndex < targetindex) {
    draglist.insertBefore(currentItem, e.target.nextElementSibling);
  } else {
    draglist.insertBefore(currentItem, e.target);
  }
});

draglist.addEventListener("dragover", (e) => {
  e.preventDefault();
});

draglist.addEventListener("dragend", (e) => {
  currentItem.classList.remove("moving");
});
