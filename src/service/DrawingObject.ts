import { Color, DrawingObjectType, Shape } from '../types/drawing';
import { nanoid } from 'nanoid';

export class DrawingObject {
  private id = nanoid();
  path: { xRatio: number; yRatio: number }[] = [];
  constructor(
    private color: Color,
    private shape: Shape,
    private isTemporaryDrawing: boolean,
  ) {}

  addPath(path: { xRatio: number; yRatio: number }) {
    this.path.push(path);
  }

  getId() {
    return this.id;
  }

  get(): DrawingObjectType {
    const { id, path, color, shape, isTemporaryDrawing } = this;
    return {
      id,
      path,
      color,
      shape,
      isTemporaryDrawing,
    };
  }
}
