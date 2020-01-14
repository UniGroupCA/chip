declare module 'tail' {
  export class Tail {
    constructor(path: string, options: any);
    on(type: string, cb: (p: any) => void): void;
  }
}
