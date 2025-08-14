// codes.js - Gestión de códigos y almacenamiento

// Importar dependencias necesarias
import { getSessionVars } from './session.js';

export class CodesManager {
    constructor() {
        this.codigosGenerados = [];
        this.correlativo = 1;
        this.letraActual = "A";
        
        // Referencias a elementos DOM
        this.listaCodigos = null;
        this.codigoGenerado = null;
        
        this.initializeDOMReferences();
    }

    // === INICIALIZACIÓN ===
    initializeDOMReferences() {
        this.listaCodigos = document.getElementById("lista-codigos");
        this.codigoGenerado = document.getElementById("codigo-generado");
    }

    // === GETTERS PARA ACCESO EXTERNO ===
    getCodigosGenerados() {
        return [...this.codigosGenerados]; // Retorna copia para inmutabilidad
    }

    getCorrelativo() {
        return this.correlativo;
    }

    getLetraActual() {
        return this.letraActual;
    }

    // === FUNCIONES PRINCIPALES ===
    
    /**
     * Genera la clave única para localStorage basada en el usuario
     */
    claveUsuario() { 
        const { usuarioAdp } = getSessionVars();
        return `codigos_${usuarioAdp}`;
    }

    /**
     * Guarda los códigos generados en localStorage
     */
    guardarDatos() {
        const fecha = new Date().toDateString();
        const { usuarioAdp } = getSessionVars();
        const clave = `codigos_${usuarioAdp}`;
        localStorage.setItem(clave, JSON.stringify({ 
            fecha, 
            codigos: this.codigosGenerados,
            correlativo: this.correlativo,
            letraActual: this.letraActual
        }));
    }

    /**
     * Muestra el último código generado en el elemento DOM
     */
    mostrarUltimoCodigoGenerado() {
        const ultimoCodigo = this.codigosGenerados[this.codigosGenerados.length - 1] || "";
        if (this.codigoGenerado) {
            this.codigoGenerado.textContent = ultimoCodigo;
        }
    }

    /**
     * Carga los datos guardados desde localStorage o inicializa nuevos
     */
    cargarDatosGuardados() {
        const { usuarioAdp } = getSessionVars();
        if (!usuarioAdp) return;
        
        const clave = `codigos_${usuarioAdp}`;
        const data = JSON.parse(localStorage.getItem(clave));
        const fechaActual = new Date().toDateString();

        if (!data || data.fecha !== fechaActual) {
            // Nuevo día - reiniciar códigos
            this.codigosGenerados = [];
            this.correlativo = 1;
            this.letraActual = "A";
            localStorage.setItem(clave, JSON.stringify({ 
                fecha: fechaActual, 
                codigos: [],
                correlativo: 1,
                letraActual: "A"
            }));
            this.limpiarCodigosVisuales();
        } else {
            // Cargar datos existentes
            this.codigosGenerados = data.codigos || [];
            this.correlativo = data.correlativo || (this.codigosGenerados.length + 1);
            this.letraActual = data.letraActual || (this.codigosGenerados.length % 2 === 0 ? "A" : "B");
            
            // Actualizar UI
            this.actualizarListaVisual();
        }
        
        this.mostrarUltimoCodigoGenerado();
        
        // Emitir evento para notificar cambios
        this.emitEvent('codesLoaded', {
            codigos: this.codigosGenerados,
            correlativo: this.correlativo,
            letraActual: this.letraActual
        });
    }

    /**
     * Actualiza la lista visual de códigos en el DOM
     */
    actualizarListaVisual() {
        if (!this.listaCodigos) return;
        
        this.listaCodigos.innerHTML = "";
        this.codigosGenerados.forEach(codigo => {
            const item = document.createElement("li");
            item.textContent = codigo;
            this.listaCodigos.appendChild(item);
        });
    }

    /**
     * Genera un nuevo código único
     */
    generarCodigo() {
        const { usuarioAdp } = getSessionVars();
        if (!usuarioAdp || usuarioAdp.length !== 7) {
            this.showToast("⚠️ Primero guarda tu usuario correctamente.");
            return null;
        }

        const fecha = new Date();
        const dia = fecha.getDate().toString().padStart(2, "0");
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const anio = fecha.getFullYear();
        
        const codigo = `${this.correlativo}${usuarioAdp}${dia}${mes}${anio}${this.letraActual}`;
        
        // Agregar código a la lista
        this.codigosGenerados.push(codigo);
        
        // Guardar en localStorage
        this.guardarDatos();
        
        // Actualizar UI
        if (this.codigoGenerado) {
            this.codigoGenerado.textContent = codigo;
        }
        
        // Agregar a la lista visual
        if (this.listaCodigos) {
            const item = document.createElement("li");
            item.textContent = codigo;
            this.listaCodigos.appendChild(item);
        }
        
        // Actualizar variables de estado
        this.letraActual = this.letraActual === "A" ? "B" : "A";
        this.correlativo++;
        
        // Emitir evento
        this.emitEvent('codeGenerated', { codigo, correlativo: this.correlativo });
        
        return codigo;
    }

    /**
     * Elimina el último código generado
     */
    eliminarUltimoCodigo() {
        if (this.codigosGenerados.length === 0) {
            this.showToast("⚠️ No hay códigos para eliminar.");
            return false;
        }
        
        // Remover de la lista
        const codigoEliminado = this.codigosGenerados.pop();
        
        // Ajustar variables de estado
        this.correlativo = Math.max(1, this.correlativo - 1);
        this.letraActual = this.letraActual === "A" ? "B" : "A";
        
        // Guardar cambios
        this.guardarDatos();
        
        // Actualizar UI
        if (this.listaCodigos && this.listaCodigos.lastElementChild) {
            this.listaCodigos.removeChild(this.listaCodigos.lastElementChild);
        }
        
        this.mostrarUltimoCodigoGenerado();
        
        // Emitir evento
        this.emitEvent('codeDeleted', { 
            codigoEliminado, 
            correlativo: this.correlativo,
            remaining: this.codigosGenerados.length 
        });
        
        return true;
    }

    /**
     * Limpia los elementos visuales de códigos en el DOM
     */
    limpiarCodigosVisuales() {
        if (this.listaCodigos) {
            this.listaCodigos.innerHTML = "";
        }
        if (this.codigoGenerado) {
            this.codigoGenerado.textContent = "";
        }
    }

    /**
     * Resetea todos los códigos (para logout)
     */
    resetCodigos() {
        this.codigosGenerados = [];
        this.correlativo = 1;
        this.letraActual = "A";
        this.limpiarCodigosVisuales();
        
        // Emitir evento
        this.emitEvent('codesReset', {});
    }

    /**
     * Obtiene todos los códigos como string separado por saltos de línea
     */
    getCodigosAsString() {
        return this.codigosGenerados.join("\n");
    }

    // === FUNCIONES DE UTILIDAD ===

    /**
     * Muestra toast notification (fallback si no está disponible globalmente)
     */
    showToast(mensaje) {
        // Intentar usar la función global mostrarToast
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensaje);
        } else {
            // Fallback simple
            console.log(mensaje);
        }
    }

    /**
     * Emite eventos personalizados para comunicación entre módulos
     */
    emitEvent(eventName, data) {
        const event = new CustomEvent(`codes:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    // === MÉTODOS DE INICIALIZACIÓN ===
    
    /**
     * Inicializa el gestor de códigos
     */
    inicializar() {
        this.initializeDOMReferences();
        this.cargarDatosGuardados();
        
        // Configurar listeners para eventos de sesión
        document.addEventListener('session:credentialsLoaded', () => {
            this.cargarDatosGuardados();
        });
        
        document.addEventListener('session:logout', () => {
            this.resetCodigos();
        });
    }
}

// === INSTANCIA Y EXPORTACIONES ===

// Crear instancia única del gestor de códigos
export const codesManager = new CodesManager();

// Funciones de conveniencia para compatibilidad
export const generarCodigo = () => codesManager.generarCodigo();
export const eliminarUltimoCodigo = () => codesManager.eliminarUltimoCodigo();
export const cargarDatosGuardados = () => codesManager.cargarDatosGuardados();
export const getCodigosGenerados = () => codesManager.getCodigosGenerados();
export const limpiarCodigosVisuales = () => codesManager.limpiarCodigosVisuales();
