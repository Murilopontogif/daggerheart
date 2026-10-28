import { pool } from "../database/conexao.js";

async function listarPersonagens(req, res) {
    try {
        const isMestre = req.user && req.user.papel === "mestre";
        const userId = req.user ? req.user.id : 1;

        let querySql;
        let queryParams = [];

        if (isMestre) {
            querySql = `
                SELECT p.*, u.LOGIN as CRIADOR_NOME 
                FROM PERSONAGENS p 
                LEFT JOIN USUARIOS u ON p.USUARIO_ID = u.ID 
                ORDER BY p.ID ASC
            `;
        } else {
            querySql = `
                SELECT p.*, u.LOGIN as CRIADOR_NOME 
                FROM PERSONAGENS p 
                LEFT JOIN USUARIOS u ON p.USUARIO_ID = u.ID 
                WHERE p.USUARIO_ID = ? 
                ORDER BY p.ID ASC
            `;
            queryParams = [userId];
        }

        const [personagens] = await pool.query(querySql, queryParams);
        res.status(200).json(personagens);
    } catch (erro) {
        console.error("Erro ao buscar personagens:", erro);
        res.status(500).json({ mensagem: "Erro ao buscar personagens." });
    }
}

async function buscarPersonagemPorId(req, res) {
    try {
        const id = Number(req.params.id);
        const [personagens] = await pool.query(
            `SELECT p.*, u.LOGIN as CRIADOR_NOME 
             FROM PERSONAGENS p 
             LEFT JOIN USUARIOS u ON p.USUARIO_ID = u.ID 
             WHERE p.ID = ?`,
            [id]
        );

        if (!personagens || personagens.length === 0) {
            return res.status(404).json({ mensagem: "Personagem não encontrado." });
        }

        const p = personagens[0];
        const isMestre = req.user && req.user.papel === "mestre";
        if (!isMestre && req.user && p.USUARIO_ID !== req.user.id) {
            return res.status(403).json({ mensagem: "Você não tem permissão para visualizar este personagem." });
        }

        res.status(200).json(p);
    } catch (erro) {
        console.error("Erro ao buscar personagem por ID:", erro);
        res.status(500).json({ mensagem: "Erro ao buscar personagem." });
    }
}

async function adicionarPersonagem(req, res) {
    try {
        const usuarioId = req.user ? req.user.id : 1;

        const {
            NOME,
            CLASSE,
            SUBCLASSE = "",
            ANCESTRALIDADE,
            ANCESTRALIDADE_SECUNDARIA = "",
            ANCESTRALIDADE_TIPO = "unica",
            COMUNIDADE,
            NIVEL = 1,
            GENERO = "",
            AGILIDADE = 0,
            FORCA = 0,
            ACUIDADE = 0,
            INSTINTO = 0,
            PRESENCA = 0,
            CONHECIMENTO = 0,
            EVASAO = 10,
            ARMADURA = 0,
            ARMADURA_SLOTS = 6,
            ESPERANCA = 2,
            PV_MAXIMO = 6,
            PF_MAXIMO = 6,
            DANO_MENOR = 1,
            DANO_MAIOR = 2,
            DANO_GRAVE = 3,
            EXPERIENCIAS = "",
            HABILIDADES_CLASSE = "",
            HABILIDADE_SUBCLASSE = "",
            HABILIDADE_COMUNIDADE = "",
            HABILIDADE_RACA = "",
            OURO_PUNHADOS = 0,
            OURO_BOLSAS = 0,
            OURO_BAU = 0,
            ARMA_PRINCIPAL = "",
            ARMA_SECUNDARIA = "",
            ARMADURA_ATIVA = "",
            INVENTARIO = "",
            CARTAS_DOMINIO = "",
            IMAGEM = ""
        } = req.body;

        if (!NOME || !CLASSE || !ANCESTRALIDADE || !COMUNIDADE) {
            return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios (Nome, Classe, Ancestralidade e Comunidade)." });
        }

        const [resultado] = await pool.query(
            `INSERT INTO PERSONAGENS 
            (NOME, CLASSE, SUBCLASSE, ANCESTRALIDADE, ANCESTRALIDADE_SECUNDARIA, ANCESTRALIDADE_TIPO, COMUNIDADE, NIVEL, GENERO, 
             AGILIDADE, FORCA, ACUIDADE, INSTINTO, PRESENCA, CONHECIMENTO, 
             EVASAO, ARMADURA, ARMADURA_SLOTS, ESPERANCA, PV_MAXIMO, PF_MAXIMO, 
             DANO_MENOR, DANO_MAIOR, DANO_GRAVE, EXPERIENCIAS, HABILIDADES_CLASSE, 
             HABILIDADE_SUBCLASSE, HABILIDADE_COMUNIDADE, HABILIDADE_RACA,
             OURO_PUNHADOS, OURO_BOLSAS, OURO_BAU, ARMA_PRINCIPAL, ARMA_SECUNDARIA, 
             ARMADURA_ATIVA, INVENTARIO, CARTAS_DOMINIO, IMAGEM, USUARIO_ID) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                NOME,
                CLASSE,
                SUBCLASSE,
                ANCESTRALIDADE,
                ANCESTRALIDADE_SECUNDARIA,
                ANCESTRALIDADE_TIPO,
                COMUNIDADE,
                Number(NIVEL),
                GENERO,
                Number(AGILIDADE),
                Number(FORCA),
                Number(ACUIDADE),
                Number(INSTINTO),
                Number(PRESENCA),
                Number(CONHECIMENTO),
                Number(EVASAO),
                Number(ARMADURA),
                Number(ARMADURA_SLOTS),
                Number(ESPERANCA),
                Number(PV_MAXIMO),
                Number(PF_MAXIMO),
                Number(DANO_MENOR),
                Number(DANO_MAIOR),
                Number(DANO_GRAVE),
                typeof EXPERIENCIAS === "object" ? JSON.stringify(EXPERIENCIAS) : EXPERIENCIAS,
                HABILIDADES_CLASSE,
                HABILIDADE_SUBCLASSE,
                HABILIDADE_COMUNIDADE,
                typeof HABILIDADE_RACA === "object" ? JSON.stringify(HABILIDADE_RACA) : HABILIDADE_RACA,
                Number(OURO_PUNHADOS),
                Number(OURO_BOLSAS),
                Number(OURO_BAU),
                typeof ARMA_PRINCIPAL === "object" ? JSON.stringify(ARMA_PRINCIPAL) : ARMA_PRINCIPAL,
                typeof ARMA_SECUNDARIA === "object" ? JSON.stringify(ARMA_SECUNDARIA) : ARMA_SECUNDARIA,
                typeof ARMADURA_ATIVA === "object" ? JSON.stringify(ARMADURA_ATIVA) : ARMADURA_ATIVA,
                typeof INVENTARIO === "object" ? JSON.stringify(INVENTARIO) : INVENTARIO,
                typeof CARTAS_DOMINIO === "object" ? JSON.stringify(CARTAS_DOMINIO) : CARTAS_DOMINIO,
                IMAGEM || null,
                usuarioId
            ]
        );

        res.status(201).json({
            mensagem: "Personagem cadastrado com sucesso!",
            id: resultado.insertId
        });
    } catch (erro) {
        console.error("Erro ao adicionar personagem:", erro);
        res.status(500).json({ mensagem: "Erro ao cadastrar personagem no banco de dados." });
    }
}

async function atualizarPersonagem(req, res) {
    try {
        const id = Number(req.params.id);
        const [existente] = await pool.query("SELECT USUARIO_ID FROM PERSONAGENS WHERE ID = ?", [id]);
        if (!existente || existente.length === 0) {
            return res.status(404).json({ mensagem: "Personagem não encontrado." });
        }

        const isMestre = req.user && req.user.papel === "mestre";
        if (!isMestre && req.user && existente[0].USUARIO_ID !== req.user.id) {
            return res.status(403).json({ mensagem: "Você só pode editar personagens criados por você." });
        }

        const {
            NOME,
            CLASSE,
            SUBCLASSE = "",
            ANCESTRALIDADE,
            ANCESTRALIDADE_SECUNDARIA = "",
            ANCESTRALIDADE_TIPO = "unica",
            COMUNIDADE,
            NIVEL = 1,
            GENERO = "",
            AGILIDADE = 0,
            FORCA = 0,
            ACUIDADE = 0,
            INSTINTO = 0,
            PRESENCA = 0,
            CONHECIMENTO = 0,
            EVASAO = 10,
            ARMADURA = 0,
            ARMADURA_SLOTS = 6,
            ESPERANCA = 2,
            PV_MAXIMO = 6,
            PF_MAXIMO = 6,
            DANO_MENOR = 1,
            DANO_MAIOR = 2,
            DANO_GRAVE = 3,
            EXPERIENCIAS = "",
            HABILIDADES_CLASSE = "",
            HABILIDADE_SUBCLASSE = "",
            HABILIDADE_COMUNIDADE = "",
            HABILIDADE_RACA = "",
            OURO_PUNHADOS = 0,
            OURO_BOLSAS = 0,
            OURO_BAU = 0,
            ARMA_PRINCIPAL = "",
            ARMA_SECUNDARIA = "",
            ARMADURA_ATIVA = "",
            INVENTARIO = "",
            CARTAS_DOMINIO = "",
            IMAGEM = ""
        } = req.body;

        if (!NOME || !CLASSE || !ANCESTRALIDADE || !COMUNIDADE) {
            return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios." });
        }

        const [resultado] = await pool.query(
            `UPDATE PERSONAGENS SET 
            NOME = ?, CLASSE = ?, SUBCLASSE = ?, ANCESTRALIDADE = ?, ANCESTRALIDADE_SECUNDARIA = ?, ANCESTRALIDADE_TIPO = ?, 
            COMUNIDADE = ?, NIVEL = ?, GENERO = ?,
            AGILIDADE = ?, FORCA = ?, ACUIDADE = ?, INSTINTO = ?, PRESENCA = ?, CONHECIMENTO = ?, 
            EVASAO = ?, ARMADURA = ?, ARMADURA_SLOTS = ?, ESPERANCA = ?, PV_MAXIMO = ?, PF_MAXIMO = ?, 
            DANO_MENOR = ?, DANO_MAIOR = ?, DANO_GRAVE = ?, EXPERIENCIAS = ?, HABILIDADES_CLASSE = ?, 
            HABILIDADE_SUBCLASSE = ?, HABILIDADE_COMUNIDADE = ?, HABILIDADE_RACA = ?,
            OURO_PUNHADOS = ?, OURO_BOLSAS = ?, OURO_BAU = ?, ARMA_PRINCIPAL = ?, ARMA_SECUNDARIA = ?, 
            ARMADURA_ATIVA = ?, INVENTARIO = ?, CARTAS_DOMINIO = ?, IMAGEM = ? 
            WHERE ID = ?`,
            [
                NOME,
                CLASSE,
                SUBCLASSE,
                ANCESTRALIDADE,
                ANCESTRALIDADE_SECUNDARIA,
                ANCESTRALIDADE_TIPO,
                COMUNIDADE,
                Number(NIVEL),
                GENERO,
                Number(AGILIDADE),
                Number(FORCA),
                Number(ACUIDADE),
                Number(INSTINTO),
                Number(PRESENCA),
                Number(CONHECIMENTO),
                Number(EVASAO),
                Number(ARMADURA),
                Number(ARMADURA_SLOTS),
                Number(ESPERANCA),
                Number(PV_MAXIMO),
                Number(PF_MAXIMO),
                Number(DANO_MENOR),
                Number(DANO_MAIOR),
                Number(DANO_GRAVE),
                typeof EXPERIENCIAS === "object" ? JSON.stringify(EXPERIENCIAS) : EXPERIENCIAS,
                HABILIDADES_CLASSE,
                HABILIDADE_SUBCLASSE,
                HABILIDADE_COMUNIDADE,
                typeof HABILIDADE_RACA === "object" ? JSON.stringify(HABILIDADE_RACA) : HABILIDADE_RACA,
                Number(OURO_PUNHADOS),
                Number(OURO_BOLSAS),
                Number(OURO_BAU),
                typeof ARMA_PRINCIPAL === "object" ? JSON.stringify(ARMA_PRINCIPAL) : ARMA_PRINCIPAL,
                typeof ARMA_SECUNDARIA === "object" ? JSON.stringify(ARMA_SECUNDARIA) : ARMA_SECUNDARIA,
                typeof ARMADURA_ATIVA === "object" ? JSON.stringify(ARMADURA_ATIVA) : ARMADURA_ATIVA,
                typeof INVENTARIO === "object" ? JSON.stringify(INVENTARIO) : INVENTARIO,
                typeof CARTAS_DOMINIO === "object" ? JSON.stringify(CARTAS_DOMINIO) : CARTAS_DOMINIO,
                IMAGEM || null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Personagem não encontrado." });
        }

        res.status(200).json({ mensagem: "Personagem atualizado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao atualizar personagem:", erro);
        res.status(500).json({ mensagem: "Erro ao atualizar personagem." });
    }
}

async function deletarPersonagem(req, res) {
    try {
        const id = Number(req.params.id);
        const [existente] = await pool.query("SELECT USUARIO_ID FROM PERSONAGENS WHERE ID = ?", [id]);
        if (!existente || existente.length === 0) {
            return res.status(404).json({ mensagem: "Personagem não encontrado." });
        }

        const isMestre = req.user && req.user.papel === "mestre";
        if (!isMestre && req.user && existente[0].USUARIO_ID !== req.user.id) {
            return res.status(403).json({ mensagem: "Você só pode excluir personagens criados por você." });
        }

        // Remover do combate se estiver presente
        await pool.query("DELETE FROM COMBATE_HEROIS WHERE PERSONAGEM_ID = ?", [id]);
        await pool.query("DELETE FROM PERSONAGENS WHERE ID = ?", [id]);

        res.status(200).json({ mensagem: "Personagem deletado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao deletar personagem:", erro);
        res.status(500).json({ mensagem: "Erro ao deletar personagem." });
    }
}

async function listarDadosSistema(req, res) {
    try {
        const [regrasRows] = await pool.query("SELECT CATEGORIA, CHAVE, DADOS FROM REGRAS_SISTEMA ORDER BY ID ASC");
        const [cartasRows] = await pool.query("SELECT * FROM CARTAS_DOMINIO ORDER BY ID ASC");
        const [inimigosRows] = await pool.query("SELECT * FROM INIMIGOS ORDER BY ID ASC");

        const CLASSES = {};
        const SUBCLASSES = {};
        const ANCESTRALIDADES = [];
        const COMUNIDADES = [];

        for (const row of regrasRows) {
            const dados = typeof row.DADOS === "string" ? JSON.parse(row.DADOS) : row.DADOS;
            if (row.CATEGORIA === "CLASSE") CLASSES[row.CHAVE] = dados;
            else if (row.CATEGORIA === "SUBCLASSE") SUBCLASSES[row.CHAVE] = dados;
            else if (row.CATEGORIA === "ANCESTRALIDADE") ANCESTRALIDADES.push(dados);
            else if (row.CATEGORIA === "COMUNIDADE") COMUNIDADES.push(dados);
        }

        const CARTAS = cartasRows.map(c => ({
            id: c.ID,
            name: c.NOME,
            domain: c.DOMINIO,
            level: c.NIVEL,
            recallCost: c.CUSTO_RETORNO,
            type: c.TIPO,
            description: c.DESCRICAO
        }));

        const isMestre = req.user && req.user.papel === "mestre";

        const ENEMIES = inimigosRows.map(e => {
            if (!isMestre) {
                return {
                    id: e.ID,
                    name: e.NOME,
                    tier: e.PATAMAR,
                    image: e.IMAGEM || "img/enemies/placeholder.png"
                };
            }
            return {
                id: e.ID,
                name: e.NOME,
                tier: e.PATAMAR,
                role: e.PAPEL,
                hordeCount: e.CONTAGEM_HORDA,
                description: e.DESCRICAO,
                tactics: e.TATICAS,
                difficulty: e.DIFICULDADE,
                thresholds: e.LIMIARES,
                hpMax: e.PV_MAXIMO,
                stressMax: e.PF_MAXIMO,
                atkBonus: e.BONUS_ATAQUE,
                attackName: e.NOME_ATAQUE,
                attackDamage: e.DANO_ATAQUE,
                experiences: e.EXPERIENCIAS,
                abilities: typeof e.HABILIDADES === "string" ? JSON.parse(e.HABILIDADES) : e.HABILIDADES,
                image: e.IMAGEM || "img/enemies/placeholder.png"
            };
        });

        res.status(200).json({
            DAGGERHEART_DATA: { CLASSES, SUBCLASSES, ANCESTRALIDADES, COMUNIDADES, CARTAS },
            DAGGERHEART_ENEMIES: ENEMIES
        });
    } catch (erro) {
        console.error("Erro ao buscar dados do sistema:", erro);
        res.status(500).json({ mensagem: "Erro ao buscar dados do sistema no banco de dados." });
    }
}

export {
    listarPersonagens,
    buscarPersonagemPorId,
    adicionarPersonagem,
    atualizarPersonagem,
    deletarPersonagem,
    listarDadosSistema
};
