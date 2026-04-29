import threading
import time
from typing import List, Callable, Optional
from models.tarea import Tarea, EstadoTarea, RecursoTipo
from concurrencia.recursos import gestor
from concurrencia.interrupciones import generar_interrupcion, manejar_interrupcion


class SimuladorConcurrente:
    def __init__(self, velocidad: float = 0.5):
        self.velocidad = velocidad  # segundos reales por hora simulada
        self.log = []
        self._lock_log = threading.Lock()
        self.interrupciones = []

    def _registrar(self, mensaje: str):
        with self._lock_log:
            self.log.append(mensaje)

    def _ejecutar_tarea(self, tarea: Tarea, tiempo_inicio: float, callback: Optional[Callable] = None):
        recurso = tarea.recurso

        adquirido = gestor.adquirir(recurso, tarea.nombre)
        if not adquirido:
            tarea.estado = EstadoTarea.ESPERANDO
            self._registrar(f"[BLOQUEADA] {tarea.nombre} — recurso {recurso.value} ocupado")
            return

        tarea.iniciar(tiempo_inicio)
        self._registrar(f"[INICIO] {tarea.nombre} — recurso: {recurso.value}")

        tiempo_simulado = tarea.duracion * self.velocidad
        time.sleep(tiempo_simulado)

        interrupcion = generar_interrupcion(tarea)
        if interrupcion:
            manejar_interrupcion(interrupcion, tarea, callback)
            self.interrupciones.append(interrupcion)
            self._registrar(f"[INTERRUPCIÓN] {tarea.nombre} — {interrupcion['descripcion']}")
        else:
            tarea.completar(tiempo_inicio + tarea.duracion)
            self._registrar(f"[FIN] {tarea.nombre} — completada")

        gestor.liberar(recurso)

    def ejecutar(self, tareas: List[Tarea], callback: Optional[Callable] = None):
        hilos = []
        for tarea in tareas:
            hilo = threading.Thread(
                target=self._ejecutar_tarea,
                args=(tarea, tarea.llegada, callback)
            )
            hilos.append(hilo)

        for h in hilos:
            h.start()

        for h in hilos:
            h.join()

        return self.log