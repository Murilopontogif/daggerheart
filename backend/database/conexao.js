import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

async function testarconexao(){
    const conexao = await pool.getConnection();
    try {
        await conexao.query("SELECT 1");
        console.log("banco de dados conectado");
    } catch (erro) {
        console.error("Não foi possível se conectar");
        console.error(`Detalhes do erro: ${erro.message}`);
        process.exit(1);
    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

export { pool, testarconexao };
