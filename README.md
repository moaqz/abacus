# Abacus

<img width="610" height="504" alt="image" src="https://github.com/user-attachments/assets/022b85b8-5c9c-4d86-b89e-9f9d0d55e04c" />

## Formato de instrucciones

Cada instrucción en Abacus ocupa 16 bits y se compone de dos partes:

- Código de Operación (**CO**): Los 4 bits más significativos (0-F en hexadecimal).
- Operando (**Op**): Los 12 bits restantes que representan una dirección de memoria o un valor inmediato.

Abacus es una máquina de una **sola dirección**. Esto significa que las operaciones no pueden manipular dos celdas de memoria simultáneamente. El acumulador (**AC**) actúa como el intermediario.

Por ejemplo, para sumar los valores de dos celdas de memoria distintas y guardar el resultado en una tercera, se debe realizar lo siguiente:

1. Se trae el primer valor desde la memoria al AC.
2. Se suma el segundo valor de memoria al contenido actual del AC.
3. Se traslada el resultado final desde el AC de vuelta a la memoria.

El conjunto de instrucciones de la máquina Abacus es el siguiente:

| Código (Hex) | Operación           | Descripción                                                      |
| ------------ | ------------------- | ---------------------------------------------------------------- |
| 0            | Carga inmediata     | Carga el valor del operando directamente en el AC.               |
| 1            | Carga               | Carga en el AC el contenido de la dirección de memoria indicada. |
| 2            | Almacena            | Guarda el contenido del AC en la dirección de memoria indicada.  |
| 3            | Suma                | Suma al AC el contenido de la dirección de memoria indicada.     |
| 4            | NOT (AC)            | Invierte los bits del acumulador.                                |
| 5            | Bifurca si (AC) = 0 | Salta a la dirección del operando si el acumulador es cero.      |
| 6            | Bifurca si (AC) > 0 | Salta a la dirección del operando si el acumulador es positivo.  |
| 7            | Bifurca si (AC) < 0 | Salta a la dirección del operando si el acumulador es negativo.  |
| F            | Fin de Programa     | Detiene la ejecución de la máquina.                              |

## Guía de Uso

### Instalación

```sh
npm install @moaqzdev/abacus
```

### Inicialización de la Máquina

Para comenzar, instancia la clase `AbacusMachine`. Opcionalmente se le puede pasar un parámetro `baseAddress` para indicar el punto de carga.

```js
import { AbacusMachine } from "@moaqzdev/abacus";

const machine = new AbacusMachine({
  baseAddress: 0x100,
});

// o
const machine = new AbacusMachine(); // Se asume que el punto de carga es 0x200.
```

### Gestión de Memoria y Datos

**setMemoryValue(direccion, valor)**

Escribe un valor de 16 bits en una dirección específica.

```js
// Guardamos el número 25 en la dirección 0x200
machine.setMemoryValue("200", 25);

// Guardamos una instrucción: Código 1 + Operando 200
machine.setMemoryValue("100", 0x1200);
```

> [!WARNING]
> Si se desea guardar números en hexadecimal se deben incluir con el prefijo 0x, de lo contrario, serán tratados como decimales.

**getMemoryValue(direccion)**

Lee el contenido de una dirección de memoria.

```js
const resultado = machine.getMemoryValue("201");
console.log(`El valor en 0x201 es: ${resultado}`);
```

> [!IMPORTANT]
> Los datos en memoria se guardan en binario pero al recuperarlos se convierten automáticamente a números decimales.

### Ejecución y Control

Una vez cargado el programa y los datos se puede controlar el flujo de ejecución del programa a través de los siguientes métodos:

**step(n)**

Ejecuta una cantidad específica de instrucciones.

```js
machine.step(); // Ejecuta la siguiente instrucción
machine.step(5); // Ejecuta las próximas 5 instrucciones
```

**run()**

Ejecuta el programa de forma continua hasta que la máquina encuentre la instrucción Fin de Programa (código F).

```js
machine.run();
```

### Inspección de Registros

Puedes consultar el estado interno del procesador en cualquier momento usando los siguientes métodos:

**getAccumulator**

Retorna el valor actual del registro AC.

```js
console.log("Valor actual en el AC:", machine.getAccumulator);
```

**getProgramCounter**

Retorna la dirección de la próxima instrucción que el RPI tiene apuntada.

```js
console.log("Siguiente instrucción en:", machine.getProgramCounter.toString(16));
```

> [!IMPORTANT]
> La dirección se devuelve en decimal. Para convertirla a hexadecimal usamos `.toString(16)`.

## Demo

```js
const machine = new AbacusMachine({ baseAddress: 0x100 });

// 1. Cargamos los datos en memoria
machine.setMemoryValue("200", 15); // Valor A
machine.setMemoryValue("201", 10); // Valor B

// 2. Cargamos el programa (instrucciones)
machine.setMemoryValue("100", 0x1200); // Carga (1) el contenido de 200
machine.setMemoryValue("101", 0x3201); // Suma (3) el contenido de 201
machine.setMemoryValue("102", 0x2202); // Almacena (2) en 202
machine.setMemoryValue("103", 0xf000); // Fin de Programa (F)

// 3. Ejecutamos
machine.run();

// 4. Verificamos el resultado
console.log("Resultado de la suma:", machine.getMemoryValue("202")); // Output: 25
```

> [!IMPORTANT]
> Los tests son documentacion viva, si aún tienes dudas de qué se puede hacer con Abacus puedes consultar los [tests](./src/abacus.test.js).