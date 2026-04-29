from typing import List
from models.tarea import Tarea


def calcular_metricas(tareas: List[Tarea]) -> dict:
    completadas = [t for t in tareas if t.fin is not None]
    if not completadas:
        return {}

    esperas = [t.tiempo_espera for t in completadas]
    retornos = [t.tiempo_retorno for t in completadas]
    duracion_total = max(t.fin for t in completadas) - min(t.llegada for t in completadas)
    tiempo_activo = sum(t.duracion for t in completadas)

    return {
        "promedio_espera": round(sum(esperas) / len(esperas), 2),
        "promedio_retorno": round(sum(retornos) / len(retornos), 2),
        "throughput": round(len(completadas) / duracion_total, 3),
        "utilizacion": round((tiempo_activo / duracion_total) * 100, 1),
        "total_tareas": len(completadas),
    }