// @ts-check

export class AbacusMachine {
  static #TOTAL_MEMORY_CELLS = 2 ** 12; // 4096
  #BASE_ADDRESS = 0x200;

  /** @type {import("./abacus.d.ts").ISA} */
  #ISA = {
    0x0: this.#loadImmediate.bind(this),
    0x1: this.#load.bind(this),
    0x2: this.#store.bind(this),
    0x3: this.#sum.bind(this),
    0x4: this.#not.bind(this),
    0x5: (addr) => this.#jump(addr, (val) => val === 0),
    0x6: (addr) => this.#jump(addr, (val) => val > 0),
    0x7: (addr) => this.#jump(addr, (val) => val < 0),
    0xf: this.#stop.bind(this),
  };

  #registries = {
    ac: new Int16Array(1),
    pc: new Uint16Array(1),
  };

  #memory = new Int16Array(AbacusMachine.#TOTAL_MEMORY_CELLS);
  #isRunning = true;

  /**
   *
   * @param {Partial<import("./abacus.d.ts").AbacusOptions>} opts
   */
  constructor(opts = {}) {
    if (opts.baseAddress) {
      this.#BASE_ADDRESS = opts.baseAddress;
    }

    this.#registries.pc[0] = this.#BASE_ADDRESS;
  }

  get getAccumulator() {
    return this.#registries.ac[0];
  }

  get getProgramCounter() {
    return this.#registries.pc[0];
  }

  get isRunning() {
    return this.#isRunning;
  }

  /**
   * @param {number} n
   */
  step(n = 1) {
    while (n > 0 && this.#isRunning) {
      if (this.#registries.pc[0] >= AbacusMachine.#TOTAL_MEMORY_CELLS) {
        this.#isRunning = false;

        const address = this.#registries.pc[0];
        throw new Error(
          `Memory out of bounds at address 0x${address.toString(16)}: Missing stop instruction (0xF)`,
        );
      }

      const address = this.#registries.pc[0];
      const instruction = this.#memory[address];

      this.#registries.pc[0]++;

      // JavaScript converts numbers to 32-bit integers before bitwise operations.
      // The & 0x000f is necessary to get only the last 4 bits and ignore the rest.
      const opCode = (instruction >>> 12) & 0x000f;
      const operand = instruction & 0x0fff;

      const action = this.#ISA[opCode];
      if (action && action instanceof Function) {
        action(operand);
      } else {
        this.#isRunning = false;
        throw new Error(
          `Invalid OpCode 0x${opCode.toString(16)} at address 0x${address.toString(16)}`,
        );
      }

      n--;
    }
  }

  run() {
    while (this.#isRunning) {
      this.step();
    }
  }

  /**
   *
   * @param {string} address
   * @param {number} value
   */
  setMemoryValue(address, value) {
    const _addr = parseInt(address, 16);

    if (Number.isNaN(_addr)) {
      return;
    }

    if (_addr < 0x0 || _addr >= 0x1000) {
      return;
    }

    this.#memory[_addr] = value;
  }

  /**
   *
   * @param {string} address
   * @returns {number}
   */
  getMemoryValue(address) {
    const _addr = parseInt(address, 16);

    if (Number.isNaN(_addr) || _addr < 0x0 || _addr >= 0x1000) {
      throw new Error(
        `Memory access violation: address 0x${address} is out of bounds (0x000-0xFFF).`,
      );
    }

    return this.#memory[_addr];
  }

  /**
   * @param {number} operand
   */
  #loadImmediate(operand) {
    this.#registries.ac[0] = operand;
  }

  /**
   * @param {number} operand
   */
  #load(operand) {
    this.#registries.ac[0] = this.#memory[operand];
  }

  /**
   * @param {number} operand
   */
  #sum(operand) {
    this.#registries.ac[0] += this.#memory[operand];
  }

  /**
   * @param {number} operand
   */
  #store(operand) {
    this.#memory[operand] = this.#registries.ac[0];
  }

  // @ts-ignore
  #not(_) {
    this.#registries.ac[0] = ~this.#registries.ac[0];
  }

  /**
   * @param {number} operand
   * @param {(value: number) => boolean} fn
   */
  #jump(operand, fn) {
    const value = this.#registries.ac[0];
    if (fn(value)) {
      this.#registries.pc[0] = operand;
    }
  }

  // @ts-ignore
  #stop(_) {
    this.#isRunning = false;
  }
}
