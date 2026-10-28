import express from "express";
import {
    listarPersonagens,
    buscarPersonagemPorId,
    adicionarPersonagem,
    atualizarPersonagem,
    deletarPersonagem,
    listarDadosSistema
} from "../controllers/PersonagensController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Dados do sistema podem ser carregados para montar formulários
router.get("/dados-sistema", (req, res, next) => {
    // Tenta autenticar se o token estiver presente, mas não bloqueia se não estiver
    const authHeader = req.headers.authorization || req.headers["x-user-token"];
    if (authHeader) {
        try {
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
            req.user = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
        } catch {
            // ignora
        }
    }
    next();
}, listarDadosSistema);

// Todas as rotas de personagens requerem usuário autenticado
router.use(authMiddleware);

router.get("/", listarPersonagens);
router.get("/:id", buscarPersonagemPorId);
router.post("/", adicionarPersonagem);
router.put("/:id", atualizarPersonagem);
router.delete("/:id", deletarPersonagem);

export default router;
