// src/utils/genetica.ts
// VMG-52 · Validar y parsear información genética de animales
//
// DEP = Diferencia Esperada de la Progenie (sistema americano)
// EBV = Estimated Breeding Value (sistema australiano/europeo)
//
// FORMATO ACEPTADO en proyeccion_genetica (BD):
//   "DEP Peso destete: +28 | DEP Terneza: +0.8 | EBV Ganancia: +58"
//   Cada indicador separado por " | "
//   Formato de cada uno: "<sistema> <nombre>: <signo><valor>"

export type SistemaGenetico = 'DEP' | 'EBV';

export interface IndicadorGenetico {
  sistema:    SistemaGenetico;
  nombre:     string;
  valor:      number;
  positivo:   boolean;
  etiqueta:   string;  // texto completo para mostrar ej: "DEP Peso destete"
}

export interface ProyeccionGenetica {
  indicadores: IndicadorGenetico[];
  raw:         string;
  valida:      boolean;
  errores:     string[];
}

// Indicadores conocidos con descripción y unidad para la UI
export const INDICADORES_CONOCIDOS: Record<string, { descripcion: string; unidad: string; icono: string }> = {
  'Peso destete':    { descripcion: 'Peso al destete de la progenie',    unidad: 'kg',  icono: '⚖️'  },
  'Terneza':         { descripcion: 'Terneza de la carne',               unidad: 'pts', icono: '🥩'  },
  'Leche':           { descripcion: 'Producción de leche materna',       unidad: 'kg',  icono: '🍼'  },
  'Fertilidad':      { descripcion: 'Tasa de fertilidad esperada',       unidad: '%',   icono: '🌱'  },
  'Adaptación':      { descripcion: 'Adaptación al clima',               unidad: '',    icono: '🌡️' },
  'Preñez':          { descripcion: 'Probabilidad de preñez',            unidad: '%',   icono: '🔬'  },
  'Ganancia':        { descripcion: 'Ganancia diaria de peso',           unidad: 'kg/d',icono: '📈'  },
  'Área bife':       { descripcion: 'Área del ojo de bife',              unidad: 'cm²', icono: '📐'  },
  'Peso nacimiento': { descripcion: 'Peso al nacimiento',                unidad: 'kg',  icono: '🐣'  },
};

// ── Parser ────────────────────────────────────────────────────────────────────
export function parsearProyeccion(raw: string | null | undefined): ProyeccionGenetica {
  if (!raw || raw.trim() === '') {
    return { indicadores: [], raw: '', valida: false, errores: ['Sin información genética'] };
  }

  const errores: string[] = [];
  const indicadores: IndicadorGenetico[] = [];
  const partes = raw.split('|').map(p => p.trim()).filter(Boolean);

  for (const parte of partes) {
    // Formato esperado: "DEP Peso destete: +28" o "EBV Ganancia: +58"
    const match = parte.match(/^(DEP|EBV)\s+(.+?):\s*([+-]?\d+\.?\d*)$/i);
    if (!match) {
      errores.push(`Formato inválido: "${parte}"`);
      continue;
    }
    const [, sistema, nombre, valorStr] = match;
    const valor = parseFloat(valorStr);
    if (isNaN(valor)) {
      errores.push(`Valor no numérico en: "${parte}"`);
      continue;
    }
    indicadores.push({
      sistema:  sistema.toUpperCase() as SistemaGenetico,
      nombre:   nombre.trim(),
      valor,
      positivo: valor >= 0,
      etiqueta: `${sistema.toUpperCase()} ${nombre.trim()}`,
    });
  }

  return {
    indicadores,
    raw,
    valida: indicadores.length > 0,
    errores,
  };
}

// ── Validador para el formulario de publicación (VMG-55) ─────────────────────
// Devuelve null si es válido, string con el error si no.
// Mismo comportamiento que la versión del backend (validate.js).
// Consumido por usePublicacionForm.ts y validate.js (backend).
export function validarProyeccionGenetica(valor: string): string | null {
  if (!valor || valor.trim() === '') return null; // es opcional
  const partes = valor.split('|').map(p => p.trim()).filter(Boolean);
  for (const parte of partes) {
    const match = parte.match(/^(DEP|EBV)\s+(.+?):\s*([+-]?\d+\.?\d*)$/i);
    if (!match) {
      return `Indicador con formato inválido: "${parte}". Usá: DEP Nombre: +valor`;
    }
  }
  return null;
}

// ── Formatter para guardar en BD ──────────────────────────────────────────────
export function formatearParaBD(indicadores: Omit<IndicadorGenetico, 'positivo' | 'etiqueta'>[]): string {
  return indicadores
    .map(ind => `${ind.sistema} ${ind.nombre}: ${ind.valor >= 0 ? '+' : ''}${ind.valor}`)
    .join(' | ');
}
