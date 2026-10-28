import express from "express";
import {
    listarCriaturas,
    buscarCriaturaPorId,
    criarCriatura,
    atualizarCriatura,
    deletarCriatura
} from "../controllers/criaturasController.js";
import { authMiddleware, requireMestre } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listarCriaturas);
router.get("/:id", buscarCriaturaPorId);
router.post("/", requireMestre, criarCriatura);
router.put("/:id", requireMestre, atualizarCriatura);
router.delete("/:id", requireMestre, deletarCriatura);

export default router;
