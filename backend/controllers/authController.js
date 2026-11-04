import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../database/conexao.js";

const JWT_SECRET = process.env.JWT_SECRET || "daggerheart_super_secret_jwt_key_2026";

function gerarToken(usuario) {
    const payload = {
        id: usuario.ID,
        login: usuario.LOGIN,
        papel: usuario.PAPEL,
        isPai: usuario.LOGIN.toLowerCase() === "mumu"
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
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

        // Verificação segura de senha com suporte a bcrypt e migração transparente de texto puro
        let senhaValida = false;
        if (usuario.SENHA && (usuario.SENHA.startsWith("$2a$") || usuario.SENHA.startsWith("$2b$") || usuario.SENHA.startsWith("$2y$"))) {
            senhaValida = await bcrypt.compare(senha, usuario.SENHA);
        } else {
            // Comparação direta para senhas legadas em texto puro
            senhaValida = (usuario.SENHA === senha);
            if (senhaValida) {
                // Atualização automática e segura para hash bcrypt
                try {
                    const novoHash = await bcrypt.hash(senha, 10);
                    await pool.query("UPDATE USUARIOS SET SENHA = ? WHERE ID = ?", [novoHash, usuario.ID]);
                    usuario.SENHA = novoHash;
                } catch (e) {
                    console.warn("Aviso ao atualizar senha para hash:", e.message);
                }
            }
        }

        if (!senhaValida) {
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

export async function cadastrarUsuario(req, res) {
    try {
        const { login, senha, papel = "player", lgpdAceite = true } = req.body;

        if (!login || !login.trim()) {
            return res.status(400).json({ mensagem: "Informe o nome de usuário (login)." });
        }

        if (!senha || senha.length < 4) {
            return res.status(400).json({ mensagem: "A senha deve conter no mínimo 4 caracteres." });
        }

        if (!lgpdAceite) {
            return res.status(400).json({ mensagem: "Você deve aceitar os termos da LGPD para se cadastrar." });
        }

        const loginFormatado = login.trim();

        if (loginFormatado.toLowerCase() === "mumu") {
            return res.status(400).json({ mensagem: "O nome de usuário 'mumu' é reservado à Conta Pai." });
        }

        const [existente] = await pool.query(
            "SELECT ID FROM USUARIOS WHERE LOWER(LOGIN) = LOWER(?)",
            [loginFormatado]
        );

        if (existente && existente.length > 0) {
            return res.status(409).json({ mensagem: "Este nome de usuário já está cadastrado. Escolha outro." });
        }

        const papelValido = papel.toLowerCase() === "mestre" ? "mestre" : "player";
        const hashSenha = await bcrypt.hash(senha, 10);

        const [resultado] = await pool.query(
            "INSERT INTO USUARIOS (LOGIN, SENHA, PAPEL, LGPD_ACEITE) VALUES (?, ?, ?, 1)",
            [loginFormatado, hashSenha, papelValido]
        );

        const novoUsuario = {
            ID: resultado.insertId,
            LOGIN: loginFormatado,
            PAPEL: papelValido
        };

        const token = gerarToken(novoUsuario);

        res.status(201).json({
            mensagem: `Conta '${loginFormatado}' criada com sucesso!`,
            token,
            usuario: {
                id: novoUsuario.ID,
                login: novoUsuario.LOGIN,
                papel: novoUsuario.PAPEL,
                isPai: false,
                lgpdAceite: true
            }
        });
    } catch (err) {
        console.error("Erro ao cadastrar usuário:", err);
        res.status(500).json({ mensagem: "Erro interno no servidor ao cadastrar usuário." });
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
        const hashSenha = await bcrypt.hash(senha, 10);

        const [resultado] = await pool.query(
            "INSERT INTO USUARIOS (LOGIN, SENHA, PAPEL, LGPD_ACEITE) VALUES (?, ?, ?, ?)",
            [login.trim(), hashSenha, papelValido, lgpdAceite ? 1 : 0]
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
