import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import personagensRoutes from "./routes/personagensRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import criaturasRoutes from "./routes/criaturasRoutes.js";
import combateRoutes from "./routes/combateRoutes.js";
import corsMiddleware from "./middlewares/corsMiddleware.js";
import { testarconexao } from "./database/conexao.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "../frontend")));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/criaturas", criaturasRoutes);
app.use("/api/combate", combateRoutes);
app.use("/personagens", personagensRoutes);

app.get("/api/status", function (req, res) {
    res.status(200).json({ mensagem: "API do Daggerheart - Gerenciador de Fichas e Combate funcionando" });
});

async function iniciarservidor() {
    try {
        await testarconexao();
        app.listen(PORT, function () {
            console.log(`servidor rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log("Não foi possível iniciar o servidor");
        console.log(error.message);
    }
}

iniciarservidor();
