function actualizarCodigo() {
    const codigoElement = document.getElementById('codigo-generado');
    const contadorElement = document.getElementById('contador');

    if (codigoElement && contadorElement) { // Verificar si los elementos existen
        fetch('/api/obtener_codigo')
            .then(response => response.json())
            .then(data => {
                codigoElement.innerText = data.codigo;
                const minutos = Math.floor(data.tiempo_restante / 60);
                const segundos = data.tiempo_restante % 60;
                contadorElement.innerText = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
            })
            .catch(error => {
                console.error("Error al obtener el código:", error);
            });
    } else {
        console.warn("Elementos 'codigo-generado' o 'contador' no encontrados en el DOM.");
    }
}

function copiarCodigo() {
    const codigoElement = document.getElementById('codigo-generado');
    if (codigoElement) {
        const codigo = codigoElement.innerText;

        navigator.clipboard.writeText(codigo)
            .then(() => {
                alert('¡Código copiado al portapapeles!'); // O tu mensaje
            })
            .catch(err => {
                console.error('Error al copiar el texto: ', err);
            });
    } else {
        console.warn("Elemento 'codigo-generado' no encontrado en el DOM.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const iconMenu = document.getElementById("icon_menu");
    const menu = document.querySelector(".menu");
    const modal = document.getElementById("loginModal");
    const btnLogin = document.querySelector(".btn_header_login");
    const btnRegister = document.querySelector(".btn_header_register");
    const btnRegister2 = document.getElementById("btn_register_2");
    const closeModal = document.getElementById("closeModal");

    const btnIniciarSesion = document.getElementById("btn_iniciar_sesion");
    const btnRegistrarse = document.getElementById("btn_registrarse");
    const formularioLogin = document.getElementById("formulario_login");
    const formularioRegister = document.getElementById("formulario_register");

    setInterval(actualizarCodigo, 1000);
    actualizarCodigo(); // Llamar una vez al cargar la página

    // Mostrar/ocultar menú responsive
    if (iconMenu && menu) {
        iconMenu.addEventListener("click", () => {
            menu.classList.toggle("mostrar_menu");
        });
    }

    // Función para mostrar el modal
    function mostrarModal(tipo) {
        if (modal) {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden"; // Evita scroll cuando el modal está abierto

            if (tipo === "login") {
                if (formularioLogin) formularioLogin.style.display = "block";
                if (formularioRegister) formularioRegister.style.display = "none";
            } else if (tipo === "register") {
                if (formularioLogin) formularioLogin.style.display = "none";
                if (formularioRegister) formularioRegister.style.display = "block";
            }
        }
    }

    // Función para cerrar el modal
    function cerrarModal() {
        if (modal) modal.style.display = "none";
        document.body.style.overflow = "auto"; // Permite scroll de nuevo
    }

    // Botones que abren el modal
    if (btnLogin) btnLogin.addEventListener("click", (e) => { e.preventDefault(); mostrarModal("login"); });
    if (btnRegister) btnRegister.addEventListener("click", (e) => { e.preventDefault(); mostrarModal("register"); });
    if (btnRegister2) btnRegister2.addEventListener("click", (e) => { e.preventDefault(); mostrarModal("register"); });

    // Botón de cerrar modal
    if (closeModal) closeModal.addEventListener("click", cerrarModal);

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // Intercambio de formularios dentro del modal
    if (btnIniciarSesion) {
        btnIniciarSesion.addEventListener("click", function (e) {
            e.preventDefault();
            mostrarModal("login");
        });
    }

    if (btnRegistrarse) {
        btnRegistrarse.addEventListener("click", function (e) {
            e.preventDefault();
            mostrarModal("register");
        });
    }

    // Mostrar login por defecto al cargar
    if (formularioLogin && formularioRegister) {
        formularioLogin.style.display = "block";
        formularioRegister.style.display = "none";
    }

    // ==================== EFECTO PARALLAX ====================
    window.addEventListener("scroll", () => {
        const msg = document.getElementById("icon_msg");
        const fire = document.getElementById("icon_fire");

        if (msg) msg.style.transform = `translateY(${window.scrollY * 0.1}px)`;
        if (fire) fire.style.transform = `translateY(-${window.scrollY * 0.1}px)`;
    });

    // ==================== FORMULARIOS LOGIN Y REGISTRO ====================

    // Enviar login a Flask
    if (formularioLogin) {
        formularioLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = formularioLogin.email.value;
            const contraseña = formularioLogin.contraseña.value;

            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, contraseña })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Error en la solicitud de login:", res.status, errorText);
                    alert("Error al iniciar sesión. Inténtalo de nuevo.");
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    window.location.href = "/welcome";  //  Redirige a welcome si login exitoso
                } else {
                    alert(data.message);  // Mostrar error
                }
            } catch (error) {
                console.error("Error al enviar la solicitud de login:", error);
                alert("Error al iniciar sesión. Inténtalo de nuevo.");
            }
        });
    }

    // Enviar registro a Flask
    if (formularioRegister) {
        formularioRegister.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = formularioRegister.nombre.value;
            const email = formularioRegister.email.value;
            const contraseña = formularioRegister.contraseña.value;

            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, email, contraseña })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Error en la solicitud de registro:", res.status, errorText);
                    alert("Error al registrarse. Inténtalo de nuevo.");
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    alert("¡Registro exitoso! Ahora inicia sesión.");
                    mostrarModal("login");
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Error al enviar la solicitud de registro:", error);
                alert("Error al registrarse. Inténtalo de nuevo.");
            }
        });
    }

    const reservationForm = document.getElementById('reservation-form');
    const messageDiv = document.getElementById('message');

    if (reservationForm) {
        reservationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = document.getElementById('guests').value;

            // Aquí podrías agregar lógica para validar los datos antes de "enviar"

            // Simulación de envío exitoso
            setTimeout(() => {
                if (messageDiv) {
                    messageDiv.textContent = `¡Reserva realizada con éxito para ${name} el ${date} a las ${time} para ${guests} persona(s)!`;
                    messageDiv.className = 'success';
                    messageDiv.classList.remove('hidden');
                    reservationForm.reset(); // Limpia el formulario
                    setTimeout(() => {
                        messageDiv.classList.add('hidden');
                    }, 10000); // Oculta el mensaje después de 10 segundos
                }
            }, 1000);
        });
    }

    const menuItems = document.getElementById("menuItems");
    const sidebar = document.querySelector(".sidebar");

    function toggleMenu() {
        if (menuItems) {
            menuItems.style.display = menuItems.style.display === "block" ? "none" : "block";
        }
        if (sidebar) {
            sidebar.style.width = menuItems && menuItems.style.display === "block" ? "200px" : "60px";
        }
    }

    window.toggleMenu = toggleMenu; // Hacer la función globalmente accesible si es necesario

    const secciones = document.querySelectorAll(".seccion");
    function mostrarSeccion(id) {
        secciones.forEach(sec => sec.classList.add("hidden"));
        const seccionMostrar = document.getElementById(id);
        if (seccionMostrar) {
            seccionMostrar.classList.remove("hidden");
        }
    }
    window.mostrarSeccion = mostrarSeccion; // Hacer la función globalmente accesible si es necesario
});

document.getElementById("descargar").addEventListener("click", () => {
    alert("Iniciando descarga...");
    // Aquí puedes agregar el código para descargar un archivo
});

document.getElementById("volver-menu").addEventListener("click", () => {
    window.location.href = "/menu"; // Cambia la URL al menú principal
});

document.getElementById("cambiar-tema").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});


//Alto contraste para la pagina
const accesibilidadSection = document.getElementById('accesibilidad');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const contrasteSelect = document.getElementById('contrasteSelect');
const body = document.body; // O el elemento que quieras estilizar

fontSizeSlider.addEventListener('input', () => {
    const newFontSize = fontSizeSlider.value + 'px';
    body.style.fontSize = newFontSize;
  
    // Opcional: Guardar la preferencia en el almacenamiento local
    localStorage.setItem('fontSize', newFontSize);
  });

  contrasteSelect.addEventListener('change', () => {
  const selectedContrast = contrasteSelect.value;
  body.classList.remove('alto-contraste'); // Remueve cualquier clase de contraste anterior

  if (selectedContrast === 'alto') {
    body.classList.add('alto-contraste');
  }

  // Opcional: Guardar la preferencia en el almacenamiento local
  localStorage.setItem('contraste', selectedContrast);
});

// Al cargar la página, Mantiene la configuración del usuario
document.addEventListener('DOMContentLoaded', () => {
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize) {
      body.style.fontSize = storedFontSize;
      fontSizeSlider.value = storedFontSize.slice(0, -2); // Remover 'px' para establecer el valor del slider
    }
  
    const storedContrast = localStorage.getItem('contraste');
    if (storedContrast) {
      contrasteSelect.value = storedContrast;
      if (storedContrast === 'alto') {
        body.classList.add('alto-contraste');
      }
    }
  });