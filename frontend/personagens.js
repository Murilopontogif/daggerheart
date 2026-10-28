// ==========================================================================
// DAGGERHEART - VISUALIZAÇÃO E GERENCIAMENTO DE PERSONAGENS (personagens.js)
// ==========================================================================

const sessao = exigirAutenticacao();
if (!sessao) throw new Error("Acesso não autorizado.");

const isMestre = sessao.usuario.papel === "mestre";

let todosPersonagens = [];
let dadosSistema = null;
let heroiAtivo = null;
let cartasEquipadasIds = [];
let modoVisualizacao = "cards";

// Estado de Recursos Interativos na Ficha Grande
let pvMarcado = 0;
let pfMarcado = 0;
let armaduraMarcada = 0;
let esperancaValor = 2;
let proficienciaValor = 1;

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosFicha();
    await carregarDadosSistema();
    await carregarPersonagens();
});

async function carregarDadosSistema() {
    try {
        const res = await apiFetch("/personagens/dados-sistema");
        if (res.ok) {
            const data = await res.json();
            dadosSistema = data.DAGGERHEART_DATA;
            window.DAGGERHEART_DATA = dadosSistema;
            popularSelectsFichaGrande();
        }
    } catch (err) {
        console.error("Erro ao carregar dados do sistema:", err);
    }
}

async function carregarPersonagens() {
    const grid = document.getElementById("gridPersonagens");
    grid.innerHTML = `<div class="combat-empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><h4>Carregando Heróis...</h4></div>`;

    try {
        const res = await apiFetch("/personagens");
        if (!res.ok) throw new Error("Falha ao buscar personagens.");

        todosPersonagens = await res.json();
        atualizarFiltroMestre();
        filtrarPersonagens();
    } catch (err) {
        grid.innerHTML = `<div class="combat-empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><h4>${err.message}</h4></div>`;
    }
}

function atualizarFiltroMestre() {
    if (!isMestre) return;

    const box = document.getElementById("filtroMestreBox");
    const select = document.getElementById("filtroCriador");
    if (!box || !select) return;

    box.style.display = "flex";
    const valorAtual = select.value;

    const criadores = [...new Set(todosPersonagens.map(p => p.CRIADOR_NOME).filter(Boolean))];
    select.innerHTML = `<option value="">Todos os Jogadores (${todosPersonagens.length})</option>`;
    criadores.forEach(c => {
        select.innerHTML += `<option value="${c}">${c}</option>`;
    });
    select.value = valorAtual;
}

function filtrarPersonagens() {
    const criadorSel = document.getElementById("filtroCriador") ? document.getElementById("filtroCriador").value : "";
    const termoBusca = (document.getElementById("inputBuscaHeroi")?.value || "").trim().toLowerCase();

    const filtrados = todosPersonagens.filter(p => {
        const matchCriador = !criadorSel || p.CRIADOR_NOME === criadorSel;
        const matchBusca = !termoBusca ||
            String(p.ID) === termoBusca ||
            (p.NOME || "").toLowerCase().includes(termoBusca) ||
            (p.CLASSE || "").toLowerCase().includes(termoBusca) ||
            (p.ANCESTRALIDADE || "").toLowerCase().includes(termoBusca);
        return matchCriador && matchBusca;
    });

    renderizarCardsPersonagens(filtrados);
    renderizarTabelaPersonagens(filtrados);
}

function alternarVisualizacao(modo) {
    modoVisualizacao = modo;
    const btnCards = document.getElementById("btnViewCards");
    const btnTable = document.getElementById("btnViewTable");
    const grid = document.getElementById("gridPersonagens");
    const table = document.getElementById("tableWrapper");

    if (modo === "table") {
        btnTable.classList.add("active");
        btnCards.classList.remove("active");
        grid.style.display = "none";
        table.style.display = "block";
    } else {
        btnCards.classList.add("active");
        btnTable.classList.remove("active");
        grid.style.display = "grid";
        table.style.display = "none";
    }
}

function formatarAttr(val) {
    const n = Number(val) || 0;
    return n >= 0 ? `+${n}` : `${n}`;
}

function renderizarCardsPersonagens(lista) {
    const grid = document.getElementById("gridPersonagens");

    if (!lista || lista.length === 0) {
        grid.innerHTML = `
            <div class="combat-empty-state" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-scroll fa-2x"></i>
                <h4>Nenhum Herói Encontrado</h4>
                <p>Você ainda não possui fichas cadastradas ou nenhum herói corresponde ao filtro.</p>
                <a href="criar-ficha.html" class="btn btn-primary btn-sm" style="margin-top: 8px; text-decoration: none;">
                    <i class="fa-solid fa-plus"></i> Criar Nova Ficha Grandona
                </a>
            </div>
        `;
        return;
    }

    grid.innerHTML = lista.map(p => {
        const temFoto = p.IMAGEM && p.IMAGEM.trim() !== "";
        const photoHtml = temFoto
            ? `<img src="${p.IMAGEM}" alt="${p.NOME}" class="square-photo-img" onerror="this.style.display='none';">`
            : `<div class="square-photo-placeholder"><i class="fa-solid fa-user-shield"></i></div>`;

        const herancaLabel = p.ANCESTRALIDADE_TIPO === "mista" && p.ANCESTRALIDADE_SECUNDARIA
            ? `${p.ANCESTRALIDADE} + ${p.ANCESTRALIDADE_SECUNDARIA} (Mista)`
            : (p.ANCESTRALIDADE || "—");

        const criadorTag = isMestre
            ? `<span class="subclass-badge"><i class="fa-solid fa-user"></i> ${p.CRIADOR_NOME || "Mesa"}</span>`
            : "";

        return `
            <div class="hero-square" onclick="abrirFichaGrandePorId(${p.ID})">
                <div class="square-photo-wrap">
                    ${photoHtml}
                    <div class="square-photo-overlay"></div>
                    <span class="badge-id">#${p.ID}</span>
                    <span class="badge-level">Nível ${p.NIVEL || 1}</span>
                    <span class="square-click-hint"><i class="fa-solid fa-expand"></i> Abrir Ficha</span>
                </div>

                <div class="square-content">
                    <div class="square-title-row">
                        <div class="square-hero-name">${p.NOME}</div>
                        <div class="square-tags">
                            <span class="class-badge">${p.CLASSE || "Aventureiro"}</span>
                            ${p.SUBCLASSE ? `<span class="subclass-badge">${p.SUBCLASSE}</span>` : ""}
                            ${criadorTag}
                        </div>
                        <div class="heritage-text">
                            <i class="fa-solid fa-dna" style="color: var(--accent-gold); margin-right: 4px;"></i>
                            ${herancaLabel} • ${p.COMUNIDADE || "—"}
                        </div>
                    </div>

                    <!-- 6 Atributos -->
                    <div class="square-attrs-grid">
                        <div class="square-attr-box">
                            <span class="square-attr-label">AGI</span>
                            <span class="square-attr-val">${formatarAttr(p.AGILIDADE)}</span>
                        </div>
                        <div class="square-attr-box">
                            <span class="square-attr-label">FOR</span>
                            <span class="square-attr-val">${formatarAttr(p.FORCA)}</span>
                        </div>
                        <div class="square-attr-box">
                            <span class="square-attr-label">ACU</span>
                            <span class="square-attr-val">${formatarAttr(p.ACUIDADE)}</span>
                        </div>
                        <div class="square-attr-box">
                            <span class="square-attr-label">INS</span>
                            <span class="square-attr-val">${formatarAttr(p.INSTINTO)}</span>
                        </div>
                        <div class="square-attr-box">
                            <span class="square-attr-label">PRE</span>
                            <span class="square-attr-val">${formatarAttr(p.PRESENCA)}</span>
                        </div>
                        <div class="square-attr-box">
                            <span class="square-attr-label">CON</span>
                            <span class="square-attr-val">${formatarAttr(p.CONHECIMENTO)}</span>
                        </div>
                    </div>

                    <!-- Status de Combate -->
                    <div class="square-combat-row">
                        <span class="combat-pill pill-evasion" title="Evasão">
                            <i class="fa-solid fa-wind"></i> ${p.EVASAO || 10}
                        </span>
                        <span class="combat-pill pill-armor" title="Armadura">
                            <i class="fa-solid fa-shield"></i> ${p.ARMADURA || 0}
                        </span>
                        <span class="combat-pill pill-hp" title="Pontos de Vida">
                            <i class="fa-solid fa-heart"></i> ${p.PV_ATUAL ?? p.PV_MAXIMO ?? 6}/${p.PV_MAXIMO || 6}
                        </span>
                        <span class="combat-pill pill-hope" title="Esperança">
                            <i class="fa-solid fa-wand-sparkles"></i> ${p.ESPERANCA ?? 2}
                        </span>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="square-actions" style="grid-template-columns: 1.2fr 1fr auto;" onclick="event.stopPropagation()">
                        <button type="button" class="square-btn square-btn-open" onclick="abrirFichaGrandePorId(${p.ID})">
                            <i class="fa-solid fa-scroll"></i> Ficha
                        </button>
                        <button type="button" class="square-btn square-btn-combat" onclick="enviarHeroiParaCombate(${p.ID}, '${(p.NOME || "").replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-swords"></i> Combate
                        </button>
                        <button type="button" class="square-btn square-btn-delete" onclick="excluirPersonagem(${p.ID}, '${(p.NOME || "").replace(/'/g, "\\'")}')" title="Excluir Ficha">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function renderizarTabelaPersonagens(lista) {
    const tbody = document.getElementById("tabelaPersonagens");
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px; color: var(--text-muted);">Nenhum herói encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const avatar = p.IMAGEM
            ? `<img src="${p.IMAGEM}" class="table-avatar-img" alt="${p.NOME}">`
            : `<div class="table-avatar-placeholder"><i class="fa-solid fa-user-shield"></i></div>`;

        return `
            <tr onclick="abrirFichaGrandePorId(${p.ID})" style="cursor: pointer;">
                <td>${avatar}</td>
                <td><strong style="color: var(--accent-gold);">#${p.ID}</strong></td>
                <td>
                    <strong>${p.NOME}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${p.GENERO || "—"}</div>
                </td>
                <td><span class="subclass-badge">${p.CRIADOR_NOME || sessao.usuario.login}</span></td>
                <td>
                    <span class="class-badge">${p.CLASSE}</span>
                    <span class="level-tag">Nv ${p.NIVEL || 1}</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${p.SUBCLASSE || ""}</div>
                </td>
                <td>${p.ANCESTRALIDADE} • ${p.COMUNIDADE}</td>
                <td>
                    <div class="attrs-mini-grid">
                        <span class="attr-pill"><span>AGI</span><strong>${formatarAttr(p.AGILIDADE)}</strong></span>
                        <span class="attr-pill"><span>FOR</span><strong>${formatarAttr(p.FORCA)}</strong></span>
                        <span class="attr-pill"><span>ACU</span><strong>${formatarAttr(p.ACUIDADE)}</strong></span>
                        <span class="attr-pill"><span>INS</span><strong>${formatarAttr(p.INSTINTO)}</strong></span>
                        <span class="attr-pill"><span>PRE</span><strong>${formatarAttr(p.PRESENCA)}</strong></span>
                        <span class="attr-pill"><span>CON</span><strong>${formatarAttr(p.CONHECIMENTO)}</strong></span>
                    </div>
                </td>
                <td>
                    <div class="combat-stats">
                        <span class="combat-pill pill-evasion"><i class="fa-solid fa-wind"></i> ${p.EVASAO || 10}</span>
                        <span class="combat-pill pill-hp"><i class="fa-solid fa-heart"></i> ${p.PV_MAXIMO || 6}</span>
                    </div>
                </td>
                <td onclick="event.stopPropagation()">
                    <div class="table-actions">
                        <button type="button" class="square-btn square-btn-open" onclick="abrirFichaGrandePorId(${p.ID})"><i class="fa-solid fa-folder-open"></i></button>
                        <button type="button" class="square-btn square-btn-combat" onclick="enviarHeroiParaCombate(${p.ID}, '${(p.NOME || "").replace(/'/g, "\\'")}')"><i class="fa-solid fa-swords"></i></button>
                        <button type="button" class="square-btn square-btn-delete" onclick="excluirPersonagem(${p.ID}, '${(p.NOME || "").replace(/'/g, "\\'")}')"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

async function enviarHeroiParaCombate(personagemId, nome) {
    try {
        const res = await apiFetch("/api/combate/adicionar-heroi", {
            method: "POST",
            body: { personagemId }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao adicionar ao combate.");

        mostrarMensagem(`⚔️ ${nome} entrou na Arena de Combate!`, "success");
    } catch (err) {
        mostrarMensagem(`⚠️ ${err.message}`, "error");
    }
}

async function excluirPersonagem(id, nome) {
    if (!confirm(`Deseja realmente excluir permanentemente a ficha de "${nome}"?`)) return;

    try {
        const res = await apiFetch(`/personagens/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir.");

        mostrarMensagem(`Ficha de ${nome} removida do grimório.`, "success");
        await carregarPersonagens();
    } catch (err) {
        mostrarMensagem(`Erro: ${err.message}`, "error");
    }
}

function mostrarMensagem(texto, tipo = "info") {
    const container = document.getElementById("statusContainer");
    const el = document.getElementById("mensagem");
    if (!container || !el) return;

    container.style.display = "block";
    el.innerHTML = `<i class="fa-solid ${tipo === "error" ? "fa-triangle-exclamation" : "fa-circle-check"}"></i> <span>${texto}</span>`;
    setTimeout(() => { container.style.display = "none"; }, 4500);
}

// ==========================================================================
// MODAL DA FICHA GRANDE OFICIAL (POPULAÇÃO, INVENTÁRIO E SALVAMENTO)
// ==========================================================================

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
}

async function abrirFichaGrandePorId(id) {
    try {
        const res = await apiFetch(`/personagens/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar detalhes do personagem.");

        const p = await res.json();
        heroiAtivo = p;

        preencherDadosFichaGrande(p);
        document.getElementById("modalFichaGrande").style.display = "flex";
    } catch (err) {
        mostrarMensagem("Erro: " + err.message, "error");
    }
}

function preencherDadosFichaGrande(p) {
    document.getElementById("shNome").value = p.NOME || "";
    document.getElementById("shGenero").value = p.GENERO || "";
    document.getElementById("shNivel").value = p.NIVEL || 1;
    document.getElementById("shImagemUrl").value = p.IMAGEM || "";
    atualizarFotoFichaGrande();

    // Classe e Subclasse
    const shClasse = document.getElementById("shClasse");
    shClasse.value = p.CLASSE || Object.keys(dadosSistema.CLASSES)[0];
    aoMudarClasseFichaGrande(false);

    const shSubclasse = document.getElementById("shSubclasse");
    if (p.SUBCLASSE) shSubclasse.value = p.SUBCLASSE;
    aoMudarSubclasseFichaGrande(false);

    // Ancestralidade
    const isMista = p.ANCESTRALIDADE_TIPO === "mista";
    document.getElementById("radioShUnica").checked = !isMista;
    document.getElementById("radioShMista").checked = isMista;
    alternarModoAncestryFichaGrande(isMista ? "mista" : "unica");

    if (isMista) {
        document.getElementById("shAncestralidadeMista1").value = p.ANCESTRALIDADE || "";
        aoMudarRacaMista1FichaGrande();
        document.getElementById("shAncestralidadeMista2").value = p.ANCESTRALIDADE_SECUNDARIA || "";
        aoMudarRacaMista2FichaGrande();
    } else {
        document.getElementById("shAncestralidade").value = p.ANCESTRALIDADE || "";
        aoMudarRacaFichaGrande(false);
    }

    // Comunidade
    document.getElementById("shComunidade").value = p.COMUNIDADE || "";
    document.getElementById("shComunidadeMista").value = p.COMUNIDADE || "";
    aoMudarComunidadeFichaGrande(false);

    // Atributos
    document.getElementById("shAgilidade").value = p.AGILIDADE ?? 0;
    document.getElementById("shForca").value = p.FORCA ?? 0;
    document.getElementById("shAcuidade").value = p.ACUIDADE ?? 0;
    document.getElementById("shInstinto").value = p.INSTINTO ?? 0;
    document.getElementById("shPresenca").value = p.PRESENCA ?? 0;
    document.getElementById("shConhecimento").value = p.CONHECIMENTO ?? 0;

    // Defesas & Recursos
    document.getElementById("shEvasao").value = p.EVASAO ?? 10;
    document.getElementById("shArmadura").value = p.ARMADURA ?? 0;
    document.getElementById("shDanoMenor").value = p.DANO_MENOR ?? 1;
    document.getElementById("shDanoMaior").value = p.DANO_MAIOR ?? 8;
    document.getElementById("shDanoGrave").value = p.DANO_GRAVE ?? 15;

    document.getElementById("shPvMaximo").value = p.PV_MAXIMO || 6;
    document.getElementById("shPfMaximo").value = p.PF_MAXIMO || 6;

    pvMarcado = p.PV_ATUAL ?? p.PV_MAXIMO ?? 6;
    pfMarcado = p.PF_ATUAL ?? 0;
    armaduraMarcada = p.ARMADURA_ATUAL ?? 0;
    esperancaValor = p.ESPERANCA ?? 2;
    proficienciaValor = p.PROFICIENCIA ?? 1;

    renderizarTrilhasPvPfArmadura();

    // Habilidades Salvas
    if (p.HABILIDADES_CLASSE) document.getElementById("shHabilidadesClasse").value = p.HABILIDADES_CLASSE;
    if (p.HABILIDADE_SUBCLASSE) document.getElementById("shHabilidadeSubclasse").value = p.HABILIDADE_SUBCLASSE;
    if (p.HABILIDADE_COMUNIDADE) document.getElementById("shHabilidadeComunidade").value = p.HABILIDADE_COMUNIDADE;
    if (p.HABILIDADE_RACA) document.getElementById("shHabilidadeRaca").value = p.HABILIDADE_RACA;

    // Experiências
    preencherExperienciasFichaGrande(p.EXPERIENCIAS);

    // Armas e Equipamentos
    preencherEquipamentosFichaGrande(p);

    // Inventário Estruturado
    preencherInventarioEstruturado(p);

    // Ouro
    document.getElementById("shOuroPunhados").value = p.OURO_PUNHADOS ?? 1;
    document.getElementById("shOuroBolsas").value = p.OURO_BOLSAS ?? 0;
    document.getElementById("shOuroBau").value = p.OURO_BAU ?? 0;

    // Cartas de Domínio
    cartasEquipadasIds = [];
    try {
        const c = typeof p.CARTAS_DOMINIO === "string" ? JSON.parse(p.CARTAS_DOMINIO) : p.CARTAS_DOMINIO;
        if (Array.isArray(c)) cartasEquipadasIds = c.map(Number);
    } catch {}
    renderizarCartasEquipadas();
}

function preencherExperienciasFichaGrande(expRaw) {
    const list = document.getElementById("shExperienciasList");
    list.innerHTML = "";
    let exps = [];
    try {
        exps = typeof expRaw === "string" ? JSON.parse(expRaw) : (expRaw || []);
    } catch { exps = []; }

    if (!Array.isArray(exps) || exps.length === 0) {
        adicionarLinhaExperiencia("Explorador das Ruínas", 2);
        adicionarLinhaExperiencia("Sobrevivente de Batalha", 2);
    } else {
        exps.forEach(e => adicionarLinhaExperiencia(e.nome || "", e.valor ?? e.bonus ?? 2));
    }
}

function adicionarLinhaExperiencia(nome = "", valor = 2) {
    const list = document.getElementById("shExperienciasList");
    const div = document.createElement("div");
    div.className = "exp-row";
    div.innerHTML = `
        <input type="text" class="exp-name" value="${nome}" placeholder="Ex: Ladrão de Guilda, Guarda Real...">
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

function preencherEquipamentosFichaGrande(p) {
    try {
        const ap = typeof p.ARMA_PRINCIPAL === "string" ? JSON.parse(p.ARMA_PRINCIPAL) : (p.ARMA_PRINCIPAL || {});
        document.getElementById("shArmaP_Nome").value = ap.nome || "";
        document.getElementById("shArmaP_Atrib").value = ap.atributo || "";
        document.getElementById("shArmaP_Dano").value = ap.dano || "";
        document.getElementById("shArmaP_Hab").value = ap.habilidade || "";
    } catch {}

    try {
        const as = typeof p.ARMA_SECUNDARIA === "string" ? JSON.parse(p.ARMA_SECUNDARIA) : (p.ARMA_SECUNDARIA || {});
        document.getElementById("shArmaS_Nome").value = as.nome || "";
        document.getElementById("shArmaS_Atrib").value = as.atributo || "";
        document.getElementById("shArmaS_Dano").value = as.dano || "";
        document.getElementById("shArmaS_Hab").value = as.habilidade || "";
    } catch {}

    try {
        const arm = typeof p.ARMADURA_ATIVA === "string" ? JSON.parse(p.ARMADURA_ATIVA) : (p.ARMADURA_ATIVA || {});
        document.getElementById("shArmaduraNome").value = arm.nome || "";
        document.getElementById("shArmaduraBase").value = arm.base ?? p.ARMADURA ?? 0;
        document.getElementById("shArmaduraLimiares").value = arm.limiares || "";
        document.getElementById("shArmaduraHab").value = arm.habilidade || "";
    } catch {}
}

// --------------------------------------------------------------------------
// INVENTÁRIO ESTRUTURADO
// --------------------------------------------------------------------------

function preencherInventarioEstruturado(p) {
    const container = document.getElementById("listaItensInventario");
    container.innerHTML = "";

    let itens = [];
    let textoNotas = "";

    try {
        if (p.INVENTARIO) {
            const parsed = typeof p.INVENTARIO === "string" ? JSON.parse(p.INVENTARIO) : p.INVENTARIO;
            if (Array.isArray(parsed)) {
                itens = parsed;
            } else if (parsed && typeof parsed === "object") {
                itens = parsed.itens || [];
                textoNotas = parsed.notas || "";
            } else {
                textoNotas = String(p.INVENTARIO);
            }
        }
    } catch {
        textoNotas = String(p.INVENTARIO || "");
    }

    document.getElementById("shInventario").value = textoNotas;

    if (itens.length === 0) {
        adicionarLinhaItemInventario("Mochila de Aventureiro", 1, "Geral", "Corda, tochas e cantil");
        adicionarLinhaItemInventario("Poção de Vida Menor", 2, "Consumível", "Recupera 1d4 PV");
    } else {
        itens.forEach(item => {
            adicionarLinhaItemInventario(item.nome, item.qtd, item.categoria || item.slots || "Item", item.detalhes);
        });
    }
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
// SALVAR FICHA GRANDE (UPDATE)
// --------------------------------------------------------------------------

async function salvarFichaGrande() {
    if (!heroiAtivo) return;

    const feedback = document.getElementById("sheetFeedbackMsg");
    feedback.textContent = "⏳ Salvando alterações...";

    const isMista = document.getElementById("radioShMista").checked;

    const payload = {
        NOME: document.getElementById("shNome").value.trim(),
        GENERO: document.getElementById("shGenero").value.trim(),
        NIVEL: Number(document.getElementById("shNivel").value) || 1,
        IMAGEM: document.getElementById("shImagemUrl").value.trim(),
        CLASSE: document.getElementById("shClasse").value,
        SUBCLASSE: document.getElementById("shSubclasse").value,
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
        const res = await apiFetch(`/personagens/${heroiAtivo.ID}`, {
            method: "PUT",
            body: payload
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensagem || "Erro ao salvar.");

        feedback.textContent = "✅ Ficha salva com sucesso!";
        setTimeout(() => { feedback.textContent = ""; }, 3000);
        await carregarPersonagens();
    } catch (err) {
        feedback.textContent = "❌ Erro: " + err.message;
    }
}

// --------------------------------------------------------------------------
// RECURSOS INTERATIVOS E AUXILIARES DA FICHA
// --------------------------------------------------------------------------

function configurarEventosFicha() {
    document.getElementById("btnFecharFichaGrande").addEventListener("click", () => {
        document.getElementById("modalFichaGrande").style.display = "none";
    });
    document.getElementById("btnSalvarFichaGrande").addEventListener("click", salvarFichaGrande);
    document.getElementById("btnAbrirSeletorCartas").addEventListener("click", abrirModalCartasDominio);
    document.getElementById("btnFecharSeletorCartas").addEventListener("click", fecharModalCartasDominio);
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
    } else {
        rowU.style.display = "flex";
        rowM.style.display = "none";
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

function renderizarTrilhasPvPfArmadura() {
    // PV
    const maxPv = Math.max(1, Math.min(18, Number(document.getElementById("shPvMaximo").value) || 6));
    const hpContainer = document.getElementById("hpTrackPills");
    hpContainer.innerHTML = "";
    for (let i = 1; i <= maxPv; i++) {
        const filled = i <= pvMarcado;
        hpContainer.innerHTML += `<div class="track-pill ${filled ? "filled" : ""}" onclick="alternarPv(${i})" title="PV ${i}/${maxPv}"></div>`;
    }

    // PF (Fadiga)
    const maxPf = Math.max(1, Math.min(18, Number(document.getElementById("shPfMaximo").value) || 6));
    const stressContainer = document.getElementById("stressTrackPills");
    stressContainer.innerHTML = "";
    for (let i = 1; i <= maxPf; i++) {
        const filled = i <= pfMarcado;
        stressContainer.innerHTML += `<div class="track-pill ${filled ? "filled" : ""}" onclick="alternarPf(${i})" title="Fadiga ${i}/${maxPf}"></div>`;
    }

    // Slots de Armadura (6 escudos)
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

    // Esperança (6 diamantes)
    const hopeContainer = document.getElementById("hopeDiamondsRow");
    hopeContainer.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        const filled = i <= esperancaValor;
        hopeContainer.innerHTML += `<div class="hope-diamond ${filled ? "filled" : ""}" onclick="setEsperanca(${i})" title="Esperança ${i}"></div>`;
    }

    // Proficiência (6 círculos)
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
// CARTAS DE DOMÍNIO (OFICIAIS)
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
                Nenhuma Carta de Domínio equipada. Clique em <strong>"Adicionar / Trocar Cartas"</strong> para abrir o catálogo oficial.
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
                        <span class="card-ui-cost" title="Custo de Troca"><i class="fa-solid fa-bolt"></i> ${custo}</span>
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
