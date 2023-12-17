class Magnifier {
  constructor() {
    // -- 类名前缀
    this.prefixCls = "magnifier";
    // -- 放大镜初始尺寸
    this.initialSize = { width: 200, height: 200 };
    // -- 放大镜最小尺寸
    this.minSize = { width: 100, height: 100 };
    // -- 放大镜最大尺寸
    this.maxSize = { width: 500, height: 500 };
    // -- 四周触发拖拽缩放的间距
    this.resizeSpacing = 20;
    // -- 缩放比例
    this.scaleRatio = 2;

    // -- 标识当前是否激活缩放状态
    this.isResizing = false;
    // -- 标识是否从放大镜左侧/上放激活缩放状态
    this.isResizeTopLeft = false;
    // -- 标识当前是否激活拖拽状态
    this.isDragging = false;
    // -- 记录拖拽时的坐标
    this.originalPoint = { x: 0, y: 0 };
    // -- 记录拖拽的尺寸
    this.originalSize = { width: 0, height: 0 };
    // -- 标识原始偏移位置
    this.originalOffset = { x: 0, y: 0 };

    // -- 容器元素
    this.container = null;
    // -- 屏幕截图
    this.screenshots = null;
    // -- 放大镜
    this.magnifier = null;
    // -- 拖拽区域
    this.dragBox = null;
    // -- 放大镜呈现内容
    this.scaleImg = null;
    // -- 截图裁剪区域
    this.cropBox = null;
  }
  // -- 挂载
  mount = () => {
    // -- 移除容器（避免重复调用挂载函数）
    this.container && this.destroy();
    // -- 禁止页面滚动
    document.body.style.overflow = "hidden";
    // -- 创建必要元素
    this._createElement();
    // -- 计算放大镜初始位置（屏幕正中间）
    this._calcMagnifierPosition();
    // -- 计算裁剪区域初始位置（屏幕正中间）
    this._calcCropBoxPosition();
    // -- 获取屏幕截图
    this._getScreenshots();
    // -- 绑定事件（触发开始拖拽/缩放）
    this.dragBox.addEventListener("mousedown", this._onDragStart);
    this.magnifier.addEventListener("mousedown", this._onResizeStart);
  };
  // -- 销毁
  destroy = () => {
    // -- 恢复视窗
    document.body.style.overflow = "auto";
    // -- 移除事件
    this.dragBox.removeEventListener("mousedown", this._onDragStart);
    this.magnifier.removeEventListener("mousedown", this._onResizeStart);

    // -- 移除容器
    this.container?.remove();

    // -- 恢复初始值
    // -- 缩放相关
    this.isResizing = false;
    this.isResizeTopLeft = false;
    this.originalPoint = { x: 0, y: 0 };
    this.originalSize = { width: 0, height: 0 };

    // -- 拖拽相关
    this.isDragging = false;
    this.originalOffset = { x: 0, y: 0 };

    // -- 置空元素
    this.container = null;
    this.magnifier = null;
    this.dragBox = null;
    this.cropBox = null;
    this.scaleImg = null;
    this.screenshots = null;
  };

  // -- 创建必要元素
  _createElement = () => {
    // 1. 创建外层容器（遮罩层）
    const container = document.createElement("div");
    container.setAttribute("data-html2canvas-ignore", "true");
    container.classList.add(this.prefixCls);
    this.container = container;
    // 2. 创建裁剪元素
    const cropBox = document.createElement("div");
    cropBox.style.width = this.initialSize.width / this.scaleRatio + "px";
    cropBox.style.height = this.initialSize.height / this.scaleRatio + "px";
    cropBox.classList.add(this.prefixCls + "__cropBox");
    this.cropBox = cropBox;
    // 3. 创建放大镜元素 & 缩放区域元素
    const magnifier = document.createElement("div");
    magnifier.style.width = this.initialSize.width + "px";
    magnifier.style.height = this.initialSize.height + "px";
    magnifier.classList.add(this.prefixCls + "__magnifier");
    this.magnifier = magnifier;
    // 4. 创建拖拽区域元素
    const dragBox = document.createElement("div");
    dragBox.classList.add(this.prefixCls + "__dragBox");
    dragBox.style.width = "calc(100% - " + this.resizeSpacing * 2 + "px)";
    dragBox.style.height = "calc(100% - " + this.resizeSpacing * 2 + "px)";
    this.dragBox = dragBox;
    // 5. 创建放大图片
    const scaleImg = document.createElement("img");
    scaleImg.classList.add(this.prefixCls + "__scaleImg");
    this.scaleImg = scaleImg;
    // 6. 挂载元素
    magnifier.appendChild(scaleImg);
    magnifier.appendChild(dragBox);
    container.appendChild(magnifier);
    container.appendChild(cropBox);
    document.body.appendChild(container);
  };
  // -- 计算放大镜初始位置（屏幕正中间）
  _calcMagnifierPosition = () => {
    if (!this.magnifier) return;
    const rect = this.magnifier.getBoundingClientRect();
    const x = (window.innerWidth - rect.width) / 2;
    const y = (window.innerHeight - rect.height) / 2;
    this.magnifier.style.left = x + "px";
    this.magnifier.style.top = y + "px";
  };
  //  -- 计算裁剪元素区域初始位置（屏幕正中间）
  _calcCropBoxPosition = () => {
    if (!this.cropBox) return;
    const rect = this.cropBox.getBoundingClientRect();
    const x = (window.innerWidth - rect.width) / 2;
    const y = (window.innerHeight - rect.height) / 2;
    this.cropBox.style.left = x + "px";
    this.cropBox.style.top = y + "px";
  };
  // -- 获取屏幕截图
  _getScreenshots = () => {
    // -- 基于 html2canvas 截取屏幕
    html2canvas(document.body, {
      // 是否允许跨源图像污染画布
      allowTaint: true,
      // 背景颜色
      backgroundColor: "#FFF",
      // 加载图片的超时时间
      imageTimeout: 60 * 1000,
      // 渲染比例，默认为浏览器设备像素比
      scale: this.scaleRatio,
      // 是否尝试使用 CORS 从服务器加载图像
      useCORS: true,
      // 裁剪画布 x 坐标
      x: document.documentElement.scrollLeft,
      // 裁剪画布 y 坐标
      y: document.documentElement.scrollTop,
      // canvas 的宽度
      width: window.innerWidth,
      // canvas 的高度
      height: window.innerHeight,
    }).then((canvas) => {
      canvas.classList.add(this.prefixCls + "__screenshots");
      this.screenshots = canvas;
      this.container?.appendChild(this.screenshots);
      this._updateScaleImg();
    });
  };
  // -- 更新放大镜的内容
  _updateScaleImg = () => {
    // -- 异常处理
    if (!this.cropBox || !this.screenshots || !this.scaleImg) return;
    // -- 获取裁剪区域的盒子信息
    const {
      width: cropBoxW,
      height: cropBoxH,
      left: cropBoxOffsetX,
      top: cropBoxOffsetY,
    } = this.cropBox.getBoundingClientRect();
    // -- 根据裁剪区域的盒子信息 + 缩放比例 计算裁剪放大镜呈现内容的尺寸和位置信息
    const croppedW = cropBoxW * this.scaleRatio;
    const croppedH = cropBoxH * this.scaleRatio;
    const croppedOffsetX = cropBoxOffsetX * this.scaleRatio;
    const croppedOffsetY = cropBoxOffsetY * this.scaleRatio;

    // -- 创建 canvas，用于实现裁剪功能
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = croppedW;
    croppedCanvas.height = croppedH;
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) return;
    croppedCtx.imageSmoothingEnabled = false;
    // -- 基于屏幕快照（源数据）裁剪
    croppedCtx.drawImage(
      this.screenshots,
      croppedOffsetX,
      croppedOffsetY,
      croppedW,
      croppedH,
      0,
      0,
      croppedW,
      croppedH
    );
    // -- 将裁剪后的内容转换成链接
    const url = croppedCanvas.toDataURL("image/jpeg");
    // -- 更新放大镜呈现内容
    this.scaleImg.src = url;
  };
  // -- 开始拖拽
  _onDragStart = (event) => {
    // -- 阻止事件冒泡
    event.stopPropagation();
    // -- 异常处理
    if (!this.container) return;
    // -- 激活拖拽状态
    this.isDragging = true;
    // -- 监听鼠标事件
    this.container.addEventListener("mousemove", this._onDragging);
    this.container.addEventListener("mouseup", this._onDragEnd);
    this.container.addEventListener("mouseleave", this._onDragEnd);
  };
  // -- 拖拽中
  _onDragging = (event) => {
    // -- 阻止事件冒泡
    event.stopPropagation();
    // -- 异常处理
    if (!this.magnifier || !this.cropBox || !this.screenshots || !this.scaleImg)
      return;
    // -- 如果没有激活拖拽状态，不做任何处理
    if (!this.isDragging) return;
    // -- (放大镜）获取当前移动位置
    const { width: magnifierW, height: magnifierH } =
      this.magnifier.getBoundingClientRect();
    let magnifierOffsetX = event.clientX - magnifierW / 2;
    let magnifierOffsetY = event.clientY - magnifierH / 2;
    // -- (放大镜）获取可移动的最大位置
    const magnifierMaxOffsetX = window.innerWidth - magnifierW;
    const magnifierMaxOffsetY = window.innerHeight - magnifierH;
    // -- (放大镜）处理边界（水平/垂直）
    if (magnifierOffsetX < 0) {
      magnifierOffsetX = 0;
    } else if (magnifierOffsetX > magnifierMaxOffsetX) {
      magnifierOffsetX = magnifierMaxOffsetX;
    }
    if (magnifierOffsetY < 0) {
      magnifierOffsetY = 0;
    } else if (magnifierOffsetY > magnifierMaxOffsetY) {
      magnifierOffsetY = magnifierMaxOffsetY;
    }
    // -- (放大镜）更新放大镜的位置
    this.magnifier.style.left = magnifierOffsetX + "px";
    this.magnifier.style.top = magnifierOffsetY + "px";

    // -- (裁剪区域)获取当前移动位置
    const { width: cropBoxW, height: cropBoxH } =
      this.cropBox.getBoundingClientRect();
    let cropBoxOffsetX = event.clientX - cropBoxW / 2;
    let cropBoxOffsetY = event.clientY - cropBoxH / 2;
    // -- (裁剪区域)获取可移动的最大位置
    const cropBoxMaxOffsetX = window.innerWidth - cropBoxW;
    const cropBoxMaxOffsetY = window.innerHeight - cropBoxH;
    // -- (裁剪区域)处理边界（水平/垂直）
    if (cropBoxOffsetX < 0) {
      cropBoxOffsetX = 0;
    } else if (cropBoxOffsetX > cropBoxMaxOffsetX) {
      cropBoxOffsetX = cropBoxMaxOffsetX;
    }
    if (cropBoxOffsetY < 0) {
      cropBoxOffsetY = 0;
    } else if (cropBoxOffsetY > cropBoxMaxOffsetY) {
      cropBoxOffsetY = cropBoxMaxOffsetY;
    }
    // -- (裁剪区域)
    this.cropBox.style.left = cropBoxOffsetX + "px";
    this.cropBox.style.top = cropBoxOffsetY + "px";
    this._updateScaleImg();
  };
  // -- 拖拽结束
  _onDragEnd = (event) => {
    event.stopPropagation();
    this.isDragging = false;
    this.container?.removeEventListener("mousemove", this._onDragging);
    this.container?.removeEventListener("mouseup", this._onDragEnd);
    this.container?.removeEventListener("mouseleave", this._onDragEnd);
  };

  // 开始缩放
  _onResizeStart = (event) => {
    if (!this.magnifier) return;
    // -- 阻止事件冒泡
    event.stopPropagation();
    // -- 激活缩放
    this.isResizing = true;
    // -- 记录鼠标按下时的位置，用于在拖拽过程中计算拖拽的距离
    this.originalPoint = { x: event.clientX, y: event.clientY };
    // -- 记录放大镜的原始尺寸，用于在拖拽过程中计算放大镜的目标尺寸
    const rect = this.magnifier.getBoundingClientRect();
    this.originalSize = { width: rect.width, height: rect.height };

    // 记录鼠标按下时放大镜距离屏幕左上角的位置，用于在向上/向左拖拽时更新放大镜的位置
    this.originalOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    // 判断是否触发向上/向左缩放（因为视图相对于屏幕左上角布局，向左或向上缩放时，除了更新尺寸外，还需动态调整放大镜的位置）
    if (
      this.originalOffset.x <= this.resizeSpacing ||
      this.originalOffset.y <= this.resizeSpacing
    ) {
      this.isResizeTopLeft = true;
    } else {
      this.isResizeTopLeft = false;
    }

    this.container.addEventListener("mousemove", this._onResizing);
    this.container.addEventListener("mouseup", this._onReszieEnd);
    this.container.addEventListener("mouseleave", this._onReszieEnd);
  };

  // -- 缩放中
  _onResizing = (event) => {
    if (!this.magnifier || !this.cropBox || !this.screenshots || !this.scaleImg)
      return;
    // -- 阻止事件冒泡
    event.stopPropagation();
    // -- 如果没有激活缩放状态，不做任何处理
    if (!this.isResizing) return;
    // -- 获取鼠标相对于原点拖拽的距离
    const deltaX = event.clientX - this.originalPoint.x;
    const deltaY = event.clientY - this.originalPoint.y;
    // -- 计算目标尺寸
    let targetWidth = 0;
    let targetHeight = 0;
    if (this.isResizeTopLeft) {
      targetWidth = this.originalSize.width - deltaX;
      targetHeight = this.originalSize.height - deltaY;
    } else {
      targetWidth = this.originalSize.width + deltaX;
      targetHeight = this.originalSize.height + deltaY;
    }
    // -- 边界值处理（判断当前放大镜是否缩放到最大/小尺寸）
    if (
      targetWidth < this.minSize.width ||
      targetHeight < this.minSize.height
    ) {
      this._onReszieEnd();
      return;
    }
    if (
      targetWidth > this.maxSize.width ||
      targetHeight > this.maxSize.height
    ) {
      this._onReszieEnd();
      return;
    }
    // -- 如果是从顶部/左侧缩放，则需动态更新放大镜在屏幕的位置
    if (this.isResizeTopLeft) {
      let x = event.clientX - this.originalOffset.x;
      let y = event.clientY - this.originalOffset.y;
      this.magnifier.style.left = x + "px";
      this.magnifier.style.top = y + "px";
    }
    // -- 更新放大镜尺寸
    this.magnifier.style.width = targetWidth + "px";
    this.magnifier.style.height = targetHeight + "px";

    // -- 更新裁剪区域的尺寸和位置
    const cropBoxW = targetWidth / this.scaleRatio;
    const cropBoxH = targetHeight / this.scaleRatio;

    this.cropBox.style.width = cropBoxW + "px";
    this.cropBox.style.height = cropBoxH + "px";

    const { top, left, width, height } = this.magnifier.getBoundingClientRect();

    const cropBoxOffsetX = left + (width - cropBoxW) / 2;
    const cropBoxOffsetY = top + (height - cropBoxH) / 2;

    this.cropBox.style.left = cropBoxOffsetX + "px";
    this.cropBox.style.top = cropBoxOffsetY + "px";

    this._updateScaleImg();
  };
  // -- 缩放结束
  _onReszieEnd = () => {
    this.isResizing = false;
    this.container.removeEventListener("mousemove", this._onResizing);
    this.container.removeEventListener("mouseup", this._onReszieEnd);
    this.container.removeEventListener("mouseleave", this._onReszieEnd);
  };
}
