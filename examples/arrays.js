// @ts-check
import { AbacusMachine } from "@moaqzdev/abacus";

// Se tiene un vector V que comienza en la celda 200[16], formado por BPF c/signo. Su longitud está almacenada en la celda 100[16].
// Se pide hacer la sumatoria de los elementos del vector y dejar el resultado en la celda 101[16].
// Punto de carga: celda 300[16].

const machine = new AbacusMachine({
  baseAddress: 0x300,
});

machine.setMemoryValue("100", 3);
machine.setMemoryValue("102", -1);

machine.setMemoryValue("200", 30);
machine.setMemoryValue("201", 60);
machine.setMemoryValue("202", 90);

machine.setMemoryValue("300", 0x1200);
machine.setMemoryValue("301", 0x3101);
machine.setMemoryValue("302", 0x2101);

machine.setMemoryValue("303", 0x0001);
machine.setMemoryValue("304", 0x3300);
machine.setMemoryValue("305", 0x2300);

machine.setMemoryValue("306", 0x1102);
machine.setMemoryValue("307", 0x3100);
machine.setMemoryValue("308", 0x2100);

machine.setMemoryValue("309", 0x6300);
machine.setMemoryValue("30A", 0xf000);

machine.run();

console.table({
  resultado: machine.getMemoryValue("101"), // output: 180
});
