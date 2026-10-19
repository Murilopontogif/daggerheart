import express from "express";
import {
    listarPersonagens,
    buscarPersonagemPorId,
    adicionarPersonagem,
    atualizarPersonagem,
    deletarPersonagem,
    listarDadosSistema
} from "../controllers/PersonagensController.js";

const router = express.Router();

router.get("/dados-sistema", listarDadosSistema);
router.get("/", listarPersonagens);
router.get("/:id", buscarPersonagemPorId);
router.post("/", adicionarPersonagem);
router.put("/:id", atualizarPersonagem);
router.delete("/:id", deletarPersonagem);

export default router;

