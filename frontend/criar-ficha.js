// ==========================================================================
// DAGGERHEART - CRIAÇÃO DE NOVA FICHA COMPLETA (criar-ficha.js)
// ==========================================================================

const sessao = exigirAutenticacao();
if (!sessao) throw new Error("Acesso não autorizado.");

let dadosSistema = null;
let cartasEquipadasIds = [];

// Estado de Recursos Interativos na Ficha de Criação
let pvMarcado = 6;
let pfMarcado = 0;
let armaduraMarcada = 0;
let esperancaValor = 2;
let proficienciaValor = 1;

document.addEventListener("DOMContentLoaded", async () => {
    inicializarExperienciasEInventario();
    renderizarTrilhasPvPfArmadura();
    await carregarDadosSistema();
});

async function carregarDadosSistema() {
    try {
        const res = await apiFetch("/personagens/dados-sistema");
        if (!res.ok) throw new Error("Erro ao carregar dados do sistema.");

        const data = await res.json();
        dadosSistema = data.DAGGERHEART_DATA;
        window.DAGGERHEART_DATA = dadosSistema;

        popularSelectsFichaGrande();
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
}

function popularSelectsFichaGrande() {
    if (!dadosSistema) return;

    const { CLASSES, ANCESTRALIDADES, COMUNIDADES } = dadosSistema;

    // Classes
    const shClasse = document.getElementById("shClasse");
    shClasse.innerHTML = "";
    Object.keys(CLASSES).forEach(c => {
        shClasse.innerHTML += `<option value="${c}">${c}</option>`;
    });

    // Ancestralidades
    const shAncestralidade = document.getElementById("shAncestralidade");
    const shAncestralidadeMista1 = document.getElementById("shAncestralidadeMista1");
    const shAncestralidadeMista2 = document.getElementById("shAncestralidadeMista2");

    shAncestralidade.innerHTML = "";
    shAncestralidadeMista1.innerHTML = "";
    shAncestralidadeMista2.innerHTML = "";

    ANCESTRALIDADES.forEach(a => {
        const opt = `<option value="${a.nome}">${a.nome}</option>`;
        shAncestralidade.innerHTML += opt;
        shAncestralidadeMista1.innerHTML += opt;
        shAncestralidadeMista2.innerHTML += opt;
    });

    if (ANCESTRALIDADES.length > 1) {
        shAncestralidadeMista2.selectedIndex = 1;
    }

    // Comunidades
    const shComunidade = document.getElementById("shComunidade");
    const shComunidadeMista = document.getElementById("shComunidadeMista");
    shComunidade.innerHTML = "";
    shComunidadeMista.innerHTML = "";

    COMUNIDADES.forEach(c => {
        const opt = `<option value="${c.nome}">${c.nome}</option>`;
        shComunidade.innerHTML += opt;
        shComunidadeMista.innerHTML += opt;
    });

    // Disparar preenchimento canônico inicial
    aoMudarClasseFichaGrande(true);
    aoMudarRacaFichaGrande(true);
    aoMudarComunidadeFichaGrande(true);
    renderizarCartasEquipadas();
}

function definirAvatarPreset(url) {
    document.getElementById("shImagemUrl").value = url;
    atualizarFotoFichaGrande();
}

function atualizarFotoFichaGrande() {
    const url = document.getElementById("shImagemUrl").value.trim();
    const img = document.getElementById("shAvatarImg");
    const ph = document.getElementById("shAvatarPlaceholder");
    if (url) {
        img.src = url;
        img.style.display = "block";
        ph.style.display = "none";
    } else {
        img.style.display = "none";
        ph.style.display = "block";
    }
}

function alternarModoAncestryFichaGrande(modo) {
    const rowU = document.getElementById("shHeritageUnicaRow");
    const rowM = document.getElementById("shHeritageMistaRow");

    if (modo === "mista") {
        rowM.style.display = "grid";
        rowU.style.display = "none";
        aoMudarRacaMista1FichaGrande();
        aoMudarRacaMista2FichaGrande();
        aoMudarComunidadeMistaFichaGrande();
    } else {
        rowU.style.display = "flex";
        rowM.style.display = "none";
        aoMudarRacaFichaGrande(true);
        aoMudarComunidadeFichaGrande(true);
    }
}

function aoMudarClasseFichaGrande(sobrescreverTexto = true) {
    if (!dadosSistema) return;
    const classe = document.getElementById("shClasse").value;
    const info = dadosSistema.CLASSES[classe];
    if (!info) return;

    const shSubclasse = document.getElementById("shSubclasse");
    shSubclasse.innerHTML = "";
    (info.subclasses || []).forEach(sub => {
        shSubclasse.innerHTML += `<option value="${sub}">${sub}</option>`;
    });

    // Preencher Evasão e PV iniciais da classe
    if (info.evasaoInicial || info.evasao) {
        document.getElementById("shEvasao").value = info.evasaoInicial || info.evasao;
    }
    if (info.pvInicial || info.pv) {
        const pvBase = info.pvInicial || info.pv;
        document.getElementById("shPvMaximo").value = pvBase;
        pvMarcado = pvBase;
        renderizarTrilhasPvPfArmadura();
    }

    document.getElementById("shHabClasseTitle").textContent = classe;
    if (sobrescreverTexto) {
        document.getElementById("shHabilidadesClasse").value = info.habilidadeClasse || info.habilidade || "";
        aoMudarSubclasseFichaGrande(true);
    }

    document.getElementById("shDomainCardsBadge").textContent = (info.dominios || []).join(" & ");

    // Atualizar filtro de domínios no seletor de cartas
    const selDom = document.getElementById("filterDominio");
    selDom.innerHTML = `<option value="">Todos os Domínios</option>`;
    (info.dominios || []).forEach(d => {
        selDom.innerHTML += `<option value="${d}">${d} (Domínio da Classe)</option>`;
    });
    if (dadosSistema.DOMINIOS) {
        dadosSistema.DOMINIOS.forEach(d => {
            if (!(info.dominios || []).includes(d)) {
                selDom.innerHTML += `<option value="${d}">${d}</option>`;
            }
        });
    }
}

function aoMudarSubclasseFichaGrande(sobrescreverTexto = true) {
    if (!dadosSistema) return;
    const sub = document.getElementById("shSubclasse").value;
    const info = dadosSistema.SUBCLASSES ? dadosSistema.SUBCLASSES[sub] : null;
    document.getElementById("shHabSubclasseTitle").textContent = sub || "—";
    if (sobrescreverTexto && info) {
        const txt = [
            info.atributoConj ? `Atributo de Conjuração: ${info.atributoConj}` : "",
            info.fundamental ? `Fundamental: ${info.fundamental}` : "",
            info.especializacao ? `Especialização: ${info.especializacao}` : "",
            info.maestria ? `Maestria: ${info.maestria}` : (info.habilidade || "")
        ].filter(Boolean).join("\n\n");
        document.getElementById("shHabilidadeSubclasse").value = txt;
    }
}

function aoMudarRacaFichaGrande(sobrescreverTexto = true) {
    if (!dadosSistema) return;
    const nome = document.getElementById("shAncestralidade").value;
    const raca = dadosSistema.ANCESTRALIDADES.find(a => a.nome === nome);
    document.getElementById("shHabRacaTitle").textContent = nome || "—";
    if (sobrescreverTexto && raca) {
        const txt = raca.habilidades
            ? raca.habilidades.map(h => `• ${h.nome}: ${h.descricao}`).join("\n\n")
            : `${raca.poder1 ? `• ${raca.poder1}\n` : ""}${raca.poder2 ? `• ${raca.poder2}` : (raca.habilidade || "")}`;
        document.getElementById("shHabilidadeRaca").value = txt;
    }
}

function aoMudarRacaMista1FichaGrande() {
    if (!dadosSistema) return;
    const nome = document.getElementById("shAncestralidadeMista1").value;
    const raca = dadosSistema.ANCESTRALIDADES.find(a => a.nome === nome);
    const sel = document.getElementById("shPoderRaca1");
    sel.innerHTML = "";
    if (raca) {
        const poderes = raca.habilidades || [
            raca.poder1 ? { nome: "1º Poder", descricao: raca.poder1 } : null,
            raca.poder2 ? { nome: "2º Poder", descricao: raca.poder2 } : null
        ].filter(Boolean);
        poderes.forEach(p => {
            const label = p.descricao ? `${p.nome}: ${p.descricao}` : p.nome;
            sel.innerHTML += `<option value="${label.replace(/"/g, '&quot;')}">${p.nome}</option>`;
        });
    }
    atualizarTextoRacaMistaFichaGrande();
}

function aoMudarRacaMista2FichaGrande() {
    if (!dadosSistema) return;
    const nome = document.getElementById("shAncestralidadeMista2").value;
    const raca = dadosSistema.ANCESTRALIDADES.find(a => a.nome === nome);
    const sel = document.getElementById("shPoderRaca2");
    sel.innerHTML = "";
    if (raca) {
        const poderes = raca.habilidades || [
            raca.poder1 ? { nome: "1º Poder", descricao: raca.poder1 } : null,
            raca.poder2 ? { nome: "2º Poder", descricao: raca.poder2 } : null
        ].filter(Boolean);
        poderes.forEach(p => {
            const label = p.descricao ? `${p.nome}: ${p.descricao}` : p.nome;
            sel.innerHTML += `<option value="${label.replace(/"/g, '&quot;')}">${p.nome}</option>`;
        });
    }
    atualizarTextoRacaMistaFichaGrande();
}

function atualizarTextoRacaMistaFichaGrande() {
    const r1 = document.getElementById("shAncestralidadeMista1").value;
    const r2 = document.getElementById("shAncestralidadeMista2").value;
    const p1 = document.getElementById("shPoderRaca1").value;
    const p2 = document.getElementById("shPoderRaca2").value;
    document.getElementById("shHabRacaTitle").textContent = `${r1} + ${r2} (Híbrido)`;
    document.getElementById("shHabilidadeRaca").value = `[${r1}] ${p1}\n\n[${r2}] ${p2}`;
}

function aoMudarComunidadeFichaGrande(sobrescreverTexto = true) {
    if (!dadosSistema) return;
    const nome = document.getElementById("shComunidade").value;
    const com = dadosSistema.COMUNIDADES.find(c => c.nome === nome);
    document.getElementById("shHabComunidadeTitle").textContent = nome || "—";
    if (sobrescreverTexto && com) {
        document.getElementById("shHabilidadeComunidade").value = com.habilidade || com.descricao || "";
    }
}

function aoMudarComunidadeMistaFichaGrande() {
    if (!dadosSistema) return;
    const nome = document.getElementById("shComunidadeMista").value;
    const com = dadosSistema.COMUNIDADES.find(c => c.nome === nome);
    document.getElementById("shHabComunidadeTitle").textContent = nome || "—";
    if (com) {
        document.getElementById("shHabilidadeComunidade").value = com.habilidade || com.descricao || "";
    }
}

function sincronizarArmaduraBaseFichaGrande() {
    const v = parseInt(document.getElementById("shArmaduraBase").value, 10);
    if (!isNaN(v)) {
        document.getElementById("shArmadura").value = v;
    }
}

// --------------------------------------------------------------------------
// TRILHAS VISUAIS (PV, FADIGA, ARMADURA, ESPERANÇA E PROFICIÊNCIA)
// --------------------------------------------------------------------------

function renderizarTrilhasPvPfArmadura() {
    const maxPv = Math.max(1, Math.min(18, Number(document.getElementById("shPvMaximo").value) || 6));
    const hpContainer = document.getElementById("hpTrackPills");
    hpContainer.innerHTML = "";
    for (let i = 1; i <= maxPv; i++) {
        const filled = i <= pvMarcado;
        hpContainer.innerHTML += `<div class="track-pill ${filled ? "filled" : ""}" onclick="alternarPv(${i})" title="PV ${i}/${maxPv}"></div>`;
    }

    const maxPf = Math.max(1, Math.min(18, Number(document.getElementById("shPfMaximo").value) || 6));
    const stressContainer = document.getElementById("stressTrackPills");
    stressContainer.innerHTML = "";
    for (let i = 1; i <= maxPf; i++) {
        const filled = i <= pfMarcado;
        stressContainer.innerHTML += `<div class="track-pill ${filled ? "filled" : ""}" onclick="alternarPf(${i})" title="Fadiga ${i}/${maxPf}"></div>`;
    }

    const armorContainer = document.getElementById("armorHeartsSlots");
    armorContainer.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        const filled = i <= armaduraMarcada;
        armorContainer.innerHTML += `
            <div class="armor-heart ${filled ? "filled" : ""}" onclick="alternarArmadura(${i})" title="Slot de Armadura ${i}">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
        `;
    }

    const hopeContainer = document.getElementById("hopeDiamondsRow");
    hopeContainer.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        const filled = i <= esperancaValor;
        hopeContainer.innerHTML += `<div class="hope-diamond ${filled ? "filled" : ""}" onclick="setEsperanca(${i})" title="Esperança ${i}"></div>`;
    }

    const profContainer = document.getElementById("profDots");
    if (profContainer) {
        profContainer.innerHTML = "";
        for (let i = 1; i <= 6; i++) {
            const filled = i <= proficienciaValor;
            profContainer.innerHTML += `<div class="prof-dot ${filled ? "filled" : ""}" onclick="setProficiencia(${i})" title="Proficiência ${i}"></div>`;
        }
    }
}

function alternarPv(val) {
    pvMarcado = (pvMarcado === val) ? val - 1 : val;
    renderizarTrilhasPvPfArmadura();
}
function alternarPf(val) {
    pfMarcado = (pfMarcado === val) ? val - 1 : val;
    renderizarTrilhasPvPfArmadura();
}
function alternarArmadura(val) {
    armaduraMarcada = (armaduraMarcada === val) ? val - 1 : val;
    renderizarTrilhasPvPfArmadura();
}
function setEsperanca(val) {
    esperancaValor = (esperancaValor === val) ? val - 1 : val;
    renderizarTrilhasPvPfArmadura();
}
function setProficiencia(val) {
    proficienciaValor = (proficienciaValor === val) ? Math.max(1, val - 1) : val;
    renderizarTrilhasPvPfArmadura();
}

// --------------------------------------------------------------------------
// EXPERIÊNCIAS E INVENTÁRIO ESTRUTURADO
// --------------------------------------------------------------------------

function inicializarExperienciasEInventario() {
    adicionarLinhaExperiencia("Explorador Destemido", 2);
    adicionarLinhaExperiencia("Veterano de Taverna", 2);

    adicionarLinhaItemInventario("Mochila de Aventureiro", 1, "Geral", "Corda, tochas e pederneira");
    adicionarLinhaItemInventario("Poção de Cura Menor", 2, "Consumível", "Recupera 1d4 PV");
    adicionarLinhaItemInventario("Rações de Viagem", 5, "Consumível", "Suprimento para jornada");
}

function adicionarLinhaExperiencia(nome = "", valor = 2) {
    const list = document.getElementById("shExperienciasList");
    const div = document.createElement("div");
    div.className = "exp-row";
    div.innerHTML = `
        <input type="text" class="exp-name" value="${nome}" placeholder="Ex: Guarda Real, Ladrão das Sombras...">
        <div class="exp-val-wrap">
            <span>+</span>
            <input type="number" class="exp-val" value="${valor}" min="1" max="10">
        </div>
        <button type="button" class="btn-remove-exp" onclick="this.closest('.exp-row').remove()" title="Remover Experiência">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    list.appendChild(div);
}
window.adicionarLinhaExperiencia = adicionarLinhaExperiencia;

function extrairExperienciasFichaGrande() {
    const rows = document.querySelectorAll("#shExperienciasList .exp-row");
    const arr = [];
    rows.forEach(r => {
        const nome = r.querySelector(".exp-name").value.trim();
        const valor = Number(r.querySelector(".exp-val").value) || 2;
        if (nome) arr.push({ nome, valor });
    });
    return arr;
}

function adicionarLinhaItemInventario(nome = "", qtd = 1, categoria = "Equipamento", detalhes = "") {
    const container = document.getElementById("listaItensInventario");
    const row = document.createElement("div");
    row.className = "inv-item-row";
    row.innerHTML = `
        <input type="text" class="sheet-input-sm inv-item-nome" value="${nome}" placeholder="Nome do item...">
        <input type="number" class="sheet-input-sm inv-item-qtd" value="${qtd}" min="1" title="Quantidade" style="text-align: center;">
        <select class="sheet-input-sm inv-item-cat">
            <option value="Equipamento" ${categoria === "Equipamento" ? "selected" : ""}>Equipamento</option>
            <option value="Consumível" ${categoria === "Consumível" ? "selected" : ""}>Consumível</option>
            <option value="Relíquia" ${categoria === "Relíquia" ? "selected" : ""}>Relíquia</option>
            <option value="Arma/Escudo" ${categoria === "Arma/Escudo" ? "selected" : ""}>Arma/Escudo</option>
            <option value="Geral" ${categoria === "Geral" ? "selected" : ""}>Geral</option>
        </select>
        <input type="text" class="sheet-input-sm inv-item-detalhes" value="${detalhes || ""}" placeholder="Efeito ou descrição...">
        <button type="button" class="btn-remove-exp" onclick="this.closest('.inv-item-row').remove()" title="Remover Item">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    container.appendChild(row);
}
window.adicionarLinhaItemInventario = adicionarLinhaItemInventario;

function extrairInventarioEstruturado() {
    const rows = document.querySelectorAll("#listaItensInventario .inv-item-row");
    const itens = [];
    rows.forEach(r => {
        const nome = r.querySelector(".inv-item-nome").value.trim();
        if (nome) {
            itens.push({
                nome,
                qtd: Number(r.querySelector(".inv-item-qtd").value) || 1,
                categoria: r.querySelector(".inv-item-cat").value,
                detalhes: r.querySelector(".inv-item-detalhes").value.trim()
            });
        }
    });
    const notas = document.getElementById("shInventario").value;
    return JSON.stringify({ itens, notas });
}

// --------------------------------------------------------------------------
// CARTAS DE DOMÍNIO
// --------------------------------------------------------------------------

function obterListaCartasSistema() {
    if (!dadosSistema) return [];
    return dadosSistema.CARTAS_DOMINIO || dadosSistema.CARTAS || [];
}

function renderizarCartasEquipadas() {
    const grid = document.getElementById("shEquippedCardsGrid");
    const todas = obterListaCartasSistema();

    const cartas = todas.filter(c => cartasEquipadasIds.includes(Number(c.id)));
    if (cartas.length === 0) {
        grid.innerHTML = `
            <div class="empty-equipped-hint">
                <i class="fa-solid fa-layer-group" style="font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 6px; display: block;"></i>
                Nenhuma Carta de Domínio selecionada ainda. Clique em <strong>"Escolher Cartas no Catálogo"</strong> para adicionar suas magias e técnicas iniciais.
            </div>
        `;
        return;
    }

    grid.innerHTML = cartas.map(c => {
        const dominio = c.dominio || c.domain || "Arcano";
        const nivel = c.nivel || c.level || 1;
        const custo = c.custoTroca ?? c.cost ?? 0;
        const tipo = c.tipo || c.type || "Habilidade";
        const nome = c.nome || c.name || "Carta";
        const desc = c.descricao || c.description || "";

        return `
            <div class="domain-card-ui is-equipped-card" data-domain="${dominio}">
                <div class="card-ui-header">
                    <div class="card-ui-level-cost">
                        <span class="card-ui-level">NV ${nivel}</span>
                        <span class="card-ui-cost"><i class="fa-solid fa-bolt"></i> ${custo}</span>
                    </div>
                    <span class="card-ui-domain">${dominio}</span>
                </div>
                <div class="card-ui-body">
                    <span class="card-ui-type">${tipo}</span>
                    <h4 class="card-ui-name">${nome}</h4>
                    <p class="card-ui-desc">${desc}</p>
                </div>
                <div class="card-ui-footer">
                    <button type="button" class="btn-card-action btn-card-remove" onclick="desequiparCarta(${c.id})">
                        <i class="fa-solid fa-trash-can"></i> Remover da Ficha
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function abrirModalCartasDominio() {
    document.getElementById("modalCartasDominio").style.display = "flex";
    renderizarCartasDoNavegador();
}

function fecharModalCartasDominio() {
    document.getElementById("modalCartasDominio").style.display = "none";
}

function renderizarCartasDoNavegador() {
    const todas = obterListaCartasSistema();
    const grid = document.getElementById("browserCardsGrid");
    if (!grid) return;

    const domFiltro = document.getElementById("filterDominio").value;
    const nvFiltro = document.getElementById("filterNivel").value;
    const busca = (document.getElementById("filterBuscaNome").value || "").trim().toLowerCase();

    const filtradas = todas.filter(c => {
        const dom = c.dominio || c.domain || "";
        const nv = Number(c.nivel || c.level || 1);
        const nome = (c.nome || c.name || "").toLowerCase();
        const desc = (c.descricao || c.description || "").toLowerCase();

        if (domFiltro && dom !== domFiltro) return false;
        if (nvFiltro && nv > Number(nvFiltro)) return false;
        if (busca && !nome.includes(busca) && !desc.includes(busca)) return false;
        return true;
    });

    if (filtradas.length === 0) {
        grid.innerHTML = `<div class="empty-equipped-hint">Nenhuma carta encontrada para este filtro.</div>`;
        return;
    }

    grid.innerHTML = filtradas.map(c => {
        const id = Number(c.id);
        const equipada = cartasEquipadasIds.includes(id);
        const dominio = c.dominio || c.domain || "Arcano";
        const nivel = c.nivel || c.level || 1;
        const custo = c.custoTroca ?? c.cost ?? 0;
        const tipo = c.tipo || c.type || "Habilidade";
        const nome = c.nome || c.name || "Carta";
        const desc = c.descricao || c.description || "";

        return `
            <div class="domain-card-ui ${equipada ? "is-equipped-card" : ""}" data-domain="${dominio}">
                <div class="card-ui-header">
                    <div class="card-ui-level-cost">
                        <span class="card-ui-level">NV ${nivel}</span>
                        <span class="card-ui-cost"><i class="fa-solid fa-bolt"></i> ${custo}</span>
                    </div>
                    <span class="card-ui-domain">${dominio}</span>
                </div>
                <div class="card-ui-body">
                    <span class="card-ui-type">${tipo}</span>
                    <h4 class="card-ui-name">${nome}</h4>
                    <p class="card-ui-desc">${desc}</p>
                </div>
                <div class="card-ui-footer">
                    ${equipada
                        ? `<button type="button" class="btn-card-action btn-card-remove" onclick="desequiparCarta(${id})"><i class="fa-solid fa-check"></i> Equipada (Remover)</button>`
                        : `<button type="button" class="btn-card-action btn-card-equip" onclick="equiparCarta(${id})"><i class="fa-solid fa-plus"></i> Equipar na Ficha</button>`
                    }
                </div>
            </div>
        `;
    }).join("");
}

function equiparCarta(id) {
    const numId = Number(id);
    if (!cartasEquipadasIds.includes(numId)) {
        cartasEquipadasIds.push(numId);
    }
    renderizarCartasEquipadas();
    renderizarCartasDoNavegador();
}

function desequiparCarta(id) {
    const numId = Number(id);
    cartasEquipadasIds = cartasEquipadasIds.filter(x => x !== numId);
    renderizarCartasEquipadas();
    renderizarCartasDoNavegador();
}

// --------------------------------------------------------------------------
// SUBMETER E CRIAR NOVA FICHA
// --------------------------------------------------------------------------

async function submeterNovaFicha() {
    const nome = document.getElementById("shNome").value.trim();
    if (!nome) {
        alert("Por favor, digite o Nome do Personagem no topo da ficha.");
        document.getElementById("shNome").focus();
        return;
    }

    const btn = document.getElementById("btnSalvarHeroi");
    const btnTop = document.getElementById("btnForjarHeroiTop");
    const feedback = document.getElementById("forgeFeedbackMsg");

    btn.disabled = true;
    btnTop.disabled = true;
    feedback.textContent = "⏳ Forjando herói...";

    const isMista = document.getElementById("radioShMista").checked;

    const payload = {
        NOME: nome,
        GENERO: document.getElementById("shGenero").value.trim(),
        NIVEL: Number(document.getElementById("shNivel").value) || 1,
        IMAGEM: document.getElementById("shImagemUrl").value.trim(),
        CLASSE: document.getElementById("shClasse").value,
        SUBCLASSE: document.getElementById("shSubclasse").value || "",
        ANCESTRALIDADE_TIPO: isMista ? "mista" : "unica",
        ANCESTRALIDADE: isMista ? document.getElementById("shAncestralidadeMista1").value : document.getElementById("shAncestralidade").value,
        ANCESTRALIDADE_SECUNDARIA: isMista ? document.getElementById("shAncestralidadeMista2").value : "",
        COMUNIDADE: isMista ? document.getElementById("shComunidadeMista").value : document.getElementById("shComunidade").value,
        AGILIDADE: Number(document.getElementById("shAgilidade").value) || 0,
        FORCA: Number(document.getElementById("shForca").value) || 0,
        ACUIDADE: Number(document.getElementById("shAcuidade").value) || 0,
        INSTINTO: Number(document.getElementById("shInstinto").value) || 0,
        PRESENCA: Number(document.getElementById("shPresenca").value) || 0,
        CONHECIMENTO: Number(document.getElementById("shConhecimento").value) || 0,
        EVASAO: Number(document.getElementById("shEvasao").value) || 10,
        ARMADURA: Number(document.getElementById("shArmadura").value) || 0,
        ARMADURA_ATUAL: armaduraMarcada,
        ARMADURA_SLOTS: 6,
        PV_ATUAL: pvMarcado,
        PV_MAXIMO: Number(document.getElementById("shPvMaximo").value) || 6,
        PF_ATUAL: pfMarcado,
        PF_MAXIMO: Number(document.getElementById("shPfMaximo").value) || 6,
        ESPERANCA: esperancaValor,
        PROFICIENCIA: proficienciaValor,
        DANO_MENOR: Number(document.getElementById("shDanoMenor").value) || 1,
        DANO_MAIOR: Number(document.getElementById("shDanoMaior").value) || 8,
        DANO_GRAVE: Number(document.getElementById("shDanoGrave").value) || 15,
        EXPERIENCIAS: JSON.stringify(extrairExperienciasFichaGrande()),
        HABILIDADES_CLASSE: document.getElementById("shHabilidadesClasse").value,
        HABILIDADE_SUBCLASSE: document.getElementById("shHabilidadeSubclasse").value,
        HABILIDADE_COMUNIDADE: document.getElementById("shHabilidadeComunidade").value,
        HABILIDADE_RACA: document.getElementById("shHabilidadeRaca").value,
        ARMA_PRINCIPAL: JSON.stringify({
            nome: document.getElementById("shArmaP_Nome").value,
            atributo: document.getElementById("shArmaP_Atrib").value,
            dano: document.getElementById("shArmaP_Dano").value,
            habilidade: document.getElementById("shArmaP_Hab").value
        }),
        ARMA_SECUNDARIA: JSON.stringify({
            nome: document.getElementById("shArmaS_Nome").value,
            atributo: document.getElementById("shArmaS_Atrib").value,
            dano: document.getElementById("shArmaS_Dano").value,
            habilidade: document.getElementById("shArmaS_Hab").value
        }),
        ARMADURA_ATIVA: JSON.stringify({
            nome: document.getElementById("shArmaduraNome").value,
            base: document.getElementById("shArmaduraBase").value,
            limiares: document.getElementById("shArmaduraLimiares").value,
            habilidade: document.getElementById("shArmaduraHab").value
        }),
        INVENTARIO: extrairInventarioEstruturado(),
        OURO_PUNHADOS: Number(document.getElementById("shOuroPunhados").value) || 0,
        OURO_BOLSAS: Number(document.getElementById("shOuroBolsas").value) || 0,
        OURO_BAU: Number(document.getElementById("shOuroBau").value) || 0,
        CARTAS_DOMINIO: JSON.stringify(cartasEquipadasIds)
    };

    try {
        const res = await apiFetch("/personagens", {
            method: "POST",
            body: payload
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao cadastrar ficha.");

        feedback.textContent = "✅ Herói cadastrado! Redirecionando...";
        setTimeout(() => {
            window.location.href = "personagens.html";
        }, 500);
    } catch (err) {
        feedback.textContent = "❌ Erro: " + err.message;
        btn.disabled = false;
        btnTop.disabled = false;
    }
}
