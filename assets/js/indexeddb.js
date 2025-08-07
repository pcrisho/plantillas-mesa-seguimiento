// indexeddb.js

const DB_NAME = "TodoAppDB";
const DB_VERSION = 5; // INCREMENTAMOS LA VERSIÓN DE LA BASE DE DATOS
const STORE_NAME = "tareas";

let db = null;

export function abrirIndexedDB() {
  return new Promise((resolve, reject) => {
    // Es CRUCIAL usar una versión más alta para que onupgradeneeded se ejecute
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
        console.error("IndexedDB Error al abrir:", event.target.error);
        reject("Error abriendo IndexedDB");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const dbUpgrade = event.target.result;
      if (!dbUpgrade.objectStoreNames.contains(STORE_NAME)) {
        console.log("Creando object store 'tareas'...");
        dbUpgrade.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      const store = event.target.transaction.objectStore(STORE_NAME);
      if (!store.indexNames.contains('fechaCreacionIndex')) {
        console.log("Creando índice 'fechaCreacionIndex'...");
        store.createIndex('fechaCreacionIndex', 'fechaCreacion', { unique: false });
      }
    };
  });
}

export function guardarTareaIndexedDB(tarea) {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(tarea);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error guardando tarea");
  });
}

export function eliminarTareaIndexedDB(id) {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error eliminando tarea");
  });
}

// === FUNCIÓN CORREGIDA ===
export function obtenerTareasPorFecha(fecha) {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('fechaCreacionIndex');

    // Construimos los límites del rango de manera precisa como strings
    const lowerBound = fecha + 'T00:00:00.000Z'; // Inicio del día
    const upperBound = fecha + 'T23:59:59.999Z'; // Fin del día
    
    // Usamos el IDBKeyRange.bound() para crear un rango inclusivo
    const range = IDBKeyRange.bound(lowerBound, upperBound);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error leyendo tareas por fecha");
  });
}

export function obtenerTodasTareasIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error leyendo tareas");
  });
}

export function eliminarTodasLasTareasIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject("Error al limpiar tareas");
  });
}