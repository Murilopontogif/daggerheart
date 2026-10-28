import { pool } from "../database/conexao.js";

function gerarToken(usuario) {
    const payload = {
        id: usuario.ID,
        login: usuario.LOGIN,
        papel: usuario.PAPEL,
        isPai: usuario.LOGIN.toLowerCase() === "mumu",
        criadoEm: Date.now()
    };
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export async function login(req, res) {
    try {
        const { login, senha, lgpdAceite } = req.body;

        if (!login || !senha) {
            return res.status(400).json({ mensagem: "Informe o login e a senha." });
        }

        const [usuarios] = await pool.query(
            "SELECT * FROM USUARIOS WHERE LOWER(LOGIN) = LOWER(?)",
            [login.trim()]
        );

        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ mensagem: "Credenciais inválidas. Verifique seu login e senha." });
        }

        const usuario = usuarios[0];

        if (usuario.SENHA !== senha) {
            return res.status(401).json({ mensagem: "Credenciais inválidas. Verifique seu login e senha." });
        }

        if (lgpdAceite) {
            await pool.query("UPDATE USUARIOS SET LGPD_ACEITE = 1 WHERE ID = ?", [usuario.ID]);
            usuario.LGPD_ACEITE = 1;
        }

        const token = gerarToken(usuario);

        res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.ID,
                login: usuario.LOGIN,
                papel: usuario.PAPEL,
                isPai: usuario.LOGIN.toLowerCase() === "mumu",
                lgpdAceite: Boolean(usuario.LGPD_ACEITE)
            }
        });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ mensagem: "Erro interno no servidor ao realizar login." });
    }
}

export async function me(req, res) {
    try {
        const [usuarios] = await pool.query("SELECT ID, LOGIN, PAPEL, LGPD_ACEITE FROM USUARIOS WHERE ID = ?", [req.user.id]);
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }
        const u = usuarios[0];
        res.status(200).json({
            usuario: {
                id: u.ID,
                login: u.LOGIN,
                papel: u.PAPEL,
                isPai: u.LOGIN.toLowerCase() === "mumu",
                lgpdAceite: Boolean(u.LGPD_ACEITE)
            }
        });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao buscar perfil." });
    }
}

export async function listarUsuarios(req, res) {
    try {
        const [usuarios] = await pool.query(
            "SELECT ID, LOGIN, SENHA, PAPEL, LGPD_ACEITE, DATA_CRIACAO FROM USUARIOS ORDER BY ID ASC"
        );
        res.status(200).json(usuarios);
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).json({ mensagem: "Erro ao carregar lista de usuários." });
    }
}

export async function criarUsuario(req, res) {
    try {
        const { login, senha, papel = "player", lgpdAceite = 1 } = req.body;

        if (!login || !senha) {
            return res.status(400).json({ mensagem: "Preencha o login e a senha para criar o usuário." });
        }

        const [existente] = await pool.query(
            "SELECT ID FROM USUARIOS WHERE LOWER(LOGIN) = LOWER(?)",
            [login.trim()]
        );

        if (existente && existente.length > 0) {
            return res.status(409).json({ mensagem: "Já existe um usuário cadastrado com este login." });
        }

        const papelValido = papel.toLowerCase() === "mestre" ? "mestre" : "player";

        const [resultado] = await pool.query(
            "INSERT INTO USUARIOS (LOGIN, SENHA, PAPEL, LGPD_ACEITE) VALUES (?, ?, ?, ?)",
            [login.trim(), senha, papelValido, lgpdAceite ? 1 : 0]
        );

        res.status(201).json({
            mensagem: `Usuário '${login.trim()}' (${papelValido}) criado com sucesso!`,
            id: resultado.insertId
        });
    } catch (err) {
        console.error("Erro ao criar usuário:", err);
        res.status(500).json({ mensagem: "Erro ao criar usuário." });
    }
}

export async function deletarUsuario(req, res) {
    try {
        const id = Number(req.params.id);

        const [alvo] = await pool.query("SELECT * FROM USUARIOS WHERE ID = ?", [id]);
        if (!alvo || alvo.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        if (alvo[0].LOGIN.toLowerCase() === "mumu") {
            return res.status(403).json({ mensagem: "A conta pai 'mumu' não pode ser deletada." });
        }

        // LGPD: deletar fichas associadas ao usuário
        await pool.query("DELETE FROM PERSONAGENS WHERE USUARIO_ID = ?", [id]);
        await pool.query("DELETE FROM USUARIOS WHERE ID = ?", [id]);

        res.status(200).json({ mensagem: "Conta e dados do usuário removidos com sucesso (LGPD)." });
    } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        res.status(500).json({ mensagem: "Erro ao deletar usuário." });
    }
}

export async function lgpdExcluirMinhaConta(req, res) {
    try {
        const id = req.user.id;
        if (req.user.login.toLowerCase() === "mumu") {
            return res.status(403).json({ mensagem: "A conta pai 'mumu' não pode ser autoexcluída." });
        }

        await pool.query("DELETE FROM PERSONAGENS WHERE USUARIO_ID = ?", [id]);
        await pool.query("DELETE FROM USUARIOS WHERE ID = ?", [id]);

        res.status(200).json({ mensagem: "Sua conta e todas as suas fichas foram permanentemente excluídas conforme a LGPD." });
    } catch (err) {
        res.status(500).json({ mensagem: "Erro ao excluir conta." });
    }
}
