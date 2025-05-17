// Obtener las referencias a los elementos del formulario
let regionInput = document.getElementById("region");
let comunaInput = document.getElementById("comuna");
let sectorInput = document.getElementById("sector");
let nombreInput = document.getElementById("nombre");
let emailInput = document.getElementById("email");
let telefonoInput = document.getElementById("telefono");
let checkboxes_contactar_por = document.querySelectorAll('#contactar_por_input input[type="checkbox"]');
let dia_hora_inicioInput = document.getElementById("dia_hora_inicio");
let dia_hora_terminoInput = document.getElementById("dia_hora_termino");
let descripcionInput = document.getElementById("descripcion");
let temaInput = document.getElementById("tema");
let fotosInput = document.getElementById("foto");
let agregarfotoBtn = document.getElementById("agregar_foto_btn");
let fotosContainer = document.getElementById("fotos_container");
let agregarActividadBtn = document.getElementById("agregar_actividad_btn");

// Cargar el JSON de regiones y comunas
document.addEventListener("DOMContentLoaded", function () {
    fetch('/static/js/region_comuna.json')
        .then(response => response.json())
        .then(data => {
            const regiones = data.regiones; // Array de regiones

            // Agregar las regiones al select
            regiones.forEach(region => {
                let option = document.createElement("option");
                option.value = region.id;
                option.textContent = region.nombre;
                regionInput.appendChild(option);
            });

            // Agregar funcionalidad al seleccionar una región
            regionInput.addEventListener("change", function () {
                // Limpiar las opciones actuales de comuna
                comunaInput.innerHTML = "<option value='' hidden>Seleccione una Comuna</option>";

                let selectedRegion = regiones.find(region => region.id == this.value);
                
                if (selectedRegion) {
                    selectedRegion.comunas.forEach(comuna => {
                        let option = document.createElement("option");
                        option.value = comuna.id;
                        option.textContent = comuna.nombre;
                        comunaInput.appendChild(option);
                    });
                }
            });
        })
        .catch(error => console.error("Error cargando JSON", error));
    

    const inicioInput = document.getElementById("dia_hora_inicio");
    const terminoInput = document.getElementById("dia_hora_termino");

    // Ajustar el formato de fecha y hora
    function toDatetimeLocal(date) {
        const pad = n => n < 10 ? '0' + n : n; // agrega 0's a la izquierda si el número es menor que 10
        return date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + 'T' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes());
    }

    // Fecha actual
    const now = new Date();
    inicioInput.value = toDatetimeLocal(now);

    // Fecha + 3 horas
    const fin = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    terminoInput.value = toDatetimeLocal(fin);
});

// -------------------- VALIDACIONES -------------------- //


const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/; 
    const errorSpan = document.getElementById("email_error");

    if (!email || !regex.test(email)) {
        errorSpan.textContent = "El email no es válido. Ejemplo: usuario@dominio.com";
        errorSpan.style.display = "block";
        return false;
    } else {
        errorSpan.style.display = "none";
        return true;
    }
};

const validarTelefono = (telefono) => {
    const validadorTelefono = (telefono) => {
        if (!telefono) return true; 
        const regex = /^\+\d{3}\.\d{8}$/; 
        return regex.test(telefono);
    };

    const errorSpan = document.getElementById("telefono_error"); 

    if (!validadorTelefono(telefono)) {
        errorSpan.textContent = "El número de celular debe tener el formato +NNN.NNNNNNNNN"; 
        errorSpan.style.display = "block"; 
        return false;
    } else {
        errorSpan.style.display = "none"; 
        return true;
    }
};

const countCheckboxes = (checkboxes) => {
    let checkedCount = 0;
    let selectedCheckboxes = [];

    for (let cb of checkboxes) {
        if (cb.checked) {
            checkedCount++;
            selectedCheckboxes.push(cb);
        }
    }

    if (checkedCount > 5) {
        alert('No se pueden seleccionar más de 5 medios de contacto.');
        const lastSelected = selectedCheckboxes[selectedCheckboxes.length - 1];
        lastSelected.checked = false; 
        const associatedInput = document.getElementById(lastSelected.name.toLowerCase());
        associatedInput.style.display = "none"; 
        checkedCount = 5;
        return false;
    }
    return true;
};

const validarFechaHora = (inicio, termino) => {
    const errorSpan = document.getElementById("dia_hora_termino_error");

    if (!inicio || !termino) {
        alert("Debe seleccionar fechas y horas de inicio y término.");
        errorSpan.style.display = "block";
        return false;
    }

    const fechaHoraInicio = new Date(inicio);
    const fechaHoraTermino = new Date(termino);

    if (fechaHoraTermino <= fechaHoraInicio) {
        errorSpan.textContent = "La fecha y hora de término debe ser posterior a la de inicio.";
        errorSpan.style.display = "block";
        return false;
    } else {
        errorSpan.style.display = "none";
        return true;
    }
};

const validarTema = () => {
    const otroInput = document.getElementById("otro-id");
    const opcionesSeleccionadas = temaInput.selectedOptions;

    if (opcionesSeleccionadas.length === 0) {
        alert("Debe seleccionar al menos un tema.");
        otroInput.style.display = "none";
        return false;
    }

    for (const option of opcionesSeleccionadas) {
        if (option.value === "otro") {
            otroInput.style.display = "block"; 
            return true; 
        }
    }
    otroInput.style.display = "none";
    return true;
};

const validarFotos = () => {
    const fotosInput = document.getElementById("foto");
    const archivosSeleccionados = fotosInput.files.length; 

    if (archivosSeleccionados < 1) {
        alert("Debe subir al menos 1 foto.");
        return false; 
    }

    if (archivosSeleccionados > 5) {
        alert("No puede subir más de 5 fotos.");
        return false; 
    }

    return true; 
};

const agregarFoto = () => {
    const totalFotos = fotosContainer.querySelectorAll('input[type="file"]').length + 1;

    if (totalFotos >= 5) {
        alert("No puede agregar más de 5 fotos.");
        return false; 
    }

    const nuevoInput = document.createElement("input");
    nuevoInput.type = "file";
    nuevoInput.name = `foto_${totalFotos}`;
    nuevoInput.accept = "image/*";
    fotosContainer.appendChild(nuevoInput);
}

const validarFormulario = () => {
    // Región
    if (!regionInput.value) {
        alert("Debe seleccionar una región.");
        return false;
    }

    // Comuna
    if (!comunaInput.value) {
        alert("Debe seleccionar una comuna.");
        return false;
    }

    // Nombre
    if (!nombreInput.value.trim()) {
        alert("Debe ingresar un nombre.");
        return false;
    }

    // Email
    if (!validarEmail(emailInput.value)) {
        alert("Debe ingresar un email válido.");
        return false;
    }

    // Teléfono
    if (!validarTelefono(telefonoInput.value)) {
        alert("Debe ingresar un teléfono válido.");
        return false;
    }

    // Hora de inicio y término
    if (!validarFechaHora(dia_hora_inicioInput.value, dia_hora_terminoInput.value)) {
        alert("Debe ingresar una hora de inicio y término válidas.");
        return false;
    }

    // Tema
    if (!validarTema()) {
        alert("Debe seleccionar al menos un tema.");
        return false;
    }

    // Fotos
    if (!validarFotos()) {
        alert("Debe subir al menos una foto.");
        return false;
    }

    return true;
};

// -------------------- OTRAS FUNCIONES -------------------- //

function revisaCheck(element){
    if (element.checked){
        document.getElementById(element.name).style.display = "block";
    } else {
        document.getElementById(element.name).style.display = "none";
    }
}

// -------------------- AÑADIR EVENTOS -------------------- //

emailInput.addEventListener("change", function () {
    validarEmail(emailInput.value); 
});

telefonoInput.addEventListener("change", function () {
    validarTelefono(telefonoInput.value);
});

checkboxes_contactar_por.forEach(cb => {
    cb.addEventListener("change", function () {
        countCheckboxes(checkboxes_contactar_por);
    });
});

dia_hora_terminoInput.addEventListener("change", function () {
    validarFechaHora(dia_hora_inicioInput.value, dia_hora_terminoInput.value);
});

temaInput.addEventListener("change", function () {
    validarTema();
});

agregarfotoBtn.addEventListener("click", function () {
    agregarFoto();
});

agregarActividadBtn.addEventListener("click", function () {
    if (!validarFormulario()) {
        return; // Si la validación falla, no se muestra el mensaje ni se realiza ninguna acción
    }

    const confirmacionDiv = document.getElementById("confirmacion");
    confirmacionDiv.style.display = "flex";

    const confirmarSiBtn = document.getElementById("confirmar_si_btn");
    let activityForm = document.getElementById("activity-form");
  
    confirmarSiBtn.addEventListener("click", function () {
        // Solo se muestra el mensaje si la validación fue exitosa y el usuario confirma
        activityForm.submit();

        const confirmacionMensaje = document.getElementById("confirmacion_mensaje");
        confirmacionMensaje.textContent = "Hemos recibido su información, muchas gracias y suerte en su actividad.";
        confirmacionMensaje.style.display = "block";

        if (!document.getElementById("volver_btn")) {
            const volverBtn = document.createElement("button");
            volverBtn.textContent = "Volver a la portada";
            volverBtn.id = "volver_btn";
            volverBtn.classList.add("boton_confirmacion");

            volverBtn.addEventListener("click", function () {
                window.location.href = "/";
            });

            confirmacionMensaje.parentElement.appendChild(volverBtn);
        }
    });

    const confirmarNoBtn = document.getElementById("confirmar_no_btn");
    confirmarNoBtn.addEventListener("click", function () {
        confirmacionDiv.style.display = "none";
    });
});
