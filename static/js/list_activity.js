const detalleDiv = document.getElementById("detalle_container");
const detalleDonde = document.getElementById("detalle_donde");
const detalleQuien = document.getElementById("detalle_quien");
const detalleCuando = document.getElementById("detalle_cuando");
const detalleImagenes = document.getElementById("detalle_imagenes");
const imagenAmpliadaDiv = document.getElementById("imagen_ampliada")

let agregarComentarioBtn = document.getElementById("agregar_comentario_btn");

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".activity-row").forEach((fila) => {
        fila.addEventListener("click", () => {
            const actividadJson = fila.dataset.activity;
            const actividad = JSON.parse(actividadJson);
            mostrarDetalle(actividad);
        });
    });
});

async function cargarComentarios(actividad_id) {
    fetch(`/comentarios/${actividad_id}`)
        .then(response => response.json())
        .then(comentarios => {
            const lista = document.getElementById("lista_comentarios");
            lista.innerHTML = "";

            if (comentarios.length === 0) {
                lista.innerHTML = "<em>Aún no hay comentarios</em>";
                return;
            }

            comentarios.forEach(com => {
                const li = document.createElement("li");
                li.innerHTML = `<em>(${com.fecha})</em> <strong>${com.nombre}:</strong> ${com.texto}`;
                lista.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error al cargar comentarios:", error);
        });
}

function mostrarDetalle(activity) {
    const region = activity.region || "No definida";
    const comuna = activity.comuna;
    const sector = activity.sector;
    const inicio = activity.dia_hora_inicio;
    const termino = activity.dia_hora_termino;
    const tema = activity.temas;
    const organizador = activity.nombre;
    const email = activity.email || "No especificado";
    const telefono = activity.celular || "No especificado";
    const descripcion = activity.descripcion || "Sin descripción";
    const mediosContacto = activity.contactar_por ? activity.contactar_por.split(", ") : [];

    document.getElementById("actividad_id").value = activity.id;
    console.log("Actividad ID:", activity.id);

    detalleDonde.innerHTML = `
        <strong style="font-size: 1.2rem;">¿Dónde?</strong><br>
        <strong>Región:</strong> ${region}<br>
        <strong>Comuna:</strong> ${comuna}<br>
        <strong>Sector:</strong> ${sector}<br>
    `;

    detalleQuien.innerHTML = `
        <strong style="font-size: 1.2rem;">¿Quién organiza?</strong><br>
        <strong>Nombre:</strong> ${organizador}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Número de Celular:</strong> ${telefono}<br>
        <strong>Contactar por:</strong> ${mediosContacto.join(", ")}<br>
    `;

    detalleCuando.innerHTML = `
        <strong style="font-size: 1.2rem;">¿Cuándo y de qué trata?</strong><br>
        <strong>Día y Hora Inicio:</strong> ${inicio}<br>
        <strong>Día y Hora Término:</strong> ${termino}<br>
        <strong>Descripción:</strong> ${descripcion}<br>
        <strong>Tema:</strong> ${tema}<br>
    `;

    detalleImagenes.innerHTML = "";

    if (activity.foto && activity.foto.length > 0) {
        activity.foto.forEach((ruta) => {
            const nuevaImagen = document.createElement("img");
            nuevaImagen.src = `/static/uploads/${ruta}`;
            nuevaImagen.alt = "Foto de actividad";
            nuevaImagen.style.width = "320px";
            nuevaImagen.style.height = "240px";
            nuevaImagen.style.margin = "5px";
            nuevaImagen.onclick = () => ampliarImagen(nuevaImagen);
            detalleImagenes.appendChild(nuevaImagen);
        });
    } else {
        detalleImagenes.innerHTML = "<em>Sin imágenes</em>";
    }

    detalleDiv.style.display = "flex";

    cargarComentarios(activity.id);
}

function cerrarDetalle() {
    detalleDiv.style.display = "none";
}

function ampliarImagen(imagen) {
    const imagenGrande = document.getElementById("imagen_grande");
    imagenGrande.src = imagen.src;
    imagenAmpliadaDiv.style.display = "flex";
}

function cerrarImagen() {
    imagenAmpliadaDiv.style.display = "none";
}

function validarComentario() {
    const nombre = document.getElementById("nombre").value.trim();
    const textoComentario = document.getElementById("texto").value.trim();
    const errorP = document.getElementById("comentario_error");
    errorP.textContent = "";

    if (!nombre) {
        errorP.textContent = "El nombre es obligatorio.";
        return false;
    }
    if (nombre.length < 3) {
        errorP.textContent = "El nombre debe tener al menos 3 caracteres.";
        return false;
    }
    if (nombre.length > 80) {
        errorP.textContent = "El nombre no puede tener más de 80 caracteres.";
        return false;
    }

    if (!textoComentario) {
        errorP.textContent = "El comentario es obligatorio.";
        return false;
    }
    if (textoComentario.length < 5) {
        errorP.textContent = "El comentario debe tener al menos 5 caracteres.";
        return false;
    }

    errorP.textContent = "";
    return true;
}