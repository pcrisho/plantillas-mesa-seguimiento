// session.js - Gestión de sesión y credenciales de usuario

export class SessionManager {
    constructor() {
        this.nombreAsesor = "";
        this.usuarioAdp = "";
    }

    // === GETTERS PARA ACCESO EXTERNO ===
    getNombreAsesor() {
        return this.nombreAsesor;
    }

    getUsuarioAdp() {
        return this.usuarioAdp;
    }

    // === FUNCIONES PRINCIPALES DE SESIÓN ===
    
    /**
     * Carga las credenciales guardadas desde localStorage
     * @returns {boolean} true si se encontraron credenciales válidas
     */
    cargarCredenciales() {
        const adpGuardado = localStorage.getItem("adpNombre");
        const usuarioGuardado = localStorage.getItem("adpUsuario");
        
        if (adpGuardado && usuarioGuardado) {
            this.nombreAsesor = adpGuardado;
            this.usuarioAdp = usuarioGuardado;
            
            // Actualizar UI
            this._actualizarUICredenciales();
            this._actualizarPlaceholdersADP();
            
            // Emitir evento para otros módulos
            this.emitEvent('credentialsLoaded', {
                nombreAsesor: this.nombreAsesor,
                usuarioAdp: this.usuarioAdp
            });
            
            return true;
        }
        
        return false;
    }

    /**
     * Guarda las credenciales en localStorage y actualiza la UI
     * @param {string} nombre - Nombre del asesor
     * @param {string} usuario - Usuario ADP (7 caracteres)
     * @returns {boolean} true si las credenciales son válidas
     */
    guardarCredenciales(nombre, usuario) {
        const nombreTrim = nombre.trim();
        const usuarioTrim = usuario.trim().toUpperCase();
        
        if (!nombreTrim || usuarioTrim.length !== 7) {
            return false;
        }
        
        // Guardar en localStorage
        localStorage.setItem("adpNombre", nombreTrim);
        localStorage.setItem("adpUsuario", usuarioTrim);
        
        // Actualizar estado interno
        this.nombreAsesor = nombreTrim;
        this.usuarioAdp = usuarioTrim;
        
        // Actualizar UI
        this._actualizarUICredenciales();
        this._actualizarPlaceholdersADP();
        
        // Emitir evento para otros módulos
        this.emitEvent('credentialsLoaded', {
            nombreAsesor: this.nombreAsesor,
            usuarioAdp: this.usuarioAdp
        });
        
        return true;
    }

    /**
     * Cierra la sesión actual y limpia todos los datos
     */
    cerrarSesion() {
        // Limpiar localStorage
        localStorage.removeItem("adpNombre");
        localStorage.removeItem("adpUsuario");
        
        // Limpiar estado interno
        this.nombreAsesor = "";
        this.usuarioAdp = "";
        
        // Limpiar UI
        this._limpiarUICredenciales();
        this._limpiarPlaceholdersADP();
        
        // Limpiar datos dependientes (códigos, etc.)
        this._limpiarDatosDependientes();
        
        // Emitir evento para otros módulos
        this.emitEvent('logout', {});
    }

    /**
     * Configura todos los event listeners relacionados con la sesión
     */
    configurarEventListeners() {
        // Elementos del DOM
        const modal = document.querySelector("#modal");
        const btnGuardar = document.querySelector("#btn-guardar");
        const btnSinCredenciales = document.querySelector("#btn-sin-credenciales");
        const btnAbrirModal = document.querySelector("#btn-abrir-modal");
        const btnCerrarSesion = document.querySelector("#cerrar-sesion");
        const inputAdp = document.querySelector("#input-adp");
        const inputUsuario = document.querySelector("#input-usuario");
        const confirmDialog = document.querySelector("#confirmar-cierre-sesion");
        const btnConfirmarCerrarSesion = document.querySelector("#confirmar-cerrar-sesion");
        const btnCancelarCerrarSesion = document.querySelector("#cancelar-cerrar-sesion");

        // Event listener para abrir modal
        if (btnAbrirModal) {
            btnAbrirModal.addEventListener("click", () => {
                if (modal) modal.showModal();
            });
        }

        // Event listener para guardar credenciales
        if (btnGuardar) {
            btnGuardar.addEventListener("click", () => {
                const nombre = inputAdp?.value || "";
                const usuario = inputUsuario?.value || "";
                
                if (this.guardarCredenciales(nombre, usuario)) {
                    this._cerrarDialogConAnimacion(modal);
                    this._mostrarToast("✅ Credenciales guardadas correctamente");
                    
                    // Notificar a otros módulos que la sesión cambió
                    this._notificarCambioSesion();
                } else {
                    this._mostrarToast("⚠️ Por favor, completa los datos correctamente.");
                }
            });
        }

        // Event listener para continuar sin credenciales
        if (btnSinCredenciales) {
            btnSinCredenciales.addEventListener("click", () => {
                this._cerrarDialogConAnimacion(modal);
            });
        }

        // Event listener para abrir confirmación de cierre de sesión
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener("click", () => {
                if (confirmDialog) confirmDialog.showModal();
            });
        }

        // Event listener para confirmar cierre de sesión
        if (btnConfirmarCerrarSesion) {
            btnConfirmarCerrarSesion.addEventListener("click", () => {
                this.cerrarSesion();
                if (confirmDialog) confirmDialog.close();
                if (modal) modal.showModal();
                this._mostrarToast("🔓 Sesión cerrada correctamente");
            });
        }

        // Event listener para cancelar cierre de sesión
        if (btnCancelarCerrarSesion) {
            btnCancelarCerrarSesion.addEventListener("click", () => {
                if (confirmDialog) confirmDialog.close();
            });
        }
    }

    /**
     * Inicializa el sistema de sesión
     * @returns {boolean} true si se cargaron credenciales existentes
     */
    inicializar() {
        const credencialesExistentes = this.cargarCredenciales();
        this.configurarEventListeners();
        
        // Si no hay credenciales, mostrar modal
        if (!credencialesExistentes) {
            const modal = document.querySelector("#modal");
            if (modal) modal.showModal();
        }
        
        return credencialesExistentes;
    }

    // === MÉTODOS PRIVADOS ===

    /**
     * Actualiza la UI con las credenciales cargadas
     * @private
     */
    _actualizarUICredenciales() {
        const userCredentials = document.querySelector("#user-credentials");
        const btnAbrirModal = document.querySelector("#btn-abrir-modal");
        const spanAdp = userCredentials?.querySelector(".adp");
        const spanUsuario = userCredentials?.querySelector("span:last-child");

        if (spanAdp) spanAdp.textContent = this.nombreAsesor;
        if (spanUsuario) spanUsuario.textContent = this.usuarioAdp;
        
        this._toggleElementVisibility(userCredentials, true);
        this._toggleElementVisibility(btnAbrirModal, false);
    }

    /**
     * Limpia la UI cuando se cierra sesión
     * @private
     */
    _limpiarUICredenciales() {
        const userCredentials = document.querySelector("#user-credentials");
        const btnAbrirModal = document.querySelector("#btn-abrir-modal");
        const spanAdp = userCredentials?.querySelector(".adp");
        const spanUsuario = userCredentials?.querySelector("span:last-child");

        if (spanAdp) spanAdp.textContent = "";
        if (spanUsuario) spanUsuario.textContent = "";
        
        this._toggleElementVisibility(userCredentials, false);
        this._toggleElementVisibility(btnAbrirModal, true);
    }

    /**
     * Actualiza todos los placeholders .adp en el documento
     * @private
     */
    _actualizarPlaceholdersADP() {
        document.querySelectorAll(".adp").forEach(span => {
            span.textContent = this.nombreAsesor;
        });
    }

    /**
     * Limpia todos los placeholders .adp en el documento
     * @private
     */
    _limpiarPlaceholdersADP() {
        document.querySelectorAll(".adp").forEach(span => {
            span.textContent = "";
        });
    }

    /**
     * Limpia datos dependientes de la sesión (códigos, etc.)
     * @private
     */
    _limpiarDatosDependientes() {
        // Limpiar códigos generados
        const listaCodigos = document.getElementById("lista-codigos");
        if (listaCodigos) listaCodigos.innerHTML = "";
        
        const codigoGenerado = document.getElementById("codigo-generado");
        if (codigoGenerado) codigoGenerado.textContent = "";
        
        // Notificar a otros módulos para que limpien sus datos
        this._notificarCierreSession();
    }

    /**
     * Notifica a otros módulos que la sesión ha cambiado
     * @private
     */
    _notificarCambioSesion() {
        // Dispatch event personalizado para que otros módulos puedan reaccionar
        const evento = new CustomEvent('sessionChanged', {
            detail: {
                nombreAsesor: this.nombreAsesor,
                usuarioAdp: this.usuarioAdp
            }
        });
        document.dispatchEvent(evento);
    }

    /**
     * Notifica a otros módulos que la sesión se ha cerrado
     * @private
     */
    _notificarCierreSession() {
        const evento = new CustomEvent('sessionClosed');
        document.dispatchEvent(evento);
    }

    /**
     * Muestra/oculta elementos con animación
     * @private
     */
    _toggleElementVisibility(element, visible, displayMode = "flex") {
        if (!element) return;
        if (visible) {
            element.style.display = displayMode;
            element.classList.remove("fade-out");
            element.classList.add("fade-in");
        } else {
            element.classList.remove("fade-in");
            element.style.display = "none";
        }
    }

    /**
     * Cierra dialog con animación
     * @private
     */
    _cerrarDialogConAnimacion(dialog) {
        if (!dialog) return;
        dialog.classList.add("closing");
        setTimeout(() => {
            dialog.classList.remove("closing");
            dialog.close();
        }, 300);
    }

    /**
     * Muestra toast notification
     * @private
     */
    _mostrarToast(mensaje) {
        // Llamar a la función global de toast si existe
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensaje);
        } else {
            console.log(mensaje); // Fallback
        }
    }

    /**
     * Emite eventos personalizados para comunicación entre módulos
     */
    emitEvent(eventName, data) {
        const event = new CustomEvent(`session:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }
}

// Crear instancia global para retrocompatibilidad
export const sessionManager = new SessionManager();

// Exponer variables globales para retrocompatibilidad (temporal)
export function getSessionVars() {
    return {
        nombreAsesor: sessionManager.getNombreAsesor(),
        usuarioAdp: sessionManager.getUsuarioAdp()
    };
}
