from enum import Enum
from functools import wraps


class Rol(Enum):
    INGENIERO = "ingeniero"
    OPERARIO = "operario"


PERMISOS = {
    Rol.INGENIERO: [
        "crear_tarea",
        "modificar_prioridad",
        "cambiar_algoritmo",
        "ver_metricas",
        "ver_tareas",
        "reportar_evento",
        "gestionar_usuarios",
    ],
    Rol.OPERARIO: [
        "ver_tareas",
        "reportar_evento",
    ],
}


def tiene_permiso(rol: Rol, accion: str) -> bool:
    return accion in PERMISOS.get(rol, [])


def requiere_permiso(accion: str):
    def decorador(func):
        @wraps(func)
        def wrapper(*args, rol: Rol, **kwargs):
            if not tiene_permiso(rol, accion):
                raise PermissionError(f"El rol '{rol.value}' no puede realizar '{accion}'")
            return func(*args, rol=rol, **kwargs)
        return wrapper
    return decorador