// indexeddb.js

const DB_NAME = "TodoAppDB";
const DB_VERSION = 3; // INCREMENTAMOS LA VERSIÓN DE LA BASE DE DATOS
const STORE_NAME = "tareas";

let db = null;

export function abrirIndexedDB() {
  return new Promise((resolve, reject) => {
    // Es CRUCIAL usar una versión más alta para que onupgradeneeded se ejecute
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error abriendo IndexedDB");

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const dbUpgrade = event.target.result;
      if (!dbUpgrade.objectStoreNames.contains(STORE_NAME)) {
        dbUpgrade.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      const store = event.target.transaction.objectStore(STORE_NAME);
      // Creamos un índice para buscar por fecha
      if (!store.indexNames.contains('fechaCreacionIndex')) {
        store.createIndex('fechaCreacionIndex', 'fechaCreacion', { unique: false });
      }
    };
  });
}

export function guardarTareaIndexedDB(tarea) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(tarea);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error guardando tarea");
  });
}

export function eliminarTareaIndexedDB(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error eliminando tarea");
  });
}

// NUEVA FUNCIÓN para obtener tareas por fecha
export function obtenerTareasPorFecha(fechaISO) {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('fechaCreacionIndex');

    // Construimos los límites del rango de manera precisa
    // para que coincidan con el formato ISO guardado, incluyendo la hora.
    const lowerBound = fechaISO + 'T00:00:00.000Z'; // Inicio del día seleccionado
    const fechaSiguiente = new Date(fechaISO);
    fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
    const upperBound = fechaSiguiente.toISOString(); // Inicio del día siguiente

    // El rango se establece desde `lowerBound` (inclusive) hasta `upperBound` (exclusive)
    const range = IDBKeyRange.bound(lowerBound, upperBound, false, true);

    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error leyendo tareas por fecha");
  });
}

// Mantenemos la función para obtener todas las tareas (si aún la necesitas)
export function obtenerTodasTareasIndexedDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error leyendo tareas");
  });
}

// Nueva función para eliminar todas las tareas
export function eliminarTodasLasTareasIndexedDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject("Error al limpiar tareas");
  });
}