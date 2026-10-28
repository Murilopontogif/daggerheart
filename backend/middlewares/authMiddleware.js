import { pool } from "../database/conexao.js";

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers["x-user-token"];
    if (!authHeader) {
        return res.status(401).json({ mensagem: "Acesso não autorizado. Faça login primeiro." });
    }

    try {
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));

        if (!decoded || !decoded.id || !decoded.login) {
            return res.status(401).json({ mensagem: "Token de autenticação inválido." });
        }

        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ mensagem: "Falha ao validar sessão de login." });
    }
}

export function requireMestre(req, res, next) {
    if (!req.user || req.user.papel !== "mestre") {
        return res.status(403).json({ mensagem: "Acesso restrito ao Mestre." });
    }
    next();
}

export function requirePai(req, res, next) {
    if (!req.user || req.user.login !== "mumu") {
        return res.status(403).json({ mensagem: "Acesso restrito à Conta Pai de Administração (mumu)." });
    }
    next();
}
