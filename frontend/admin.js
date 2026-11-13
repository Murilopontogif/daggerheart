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

        const senhaDisplay = `
            <span title="Protegida com bcrypt no banco; senhas nunca são retornadas pela API" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.35); color: #6ee7b7; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 700;">
                <i class="fa-solid fa-shield-halved"></i> Hash bcrypt (Oculta)
            </span>`;

        const controlePapel = isMumu
            ? badgePapel
            : `<div style="display: inline-flex; align-items: center; gap: 8px;">
                   ${badgePapel}
                   <button type="button" class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.72rem;" onclick="alternarPapelConta(${u.ID}, '${u.LOGIN.replace(/'/g, "\\'")}', '${u.PAPEL}')" title="Alternar entre Jogador e Mestre">
                       <i class="fa-solid fa-repeat"></i> Alternar
                   </button>
               </div>`;

        return `
            <tr>
                <td><strong style="color: var(--accent-gold);">#${u.ID}</strong></td>
                <td>
                    <strong>${u.LOGIN}</strong>
                    ${isMumu ? `<span class="subclass-badge" style="margin-left: 6px;"><i class="fa-solid fa-star"></i> Conta Pai</span>` : ""}
                </td>
                <td>${senhaDisplay}</td>
                <td>${controlePapel}</td>
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

async function alternarPapelConta(id, login, papelAtual) {
    const novoPapel = papelAtual === "mestre" ? "player" : "mestre";
    try {
        const res = await apiFetch(`/api/auth/usuarios/${id}/papel`, {
            method: "PUT",
            body: { papel: novoPapel }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao alterar perfil.");

        mostrarMensagemAdmin(`Perfil de "${login}" atualizado para ${novoPapel.toUpperCase()}!`, "success");
        await carregarUsuarios();
    } catch (err) {
        mostrarMensagemAdmin(`Erro: ${err.message}`, "error");
    }
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

            mostrarMensagemAdmin(`Conta "${login}" (${papel}) criada com sucesso e protegida com bcrypt!`, "success");
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
    const confirmou = confirm(`ATENÇÃO - LGPD:\n\nTem certeza que deseja excluir permanentemente a conta de "${login}"?\n\nTodas as fichas de personagens associadas a esta conta serão excluídas do banco de dados.`);
    if (!confirmou) return;

    try {
        const res = await apiFetch(`/api/auth/usuarios/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir conta.");

        mostrarMensagemAdmin(`Conta de "${login}" e suas fichas associadas foram excluídas com sucesso.`, "success");
        await carregarUsuarios();
    } catch (err) {
        mostrarMensagemAdmin(`Erro ao excluir: ${err.message}`, "error");
    }
}

function mostrarMensagemAdmin(texto, tipo = "success") {
    const container = document.getElementById("statusContainer");
    const p = document.getElementById("mensagemAdmin");

    p.className = `status-badge ${tipo === "success" ? "status-online" : "status-offline"}`;
    p.textContent = texto;
    container.style.display = "block";

    setTimeout(() => {
        container.style.display = "none";
    }, 4500);
}
