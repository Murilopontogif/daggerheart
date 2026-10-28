// ==========================================================================
// DAGGERHEART - GERENCIAMENTO DE AUTENTICAÇÃO E SESSÃO (auth.js)
// ==========================================================================

const API_BASE = "";

function obterSessao() {
    const token = localStorage.getItem("dh_token");
    const usuarioRaw = localStorage.getItem("dh_usuario");
    if (!token || !usuarioRaw) return null;
    try {
        const usuario = JSON.parse(usuarioRaw);
        return { token, usuario };
    } catch {
        return null;
    }
}

function salvarSessao(token, usuario) {
    localStorage.setItem("dh_token", token);
    localStorage.setItem("dh_usuario", JSON.stringify(usuario));
}

function encerrarSessao() {
    localStorage.removeItem("dh_token");
    localStorage.removeItem("dh_usuario");
    window.location.href = "index.html";
}

function exigirAutenticacao(papelExigido = null, apenasPai = false) {
    const sessao = obterSessao();
    if (!sessao) {
        window.location.href = "index.html";
        return null;
    }

    if (apenasPai && !sessao.usuario.isPai) {
        alert("Acesso restrito à Conta Pai de Administração (mumu).");
        window.location.href = "personagens.html";
        return null;
    }

    if (papelExigido && sessao.usuario.papel !== papelExigido && !sessao.usuario.isPai) {
        alert(`Acesso restrito para usuários com perfil de ${papelExigido}.`);
        window.location.href = "personagens.html";
        return null;
    }

    return sessao;
}

// Helper para fazer requisições autenticadas
async function apiFetch(url, options = {}) {
    const sessao = obterSessao();
    const headers = options.headers || {};

    if (sessao && sessao.token) {
        headers["Authorization"] = `Bearer ${sessao.token}`;
    }

    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    options.headers = headers;

    const response = await fetch(url, options);

    if (response.status === 401) {
        encerrarSessao();
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    return response;
}
