// @ts-check
import { AbacusMachine } from "@moaqzdev/abacus";

// La celda 200(16) contiene una dirección de memoria. La celda 201(16) contiene
// otra dirección de memoria mayor o igual que la anterior. Se pide cambiar unos
// por ceros y ceros por unos en todas las celdas dentro del bloque delimitado por
// las dos direcciones mencionadas (inclusive).

const machine = new AbacusMachine({
  baseAddress: 0x105,
});

machine.setMemoryValue("200", 0x300);
machine.setMemoryValue("201", 0x304);

machine.setMemoryValue("300", 1);
machine.setMemoryValue("301", 2);
machine.setMemoryValue("302", 3);
machine.setMemoryValue("303", 4);
machine.setMemoryValue("304", 5);

machine.setMemoryValue("30A", 0x1000); // aux. 1000
machine.setMemoryValue("30B", 0x0001); // aux. 1

machine.setMemoryValue("105", 0x1200);
machine.setMemoryValue("106", 0x330a);
machine.setMemoryValue("107", 0x210f); // 0x10F = instrucción para cargar array[i].
machine.setMemoryValue("108", 0x330a);
machine.setMemoryValue("109", 0x2111); // 0x111 = instrucción para almacenar en array[i]

machine.setMemoryValue("10A", 0x1200);
machine.setMemoryValue("10B", 0x4fff);
machine.setMemoryValue("10C", 0x330b);
machine.setMemoryValue("10D", 0x3201);
machine.setMemoryValue("10E", 0x711e); // salto al fin del programa.

// 10F -> instrucción para cargar array[i].
machine.setMemoryValue("110", 0x4fff);
// 111 -> instrucción para almacenar en array[i].

machine.setMemoryValue("112", 0x0001);
machine.setMemoryValue("113", 0x3200);
machine.setMemoryValue("114", 0x2200); // (0x200) incrementa en 1.

machine.setMemoryValue("115", 0x0001);
machine.setMemoryValue("116", 0x310f);
machine.setMemoryValue("117", 0x210f); // (0x10f) incrementa en 1.

machine.setMemoryValue("119", 0x0001);
machine.setMemoryValue("11A", 0x3111);
machine.setMemoryValue("11B", 0x2111); // (0x111) incrementa en 1.

machine.setMemoryValue("11C", 0x0000);
machine.setMemoryValue("11D", 0x510b);
machine.setMemoryValue("11E", 0xf000);

/**
 * @param {string} label
 */
function dumpMemory(label) {
  console.log(`--- ${label} ---`);

  const range = [];

  for (let addr = 0x300; addr <= 0x304; addr++) {
    const value = machine.getMemoryValue(addr.toString(16));

    range.push({
      address: `0x${addr.toString(16).toUpperCase()}`,
      valueDecimal: value,
    });
  }

  console.table(range);
}

dumpMemory("ESTADO INICIAL");
machine.run();
dumpMemory("ESTADO FINAL");
