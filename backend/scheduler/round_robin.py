from typing import List
from models.tarea import Tarea, EstadoTarea


def round_robin(tareas: List[Tarea], quantum: float = 2.0) -> List[Tarea]:
    pendientes = sorted(tareas, key=lambda t: t.llegada)
    tiempo_actual = pendientes[0].llegada if pendientes else 0.0
    cola = []
    restante = {t.id: t.duracion for t in pendientes}
    inicio_real = {}
    pendientes_idx = 0
    resultado = []

    while True:
        # Agregar tareas que ya llegaron
        while pendientes_idx < len(pendientes) and pendientes[pendientes_idx].llegada <= tiempo_actual:
            cola.append(pendientes[pendientes_idx])
            pendientes_idx += 1

        if not cola:
            if pendientes_idx < len(pendientes):
                tiempo_actual = pendientes[pendientes_idx].llegada
                continue
            break

        tarea = cola.pop(0)

        if tarea.id not in inicio_real:
            inicio_real[tarea.id] = tiempo_actual
            tarea.tiempo_espera = tiempo_actual - tarea.llegada

        tiempo_exec = min(quantum, restante[tarea.id])
        tiempo_actual += tiempo_exec
        restante[tarea.id] -= tiempo_exec

        # Agregar nuevas tareas que llegaron durante este quantum
        while pendientes_idx < len(pendientes) and pendientes[pendientes_idx].llegada <= tiempo_actual:
            cola.append(pendientes[pendientes_idx])
            pendientes_idx += 1

        if restante[tarea.id] > 0:
            cola.append(tarea)
        else:
            tarea.inicio = inicio_real[tarea.id]
            tarea.fin = tiempo_actual
            tarea.tiempo_retorno = tiempo_actual - tarea.llegada
            tarea.estado = EstadoTarea.COMPLETADA
            resultado.append(tarea)

    return resultado