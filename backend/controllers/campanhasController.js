import { pool } from "../database/conexao.js";

export async function listarCampanhas(req, res) {
    try {
        const isMestre = req.user && req.user.papel === "mestre";
        const userId = req.user ? req.user.id : 0;

        let campanhas;
        if (isMestre) {
            const [rows] = await pool.query(`
                SELECT c.*, u.LOGIN as MESTRE_NOME
                FROM CAMPANHAS c
                LEFT JOIN USUARIOS u ON c.MESTRE_ID = u.ID
                ORDER BY c.ID DESC
            `);
            campanhas = rows;
        } else {
            const [rows] = await pool.query(`
                SELECT DISTINCT c.*, u.LOGIN as MESTRE_NOME
                FROM CAMPANHAS c
                LEFT JOIN USUARIOS u ON c.MESTRE_ID = u.ID
                JOIN CAMPANHA_PERSONAGENS cp ON c.ID = cp.CAMPANHA_ID
                JOIN PERSONAGENS p ON cp.PERSONAGEM_ID = p.ID
                WHERE p.USUARIO_ID = ?
                ORDER BY c.ID DESC
            `, [userId]);
            campanhas = rows;
        }

        // Enriquecer com contagens de personagens e combates
        for (const c of campanhas) {
            const [pCount] = await pool.query("SELECT COUNT(*) as total FROM CAMPANHA_PERSONAGENS WHERE CAMPANHA_ID = ?", [c.ID]);
            const [cCount] = await pool.query("SELECT COUNT(*) as total FROM COMBATES WHERE CAMPANHA_ID = ?", [c.ID]);
            c.TOTAL_PERSONAGENS = pCount[0]?.total || 0;
            c.TOTAL_COMBATES = cCount[0]?.total || 0;
        }

        res.status(200).json(campanhas);
    } catch (erro) {
        console.error("Erro ao listar campanhas:", erro);
        res.status(500).json({ mensagem: "Erro ao listar campanhas." });
    }
}

export async function criarCampanha(req, res) {
    try {
        const { nome, descricao = "" } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ mensagem: "O nome da campanha é obrigatório." });
        }

        const [resIns] = await pool.query(
            "INSERT INTO CAMPANHAS (NOME, DESCRICAO, MESTRE_ID) VALUES (?, ?, ?)",
            [nome.trim(), descricao.trim(), req.user.id]
        );

        res.status(201).json({
            mensagem: "Campanha criada com sucesso!",
            id: resIns.insertId
        });
    } catch (erro) {
        console.error("Erro ao criar campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao criar campanha." });
    }
}

export async function atualizarCampanha(req, res) {
    try {
        const id = Number(req.params.id);
        const { nome, descricao = "" } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ mensagem: "O nome da campanha é obrigatório." });
        }

        await pool.query(
            "UPDATE CAMPANHAS SET NOME = ?, DESCRICAO = ? WHERE ID = ?",
            [nome.trim(), descricao.trim(), id]
        );

        res.status(200).json({ mensagem: "Campanha atualizada com sucesso!" });
    } catch (erro) {
        console.error("Erro ao atualizar campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao atualizar campanha." });
    }
}

export async function deletarCampanha(req, res) {
    try {
        const id = Number(req.params.id);
        const [combates] = await pool.query("SELECT ID FROM COMBATES WHERE CAMPANHA_ID = ?", [id]);
        for (const cb of combates) {
            await pool.query("DELETE FROM COMBATE_HEROIS WHERE COMBATE_ID = ?", [cb.ID]);
            await pool.query("DELETE FROM COMBATE_CRIATURAS WHERE COMBATE_ID = ?", [cb.ID]);
        }
        await pool.query("DELETE FROM COMBATES WHERE CAMPANHA_ID = ?", [id]);
        await pool.query("DELETE FROM CAMPANHA_PERSONAGENS WHERE CAMPANHA_ID = ?", [id]);
        await pool.query("DELETE FROM CAMPANHAS WHERE ID = ?", [id]);

        res.status(200).json({ mensagem: "Campanha e seus combates removidos com sucesso." });
    } catch (erro) {
        console.error("Erro ao deletar campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao deletar campanha." });
    }
}

export async function listarPersonagensCampanha(req, res) {
    try {
        const campanhaId = Number(req.params.id);
        const [rows] = await pool.query(`
            SELECT p.ID, p.NOME, p.CLASSE, p.SUBCLASSE, p.NIVEL, p.IMAGEM, p.USUARIO_ID, u.LOGIN as CRIADOR_NOME
            FROM CAMPANHA_PERSONAGENS cp
            JOIN PERSONAGENS p ON cp.PERSONAGEM_ID = p.ID
            LEFT JOIN USUARIOS u ON p.USUARIO_ID = u.ID
            WHERE cp.CAMPANHA_ID = ?
            ORDER BY p.NOME ASC
        `, [campanhaId]);

        res.status(200).json(rows);
    } catch (erro) {
        console.error("Erro ao listar personagens da campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao listar personagens da campanha." });
    }
}

export async function adicionarPersonagemCampanha(req, res) {
    try {
        const campanhaId = Number(req.params.id);
        const { personagemId } = req.body;
        if (!personagemId) {
            return res.status(400).json({ mensagem: "personagemId é obrigatório." });
        }

        const [existe] = await pool.query(
            "SELECT ID FROM CAMPANHA_PERSONAGENS WHERE CAMPANHA_ID = ? AND PERSONAGEM_ID = ?",
            [campanhaId, Number(personagemId)]
        );
        if (existe && existe.length > 0) {
            return res.status(409).json({ mensagem: "Este personagem já faz parte desta campanha." });
        }

        await pool.query(
            "INSERT INTO CAMPANHA_PERSONAGENS (CAMPANHA_ID, PERSONAGEM_ID) VALUES (?, ?)",
            [campanhaId, Number(personagemId)]
        );

        res.status(201).json({ mensagem: "Personagem adicionado à campanha!" });
    } catch (erro) {
        console.error("Erro ao adicionar personagem à campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao adicionar personagem à campanha." });
    }
}

export async function removerPersonagemCampanha(req, res) {
    try {
        const campanhaId = Number(req.params.id);
        const personagemId = Number(req.params.personagemId);

        await pool.query(
            "DELETE FROM CAMPANHA_PERSONAGENS WHERE CAMPANHA_ID = ? AND PERSONAGEM_ID = ?",
            [campanhaId, personagemId]
        );

        res.status(200).json({ mensagem: "Personagem removido da campanha." });
    } catch (erro) {
        console.error("Erro ao remover personagem da campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao remover personagem da campanha." });
    }
}

export async function listarCombatesCampanha(req, res) {
    try {
        const campanhaId = Number(req.params.id);
        const [combates] = await pool.query(
            "SELECT * FROM COMBATES WHERE CAMPANHA_ID = ? ORDER BY ID DESC",
            [campanhaId]
        );

        for (const cb of combates) {
            const [hCount] = await pool.query("SELECT COUNT(*) as total FROM COMBATE_HEROIS WHERE COMBATE_ID = ?", [cb.ID]);
            const [mCount] = await pool.query("SELECT COUNT(*) as total FROM COMBATE_CRIATURAS WHERE COMBATE_ID = ?", [cb.ID]);
            cb.TOTAL_HEROIS = hCount[0]?.total || 0;
            cb.TOTAL_CRIATURAS = mCount[0]?.total || 0;
        }

        res.status(200).json(combates);
    } catch (erro) {
        console.error("Erro ao listar combates da campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao listar combates da campanha." });
    }
}

export async function criarCombateCampanha(req, res) {
    try {
        const campanhaId = Number(req.params.id);
        const { nome } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ mensagem: "O nome do combate é obrigatório." });
        }

        const [resIns] = await pool.query(
            "INSERT INTO COMBATES (CAMPANHA_ID, NOME, FEAR_POINTS) VALUES (?, ?, 0)",
            [campanhaId, nome.trim()]
        );

        res.status(201).json({
            mensagem: "Combate criado na campanha!",
            id: resIns.insertId
        });
    } catch (erro) {
        console.error("Erro ao criar combate na campanha:", erro);
        res.status(500).json({ mensagem: "Erro ao criar combate na campanha." });
    }
}

export async function atualizarCombateCampanha(req, res) {
    try {
        const combateId = Number(req.params.combateId);
        const { nome } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ mensagem: "O nome do combate é obrigatório." });
        }

        await pool.query("UPDATE COMBATES SET NOME = ? WHERE ID = ?", [nome.trim(), combateId]);
        res.status(200).json({ mensagem: "Combate renomeado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao atualizar combate:", erro);
        res.status(500).json({ mensagem: "Erro ao atualizar combate." });
    }
}

export async function deletarCombateCampanha(req, res) {
    try {
        const combateId = Number(req.params.combateId);
        await pool.query("DELETE FROM COMBATE_HEROIS WHERE COMBATE_ID = ?", [combateId]);
        await pool.query("DELETE FROM COMBATE_CRIATURAS WHERE COMBATE_ID = ?", [combateId]);
        await pool.query("DELETE FROM COMBATES WHERE ID = ?", [combateId]);

        res.status(200).json({ mensagem: "Combate excluído com sucesso." });
    } catch (erro) {
        console.error("Erro ao excluir combate:", erro);
        res.status(500).json({ mensagem: "Erro ao excluir combate." });
    }
}
