from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

from database import inicializar_db, get_connection
from models.tarea import Tarea, TipoTarea, EstadoTarea
from scheduler.fcfs import fcfs
from scheduler.sjf import sjf
from scheduler.priority import priority
from scheduler.round_robin import round_robin
from metricas.calculos import calcular_metricas
from roles.permisos import Rol, tiene_permiso

app = FastAPI(title="Eolia API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

inicializar_db()


# ── Schemas ──────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TareaRequest(BaseModel):
    nombre: str
    tipo: str
    duracion: float
    prioridad: int
    llegada: float

class SimulacionRequest(BaseModel):
    algoritmo: str  # fcfs | sjf | priority | round_robin
    quantum: Optional[float] = 2.0


# ── Auth ─────────────────────────────────────────────

@app.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM usuarios WHERE email = ? AND password = ?",
        (data.email, data.password)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"id": user["id"], "nombre": user["nombre"], "rol": user["rol"]}


# ── Tareas ───────────────────────────────────────────

@app.get("/tareas")
def listar_tareas():
    conn = get_connection()
    tareas = conn.execute("SELECT * FROM tareas").fetchall()
    conn.close()
    return [dict(t) for t in tareas]

@app.post("/tareas")
def crear_tarea(data: TareaRequest, rol: str = "ingeniero"):
    if not tiene_permiso(Rol(rol), "crear_tarea"):
        raise HTTPException(status_code=403, detail="Sin permisos para crear tareas")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO tareas (nombre, tipo, duracion, prioridad, llegada)
        VALUES (?, ?, ?, ?, ?)
    """, (data.nombre, data.tipo, data.duracion, data.prioridad, data.llegada))
    conn.commit()
    tarea_id = cursor.lastrowid
    conn.close()
    return {"id": tarea_id, "mensaje": "Tarea creada correctamente"}

@app.delete("/tareas/{tarea_id}")
def eliminar_tarea(tarea_id: int, rol: str = "ingeniero"):
    if not tiene_permiso(Rol(rol), "crear_tarea"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    conn = get_connection()
    conn.execute("DELETE FROM tareas WHERE id = ?", (tarea_id,))
    conn.commit()
    conn.close()
    return {"mensaje": "Tarea eliminada"}


# ── Simulación ───────────────────────────────────────

@app.post("/simular")
def simular(data: SimulacionRequest, rol: str = "ingeniero"):
    if not tiene_permiso(Rol(rol), "ver_metricas"):
        raise HTTPException(status_code=403, detail="Sin permisos")

    conn = get_connection()
    rows = conn.execute("SELECT * FROM tareas WHERE estado = 'pendiente'").fetchall()
    conn.close()

    if not rows:
        raise HTTPException(status_code=400, detail="No hay tareas pendientes")

    tareas = [
        Tarea(
            id=r["id"], nombre=r["nombre"],
            tipo=TipoTarea(r["tipo"]), duracion=r["duracion"],
            prioridad=r["prioridad"], llegada=r["llegada"]
        ) for r in rows
    ]

    algoritmos = {
        "fcfs": lambda t: fcfs(t),
        "sjf": lambda t: sjf(t),
        "priority": lambda t: priority(t),
        "round_robin": lambda t: round_robin(t, data.quantum),
    }

    if data.algoritmo not in algoritmos:
        raise HTTPException(status_code=400, detail="Algoritmo no válido")

    resultado = algoritmos[data.algoritmo](tareas)
    metricas = calcular_metricas(resultado)

    # Guardar simulación
    conn = get_connection()
    conn.execute("""
        INSERT INTO simulaciones (algoritmo, fecha, metricas, tareas_ids)
        VALUES (?, ?, ?, ?)
    """, (
        data.algoritmo,
        datetime.now().isoformat(),
        json.dumps(metricas),
        json.dumps([t.id for t in resultado])
    ))
    # Actualizar estado de tareas
    for t in resultado:
        conn.execute("""
            UPDATE tareas SET estado=?, inicio=?, fin=?, tiempo_espera=?, tiempo_retorno=?
            WHERE id=?
        """, (t.estado.value, t.inicio, t.fin, t.tiempo_espera, t.tiempo_retorno, t.id))
    conn.commit()
    conn.close()

    return {
        "algoritmo": data.algoritmo,
        "metricas": metricas,
        "tareas": [t.to_dict() for t in resultado],
    }

@app.get("/simulaciones")
def historial_simulaciones():
    conn = get_connection()
    sims = conn.execute("SELECT * FROM simulaciones ORDER BY fecha DESC").fetchall()
    conn.close()
    return [dict(s) for s in sims]

@app.get("/recursos")
def estado_recursos():
    from concurrencia.recursos import gestor
    return gestor.estado()