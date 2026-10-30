import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let activeDriver = "sqlite";
let sqliteDb = null;
let mysqlPool = null;

function sincronizarTabelasExtras(dbOuPool, isSqlite = true) {
    try {
        const createUsuariosSql = `
            CREATE TABLE IF NOT EXISTS USUARIOS (
                ID ${isSqlite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "INT PRIMARY KEY AUTO_INCREMENT"},
                LOGIN VARCHAR(50) UNIQUE NOT NULL,
                SENHA VARCHAR(255) NOT NULL,
                PAPEL VARCHAR(20) NOT NULL DEFAULT 'player',
                LGPD_ACEITE BOOLEAN DEFAULT 1,
                DATA_CRIACAO ${isSqlite ? "DATETIME DEFAULT CURRENT_TIMESTAMP" : "DATETIME DEFAULT CURRENT_TIMESTAMP"}
            );
        `;

        const createCombateHeroisSql = `
            CREATE TABLE IF NOT EXISTS COMBATE_HEROIS (
                ID ${isSqlite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "INT PRIMARY KEY AUTO_INCREMENT"},
                PERSONAGEM_ID INT NOT NULL,
                PV_ATUAL INT NOT NULL DEFAULT 6,
                PF_ATUAL INT NOT NULL DEFAULT 0,
                ARMADURA_MARCADA INT NOT NULL DEFAULT 0
            );
        `;

        const createCombateCriaturasSql = `
            CREATE TABLE IF NOT EXISTS COMBATE_CRIATURAS (
                ID ${isSqlite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "INT PRIMARY KEY AUTO_INCREMENT"},
                INIMIGO_ID INT NOT NULL,
                NOME_INSTANCIA VARCHAR(150) NOT NULL,
                PV_ATUAL INT NOT NULL DEFAULT 1,
                PF_ATUAL INT NOT NULL DEFAULT 0,
                ARMADURA_MARCADA INT NOT NULL DEFAULT 0,
                ARMADURA_MAXIMA INT NOT NULL DEFAULT 0,
                NOTAS TEXT
            );
        `;

        const createCombateEstadoSql = `
            CREATE TABLE IF NOT EXISTS COMBATE_ESTADO (
                ID INT PRIMARY KEY,
                FEAR_POINTS INT NOT NULL DEFAULT 0
            );
        `;

        if (isSqlite) {
            dbOuPool.exec(createUsuariosSql);
            dbOuPool.exec(createCombateHeroisSql);
            dbOuPool.exec(createCombateCriaturasSql);
            dbOuPool.exec(createCombateEstadoSql);

            // Seed estado combate (Medo = 0)
            const estado = dbOuPool.prepare("SELECT * FROM COMBATE_ESTADO WHERE ID = 1").get();
            if (!estado) {
                dbOuPool.prepare("INSERT INTO COMBATE_ESTADO (ID, FEAR_POINTS) VALUES (1, 0)").run();
            }

            // Ensure ARMADURA_MAXIMA & NOTAS exist in COMBATE_CRIATURAS
            try { dbOuPool.exec("ALTER TABLE COMBATE_CRIATURAS ADD COLUMN ARMADURA_MAXIMA INTEGER DEFAULT 0;"); } catch {}
            try { dbOuPool.exec("ALTER TABLE COMBATE_CRIATURAS ADD COLUMN NOTAS TEXT;"); } catch {}

            // Seed mumu
            const mumu = dbOuPool.prepare("SELECT * FROM USUARIOS WHERE LOGIN = 'mumu'").get();
            if (!mumu) {
                dbOuPool.prepare("INSERT INTO USUARIOS (LOGIN, SENHA, PAPEL, LGPD_ACEITE) VALUES (?, ?, ?, ?)").run("mumu", "irado", "mestre", 1);
            }

            // Ensure USUARIO_ID exists in PERSONAGENS
            try {
                dbOuPool.exec("ALTER TABLE PERSONAGENS ADD COLUMN USUARIO_ID INTEGER DEFAULT 1;");
            try { dbOuPool.exec("ALTER TABLE PERSONAGENS ADD COLUMN PV_ATUAL INTEGER DEFAULT 6;"); } catch {}
            try { dbOuPool.exec("ALTER TABLE PERSONAGENS ADD COLUMN PF_ATUAL INTEGER DEFAULT 0;"); } catch {}
            try { dbOuPool.exec("ALTER TABLE PERSONAGENS ADD COLUMN ARMADURA_ATUAL INTEGER DEFAULT 0;"); } catch {}
            } catch {
                // Coluna já existe
            }
        }
    } catch (err) {
        console.warn("Aviso na sincronização de tabelas extras:", err.message);
    }
}

function iniciarSqlite() {
    if (sqliteDb) return;
    const dbPath = path.join(__dirname, "daggerheart.sqlite");
    const sqlPath = path.join(__dirname, "../../sql/daggerheart.sql");

    sqliteDb = new DatabaseSync(dbPath);

    let precisaInicializar = false;
    try {
        const check = sqliteDb.prepare("SELECT COUNT(*) as count FROM REGRAS_SISTEMA").get();
        if (!check || check.count === 0) {
            precisaInicializar = true;
        }
    } catch {
        precisaInicializar = true;
    }

    if (precisaInicializar && fs.existsSync(sqlPath)) {
        console.log("Carregando tabelas e dados oficiais a partir de sql/daggerheart.sql...");
        let sql = fs.readFileSync(sqlPath, "utf8");
        sql = sql
            .replace(/CREATE DATABASE[^;]+;/gi, "")
            .replace(/USE DAGGERHEART;/gi, "")
            .replace(/INT PRIMARY KEY AUTO_INCREMENT/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
            .replace(/AUTO_INCREMENT/gi, "AUTOINCREMENT");
        sqliteDb.exec(sql);
        console.log("Banco SQLite inicializado com sucesso!");
    }

    sincronizarTabelasExtras(sqliteDb, true);
}

async function testarconexao() {
    // 1. Tentar conectar ao MySQL se o host estiver configurado
    if (process.env.DB_HOST && process.env.DB_USER) {
        try {
            mysqlPool = mysql.createPool({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT) || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                connectTimeout: 2000
            });
            const conexao = await mysqlPool.getConnection();
            await conexao.query("SELECT 1");
            conexao.release();
            activeDriver = "mysql";
            console.log("Banco de dados conectado com sucesso via MySQL.");
            return;
        } catch (erro) {
            console.warn(`[Aviso] MySQL não está acessível no momento (${erro.message}).`);
            console.log("Alternando automaticamente para SQLite local (daggerheart.sqlite)...");
        }
    }

    // 2. Fallback automático para SQLite local
    activeDriver = "sqlite";
    iniciarSqlite();
    console.log("Banco de dados conectado com sucesso via SQLite local.");
}

const pool = {
    async query(queryString, params) {
        if (activeDriver === "mysql" && mysqlPool) {
            return await mysqlPool.query(queryString, params);
        }

        if (!sqliteDb) {
            iniciarSqlite();
        }

        const trimmed = queryString.trim().toUpperCase();
        const args = Array.isArray(params) ? params : (params !== undefined ? [params] : []);

        if (trimmed.startsWith("SELECT")) {
            const stmt = sqliteDb.prepare(queryString);
            const rows = args.length > 0 ? stmt.all(...args) : stmt.all();
            return [rows];
        } else {
            const stmt = sqliteDb.prepare(queryString);
            const info = args.length > 0 ? stmt.run(...args) : stmt.run();
            return [{
                insertId: Number(info.lastInsertRowid),
                affectedRows: info.changes
            }];
        }
    },
    async getConnection() {
        if (activeDriver === "mysql" && mysqlPool) {
            return await mysqlPool.getConnection();
        }
        return {
            query: (sql, params) => pool.query(sql, params),
            release: () => {}
        };
    }
};

export { pool, testarconexao };
