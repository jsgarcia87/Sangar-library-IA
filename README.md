# 🪐 Sangar AI Library

> Tu biblioteca personal de recursos de Inteligencia Artificial, generadores de prompts especializados, guías de motion design y herramientas creativas.

---

## 🚀 ¿Qué es Sangar AI Library?

**Sangar AI Library** es un centro de control y biblioteca creativa diseñada para potenciar la creación de contenidos visuales, animaciones, motion graphics y flujos de trabajo con IA. 

Inspirado y expandido a partir de herramientas como el generador de prompts de Founderz, este proyecto lleva la idea al siguiente nivel convirtiéndolo en una suite propia, offline-first, personalizable y sin limitaciones.

---

## ✨ Características Principales

### 1. 🎬 Generador Pro de Prompts para Motion Graphics
Un generador interactivo con soporte multi-motor (Runway Gen-3, Kling 1.5, Luma Dream Machine, Sora, Midjourney v6 y LLMs directores de arte):
- **Presets instantáneos**: Logo reveals, kinetic typography, 3D showcases, UI holográficas, loops abstractos y más.
- **Control granular**: Sujeto, estilo visual, dinámicas de movimiento, comportamiento de cámara, iluminación, paleta cromática, tempo/ritmo y formatos de pantalla.
- **Modo Seamless Loop**: Instrucciones precisas para crear bucles infinitos perfectos.
- **Salida bilingüe y técnica**: Genera el prompt optimizado en inglés (ideal para motores de vídeo) y en español, con parámetros técnicos y meta-prompts para ChatGPT/Claude.
- **Historial y Favoritos locales**: Guarda tus creaciones directamente en tu navegador (LocalStorage).

### 2. 📚 Biblioteca de Prompts de Oro ("Gold Standard")
Colección curada de fórmulas y prompts probados para diferentes disciplinas:
- Animación de logotipos y marcas (*Brand Motion*).
- Tipografía cinética (*Kinetic Typography*).
- Entornos 3D, cgi y fluidos.
- Transiciones y microinteracciones de interfaz (UI/UX).
- Fondos VJ y texturas en movimiento continuo.

### 3. 🧠 Guía & Glosario de Motion Design para IA
- Adaptación de los 12 principios clásicos de la animación al lenguaje de los modelos de difusión de vídeo.
- Diccionario visual de movimientos de cámara (Dolly, Crash Zoom, Orbit, Whip Pan).
- Fórmulas de prompting de alta fidelidad.

### 4. 🛠️ Directorio de Herramientas IA
Comparativa actualizada de motores de vídeo (Runway, Kling, Luma, MiniMax Hailuo, Sora, Midjourney, Pika) con sus fortalezas, debilidades y mejores casos de uso.

---

## 🖥️ Cómo Ejecutar la Aplicación

No necesitas instalar dependencias complejas. La aplicación está diseñada para funcionar inmediatamente:

### Opción 1: Servidor Python rápido (Recomendado)
```bash
python3 server.py
```
O simplemente:
```bash
python3 -m http.server 3000
```
Luego abre tu navegador en: [http://localhost:3000](http://localhost:3000)

### Opción 2: Abrir directamente
Puedes abrir directamente el archivo `index.html` en cualquier navegador web moderno (Chrome, Safari, Firefox, Edge, Brave).

### Opción 3: Con Node / npm
```bash
npm start
```

---

## 📁 Estructura del Repositorio

```
Sangar-library-IA/
├── index.html                   # Interfaz interactiva de la biblioteca y generador
├── app.js                       # Lógica de la aplicación, generador, filtros y almacenamiento
├── styles.css                   # Diseño estilizado dark mode con efectos luminosos
├── server.py                    # Servidor local ligero en Python
├── package.json                 # Scripts de conveniencia
├── data/                        # Datos estructurados en JSON (fáciles de ampliar)
│   ├── motion-generator.json    # Parámetros, presets y vocabulario del generador
│   ├── prompts-library.json     # Catálogo de prompts de alta calidad listos para usar
│   ├── ai-tools.json            # Directorio comparativo de herramientas IA de vídeo
│   └── animation-glossary.json  # Conceptos y términos clave de motion graphics
└── docs/                        # Guías y documentación en Markdown
    ├── motion-graphics-guide.md # Guía para dominar el motion graphics con IA
    ├── prompt-engineering-video.md # Fórmulas avanzadas para Runway, Kling y Sora
    └── tools-comparison.md      # Análisis profundo de cada motor
```

---

## 💡 Cómo Añadir Nuevos Recursos

Todo el contenido está desacoplado en la carpeta `data/`:
1. Para añadir nuevos presets o estilos al generador: edita `data/motion-generator.json`.
2. Para agregar nuevos prompts a la biblioteca: añade un objeto en `data/prompts-library.json`.
3. Para actualizar herramientas de IA: edita `data/ai-tools.json`.

---

Creado para **Sangar AI** — Tu laboratorio personal de Inteligencia Artificial Creativa.
