# ⚡ Fórmulas Avanzadas de Prompt Engineering para Vídeo & Motion

> Domina la sintaxis exacta para Runway Gen-3, Kling 1.5, Luma Dream Machine y Sora.

---

## 🎯 La Fórmula Universal para Motion Graphics con IA

```
[Tipo de Pieza] + [Sujeto / Geometría 3D] + [Material & Estilo] + [Dinámica de Movimiento & Físicas] + [Trayectoria de Cámara] + [Iluminación & Colorimetría] + [Tempo & FPS] + [Parámetros del Motor]
```

### Ejemplo aplicado:
> **Prompt:** `Cinematic 3D logo reveal, a minimalist geometric monogram emerging from black obsidian liquid, brushed gold metallic finish, snapping into place with subtle electric spark shockwave, slow orbital 360 camera sweep, dramatic chiaroscuro with cyan rim light, 24fps smooth motion blur --ar 16:9 --motion 6`

---

## 🛠️ Sintaxis y Parámetros por Motor

### 1. Runway Gen-3 Alpha
- **Enfoque:** Control cinemático de cámara y consistencia visual.
- **Estructura recomendada:** Comienza con la cámara y luego describe la acción.
- **Parámetros clave:**
  - `--fps 24`: Frecuencia cinematográfica.
  - `--motion 1` a `--motion 10`: Sensibilidad de movimiento (5 a 7 es el punto dulce para motion graphics; más de 8 puede deformar la geometría).
  - `--loop`: Genera clips que ciclan de forma infinita.

### 2. Kling AI 1.5
- **Enfoque:** Físicas hiperrealistas de materiales (líquidos, telas, gravedad, colisiones).
- **Pro-tip:** Especifica siempre el peso y la masa del objeto. Si es un cubo de plomo, escribe `heavy metallic mass with real-world gravity momentum`. Si es una tela, escribe `silk fabric billowing with turbulent air draft`.
- **Modos:** Utiliza el modo **Professional (1080p)** y fija una duración de **5s** o **10s**.

### 3. Luma Dream Machine
- **Enfoque:** Reconstrucción tridimensional y trayectorias espaciales en 3D.
- **Pro-tip:** Luma es excelente interpretando la transición entre dos fotogramas clave. Sube tu imagen de inicio (por ejemplo, piezas dispersas) y tu imagen final (el logotipo ensamblado) y usa el prompt: `smooth dynamic interpolation, magnetic assembly with particle drift`.

### 4. Midjourney v6.1 (Para crear el Hero Frame)
- **Fórmula de prompting para Hero Frames:**
  ```
  [Subject in pristine condition], [material textures], centered composition, clean studio backdrop, high-end 3D product render in Octane / Cinema 4D, moody rim lighting --ar 16:9 --style raw --stylize 200 --v 6.1
  ```

---

## 🚫 Prompt Negativo Universal para Motion Graphics

Para evitar deformaciones orgánicas, caras derretidas o aberraciones tipográficas en motores que soportan parámetros negativos, incluye:

```
messy, distorted, morphing artifacts, blurry, low resolution, amateur CGI, watermark, text glitches, jittery camera, overexposed, blown out highlights, oversaturated colors
```

---

## 💡 Trucos de Dirección de Arte para After Effects

Cuando utilices ChatGPT o Claude para crear expresiones matemáticas de animación, prueba este prompt:

> *"Escribe una expresión de After Effects para aplicar a la propiedad Escala de una capa de texto, que cree un efecto de rebote elástico (inertia bounce con amplitud = 0.08, frecuencia = 4.0 y decaimiento = 6.0) cada vez que alcance un fotograma clave."*
