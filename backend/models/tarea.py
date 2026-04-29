from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class EstadoTarea(Enum):
    PENDIENTE = "pendiente"
    EJECUTANDO = "ejecutando"
    ESPERANDO = "esperando"
    COMPLETADA = "completada"
    INTERRUMPIDA = "interrumpida"


class RecursoTipo(Enum):
    BOMBA_AGUA = "bomba_agua"
    TRACTOR = "tractor"
    EQUIPO_FUMIGADOR = "equipo_fumigador"
    NINGUNO = "ninguno"


class TipoTarea(Enum):
    RIEGO = "riego"
    FUMIGACION = "fumigacion"
    COSECHA = "cosecha"
    FERTILIZACION = "fertilizacion"
    MONITOREO = "monitoreo"


# Mapa fijo: qué recurso necesita cada tipo de tarea
RECURSO_POR_TAREA = {
    TipoTarea.RIEGO: RecursoTipo.BOMBA_AGUA,
    TipoTarea.FUMIGACION: RecursoTipo.BOMBA_AGUA,
    TipoTarea.COSECHA: RecursoTipo.TRACTOR,
    TipoTarea.FERTILIZACION: RecursoTipo.TRACTOR,
    TipoTarea.MONITOREO: RecursoTipo.NINGUNO,
}


@dataclass
class Tarea:
    id: int
    nombre: str
    tipo: TipoTarea
    duracion: float          # horas
    prioridad: int           # 1 = baja, 5 = máxima (plaga)
    llegada: float           # hora del día en que llega (ej: 6.0 = 6am)

    # Campos que se llenan durante la simulación
    estado: EstadoTarea = EstadoTarea.PENDIENTE
    inicio: Optional[float] = None
    fin: Optional[float] = None
    tiempo_espera: float = 0.0
    tiempo_retorno: float = 0.0

    @property
    def recurso(self) -> RecursoTipo:
        return RECURSO_POR_TAREA[self.tipo]

    def iniciar(self, tiempo_actual: float):
        self.estado = EstadoTarea.EJECUTANDO
        self.inicio = tiempo_actual
        self.tiempo_espera = tiempo_actual - self.llegada

    def completar(self, tiempo_actual: float):
        self.estado = EstadoTarea.COMPLETADA
        self.fin = tiempo_actual
        self.tiempo_retorno = tiempo_actual - self.llegada

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "tipo": self.tipo.value,
            "duracion": self.duracion,
            "prioridad": self.prioridad,
            "llegada": self.llegada,
            "estado": self.estado.value,
            "recurso": self.recurso.value,
            "inicio": self.inicio,
            "fin": self.fin,
            "tiempo_espera": self.tiempo_espera,
            "tiempo_retorno": self.tiempo_retorno,
        }