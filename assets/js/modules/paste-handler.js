// paste-handler.js - Gestión de pegado de texto con formato limpio

export class PasteHandler {
    constructor() {
        this.isInitialized = false;
    }

    // === FUNCIONES DE LIMPIEZA DE FORMATO ===

    /**
     * Limpia texto para títulos de tareas (elimina saltos de línea)
     */
    limpiarTextoTitulo(texto) {
        return texto.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }

    /**
     * Inserta texto usando execCommand para mantener historial de Ctrl+Z
     */
    insertarTextoConHistorial(texto) {
        const exito = document.execCommand('insertText', false, texto);
        
        if (!exito) {
            // Fallback manual solo si execCommand falla
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const textNode = document.createTextNode(texto);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        
        return exito;
    }

    /**
     * Posiciona el cursor en una posición específica dentro de un contenedor
     */
    posicionarCursorEnTexto(container, targetOffset) {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let currentOffset = 0;
        let currentNode;
        
        while (currentNode = walker.nextNode()) {
            const nodeLength = currentNode.textContent.length;
            if (currentOffset + nodeLength >= targetOffset) {
                const range = document.createRange();
                const selection = window.getSelection();
                const localOffset = targetOffset - currentOffset;
                
                range.setStart(currentNode, Math.min(localOffset, nodeLength));
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }
            currentOffset += nodeLength;
        }
    }

    /**
     * Limpia elementos con formato no deseado
     */
    limpiarElementosConFormato(targetElement, includeBR = false) {
        const selector = includeBR ? 
            '[style], span:not([class]), font, b, i, strong, em, mark, br' :
            '[style], span:not([class]), font, b, i, strong, em, mark';
            
        const elementosConFormato = targetElement.querySelectorAll(selector);
        
        if (elementosConFormato.length > 0) {
            const selection = window.getSelection();
            
            elementosConFormato.forEach(elem => {
                const texto = elem.textContent;
                
                try {
                    // Usar execCommand para la limpieza también
                    const rangeToClean = document.createRange();
                    rangeToClean.selectNode(elem);
                    selection.removeAllRanges();
                    selection.addRange(rangeToClean);
                    
                    const cleanExito = document.execCommand('insertText', false, texto);
                    
                    if (!cleanExito) {
                        // Fallback manual
                        const nodoTexto = document.createTextNode(texto);
                        elem.parentNode.replaceChild(nodoTexto, elem);
                    }
                } catch (error) {
                    // Manejo silencioso de errores
                    console.warn('Error limpiando formato:', error);
                }
            });
        }
    }

    // === MANEJADORES DE PEGADO ESPECÍFICOS ===

    /**
     * Maneja el pegado en títulos de tareas
     */
    manejarPegadoTitulo(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const pasteData = (event.clipboardData || window.clipboardData).getData('text/plain');
        
        if (pasteData) {
            const textoLimpio = this.limpiarTextoTitulo(pasteData);
            
            // USAR execCommand para mantener historial de deshacer (Ctrl+Z)
            this.insertarTextoConHistorial(textoLimpio);
            
            // Limpiar cualquier formato que se haya colado DESPUÉS del insertText
            setTimeout(() => {
                const targetElement = event.target;
                this.limpiarElementosConFormato(targetElement);
            }, 20);
        }
    }

    /**
     * Maneja el pegado en descripciones de tareas
     */
    manejarPegadoDescripcion(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const pasteData = (event.clipboardData || window.clipboardData).getData('text/plain');
        if (!pasteData) return;
        
        // USAR execCommand para mantener historial de deshacer (Ctrl+Z)
        this.insertarTextoConHistorial(pasteData);
        
        // VERIFICACIÓN Y LIMPIEZA DESPUÉS del insertText
        setTimeout(() => {
            const targetElement = event.target;
            this.limpiarElementosConFormato(targetElement);
        }, 20);
    }

    /**
     * Maneja el pegado en inputs y textareas
     */
    manejarPegadoInput(event) {
        event.preventDefault();
        const pasteData = (event.clipboardData || window.clipboardData).getData('text/plain');
        
        if (pasteData) {
            const textoLimpio = pasteData.trim();
            const exito = document.execCommand('insertText', false, textoLimpio);
            
            if (!exito) {
                const targetElement = event.target;
                targetElement.value = (targetElement.value || '') + textoLimpio;
            }
        }
    }

    /**
     * Maneja el pegado complejo en descripciones con soporte para BR y DIVs
     */
    manejarPegadoDescripcionComplejo(event, descripcionElement, pasteData) {
        // MÉTODO COMPATIBLE CON CTRL+Z: Usar execCommand en lugar de manipulación manual
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            // Primero, asegurar que tenemos una selección válida
            const range = selection.getRangeAt(0);
            
            // Si el cursor está en un BR, ajustar la posición
            if (range.startContainer.nodeName === 'BR') {
                range.setStartBefore(range.startContainer);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            
            // USAR execCommand para mantener el historial de deshacer
            this.insertarTextoConHistorial(pasteData);
        }
        
        // Limpiar cualquier formato que se haya colado (DESPUÉS del insertText)
        setTimeout(() => {
            this.limpiarElementosConFormato(descripcionElement);
            
            // Restaurar selección al final del texto pegado
            const allText = descripcionElement.textContent;
            const pasteIndex = allText.lastIndexOf(pasteData);
            if (pasteIndex !== -1) {
                const endPosition = pasteIndex + pasteData.length;
                this.posicionarCursorEnTexto(descripcionElement, endPosition);
            }
        }, 20);
        
        // Guardar cambios si hay función disponible
        setTimeout(() => {
            const taskId = descripcionElement.closest('.task-item')?.dataset.id;
            if (taskId && typeof window.actualizarTareaDescripcion === 'function') {
                // Guardar el contenido HTML para preservar la estructura
                const contenidoHTML = descripcionElement.innerHTML || '';
                window.actualizarTareaDescripcion(taskId, contenidoHTML);
            }
        }, 100);
    }

    // === EVENT LISTENER PRINCIPAL ===

    /**
     * Configura el event listener principal para pegado
     */
    configurarEventListeners() {
        document.addEventListener('paste', (event) => {
            let targetElement = event.target;
            
            // Buscar el contenedor de descripción o título más cercano
            let taskContainer = null;
            
            // Si pegamos en BR, DIV sin clases, o cualquier elemento dentro de una tarea
            if (targetElement.tagName === 'BR' || 
                (targetElement.tagName === 'DIV' && !targetElement.className) ||
                !targetElement.classList.contains('task-description') && !targetElement.classList.contains('task-title')) {
                
                // Buscar hacia arriba el contenedor de tarea más cercano
                taskContainer = targetElement.closest('.task-description, .task-title');
                
                if (taskContainer) {
                    targetElement = taskContainer;
                }
            }
            
            // MANEJO PARA DESCRIPCIONES (incluyendo BR y divs internos)
            if (targetElement.classList.contains('task-description') || 
                taskContainer?.classList.contains('task-description')) {
                
                const descripcionElement = targetElement.classList.contains('task-description') ? 
                                         targetElement : taskContainer;
                
                event.preventDefault();
                event.stopPropagation();
                
                // Obtener solo texto plano
                const pasteData = (event.clipboardData || window.clipboardData).getData('text/plain');
                
                if (pasteData) {
                    this.manejarPegadoDescripcionComplejo(event, descripcionElement, pasteData);
                }
                return;
            }
            
            // MANEJO PARA TÍTULOS
            if (targetElement.classList.contains('task-title') || 
                taskContainer?.classList.contains('task-title')) {
                
                const tituloElement = targetElement.classList.contains('task-title') ? 
                                    targetElement : taskContainer;
                
                // Redirigir el evento al elemento correcto
                Object.defineProperty(event, 'target', { value: tituloElement, writable: false });
                this.manejarPegadoTitulo(event);
                return;
            }
            
            // MANEJO PARA INPUTS/TEXTAREAS
            if (targetElement.classList.contains('input-task') || targetElement.tagName === 'TEXTAREA') {
                this.manejarPegadoInput(event);
                return;
            }
        }, true);
    }

    // === FUNCIONES DE UTILIDAD PÚBLICA ===

    /**
     * Función utilitaria para limpiar tareas existentes con formato corrupto
     */
    limpiarTareasExistentes() {
        return new Promise(async (resolve) => {
            try {
                const taskItems = document.querySelectorAll('.task-item');
                let tareasLimpiadas = 0;
                
                for (const taskItem of taskItems) {
                    const descripcion = taskItem.querySelector('.task-description');
                    const titulo = taskItem.querySelector('.task-title');
                    
                    if (descripcion) {
                        this.limpiarElementosConFormato(descripcion);
                        tareasLimpiadas++;
                    }
                    
                    if (titulo) {
                        this.limpiarElementosConFormato(titulo);
                    }
                }
                
                // Emitir evento de limpieza completada
                this.emitEvent('cleanupCompleted', { tareasLimpiadas });
                
                resolve(tareasLimpiadas);
            } catch (error) {
                console.error('Error limpiando tareas:', error);
                resolve(0);
            }
        });
    }

    /**
     * Emite eventos personalizados para comunicación entre módulos
     */
    emitEvent(eventName, data) {
        const event = new CustomEvent(`paste:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    // === INICIALIZACIÓN ===

    /**
     * Inicializa el gestor de pegado
     */
    inicializar() {
        if (this.isInitialized) {
            console.warn('PasteHandler ya fue inicializado');
            return;
        }
        
        this.configurarEventListeners();
        this.isInitialized = true;
        
        // Emitir evento de inicialización
        this.emitEvent('initialized', {});
        
        console.log('✅ PasteHandler inicializado correctamente');
    }

    /**
     * Limpia los event listeners (para cleanup)
     */
    destruir() {
        // Los event listeners se limpiarán automáticamente al recargar la página
        this.isInitialized = false;
        this.emitEvent('destroyed', {});
    }
}

// === INSTANCIA Y EXPORTACIONES ===

// Crear instancia única del gestor de pegado
export const pasteHandler = new PasteHandler();

// Funciones de conveniencia para compatibilidad
export const limpiarTareasExistentes = () => pasteHandler.limpiarTareasExistentes();
export const posicionarCursorEnTexto = (container, offset) => pasteHandler.posicionarCursorEnTexto(container, offset);
