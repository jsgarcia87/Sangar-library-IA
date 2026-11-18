# 🪄 Guía Rápida: Expresiones de After Effects para Motion Designers

> Cómo acelerar tu flujo de trabajo en After Effects un 500% sin animar keyframes a mano.

---

## ⚡ ¿Cómo se usa una expresión en After Effects?

1. En tu línea de tiempo, despliega la capa que deseas animar.
2. Mantén pulsada la tecla **`Alt`** (Windows) u **`Option (⌥)`** (Mac) y haz **clic izquierdo sobre el icono del cronómetro** de la propiedad (por ejemplo, *Escala*, *Posición* u *Opacidad*).
3. Verás que los números de la propiedad se vuelven de color rojo y se abre una caja de texto.
4. Borra lo que haya y pega la expresión directamente.
5. Haz clic fuera para aplicar. ¡Listo!

---

## 🧰 Las 4 Expresiones Imprescindibles

### 1. Rebote Elástico Automático (*Inertia Bounce*)
Evita tener que crear 6 keyframes de rebote para cada texto o botón que aparece. Solo crea 2 keyframes (ej: escala de 0 a 100%) y la expresión calcula la inercia física real basándose en la velocidad de llegada.

```javascript
// Inertia Bounce - Sangar AI Library
amp = 0.06;  // Altura del rebote
freq = 3.5;  // Frecuencia
decay = 5.0; // Qué tan rápido se frena

n = 0;
if (numKeys > 0){
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n == 0){
  t = 0;
} else {
  t = time - key(n).time;
}
if (n > 0 && t < 1){
  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);
  value + v*(amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t));
} else {
  value;
}
```

---

### 2. Bucle Perfecto (*LoopOut PingPong*)
Crea una animación continua de 2 fotogramas (por ejemplo una flotación arriba y abajo) y haz que se repita para siempre.

```javascript
loopOut("pingpong");
```
*Si quieres que vaya siempre hacia adelante en bucle de rueda giratoria, usa `loopOut("cycle")`.*

---

### 3. Vibración Orgánica (*Wiggle*)
Aplica en la propiedad Posición o Rotación para darle vida sutil a cámaras flotantes o elementos que flotan en gravedad cero.

```javascript
wiggle(2, 20); // 2 veces por segundo, 20 píxeles de rango
```

---

### 4. Fade In & Fade Out Automático
Aplica en Opacidad. La capa aparecerá y desaparecerá en 0.4 segundos automáticamente cuando comience o termine la barra de la capa en la línea de tiempo.

```javascript
fadeTime = 0.4;
fadeIn = linear(time, inPoint, inPoint + fadeTime, 0, 100);
fadeOut = linear(time, outPoint - fadeTime, outPoint, 0, 100);

if (time < inPoint + fadeTime) fadeIn;
else if (time > outPoint - fadeTime) 100 - fadeOut;
else 100;
```
