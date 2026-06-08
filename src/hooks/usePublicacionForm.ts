// src/hooks/usePublicacionForm.ts
// VMG-55 · Validar datos ingresados en el formulario de publicación
//
// Maneja estado del formulario, validaciones en tiempo real y envío.
// Usado por PublicarScreen.tsx
//
// INTEGRACIÓN:
//   · KYC check: el usuario debe tener estado_kyc = 'aprobado' para publicar
//   · VMG-32 (otro miembro): el endpoint POST /api/publicaciones consume este form
//   · VMG-52 (EF): validarProyeccionGenetica() se importa desde utils/genetica

import { useState, useCallback } from 'react';
import { validarProyeccionGenetica } from '../utils/genetica';

export interface FormPublicacion {
  titulo:                 string;
  raza:                   string;
  precio:                 string;
  edad_meses:             string;
  historial_reproductivo: string;
  proyeccion_genetica:    string;
}

export interface ErroresFormPublicacion {
  titulo?:                 string;
  raza?:                   string;
  precio?:                 string;
  edad_meses?:             string;
  historial_reproductivo?: string;
  proyeccion_genetica?:    string;
}

const FORM_INICIAL: FormPublicacion = {
  titulo:                 '',
  raza:                   '',
  precio:                 '',
  edad_meses:             '',
  historial_reproductivo: '',
  proyeccion_genetica:    '',
};

// Razas disponibles para el selector
export const RAZAS_DISPONIBLES = [
  'Aberdeen Angus', 'Hereford', 'Limousin', 'Braford',
  'Brangus', 'Shorthorn', 'Charolais', 'Simmental',
  'Brahman', 'Santa Gertrudis', 'Otra',
];

// ── Funciones de validación por campo ────────────────────────────────────────
function validarCampo(campo: keyof FormPublicacion, valor: string): string | undefined {
  switch (campo) {
    case 'titulo': {
      if (!valor.trim()) return 'El título es requerido';
      if (valor.trim().length < 3) return 'Mínimo 3 caracteres';
      if (valor.trim().length > 200) return 'Máximo 200 caracteres';
      return undefined;
    }
    case 'raza': {
      if (!valor.trim()) return 'La raza es requerida';
      if (valor.trim().length > 100) return 'Máximo 100 caracteres';
      return undefined;
    }
    case 'precio': {
      if (!valor.trim()) return 'El precio es requerido';
      const n = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
      if (isNaN(n) || n <= 0) return 'Ingresá un precio válido mayor a 0';
      if (n > 999999999) return 'El precio está fuera de rango';
      return undefined;
    }
    case 'edad_meses': {
      if (!valor.trim()) return 'La edad es requerida';
      const n = parseInt(valor);
      if (isNaN(n) || n < 1) return 'La edad debe ser mayor a 0 meses';
      if (n > 300) return 'La edad no puede superar 300 meses';
      return undefined;
    }
    case 'historial_reproductivo': {
      if (valor.length > 1000) return 'Máximo 1000 caracteres';
      return undefined;
    }
    case 'proyeccion_genetica': {
      if (!valor.trim()) return undefined; // opcional
      const error = validarProyeccionGenetica(valor);
      return error || undefined;
    }
    default:
      return undefined;
  }
}

// ── Validación completa del formulario ────────────────────────────────────────
function validarTodo(form: FormPublicacion): ErroresFormPublicacion {
  const errores: ErroresFormPublicacion = {};
  (Object.keys(form) as (keyof FormPublicacion)[]).forEach(campo => {
    const error = validarCampo(campo, form[campo]);
    if (error) errores[campo] = error;
  });
  return errores;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePublicacionForm(onSubmit: (payload: FormPublicacion) => Promise<void>) {
  const [form, setForm]           = useState<FormPublicacion>(FORM_INICIAL);
  const [errores, setErrores]     = useState<ErroresFormPublicacion>({});
  const [tocados, setTocados]     = useState<Set<keyof FormPublicacion>>(new Set());
  const [enviando, setEnviando]   = useState(false);
  const [exito, setExito]         = useState(false);
  const [errorApi, setErrorApi]   = useState<string | null>(null);

  // Actualizar campo y validar en tiempo real si ya fue tocado
  const setCampo = useCallback((campo: keyof FormPublicacion, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setTocados(prev => new Set(prev).add(campo));
    const error = validarCampo(campo, valor);
    setErrores(prev => ({ ...prev, [campo]: error }));
  }, []);

  // Marcar campo como tocado al salir (onBlur)
  const marcarTocado = useCallback((campo: keyof FormPublicacion) => {
    setTocados(prev => new Set(prev).add(campo));
    const error = validarCampo(campo, form[campo]);
    setErrores(prev => ({ ...prev, [campo]: error }));
  }, [form]);

  // Enviar formulario
  const enviar = useCallback(async () => {
    // Validar todo y marcar todos como tocados
    const todosLosCampos = Object.keys(FORM_INICIAL) as (keyof FormPublicacion)[];
    setTocados(new Set(todosLosCampos));
    const nuevosErrores = validarTodo(form);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    setErrorApi(null);
    try {
      await onSubmit(form);
      setExito(true);
      setForm(FORM_INICIAL);
      setTocados(new Set());
      setErrores({});
    } catch (err: any) {
      setErrorApi(err?.message || 'Error al publicar. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }, [form, onSubmit]);

  const resetear = useCallback(() => {
    setForm(FORM_INICIAL);
    setErrores({});
    setTocados(new Set());
    setExito(false);
    setErrorApi(null);
  }, []);

  // Solo mostrar error si el campo fue tocado
  const errorVisible = useCallback((campo: keyof FormPublicacion): string | undefined => {
    return tocados.has(campo) ? errores[campo] : undefined;
  }, [errores, tocados]);

  const formularioValido = Object.keys(validarTodo(form)).length === 0;

  return {
    form, setCampo, marcarTocado,
    errores, errorVisible,
    enviando, exito, errorApi,
    formularioValido,
    enviar, resetear,
  };
}
