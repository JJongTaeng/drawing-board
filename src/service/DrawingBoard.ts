import { Color, DrawingObjectType, PenType, Shape } from '../types/drawing';
import { DrawingObject } from './DrawingObject';

export class DrawingBoard {
  penType: PenType = {
    color: Color.RED,
    shape: Shape.PEN,
    isTemporaryDrawing: false,
  };
  temporaryTimeout: any = 0;
  painting = false;
  ctx: CanvasRenderingContext2D | null;
  canvasElement = document.createElement('canvas');

  private drawingObjectList: DrawingObject[] = [];
  private history: DrawingObject[][] = [];
  current: number = -1;
  constructor(private parentElement: HTMLDivElement) {
    this.parentElement = parentElement;
    if (!this.canvasElement) throw new Error('not defined canvasElement');
    this.ctx = this.canvasElement.getContext('2d');
    this.init();
  }

  prev() {
    this.current -= 1;
    this.drawingObjectList = structuredClone(this.history[this.current]);
    this.redraw();
  }

  next() {
    this.current += 1;
    this.drawingObjectList = structuredClone(this.history[this.current]);
    this.redraw();
  }

  unmount() {
    this.parentElement.removeChild(this.canvasElement);
  }

  private init() {
    this.canvasElement.style.display = 'block';

    this.canvasElement.addEventListener(
      'mousedown',
      this.mousedown.bind(this),
      false,
    );
    this.canvasElement.addEventListener(
      // 마우스 up
      'mouseup',
      this.mouseup.bind(this),
      false,
    );
    this.canvasElement.addEventListener(
      'mousemove',
      this.mousemove.bind(this),
      false,
    );

    // TODO: 디바운스 무조건 걸어야됌
    window.addEventListener('resize', () => {
      this.resize();
      this.redraw();
    });

    document.addEventListener('mouseout', (e) => {
      // 마우스 브라우저 창 밖으로 이동
      if (!e.relatedTarget) {
        if (this.painting) {
          this.mouseup();
        }
      }
    });
    this.canvasElement.addEventListener('mouseout', (e) => {
      if (this.painting) {
        this.mouseup();
      }
    });
    this.resize();
    this.setPenType();
    this.parentElement.append(this.canvasElement);
  }
  private draw(e: MouseEvent) {
    if (!this.ctx) throw new Error('not defined ctx');
    const xRatio =
      (e.offsetX - this.canvasElement.offsetLeft) /
      (this.canvasElement.width / window.devicePixelRatio);
    const yRatio =
      (e.offsetY - this.canvasElement.offsetTop) /
      (this.canvasElement.height / window.devicePixelRatio);

    this.ctx.lineTo(
      xRatio * (this.canvasElement.width / window.devicePixelRatio),
      yRatio * (this.canvasElement.height / window.devicePixelRatio),
    );
    this.ctx.stroke();

    // 이 부분이 추가되면 선이 더욱 부드러워집니다.
    this.ctx.beginPath();
    this.ctx.moveTo(
      xRatio * (this.canvasElement.width / window.devicePixelRatio),
      yRatio * (this.canvasElement.height / window.devicePixelRatio),
    );

    this.drawingObjectList[this.drawingObjectList.length - 1].addPath({
      xRatio,
      yRatio,
    });
  }

  private setPenType() {
    if (!this.ctx) throw new Error('not defined ctx ');
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.penType.color;
  }

  private mousedown(e: MouseEvent) {
    if (this.current !== this.history.length - 1) {
      this.history = this.history.slice(0, this.current + 1);
    }
    this.painting = true;
    this.drawingObjectList.push(
      new DrawingObject(
        this.penType.color,
        this.penType.shape,
        this.penType.isTemporaryDrawing,
      ),
    );

    this.draw(e);
  }

  private mousemove(e: MouseEvent) {
    if (this.painting) {
      clearTimeout(this.temporaryTimeout);
      this.draw(e);
    }
  }

  private mouseup() {
    this.painting = false;
    this.ctx?.beginPath();
    if (this.penType.isTemporaryDrawing) {
      this.temporaryTimeout = setTimeout(() => {
        this.drawingObjectList = [];
        this.redraw();
      }, 3000);
    }

    this.current += 1;
    this.history.push(structuredClone(this.drawingObjectList));
  }

  private resize() {
    const rect = this.parentElement.getBoundingClientRect(); // 부모 요소의 크기 가져오기

    // 캔버스의 스타일 사이즈를 부모 요소의 사이즈에 맞게 조정합니다.
    this.canvasElement.style.width = rect.width + 'px';
    this.canvasElement.style.height = rect.height + 'px';

    const dpr = window.devicePixelRatio || 1; // device pixel ratio 가져오기

    // 캔버스의 실제 픽셀 사이즈를 device pixel ratio를 고려하여 조정합니다.
    this.canvasElement.width = rect.width * dpr;
    this.canvasElement.height = rect.height * dpr;

    // context scale을 device pixel ratio로 설정합니다.
    this.ctx!.scale(dpr, dpr);
  }

  private redraw() {
    this.setPenType();
    const widthRatio = this.canvasElement.width / window.devicePixelRatio;
    const heightRatio = this.canvasElement.height / window.devicePixelRatio;
    if (!this.ctx) throw new Error();
    this.ctx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height,
    ); // 캔버스 초기화

    for (let i = 0; i < this.drawingObjectList.length; i++) {
      // 모든 경로 순회
      const drawingObject = this.drawingObjectList[i];
      const path = drawingObject.path;
      if (path.length === 0) continue;

      // 각 선의 시작점 설정
      this.ctx.beginPath();
      this.ctx.moveTo(
        path[0].xRatio * widthRatio,
        path[0].yRatio * heightRatio,
      );

      for (var j = 1; j < path.length; j++) {
        // 각 경로의 모든 점 순회
        const point = path[j];
        const prevPoint = path[j - 1];

        for (var t = 0; t <= 1; t += 0.02) {
          const interX =
            prevPoint.xRatio * widthRatio * (1 - t) +
            point.xRatio * widthRatio * t;
          const interY =
            prevPoint.yRatio * heightRatio * (1 - t) +
            point.yRatio * heightRatio * t;

          this.ctx.lineTo(interX, interY);
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.moveTo(interX, interY);
        }
      }
    }
    this.ctx.beginPath();
  }
}
