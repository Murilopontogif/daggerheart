import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "daggerheart_super_secret_jwt_key_2026";

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers["x-user-token"];
    if (!authHeader) {
        return res.status(401).json({ mensagem: "Acesso não autorizado. Faça login primeiro." });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded || !decoded.id || !decoded.login) {
            return res.status(401).json({ mensagem: "Token de autenticação inválido." });
        }

        req.user = decoded;
        return next();
    } catch (err) {
        // Fallback transitório de compatibilidade para tokens antigos em Base64
        try {
            const legacyDecoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
            if (legacyDecoded && legacyDecoded.id && legacyDecoded.login) {
                req.user = legacyDecoded;
                return next();
            }
        } catch {}

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ mensagem: "Sua sessão expirou. Faça login novamente." });
        }
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
    if (!req.user || req.user.login.toLowerCase() !== "mumu") {
        return res.status(403).json({ mensagem: "Acesso restrito à Conta Pai de Administração (mumu)." });
    }
    next();
}
