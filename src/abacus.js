// @ts-check

export class AbacusMachine {
  static #TOTAL_MEMORY_CELLS = 2 ** 12; // 4096
  static #BASE_ADDRESS = 0x200;

  /** @type {Record<number, (addr: number) => void>} */
  #ISA = {
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

  constructor() {
    this.#registries.pc[0] = AbacusMachine.#BASE_ADDRESS;
  }

  get getState() {
    return {
      ...this.#registries,
      memory: this.#memory,
    };
  }

  step() {
    if (!this.#isRunning) {
      return;
    }

    const address = this.#registries.pc[0];
    const instruction = this.#memory[address];

    this.#registries.pc[0]++;

    const opCode = instruction >>> 12 & 0x000F;
    const operand = instruction & 0x0fff;

    const action = this.#ISA[opCode];
    if (action && action instanceof Function) {
      action(operand);
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
