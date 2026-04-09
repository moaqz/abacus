export interface AbacusOptions {
  baseAddress: number;
  
}

export type ISA = Record<number, (addr: number) => void>