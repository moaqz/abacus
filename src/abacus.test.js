// @ts-check

import { test } from "vitest";
import { AbacusMachine } from "./abacus.js";
import { expect } from "vitest";

test("should crash when accessing an invalid memory address", () => {
  const machine = new AbacusMachine();

  expect(() => {
    machine.getMemoryValue("1001");
  }).toThrow(/Memory access violation/);

  expect(() => {
    machine.getMemoryValue("2000");
  }).toThrow(/Memory access violation/);
});

test("should crash when executing an instruction with a invalid opcode", () => {
  const machine = new AbacusMachine();

  machine.setMemoryValue("200", 0x8200);

  expect(() => {
    machine.step();
  }).toThrow(/Invalid OpCode/);

  expect(machine.isRunning).toBe(false);
});

test("should crash if no stop instruction is found", () => {
  const machine = new AbacusMachine();

  expect(() => {
    machine.run();
  }).toThrow(/Memory out of bound/);
});

test("should run from a custom base address", () => {
  const machine = new AbacusMachine({ baseAddress: 0x500 });

  machine.setMemoryValue("500", 0x000a);
  machine.setMemoryValue("501", 0xf000);

  machine.run();

  expect(machine.getAccumulator).toBe(10);
  expect(machine.getProgramCounter).toBe(0x502);
});

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
test("should sum all values between addresses stored at 0x200 and 0x201 and save to 0x400", () => {
  const machine = new AbacusMachine({ baseAddress: 0x105 });

  // Data
  machine.setMemoryValue("200", 0x300);
  machine.setMemoryValue("201", 0x305);

  machine.setMemoryValue("300", 10);
  machine.setMemoryValue("301", 5);
  machine.setMemoryValue("302", 10);
  machine.setMemoryValue("303", 5);
  machine.setMemoryValue("304", 10);
  machine.setMemoryValue("305", 20);

  machine.setMemoryValue("306", 1);
  machine.setMemoryValue("307", 0x1000);
  machine.setMemoryValue("400", 0);
  machine.setMemoryValue("401", -1);

  // Instructions

  // Calculate how many elements the array has.
  machine.setMemoryValue("105", 0x1200);
  machine.setMemoryValue("106", 0x4fff);
  machine.setMemoryValue("107", 0x3306);
  machine.setMemoryValue("108", 0x3201);
  machine.setMemoryValue("109", 0x2201);

  machine.step(5);
  expect(machine.getAccumulator).toEqual(5);
  expect(machine.getMemoryValue("201")).toEqual(5);

  machine.setMemoryValue("10A", 0x5fff); // no elements.
  machine.step();
  expect(machine.getProgramCounter).toEqual(0x10b);

  machine.setMemoryValue("10B", 0x1200);
  machine.setMemoryValue("10C", 0x3307);
  machine.setMemoryValue("10D", 0x210e); // 10E cointains the instruction to load the first element of the array.
  machine.step(4);

  expect(machine.getAccumulator).toEqual(10);
  expect(machine.getProgramCounter).toEqual(0x10f);

  machine.setMemoryValue("10F", 0x3400);
  machine.setMemoryValue("110", 0x2400);
  machine.step(2);

  expect(machine.getAccumulator).toEqual(10);
  expect(machine.getMemoryValue("400")).toEqual(10);
  expect(machine.getProgramCounter).toEqual(0x111);

  machine.setMemoryValue("111", 0x110e);
  machine.setMemoryValue("112", 0x3306);
  machine.setMemoryValue("113", 0x210e); // move to the next index.
  machine.step(3);

  expect(machine.getMemoryValue("10e")).toEqual(0x1301);

  machine.setMemoryValue("114", 0x1201);
  machine.setMemoryValue("115", 0x3401);
  machine.setMemoryValue("116", 0x2201); // decrement i
  machine.step(3);

  expect(machine.getMemoryValue("201")).toEqual(4);
  expect(machine.getAccumulator).toEqual(4);

  machine.setMemoryValue("117", 0x7fff);
  machine.setMemoryValue("118", 0x0000);
  machine.setMemoryValue("11A", 0x510e);
  machine.setMemoryValue("FFF", 0xffff);
  machine.run();

  expect(machine.getMemoryValue("400")).toEqual(60);
});
