export function defaultPerfumeForm() {
  return {
    nombre: "", casaPerfumera: "", marca: "", genero: "", tipo: "", concentracion: "",
    presentacionMl: "", imagenUrl: "", sku: "", codigoBarras: "", notas: "", notasSalida: "", notasCorazon: "", notasFondo: "", descripcion: "",
    inspiracion: "", temporada: "", precioCompra: "", precioVenta: "", costoPromedio: "",
    proveedor: "", fechaCompra: "", cantidadDisponible: 0, cantidadMinima: 1, activo: true,
    ubicacionFisica: "", observaciones: "", destacado: false, calificacion: 0,
    decant: { habilitado: false, mlTotalAbierto: 0, mlDisponible: 0, precioPorMl: "", tamanos: [], preciosPorTamano: {} },
    tieneFrascoCompleto: false,
  };
}

export function defaultClienteForm() {
  return {
    nombre: "", telefono: "", correo: "", instagram: "", facebook: "",
    direccion: "", ciudad: "", estado: "", fechaCumpleanos: "", notas: "",
  };
}

export function defaultAccesorioForm() {
  return {
    nombre: "", categoria: "", precio: "", cantidadDisponible: 0, cantidadMinima: 1,
    imagenUrl: "", descripcion: "", activo: true,
  };
}
