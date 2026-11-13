import express from "express";
import {
    listarCampanhas,
    criarCampanha,
    deletarCampanha,
    listarPersonagensCampanha,
    adicionarPersonagemCampanha,
    removerPersonagemCampanha,
    listarCombatesCampanha,
    criarCombateCampanha,
    deletarCombateCampanha
} from "../controllers/campanhasController.js";
import { authMiddleware, requireMestre } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listarCampanhas);
router.post("/", requireMestre, criarCampanha);
router.delete("/:id", requireMestre, deletarCampanha);

router.get("/:id/personagens", listarPersonagensCampanha);
router.post("/:id/personagens", requireMestre, adicionarPersonagemCampanha);
router.delete("/:id/personagens/:personagemId", requireMestre, removerPersonagemCampanha);

router.get("/:id/combates", listarCombatesCampanha);
router.post("/:id/combates", requireMestre, criarCombateCampanha);
router.delete("/:id/combates/:combateId", requireMestre, deletarCombateCampanha);

export default router;
