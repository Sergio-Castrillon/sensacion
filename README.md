# Sensación - E-commerce de Cuidado Personal

Este proyecto es un sitio web e-commerce para "Sensación", una marca de cuidado personal. El sitio está diseñado para ser moderno, responsivo y fácil de usar, ofreciendo una experiencia de compra agradable para los productos de cuidado personal.

## Características

- **Página de Inicio:** Una landing page atractiva que destaca productos y promociones.
- **Página de Productos:** Muestra todos los productos disponibles con opciones de filtrado.
- **Detalles del Producto:** Páginas individuales para cada producto con información detallada.
- **Contacto:** Un formulario de contacto para que los usuarios puedan comunicarse con la marca.
- **Diseño Responsivo:** Adaptado para verse bien en dispositivos de todos los tamaños (móviles, tablets y desktops).
- **Formulario de Contacto Integrado:** Utiliza Formspree para la gestión de envíos de formularios.

## Estructura del Proyecto

```
sensacion/
├── index.html
├── images/
│   ├── logo-sensacion-64x64.png
│   ├── logo-sensacion.png
│   └── icons/
│       └── logo-sensacion.ico
├── js/
│   ├── main.js
│   └── product-details.js
├── pages/
│   ├── contact.html
│   ├── product-details.html
│   └── products.html
└── style/
    └── styles.css
```

## Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Font Awesome (para iconos)
- Google Fonts (Poppins)
- Formspree (para el formulario de contacto)

## Configuración y Ejecución Local

Para ver y probar este proyecto localmente, sigue estos pasos:

1.  **Clona el repositorio (si aplica):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd sensacion
    ```

2.  **Abre los archivos en tu navegador:**
    Simplemente abre el archivo `index.html` en tu navegador web preferido. Puedes hacerlo arrastrando el archivo al navegador o haciendo doble clic en él.

    Para una mejor experiencia de desarrollo (especialmente si trabajas con JavaScript y rutas relativas), se recomienda usar un servidor web local. Algunas opciones sencillas son:

    -   **Live Server (Extensión de VS Code):** Si usas Visual Studio Code, instala la extensión "Live Server" y haz clic derecho en `index.html` (o en cualquier archivo HTML) y selecciona "Open with Live Server".

    -   **Python Simple HTTP Server:** Si tienes Python instalado, navega a la raíz del proyecto en tu terminal y ejecuta:
        ```bash
        python -m http.server
        # O para Python 3:
        python3 -m http.server
        ```
        Luego, abre tu navegador y ve a `http://localhost:8000`.

## Formulario de Contacto (Formspree)

El formulario de contacto en `pages/contact.html` está configurado para usar [Formspree](https://formspree.io/). Para que el formulario funcione, necesitarás reemplazar `mgvzkdqg` en la acción del formulario con tu propio ID de formulario de Formspree.

```html
<form action="https://formspree.io/f/TU_ID_DE_FORMULARIO" method="POST">
  <!-- ... -->
</form>
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## Licencia

Este proyecto no tiene una licencia explícita. Esto significa que no se otorgan derechos de uso, modificación o distribución a terceros. Si deseas utilizar este proyecto, por favor, contacta al autor para obtener permiso.