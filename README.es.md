# 🌊 WaveTube

**WaveTube es como YouTube, pero mejor.**

Una plataforma de video completa — subida y reproducción de videos, Shorts (feed vertical a pantalla completa), un feed social con publicaciones y encuestas, canales, suscripciones, mensajes directos con llamadas de voz/video, notificaciones en vivo, ventajas VIP y un panel de administración completo. Construido enteramente mediante prompts (vibe-coding), sin código manual.

🔗 **Sitio en vivo:** https://revx8199-cloud.github.io/WAVETUBE/

---

## ✨ Características

### Plataforma principal
- Reproductor de video personalizado (barra de progreso, indicador de buffering, volumen, pantalla completa)
- **Shorts** — feed vertical a pantalla completa estilo TikTok/YouTube, con autoplay, likes/dislikes, comentarios y compartir
- Canales con avatares, suscripciones y notificaciones a suscriptores
- Feed social: publicaciones de texto/imagen, encuestas con conteo de votos en vivo, comentarios, likes/dislikes
- Mensajes directos con llamadas de voz/video (notificaciones push del navegador cuando está cerrado, vía service worker)
- Actualizaciones en tiempo real (nuevas publicaciones, notificaciones) mediante Supabase Realtime
- Sistema de presencia/heartbeat (seguimiento de estado en línea)
- Listas de "Guardados" / "Ver más tarde", listas de reproducción
- Tema claro y oscuro, guardado en el almacenamiento local
- Interfaz multilingüe: polaco, inglés, ruso, español

### Sistemas VIP y de administración
- **Panel VIP** — ventajas para usuarios VIP (colores/fuentes de nombre personalizados, marcos de avatar, estilos de emojis, insignias)
- **Panel de administración / Studio** — gestión de usuarios, controles de silencio/baneo, personalización de color de insignias, anuncios globales
- Sistema de reportes para marcar contenido (videos, publicaciones)
- Panel de estadísticas para seguir la actividad de la plataforma

### Seguridad
- Protección XSS en contenido generado por usuarios (publicaciones, comentarios, campos de perfil)
- Políticas de Row-Level Security configuradas en Supabase
- Límite de frecuencia en publicaciones, protección contra spam de likes/dislikes (control del lado del servidor, por usuario)

---

## 🛠️ Tecnologías

- **Frontend:** HTML/CSS/JavaScript puro (arquitectura multi-archivo: lógica dividida en core.js, videos.js, channel.js, posts.js, messages.js, admin.js, translations.js)
- **Backend:** [Supabase](https://supabase.com) — autenticación, base de datos Postgres, suscripciones en tiempo real, Row-Level Security
- **Hosting:** GitHub Pages
- **Fuentes:** Google Fonts (más de 30 fuentes decorativas para personalizar el nombre de usuario)

---

## 📁 Estructura del proyecto

```
WAVETUBE/
├── index.html         # Estructura de la página
├── style.css           # Estilos
├── core.js             # Lógica principal, comentarios, ajustes, motor i18n
├── videos.js            # Reproductor, feed de Shorts, subida de videos
├── channel.js            # Páginas de canal
├── posts.js              # Feed social, encuestas, pestañas Home/Shorts del canal
├── messages.js            # Mensajes directos, llamadas de voz/video
├── admin.js               # Panel de administración / Studio
├── translations.js        # Traducciones pl/en/ru/es
└── sw.js                  # Service worker (notificaciones push)
```

---

## 🚀 Sobre este proyecto

WaveTube es un proyecto personal construido enteramente mediante desarrollo guiado por prompts con Claude — ni una línea de código escrita a mano, solo iteración a través de lenguaje natural y pruebas. Comenzó como una simple página de video y creció hasta convertirse en una plataforma social completa con su propia infraestructura de moderación y VIP.

---

## 📌 Estado

En desarrollo activo. Se añaden nuevas funciones regularmente.
