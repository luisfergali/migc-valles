
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. MENÚ DE NAVEGACIÓN RESPONSIVE
    // ==========================================

    const menuToggle = document.querySelector(".menu-toggle");
    const navegacion = document.querySelector(".navegacion");
    const enlacesMenu = document.querySelectorAll(".navegacion a");

    if (menuToggle && navegacion) {

        function cerrarMenu() {
            navegacion.classList.remove("activa");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
        }

        menuToggle.addEventListener("click", () => {

            const estaAbierto = navegacion.classList.toggle("activa");

            menuToggle.setAttribute("aria-expanded", estaAbierto);
            menuToggle.setAttribute(
                "aria-label",
                estaAbierto ? "Cerrar menú" : "Abrir menú"
            );

        });

        enlacesMenu.forEach(enlace => {
            enlace.addEventListener("click", cerrarMenu);
        });

        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape") {
                cerrarMenu();
            }
        });

        document.addEventListener("click", evento => {

            const clicDentroMenu = navegacion.contains(evento.target);
            const clicEnBoton = menuToggle.contains(evento.target);

            if (!clicDentroMenu && !clicEnBoton) {
                cerrarMenu();
            }

        });

    }


    // ==========================================
    // 2. GALERÍA COVERFLOW INFINITA
    // ==========================================

    const galeria = document.querySelector(".galeria-grid");

    if (galeria) {

        const imagenesOriginales = Array.from(
            galeria.querySelectorAll("img")
        );

        const cantidad = imagenesOriginales.length;

        if (cantidad > 1) {

            let indiceActual = cantidad * 2;
            let temporizador = null;

            const intervalo = 4000;
            const repeticiones = 5;

            const movimientoReducido = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

            // --------------------------------------
            // Crear cinco secuencias de imágenes
            // --------------------------------------

            galeria.innerHTML = "";

            for (let bloque = 0; bloque < repeticiones; bloque++) {

                imagenesOriginales.forEach(imagenOriginal => {

                    const copia = imagenOriginal.cloneNode(true);

                    copia.classList.remove("activa");

                    // Ocultar copias a lectores de pantalla
                    if (bloque !== 2) {
                        copia.setAttribute("aria-hidden", "true");
                        copia.alt = "";
                    }

                    galeria.appendChild(copia);

                });

            }

            const todasLasImagenes = Array.from(
                galeria.querySelectorAll("img")
            );

            // --------------------------------------
            // Centrar la imagen seleccionada
            // --------------------------------------

            function centrarImagen(indice, animar = true) {

                const imagen = todasLasImagenes[indice];

                if (!imagen) return;

                const desplazamiento =
                    imagen.offsetLeft +
                    imagen.offsetWidth / 2 -
                    galeria.offsetWidth / 2;

                galeria.style.transition = animar
                    ? "transform 0.8s ease"
                    : "none";

                galeria.style.transform =
                    `translateX(calc(-50% - ${desplazamiento}px))`;

                // Actualizar la imagen central
                todasLasImagenes.forEach(img => {
                    img.classList.remove("activa");
                });

                imagen.classList.add("activa");

            }

            // --------------------------------------
            // Avanzar siempre hacia adelante
            // --------------------------------------

            function siguienteImagen() {

                indiceActual++;

                centrarImagen(indiceActual);

            }

            // --------------------------------------
            // Reinicio invisible del ciclo
            // --------------------------------------

          
// --------------------------------------
// Reinicio invisible del ciclo
// --------------------------------------

galeria.addEventListener("transitionend", evento => {

    if (evento.target !== galeria) return;
    if (evento.propertyName !== "transform") return;

    if (indiceActual >= cantidad * 3) {

        // Volver al bloque central
        indiceActual = cantidad * 2;

        // Desactivar temporalmente la transición
        galeria.style.transition = "none";

        // Calcular la posición equivalente
        const imagen = todasLasImagenes[indiceActual];

        const desplazamiento =
            imagen.offsetLeft +
            imagen.offsetWidth / 2 -
            galeria.offsetWidth / 2;

        // Reubicar sin animación
        galeria.style.transform =
            `translateX(calc(-50% - ${desplazamiento}px))`;

        // Actualizar la imagen central
        todasLasImagenes.forEach((img, i) => {
            img.classList.toggle("activa", i === indiceActual);
        });

        // Forzar al navegador a aplicar el cambio
        galeria.getBoundingClientRect();

        // Restaurar la transición después del reposicionamiento
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {

                galeria.style.transition = "transform 0.8s ease";

            });
        });

    }

});

            // --------------------------------------
            // Reproducción automática
            // --------------------------------------

            function iniciarGaleria() {

                detenerGaleria();

                if (movimientoReducido.matches) return;

                temporizador = setInterval(
                    siguienteImagen,
                    intervalo
                );

            }

            function detenerGaleria() {

                if (temporizador !== null) {

                    clearInterval(temporizador);
                    temporizador = null;

                }

            }

            // --------------------------------------
            // Pausar al interactuar
            // --------------------------------------

            galeria.addEventListener("mouseenter", detenerGaleria);
            galeria.addEventListener("mouseleave", iniciarGaleria);

            galeria.addEventListener("focusin", detenerGaleria);
            galeria.addEventListener("focusout", iniciarGaleria);

            document.addEventListener("visibilitychange", () => {

                if (document.hidden) {
                    detenerGaleria();
                } else {
                    iniciarGaleria();
                }

            });

            // --------------------------------------
            // Adaptar al tamaño de pantalla
            // --------------------------------------

            let ajustePendiente = false;

            window.addEventListener("resize", () => {

                if (ajustePendiente) return;

                ajustePendiente = true;

                requestAnimationFrame(() => {

                    centrarImagen(indiceActual, false);

                    ajustePendiente = false;

                });

            });

            // --------------------------------------
            // Respetar movimiento reducido
            // --------------------------------------

            movimientoReducido.addEventListener(
                "change",
                iniciarGaleria
            );

            // --------------------------------------
            // Esperar a que carguen las imágenes
            // --------------------------------------

            const imagenesListas = Promise.all(
                todasLasImagenes.map(img => {

                    if (img.complete) {
                        return Promise.resolve();
                    }

                    return new Promise(resolve => {

                        img.addEventListener("load", resolve, {
                            once: true
                        });

                        img.addEventListener("error", resolve, {
                            once: true
                        });

                    });

                })
            );

            imagenesListas.then(() => {

                centrarImagen(indiceActual, false);

                iniciarGaleria();

            });

        } else if (cantidad === 1) {

            imagenesOriginales[0].classList.add("activa");

        }

    }

});
