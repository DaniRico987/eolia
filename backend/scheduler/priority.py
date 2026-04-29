from typing import List
from models.tarea import Tarea


def priority(tareas: List[Tarea]) -> List[Tarea]:
    pendientes = list(tareas)
    tiempo_actual = 0.0
    resultado = []

    while pendientes:
        disponibles = [t for t in pendientes if t.llegada <= tiempo_actual]
        if not disponibles:
            tiempo_actual = min(t.llegada for t in pendientes)
            continue
        tarea = max(disponibles, key=lambda t: t.prioridad)
        pendientes.remove(tarea)
        tarea.iniciar(tiempo_actual)
        tiempo_actual += tarea.duracion
        tarea.completar(tiempo_actual)
        resultado.append(tarea)

    return resultado