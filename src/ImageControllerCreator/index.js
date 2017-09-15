// import { autobind } from 'core-decorators';

export default class ImageControllerCreator {
  state = {
    scale: 1,
    lastScale: 1,
    offsetX: 0,
    offsetY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
  }

  constructor(element, option = {}) {
    this.target = element;
    this.originalWidth = element.clientWidth;
    this.viewPortWidth = option.viewPortWidth;
    this.viewPortHeight = option.viewPortHeight;
    this.onGetControl = option.onGetControl;
    this.onLoseControl = option.onLoseControl;
  }

  changeTarget(newEle) {
    this.target = newEle;
    this.originalWidth = newEle.clientWidth;
  }

  set(newState) {
    this.preProcess(newState);
    const {
      style,
    } = this.target;
    const {
      offsetX,
      offsetY,
      lastOffsetX,
      lastOffsetY,
      scaleMultiples,
    } = this.state;
    style.transform = `translate3d(calc(${offsetX + lastOffsetX}px - 50%), calc(${offsetY + lastOffsetY}px - 50%), 0) scale(${scaleMultiples})`;
    if (this.onChange) {
      this.onChange(this.state);
    }
    this.state.lastOffsetX = offsetX + lastOffsetX;
    this.state.lastOffsetY = offsetY + lastOffsetY;
  }

  preProcess(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.state.scaleMultiples = this.state.scale;
    const {
      clientWidth,
      clientHeight,
    } = this.target;
    const {
      lastOffsetX,
      lastOffsetY,
      scaleMultiples,
    } = this.state;
    if (scaleMultiples <= 1 && (
      lastOffsetX ||
      lastOffsetY
    )) {
      this.reset();
    }
    this.restrictMovement(
      ((clientWidth * scaleMultiples) - this.viewPortWidth) / 2,
      ((clientHeight * scaleMultiples) - this.viewPortHeight) / 2,
    );
  }

  restrictMovement(xRange, yRange) {
    let isInLimit = true;
    const result = {};
    const {
      offsetX,
      offsetY,
      lastOffsetX,
      lastOffsetY,
    } = this.state;
    if (Math.abs(lastOffsetX + offsetX) > xRange
      && Math.abs(lastOffsetX + offsetX) > Math.abs(lastOffsetX)) {
      result.offsetX = 0;
      result.lastOffsetX = lastOffsetX;
      isInLimit = false;
    }
    if (Math.abs(lastOffsetY + offsetY) > yRange
      && Math.abs(lastOffsetY + offsetY) > Math.abs(lastOffsetY)) {
      result.offsetY = 0;
      result.lastOffsetY = lastOffsetY;
    }
    if (!isInLimit && this.onLoseControl && Math.abs(offsetY) < 5) {
      this.onGetControl();
      this.onLoseControl();
    } else {
      this.onGetControl();
    }
    this.state = {
      ...this.state,
      ...result,
    };
  }

  reset() {
    this.target.style.transition = 'transform 0.1s';
    this.set({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
      lastScale: 1,
    });
    this.target.style.transition = 'transform 0.1s';
  }

  enlargeBytimes(times) {
    const {
      lastScale = 1,
    } = this.state;
    const newScale = times * lastScale;
    if (newScale < 3.5 && newScale > 1) {
      this.set({ scale: newScale });
    } else if (newScale <= 1) {
      this.set({ scale: 1 });
    }
  }

  recordScale() {
    this.set({
      lastScale: this.state.scale,
    });
  }

  move(offset) {
    this.set({
      offsetX: parseInt(offset.deltaX, 10),
      offsetY: parseInt(offset.deltaY, 10),
    });
  }

  record(offset) {
    this.set({
      lastOffsetX: offset.deltaX + this.state.lastOffsetX,
      lastOffsetY: offset.deltaY + this.state.lastOffsetY,
      offsetX: 0,
      offsetY: 0,
    });
  }
}
