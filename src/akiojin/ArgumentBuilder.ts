/**
 * @author https://github.com/akiojin
 */
export default class ArgumentBuilder {
  #args: string[] = [];

  Append(arg: string): ArgumentBuilder;
  Append(arg: string, param: string): ArgumentBuilder;
  Append(args: string[]): ArgumentBuilder;

  Append(arg: string | string[], param?: string): ArgumentBuilder {
    if (Array.isArray(arg)) {
      this.#args = this.#args.concat(arg);
    } else {
      this.#args.push(arg);

      if (param != null) {
        this.#args.push(param);
      }
    }

    return this;
  }

  Count(): number {
    return this.#args.length;
  }

  Build(): string[] {
    return this.#args;
  }

  ToString(): string {
    return this.#args.join(' ');
  }
}
