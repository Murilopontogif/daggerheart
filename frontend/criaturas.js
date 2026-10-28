// ==========================================================================
// DAGGERHEART - BESTIÁRIO OFICIAL & CRIADOR DE CRIATURAS (criaturas.js)
// ==========================================================================

const sessao = exigirAutenticacao("mestre");
if (!sessao) throw new Error("Acesso restrito ao Mestre.");

let todasCriaturas = [];

document.addEventListener("DOMContentLoaded", async () => {
    adicionarLinhaHabilidadeCriatura("Investida Brutal", "Ação", "Gaste 1 Medo para avançar e realizar um ataque contra todos os alvos próximos.");
    await carregarBestiario();
    configurarFormCriacao();
});

async function carregarBestiario() {
    const grid = document.getElementById("gridBestiario");
    grid.innerHTML = `<div class="combat-empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><h4>Carregando Bestiário Oficial...</h4></div>`;

    try {
        const res = await apiFetch("/api/criaturas");
        if (!res.ok) throw new Error("Falha ao buscar criaturas.");

        todasCriaturas = await res.json();
        filtrarBestiario();
    } catch (err) {
        grid.innerHTML = `<div class="combat-empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><h4>${err.message}</h4></div>`;
    }
}

function filtrarBestiario() {
    const tier = document.getElementById("filtroTier").value;
    const papel = document.getElementById("filtroPapel").value;
    const busca = (document.getElementById("filtroNome").value || "").toLowerCase().trim();

    const filtradas = todasCriaturas.filter(c => {
        const cTier = String(c.patamar || c.tier || 1);
        const cRole = c.papel || c.role || "";
        const cName = (c.nome || c.name || "").toLowerCase();
        const cTac = (c.taticas || c.tactics || "").toLowerCase();

        if (tier && cTier !== tier) return false;
        if (papel && !cRole.toLowerCase().includes(papel.toLowerCase())) return false;
        if (busca && !cName.includes(busca) && !cTac.includes(busca) && !cRole.toLowerCase().includes(busca)) return false;
        return true;
    });

    const lbl = document.getElementById("bestiaryCountLabel");
    if (lbl) {
        lbl.textContent = `Exibindo ${filtradas.length} de ${todasCriaturas.length} criaturas cadastradas no Bestiário`;
    }

    renderizarGridCriaturas(filtradas);
}

function renderizarGridCriaturas(lista) {
    const grid = document.getElementById("gridBestiario");

    if (!lista || lista.length === 0) {
        grid.innerHTML = `
            <div class="combat-empty-state" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-dragon fa-2x"></i>
                <h4>Nenhuma Criatura Encontrada</h4>
                <p>Tente ajustar os filtros ou clique em "Criar Nova Criatura" para forjar seu próprio monstro.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = lista.map(m => {
        const id = m.id || m.ID;
        const nome = m.nome || m.name || "Criatura";
        const patamar = m.patamar || m.tier || 1;
        const papel = m.papel || m.role || "Padrão";
        const dif = m.dificuldade || m.difficulty || 12;
        const pv = m.pvMaximo || m.hpMax || 4;
        const pf = m.pfMaximo || m.stressMax || 2;
        const limiares = m.limiares || m.thresholds || "—";
        const atqBonus = m.bonusAtaque || m.atkBonus || "+0";
        const atqNome = m.nomeAtaque || m.attackName || "Ataque";
        const atqDano = m.danoAtaque || m.attackDamage || "1d6";
        const taticas = m.taticas || m.tactics || "";
        const img = m.imagem || m.image || "img/enemies/placeholder.png";
        const habs = Array.isArray(m.habilidades) ? m.habilidades : (Array.isArray(m.abilities) ? m.abilities : []);

        return `
            <div class="bestiary-card-ui">
                <div>
                    <div class="bestiary-card-top">
                        <div class="bestiary-thumb-wrap">
                            <img src="${img}" alt="${nome}" class="bestiary-thumb-img" onerror="this.src='img/enemies/placeholder.png'">
                            <span class="bestiary-tier-pill">PATAMAR ${patamar}</span>
                        </div>
                        <div class="bestiary-head-info">
                            <div class="bestiary-role-line">
                                <span class="enemy-role-tag">${papel}</span>
                                <span class="enemy-diff-tag">Dif. ${dif}</span>
                            </div>
                            <h4>${nome}</h4>
                            ${taticas ? `<p class="bestiary-flavor"><em>Táticas:</em> ${taticas}</p>` : ""}
                        </div>
                    </div>

                    <div class="bestiary-stats-strip">
                        <span><i class="fa-solid fa-heart"></i> <strong>PV:</strong> ${pv}</span>
                        <span><i class="fa-solid fa-bolt"></i> <strong>PF:</strong> ${pf}</span>
                        <span><i class="fa-solid fa-burst"></i> <strong>Limiares:</strong> ${limiares}</span>
                        <span><i class="fa-solid fa-gavel"></i> <strong>${atqNome} (${atqBonus}):</strong> ${atqDano}</span>
                    </div>

                    <div class="bestiary-abilities-scroll">
                        ${habs.length > 0 ? habs.map(h => {
                            const tipo = h.tipo || h.type || "Ação";
                            const tipoLow = tipo.toLowerCase();
                            const bClass = tipoLow.includes("passiv") ? "ab-passiva" : (tipoLow.includes("rea") ? "ab-reacao" : "ab-acao");
                            const nomeHab = h.nome || h.name || "Habilidade";
                            const descHab = h.descricao || h.description || h.efeito || "";
                            return `
                                <div class="bestiary-ab-item">
                                    <span class="ab-badge ${bClass}">${tipo}</span>
                                    <strong>${nomeHab}:</strong> ${descHab}
                                </div>
                            `;
                        }).join("") : `<div class="bestiary-ab-item" style="color: var(--text-dim);">Sem habilidades especiais listadas.</div>`}
                    </div>
                </div>

                <div class="bestiary-card-footer">
                    <button type="button" class="btn-card-action" onclick="abrirModalDetalhesCriatura(${id})" title="Ver ficha completa e todas as habilidades">
                        <i class="fa-solid fa-eye"></i> Detalhes & Habilidades
                    </button>
                    <div class="qty-picker">
                        <label>QTD</label>
                        <input type="number" id="qtyBestiary_${id}" value="1" min="1" max="10">
                    </div>
                    <button type="button" class="btn-card-action btn-card-equip" onclick="enviarMonstroParaCombate(${id}, '${nome.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-swords"></i> Ao Combate
                    </button>
                    <button type="button" class="btn-icon-action danger" onclick="deletarCriatura(${id}, '${nome.replace(/'/g, "\\'")}')" title="Excluir do Bestiário">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

async function enviarMonstroParaCombate(inimigoId, nome) {
    const qtyInput = document.getElementById(`qtyBestiary_${inimigoId}`);
    const quantidade = qtyInput ? (Number(qtyInput.value) || 1) : 1;

    try {
        const res = await apiFetch("/api/combate/adicionar-criatura", {
            method: "POST",
            body: { inimigoId, quantidade }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao adicionar.");

        mostrarFeedback(`⚔️ ${quantidade}x ${nome} enviado(s) para a Arena de Combate!`, "success");
    } catch (err) {
        mostrarFeedback("Erro: " + err.message, "error");
    }
}

async function deletarCriatura(id, nome) {
    if (!confirm(`Deseja realmente remover "${nome}" do Bestiário?`)) return;

    try {
        const res = await apiFetch(`/api/criaturas/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.mensagem || "Erro ao deletar.");
        }
        mostrarFeedback(`Criatura "${nome}" removida com sucesso.`, "success");
        await carregarBestiario();
    } catch (err) {
        mostrarFeedback("Erro: " + err.message, "error");
    }
}

// ==========================================================================
// MODAL DE CRIAÇÃO DE NOVA CRIATURA
// ==========================================================================

function abrirModalNovaCriatura() {
    document.getElementById("modalCriarCriatura").style.display = "flex";
}

function fecharModalNovaCriatura() {
    document.getElementById("modalCriarCriatura").style.display = "none";
}

function setImagemPresetCriatura(url) {
    document.getElementById("cImagem").value = url;
    atualizarPreviewCriatura();
}

function atualizarPreviewCriatura() {
    const url = document.getElementById("cImagem").value.trim();
    const img = document.getElementById("cPreviewImg");
    const ph = document.getElementById("cPreviewPlaceholder");
    if (url) {
        img.src = url;
        img.style.display = "block";
        ph.style.display = "none";
    } else {
        img.style.display = "none";
        ph.style.display = "block";
    }
}

function adicionarLinhaHabilidadeCriatura(nome = "", tipo = "Ação", descricao = "") {
    const list = document.getElementById("listaHabilidadesCriatura");
    const row = document.createElement("div");
    row.className = "inv-item-row";
    row.style.gridTemplateColumns = "1fr 110px 2fr 36px";
    row.innerHTML = `
        <input type="text" class="sheet-input-sm c-hab-nome" value="${nome}" placeholder="Nome da habilidade...">
        <select class="sheet-input-sm c-hab-tipo">
            <option value="Ação" ${tipo === "Ação" ? "selected" : ""}>Ação</option>
            <option value="Passiva" ${tipo === "Passiva" ? "selected" : ""}>Passiva</option>
            <option value="Reação" ${tipo === "Reação" ? "selected" : ""}>Reação</option>
        </select>
        <input type="text" class="sheet-input-sm c-hab-desc" value="${descricao}" placeholder="Efeito mecânico ou custo de Medo/Fadiga...">
        <button type="button" class="btn-remove-exp" onclick="this.closest('.inv-item-row').remove()" title="Remover Habilidade">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    list.appendChild(row);
}
window.adicionarLinhaHabilidadeCriatura = adicionarLinhaHabilidadeCriatura;

function extrairHabilidadesCriatura() {
    const rows = document.querySelectorAll("#listaHabilidadesCriatura .inv-item-row");
    const arr = [];
    rows.forEach(r => {
        const nome = r.querySelector(".c-hab-nome").value.trim();
        const tipo = r.querySelector(".c-hab-tipo").value;
        const descricao = r.querySelector(".c-hab-desc").value.trim();
        if (nome) arr.push({ nome, tipo, descricao });
    });
    return arr;
}

function configurarFormCriacao() {
    const form = document.getElementById("formNovaCriatura");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            NOME: document.getElementById("cNome").value.trim(),
            PATAMAR: Number(document.getElementById("cPatamar").value) || 1,
            PAPEL: document.getElementById("cPapel").value,
            DIFICULDADE: Number(document.getElementById("cDificuldade").value) || 12,
            LIMIARES: document.getElementById("cLimiares").value.trim(),
            PV_MAXIMO: Number(document.getElementById("cPvMax").value) || 4,
            PF_MAXIMO: Number(document.getElementById("cPfMax").value) || 2,
            BONUS_ATAQUE: document.getElementById("cBonusAtaque").value.trim(),
            NOME_ATAQUE: document.getElementById("cNomeAtaque").value.trim(),
            DANO_ATAQUE: document.getElementById("cDanoAtaque").value.trim(),
            TATICAS: document.getElementById("cTaticas").value.trim(),
            HABILIDADES: extrairHabilidadesCriatura(),
            IMAGEM: document.getElementById("cImagem").value.trim() || "img/enemies/placeholder.png"
        };

        const btn = document.getElementById("btnSalvarCriatura");
        btn.disabled = true;

        try {
            const res = await apiFetch("/api/criaturas", {
                method: "POST",
                body: payload
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || "Erro ao salvar criatura.");

            fecharModalNovaCriatura();
            form.reset();
            document.getElementById("listaHabilidadesCriatura").innerHTML = "";
            adicionarLinhaHabilidadeCriatura();
            atualizarPreviewCriatura();
            mostrarFeedback(`🐉 Criatura "${payload.NOME}" cadastrada com sucesso no Bestiário!`, "success");
            await carregarBestiario();
        } catch (err) {
            alert("Erro: " + err.message);
        } finally {
            btn.disabled = false;
        }
    });
}

function mostrarFeedback(msg, tipo = "info") {
    const container = document.getElementById("statusContainer");
    const el = document.getElementById("mensagemFeedback");
    if (!container || !el) return;

    container.style.display = "block";
    el.innerHTML = `<i class="fa-solid ${tipo === "error" ? "fa-triangle-exclamation" : "fa-circle-check"}"></i> <span>${msg}</span>`;
    setTimeout(() => { container.style.display = "none"; }, 4500);
}

// ==========================================================================
// MODAL DE VISUALIZAÇÃO DETALHADA E TODAS AS HABILIDADES OFICIAIS
// ==========================================================================

function fecharModalDetalhesCriatura() {
    const modal = document.getElementById("modalDetalhesCriatura");
    if (modal) modal.style.display = "none";
}
window.fecharModalDetalhesCriatura = fecharModalDetalhesCriatura;

function abrirModalDetalhesCriatura(id) {
    const criatura = todasCriaturas.find(c => Number(c.id || c.ID) === Number(id));
    if (!criatura) return;

    const modal = document.getElementById("modalDetalhesCriatura");
    const container = document.getElementById("detalhesCriaturaCorpo");
    if (!modal || !container) return;

    const nome = criatura.nome || criatura.name || "Criatura";
    const patamar = criatura.patamar || criatura.tier || 1;
    const papel = criatura.papel || criatura.role || "Padrão";
    const dif = criatura.dificuldade || criatura.difficulty || 12;
    const pv = criatura.pvMaximo || criatura.hpMax || 4;
    const pf = criatura.pfMaximo || criatura.stressMax || 2;
    const limiares = criatura.limiares || criatura.thresholds || "—";
    const atqBonus = criatura.bonusAtaque || criatura.atkBonus || "+0";
    const atqNome = criatura.nomeAtaque || criatura.attackName || "Ataque";
    const atqDano = criatura.danoAtaque || criatura.attackDamage || "1d6";
    const taticas = criatura.taticas || criatura.tactics || "";
    const descricao = criatura.descricao || criatura.description || "";
    const experiencias = criatura.experiencias || criatura.experiences || "";
    const img = criatura.imagem || criatura.image || "img/enemies/placeholder.png";
    const habs = Array.isArray(criatura.habilidades) ? criatura.habilidades : (Array.isArray(criatura.abilities) ? criatura.abilities : []);

    let habsHtml = "";
    if (habs && habs.length > 0) {
        habsHtml = habs.map(h => {
            const tipo = h.tipo || h.type || "Ação";
            const tipoLow = tipo.toLowerCase();
            const bClass = tipoLow.includes("passiv") ? "ab-passiva" : (tipoLow.includes("rea") ? "ab-reacao" : "ab-acao");
            const nomeHab = h.nome || h.name || "Habilidade";
            const descHab = h.descricao || h.description || h.efeito || "";
            const usaMedo = descHab.toLowerCase().includes("medo");
            const usaFadiga = descHab.toLowerCase().includes("fadiga");

            return `
                <div class="creature-detail-ability-card" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="ab-badge ${bClass}" style="font-size: 0.75rem; padding: 3px 10px; border-radius: 6px;">${tipo}</span>
                            <h4 style="font-family: 'Cinzel', serif; font-size: 1.15rem; color: #ffffff; margin: 0;">${nomeHab}</h4>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            ${usaMedo ? `<span class="c-quick-stat crimson" style="font-size: 0.72rem; padding: 2px 8px;"><i class="fa-solid fa-skull"></i> Custo de Medo</span>` : ""}
                            ${usaFadiga ? `<span class="c-quick-stat purple" style="font-size: 0.72rem; padding: 2px 8px;"><i class="fa-solid fa-bolt"></i> Custo de Fadiga</span>` : ""}
                        </div>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin: 0;">${descHab}</p>
                </div>
            `;
        }).join("");
    } else {
        habsHtml = `<p style="color: var(--text-dim); font-style: italic;">Esta criatura não possui habilidades especiais adicionais listadas.</p>`;
    }

    container.innerHTML = `
        <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap;">
            <div style="position: relative; width: 130px; height: 130px; border-radius: 16px; overflow: hidden; border: 2px solid var(--accent-gold); box-shadow: 0 8px 24px rgba(0,0,0,0.5); flex-shrink: 0;">
                <img src="${img}" alt="${nome}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/enemies/placeholder.png'">
                <span class="bestiary-tier-pill" style="position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); font-size: 0.65rem; white-space: nowrap;">PATAMAR ${patamar}</span>
            </div>

            <div style="flex: 1; min-width: 280px;">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
                    <span class="enemy-role-tag" style="font-size: 0.75rem; padding: 3px 10px;">${papel}</span>
                    <span class="enemy-diff-tag" style="font-size: 0.75rem; padding: 3px 10px;"><i class="fa-solid fa-bullseye"></i> Dificuldade ${dif}</span>
                </div>
                <h2 style="font-family: 'Cinzel', serif; font-size: 1.8rem; color: #ffffff; margin: 0 0 8px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.7);">${nome}</h2>
                ${taticas ? `<p style="color: #94a3b8; font-size: 0.88rem; margin: 0 0 6px 0; line-height: 1.5;"><strong><i class="fa-solid fa-compass" style="color: var(--accent-gold);"></i> Táticas:</strong> ${taticas}</p>` : ""}
                ${descricao ? `<p style="color: #cbd5e1; font-size: 0.86rem; margin: 0; line-height: 1.5;">${descricao}</p>` : ""}
            </div>
        </div>

        <!-- Estatísticas Principais -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px;">
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 12px; text-align: center;">
                <span style="display: block; font-size: 0.72rem; color: #fca5a5; font-weight: 700; text-transform: uppercase;"><i class="fa-solid fa-heart"></i> Pontos de Vida</span>
                <span style="font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 800; color: #fff;">${pv}</span>
            </div>
            <div style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 10px; padding: 12px; text-align: center;">
                <span style="display: block; font-size: 0.72rem; color: #d8b4fe; font-weight: 700; text-transform: uppercase;"><i class="fa-solid fa-bolt"></i> Fadiga (PF)</span>
                <span style="font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 800; color: #fff;">${pf}</span>
            </div>
            <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px; text-align: center;">
                <span style="display: block; font-size: 0.72rem; color: #fcd34d; font-weight: 700; text-transform: uppercase;"><i class="fa-solid fa-burst"></i> Limiares de Dano</span>
                <span style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff;">${limiares}</span>
            </div>
            <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 12px; text-align: center;">
                <span style="display: block; font-size: 0.72rem; color: #7dd3fc; font-weight: 700; text-transform: uppercase;"><i class="fa-solid fa-gavel"></i> Ataque Padrão</span>
                <span style="font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap;">${atqNome} (${atqBonus})</span>
                <div style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700; margin-top: 2px;">${atqDano}</div>
            </div>
        </div>

        ${experiencias ? `
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
            <strong style="color: var(--accent-gold); font-size: 0.85rem; text-transform: uppercase;"><i class="fa-solid fa-sparkles"></i> Experiências do Adversário:</strong>
            <span style="color: #cbd5e1; font-size: 0.9rem; margin-left: 8px;">${experiencias}</span>
        </div>` : ""}

        <!-- Seção de Habilidades Completas -->
        <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <h3 style="font-family: 'Cinzel', serif; font-size: 1.25rem; color: var(--accent-gold); margin: 0;">
                    <i class="fa-solid fa-book-sparkles"></i> Todas as Habilidades Oficiais (${habs.length})
                </h3>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Adversário Oficial do Sistema Daggerheart</span>
            </div>
            ${habsHtml}
        </div>

        <!-- Rodapé do Modal -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; gap: 12px;">
            <button type="button" class="btn btn-secondary" onclick="fecharModalDetalhesCriatura()">
                <i class="fa-solid fa-arrow-left"></i> Voltar ao Bestiário
            </button>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="qty-picker">
                    <label>QTD</label>
                    <input type="number" id="qtyModal_${id}" value="1" min="1" max="10">
                </div>
                <button type="button" class="btn btn-accent" onclick="enviarDoModalParaCombate(${id}, '${nome.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-swords"></i> Enviar para a Arena de Combate
                </button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
}
window.abrirModalDetalhesCriatura = abrirModalDetalhesCriatura;

function enviarDoModalParaCombate(inimigoId, nome) {
    const qtyInput = document.getElementById(`qtyModal_${inimigoId}`);
    const quantidade = qtyInput ? (Number(qtyInput.value) || 1) : 1;
    fecharModalDetalhesCriatura();
    const qtyBestiary = document.getElementById(`qtyBestiary_${inimigoId}`);
    if (qtyBestiary) qtyBestiary.value = quantidade;
    enviarMonstroParaCombate(inimigoId, nome);
}
window.enviarDoModalParaCombate = enviarDoModalParaCombate;
