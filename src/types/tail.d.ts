declare module 'tail' {
  export class Tail {
    constructor(path: string);
    on(type: string, cb: (p: any) => void): void;
  }
}
