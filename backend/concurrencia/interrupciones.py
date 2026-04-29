import random
from models.tarea import Tarea, EstadoTarea
from typing import Callable, Optional


EVENTOS = [
    {"tipo": "fallo_bomba",   "descripcion": "Fallo en bomba de agua",       "probabilidad": 0.1},
    {"tipo": "plaga",         "descripcion": "Plaga detectada — urgente",     "probabilidad": 0.05},
    {"tipo": "lluvia",        "descripcion": "Lluvia fuerte — suspender riego","probabilidad": 0.08},
    {"tipo": "fallo_tractor", "descripcion": "Fallo mecánico en tractor",     "probabilidad": 0.07},
]


def generar_interrupcion(tarea: Tarea) -> Optional[dict]:
    for evento in EVENTOS:
        if random.random() < evento["probabilidad"]:
            return {
                "tarea_afectada": tarea.id,
                "tipo": evento["tipo"],
                "descripcion": evento["descripcion"],
            }
    return None


def manejar_interrupcion(
    interrupcion: dict,
    tarea: Tarea,
    callback: Callable = None
):
    tarea.estado = EstadoTarea.INTERRUMPIDA
    if callback:
        callback(interrupcion)
    return interrupcion