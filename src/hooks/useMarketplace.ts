// src/hooks/useMarketplace.ts
// VMG-47 · Hook de filtros para el marketplace
//
// Encapsula toda la lógica de filtrado, paginación y estado.
// Usado por HomeScreen — el compañero de VMG-31 también puede usarlo.
//
// USO:
//   const { publicaciones, filtros, setFiltro, limpiarFiltros, cargando, error } = useMarketplace();

import { useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '../services/api/marketplaceService';
import type {
  FiltrosPublicacion,
  PublicacionResumen,
  Paginacion,
  OrdenPublicacion,
} from '../services/api/marketplaceService';
import { ANIMALS_MOCK } from '../constants';

// Convierte ANIMALS_MOCK al formato de PublicacionResumen para desarrollo offline
function mockToPublicacion(a: typeof ANIMALS_MOCK[0]): PublicacionResumen {
  return {
    id_publicacion:        parseInt(a.id),
    titulo:                a.name,
    raza:                  a.breed,
    precio:                a.price,
    edad_meses:            a.age,
    historial_reproductivo: a.reproductiveHistory,
    proyeccion_genetica:   a.geneticProjection,
    estado:                'activa',
    fecha_publicacion:     new Date().toISOString(),
    vendedor_id:           1,
    vendedor_nombre:       a.seller,
    vendedor_kyc:          'aprobado',
  };
}

const FILTROS_INICIALES: FiltrosPublicacion = {
  search:    '',
  orden:     'reciente',
  page:      1,
  limit:     20,
};

export function useMarketplace() {
  const [publicaciones, setPublicaciones] = useState<PublicacionResumen[]>([]);
  const [paginacion, setPaginacion]       = useState<Paginacion | null>(null);
  const [filtros, setFiltrosState]        = useState<FiltrosPublicacion>(FILTROS_INICIALES);
  const [cargando, setCargando]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [usandoMock, setUsandoMock]       = useState(false);

  const cargar = useCallback(async (filtrosActuales: FiltrosPublicacion) => {
    setCargando(true);
    setError(null);

    try {
      const res = await marketplaceService.getPublicaciones(filtrosActuales);
      setPublicaciones(res.data.publicaciones);
      setPaginacion(res.data.paginacion);
      setUsandoMock(false);
    } catch (err: any) {
      // Fallback a mock si el backend no está disponible (desarrollo)
      if (err?.code === 'TIMEOUT' || err?.message?.includes('Network')) {
        const mockFiltrado = aplicarFiltrosMock(ANIMALS_MOCK.map(mockToPublicacion), filtrosActuales);
        setPublicaciones(mockFiltrado);
        setUsandoMock(true);
        setError(null);
      } else {
        setError(err?.message || 'Error al cargar publicaciones');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  // Recargar cuando cambian los filtros
  useEffect(() => {
    cargar(filtros);
  }, [filtros, cargar]);

  // Actualizar un filtro puntual y resetear a página 1
  const setFiltro = useCallback((campo: keyof FiltrosPublicacion, valor: any) => {
    setFiltrosState(prev => ({
      ...prev,
      [campo]: valor,
      page: campo !== 'page' ? 1 : valor,
    }));
  }, []);

  // Limpiar todos los filtros
  const limpiarFiltros = useCallback(() => {
    setFiltrosState(FILTROS_INICIALES);
  }, []);

  // Página siguiente
  const siguientePagina = useCallback(() => {
    if (paginacion?.hay_mas) {
      setFiltro('page', (filtros.page || 1) + 1);
    }
  }, [paginacion, filtros.page, setFiltro]);

  return {
    publicaciones,
    paginacion,
    filtros,
    setFiltro,
    limpiarFiltros,
    siguientePagina,
    cargando,
    error,
    usandoMock,
    recargar: () => cargar(filtros),
  };
}

// ── Filtrado local sobre mock (para desarrollo sin backend) ───────────────────
function aplicarFiltrosMock(
  items: PublicacionResumen[],
  filtros: FiltrosPublicacion
): PublicacionResumen[] {
  let result = [...items];

  if (filtros.search) {
    const q = filtros.search.toLowerCase();
    result = result.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.raza.toLowerCase().includes(q)
    );
  }
  if (filtros.raza) {
    result = result.filter(p => p.raza === filtros.raza);
  }
  if (filtros.precio_min !== undefined) {
    result = result.filter(p => p.precio >= filtros.precio_min!);
  }
  if (filtros.precio_max !== undefined) {
    result = result.filter(p => p.precio <= filtros.precio_max!);
  }
  if (filtros.edad_min !== undefined) {
    result = result.filter(p => p.edad_meses >= filtros.edad_min!);
  }
  if (filtros.edad_max !== undefined) {
    result = result.filter(p => p.edad_meses <= filtros.edad_max!);
  }

  // Ordenar
  switch (filtros.orden) {
    case 'precio_asc':  result.sort((a, b) => a.precio - b.precio);      break;
    case 'precio_desc': result.sort((a, b) => b.precio - a.precio);      break;
    case 'edad_asc':    result.sort((a, b) => a.edad_meses - b.edad_meses); break;
    default: break;
  }

  return result;
}
