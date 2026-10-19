import cors from "cors";

const corsMiddleware = cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://localhost:3000"
    ]
});

export default corsMiddleware;
