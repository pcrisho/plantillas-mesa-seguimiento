# 🚀 Plantillas de Mesa de Seguimiento Hitss

Una aplicación web moderna para optimizar la gestión de tickets y estandarizar las plantillas de atención de tickets para la Mesa de Seguimiento Fija de Hitss.

## � Descripción del Proyecto

Este proyecto es una herramienta integral diseñada para optimizar el flujo de trabajo de los asesores de la Mesa de Seguimiento Fija de Hitss. Proporciona acceso rápido a plantillas predefinidas, generadores de códigos automatizados, y herramientas auxiliares que mejoran la eficiencia en la atención de tickets.

## 🎯 Objetivo Principal

Centralizar y estandarizar las plantillas de comunicación utilizadas en los diferentes procesos de seguimiento técnico, reduciendo tiempos de respuesta y mejorando la calidad del servicio.

## ✨ Características Principales

### 🗣️ Speech de Validación
- **Validación General**: Plantillas para llamadas de seguimiento post-instalación
- **Seguimiento de Instalación**: Scripts específicos para confirmar visitas técnicas
- **Post-venta**: Validaciones para servicios de mantenimiento
- **Mantenimiento**: Confirmación de resolución de incidencias

### 🔧 Gestión de Activaciones
- **Instalaciones**: Plantillas para activación de servicios nuevos
- **Cambios de Plan**: Gestión de modificaciones de servicios
- **Cambios de Equipo**: Procedimientos de reemplazo de equipos
- **Repetidores**: Activación de equipos Mesh y Plume
- **Traslados Externos**: Gestión de cambios de dirección

### 📱 Herramientas Auxiliares

#### 🔑 Generador de Códigos de Autorización
- Sistema automatizado con historial
- Generación única por sesión de usuario
- Almacenamiento local con persistencia diaria

#### 🔄 Convertidor de MAC
- Ingresa una dirección MAC sin formato
- El convertidor agregará automáticamente los dos puntos
- Copia el resultado formateado

#### ✅ Sistema de Tareas
- **Crear desde plantillas**: Cada plantilla tiene un input para generar tareas
- **Título personalizable**: Define el nombre de tu tarea
- **Contenido automático**: La descripción incluye el texto completo de la plantilla
- **Datos dinámicos**: Reemplaza automáticamente fechas, nombres y saludos
- **Texto plano limpio**: Las descripciones se guardan sin formato HTML
- **Almacenamiento local**: Las tareas se guardan en IndexedDB
- **Acceso rápido**: Presiona `Ctrl+B` (o `Cmd+B` en Mac) para ver tus tareas
- **Límite inteligente**: Máximo 6 tareas pendientes para mantener el enfoque
- **Pegado inteligente**: El texto pegado se limpia automáticamente sin formato

#### 🏷️ Sistema de Flags
- Etiquetas visuales para identificación rápida de casos
- Clasificación por colores según tipo de gestión
- Activación manual o automática según el tipo

### 📊 Códigos de Mantenimiento
- Base de datos completa de códigos técnicos actualizados
- Clasificación por colores según tipo de gestión
- Códigos específicos para servicios empresariales
- Guías de derivación y escalamiento

### 🔄 Gestión de Rechazos y Reagendamientos
- **Rechazos de Mesa y Campo**: Plantillas por motivos específicos
- **Rechazos Técnicos**: Gestión de limitaciones de infraestructura
- **Reagendamientos Dinámicos**: Sistema interactivo con escenarios predefinidos
- **Motivos Categorizados**: Por CLARO o CLIENTE con sub-motivos específicos
- **Plantilla Automática**: Generación en tiempo real de la plantilla de reagendamiento
- **Formulario Inteligente**: Campos dinámicos que se actualizan automáticamente

### 📞 Derivaciones PEXT
- **HFC**: Derivaciones para problemas de red coaxial
- **FTTH**: Gestión de incidencias en fibra óptica
- **Cierres de Mantenimiento**: Procedimientos de finalización

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive con Flexbox y Grid
- **JavaScript ES6+**: Funcionalidades interactivas y manejo del DOM

### Características Técnicas
- **Responsive Design**: Adaptable a dispositivos móviles y desktop
- **IndexedDB**: Almacenamiento local de datos persistentes
- **Módulos ES6**: Arquitectura modular y mantenible
- **Local Storage**: Gestión de preferencias de usuario

### Herramientas de Desarrollo
- **Git**: Control de versiones
- **GitHub**: Repositorio y colaboración
- **GitHub Pages**: Hosting y despliegue
- **Visual Studio Code**: Entorno de desarrollo

## � Estructura del Proyecto

```
plantillas-mesa-seguimiento/
├── index.html                 # Página principal
├── README.md                  # Documentación
├── LICENSE                    # Licencia del proyecto
├── assets/
│   ├── css/
│   │   ├── style.css         # Estilos principales
│   │   ├── modals.css        # Estilos para modales
│   │   └── table-styles.css  # Estilos para tablas
│   ├── js/
│   │   ├── app.js           # Lógica principal
│   │   ├── copy.js          # Funciones de copiado
│   │   ├── datetime.js      # Manejo de fechas
│   │   ├── indexeddb.js     # Base de datos local
│   │   ├── mac-converter.js # Convertidor MAC
│   │   ├── nav.js           # Navegación
│   │   └── responsive-tables.js # Tablas responsivas
│   └── img/                 # Imágenes y recursos
│       ├── icon.svg         # Icono de la aplicación
│       └── [modelos]/       # Imágenes de equipos
```

## 🚀 Instalación y Uso

### Acceso en Línea
Visita la aplicación en: [https://pcrisho.github.io/plantillas-mesa-seguimiento-github.io/](https://pcrisho.github.io/plantillas-mesa-seguimiento-github.io/)

### Instalación Local

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/pcrisho/plantillas-mesa-seguimiento-github.io.git
   ```

2. **Navega al directorio**:
   ```bash
   cd plantillas-mesa-seguimiento-github.io
   ```

3. **Abre en tu navegador**:
   - Abre `index.html` directamente en tu navegador
   - O usa un servidor local como Live Server en VS Code

## � Guía de Uso

### Primer Acceso
1. Al acceder por primera vez, ingresa tus credenciales ADP
2. El sistema guardará tu información localmente
3. Navega por las diferentes secciones usando el menú lateral

### Funciones Principales

#### 📋 Copiar Plantillas
- Haz clic en el ícono de copia junto a cualquier plantilla
- El texto se copiará automáticamente al portapapeles
- Aparecerá una notificación de confirmación

#### 🔧 Generar Códigos
- Ve a la sección "Activaciones" → "Generador de Códigos"
- Haz clic en "Generar Código" para crear uno nuevo
- Los códigos se guardan automáticamente con timestamp

#### � Convertir MAC
- Ingresa una dirección MAC sin formato
- El convertidor agregará automáticamente los dos puntos
- Copia el resultado formateado

## 🔧 Funcionalidades Avanzadas

### Sistema de Flags
- Etiquetas visuales para clasificación rápida de casos
- Activación manual o automática según el tipo
- Códigos de colores para identificación inmediata

### Gestión de Datos
- **Persistencia Local**: Los datos se guardan en IndexedDB
- **Exportación**: Posibilidad de descargar códigos generados
- **Historial**: Seguimiento de todas las acciones realizadas

### Responsividad
- Diseño adaptable para móviles y tablets
- Tablas con scroll horizontal en pantallas pequeñas
- Menú de navegación optimizado para touch

## 🎨 Personalización

### Temas y Estilos
El proyecto utiliza CSS custom properties para facilitar la personalización:

```css
:root {
  --primary-color: #2c3e50;
  --accent-color: #e74c3c;
  --background-color: #ecf0f1;
  --text-color: #2c3e50;
}
```

### Datos Dinámicos
Las plantillas utilizan placeholders que se reemplazan automáticamente:
- `<span class="adp"></span>`: Nombre del ADP
- `<span class="dia"></span>`, `<span class="mes"></span>`, `<span class="anio"></span>`: Fecha actual
- `<span class="hora"></span>`: Hora actual

## 🤝 Contribución

### Cómo Contribuir
1. **Fork** el proyecto
2. Crea una **branch** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. **Push** a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Estándares de Código
- Usa nombres descriptivos para variables y funciones
- Comenta el código complejo
- Mantén la consistencia en el estilo
- Asegúrate de que el código sea responsive

## 📊 Métricas del Proyecto

- **Plantillas disponibles**: 50+ plantillas categorizadas
- **Códigos de mantenimiento**: 100+ códigos actualizados
- **Herramientas auxiliares**: 6 herramientas integradas
- **Compatibilidad**: Todos los navegadores modernos
- **Rendimiento**: Carga rápida y funcionamiento offline

## 🆕 Últimas Actualizaciones

### Versión 2.1.0 (Agosto 2025)
- ✅ Sistema de reagendamientos dinámicos
- ✅ Formularios inteligentes con validación
- ✅ Mejoras en el sistema de tareas
- ✅ Optimización de la interfaz de usuario
- ✅ Corrección de bugs y mejoras de rendimiento

## � Versionado

Este proyecto utiliza [Semantic Versioning](https://semver.org/). Para ver las versiones disponibles, revisa los [tags de este repositorio](https://github.com/pcrisho/plantillas-mesa-seguimiento-github.io/tags).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

### Roberto Paolo Crisóstomo Berrocal
- **GitHub**: [@pcrisho](https://github.com/pcrisho)
- **LinkedIn**: [paolo-crisostomo](https://linkedin.com/in/paolo-crisostomo/)
- **Email**: Disponible en GitHub

## 🙏 Agradecimientos

- Al equipo de Mesa de Seguimiento Hitss por el feedback constante
- A los usuarios que han contribuido con sugerencias y mejoras
- A la comunidad de desarrolladores que han inspirado este proyecto

## 📞 Soporte

Si encuentras algún bug o tienes sugerencias:

1. **Issues**: [Crear un issue](https://github.com/pcrisho/plantillas-mesa-seguimiento-github.io/issues)
2. **Discusiones**: [Iniciar una discusión](https://github.com/pcrisho/plantillas-mesa-seguimiento-github.io/discussions)
3. **Email**: A través del perfil de GitHub

---

## 🚀 Roadmap

### Próximas Versiones
- [ ] Sistema de notificaciones push
- [ ] Integración con APIs externas
- [ ] Dashboard de métricas
- [ ] Modo offline completo
- [ ] Exportación a PDF
- [ ] Sistema de usuarios avanzado

### Completado ✅
- [x] Generador de códigos automatizado
- [x] Convertidor de MAC addresses
- [x] Sistema de flags dinámico
- [x] Plantillas responsivas
- [x] Sistema de tareas integrado
- [x] Reagendamientos dinámicos

---

**⭐ Si este proyecto te ha sido útil, ¡no olvides darle una estrella!**

*Última actualización: Agosto 2025 - Versión 2.1.0*
