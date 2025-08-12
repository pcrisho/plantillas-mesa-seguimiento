// Funcionalidad adicional para tablas responsive
document.addEventListener('DOMContentLoaded', function() {
    // Agregar indicadores de scroll para tablas
    const tableContainers = document.querySelectorAll('.tabla-container');
    
    tableContainers.forEach(container => {
        const table = container.querySelector('table');
        if (!table) return;
        
        // Función para verificar si hay scroll horizontal
        function checkScroll() {
            const hasScroll = container.scrollWidth > container.clientWidth;
            container.classList.toggle('has-scroll', hasScroll);
        }
        
        // Verificar al cargar y al redimensionar
        checkScroll();
        window.addEventListener('resize', checkScroll);
        
        // Agregar eventos de scroll para mostrar sombras
        container.addEventListener('scroll', function() {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            // Agregar clases para indicar posición del scroll
            container.classList.toggle('scroll-start', scrollLeft === 0);
            container.classList.toggle('scroll-end', scrollLeft >= maxScroll - 1);
            container.classList.toggle('scroll-middle', scrollLeft > 0 && scrollLeft < maxScroll - 1);
        });
        
        // Trigger inicial
        container.dispatchEvent(new Event('scroll'));
    });
    
    // Mejorar accesibilidad con navegación por teclado
    const tables = document.querySelectorAll('.table-responsive');
    tables.forEach(table => {
        table.setAttribute('tabindex', '0');
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', 'Tabla con scroll horizontal');
    });
});
