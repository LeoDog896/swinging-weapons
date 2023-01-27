export interface Vector {
  x: number;
  y: number;
}

export function vec(x: number, y?: number): Vector {
  return { x, y: y ?? x };
}

export function mul(a: Vector, b: Vector): Vector {
  return { x: a.x * b.x, y: a.y * b.y };
}

export function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y };
}
