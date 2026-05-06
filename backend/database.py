import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "eolia.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def inicializar_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT NOT NULL DEFAULT 'operario'
        );

        CREATE TABLE IF NOT EXISTS tareas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL,
            duracion REAL NOT NULL,
            prioridad INTEGER NOT NULL,
            llegada REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            inicio REAL,
            fin REAL,
            tiempo_espera REAL DEFAULT 0,
            tiempo_retorno REAL DEFAULT 0,
            creado_por INTEGER,
            FOREIGN KEY (creado_por) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS simulaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            algoritmo TEXT NOT NULL,
            fecha TEXT NOT NULL,
            metricas TEXT,
            tareas_ids TEXT
        );

        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            tarea_id INTEGER,
            fecha TEXT NOT NULL
        );
    """)

    # Usuario por defecto
    cursor.execute("""
        INSERT OR IGNORE INTO usuarios (nombre, email, password, rol)
        VALUES ('Ingeniero Jefe', 'ingeniero@eolia.com', 'eolia1234', 'ingeniero')
    """)
    cursor.execute("""
        INSERT OR IGNORE INTO usuarios (nombre, email, password, rol)
        VALUES ('Operario Campo', 'operario@eolia.com', 'eolia1234', 'operario')
    """)

    conn.commit()
    conn.close()