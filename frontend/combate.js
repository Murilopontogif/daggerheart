// ==========================================================================
// DAGGERHEART - SISTEMA DE COMBATE, BARRA DE MEDO (1-10) & ARENA (combate.js)
// ==========================================================================

const sessao = exigirAutenticacao();
if (!sessao) throw new Error("Acesso não autorizado.");

const isMestre = sessao.usuario.papel === "mestre";
let estadoCombate = { fearPoints: 0, herois: [], criaturas: [] };
let listaMeusPersonagens = [];
let listaInimigosBestiario = [];

document.addEventListener("DOMContentLoaded", async () => {
    configurarVisaoPapel();
    renderizarBarraMedo(0);
    await carregarEstadoCombate();
    await carregarOpcoesAuxiliares();

    // Sincronização automática da arena a cada 4 segundos
    setInterval(carregarEstadoCombate, 4000);
});

function configurarVisaoPapel() {
    const lbl = document.getElementById("labelPapelUsuario");
    const subEnemies = document.getElementById("enemiesColSubtitle");

    if (isMestre) {
        lbl.innerHTML = `<span class="badge-mestre"><i class="fa-solid fa-crown"></i> Mestre (Controle Total de Heróis, Monstros & Medo)</span>`;
        document.getElementById("btnMestreAddMonstro").style.display = "inline-flex";
        document.getElementById("btnMestreAddMonstroCol").style.display = "inline-flex";
        document.getElementById("btnMestreLimparArena").style.display = "inline-flex";
        document.getElementById("btnColocarTodosHerois").style.display = "inline-flex";
        subEnemies.textContent = "Gerencie PV, Fadiga, Armadura, Habilidades e Anotações dos Inimigos";
    } else {
        lbl.innerHTML = `<span class="badge-player"><i class="fa-solid fa-shield-halved"></i> Jogador (Edita apenas seu Herói • Monstros Ocultos)</span>`;
        document.getElementById("btnFearMenos").style.display = "none";
        document.getElementById("btnFearMais").style.display = "none";
        document.getElementById("btnFearZerar").style.display = "none";
        subEnemies.textContent = "Visão de Jogador: Apenas aparência revelada pelo Mestre";
    }
}

async function carregarEstadoCombate() {
    // Evitar re-render se o usuário estiver digitando em um campo de texto/nota dentro da arena
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.classList.contains("enemy-notes-textarea") || activeEl.classList.contains("enemy-instance-name-input"))) {
        return;
    }

    try {
        const res = await apiFetch("/api/combate/estado");
        if (!res.ok) return;

        estadoCombate = await res.json();
        renderizarBarraMedo(estadoCombate.fearPoints || 0);
        renderizarHerois(estadoCombate.herois || []);
        renderizarCriaturas(estadoCombate.criaturas || []);
    } catch (err) {
        console.error("Erro ao carregar estado de combate:", err);
    }
}

async function carregarOpcoesAuxiliares() {
    try {
        const resP = await apiFetch("/personagens");
        if (resP.ok) {
            listaMeusPersonagens = await resP.json();
            const selH = document.getElementById("selectHeroiParaCombate");
            if (listaMeusPersonagens.length === 0) {
                selH.innerHTML = `<option value="">Nenhum herói cadastrado na sua conta</option>`;
            } else {
                selH.innerHTML = `<option value="">Selecione um herói...</option>` + listaMeusPersonagens.map(p => `
                    <option value="${p.ID}">#${p.ID} — ${p.NOME} (${p.CLASSE} Nv.${p.NIVEL || 1})${isMestre && p.CRIADOR_NOME ? " [" + p.CRIADOR_NOME + "]" : ""}</option>
                `).join("");
            }
        }
    } catch {}

    if (isMestre) {
        try {
            const resC = await apiFetch("/api/criaturas");
            if (resC.ok) {
                listaInimigosBestiario = await resC.json();
            }
        } catch {}
    }
}

// ==========================================================================
// 1. BARRA DE PONTOS DE MEDO DO MESTRE (1 a 10)
// ==========================================================================

function renderizarBarraMedo(valor) {
    const val = Math.max(0, Math.min(10, Number(valor) || 0));
    estadoCombate.fearPoints = val;

    const track = document.getElementById("fearTokensTrack");
    const fill = document.getElementById("fearProgressBarFill");
    const bigNum = document.getElementById("fearCurrentValue");
    const statusLabel = document.getElementById("fearStatusLabel");

    if (bigNum) bigNum.textContent = val;
    if (fill) fill.style.width = `${(val / 10) * 100}%`;

    if (statusLabel) {
        if (val === 0) statusLabel.textContent = "Calma na Mesa";
        else if (val <= 3) statusLabel.textContent = "Tensão Crescente";
        else if (val <= 6) statusLabel.textContent = "Perigo Eminente";
        else if (val <= 9) statusLabel.textContent = "Terror Profundo";
        else statusLabel.textContent = "MEDO MÁXIMO!";
    }

    if (track) {
        let html = "";
        for (let i = 1; i <= 10; i++) {
            const ativo = i <= val;
            const isHead = i === val;
            html += `
                <button type="button" 
                    class="fear-token-slot ${ativo ? "active" : ""} ${isHead ? "current-head" : ""}" 
                    ${isMestre ? `onclick="clicarSlotMedo(${i})"` : "disabled style='cursor:default;'"}
                    title="Medo ${i}/10">
                    <i class="fa-solid ${ativo ? "fa-skull" : "fa-circle-dot"}"></i>
                    <span class="fear-slot-num">${i}</span>
                </button>
            `;
        }
        track.innerHTML = html;
    }
}

function clicarSlotMedo(slot) {
    if (!isMestre) return;
    const novo = (estadoCombate.fearPoints === slot) ? slot - 1 : slot;
    definirPontosMedo(novo);
}

function alterarPontosMedo(delta) {
    if (!isMestre) return;
    definirPontosMedo((estadoCombate.fearPoints || 0) + delta);
}

async function definirPontosMedo(novoValor) {
    if (!isMestre) return;
    const val = Math.max(0, Math.min(10, Number(novoValor) || 0));
    renderizarBarraMedo(val);

    try {
        await apiFetch("/api/combate/medo", {
            method: "PATCH",
            body: { fearPoints: val }
        });
    } catch (err) {
        console.error("Erro ao sincronizar medo:", err);
    }
}

// ==========================================================================
// 2. RENDERIZAÇÃO DE HERÓIS EM COMBATE
// ==========================================================================

function renderizarHerois(herois) {
    const container = document.getElementById("combatHeroesList");
    const countEl = document.getElementById("combatHeroesCount");
    if (countEl) countEl.textContent = `${herois.length} ${herois.length === 1 ? "Herói" : "Heróis"}`;

    if (!herois || herois.length === 0) {
        container.innerHTML = `
            <div class="combat-empty-state">
                <i class="fa-solid fa-user-shield fa-2x"></i>
                <h4>Nenhum Herói na Arena</h4>
                <p>Selecione um personagem cadastrado na barra acima para colocá-lo em combate.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = herois.map(h => {
        const pvAtual = Number(h.pvAtual ?? h.pvMaximo ?? 6);
        const pvMax = Math.max(1, Number(h.pvMaximo || 6));
        const pfAtual = Number(h.pfAtual || 0);
        const pfMax = Math.max(1, Number(h.pfMaximo || 6));
        const armAtual = Number(h.armaduraMarcada || 0);
        const armSlots = Math.max(1, Number(h.armaduraSlots || 6));
        const esp = Number(h.esperanca ?? 2);
        const podeEditar = Boolean(h.podeEditar);
        const derrotado = pvAtual <= 0;

        const avatarHtml = h.imagem && h.imagem.trim()
            ? `<img src="${h.imagem}" alt="${h.nome}" class="combat-avatar-img" onerror="this.style.display='none'">`
            : `<div class="combat-avatar-placeholder"><i class="fa-solid fa-user-shield"></i></div>`;

        // Pílulas de PV
        let hpPills = "";
        for (let i = 1; i <= pvMax; i++) {
            const filled = i <= pvAtual;
            hpPills += `<span class="c-pill hp-pill ${filled ? "filled" : ""}" ${podeEditar ? `onclick="clicarPilulaHeroi(${h.instanciaId}, 'pv', ${i})"` : "style='cursor:default;'"} title="PV ${i}/${pvMax}"></span>`;
        }

        // Pílulas de Fadiga (PF)
        let pfPills = "";
        for (let i = 1; i <= pfMax; i++) {
            const filled = i <= pfAtual;
            pfPills += `<span class="c-pill stress-pill ${filled ? "filled" : ""}" ${podeEditar ? `onclick="clicarPilulaHeroi(${h.instanciaId}, 'pf', ${i})"` : "style='cursor:default;'"} title="Fadiga ${i}/${pfMax}"></span>`;
        }

        // Escudos de Armadura
        let armorSlotsHtml = "";
        for (let i = 1; i <= armSlots; i++) {
            const filled = i <= armAtual;
            armorSlotsHtml += `<span class="c-armor-slot ${filled ? "filled" : ""}" ${podeEditar ? `onclick="clicarPilulaHeroi(${h.instanciaId}, 'armadura', ${i})"` : "style='cursor:default;'"} title="Slot de Armadura ${i}/${armSlots}"><i class="fa-solid fa-shield-halved"></i></span>`;
        }

        // Diamantes de Esperança
        let hopeHtml = "";
        for (let i = 1; i <= 6; i++) {
            const filled = i <= esp;
            hopeHtml += `<span class="c-hope-diamond ${filled ? "filled" : ""}" ${podeEditar ? `onclick="clicarPilulaHeroi(${h.instanciaId}, 'esperanca', ${i})"` : "style='cursor:default;'"} title="Esperança ${i}/6"></span>`;
        }

        return `
            <div class="combat-entity-card hero-combat-card ${derrotado ? "entity-defeated" : ""}">
                <div class="combat-card-top">
                    <div class="combat-avatar-frame">
                        ${avatarHtml}
                        <span class="combat-lvl-tag">Nv.${h.nivel || 1}</span>
                    </div>

                    <div class="combat-identity">
                        <div class="combat-name-row">
                            <h3>${h.nome}</h3>
                            ${h.isMine ? `<span class="subclass-badge"><i class="fa-solid fa-user-check"></i> Seu Herói</span>` : ""}
                            ${!podeEditar ? `<span class="c-quick-stat"><i class="fa-solid fa-lock"></i> Somente Leitura</span>` : ""}
                            ${derrotado ? `<span class="defeated-tag"><i class="fa-solid fa-skull"></i> CAÍDO</span>` : ""}
                        </div>
                        <div class="combat-badges-row">
                            <span class="class-badge">${h.classe || "Herói"}</span>
                            ${h.subclasse ? `<span class="subclass-badge">${h.subclasse}</span>` : ""}
                            <span class="c-quick-stat cyan" title="Evasão"><i class="fa-solid fa-wind"></i> Evasão <strong>${h.evasao || 10}</strong></span>
                            <span class="c-quick-stat amber" title="Base de Armadura"><i class="fa-solid fa-shield"></i> Armadura <strong>${h.armaduraValor || 0}</strong></span>
                            <span class="c-quick-stat crimson" title="Limiares Menor / Maior / Grave"><i class="fa-solid fa-burst"></i> Limiares <strong>${h.limiares}</strong></span>
                        </div>
                    </div>

                    <div class="combat-card-actions">
                        ${podeEditar ? `
                        <button type="button" class="btn-icon-action danger" onclick="removerDoCombate('heroi', ${h.instanciaId})" title="Retirar do Combate">
                            <i class="fa-solid fa-xmark"></i>
                        </button>` : ""}
                    </div>
                </div>

                <!-- Trilhas Interativas de Recursos -->
                <div class="combat-tracks-box">
                    <!-- PV -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title hp-color"><i class="fa-solid fa-heart"></i> VIDA (PV)</span>
                            ${podeEditar ? `
                            <div class="c-stepper">
                                <button type="button" onclick="ajustarRecurso('heroi', ${h.instanciaId}, 'pv', -1)">-</button>
                                <span class="c-step-readout">${pvAtual}/${pvMax}</span>
                                <button type="button" onclick="ajustarRecurso('heroi', ${h.instanciaId}, 'pv', 1)">+</button>
                            </div>` : `<span class="c-step-readout">${pvAtual}/${pvMax}</span>`}
                        </div>
                        <div class="c-pills-wrap">${hpPills}</div>
                    </div>

                    <!-- Fadiga (PF) -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title stress-color"><i class="fa-solid fa-bolt"></i> FADIGA (PF)</span>
                            ${podeEditar ? `
                            <div class="c-stepper">
                                <button type="button" onclick="ajustarRecurso('heroi', ${h.instanciaId}, 'pf', -1)">-</button>
                                <span class="c-step-readout">${pfAtual}/${pfMax}</span>
                                <button type="button" onclick="ajustarRecurso('heroi', ${h.instanciaId}, 'pf', 1)">+</button>
                            </div>` : `<span class="c-step-readout">${pfAtual}/${pfMax}</span>`}
                        </div>
                        <div class="c-pills-wrap">${pfPills}</div>
                    </div>

                    <!-- Slots de Armadura -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title armor-color"><i class="fa-solid fa-shield-halved"></i> SLOTS DE ARMADURA</span>
                            ${podeEditar ? `
                            <div class="c-stepper">
                                <button type="button" onclick="ajustarRecurso('heroi', ${h.instanciaId}, 'armadura', -1)">-</button>
                                <span class="c-step-readout">${armAtual}/${armSlots}</span>
                                <button type="button" onclick="ajustarRecurso('heroi', ${h.instanciaId}, 'armadura', 1)">+</button>
                            </div>` : `<span class="c-step-readout">${armAtual}/${armSlots}</span>`}
                        </div>
                        <div class="c-pills-wrap">${armorSlotsHtml}</div>
                    </div>

                    <!-- Esperança -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title hope-color"><i class="fa-solid fa-wand-sparkles"></i> ESPERANÇA</span>
                            <span class="c-step-readout">${esp}/6</span>
                        </div>
                        <div class="c-pills-wrap hope-wrap">${hopeHtml}</div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// ==========================================================================
// 3. RENDERIZAÇÃO DE CRIATURAS (MESTRE VÊ TUDO / JOGADOR VÊ SÓ FOTO E NOME)
// ==========================================================================

function renderizarCriaturas(criaturas) {
    const container = document.getElementById("combatEnemiesList");
    const countEl = document.getElementById("combatEnemiesCount");
    if (countEl) countEl.textContent = `${criaturas.length} ${criaturas.length === 1 ? "Inimigo" : "Inimigos"}`;

    if (!criaturas || criaturas.length === 0) {
        container.innerHTML = `
            <div class="combat-empty-state">
                <i class="fa-solid fa-dragon fa-2x"></i>
                <h4>Nenhuma Criatura em Combate</h4>
                <p>${isMestre ? 'Clique em "Invocar Inimigo do Bestiário" para adicionar monstros à arena.' : 'Aguardando o Mestre invocar adversários na arena.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = criaturas.map(c => {
        // ==================================================================
        // REGRA ESTRITA DO JOGADOR: VÊ APENAS FOTO E NOME DA CRIATURA!
        // ==================================================================
        if (!isMestre) {
            return `
                <div class="enemy-player-mystery-card">
                    <div class="enemy-player-portrait-lg">
                        <img src="${c.imagem || "img/enemies/placeholder.png"}" alt="${c.nome}" onerror="this.src='img/enemies/placeholder.png'">
                    </div>
                    <div style="flex: 1;">
                        <span class="enemy-role-tag"><i class="fa-solid fa-skull"></i> Ameaça em Campo</span>
                        <h3 style="font-family: 'Cinzel', serif; font-size: 1.4rem; color: #ffffff; margin: 6px 0 4px;">
                            ${c.nome}
                        </h3>
                        <p style="font-size: 0.82rem; color: var(--text-muted);">
                            <i class="fa-solid fa-eye-slash" style="color: var(--accent-crimson);"></i>
                            Pontos de vida, fadiga, armadura, limiares e habilidades são visíveis apenas para o Mestre.
                        </p>
                    </div>
                </div>
            `;
        }

        // ==================================================================
        // VISÃO COMPLETA DO MESTRE: PV, FADIGA (PF), ARMADURA, HABILIDADES
        // ==================================================================
        const pvAtual = Number(c.pvAtual ?? c.pvMaximo ?? 1);
        const pvMax = Math.max(1, Number(c.pvMaximo || 1));
        const pfAtual = Number(c.pfAtual || 0);
        const pfMax = Math.max(0, Number(c.pfMaximo || 0));
        const armAtual = Number(c.armaduraMarcada || 0);
        const armMax = Math.max(6, Number(c.armaduraMaxima || 6));
        const derrotado = pvAtual <= 0;

        let hpPills = "";
        for (let i = 1; i <= pvMax; i++) {
            const filled = i <= pvAtual;
            hpPills += `<span class="c-pill hp-pill ${filled ? "filled" : ""}" onclick="clicarPilulaCriatura(${c.instanciaId}, 'pv', ${i})" title="PV ${i}/${pvMax}"></span>`;
        }

        let pfPills = "";
        const pfSlotsTotal = Math.max(pfMax, 6);
        for (let i = 1; i <= pfSlotsTotal; i++) {
            const filled = i <= pfAtual;
            pfPills += `<span class="c-pill stress-pill ${filled ? "filled" : ""}" onclick="clicarPilulaCriatura(${c.instanciaId}, 'pf', ${i})" title="Fadiga ${i}/${pfSlotsTotal}"></span>`;
        }

        let armorPills = "";
        for (let i = 1; i <= armMax; i++) {
            const filled = i <= armAtual;
            armorPills += `<span class="c-armor-slot ${filled ? "filled" : ""}" onclick="clicarPilulaCriatura(${c.instanciaId}, 'armadura', ${i})" title="Armadura ${i}/${armMax}"><i class="fa-solid fa-shield-halved"></i></span>`;
        }

        const habilidadesHtml = Array.isArray(c.habilidades) && c.habilidades.length > 0
            ? `
            <div class="enemy-abilities-section">
                <div class="enemy-sec-title"><i class="fa-solid fa-book-sparkles"></i> HABILIDADES DO INIMIGO</div>
                <div class="enemy-abilities-list">
                    ${c.habilidades.map(ab => {
                        const tipo = ab.tipo || ab.type || "Ação";
                        const tipoRaw = tipo.toLowerCase();
                        const badgeClass = tipoRaw.includes("passiv") ? "ab-passiva" : (tipoRaw.includes("rea") ? "ab-reacao" : "ab-acao");
                        const nomeAb = ab.nome || ab.name || "Habilidade";
                        const descText = ab.descricao || ab.description || ab.efeito || "";
                        const usaMedo = descText.toLowerCase().includes("medo");
                        const usaFadiga = descText.toLowerCase().includes("fadiga");
                        return `
                            <div class="enemy-ability-item">
                                <div class="enemy-ab-head">
                                    <span class="ab-badge ${badgeClass}">${tipo}</span>
                                    <strong class="enemy-ab-name">${nomeAb}</strong>
                                    <div class="enemy-ab-quick-btns">
                                        ${usaMedo ? `<button type="button" class="btn-ab-cost fear-cost" onclick="alterarPontosMedo(-1)" title="Gastar 1 Ponto de Medo"><i class="fa-solid fa-skull"></i> -1 Medo</button>` : ""}
                                        ${usaFadiga ? `<button type="button" class="btn-ab-cost" style="background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.4); color: #c084fc;" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'pf', 1)" title="Marcar 1 Ponto de Fadiga"><i class="fa-solid fa-bolt"></i> +1 Fadiga</button>` : ""}
                                    </div>
                                </div>
                                <p class="enemy-ab-desc">${descText}</p>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>`
            : "";

        return `
            <div class="combat-entity-card enemy-combat-card ${derrotado ? "entity-defeated" : ""}">
                <div class="combat-card-top">
                    <div class="enemy-portrait-box">
                        <img src="${c.imagem || "img/enemies/placeholder.png"}" alt="${c.nome}" class="enemy-portrait-img" onerror="this.src='img/enemies/placeholder.png'">
                        <span class="enemy-tier-badge">P${c.patamar || 1}</span>
                    </div>

                    <div class="combat-identity">
                        <div class="combat-name-row">
                            <input type="text" class="enemy-instance-name-input" value="${(c.nome || "").replace(/"/g, '&quot;')}" onchange="atualizarCampoCriatura(${c.instanciaId}, { nomeInstancia: this.value })" title="Clique para renomear instância">
                            ${derrotado ? `<span class="defeated-tag"><i class="fa-solid fa-skull"></i> DERROTADO</span>` : ""}
                        </div>

                        <div class="combat-badges-row">
                            <span class="enemy-role-tag">${c.papel || "Padrão"}</span>
                            <span class="c-quick-stat gold" title="Dificuldade"><i class="fa-solid fa-bullseye"></i> Dif. <strong>${c.dificuldade || 12}</strong></span>
                            <span class="c-quick-stat crimson" title="Limiares"><i class="fa-solid fa-burst"></i> Limiares <strong>${c.limiares || "—"}</strong></span>
                            <span class="c-quick-stat purple" title="Bônus de Ataque"><i class="fa-solid fa-crosshairs"></i> Atq <strong>${c.bonusAtaque || "+0"}</strong></span>
                        </div>

                        <div class="enemy-attack-line">
                            <i class="fa-solid fa-gavel"></i>
                            <strong>${c.nomeAtaque || "Ataque Padrão"}:</strong>
                            <span class="atk-dmg-highlight">${c.danoAtaque || "1d6"}</span>
                        </div>

                        ${c.taticas ? `<div class="enemy-tactics-line"><i class="fa-solid fa-compass"></i> <em>Motivação & Táticas:</em> ${c.taticas}</div>` : ""}
                    </div>

                    <div class="combat-card-actions">
                        <button type="button" class="btn-icon-action" onclick="duplicarCriaturaCombate(${c.inimigoId}, '${(c.nome || "").replace(/'/g, "\\'")}')" title="Duplicar este Inimigo">
                            <i class="fa-solid fa-clone"></i>
                        </button>
                        <button type="button" class="btn-icon-action danger" onclick="removerDoCombate('criatura', ${c.instanciaId})" title="Remover do Combate">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <!-- Trilhas Interativas do Inimigo (PV, Fadiga, Armadura) -->
                <div class="combat-tracks-box">
                    <!-- PV -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title hp-color"><i class="fa-solid fa-heart"></i> VIDA (PV)</span>
                            <div class="c-stepper">
                                <button type="button" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'pv', -1)">-</button>
                                <span class="c-step-readout">${pvAtual}/${pvMax}</span>
                                <button type="button" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'pv', 1)">+</button>
                            </div>
                        </div>
                        <div class="c-pills-wrap">${hpPills}</div>
                    </div>

                    <!-- Fadiga (PF) -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title stress-color"><i class="fa-solid fa-bolt"></i> FADIGA (PF)</span>
                            <div class="c-stepper">
                                <button type="button" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'pf', -1)">-</button>
                                <span class="c-step-readout">${pfAtual}/${pfSlotsTotal}</span>
                                <button type="button" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'pf', 1)">+</button>
                            </div>
                        </div>
                        <div class="c-pills-wrap">${pfPills}</div>
                    </div>

                    <!-- Armadura -->
                    <div class="c-track-line">
                        <div class="c-track-meta">
                            <span class="c-track-title armor-color"><i class="fa-solid fa-shield-halved"></i> ARMADURA GASTA</span>
                            <div class="c-stepper">
                                <button type="button" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'armadura', -1)">-</button>
                                <span class="c-step-readout">${armAtual}/${armMax}</span>
                                <button type="button" onclick="ajustarRecurso('criatura', ${c.instanciaId}, 'armadura', 1)">+</button>
                            </div>
                        </div>
                        <div class="c-pills-wrap">${armorPills}</div>
                    </div>
                </div>

                ${habilidadesHtml}

                <!-- Notas do Mestre para esta Criatura -->
                <div class="enemy-notes-section">
                    <label class="enemy-sec-title"><i class="fa-solid fa-pen-to-square"></i> ANOTAÇÕES E CONDIÇÕES (VULNERÁVEL, IMOBILIZADO...)</label>
                    <textarea class="enemy-notes-textarea" rows="2" placeholder="Condições ativas, foco de ataque ou anotações..." onchange="atualizarCampoCriatura(${c.instanciaId}, { notas: this.value })">${c.notas || ""}</textarea>
                </div>
            </div>
        `;
    }).join("");
}

// ==========================================================================
// 4. INTERAÇÃO COM RECURSOS (CLIQUES NAS PÍLULAS E BOTÕES +/-)
// ==========================================================================

function clicarPilulaHeroi(instanciaId, campo, valorClicado) {
    const h = estadoCombate.herois.find(x => x.instanciaId === instanciaId);
    if (!h || !h.podeEditar) return;

    if (campo === "pv") {
        h.pvAtual = (h.pvAtual === valorClicado) ? valorClicado - 1 : valorClicado;
    } else if (campo === "pf") {
        h.pfAtual = (h.pfAtual === valorClicado) ? valorClicado - 1 : valorClicado;
    } else if (campo === "armadura") {
        h.armaduraMarcada = (h.armaduraMarcada === valorClicado) ? valorClicado - 1 : valorClicado;
    } else if (campo === "esperanca") {
        h.esperanca = (h.esperanca === valorClicado) ? valorClicado - 1 : valorClicado;
    }

    renderizarHerois(estadoCombate.herois);
    salvarStatusHeroiBackend(h);
}

function clicarPilulaCriatura(instanciaId, campo, valorClicado) {
    if (!isMestre) return;
    const c = estadoCombate.criaturas.find(x => x.instanciaId === instanciaId);
    if (!c) return;

    if (campo === "pv") {
        c.pvAtual = (c.pvAtual === valorClicado) ? valorClicado - 1 : valorClicado;
    } else if (campo === "pf") {
        c.pfAtual = (c.pfAtual === valorClicado) ? valorClicado - 1 : valorClicado;
    } else if (campo === "armadura") {
        c.armaduraMarcada = (c.armaduraMarcada === valorClicado) ? valorClicado - 1 : valorClicado;
    }

    renderizarCriaturas(estadoCombate.criaturas);
    salvarStatusCriaturaBackend(c);
}

async function ajustarRecurso(tipo, id, recurso, delta) {
    if (tipo === "heroi") {
        const h = estadoCombate.herois.find(x => x.instanciaId === id);
        if (!h || !h.podeEditar) return;

        if (recurso === "pv") h.pvAtual = Math.max(0, Math.min(h.pvMaximo || 6, (h.pvAtual || 0) + delta));
        if (recurso === "pf") h.pfAtual = Math.max(0, Math.min(h.pfMaximo || 6, (h.pfAtual || 0) + delta));
        if (recurso === "armadura") h.armaduraMarcada = Math.max(0, Math.min(h.armaduraSlots || 6, (h.armaduraMarcada || 0) + delta));

        renderizarHerois(estadoCombate.herois);
        await salvarStatusHeroiBackend(h);
    } else {
        if (!isMestre) return;
        const c = estadoCombate.criaturas.find(x => x.instanciaId === id);
        if (!c) return;

        if (recurso === "pv") c.pvAtual = Math.max(0, (c.pvAtual || 0) + delta);
        if (recurso === "pf") c.pfAtual = Math.max(0, (c.pfAtual || 0) + delta);
        if (recurso === "armadura") c.armaduraMarcada = Math.max(0, (c.armaduraMarcada || 0) + delta);

        renderizarCriaturas(estadoCombate.criaturas);
        await salvarStatusCriaturaBackend(c);
    }
}

async function salvarStatusHeroiBackend(h) {
    try {
        await apiFetch("/api/combate/atualizar-status", {
            method: "PATCH",
            body: {
                tipo: "heroi",
                id: h.instanciaId,
                pvAtual: h.pvAtual,
                pfAtual: h.pfAtual,
                armaduraMarcada: h.armaduraMarcada,
                esperanca: h.esperanca
            }
        });
    } catch (err) {
        console.error("Erro ao salvar herói:", err);
        await carregarEstadoCombate();
    }
}

async function salvarStatusCriaturaBackend(c) {
    try {
        await apiFetch("/api/combate/atualizar-status", {
            method: "PATCH",
            body: {
                tipo: "criatura",
                id: c.instanciaId,
                pvAtual: c.pvAtual,
                pfAtual: c.pfAtual,
                armaduraMarcada: c.armaduraMarcada
            }
        });
    } catch (err) {
        console.error("Erro ao salvar criatura:", err);
        await carregarEstadoCombate();
    }
}

async function atualizarCampoCriatura(instanciaId, camposExtras) {
    if (!isMestre) return;
    const c = estadoCombate.criaturas.find(x => x.instanciaId === instanciaId);
    if (!c) return;

    try {
        await apiFetch("/api/combate/atualizar-status", {
            method: "PATCH",
            body: {
                tipo: "criatura",
                id: instanciaId,
                pvAtual: c.pvAtual,
                pfAtual: c.pfAtual,
                armaduraMarcada: c.armaduraMarcada,
                ...camposExtras
            }
        });
        await carregarEstadoCombate();
    } catch (err) {
        console.error("Erro ao atualizar campo da criatura:", err);
    }
}

// ==========================================================================
// 5. ADICIONAR / REMOVER COMBATENTES & MODAL DO BESTIÁRIO
// ==========================================================================

async function adicionarHeroiSelecionadoAoCombate() {
    const sel = document.getElementById("selectHeroiParaCombate");
    const id = Number(sel.value);
    if (!id) {
        alert("Selecione um herói na lista primeiro.");
        return;
    }

    try {
        const res = await apiFetch("/api/combate/adicionar-heroi", {
            method: "POST",
            body: { personagemId: id }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao adicionar herói.");

        sel.value = "";
        await carregarEstadoCombate();
    } catch (err) {
        alert(err.message);
    }
}

async function adicionarTodosHeroisAoCombate() {
    if (!listaMeusPersonagens || listaMeusPersonagens.length === 0) return;
    for (const p of listaMeusPersonagens) {
        try {
            await apiFetch("/api/combate/adicionar-heroi", {
                method: "POST",
                body: { personagemId: p.ID }
            });
        } catch {}
    }
    await carregarEstadoCombate();
}

async function removerDoCombate(tipo, id) {
    try {
        const res = await apiFetch(`/api/combate/remover/${tipo}/${id}`, { method: "DELETE" });
        if (res.ok) await carregarEstadoCombate();
    } catch (err) {
        alert("Erro ao remover: " + err.message);
    }
}

async function limparArenaCombate() {
    if (!confirm("Deseja remover todos os heróis e criaturas da arena de combate?")) return;
    try {
        const res = await apiFetch("/api/combate/limpar", { method: "POST" });
        if (res.ok) await carregarEstadoCombate();
    } catch (err) {
        alert("Erro ao limpar arena: " + err.message);
    }
}

function abrirModalBestiario() {
    if (!isMestre) return;
    document.getElementById("modalBestiario").style.display = "flex";
    renderizarCatalogoBestiario();
}

function fecharModalBestiario() {
    document.getElementById("modalBestiario").style.display = "none";
}

function renderizarCatalogoBestiario() {
    const grid = document.getElementById("bestiaryCardsGrid");
    if (!grid) return;

    const tierFiltro = document.getElementById("filterBestiarioTier").value;
    const roleFiltro = document.getElementById("filterBestiarioRole").value;
    const busca = (document.getElementById("filterBestiarioBusca").value || "").trim().toLowerCase();

    const filtrados = listaInimigosBestiario.filter(m => {
        const patamar = String(m.patamar || m.tier || 1);
        const papel = m.papel || m.role || "";
        const nome = (m.nome || m.name || "").toLowerCase();
        const atq = (m.nomeAtaque || m.attackName || "").toLowerCase();

        if (tierFiltro !== "TODOS" && patamar !== tierFiltro) return false;
        if (roleFiltro !== "TODOS" && !papel.toLowerCase().includes(roleFiltro.toLowerCase())) return false;
        if (busca && !nome.includes(busca) && !atq.includes(busca) && !papel.toLowerCase().includes(busca)) return false;
        return true;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = `<div class="empty-equipped-hint">Nenhuma criatura encontrada para este filtro.</div>`;
        return;
    }

    grid.innerHTML = filtrados.map(m => {
        const id = m.id || m.ID;
        const nome = m.nome || m.name || "Criatura";
        const patamar = m.patamar || m.tier || 1;
        const papel = m.papel || m.role || "Padrão";
        const dif = m.dificuldade || m.difficulty || 12;
        const pv = m.pvMaximo || m.hpMax || 4;
        const pf = m.pfMaximo || m.stressMax || 2;
        const limiares = m.limiares || m.thresholds || "—";
        const atqBonus = m.bonusAtaque || m.attackBonus || "+0";
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
                        ${habs.map(h => `
                            <div class="bestiary-ab-item">
                                <span class="ab-badge ab-acao">${h.tipo || "Ação"}</span>
                                <strong>${h.nome}:</strong> ${h.descricao || h.efeito || ""}
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="bestiary-card-footer">
                    <div class="qty-picker">
                        <label>QTD</label>
                        <input type="number" id="qtyEnemy_${id}" value="1" min="1" max="10">
                    </div>
                    <button type="button" class="btn-card-action btn-card-equip" onclick="invocarMonstroDoBestiario(${id})">
                        <i class="fa-solid fa-swords"></i> Invocar no Combate
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

async function invocarMonstroDoBestiario(inimigoId) {
    const qtyInput = document.getElementById(`qtyEnemy_${inimigoId}`);
    const quantidade = qtyInput ? (Number(qtyInput.value) || 1) : 1;

    try {
        const res = await apiFetch("/api/combate/adicionar-criatura", {
            method: "POST",
            body: { inimigoId: Number(inimigoId), quantidade }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao invocar criatura.");

        fecharModalBestiario();
        await carregarEstadoCombate();
    } catch (err) {
        alert(err.message);
    }
}

async function duplicarCriaturaCombate(inimigoId, nomeAtual) {
    if (!inimigoId) return;
    try {
        await apiFetch("/api/combate/adicionar-criatura", {
            method: "POST",
            body: { inimigoId: Number(inimigoId), quantidade: 1 }
        });
        await carregarEstadoCombate();
    } catch (err) {
        alert(err.message);
    }
}

// ==========================================================================
// 6. ROLADOR DE DADOS DE DUALIDADE 2d12 (ESPERANÇA vs MEDO)
// ==========================================================================

function rolarDadosDualidade() {
    const btn = document.getElementById("btnRolarDadosDualidade");
    btn.disabled = true;

    const elHope = document.getElementById("valHopeDie");
    const elFear = document.getElementById("valFearDie");
    const elTotal = document.getElementById("diceTotalVal");
    const elBadge = document.getElementById("diceResultBadge");

    elBadge.innerHTML = `<span class="c-quick-stat"><i class="fa-solid fa-spinner fa-spin"></i> Rolando...</span>`;

    let count = 0;
    const interval = setInterval(() => {
        elHope.textContent = Math.floor(Math.random() * 12) + 1;
        elFear.textContent = Math.floor(Math.random() * 12) + 1;
        count++;
        if (count >= 10) {
            clearInterval(interval);

            const hopeVal = Math.floor(Math.random() * 12) + 1;
            const fearVal = Math.floor(Math.random() * 12) + 1;
            const total = hopeVal + fearVal;

            elHope.textContent = hopeVal;
            elFear.textContent = fearVal;
            elTotal.textContent = total;

            if (hopeVal === fearVal) {
                elBadge.innerHTML = `<span class="dice-outcome-tag" style="background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #6ee7b7;">🌟 CRÍTICO! (${hopeVal} = ${fearVal})</span>`;
            } else if (hopeVal > fearVal) {
                elBadge.innerHTML = `<span class="dice-outcome-tag" style="background: rgba(251,191,36,0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold);">✨ COM ESPERANÇA! (${total})</span>`;
            } else {
                elBadge.innerHTML = `<span class="dice-outcome-tag" style="background: rgba(157,78,221,0.25); border: 1px solid #c084fc; color: #e9d5ff;">💀 COM MEDO! (${total})</span>`;
                if (isMestre) {
                    alterarPontosMedo(1);
                }
            }

            btn.disabled = false;
        }
    }, 55);
}
window.rolarDadosDualidade = rolarDadosDualidade;
