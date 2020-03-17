export function dragBox(oBox) {
    oBox.onmousedown = event => {
        document.onmousemove = event => {
            oBox.style.left = oBox.offsetLeft + event.movementX + 'px';
            oBox.style.top = oBox.offsetTop + event.movementY + 'px';
        }
        document.onmouseup = event => {
            document.onmousemove = null;
        }
    }
}

export function dragCorners(oBox, aBtn) {
    aBtn.forEach(btn => {
        btn.onmousedown = event => {
            let oldWidth = oBox.offsetWidth;
            let oldHeight = oBox.offsetHeight;
            let oldX = event.clientX;
            let oldY = event.clientY;
            let oldLeft = oBox.offsetLeft;
            let oldTop = oBox.offsetTop;
            event.stopPropagation();
            // 监听鼠标移动    
            document.onmousemove = event => {
                switch (event.target.id) {
                    // 左上角
                    case "tl-btn": {
                        oBox.style.width = oldWidth - (event.clientX - oldX) + 'px';
                        oBox.style.height = oldHeight - (event.clientY - oldY) + 'px';
                        oBox.style.left = oldLeft + (event.clientX - oldX) + 'px';
                        oBox.style.top = oldTop + (event.clientY - oldY) + 'px';
                    } break;
                    // 左下角
                    case "bl-btn": {
                        oBox.style.width = oldWidth - (event.clientX - oldX) + 'px';
                        oBox.style.height = oldHeight + (event.clientY - oldY) + 'px';
                        oBox.style.left = oldLeft + (event.clientX - oldX) + 'px';
                        oBox.style.bottom = oldTop + (event.clientY + oldY) + 'px';
                    } break;
                    // 右上角
                    case "tr-btn": {
                        oBox.style.width = oldWidth + (event.clientX - oldX) + 'px';
                        oBox.style.height = oldHeight - (event.clientY - oldY) + 'px';
                        oBox.style.right = oldLeft - (event.clientX - oldX) + 'px';
                        oBox.style.top = oldTop + (event.clientY - oldY) + 'px';
                    } break;
                    // 右下角
                    case "br-btn": {
                        oBox.style.width = oldWidth + (event.clientX - oldX) + 'px';
                        oBox.style.height = oldHeight + (event.clientY - oldY) + 'px';
                        oBox.style.right = oldLeft - (event.clientX - oldX) + 'px';
                        oBox.style.bottom = oldTop + (event.clientY + oldY) + 'px';
                    } break;
                }
            }
            // 监听鼠标抬起
            document.onmouseup = event => {
                document.onmousemove = null;
            }
            return false;
        }
    });
}