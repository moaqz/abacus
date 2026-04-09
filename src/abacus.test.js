// @ts-check
import { test } from "vitest";
import { AbacusMachine } from "./abacus.js";
import { expect } from "vitest";

// En las celdas 150(16) y 250(16) se encuentran almacenados dos números X e Y.
// Efectuar X - Y almacenando el resultado en la celda 300(16).
test("should subtract value at 0x250 from 0x150 and save to 0x300", () => {
  const machine = new AbacusMachine();

  machine.setMemoryValue("150", 4); // X
  expect(machine.getMemoryValue("150")).toEqual(4);

  machine.setMemoryValue("250", 2); // Y
  expect(machine.getMemoryValue("250")).toEqual(2);

  // Data
  machine.setMemoryValue("280", 1);
  expect(machine.getMemoryValue("280")).toEqual(1);

  // Instructions
  machine.setMemoryValue("200", 0x1250);
  machine.setMemoryValue("201", 0x4fff);
  machine.setMemoryValue("202", 0x3280);
  machine.setMemoryValue("203", 0x3150);
  machine.setMemoryValue("204", 0x2300);
  machine.setMemoryValue("205", 0xffff);

  machine.step();
  expect(machine.getAccumulator).toEqual(2);

  machine.step();
  machine.step();
  expect(machine.getAccumulator).toEqual(-2);

  machine.step();
  expect(machine.getAccumulator).toEqual(2);

  machine.step();
  expect(machine.getMemoryValue("300")).toEqual(2);

  machine.step();
  expect(machine.isRunning).false;
});

// En las celdas 150(16) y 250(16) se encuentran almacenados dos números X e Y.
// Efectuar X * Y almacenando el resultado en la celda 300(16)
test("should multiply value at 0x150 by 0x250 and save to 0x300", () => {
  const machine = new AbacusMachine();
  const values = { x: 2, y: 10 };

  // Data
  machine.setMemoryValue("150", values.x); // X
  machine.setMemoryValue("250", values.y); // Y
  machine.setMemoryValue("110", -1);

  // Instructions
  machine.setMemoryValue("200", 0x1250);
  machine.setMemoryValue("201", 0x3110);
  machine.setMemoryValue("202", 0x2250);
  machine.setMemoryValue("203", 0x7209); // Jump to 0x209

  machine.setMemoryValue("204", 0x1300);
  machine.setMemoryValue("205", 0x3150);
  machine.setMemoryValue("206", 0x2300);
  machine.setMemoryValue("207", 0x000);
  machine.setMemoryValue("208", 0x5200); // Jump to 0x200

  machine.setMemoryValue("209", 0xffff);

  machine.step();
  expect(machine.getAccumulator).toBe(values.y);

  machine.step();
  expect(machine.getAccumulator).toBe(--values.y);
  machine.step();
  expect(machine.getMemoryValue("250")).toBe(values.y);

  machine.step();
  expect(machine.getProgramCounter).toBe(0x204);

  machine.step();
  machine.step();
  machine.step();
  expect(machine.getAccumulator).toBe(values.x);
  expect(machine.getMemoryValue("300")).toBe(values.x);

  machine.step();
  expect(machine.getAccumulator).toBe(0x0);
  machine.step();
  expect(machine.getProgramCounter).toBe(0x200);

  while (machine.isRunning) {
    machine.step();
  }

  expect(machine.getProgramCounter).toBe(0x20a);
  expect(machine.getMemoryValue("300")).toBe(20);
  expect(machine.isRunning).false;
});

// Las celdas 200(16) y 201(16) contienen dos direcciones, se pide calcular la
// sumatoria de todas las celdas comprendidas entre las direcciones dadas.
test.skip("should sum all values between addresses stored at 0x200 and 0x201 and save to 0x400", () => {});
