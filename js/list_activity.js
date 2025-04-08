const detalleDiv = document.getElementById("detalle_container");
const detalleDonde = document.getElementById("detalle_donde");
const detalleQuien = document.getElementById("detalle_quien");
const detalleCuando = document.getElementById("detalle_cuando");
const detalleImagenes = document.getElementById("detalle_imagenes");
const imagenAmpliadaDiv = document.getElementById("imagen_ampliada")

function mostrarDetalle(fila) {

    const celdas = fila.getElementsByTagName("td");
    const inicio = celdas[0].textContent;
    const termino = celdas[1].textContent;
    const comuna = celdas[2].textContent;
    const sector = celdas[3].textContent;
    const tema = celdas[4].textContent;
    const organizador = celdas[5].textContent;
    const imagenes = celdas[6].querySelectorAll("img");

    const region = "Región Metropolitana";
    const email = "organizador@dominio.com"; 
    const telefono = "+569.12345678"; 
    const descripcion = "Atrapar Medusas"; 
    const mediosContacto = ["WhatsApp", "Telegram"];

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

    imagenes.forEach((img) => {
        const nuevaImagen = document.createElement("img");
        nuevaImagen.src = img.src;
        nuevaImagen.alt = img.alt;
        nuevaImagen.style.width = "320px";
        nuevaImagen.style.height = "240px";
        nuevaImagen.style.margin = "5px";
        nuevaImagen.onclick = () => ampliarImagen(img);
        detalleImagenes.appendChild(nuevaImagen);
    });

    detalleDiv.style.display = "flex";
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