// ==========================================================================
// DAGGERHEART - PAINEL ADMINISTRATIVO DA CONTA PAI (admin.js)
// ==========================================================================

const sessao = exigirAutenticacao(null, true);
if (!sessao) throw new Error("Acesso restrito à Conta Pai.");

document.addEventListener("DOMContentLoaded", async () => {
    await carregarUsuarios();
    configurarFormCriacaoUsuario();
});

async function carregarUsuarios() {
    const tbody = document.getElementById("tabelaUsuariosCorpo");
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Carregando contas...</td></tr>`;

    try {
        const res = await apiFetch("/api/auth/usuarios");
        if (!res.ok) throw new Error("Erro ao carregar lista de usuários.");

        const usuarios = await res.json();
        document.getElementById("contagemUsuarios").textContent = `${usuarios.length} ${usuarios.length === 1 ? "Conta" : "Contas"}`;
        renderizarTabelaUsuarios(usuarios);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #fca5a5; padding: 24px;">${err.message}</td></tr>`;
    }
}

function renderizarTabelaUsuarios(lista) {
    const tbody = document.getElementById("tabelaUsuariosCorpo");

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Nenhuma conta cadastrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(u => {
        const isMumu = u.LOGIN.toLowerCase() === "mumu";
        const badgePapel = u.PAPEL === "mestre"
            ? `<span class="badge-mestre"><i class="fa-solid fa-crown"></i> Mestre</span>`
            : `<span class="badge-player"><i class="fa-solid fa-shield-halved"></i> Player</span>`;

        return `
            <tr>
                <td><strong style="color: var(--accent-gold);">#${u.ID}</strong></td>
                <td>
                    <strong>${u.LOGIN}</strong>
                    ${isMumu ? `<span class="subclass-badge" style="margin-left: 6px;"><i class="fa-solid fa-star"></i> Conta Pai</span>` : ""}
                </td>
                <td>
                    <code style="background: rgba(0,0,0,0.55); border: 1px solid rgba(251,191,36,0.35); color: var(--accent-gold); padding: 4px 10px; border-radius: 6px; font-weight: 800;">
                        ${u.SENHA}
                    </code>
                </td>
                <td>${badgePapel}</td>
                <td>
                    <span class="c-quick-stat" style="color: #6ee7b7; border-color: rgba(16,185,129,0.35);">
                        <i class="fa-solid fa-check-circle"></i> Consentido
                    </span>
                </td>
                <td>
                    ${isMumu
                        ? `<span style="color: var(--text-dim); font-size: 0.78rem;"><i class="fa-solid fa-lock"></i> Conta Raiz</span>`
                        : `<button type="button" class="square-btn square-btn-delete" onclick="deletarConta(${u.ID}, '${u.LOGIN.replace(/'/g, "\\'")}')" style="padding: 6px 12px;">
                               <i class="fa-solid fa-trash-can"></i> Excluir
                           </button>`
                    }
                </td>
            </tr>
        `;
    }).join("");
}

function configurarFormCriacaoUsuario() {
    const form = document.getElementById("formCriarUsuario");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const login = document.getElementById("novoUserLogin").value.trim();
        const senha = document.getElementById("novoUserSenha").value;
        const papel = document.getElementById("novoUserPapel").value;

        const btn = document.getElementById("btnSubmitNovoUser");
        btn.disabled = true;

        try {
            const res = await apiFetch("/api/auth/usuarios", {
                method: "POST",
                body: { login, senha, papel, lgpdAceite: true }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || "Erro ao cadastrar usuário.");

            mostrarMensagemAdmin(`Conta "${login}" (${papel}) criada com sucesso!`, "success");
            form.reset();
            await carregarUsuarios();
        } catch (err) {
            mostrarMensagemAdmin(`Erro: ${err.message}`, "error");
        } finally {
            btn.disabled = false;
        }
    });
}

async function deletarConta(id, login) {
    if (!confirm(`ATENÇÃO (LGPD):\n\nDeseja realmente excluir a conta "${login}" e todas as suas fichas associadas? Esta ação é irreversível.`)) {
        return;
    }

    try {
        const res = await apiFetch(`/api/auth/usuarios/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir conta.");

        mostrarMensagemAdmin(`Conta "${login}" excluída com sucesso.`, "success");
        await carregarUsuarios();
    } catch (err) {
        mostrarMensagemAdmin(`Erro: ${err.message}`, "error");
    }
}

function mostrarMensagemAdmin(msg, tipo = "info") {
    const container = document.getElementById("statusContainer");
    const el = document.getElementById("mensagemAdmin");
    if (!container || !el) return;

    container.style.display = "block";
    el.innerHTML = `<i class="fa-solid ${tipo === "error" ? "fa-triangle-exclamation" : "fa-circle-check"}"></i> <span>${msg}</span>`;
    setTimeout(() => { container.style.display = "none"; }, 4500);
}
