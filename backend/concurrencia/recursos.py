import threading
from models.tarea import RecursoTipo


class GestorRecursos:
    def __init__(self):
        self._semaforos = {
            RecursoTipo.BOMBA_AGUA: threading.Semaphore(1),
            RecursoTipo.TRACTOR: threading.Semaphore(1),
            RecursoTipo.EQUIPO_FUMIGADOR: threading.Semaphore(1),
            RecursoTipo.NINGUNO: threading.Semaphore(99),
        }
        self._estado = {r: "libre" for r in RecursoTipo}
        self._lock = threading.Lock()

    def adquirir(self, recurso: RecursoTipo, nombre_tarea: str) -> bool:
        adquirido = self._semaforos[recurso].acquire(timeout=5)
        if adquirido:
            with self._lock:
                self._estado[recurso] = nombre_tarea
        return adquirido

    def liberar(self, recurso: RecursoTipo):
        with self._lock:
            self._estado[recurso] = "libre"
        self._semaforos[recurso].release()

    def estado(self) -> dict:
        with self._lock:
            return {r.value: v for r, v in self._estado.items()}


# Instancia global compartida
gestor = GestorRecursos()