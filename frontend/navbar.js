// ==========================================================================
// DAGGERHEART - NAVBAR GLOBAL, BANNER HERO & MODAL LGPD (navbar.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const sessao = obterSessao();
    if (!sessao) return;

    const currentPage = window.location.pathname.split("/").pop() || "personagens.html";
    const navContainer = document.getElementById("globalNavbarContainer");
    if (!navContainer) return;

    const isMestre = sessao.usuario.papel === "mestre";
    const isPai = sessao.usuario.isPai;

    const navHtml = `
    <header class="hero-header">
        <div class="hero-banner-wrapper">
            <img src="banner.avif" alt="Daggerheart Banner" class="hero-banner-img" onerror="this.style.display='none'">
            <div class="banner-gradient"></div>
        </div>
        <div class="hero-content" style="max-width: 100%; width: 100%;">
            <div class="hero-top-bar">
                <div class="brand-badge" style="margin-bottom: 0;">
                    <span class="pulse-dot"></span>
                    <i class="fa-solid fa-dice-d20"></i>
                    <span>SISTEMA OFICIAL VTT</span>
                </div>

                <div class="user-session-pill">
                    <span class="user-session-name">
                        <i class="fa-solid fa-user-astronaut"></i>
                        ${sessao.usuario.login}
                    </span>
                    <span class="${isMestre ? "badge-mestre" : "badge-player"}">
                        <i class="fa-solid ${isMestre ? "fa-crown" : "fa-shield-halved"}"></i>
                        ${isMestre ? "Mestre" : "Jogador"}
                    </span>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="abrirModalLgpd()" title="Normas da LGPD e Privacidade" style="padding: 5px 10px; font-size: 0.75rem;">
                        <i class="fa-solid fa-scale-balanced"></i> LGPD
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="encerrarSessao()" title="Desconectar da Mesa" style="padding: 5px 10px; font-size: 0.75rem; border-color: rgba(239,68,68,0.4); color: #fca5a5;">
                        <i class="fa-solid fa-right-from-bracket"></i> Sair
                    </button>
                </div>
            </div>

            <h1>Dagger<span>heart</span></h1>
            <p>Gerenciador de Fichas Completas, Inventário, Cartas de Domínio e Arena de Combate Sincronizada.</p>

            <!-- Navegação Principal (Abas Separadas) -->
            <div class="app-mode-tabs">
                <a href="personagens.html" class="mode-tab-btn ${currentPage === "personagens.html" ? "active" : ""}">
                    <i class="fa-solid fa-users-viewfinder"></i>
                    <span>Visualizar Personagens</span>
                </a>
                <a href="criar-ficha.html" class="mode-tab-btn ${currentPage === "criar-ficha.html" ? "active" : ""}">
                    <i class="fa-solid fa-scroll"></i>
                    <span>Criar Ficha Grandona</span>
                </a>
                <a href="combate.html" class="mode-tab-btn ${currentPage === "combate.html" ? "active" : ""}">
                    <i class="fa-solid fa-swords"></i>
                    <span>Arena de Combate</span>
                </a>
                ${isMestre ? `
                <a href="criaturas.html" class="mode-tab-btn ${currentPage === "criaturas.html" ? "active" : ""}">
                    <i class="fa-solid fa-dragon"></i>
                    <span>Bestiário & Criar Criaturas</span>
                </a>` : ""}
                ${isPai ? `
                <a href="admin.html" class="mode-tab-btn ${currentPage === "admin.html" ? "active" : ""}">
                    <i class="fa-solid fa-key"></i>
                    <span>Contas & Senhas (Pai)</span>
                </a>` : ""}
            </div>
        </div>
    </header>

    <!-- MODAL LGPD & POLÍTICA DE PRIVACIDADE -->
    <div id="modalLgpdGlobal" class="sheet-modal-backdrop" style="display: none; z-index: 99999;">
        <div class="sheet-modal-dialog" style="max-width: 640px; height: auto; max-height: 85vh;">
            <div class="sheet-modal-topbar">
                <span class="sheet-tag"><i class="fa-solid fa-scale-balanced"></i> Política de Privacidade & Normas da LGPD</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="fecharModalLgpd()">
                    <i class="fa-solid fa-xmark"></i> Fechar
                </button>
            </div>
            <div class="sheet-paper" style="gap: 14px; font-size: 0.9rem; line-height: 1.6;">
                <p><strong>1. Finalidade do Tratamento:</strong> Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), seus dados (apenas nome de login, senha da mesa e fichas de RPG) são tratados exclusivamente para autenticação de sessão e armazenamento dos personagens da mesa.</p>
                <p><strong>2. Minimização de Dados:</strong> O sistema não solicita nem armazena quaisquer dados pessoais sensíveis (como CPF, endereço, telefone, e-mail ou dados bancários).</p>
                <p><strong>3. Armazenamento e Acesso:</strong> Suas fichas ficam salvas de forma restrita ao criador da conta e ao Mestre da mesa para condução da narrativa e combates.</p>
                <p><strong>4. Seus Direitos (Art. 18 da LGPD):</strong> Você tem o direito de consultar, corrigir e solicitar a exclusão total e permanente de sua conta e de todos os seus dados a qualquer momento.</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; margin-top: 6px;">
                    ${!isPai ? `
                    <button type="button" class="btn btn-secondary btn-sm" style="border-color: rgba(239,68,68,0.5); color: #fca5a5;" onclick="confirmarExclusaoContaLgpd()">
                        <i class="fa-solid fa-trash-can"></i> Excluir Minha Conta e Fichas (LGPD)
                    </button>` : `<span></span>`}
                    <button type="button" class="btn btn-primary btn-sm" onclick="fecharModalLgpd()">
                        <i class="fa-solid fa-check"></i> Entendido
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    navContainer.innerHTML = navHtml;
});

function abrirModalLgpd() {
    const m = document.getElementById("modalLgpdGlobal");
    if (m) m.style.display = "flex";
}

function fecharModalLgpd() {
    const m = document.getElementById("modalLgpdGlobal");
    if (m) m.style.display = "none";
}

async function confirmarExclusaoContaLgpd() {
    if (confirm("ATENÇÃO (LGPD - Direito ao Esquecimento):\n\nDeseja realmente excluir permanentemente sua conta e todas as fichas associadas a ela? Esta ação não pode ser desfeita.")) {
        try {
            const res = await apiFetch("/api/auth/minha-conta", { method: "DELETE" });
            const data = await res.json();
            alert(data.mensagem || "Conta excluída com sucesso.");
            encerrarSessao();
        } catch (err) {
            alert("Erro ao excluir conta: " + err.message);
        }
    }
}
