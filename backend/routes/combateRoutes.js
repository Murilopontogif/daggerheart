import express from "express";
import {
    obterEstadoCombate,
    atualizarMedoCombate,
    adicionarHeroiCombate,
    adicionarCriaturaCombate,
    removerParticipanteCombate,
    atualizarStatusCombate,
    limparArenaCombate
} from "../controllers/combateController.js";
import { authMiddleware, requireMestre } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/estado", obterEstadoCombate);
router.patch("/medo", requireMestre, atualizarMedoCombate);
router.post("/adicionar-heroi", adicionarHeroiCombate);
router.post("/adicionar-criatura", requireMestre, adicionarCriaturaCombate);
router.delete("/remover/:tipo/:id", removerParticipanteCombate);
router.patch("/atualizar-status", atualizarStatusCombate);
router.post("/limpar", requireMestre, limparArenaCombate);

export default router;
