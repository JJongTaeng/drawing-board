export enum Color {
  RED = '#e33b24',
  GREEN = '#24e360',
  BLUE = '#2647de',
  YELLOW = '#e5eb38',
  PURPLE = '#a70dd6',
}

export enum Shape {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  PEN = 'PEN',
}

export interface PenType {
  color: Color;
  shape: Shape;
  isTemporaryDrawing: boolean;
}
export interface DrawingObjectType extends PenType {
  path: { xRatio: number; yRatio: number }[];
  id: string;
}
