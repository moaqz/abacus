export interface AbacusOptions {
  baseAddress: number;
}

export type Opcodes = Record<number, (addr: number) => void>;

export class AbacusMachine {
  /**
   * Crea una nueva instancia de la máquina Abacus.
   * @param opts Opciones de configuración inicial.
   */
  constructor(opts?: Partial<AbacusOptions>);

  /**
   * Ejecuta la instrucción apuntada actualmente por el Program Counter (PC)
   * e incrementa el PC automáticamente.
   * @param n cantidad de instrucciónes a ejecutar.
   * @throws {Error} Si el OpCode es inválido o hay violación de memoria.
   */
  step(n?: number): void;

  /**
   * Ejecuta el programa de forma continua hasta que se encuentra
   * una instrucción de fin del programa.
   */
  run(): void;

  /** Obtiene el valor actual del registro Acumulador (AC). */
  get getAccumulator(): number;

  /** Obtiene la dirección de memoria de la próxima instrucción (PC). */
  get getProgramCounter(): number;

  /** Indica si la máquina está encendida y lista para ejecutar. */
  get isRunning(): boolean;

  /**
   * Lee el contenido de una celda de memoria.
   * @param address Dirección en formato hexadecimal (ej. "200").
   */
  getMemoryValue(address: string): number;

  /**
   * Escribe un valor en una celda de memoria específica.
   * @param address Dirección en formato hexadecimal (ej. "300").
   * @param value Valor a almacenar. Puede ser una instrucción (ej: 0x1100) o un dato (ej: 25).
   */
  setMemoryValue(address: string, value: number): void;
}
