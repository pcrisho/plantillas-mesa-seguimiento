// indexeddb.js

const DB_NAME = "TodoAppDB";
const DB_VERSION = 7; // ¡Importante! Incrementamos la versión para forzar la actualización
const STORE_NAME = "tareas";

let db = null;

export function abrirIndexedDB() {
  return new Promise((resolve, reject) => {
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
      
      // La forma correcta de crear el store en onupgradeneeded
      let store;
      if (!dbUpgrade.objectStoreNames.contains(STORE_NAME)) {
        console.log("Creando object store 'tareas'...");
        store = dbUpgrade.createObjectStore(STORE_NAME, { keyPath: "id" });
      } else {
        store = event.target.transaction.objectStore(STORE_NAME);
      }
      
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

export function obtenerTareasPorFecha(fecha) {
  return new Promise((resolve, reject) => {
    if (!db) { reject("IndexedDB no está abierto."); return; }
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('fechaCreacionIndex');

    const lowerBound = fecha + 'T00:00:00.000Z';
    const upperBound = fecha + 'T23:59:59.999Z';
    const range = IDBKeyRange.bound(lowerBound, upperBound);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => {
      console.error("Error al obtener tareas por fecha:", e.target.error);
      reject("Error leyendo tareas por fecha");
    };
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