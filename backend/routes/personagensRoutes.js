import express from "express";
import jwt from "jsonwebtoken";
import {
    listarPersonagens,
    buscarPersonagemPorId,
    adicionarPersonagem,
    atualizarPersonagem,
    deletarPersonagem,
    listarDadosSistema
} from "../controllers/PersonagensController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "daggerheart_super_secret_jwt_key_2026";
const router = express.Router();

// Dados do sistema podem ser carregados para montar formulários
router.get("/dados-sistema", (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers["x-user-token"];
    if (authHeader) {
        try {
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
            req.user = jwt.verify(token, JWT_SECRET);
        } catch {
            // Token ausente ou inválido: prossegue sem perfil de mestre (filtra dados sensíveis)
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
