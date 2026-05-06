from typing import List
from models.tarea import Tarea


def fcfs(tareas: List[Tarea]) -> List[Tarea]:
    """
    First Come First Served (FCFS)
    Las tareas se ejecutan en el orden en que llegaron a la finca.
    No hay preempción — una tarea no se interrumpe hasta terminar.
    """

    # Ordenar por hora de llegada
    cola = sorted(tareas, key=lambda t: t.llegada)

    tiempo_actual = 0.0
    resultado = []

    for tarea in cola:
        # Si el equipo está libre antes de que llegue la tarea, espera
        if tiempo_actual < tarea.llegada:
            tiempo_actual = tarea.llegada

        # La tarea inicia
        tarea.iniciar(tiempo_actual)

        # Avanzar el tiempo según la duración de la tarea
        tiempo_actual += tarea.duracion

        # La tarea termina
        tarea.completar(tiempo_actual)

        resultado.append(tarea)

    return resultado