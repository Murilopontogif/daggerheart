import express from "express";
import {
    login,
    me,
    listarUsuarios,
    criarUsuario,
    deletarUsuario,
    lgpdExcluirMinhaConta
} from "../controllers/authController.js";
import { authMiddleware, requirePai } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, me);
router.delete("/minha-conta", authMiddleware, lgpdExcluirMinhaConta);

// Rotas restritas da Conta Pai (mumu)
router.get("/usuarios", authMiddleware, requirePai, listarUsuarios);
router.post("/usuarios", authMiddleware, requirePai, criarUsuario);
router.delete("/usuarios/:id", authMiddleware, requirePai, deletarUsuario);

export default router;
