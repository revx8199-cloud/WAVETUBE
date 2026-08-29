# 🌊 WaveTube

**WaveTube es como YouTube, pero mejor.**

Una plataforma de video completa construida como una aplicación web de una sola página — subida y reproducción de videos, un feed social con publicaciones y encuestas, canales, suscripciones, notificaciones en vivo, ventajas VIP y un panel de administración completo. Construido enteramente mediante prompts (vibe-coding), sin código manual.

🔗 **Sitio en vivo:** https://revx8199-cloud.github.io/WAVETUBE/

---

## ✨ Características

### Plataforma principal
- Reproductor de video personalizado (barra de progreso, indicador de buffering, volumen, pantalla completa)
- Canales con avatares, suscripciones y notificaciones a suscriptores
- Feed social: publicaciones de texto/imagen, encuestas con conteo de votos en vivo, comentarios, likes
- Actualizaciones en tiempo real (nuevas publicaciones, notificaciones) mediante Supabase Realtime
- Sistema de presencia/heartbeat (seguimiento de estado en línea)
- Listas de "Guardados" / "Ver más tarde"
- Tema claro y oscuro, guardado en el almacenamiento local
- Interfaz multilingüe (polaco, ruso)

### Sistemas VIP y de administración
- **Panel VIP** — ventajas para usuarios VIP (colores/fuentes de nombre personalizados, insignias)
- **Panel de administración** — gestión de usuarios, controles de silencio/baneo, personalización de color de insignias
- **Consola de administración** — herramientas de moderación y supervisión de la plataforma
- Sistema de reportes para marcar contenido
- Panel de estadísticas para seguir la actividad de la plataforma

### Seguridad
- Protección XSS en contenido generado por usuarios (publicaciones, comentarios, campos de perfil)
- Políticas de Row-Level Security configuradas en Supabase
- Límite de frecuencia en publicaciones (rate limiting)

---

## 🛠️ Tecnologías

- **Frontend:** HTML/CSS/JavaScript puro (arquitectura de archivo único)
- **Backend:** [Supabase](https://supabase.com) — autenticación, base de datos Postgres, suscripciones en tiempo real, Row-Level Security
- **Hosting:** GitHub Pages
- **Fuentes:** Google Fonts (más de 30 fuentes decorativas para personalizar el nombre de usuario)

---

## 📁 Estructura del proyecto

```
WAVETUBE/
├── index.html      # Toda la aplicación (interfaz, estilos y lógica)
└── музыка.mp3       # Archivo de audio
```

---

## 🚀 Sobre este proyecto

WaveTube es un proyecto personal construido enteramente mediante desarrollo guiado por prompts con Claude — ni una línea de código escrita a mano, solo iteración a través de lenguaje natural y pruebas. Comenzó como una simple página de video y creció hasta convertirse en una plataforma social completa con su propia infraestructura de moderación y VIP.

---

## 📌 Estado

En desarrollo activo. Se añaden nuevas funciones regularmente.
