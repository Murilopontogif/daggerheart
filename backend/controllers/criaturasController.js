import { pool } from "../database/conexao.js";

function normalizarHabilidades(rawHabs) {
    if (!rawHabs) return [];
    try {
        const list = typeof rawHabs === "string" ? JSON.parse(rawHabs || "[]") : rawHabs;
        if (!Array.isArray(list)) return [];
        return list.map(h => {
            const nome = h.nome || h.name || "Habilidade";
            const tipo = h.tipo || h.type || "Ação";
            const descricao = h.descricao || h.description || h.efeito || "";
            return {
                nome,
                name: nome,
                tipo,
                type: tipo,
                descricao,
                description: descricao
            };
        });
    } catch (e) {
        return [];
    }
}

export async function listarCriaturas(req, res) {
    try {
        const [inimigos] = await pool.query("SELECT * FROM INIMIGOS ORDER BY PATAMAR ASC, NOME ASC");
        
        const isMestre = req.user && req.user.papel === "mestre";

        const listaFormatada = inimigos.map(e => {
            const habilidades = normalizarHabilidades(e.HABILIDADES);

            if (!isMestre) {
                // Jogadores em visualizações gerais ou combate só vêem nome, patamar aproximado e imagem
                return {
                    id: e.ID,
                    name: e.NOME,
                    nome: e.NOME,
                    tier: e.PATAMAR,
                    patamar: e.PATAMAR,
                    image: e.IMAGEM || "img/enemies/placeholder.png",
                    imagem: e.IMAGEM || "img/enemies/placeholder.png"
                };
            }

            return {
                id: e.ID,
                name: e.NOME,
                nome: e.NOME,
                tier: e.PATAMAR,
                patamar: e.PATAMAR,
                role: e.PAPEL,
                papel: e.PAPEL,
                hordeCount: e.CONTAGEM_HORDA,
                contagemHorda: e.CONTAGEM_HORDA,
                description: e.DESCRICAO,
                descricao: e.DESCRICAO,
                tactics: e.TATICAS,
                taticas: e.TATICAS,
                difficulty: e.DIFICULDADE,
                dificuldade: e.DIFICULDADE,
                thresholds: e.LIMIARES,
                limiares: e.LIMIARES,
                hpMax: e.PV_MAXIMO,
                pvMaximo: e.PV_MAXIMO,
                stressMax: e.PF_MAXIMO,
                pfMaximo: e.PF_MAXIMO,
                atkBonus: e.BONUS_ATAQUE,
                bonusAtaque: e.BONUS_ATAQUE,
                attackName: e.NOME_ATAQUE,
                nomeAtaque: e.NOME_ATAQUE,
                attackDamage: e.DANO_ATAQUE,
                danoAtaque: e.DANO_ATAQUE,
                experiences: e.EXPERIENCIAS,
                experiencias: e.EXPERIENCIAS,
                abilities: habilidades,
                habilidades: habilidades,
                image: e.IMAGEM || "img/enemies/placeholder.png",
                imagem: e.IMAGEM || "img/enemies/placeholder.png"
            };
        });

        res.status(200).json(listaFormatada);
    } catch (err) {
        console.error("Erro ao listar criaturas:", err);
        res.status(500).json({ mensagem: "Erro ao buscar criaturas." });
    }
}

export async function buscarCriaturaPorId(req, res) {
    try {
        const id = Number(req.params.id);
        const [rows] = await pool.query("SELECT * FROM INIMIGOS WHERE ID = ?", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ mensagem: "Criatura não encontrada." });
        }

        const e = rows[0];
        const isMestre = req.user && req.user.papel === "mestre";

        if (!isMestre) {
            return res.status(200).json({
                id: e.ID,
                name: e.NOME,
                nome: e.NOME,
                image: e.IMAGEM || "img/enemies/placeholder.png",
                imagem: e.IMAGEM || "img/enemies/placeholder.png"
            });
        }

        const habilidades = normalizarHabilidades(e.HABILIDADES);

        res.status(200).json({
            id: e.ID,
            name: e.NOME,
            nome: e.NOME,
            tier: e.PATAMAR,
            patamar: e.PATAMAR,
            role: e.PAPEL,
            papel: e.PAPEL,
            hordeCount: e.CONTAGEM_HORDA,
            contagemHorda: e.CONTAGEM_HORDA,
            description: e.DESCRICAO,
            descricao: e.DESCRICAO,
            tactics: e.TATICAS,
            taticas: e.TATICAS,
            difficulty: e.DIFICULDADE,
            dificuldade: e.DIFICULDADE,
            thresholds: e.LIMIARES,
            limiares: e.LIMIARES,
            hpMax: e.PV_MAXIMO,
            pvMaximo: e.PV_MAXIMO,
            stressMax: e.PF_MAXIMO,
            pfMaximo: e.PF_MAXIMO,
            atkBonus: e.BONUS_ATAQUE,
            bonusAtaque: e.BONUS_ATAQUE,
            attackName: e.NOME_ATAQUE,
            nomeAtaque: e.NOME_ATAQUE,
            attackDamage: e.DANO_ATAQUE,
            danoAtaque: e.DANO_ATAQUE,
            experiences: e.EXPERIENCIAS,
            experiencias: e.EXPERIENCIAS,
            abilities: habilidades,
            habilidades: habilidades,
            image: e.IMAGEM || "img/enemies/placeholder.png",
            imagem: e.IMAGEM || "img/enemies/placeholder.png"
        });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar criatura." });
    }
}

export async function criarCriatura(req, res) {
    try {
        const {
            NOME,
            PATAMAR = 1,
            PAPEL = "Padrão",
            CONTAGEM_HORDA = "",
            DESCRICAO = "",
            TATICAS = "",
            DIFICULDADE = 10,
            LIMIARES = "1/2/3",
            PV_MAXIMO = 1,
            PF_MAXIMO = 0,
            BONUS_ATAQUE = "+0",
            NOME_ATAQUE = "Golpe",
            DANO_ATAQUE = "d6",
            EXPERIENCIAS = "",
            HABILIDADES = [],
            IMAGEM = ""
        } = req.body;

        if (!NOME) {
            return res.status(400).json({ mensagem: "O nome da criatura é obrigatório." });
        }

        // Determinar próximo ID
        const [maxRow] = await pool.query("SELECT MAX(ID) as maxId FROM INIMIGOS");
        const novoId = ((maxRow && maxRow[0] && maxRow[0].maxId) || 0) + 1;

        const habString = typeof HABILIDADES === "object" ? JSON.stringify(HABILIDADES) : HABILIDADES;

        await pool.query(
            `INSERT INTO INIMIGOS 
            (ID, NOME, PATAMAR, PAPEL, CONTAGEM_HORDA, DESCRICAO, TATICAS, DIFICULDADE, LIMIARES, 
             PV_MAXIMO, PF_MAXIMO, BONUS_ATAQUE, NOME_ATAQUE, DANO_ATAQUE, EXPERIENCIAS, HABILIDADES, IMAGEM)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                novoId,
                NOME,
                Number(PATAMAR),
                PAPEL,
                CONTAGEM_HORDA,
                DESCRICAO,
                TATICAS,
                Number(DIFICULDADE),
                LIMIARES,
                Number(PV_MAXIMO),
                Number(PF_MAXIMO),
                BONUS_ATAQUE,
                NOME_ATAQUE,
                DANO_ATAQUE,
                EXPERIENCIAS,
                habString,
                IMAGEM
            ]
        );

        res.status(201).json({
            mensagem: `Criatura '${NOME}' criada com sucesso!`,
            id: novoId
        });
    } catch (err) {
        console.error("Erro ao criar criatura:", err);
        res.status(500).json({ mensagem: "Erro ao cadastrar criatura no banco de dados." });
    }
}

export async function atualizarCriatura(req, res) {
    try {
        const id = Number(req.params.id);
        const {
            NOME,
            PATAMAR = 1,
            PAPEL = "Padrão",
            CONTAGEM_HORDA = "",
            DESCRICAO = "",
            TATICAS = "",
            DIFICULDADE = 10,
            LIMIARES = "1/2/3",
            PV_MAXIMO = 1,
            PF_MAXIMO = 0,
            BONUS_ATAQUE = "+0",
            NOME_ATAQUE = "Golpe",
            DANO_ATAQUE = "d6",
            EXPERIENCIAS = "",
            HABILIDADES = [],
            IMAGEM = ""
        } = req.body;

        const habString = typeof HABILIDADES === "object" ? JSON.stringify(HABILIDADES) : HABILIDADES;

        const [resultado] = await pool.query(
            `UPDATE INIMIGOS SET 
            NOME = ?, PATAMAR = ?, PAPEL = ?, CONTAGEM_HORDA = ?, DESCRICAO = ?, TATICAS = ?, 
            DIFICULDADE = ?, LIMIARES = ?, PV_MAXIMO = ?, PF_MAXIMO = ?, BONUS_ATAQUE = ?, 
            NOME_ATAQUE = ?, DANO_ATAQUE = ?, EXPERIENCIAS = ?, HABILIDADES = ?, IMAGEM = ? 
            WHERE ID = ?`,
            [
                NOME,
                Number(PATAMAR),
                PAPEL,
                CONTAGEM_HORDA,
                DESCRICAO,
                TATICAS,
                Number(DIFICULDADE),
                LIMIARES,
                Number(PV_MAXIMO),
                Number(PF_MAXIMO),
                BONUS_ATAQUE,
                NOME_ATAQUE,
                DANO_ATAQUE,
                EXPERIENCIAS,
                habString,
                IMAGEM,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Criatura não encontrada." });
        }

        res.status(200).json({ mensagem: "Criatura atualizada com sucesso!" });
    } catch (err) {
        console.error("Erro ao atualizar criatura:", err);
        res.status(500).json({ mensagem: "Erro ao atualizar criatura." });
    }
}

export async function deletarCriatura(req, res) {
    try {
        const id = Number(req.params.id);
        const [resultado] = await pool.query("DELETE FROM INIMIGOS WHERE ID = ?", [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Criatura não encontrada." });
        }
        res.status(200).json({ mensagem: "Criatura removida com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar criatura:", err);
        res.status(500).json({ mensagem: "Erro ao remover criatura." });
    }
}
