import express from "express";
import {
    listarCampanhas,
    criarCampanha,
    atualizarCampanha,
    deletarCampanha,
    listarPersonagensCampanha,
    adicionarPersonagemCampanha,
    removerPersonagemCampanha,
    listarCombatesCampanha,
    criarCombateCampanha,
    atualizarCombateCampanha,
    deletarCombateCampanha
} from "../controllers/campanhasController.js";
import { authMiddleware, requireMestre } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listarCampanhas);
router.post("/", requireMestre, criarCampanha);
router.put("/:id", requireMestre, atualizarCampanha);
router.delete("/:id", requireMestre, deletarCampanha);

router.get("/:id/personagens", listarPersonagensCampanha);
router.post("/:id/personagens", requireMestre, adicionarPersonagemCampanha);
router.delete("/:id/personagens/:personagemId", requireMestre, removerPersonagemCampanha);

router.get("/:id/combates", listarCombatesCampanha);
router.post("/:id/combates", requireMestre, criarCombateCampanha);
router.put("/:id/combates/:combateId", requireMestre, atualizarCombateCampanha);
router.delete("/:id/combates/:combateId", requireMestre, deletarCombateCampanha);

export default router;
