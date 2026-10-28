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

export async function obterEstadoCombate(req, res) {
    try {
        const isMestre = req.user && req.user.papel === "mestre";
        const userId = req.user ? req.user.id : 0;

        // Buscar Medo (Fear Points 0 a 10)
        let fearPoints = 0;
        try {
            const [fRows] = await pool.query("SELECT FEAR_POINTS FROM COMBATE_ESTADO WHERE ID = 1");
            if (fRows && fRows.length > 0) {
                fearPoints = Number(fRows[0].FEAR_POINTS) || 0;
            }
        } catch {
            fearPoints = 0;
        }

        // Buscar Heróis no Combate
        const [heroisRows] = await pool.query(`
            SELECT 
                ch.ID as INSTANCIA_ID,
                ch.PV_ATUAL,
                ch.PF_ATUAL,
                ch.ARMADURA_MARCADA,
                p.ID as PERSONAGEM_ID,
                p.NOME,
                p.NIVEL,
                p.CLASSE,
                p.SUBCLASSE,
                p.IMAGEM,
                p.PV_MAXIMO,
                p.PF_MAXIMO,
                p.ARMADURA,
                p.ARMADURA_SLOTS,
                p.EVASAO,
                p.ESPERANCA,
                p.DANO_MENOR,
                p.DANO_MAIOR,
                p.DANO_GRAVE,
                p.USUARIO_ID
            FROM COMBATE_HEROIS ch
            JOIN PERSONAGENS p ON ch.PERSONAGEM_ID = p.ID
            ORDER BY ch.ID ASC
        `);

        // Buscar Criaturas no Combate
        const [criaturasRows] = await pool.query(`
            SELECT 
                cc.ID as INSTANCIA_ID,
                cc.PV_ATUAL,
                cc.PF_ATUAL,
                cc.ARMADURA_MARCADA,
                cc.ARMADURA_MAXIMA,
                cc.NOTAS,
                i.ID as INIMIGO_ID,
                cc.NOME_INSTANCIA,
                i.NOME as NOME_BASE,
                i.PATAMAR,
                i.PAPEL,
                i.DIFICULDADE,
                i.LIMIARES,
                i.PV_MAXIMO,
                i.PF_MAXIMO,
                i.BONUS_ATAQUE,
                i.NOME_ATAQUE,
                i.DANO_ATAQUE,
                i.TATICAS,
                i.HABILIDADES,
                i.IMAGEM
            FROM COMBATE_CRIATURAS cc
            JOIN INIMIGOS i ON cc.INIMIGO_ID = i.ID
            ORDER BY cc.ID ASC
        `);

        const herois = heroisRows.map(h => ({
            instanciaId: h.INSTANCIA_ID,
            personagemId: h.PERSONAGEM_ID,
            nome: h.NOME,
            nivel: h.NIVEL || 1,
            classe: h.CLASSE,
            subclasse: h.SUBCLASSE,
            imagem: h.IMAGEM,
            pvAtual: h.PV_ATUAL,
            pvMaximo: h.PV_MAXIMO || 6,
            pfAtual: h.PF_ATUAL,
            pfMaximo: h.PF_MAXIMO || 6,
            armaduraMarcada: h.ARMADURA_MARCADA,
            armaduraSlots: h.ARMADURA_SLOTS || 6,
            armaduraValor: h.ARMADURA || 0,
            evasao: h.EVASAO || 10,
            esperanca: h.ESPERANCA ?? 2,
            danoMenor: h.DANO_MENOR || 1,
            danoMaior: h.DANO_MAIOR || 8,
            danoGrave: h.DANO_GRAVE || 15,
            limiares: `${h.DANO_MENOR || 1}/${h.DANO_MAIOR || 8}/${h.DANO_GRAVE || 15}`,
            isMine: h.USUARIO_ID === userId,
            podeEditar: isMestre || (h.USUARIO_ID === userId)
        }));

        let criaturas;
        if (isMestre) {
            // Mestre vê tudo
            criaturas = criaturasRows.map(c => ({
                instanciaId: c.INSTANCIA_ID,
                inimigoId: c.INIMIGO_ID,
                nome: c.NOME_INSTANCIA || c.NOME_BASE,
                patamar: c.PATAMAR,
                papel: c.PAPEL,
                dificuldade: c.DIFICULDADE,
                limiares: c.LIMIARES,
                pvAtual: c.PV_ATUAL,
                pvMaximo: c.PV_MAXIMO || 1,
                pfAtual: c.PF_ATUAL,
                pfMaximo: c.PF_MAXIMO || 0,
                armaduraMarcada: c.ARMADURA_MARCADA || 0,
                armaduraMaxima: c.ARMADURA_MAXIMA || 0,
                notas: c.NOTAS || "",
                bonusAtaque: c.BONUS_ATAQUE,
                nomeAtaque: c.NOME_ATAQUE,
                danoAtaque: c.DANO_ATAQUE,
                taticas: c.TATICAS,
                habilidades: normalizarHabilidades(c.HABILIDADES),
                abilities: normalizarHabilidades(c.HABILIDADES),
                imagem: c.IMAGEM || "img/enemies/placeholder.png",
                podeEditar: true
            }));
        } else {
            // JOGADORES: só podem ver foto e nome da criatura, sem nenhuma outra informação técnica
            criaturas = criaturasRows.map(c => ({
                instanciaId: c.INSTANCIA_ID,
                nome: c.NOME_INSTANCIA || c.NOME_BASE,
                imagem: c.IMAGEM || "img/enemies/placeholder.png",
                podeEditar: false
            }));
        }

        res.status(200).json({
            isMestre,
            fearPoints,
            herois,
            criaturas
        });
    } catch (err) {
        console.error("Erro ao obter estado de combate:", err);
        res.status(500).json({ mensagem: "Erro ao obter dados da arena de combate." });
    }
}

export async function atualizarMedoCombate(req, res) {
    try {
        const isMestre = req.user && req.user.papel === "mestre";
        if (!isMestre) {
            return res.status(403).json({ mensagem: "Apenas o Mestre pode alterar os Pontos de Medo." });
        }
        const novoMedo = Math.max(0, Math.min(10, Number(req.body.fearPoints) || 0));
        await pool.query("UPDATE COMBATE_ESTADO SET FEAR_POINTS = ? WHERE ID = 1", [novoMedo]);
        res.status(200).json({ fearPoints: novoMedo, mensagem: "Medo atualizado." });
    } catch (err) {
        console.error("Erro ao atualizar medo:", err);
        res.status(500).json({ mensagem: "Erro ao atualizar pontos de medo." });
    }
}

export async function adicionarHeroiCombate(req, res) {
    try {
        const { personagemId } = req.body;
        if (!personagemId) {
            return res.status(400).json({ mensagem: "ID do personagem é obrigatório." });
        }

        const [pRows] = await pool.query("SELECT * FROM PERSONAGENS WHERE ID = ?", [personagemId]);
        if (!pRows || pRows.length === 0) {
            return res.status(404).json({ mensagem: "Personagem não encontrado." });
        }

        const p = pRows[0];
        const isMestre = req.user && req.user.papel === "mestre";
        if (!isMestre && p.USUARIO_ID !== req.user.id) {
            return res.status(403).json({ mensagem: "Você só pode adicionar seu próprio personagem ao combate." });
        }

        // Checar se já está no combate
        const [existente] = await pool.query("SELECT ID FROM COMBATE_HEROIS WHERE PERSONAGEM_ID = ?", [personagemId]);
        if (existente && existente.length > 0) {
            return res.status(400).json({ mensagem: "Este herói já está na arena de combate." });
        }

        await pool.query(
            "INSERT INTO COMBATE_HEROIS (PERSONAGEM_ID, PV_ATUAL, PF_ATUAL, ARMADURA_MARCADA) VALUES (?, ?, ?, ?)",
            [personagemId, p.PV_ATUAL ?? p.PV_MAXIMO ?? 6, p.PF_ATUAL ?? 0, p.ARMADURA_ATUAL ?? 0]
        );

        res.status(201).json({ mensagem: `${p.NOME} entrou no combate!` });
    } catch (err) {
        console.error("Erro ao adicionar herói ao combate:", err);
        res.status(500).json({ mensagem: "Erro ao adicionar herói." });
    }
}

export async function adicionarCriaturaCombate(req, res) {
    try {
        const { inimigoId, nomeCustom, quantidade } = req.body;
        if (!inimigoId) {
            return res.status(400).json({ mensagem: "ID do monstro é obrigatório." });
        }

        const [iRows] = await pool.query("SELECT * FROM INIMIGOS WHERE ID = ?", [inimigoId]);
        if (!iRows || iRows.length === 0) {
            return res.status(404).json({ mensagem: "Monstro não encontrado." });
        }

        const i = iRows[0];
        const qtd = Math.max(1, Math.min(15, Number(quantidade) || 1));

        // Contar quantos desse monstro já estão em combate para numerar (#1, #2...)
        const [existentes] = await pool.query("SELECT COUNT(*) as total FROM COMBATE_CRIATURAS WHERE INIMIGO_ID = ?", [inimigoId]);
        let baseCount = existentes && existentes[0] ? Number(existentes[0].total) || 0 : 0;

        for (let k = 0; k < qtd; k++) {
            baseCount++;
            const sufixo = (qtd > 1 || baseCount > 1) ? ` #${baseCount}` : "";
            const nomeInstancia = nomeCustom && nomeCustom.trim() ? `${nomeCustom.trim()}${qtd > 1 ? ` #${k + 1}` : ""}` : `${i.NOME}${sufixo}`;
            await pool.query(
                "INSERT INTO COMBATE_CRIATURAS (INIMIGO_ID, NOME_INSTANCIA, PV_ATUAL, PF_ATUAL, ARMADURA_MARCADA, ARMADURA_MAXIMA, NOTAS) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [inimigoId, nomeInstancia, i.PV_MAXIMO || 1, 0, 0, 0, ""]
            );
        }

        res.status(201).json({ mensagem: `${qtd > 1 ? `${qtd}x ${i.NOME}` : (nomeCustom || i.NOME)} adicionado(s) ao combate!` });
    } catch (err) {
        console.error("Erro ao adicionar criatura ao combate:", err);
        res.status(500).json({ mensagem: "Erro ao adicionar monstro ao combate." });
    }
}

export async function removerParticipanteCombate(req, res) {
    try {
        const { tipo, id } = req.params;
        const isMestre = req.user && req.user.papel === "mestre";

        if (tipo === "criatura") {
            if (!isMestre) {
                return res.status(403).json({ mensagem: "Apenas o mestre pode remover monstros do combate." });
            }
            await pool.query("DELETE FROM COMBATE_CRIATURAS WHERE ID = ?", [id]);
            return res.status(200).json({ mensagem: "Criatura removida do combate." });
        }

        if (tipo === "heroi") {
            if (!isMestre) {
                const [hRows] = await pool.query(`
                    SELECT p.USUARIO_ID 
                    FROM COMBATE_HEROIS ch 
                    JOIN PERSONAGENS p ON ch.PERSONAGEM_ID = p.ID 
                    WHERE ch.ID = ?
                `, [id]);

                if (!hRows || hRows.length === 0 || hRows[0].USUARIO_ID !== req.user.id) {
                    return res.status(403).json({ mensagem: "Você só pode retirar seu próprio herói do combate." });
                }
            }
            await pool.query("DELETE FROM COMBATE_HEROIS WHERE ID = ?", [id]);
            return res.status(200).json({ mensagem: "Herói removido do combate." });
        }

        res.status(400).json({ mensagem: "Tipo inválido." });
    } catch (err) {
        console.error("Erro ao remover participante:", err);
        res.status(500).json({ mensagem: "Erro ao remover do combate." });
    }
}

export async function atualizarStatusCombate(req, res) {
    try {
        const { tipo, id, pvAtual, pfAtual, armaduraMarcada, armaduraMaxima, esperanca, nomeInstancia, notas } = req.body;
        const isMestre = req.user && req.user.papel === "mestre";

        if (tipo === "criatura") {
            if (!isMestre) {
                return res.status(403).json({ mensagem: "Apenas o Mestre pode alterar a vida, fadiga ou armadura de criaturas." });
            }

            const [cRows] = await pool.query("SELECT * FROM COMBATE_CRIATURAS WHERE ID = ?", [Number(id)]);
            if (!cRows || cRows.length === 0) {
                return res.status(404).json({ mensagem: "Criatura não encontrada no combate." });
            }
            const atual = cRows[0];

            const novoPv = pvAtual !== undefined ? Number(pvAtual) : atual.PV_ATUAL;
            const novoPf = pfAtual !== undefined ? Number(pfAtual) : atual.PF_ATUAL;
            const novaArm = armaduraMarcada !== undefined ? Number(armaduraMarcada) : atual.ARMADURA_MARCADA;
            const novaArmMax = armaduraMaxima !== undefined ? Number(armaduraMaxima) : (atual.ARMADURA_MAXIMA || 0);
            const novoNome = nomeInstancia !== undefined ? String(nomeInstancia) : atual.NOME_INSTANCIA;
            const novasNotas = notas !== undefined ? String(notas) : (atual.NOTAS || "");

            await pool.query(
                "UPDATE COMBATE_CRIATURAS SET PV_ATUAL = ?, PF_ATUAL = ?, ARMADURA_MARCADA = ?, ARMADURA_MAXIMA = ?, NOME_INSTANCIA = ?, NOTAS = ? WHERE ID = ?",
                [novoPv, novoPf, novaArm, novaArmMax, novoNome, novasNotas, Number(id)]
            );

            return res.status(200).json({ mensagem: "Status do monstro atualizado!" });
        }

        if (tipo === "heroi") {
            const [hRows] = await pool.query(`
                SELECT ch.*, p.USUARIO_ID, p.ESPERANCA 
                FROM COMBATE_HEROIS ch 
                JOIN PERSONAGENS p ON ch.PERSONAGEM_ID = p.ID 
                WHERE ch.ID = ?
            `, [id]);

            if (!hRows || hRows.length === 0) {
                return res.status(404).json({ mensagem: "Herói não encontrado no combate." });
            }

            const hero = hRows[0];
            if (!isMestre && hero.USUARIO_ID !== req.user.id) {
                return res.status(403).json({ mensagem: "Você só pode editar a vida, fadiga e armadura do seu próprio personagem." });
            }

            const novoPv = pvAtual !== undefined ? Number(pvAtual) : hero.PV_ATUAL;
            const novoPf = pfAtual !== undefined ? Number(pfAtual) : hero.PF_ATUAL;
            const novaArm = armaduraMarcada !== undefined ? Number(armaduraMarcada) : hero.ARMADURA_MARCADA;
            const novaEsp = esperanca !== undefined ? Number(esperanca) : hero.ESPERANCA;

            await pool.query(
                "UPDATE COMBATE_HEROIS SET PV_ATUAL = ?, PF_ATUAL = ?, ARMADURA_MARCADA = ? WHERE ID = ?",
                [novoPv, novoPf, novaArm, Number(id)]
            );

            // Sincronizar também na ficha principal do personagem (PERSONAGENS)
            await pool.query(
                "UPDATE PERSONAGENS SET PV_ATUAL = ?, PF_ATUAL = ?, ARMADURA_ATUAL = ?, ESPERANCA = ? WHERE ID = ?",
                [novoPv, novoPf, novaArm, novaEsp, Number(hero.PERSONAGEM_ID)]
            );

            return res.status(200).json({ mensagem: "Status do herói atualizado!" });
        }

        res.status(400).json({ mensagem: "Tipo inválido para atualização de combate." });
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
        res.status(500).json({ mensagem: "Erro ao atualizar status do combatente." });
    }
}

export async function limparArenaCombate(req, res) {
    try {
        await pool.query("DELETE FROM COMBATE_HEROIS");
        await pool.query("DELETE FROM COMBATE_CRIATURAS");
        res.status(200).json({ mensagem: "Arena de combate reiniciada com sucesso." });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao reiniciar arena." });
    }
}
