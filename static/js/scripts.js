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

    // Mostrar/ocultar menú responsive
    if (iconMenu && menu) {
        iconMenu.addEventListener("click", () => {
            menu.classList.toggle("mostrar_menu");
        });
    }

    // Función para mostrar el modal
    function mostrarModal(tipo) {
        if (!modal) return;
        modal.style.display = "flex";

        if (tipo === "login") {
            formularioLogin.style.display = "block";
            formularioRegister.style.display = "none";
        } else if (tipo === "register") {
            formularioLogin.style.display = "none";
            formularioRegister.style.display = "block";
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
        const y = window.scrollY;

        const msg = document.getElementById("icon_msg");
        const fire = document.getElementById("icon_fire");

        if (msg) msg.style.transform = `translateY(${y * 0.1}px)`;
        if (fire) fire.style.transform = `translateY(-${y * 0.1}px)`;
    });

    // ==================== FORMULARIOS LOGIN Y REGISTRO ====================

    // Enviar login a Flask
    if (formularioLogin) {
        formularioLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = formularioLogin.email.value;
            const contraseña = formularioLogin.contraseña.value;

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, contraseña })
            });

            const data = await res.json();
            if (data.success) {
                window.location.href = "/welcome";  // 🔥 Redirige a welcome si login exitoso
            } else {
                alert(data.message);  // Mostrar error
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

            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, contraseña })
            });

            const data = await res.json();
            if (data.success) {
                alert("¡Registro exitoso! Ahora inicia sesión.");
                mostrarModal("login");
            } else {
                alert(data.message);
            }
        });
    }
});


const reservationForm = document.getElementById('reservation-form');
const messageDiv = document.getElementById('message');

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
        messageDiv.textContent = `¡Reserva realizada con éxito para ${name} el ${date} a las ${time} para ${guests} persona(s)!`;
        messageDiv.className = 'success';
        messageDiv.classList.remove('hidden');
        reservationForm.reset(); // Limpia el formulario
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 10000); // Oculta el mensaje después de 10 segundos
    }, 1000);
});

