// ==========================================================================
// DAGGERHEART RPG - SISTEMA COMPLETO DE GERENCIAMENTO DE FICHAS & CARTAS
// ==========================================================================

const API_URL = "http://localhost:3000/personagens";

// Elementos da Interface Principal
const form = document.getElementById("formulario");
const formTitle = document.getElementById("formTitle");
const btnSalvar = document.getElementById("btnSalvar");
const btnSaveText = document.getElementById("btnSaveText");
const btnCancelar = document.getElementById("btnCancelar");
const botaoBuscar = document.getElementById("btnBuscar");
const btnBuscarId = document.getElementById("btnBuscarId");
const buscarIdInput = document.getElementById("buscarIdInput");
const mensagem = document.getElementById("mensagem");

// Elementos de Visualização
const gridPersonagens = document.getElementById("gridPersonagens");
const listarPersonagens = document.getElementById("listarPersonagens");
const tableContainer = document.getElementById("tableContainer");
const btnViewCards = document.getElementById("btnViewCards");
const btnViewTable = document.getElementById("btnViewTable");

// Campos do Formulário Lateral (Forja)
const cNome = document.getElementById("nome");
const cImagem = document.getElementById("imagem");
const previewFoto = document.getElementById("previewFoto");
const placeholderFoto = document.getElementById("placeholderFoto");
const cClasse = document.getElementById("classe");
const cSubclasse = document.getElementById("subclasse");
const hintDomainsText = document.getElementById("hintDomainsText");
const classDomainsBadge = document.getElementById("classDomainsBadge");

// Ancestralidade Lateral (Única vs Mista)
const cAncestryUnicaBox = document.getElementById("cAncestryUnicaBox");
const cAncestryMistaBox = document.getElementById("cAncestryMistaBox");
const cAncestralidade = document.getElementById("ancestralidade");
const cComunidade = document.getElementById("comunidade");
const cAncestralidade1 = document.getElementById("cAncestralidade1");
const cPoderRaca1 = document.getElementById("cPoderRaca1");
const cAncestralidade2 = document.getElementById("cAncestralidade2");
const cPoderRaca2 = document.getElementById("cPoderRaca2");
const cComunidadeMista = document.getElementById("cComunidadeMista");

// Prévia Lateral das Habilidades
const cPrevHabClasse = document.getElementById("cPrevHabClasse");
const cPrevHabSubclasse = document.getElementById("cPrevHabSubclasse");
const cPrevHabComunidade = document.getElementById("cPrevHabComunidade");
const cPrevHabRaca = document.getElementById("cPrevHabRaca");

const cNivel = document.getElementById("nivel");
const cGenero = document.getElementById("genero");
const cAgilidade = document.getElementById("agilidade");
const cForca = document.getElementById("forca");
const cAcuidade = document.getElementById("acuidade");
const cInstinto = document.getElementById("instinto");
const cPresenca = document.getElementById("presenca");
const cConhecimento = document.getElementById("conhecimento");
const cEvasao = document.getElementById("evasao");
const cPvMaximo = document.getElementById("pvMaximo");
const cEsperanca = document.getElementById("esperanca");

// Elementos do Modal da Ficha Grande Oficial
const modalFichaGrande = document.getElementById("modalFichaGrande");
const btnFecharFichaGrande = document.getElementById("btnFecharFichaGrande");
const btnSalvarFichaGrande = document.getElementById("btnSalvarFichaGrande");
const btnAbrirSeletorCartas = document.getElementById("btnAbrirSeletorCartas");
const btnGerenciarCartas = document.getElementById("btnGerenciarCartas");
const sheetFeedbackMsg = document.getElementById("sheetFeedbackMsg");

// Campos da Ficha Grande
const shNome = document.getElementById("shNome");
const shGenero = document.getElementById("shGenero");
const shNivel = document.getElementById("shNivel");

// Ancestralidade Modal (Única vs Mista)
const shAncestryUnicaBox = document.getElementById("shAncestryUnicaBox");
const shAncestryMistaBox = document.getElementById("shAncestryMistaBox");
const shAncestralidade = document.getElementById("shAncestralidade");
const shComunidade = document.getElementById("shComunidade");
const shAncestralidadeMista1 = document.getElementById("shAncestralidadeMista1");
const shPoderRaca1 = document.getElementById("shPoderRaca1");
const shAncestralidadeMista2 = document.getElementById("shAncestralidadeMista2");
const shPoderRaca2 = document.getElementById("shPoderRaca2");
const shComunidadeMista = document.getElementById("shComunidadeMista");

const shClasse = document.getElementById("shClasse");
const shSubclasse = document.getElementById("shSubclasse");

const shEvasao = document.getElementById("shEvasao");
const shArmadura = document.getElementById("shArmadura");
const armorHeartsSlots = document.getElementById("armorHeartsSlots");

const shAgilidade = document.getElementById("shAgilidade");
const shForca = document.getElementById("shForca");
const shAcuidade = document.getElementById("shAcuidade");
const shInstinto = document.getElementById("shInstinto");
const shPresenca = document.getElementById("shPresenca");
const shConhecimento = document.getElementById("shConhecimento");

const shDanoMenor = document.getElementById("shDanoMenor");
const shDanoMaior = document.getElementById("shDanoMaior");
const shDanoGrave = document.getElementById("shDanoGrave");
const hpTrackPills = document.getElementById("hpTrackPills");
const stressTrackPills = document.getElementById("stressTrackPills");
const shPvMaximo = document.getElementById("shPvMaximo");
const shPfMaximo = document.getElementById("shPfMaximo");

const hopeDiamondsRow = document.getElementById("hopeDiamondsRow");
const shHabilidadeEsperanca = document.getElementById("shHabilidadeEsperanca");

const experiencesList = document.getElementById("experiencesList");

const shOuroPunhados = document.getElementById("shOuroPunhados");
const shOuroBolsas = document.getElementById("shOuroBolsas");
const shOuroBau = document.getElementById("shOuroBau");

// 4 Blocos de Habilidades Canônicas da Ficha
const shHabClasseTitle = document.getElementById("shHabClasseTitle");
const shHabilidadesClasse = document.getElementById("shHabilidadesClasse");

const shHabSubclasseTitle = document.getElementById("shHabSubclasseTitle");
const shHabSubclasseCastTag = document.getElementById("shHabSubclasseCastTag");
const shHabilidadeSubclasse = document.getElementById("shHabilidadeSubclasse");

const shHabComunidadeTitle = document.getElementById("shHabComunidadeTitle");
const shHabilidadeComunidade = document.getElementById("shHabilidadeComunidade");

const shHabRacaTitle = document.getElementById("shHabRacaTitle");
const shHabRacaModeTag = document.getElementById("shHabRacaModeTag");
const shHabilidadeRaca = document.getElementById("shHabilidadeRaca");

// Armas e Equipamentos
const profDots = document.getElementById("profDots");
const shArmaP_Nome = document.getElementById("shArmaP_Nome");
const shArmaP_Atrib = document.getElementById("shArmaP_Atrib");
const shArmaP_Dano = document.getElementById("shArmaP_Dano");
const shArmaP_Hab = document.getElementById("shArmaP_Hab");

const shArmaS_Nome = document.getElementById("shArmaS_Nome");
const shArmaS_Atrib = document.getElementById("shArmaS_Atrib");
const shArmaS_Dano = document.getElementById("shArmaS_Dano");
const shArmaS_Hab = document.getElementById("shArmaS_Hab");

const shArmaduraNome = document.getElementById("shArmaduraNome");
const shArmaduraLimiares = document.getElementById("shArmaduraLimiares");
const shArmaduraBase = document.getElementById("shArmaduraBase");
const shArmaduraHab = document.getElementById("shArmaduraHab");
const shInventario = document.getElementById("shInventario");

const shDomainCardsBadge = document.getElementById("shDomainCardsBadge");
const shEquippedCardsGrid = document.getElementById("shEquippedCardsGrid");

// Elementos do Seletor / Drawer de Cartas de Domínio
const modalCartasDominio = document.getElementById("modalCartasDominio");
const btnFecharSeletorCartas = document.getElementById("btnFecharSeletorCartas");
const browserSubtitle = document.getElementById("browserSubtitle");
const filterDominio = document.getElementById("filterDominio");
const filterNivel = document.getElementById("filterNivel");
const filterTipo = document.getElementById("filterTipo");
const filterBuscaNome = document.getElementById("filterBuscaNome");
const browserCardsGrid = document.getElementById("browserCardsGrid");

// Estado Local
let currentHero = null;
let currentHeroId = null;
let idedicao = null;
let currentView = "cards";
let equippedCardIds = [];

let activeHpChecked = 0;
let activeStressChecked = 0;
let activeArmorChecked = 0;
let activeHopeValue = 2;
let activeProficiency = 1;

// ==========================================================================
// INICIALIZAÇÃO E CARREGAMENTO DE DADOS OFICIAIS DO BANCO DE DADOS
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    await carregarDadosSistemaDoBanco();
    popularOpcoesPredefinidas();
    buscarPersonagens();
    configurarEventosGerais();
    renderizarCombateCompleto();
});

async function carregarDadosSistemaDoBanco() {
    try {
        const res = await fetch(`${API_URL}/dados-sistema`);
        if (res.ok) {
            const dados = await res.json();
            if (dados.DAGGERHEART_DATA) window.DAGGERHEART_DATA = dados.DAGGERHEART_DATA;
            if (dados.DAGGERHEART_ENEMIES) window.DAGGERHEART_ENEMIES = dados.DAGGERHEART_ENEMIES;
        }
    } catch (erro) {
        console.warn("Usando cache local de dados ou banco indisponível:", erro);
    }
}

function popularOpcoesPredefinidas() {
    if (!window.DAGGERHEART_DATA) return;

    const { CLASSES, ANCESTRALIDADES, COMUNIDADES } = window.DAGGERHEART_DATA;

    // 1. Preencher Classes
    const classNames = Object.keys(CLASSES);
    cClasse.innerHTML = `<option value="" disabled selected>Selecione a Classe...</option>`;
    shClasse.innerHTML = "";
    classNames.forEach(nome => {
        cClasse.innerHTML += `<option value="${nome}">${nome}</option>`;
        shClasse.innerHTML += `<option value="${nome}">${nome}</option>`;
    });

    // 2. Preencher Ancestralidades (Raças)
    cAncestralidade.innerHTML = `<option value="" disabled selected>Selecione a Raça...</option>`;
    cAncestralidade1.innerHTML = "";
    cAncestralidade2.innerHTML = "";
    shAncestralidade.innerHTML = "";
    shAncestralidadeMista1.innerHTML = "";
    shAncestralidadeMista2.innerHTML = "";

    ANCESTRALIDADES.forEach(anc => {
        const opt = `<option value="${anc.nome}">${anc.nome}</option>`;
        cAncestralidade.innerHTML += opt;
        cAncestralidade1.innerHTML += opt;
        cAncestralidade2.innerHTML += opt;
        shAncestralidade.innerHTML += opt;
        shAncestralidadeMista1.innerHTML += opt;
        shAncestralidadeMista2.innerHTML += opt;
    });

    // Ajustar defaults da segunda raça
    if (cAncestralidade2.options.length > 1) cAncestralidade2.selectedIndex = 1;
    if (shAncestralidadeMista2.options.length > 1) shAncestralidadeMista2.selectedIndex = 1;

    // 3. Preencher Comunidades
    cComunidade.innerHTML = `<option value="" disabled selected>Selecione a Comunidade...</option>`;
    cComunidadeMista.innerHTML = "";
    shComunidade.innerHTML = "";
    shComunidadeMista.innerHTML = "";

    COMUNIDADES.forEach(com => {
        const opt = `<option value="${com.nome}">${com.nome}</option>`;
        cComunidade.innerHTML += opt;
        cComunidadeMista.innerHTML += opt;
        shComunidade.innerHTML += opt;
        shComunidadeMista.innerHTML += opt;
    });

    // Inicializar opções de poderes para mista
    atualizarPoderesSelect(cAncestralidade1.value, cPoderRaca1);
    atualizarPoderesSelect(cAncestralidade2.value, cPoderRaca2);
    atualizarPoderesSelect(shAncestralidadeMista1.value, shPoderRaca1);
    atualizarPoderesSelect(shAncestralidadeMista2.value, shPoderRaca2);

    atualizarPreviaHabilidadesForja();
}

function atualizarPoderesSelect(nomeRaca, selectEl, powerIdSelecionado = null) {
    if (!window.DAGGERHEART_DATA || !selectEl) return;
    const racaObj = window.DAGGERHEART_DATA.ANCESTRALIDADES.find(a => a.nome === nomeRaca);
    selectEl.innerHTML = "";

    if (!racaObj || !racaObj.poderes) return;

    racaObj.poderes.forEach((p, idx) => {
        const isSelected = powerIdSelecionado === p.id || (!powerIdSelecionado && idx === 0);
        selectEl.innerHTML += `<option value="${p.id}" ${isSelected ? "selected" : ""}>${p.nome}: ${p.desc}</option>`;
    });
}

function configurarEventosGerais() {
    form.addEventListener("submit", salvarPersonagemForja);
    botaoBuscar.addEventListener("click", buscarPersonagens);
    if (btnBuscarId) btnBuscarId.addEventListener("click", buscarPersonagemPorId);
    if (btnCancelar) btnCancelar.addEventListener("click", cancelarEdicaoForja);

    // Troca de visualização (Quadrados vs Tabela)
    if (btnViewCards && btnViewTable) {
        btnViewCards.addEventListener("click", () => setView("cards"));
        btnViewTable.addEventListener("click", () => setView("table"));
    }

    // Radios de Herança na Forja Lateral
    document.querySelectorAll('input[name="cAncestralidadeTipo"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            const isMista = e.target.value === "mista";
            cAncestryUnicaBox.style.display = isMista ? "none" : "flex";
            cAncestryMistaBox.style.display = isMista ? "block" : "none";
            atualizarPreviaHabilidadesForja();
        });
    });

    // Radios de Herança na Ficha Grande
    document.querySelectorAll('input[name="shAncestralidadeTipo"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            const isMista = e.target.value === "mista";
            shAncestryUnicaBox.style.display = isMista ? "none" : "flex";
            shAncestryMistaBox.style.display = isMista ? "grid" : "none";
            atualizarHabilidadesFichaGrande();
        });
    });

    // Mudança de classe no form lateral
    cClasse.addEventListener("change", () => {
        atualizarSubclassesEHint(cClasse.value, cSubclasse, hintDomainsText, classDomainsBadge);
        aplicarPadroesClasse(cClasse.value);
        atualizarPreviaHabilidadesForja();
    });

    cSubclasse.addEventListener("change", () => {
        atualizarPreviaHabilidadesForja();
    });

    // Mudança de ancestralidade e poderes na forja
    cAncestralidade.addEventListener("change", atualizarPreviaHabilidadesForja);
    cComunidade.addEventListener("change", atualizarPreviaHabilidadesForja);

    cAncestralidade1.addEventListener("change", () => {
        atualizarPoderesSelect(cAncestralidade1.value, cPoderRaca1);
        atualizarPreviaHabilidadesForja();
    });
    cPoderRaca1.addEventListener("change", atualizarPreviaHabilidadesForja);

    cAncestralidade2.addEventListener("change", () => {
        atualizarPoderesSelect(cAncestralidade2.value, cPoderRaca2);
        atualizarPreviaHabilidadesForja();
    });
    cPoderRaca2.addEventListener("change", atualizarPreviaHabilidadesForja);
    cComunidadeMista.addEventListener("change", atualizarPreviaHabilidadesForja);

    // Mudança de classe e subclasses na ficha grande
    shClasse.addEventListener("change", () => {
        atualizarSubclassesEHint(shClasse.value, shSubclasse);
        atualizarDominiosFichaGrande();
        atualizarHabilidadesFichaGrande();
    });

    shSubclasse.addEventListener("change", () => {
        atualizarHabilidadesFichaGrande();
    });

    shAncestralidade.addEventListener("change", atualizarHabilidadesFichaGrande);
    shComunidade.addEventListener("change", atualizarHabilidadesFichaGrande);

    shAncestralidadeMista1.addEventListener("change", () => {
        atualizarPoderesSelect(shAncestralidadeMista1.value, shPoderRaca1);
        atualizarHabilidadesFichaGrande();
    });
    shPoderRaca1.addEventListener("change", atualizarHabilidadesFichaGrande);

    shAncestralidadeMista2.addEventListener("change", () => {
        atualizarPoderesSelect(shAncestralidadeMista2.value, shPoderRaca2);
        atualizarHabilidadesFichaGrande();
    });
    shPoderRaca2.addEventListener("change", atualizarHabilidadesFichaGrande);
    shComunidadeMista.addEventListener("change", atualizarHabilidadesFichaGrande);

    // Foto e Presets
    if (cImagem) {
        cImagem.addEventListener("input", () => atualizarPreviaFoto(cImagem.value.trim()));
    }
    document.querySelectorAll(".btn-preset").forEach(btn => {
        btn.addEventListener("click", () => {
            const url = btn.getAttribute("data-url");
            if (url && cImagem) {
                cImagem.value = url;
                atualizarPreviaFoto(url);
            }
        });
    });

    // Eventos da Ficha Grande
    btnFecharFichaGrande.addEventListener("click", fecharFichaGrande);
    btnSalvarFichaGrande.addEventListener("click", salvarFichaGrande);
    btnAbrirSeletorCartas.addEventListener("click", abrirSeletorCartas);
    btnGerenciarCartas.addEventListener("click", abrirSeletorCartas);

    // Eventos do Seletor de Cartas
    btnFecharSeletorCartas.addEventListener("click", fecharSeletorCartas);
    filterDominio.addEventListener("change", renderizarCartasBrowser);
    filterNivel.addEventListener("change", renderizarCartasBrowser);
    filterTipo.addEventListener("change", renderizarCartasBrowser);
    filterBuscaNome.addEventListener("input", renderizarCartasBrowser);

    // Fechar com tecla ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalCartasDominio.style.display !== "none") {
                fecharSeletorCartas();
            } else if (modalFichaGrande.style.display !== "none") {
                fecharFichaGrande();
            }
        }
    });
}

function atualizarSubclassesEHint(classeNome, selectSubclasse, elHint, elBadge) {
    if (!window.DAGGERHEART_DATA || !window.DAGGERHEART_DATA.CLASSES[classeNome]) return;
    const info = window.DAGGERHEART_DATA.CLASSES[classeNome];

    selectSubclasse.innerHTML = "";
    info.subclasses.forEach(sub => {
        selectSubclasse.innerHTML += `<option value="${sub}">${sub}</option>`;
    });

    if (elHint) elHint.textContent = info.dominios.join(" & ");
    if (elBadge) elBadge.style.display = "flex";
}

function aplicarPadroesClasse(classeNome) {
    if (!window.DAGGERHEART_DATA || !window.DAGGERHEART_DATA.CLASSES[classeNome]) return;
    const info = window.DAGGERHEART_DATA.CLASSES[classeNome];
    cEvasao.value = info.evasao;
    cPvMaximo.value = info.pv;
    cEsperanca.value = info.esperanca;
}

// Atualização da Prévia no Formulário Lateral
function atualizarPreviaHabilidadesForja() {
    if (!window.DAGGERHEART_DATA) return;
    const { CLASSES, SUBCLASSES, ANCESTRALIDADES, COMUNIDADES } = window.DAGGERHEART_DATA;

    // Classe
    const cInfo = CLASSES[cClasse.value];
    cPrevHabClasse.textContent = cInfo ? cInfo.habilidade : "Selecione a classe";

    // Subclasse
    const subInfo = SUBCLASSES[cSubclasse.value];
    cPrevHabSubclasse.textContent = subInfo ? subInfo.habilidade : "Selecione a subclasse";

    const isMista = document.querySelector('input[name="cAncestralidadeTipo"]:checked')?.value === "mista";

    if (!isMista) {
        // Comunidade Única
        const comObj = COMUNIDADES.find(c => c.nome === cComunidade.value);
        cPrevHabComunidade.textContent = comObj ? comObj.habilidade : "Selecione a comunidade";

        // Ancestralidade Única
        const ancObj = ANCESTRALIDADES.find(a => a.nome === cAncestralidade.value);
        if (ancObj && ancObj.poderes) {
            cPrevHabRaca.textContent = ancObj.poderes.map(p => `${p.nome}: ${p.desc}`).join(" | ");
        } else {
            cPrevHabRaca.textContent = "Selecione a ancestralidade";
        }
    } else {
        // Comunidade Mista
        const comObj = COMUNIDADES.find(c => c.nome === cComunidadeMista.value);
        cPrevHabComunidade.textContent = comObj ? comObj.habilidade : "Selecione a comunidade";

        // Ancestralidade Mista (1 poder da 1ª e 1 poder da 2ª)
        const p1Text = cPoderRaca1.options[cPoderRaca1.selectedIndex]?.text || "";
        const p2Text = cPoderRaca2.options[cPoderRaca2.selectedIndex]?.text || "";
        cPrevHabRaca.textContent = `[${cAncestralidade1.value}] ${p1Text}  +  [${cAncestralidade2.value}] ${p2Text}`;
    }
}

// Sincronização dos 4 Blocos de Habilidades na Ficha Grande
function atualizarHabilidadesFichaGrande(forcarAutoPreenchimento = false) {
    if (!window.DAGGERHEART_DATA) return;
    const { CLASSES, SUBCLASSES, ANCESTRALIDADES, COMUNIDADES } = window.DAGGERHEART_DATA;

    const classeNome = shClasse.value;
    const subclasseNome = shSubclasse.value;
    const isMista = document.querySelector('input[name="shAncestralidadeTipo"]:checked')?.value === "mista";

    // 1. Habilidade de Classe
    const cInfo = CLASSES[classeNome];
    shHabClasseTitle.textContent = classeNome || "Classe";
    if (forcarAutoPreenchimento || !shHabilidadesClasse.value) {
        shHabilidadesClasse.value = cInfo ? cInfo.habilidade : "";
    }

    // 2. Habilidade de Subclasse
    const subInfo = SUBCLASSES[subclasseNome];
    shHabSubclasseTitle.textContent = subclasseNome || "Subclasse";
    if (subInfo && subInfo.conjuracao && subInfo.conjuracao !== "Nenhum") {
        shHabSubclasseCastTag.textContent = `Conjuração: ${subInfo.conjuracao}`;
        shHabSubclasseCastTag.style.display = "inline-block";
    } else {
        shHabSubclasseCastTag.textContent = "";
        shHabSubclasseCastTag.style.display = "none";
    }
    if (forcarAutoPreenchimento || !shHabilidadeSubclasse.value) {
        shHabilidadeSubclasse.value = subInfo ? subInfo.habilidade : "";
    }

    // 3. Habilidade de Comunidade
    const comNome = isMista ? shComunidadeMista.value : shComunidade.value;
    const comObj = COMUNIDADES.find(c => c.nome === comNome);
    shHabComunidadeTitle.textContent = comNome || "Comunidade";
    if (forcarAutoPreenchimento || !shHabilidadeComunidade.value) {
        shHabilidadeComunidade.value = comObj ? comObj.habilidade : "";
    }

    // 4. Habilidade de Ancestralidade
    if (!isMista) {
        const racaNome = shAncestralidade.value;
        const ancObj = ANCESTRALIDADES.find(a => a.nome === racaNome);
        shHabRacaTitle.textContent = racaNome || "Ancestralidade";
        shHabRacaModeTag.textContent = "Única (2 Poderes)";
        if (forcarAutoPreenchimento || !shHabilidadeRaca.value) {
            if (ancObj && ancObj.poderes) {
                shHabilidadeRaca.value = ancObj.poderes.map(p => `• ${p.nome}: ${p.desc}`).join("\n\n");
            } else {
                shHabilidadeRaca.value = "";
            }
        }
    } else {
        const raca1 = shAncestralidadeMista1.value;
        const raca2 = shAncestralidadeMista2.value;
        shHabRacaTitle.textContent = `${raca1}-${raca2} (Mista)`;
        shHabRacaModeTag.textContent = "Mista (1 Poder de Cada)";

        if (forcarAutoPreenchimento || !shHabilidadeRaca.value) {
            const p1Text = shPoderRaca1.options[shPoderRaca1.selectedIndex]?.text || "";
            const p2Text = shPoderRaca2.options[shPoderRaca2.selectedIndex]?.text || "";
            shHabilidadeRaca.value = `• [${raca1}] ${p1Text}\n\n• [${raca2}] ${p2Text}`;
        }
    }
}

function setView(view) {
    currentView = view;
    if (view === "cards") {
        btnViewCards.classList.add("active");
        btnViewTable.classList.remove("active");
        gridPersonagens.style.display = "grid";
        tableContainer.style.display = "none";
    } else {
        btnViewTable.classList.add("active");
        btnViewCards.classList.remove("active");
        gridPersonagens.style.display = "none";
        tableContainer.style.display = "block";
    }
}

function atualizarPreviaFoto(url) {
    if (url) {
        previewFoto.src = url;
        previewFoto.style.display = "block";
        placeholderFoto.style.display = "none";
        previewFoto.onerror = () => {
            previewFoto.style.display = "none";
            placeholderFoto.style.display = "flex";
        };
    } else {
        previewFoto.src = "";
        previewFoto.style.display = "none";
        placeholderFoto.style.display = "flex";
    }
}

// ==========================================================================
// READ: BUSCA DE PERSONAGENS E RENDERIZAÇÃO
// ==========================================================================
async function buscarPersonagens() {
    try {
        mensagem.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Consultando o grimório de heróis...`;
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

        const personagens = await resposta.json();
        window.allRegisteredHeroes = personagens;
        if (typeof atualizarDropdownHeroisCombate === "function") {
            atualizarDropdownHeroisCombate();
        }

        gridPersonagens.innerHTML = "";
        listarPersonagens.innerHTML = "";

        if (personagens.length === 0) {
            mensagem.innerHTML = `<i class="fa-solid fa-info-circle"></i> Nenhum herói forjado ainda. Crie seu primeiro personagem ao lado!`;
            return;
        }

        personagens.forEach(p => {
            gridPersonagens.innerHTML += criarQuadradoPersonagem(p);
            listarPersonagens.innerHTML += criarLinhaTabela(p);
        });

        mensagem.innerHTML = `<i class="fa-solid fa-check"></i> <strong>${personagens.length} heróis</strong> carregados. Clique em um quadrado para abrir a Ficha Completa!`;
    } catch (erro) {
        mensagem.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Erro ao conectar ao servidor. Verifique o backend.`;
        console.error("Erro ao buscar personagens:", erro);
    }
}

async function buscarPersonagemPorId() {
    const id = buscarIdInput ? buscarIdInput.value.trim() : "";
    if (!id) {
        mensagem.innerHTML = `<i class="fa-solid fa-circle-info"></i> Digite um ID para buscar.`;
        return;
    }

    try {
        mensagem.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Buscando herói #${id}...`;
        const resposta = await fetch(`${API_URL}/${id}`);
        if (!resposta.ok) {
            if (resposta.status === 404) {
                mensagem.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Herói com ID <strong>#${id}</strong> não foi encontrado.`;
                gridPersonagens.innerHTML = "";
                listarPersonagens.innerHTML = "";
                return;
            }
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const p = await resposta.json();
        gridPersonagens.innerHTML = criarQuadradoPersonagem(p);
        listarPersonagens.innerHTML = criarLinhaTabela(p);
        mensagem.innerHTML = `<i class="fa-solid fa-check"></i> Ficha do herói <strong>${p.NOME}</strong> (#${p.ID}) encontrada com sucesso. Clique para abrir!`;
    } catch (erro) {
        mensagem.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Não foi possível consultar o herói.`;
        console.error("Erro ao buscar por ID:", erro);
    }
}

// ==========================================================================
// RENDERIZAÇÃO DOS QUADRADOS (CARDS)
// ==========================================================================
function criarQuadradoPersonagem(p) {
    const temFoto = p.IMAGEM && p.IMAGEM.trim() !== "";
    const fotoHtml = temFoto
        ? `<img src="${p.IMAGEM}" alt="${p.NOME}" class="square-photo-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'square-photo-placeholder\\'><i class=\\'fa-solid fa-shield\\'></i></div>';">`
        : `<div class="square-photo-placeholder"><i class="fa-solid fa-shield"></i></div>`;

    const isMista = p.ANCESTRALIDADE_TIPO === "mista" && p.ANCESTRALIDADE_SECUNDARIA;
    const herancaDisplay = isMista 
        ? `${p.ANCESTRALIDADE}-${p.ANCESTRALIDADE_SECUNDARIA} (Mista)`
        : p.ANCESTRALIDADE;

    return `
        <article class="hero-square" onclick="abrirFichaGrande(${p.ID})">
            <div class="square-photo-wrap">
                ${fotoHtml}
                <div class="square-photo-overlay"></div>
                <span class="badge-id">#${p.ID}</span>
                <span class="badge-level">Nv. ${p.NIVEL}</span>
                <span class="square-click-hint"><i class="fa-solid fa-expand"></i> Abrir Ficha</span>
            </div>
            
            <div class="square-content">
                <div class="square-title-row">
                    <h3 class="square-hero-name">${p.NOME}</h3>
                    <div class="square-tags">
                        <span class="class-badge">${p.CLASSE}</span>
                        ${p.SUBCLASSE ? `<span class="subclass-badge">${p.SUBCLASSE}</span>` : ""}
                        <span class="heritage-text"><i class="fa-solid ${isMista ? 'fa-dna' : 'fa-tree'}"></i> ${herancaDisplay} • ${p.COMUNIDADE}</span>
                    </div>
                </div>

                <!-- 6 Atributos Daggerheart -->
                <div class="square-attrs-grid">
                    <div class="square-attr-box"><span class="square-attr-label">AGI</span><span class="square-attr-val">${formatarMod(p.AGILIDADE)}</span></div>
                    <div class="square-attr-box"><span class="square-attr-label">FOR</span><span class="square-attr-val">${formatarMod(p.FORCA)}</span></div>
                    <div class="square-attr-box"><span class="square-attr-label">ACU</span><span class="square-attr-val">${formatarMod(p.ACUIDADE)}</span></div>
                    <div class="square-attr-box"><span class="square-attr-label">INS</span><span class="square-attr-val">${formatarMod(p.INSTINTO)}</span></div>
                    <div class="square-attr-box"><span class="square-attr-label">PRE</span><span class="square-attr-val">${formatarMod(p.PRESENCA)}</span></div>
                    <div class="square-attr-box"><span class="square-attr-label">CON</span><span class="square-attr-val">${formatarMod(p.CONHECIMENTO)}</span></div>
                </div>

                <!-- Estatísticas de Combate -->
                <div class="square-combat-row">
                    <span class="combat-pill pill-evasion" title="Evasão"><i class="fa-solid fa-person-running"></i> Eva: ${p.EVASAO}</span>
                    <span class="combat-pill pill-armor" title="Armadura"><i class="fa-solid fa-shield"></i> Arm: ${p.ARMADURA || 0}</span>
                    <span class="combat-pill pill-hp" title="PV Máximo"><i class="fa-solid fa-heart"></i> PV: ${p.PV_MAXIMO}</span>
                    <span class="combat-pill pill-hope" title="Esperança"><i class="fa-solid fa-sun"></i> Esp: ${p.ESPERANCA}</span>
                </div>

                <!-- Botões de Ação -->
                <div class="square-actions" onclick="event.stopPropagation()">
                    <button onclick="abrirFichaGrande(${p.ID})" class="square-btn square-btn-open">
                        <i class="fa-solid fa-folder-open"></i> Ficha
                    </button>
                    <button onclick="adicionarHeroiAoCombatePorId(${p.ID}, true)" class="square-btn square-btn-combat" title="Enviar este herói para a Arena de Combate">
                        <i class="fa-solid fa-skull-crossbones"></i> Combate
                    </button>
                    <button onclick="deletarPersonagem(${p.ID})" class="square-btn square-btn-delete" title="Deletar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function criarLinhaTabela(p) {
    const temFoto = p.IMAGEM && p.IMAGEM.trim() !== "";
    const fotoThumb = temFoto
        ? `<img src="${p.IMAGEM}" alt="${p.NOME}" class="table-avatar-img" onerror="this.onerror=null; this.src='banner.avif';">`
        : `<div class="table-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`;

    const isMista = p.ANCESTRALIDADE_TIPO === "mista" && p.ANCESTRALIDADE_SECUNDARIA;
    const herancaDisplay = isMista 
        ? `${p.ANCESTRALIDADE}-${p.ANCESTRALIDADE_SECUNDARIA} (Mista)`
        : p.ANCESTRALIDADE;

    return `
        <tr onclick="abrirFichaGrande(${p.ID})" style="cursor: pointer;">
            <td>#${p.ID}</td>
            <td>${fotoThumb}</td>
            <td>
                <div class="hero-name">${p.NOME}</div>
            </td>
            <td>
                <span class="class-badge">${p.CLASSE}</span>
                ${p.SUBCLASSE ? `<span class="subclass-badge">${p.SUBCLASSE}</span>` : ""}
                <span class="level-tag">Nv. ${p.NIVEL}</span>
            </td>
            <td>
                <span class="heritage-text">${herancaDisplay} • ${p.COMUNIDADE}</span>
            </td>
            <td>
                <div class="attrs-mini-grid">
                    <div class="attr-pill"><span>AGI</span> <span>${formatarMod(p.AGILIDADE)}</span></div>
                    <div class="attr-pill"><span>FOR</span> <span>${formatarMod(p.FORCA)}</span></div>
                    <div class="attr-pill"><span>ACU</span> <span>${formatarMod(p.ACUIDADE)}</span></div>
                    <div class="attr-pill"><span>INS</span> <span>${formatarMod(p.INSTINTO)}</span></div>
                    <div class="attr-pill"><span>PRE</span> <span>${formatarMod(p.PRESENCA)}</span></div>
                    <div class="attr-pill"><span>CON</span> <span>${formatarMod(p.CONHECIMENTO)}</span></div>
                </div>
            </td>
            <td>
                <div class="combat-stats">
                    <span class="combat-pill pill-evasion"><i class="fa-solid fa-person-running"></i> ${p.EVASAO}</span>
                    <span class="combat-pill pill-hp"><i class="fa-solid fa-heart"></i> ${p.PV_MAXIMO}</span>
                    <span class="combat-pill pill-hope"><i class="fa-solid fa-sun"></i> ${p.ESPERANCA}</span>
                </div>
            </td>
            <td onclick="event.stopPropagation()">
                <div class="table-actions">
                    <button onclick="abrirFichaGrande(${p.ID})" class="square-btn square-btn-open">
                        <i class="fa-solid fa-folder-open"></i> Ficha
                    </button>
                    <button onclick="deletarPersonagem(${p.ID})" class="square-btn square-btn-delete" title="Deletar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function formatarMod(val) {
    const num = Number(val) || 0;
    return num > 0 ? `+${num}` : `${num}`;
}

// ==========================================================================
// ABERTURA E EDIÇÃO DA FICHA GRANDE OFICIAL (DAGGERHEART FULL SHEET)
// ==========================================================================
async function abrirFichaGrande(id) {
    try {
        mensagem.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Abrindo ficha oficial do herói #${id}...`;
        const resposta = await fetch(`${API_URL}/${id}`);
        if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

        const p = await resposta.json();
        currentHero = p;
        currentHeroId = p.ID;

        // Preencher Cabeçalho
        shNome.value = p.NOME || "";
        shGenero.value = p.GENERO || "";
        shNivel.value = p.NIVEL || 1;

        // Configurar Tipo de Ancestralidade (Única vs Mista)
        const isMista = p.ANCESTRALIDADE_TIPO === "mista";
        const radioTarget = document.querySelector(`input[name="shAncestralidadeTipo"][value="${isMista ? 'mista' : 'unica'}"]`);
        if (radioTarget) radioTarget.checked = true;

        shAncestryUnicaBox.style.display = isMista ? "none" : "flex";
        shAncestryMistaBox.style.display = isMista ? "grid" : "none";

        if (!isMista) {
            shAncestralidade.value = p.ANCESTRALIDADE || "Humano";
            shComunidade.value = p.COMUNIDADE || "Silvestre";
        } else {
            shAncestralidadeMista1.value = p.ANCESTRALIDADE || "Humano";
            shAncestralidadeMista2.value = p.ANCESTRALIDADE_SECUNDARIA || "Elfo";
            shComunidadeMista.value = p.COMUNIDADE || "Silvestre";

            atualizarPoderesSelect(shAncestralidadeMista1.value, shPoderRaca1);
            atualizarPoderesSelect(shAncestralidadeMista2.value, shPoderRaca2);
        }

        // Classe e Subclasse
        shClasse.value = p.CLASSE || "Guerreiro";
        atualizarSubclassesEHint(shClasse.value, shSubclasse);
        if (p.SUBCLASSE) shSubclasse.value = p.SUBCLASSE;

        // Preencher Cristas
        shEvasao.value = p.EVASAO ?? 10;
        shArmadura.value = p.ARMADURA ?? 0;

        shAgilidade.value = p.AGILIDADE ?? 0;
        shForca.value = p.FORCA ?? 0;
        shAcuidade.value = p.ACUIDADE ?? 0;
        shInstinto.value = p.INSTINTO ?? 0;
        shPresenca.value = p.PRESENCA ?? 0;
        shConhecimento.value = p.CONHECIMENTO ?? 0;

        // Dano e Saúde
        shDanoMenor.value = p.DANO_MENOR ?? 1;
        shDanoMaior.value = p.DANO_MAIOR ?? 2;
        shDanoGrave.value = p.DANO_GRAVE ?? 3;
        shPvMaximo.value = p.PV_MAXIMO ?? 6;
        shPfMaximo.value = p.PF_MAXIMO ?? 6;

        const toggleHp = (idx) => {
            activeHpChecked = idx + 1 === activeHpChecked ? idx : idx + 1;
            renderizarTrackPills(hpTrackPills, shPvMaximo.value, activeHpChecked, toggleHp);
        };
        const toggleStress = (idx) => {
            activeStressChecked = idx + 1 === activeStressChecked ? idx : idx + 1;
            renderizarTrackPills(stressTrackPills, shPfMaximo.value, activeStressChecked, toggleStress);
        };

        renderizarTrackPills(hpTrackPills, shPvMaximo.value, activeHpChecked, toggleHp);
        renderizarTrackPills(stressTrackPills, shPfMaximo.value, activeStressChecked, toggleStress);

        shPvMaximo.oninput = () => renderizarTrackPills(hpTrackPills, shPvMaximo.value, activeHpChecked, toggleHp);
        shPfMaximo.oninput = () => renderizarTrackPills(stressTrackPills, shPfMaximo.value, activeStressChecked, toggleStress);

        renderizarArmorHearts(p.ARMADURA_SLOTS || 6, activeArmorChecked);

        // Esperança
        activeHopeValue = p.ESPERANCA ?? 2;
        renderizarHopeDiamonds(activeHopeValue);
        shHabilidadeEsperanca.value = p.HABILIDADE_ESPERANCA || "";

        // Experiências
        preencherExperiencias(p.EXPERIENCIAS);

        // Ouro
        shOuroPunhados.value = p.OURO_PUNHADOS ?? 0;
        shOuroBolsas.value = p.OURO_BOLSAS ?? 0;
        shOuroBau.value = p.OURO_BAU ?? 0;

        // 4 Habilidades do Herói (Classe, Subclasse, Comunidade, Raça)
        shHabilidadesClasse.value = p.HABILIDADES_CLASSE || "";
        shHabilidadeSubclasse.value = p.HABILIDADE_SUBCLASSE || "";
        shHabilidadeComunidade.value = p.HABILIDADE_COMUNIDADE || "";
        shHabilidadeRaca.value = p.HABILIDADE_RACA || "";

        atualizarHabilidadesFichaGrande(!p.HABILIDADES_CLASSE && !p.HABILIDADE_SUBCLASSE);

        // Armas e Equipamentos
        renderizarProficienciaDots(1);
        preencherArmasEEquipamentos(p);

        // Cartas de Domínio Equipadas
        carregarCartasEquipadas(p.CARTAS_DOMINIO);
        atualizarDominiosFichaGrande();

        sheetFeedbackMsg.textContent = "";
        modalFichaGrande.style.display = "flex";
        mensagem.innerHTML = `<i class="fa-solid fa-folder-open"></i> Ficha de <strong>${p.NOME}</strong> aberta na tela!`;
    } catch (erro) {
        mensagem.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Não foi possível abrir a ficha.`;
        console.error("Erro ao abrir ficha:", erro);
    }
}
window.abrirFichaGrande = abrirFichaGrande;

function fecharFichaGrande() {
    modalFichaGrande.style.display = "none";
}

// --------------------------------------------------------------------------
// ATUALIZAÇÃO E SALVAMENTO DA FICHA GRANDE (UPDATE)
// --------------------------------------------------------------------------
async function salvarFichaGrande() {
    if (!currentHeroId) return;

    try {
        sheetFeedbackMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Salvando ficha no banco...`;

        const tipoAncestralidade = document.querySelector('input[name="shAncestralidadeTipo"]:checked')?.value || "unica";
        let raca1 = shAncestralidade.value;
        let raca2 = "";
        let com = shComunidade.value;

        if (tipoAncestralidade === "mista") {
            raca1 = shAncestralidadeMista1.value;
            raca2 = shAncestralidadeMista2.value;
            com = shComunidadeMista.value;
        }

        const payload = {
            NOME: shNome.value.trim(),
            GENERO: shGenero.value.trim(),
            NIVEL: Number(shNivel.value) || 1,
            ANCESTRALIDADE: raca1,
            ANCESTRALIDADE_SECUNDARIA: raca2,
            ANCESTRALIDADE_TIPO: tipoAncestralidade,
            COMUNIDADE: com,
            CLASSE: shClasse.value,
            SUBCLASSE: shSubclasse.value,

            EVASAO: Number(shEvasao.value) || 10,
            ARMADURA: Number(shArmadura.value) || 0,
            ARMADURA_SLOTS: 6,

            AGILIDADE: Number(shAgilidade.value) || 0,
            FORCA: Number(shForca.value) || 0,
            ACUIDADE: Number(shAcuidade.value) || 0,
            INSTINTO: Number(shInstinto.value) || 0,
            PRESENCA: Number(shPresenca.value) || 0,
            CONHECIMENTO: Number(shConhecimento.value) || 0,

            DANO_MENOR: Number(shDanoMenor.value) || 1,
            DANO_MAIOR: Number(shDanoMaior.value) || 2,
            DANO_GRAVE: Number(shDanoGrave.value) || 3,
            PV_MAXIMO: Number(shPvMaximo.value) || 6,
            PF_MAXIMO: Number(shPfMaximo.value) || 6,

            ESPERANCA: activeHopeValue,
            HABILIDADE_ESPERANCA: shHabilidadeEsperanca.value,

            EXPERIENCIAS: obterExperiencias(),

            OURO_PUNHADOS: Number(shOuroPunhados.value) || 0,
            OURO_BOLSAS: Number(shOuroBolsas.value) || 0,
            OURO_BAU: Number(shOuroBau.value) || 0,

            // As 4 Habilidades Canônicas
            HABILIDADES_CLASSE: shHabilidadesClasse.value,
            HABILIDADE_SUBCLASSE: shHabilidadeSubclasse.value,
            HABILIDADE_COMUNIDADE: shHabilidadeComunidade.value,
            HABILIDADE_RACA: shHabilidadeRaca.value,

            ARMA_PRINCIPAL: {
                nome: shArmaP_Nome.value,
                atributo: shArmaP_Atrib.value,
                dano: shArmaP_Dano.value,
                habilidade: shArmaP_Hab.value
            },
            ARMA_SECUNDARIA: {
                nome: shArmaS_Nome.value,
                atributo: shArmaS_Atrib.value,
                dano: shArmaS_Dano.value,
                habilidade: shArmaS_Hab.value
            },
            ARMADURA_ATIVA: {
                nome: shArmaduraNome.value,
                limiares: shArmaduraLimiares.value,
                base: shArmaduraBase.value,
                habilidade: shArmaduraHab.value
            },
            INVENTARIO: shInventario.value,

            CARTAS_DOMINIO: equippedCardIds,
            IMAGEM: currentHero.IMAGEM || ""
        };

        const resposta = await fetch(`${API_URL}/${currentHeroId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

        sheetFeedbackMsg.innerHTML = `<i class="fa-solid fa-check"></i> Ficha salva no grimório com sucesso!`;
        await buscarPersonagens();
        setTimeout(() => { sheetFeedbackMsg.textContent = ""; }, 4000);
    } catch (erro) {
        sheetFeedbackMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Erro ao salvar alterações.`;
        console.error("Erro ao salvar ficha:", erro);
    }
}

// ==========================================================================
// RENDERIZAÇÃO DOS ELEMENTOS INTERATIVOS DA FICHA
// ==========================================================================
function renderizarTrackPills(container, total, activeChecked, onToggle) {
    container.innerHTML = "";
    const count = Math.max(1, Math.min(20, Number(total) || 6));
    for (let i = 0; i < count; i++) {
        const pill = document.createElement("div");
        const isChecked = i < activeChecked;
        pill.className = `track-pill ${isChecked ? "filled checked" : ""}`;
        pill.title = `Slot ${i + 1}`;
        if (onToggle) pill.addEventListener("click", () => onToggle(i));
        container.appendChild(pill);
    }
}

function renderizarArmorHearts(total, activeChecked) {
    armorHeartsSlots.innerHTML = "";
    const count = Number(total) || 6;
    for (let i = 0; i < count; i++) {
        const isChecked = i < activeChecked;
        const heart = document.createElement("div");
        heart.className = `armor-heart ${isChecked ? "filled checked" : ""}`;
        heart.title = `Slot de Armadura ${i + 1}`;
        heart.innerHTML = `<i class="fa-solid fa-shield-halved"></i>`;
        heart.addEventListener("click", () => {
            activeArmorChecked = i + 1 === activeArmorChecked ? i : i + 1;
            renderizarArmorHearts(total, activeArmorChecked);
        });
        armorHeartsSlots.appendChild(heart);
    }
}

function renderizarHopeDiamonds(value) {
    hopeDiamondsRow.innerHTML = "";
    const maxDiamonds = 6;
    for (let i = 0; i < maxDiamonds; i++) {
        const isChecked = i < value;
        const diamond = document.createElement("div");
        diamond.className = `hope-diamond ${isChecked ? "filled checked" : ""}`;
        diamond.title = `Esperança ${i + 1}`;
        diamond.addEventListener("click", () => {
            activeHopeValue = i + 1 === activeHopeValue ? i : i + 1;
            renderizarHopeDiamonds(activeHopeValue);
        });
        hopeDiamondsRow.appendChild(diamond);
    }
}

function renderizarProficienciaDots(val) {
    profDots.innerHTML = "";
    activeProficiency = val || 1;
    for (let i = 1; i <= 6; i++) {
        const isChecked = i <= activeProficiency;
        const dot = document.createElement("div");
        dot.className = `prof-dot ${isChecked ? "filled checked" : ""}`;
        dot.title = `Proficiência ${i}`;
        dot.addEventListener("click", () => {
            activeProficiency = i;
            renderizarProficienciaDots(activeProficiency);
        });
        profDots.appendChild(dot);
    }
}

function preencherExperiencias(expData) {
    experiencesList.innerHTML = "";
    let lista = [];
    try {
        lista = typeof expData === "string" ? JSON.parse(expData) : (expData || []);
    } catch {
        lista = [];
    }

    if (!Array.isArray(lista) || lista.length === 0) {
        lista = [
            { nome: "Histórico Inicial", valor: 2 },
            { nome: "", valor: 1 }
        ];
    }

    lista.forEach(item => adicionarLinhaExperiencia(item.nome, item.valor));
    const btnAdd = document.createElement("button");
    btnAdd.type = "button";
    btnAdd.className = "btn-add-exp";
    btnAdd.innerHTML = `<i class="fa-solid fa-plus"></i> Adicionar Experiência`;
    btnAdd.onclick = () => adicionarLinhaExperiencia("", 1);
    experiencesList.appendChild(btnAdd);
}

function adicionarLinhaExperiencia(nome = "", valor = 1) {
    const row = document.createElement("div");
    row.className = "exp-row";
    row.innerHTML = `
        <input type="text" class="exp-name" value="${nome}" placeholder="Ex: Sobrevivente das Selvas...">
        <div class="exp-val-wrap">
            <span>+</span>
            <input type="number" class="exp-val" value="${valor}" min="1" max="10">
        </div>
        <button type="button" class="btn-remove-exp" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;
    const btnAdd = experiencesList.querySelector(".btn-add-exp");
    if (btnAdd) {
        experiencesList.insertBefore(row, btnAdd);
    } else {
        experiencesList.appendChild(row);
    }
}

function obterExperiencias() {
    const rows = experiencesList.querySelectorAll(".exp-row");
    const arr = [];
    rows.forEach(r => {
        const nome = r.querySelector(".exp-name").value.trim();
        const valor = Number(r.querySelector(".exp-val").value) || 1;
        if (nome) arr.push({ nome, valor });
    });
    return arr;
}

function preencherArmasEEquipamentos(p) {
    const w1 = parseObj(p.ARMA_PRINCIPAL);
    shArmaP_Nome.value = w1.nome || "";
    shArmaP_Atrib.value = w1.atributo || "";
    shArmaP_Dano.value = w1.dano || "";
    shArmaP_Hab.value = w1.habilidade || "";

    const w2 = parseObj(p.ARMA_SECUNDARIA);
    shArmaS_Nome.value = w2.nome || "";
    shArmaS_Atrib.value = w2.atributo || "";
    shArmaS_Dano.value = w2.dano || "";
    shArmaS_Hab.value = w2.habilidade || "";

    const arm = parseObj(p.ARMADURA_ATIVA);
    shArmaduraNome.value = arm.nome || "";
    shArmaduraLimiares.value = arm.limiares || "";
    shArmaduraBase.value = arm.base || "";
    shArmaduraHab.value = arm.habilidade || "";

    shInventario.value = p.INVENTARIO || "";
}

function parseObj(val) {
    if (!val) return {};
    if (typeof val === "object") return val;
    try { return JSON.parse(val); } catch { return {}; }
}

// ==========================================================================
// CARTAS DE DOMÍNIO: CARREGAMENTO NA FICHA & GERENCIADOR
// ==========================================================================
function carregarCartasEquipadas(raw) {
    try {
        let parsed = typeof raw === "string" ? JSON.parse(raw) : (raw || []);
        equippedCardIds = (Array.isArray(parsed) ? parsed : []).map(Number);
    } catch {
        equippedCardIds = [];
    }

    renderizarCartasEquipadasFicha();
}

function atualizarDominiosFichaGrande() {
    const classe = shClasse.value;
    const nivel = Number(shNivel.value) || 1;
    if (window.DAGGERHEART_DATA && window.DAGGERHEART_DATA.CLASSES[classe]) {
        const doms = window.DAGGERHEART_DATA.CLASSES[classe].dominios;
        shDomainCardsBadge.textContent = `Domínios da Classe: ${doms.join(" & ")} (Nível ${nivel})`;
    }
}

function renderizarCartasEquipadasFicha() {
    shEquippedCardsGrid.innerHTML = "";
    if (!window.DAGGERHEART_DATA || !window.DAGGERHEART_DATA.CARTAS) return;

    const todas = window.DAGGERHEART_DATA.CARTAS;
    const equipadas = todas.filter(c => equippedCardIds.includes(Number(c.id)));

    if (equipadas.length === 0) {
        shEquippedCardsGrid.innerHTML = `
            <div class="empty-equipped-hint">
                <i class="fa-solid fa-scroll fa-2x" style="margin-bottom: 8px; color: var(--accent-gold);"></i>
                <p>Nenhuma carta de domínio equipada no momento.</p>
                <p style="font-size: 0.8rem; margin-top: 4px;">Clique em <strong>"Adicionar / Escolher Cartas de Domínio"</strong> para puxar as cartas de seus domínios e nível!</p>
            </div>
        `;
        return;
    }

    equipadas.forEach(c => {
        shEquippedCardsGrid.appendChild(criarCardElementoUI(c, true));
    });
}

function criarCardElementoUI(c, isEquipped) {
    const cardEl = document.createElement("div");
    cardEl.className = `domain-card-ui ${isEquipped ? "is-equipped-card" : ""}`;
    cardEl.setAttribute("data-domain", c.domain);

    cardEl.innerHTML = `
        <div class="card-ui-header">
            <div class="card-ui-level-cost">
                <span class="card-ui-level">Nv. ${c.level}</span>
                <span class="card-ui-cost" title="Custo de Troca / Recall"><i class="fa-solid fa-bolt"></i> Troca: ${c.recallCost}</span>
            </div>
            <span class="card-ui-domain">${c.domain}</span>
        </div>
        <div class="card-ui-body">
            <span class="card-ui-type">${c.type}</span>
            <h4 class="card-ui-name">${c.name}</h4>
            <div class="card-ui-desc">${c.description}</div>
        </div>
        <div class="card-ui-footer">
            ${isEquipped 
                ? `<button type="button" class="btn-card-action btn-card-remove" onclick="removerCartaEquipada(${c.id})"><i class="fa-solid fa-check"></i> Equipada (Clique p/ Remover)</button>`
                : `<button type="button" class="btn-card-action btn-card-equip" onclick="equiparCarta(${c.id})"><i class="fa-solid fa-plus"></i> Equipar na Ficha</button>`
            }
        </div>
    `;
    return cardEl;
}

function equiparCarta(id) {
    const numId = Number(id);
    if (!equippedCardIds.includes(numId)) {
        equippedCardIds.push(numId);
        renderizarCartasEquipadasFicha();
        renderizarCartasBrowser();
        sheetFeedbackMsg.innerHTML = `<i class="fa-solid fa-check"></i> Carta adicionada à ficha! Clique em "Salvar Alterações na Ficha".`;
    }
}
window.equiparCarta = equiparCarta;

function removerCartaEquipada(id) {
    const numId = Number(id);
    equippedCardIds = equippedCardIds.filter(cardId => cardId !== numId);
    renderizarCartasEquipadasFicha();
    renderizarCartasBrowser();
    sheetFeedbackMsg.innerHTML = `<i class="fa-solid fa-check"></i> Carta removida da ficha!`;
}
window.removerCartaEquipada = removerCartaEquipada;

// ==========================================================================
// SELETOR / DRAWER DE CARTAS DE DOMÍNIO
// ==========================================================================
function abrirSeletorCartas() {
    modalCartasDominio.style.display = "flex";
    const classe = shClasse.value;
    const nivel = Number(shNivel.value) || 1;

    if (window.DAGGERHEART_DATA && window.DAGGERHEART_DATA.CLASSES[classe]) {
        const doms = window.DAGGERHEART_DATA.CLASSES[classe].dominios;
        browserSubtitle.textContent = `Puxando cartas de ${doms.join(" & ")} (Classe: ${classe} • Nível Máximo: ${nivel})`;
    }

    filterDominio.value = "CLASSE";
    filterNivel.value = "HEROI";
    renderizarCartasBrowser();
}

function fecharSeletorCartas() {
    modalCartasDominio.style.display = "none";
}

function renderizarCartasBrowser() {
    browserCardsGrid.innerHTML = "";
    if (!window.DAGGERHEART_DATA || !window.DAGGERHEART_DATA.CARTAS) return;

    const classe = shClasse.value;
    const heroNivel = Number(shNivel.value) || 1;
    const dominiosClasse = (window.DAGGERHEART_DATA.CLASSES[classe] || {}).dominios || [];

    const fDom = filterDominio.value;
    const fNiv = filterNivel.value;
    const fTipo = filterTipo.value;
    const fBusca = (filterBuscaNome.value || "").toLowerCase().trim();

    const cartas = window.DAGGERHEART_DATA.CARTAS.filter(c => {
        // Filtro de Domínio
        if (fDom === "CLASSE") {
            if (!dominiosClasse.includes(c.domain)) return false;
        } else if (fDom !== "TODOS") {
            if (c.domain !== fDom) return false;
        }

        // Filtro de Nível
        if (fNiv === "HEROI") {
            if (c.level > heroNivel) return false;
        } else if (fNiv !== "10") {
            if (c.level > Number(fNiv)) return false;
        }

        // Filtro de Tipo
        if (fTipo !== "TODOS") {
            if (c.type.toLowerCase() !== fTipo.toLowerCase()) return false;
        }

        // Filtro de Busca de Nome
        if (fBusca) {
            const matchesName = c.name.toLowerCase().includes(fBusca);
            const matchesDesc = c.description.toLowerCase().includes(fBusca);
            if (!matchesName && !matchesDesc) return false;
        }

        return true;
    });

    if (cartas.length === 0) {
        browserCardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-dim);">
                <i class="fa-solid fa-magnifying-glass fa-2x" style="margin-bottom: 10px;"></i>
                <p>Nenhuma carta encontrada com os filtros selecionados.</p>
            </div>
        `;
        return;
    }

    cartas.forEach(c => {
        const isEquipped = equippedCardIds.includes(Number(c.id));
        browserCardsGrid.appendChild(criarCardElementoUI(c, isEquipped));
    });
}

// ==========================================================================
// CADASTRO / FORJA RÁPIDA LATERAL (CREATE)
// ==========================================================================
async function salvarPersonagemForja(e) {
    e.preventDefault();
    try {
        const isMista = document.querySelector('input[name="cAncestralidadeTipo"]:checked')?.value === "mista";
        let raca1 = cAncestralidade.value;
        let raca2 = "";
        let com = cComunidade.value;

        if (isMista) {
            raca1 = cAncestralidade1.value;
            raca2 = cAncestralidade2.value;
            com = cComunidadeMista.value;
        }

        // Resgatar habilidades canônicas oficiais para o herói novo
        const { CLASSES, SUBCLASSES, ANCESTRALIDADES, COMUNIDADES } = window.DAGGERHEART_DATA || {};
        const habClasse = (CLASSES && CLASSES[cClasse.value]) ? CLASSES[cClasse.value].habilidade : "";
        const habSubclasse = (SUBCLASSES && SUBCLASSES[cSubclasse.value]) ? SUBCLASSES[cSubclasse.value].habilidade : "";
        const comObj = COMUNIDADES ? COMUNIDADES.find(c => c.nome === com) : null;
        const habComunidade = comObj ? comObj.habilidade : "";

        let habRaca = "";
        if (!isMista) {
            const ancObj = ANCESTRALIDADES ? ANCESTRALIDADES.find(a => a.nome === raca1) : null;
            habRaca = (ancObj && ancObj.poderes) ? ancObj.poderes.map(p => `• ${p.nome}: ${p.desc}`).join("\n\n") : "";
        } else {
            const p1Text = cPoderRaca1.options[cPoderRaca1.selectedIndex]?.text || "";
            const p2Text = cPoderRaca2.options[cPoderRaca2.selectedIndex]?.text || "";
            habRaca = `• [${raca1}] ${p1Text}\n\n• [${raca2}] ${p2Text}`;
        }

        const payload = {
            NOME: cNome.value.trim(),
            IMAGEM: cImagem.value.trim(),
            CLASSE: cClasse.value,
            SUBCLASSE: cSubclasse.value,
            ANCESTRALIDADE: raca1,
            ANCESTRALIDADE_SECUNDARIA: raca2,
            ANCESTRALIDADE_TIPO: isMista ? "mista" : "unica",
            COMUNIDADE: com,
            NIVEL: Number(cNivel.value) || 1,
            GENERO: cGenero.value.trim(),

            AGILIDADE: Number(cAgilidade.value) || 0,
            FORCA: Number(cForca.value) || 0,
            ACUIDADE: Number(cAcuidade.value) || 0,
            INSTINTO: Number(cInstinto.value) || 0,
            PRESENCA: Number(cPresenca.value) || 0,
            CONHECIMENTO: Number(cConhecimento.value) || 0,

            EVASAO: Number(cEvasao.value) || 10,
            PV_MAXIMO: Number(cPvMaximo.value) || 6,
            ESPERANCA: Number(cEsperanca.value) || 2,

            HABILIDADES_CLASSE: habClasse,
            HABILIDADE_SUBCLASSE: habSubclasse,
            HABILIDADE_COMUNIDADE: habComunidade,
            HABILIDADE_RACA: habRaca
        };

        mensagem.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cadastrando novo herói...`;

        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

        const dados = await resposta.json();
        cancelarEdicaoForja();
        await buscarPersonagens();
        mensagem.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${dados.mensagem} (#${dados.id})! Clique no novo quadrado para ver e editar a Ficha Completa.`;
    } catch (erro) {
        mensagem.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Não foi possível cadastrar o herói.`;
        console.error("Erro ao cadastrar herói:", erro);
    }
}

function cancelarEdicaoForja() {
    form.reset();
    idedicao = null;
    atualizarPreviaFoto("");
    btnSaveText.textContent = "Cadastrar Herói";
    if (classDomainsBadge) classDomainsBadge.style.display = "none";
    cAncestryUnicaBox.style.display = "flex";
    cAncestryMistaBox.style.display = "none";
    atualizarPreviaHabilidadesForja();
}

// --------------------------------------------------------------------------
// EXCLUSÃO (DELETE)
// --------------------------------------------------------------------------
async function deletarPersonagem(id) {
    if (!confirm(`Tem certeza que deseja banir/deletar o herói com ID #${id}?`)) {
        return;
    }

    try {
        mensagem.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Excluindo herói #${id}...`;
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

        const dados = await resposta.json();
        if (currentHeroId === id) fecharFichaGrande();
        removerHeroiDoCombate(id, true);
        await buscarPersonagens();
        mensagem.innerHTML = `<i class="fa-solid fa-trash-can"></i> ${dados.mensagem}`;
    } catch (erro) {
        mensagem.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Não foi possível deletar o herói.`;
        console.error("Erro ao deletar:", erro);
    }
}
window.deletarPersonagem = deletarPersonagem;

// ==========================================================================
// SISTEMA DE COMBATE DAGGERHEART (ARENA, BARRA DE MEDO 1-10 E BESTIÁRIO)
// ==========================================================================
const COMBAT_STORAGE_KEY = "daggerheart_combat_state_v1";
window.allRegisteredHeroes = window.allRegisteredHeroes || [];

let combatState = carregarEstadoCombate();

function carregarEstadoCombate() {
    try {
        const raw = localStorage.getItem(COMBAT_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                fearPoints: Math.max(0, Math.min(10, Number(parsed.fearPoints ?? 1))),
                heroes: Array.isArray(parsed.heroes) ? parsed.heroes : [],
                enemies: Array.isArray(parsed.enemies) ? parsed.enemies : []
            };
        }
    } catch (e) {
        console.warn("Erro ao carregar combate do localStorage:", e);
    }
    return {
        fearPoints: 1,
        heroes: [],
        enemies: []
    };
}

function salvarEstadoCombate() {
    try {
        localStorage.setItem(COMBAT_STORAGE_KEY, JSON.stringify(combatState));
    } catch (e) {
        console.warn("Erro ao salvar estado de combate:", e);
    }
    atualizarContadoresCombate();
}

function atualizarContadoresCombate() {
    const total = (combatState.heroes?.length || 0) + (combatState.enemies?.length || 0);
    const badge = document.getElementById("combatCountBadge");
    if (badge) badge.textContent = total;

    const hCount = document.getElementById("combatHeroesCount");
    if (hCount) hCount.textContent = `${combatState.heroes.length} ${combatState.heroes.length === 1 ? "Herói" : "Heróis"}`;

    const eCount = document.getElementById("combatEnemiesCount");
    if (eCount) eCount.textContent = `${combatState.enemies.length} ${combatState.enemies.length === 1 ? "Criatura" : "Criaturas"}`;
}

// Alternar entre Modo Fichas e Modo Combate
function alternarModoApp(modo) {
    const viewHeroes = document.getElementById("viewHeroesDashboard");
    const viewCombat = document.getElementById("viewCombatArena");
    const tabHeroes = document.getElementById("tabModeHeroes");
    const tabCombat = document.getElementById("tabModeCombat");

    if (modo === "combat") {
        if (viewHeroes) viewHeroes.style.display = "none";
        if (viewCombat) viewCombat.style.display = "flex";
        if (tabHeroes) tabHeroes.classList.remove("active");
        if (tabCombat) tabCombat.classList.add("active");
        atualizarDropdownHeroisCombate();
        renderizarCombateCompleto();
    } else {
        if (viewHeroes) viewHeroes.style.display = "grid";
        if (viewCombat) viewCombat.style.display = "none";
        if (tabHeroes) tabHeroes.classList.add("active");
        if (tabCombat) tabCombat.classList.remove("active");
    }
}
window.alternarModoApp = alternarModoApp;

// --------------------------------------------------------------------------
// 1. BARRA DE PONTOS DE MEDO (1 A 10)
// --------------------------------------------------------------------------
function renderizarBarraDeMedo() {
    const track = document.getElementById("fearTokensTrack");
    const fill = document.getElementById("fearProgressBarFill");
    const valEl = document.getElementById("fearCurrentVal");
    const labelEl = document.getElementById("fearStatusLabel");
    if (!track) return;

    const fear = Math.max(0, Math.min(10, Number(combatState.fearPoints) || 0));
    if (valEl) valEl.textContent = fear;
    if (fill) fill.style.width = `${(fear / 10) * 100}%`;

    if (labelEl) {
        if (fear === 0) labelEl.textContent = "Sem Medo Acumulado";
        else if (fear <= 3) labelEl.textContent = "Tensão Crescente";
        else if (fear <= 6) labelEl.textContent = "Sombra Ameaçadora";
        else if (fear <= 9) labelEl.textContent = "Terror Profundo";
        else labelEl.textContent = "MEDO MÁXIMO (10/10)";
    }

    track.innerHTML = "";
    for (let i = 1; i <= 10; i++) {
        const isActive = i <= fear;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `fear-token-slot ${isActive ? "active" : ""} ${i === fear && fear > 0 ? "current-head" : ""}`;
        btn.title = `Definir Pontos de Medo para ${i}`;
        btn.innerHTML = `
            <i class="fa-solid fa-skull"></i>
            <span class="fear-slot-num">${i}</span>
        `;
        btn.onclick = () => {
            // Se clicar no próprio nível atual 1, permite alternar entre 0 e 1, ou definir direto o valor clicado (1-10)
            combatState.fearPoints = (combatState.fearPoints === i && i === 1) ? 0 : i;
            salvarEstadoCombate();
            renderizarBarraDeMedo();
        };
        track.appendChild(btn);
    }
}

function ajustarPontosDeMedo(delta) {
    const atual = Number(combatState.fearPoints) || 0;
    combatState.fearPoints = Math.max(0, Math.min(10, atual + delta));
    salvarEstadoCombate();
    renderizarBarraDeMedo();
}
window.ajustarPontosDeMedo = ajustarPontosDeMedo;

// --------------------------------------------------------------------------
// 2. HERÓIS EM COMBATE
// --------------------------------------------------------------------------
function atualizarDropdownHeroisCombate() {
    const sel = document.getElementById("selectHeroToCombat");
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = `<option value="">Selecione um herói cadastrado...</option>`;

    (window.allRegisteredHeroes || []).forEach(p => {
        const jaNoCombate = combatState.heroes.some(h => Number(h.id) === Number(p.ID));
        const opt = document.createElement("option");
        opt.value = p.ID;
        opt.textContent = `#${p.ID} ${p.NOME} (${p.CLASSE} Nv. ${p.NIVEL})${jaNoCombate ? " [Já em Combate]" : ""}`;
        sel.appendChild(opt);
    });
    if (currentVal) sel.value = currentVal;
}

function criarObjetoHeroiCombate(p) {
    return {
        id: Number(p.ID),
        name: p.NOME || "Herói",
        image: p.IMAGEM || "",
        classe: p.CLASSE || "Guerreiro",
        subclasse: p.SUBCLASSE || "",
        nivel: Number(p.NIVEL) || 1,
        evasao: Number(p.EVASAO) || 10,
        danoMenor: Number(p.DANO_MENOR) || 1,
        danoMaior: Number(p.DANO_MAIOR) || 2,
        danoGrave: Number(p.DANO_GRAVE) || 3,
        hpCurrent: 0,
        hpMax: Number(p.PV_MAXIMO) || 6,
        stressCurrent: 0,
        stressMax: Number(p.PF_MAXIMO) || 6,
        armorBase: Number(p.ARMADURA) || 0,
        armorCurrent: 0,
        armorMax: Number(p.ARMADURA_SLOTS) || 6,
        hope: Number(p.ESPERANCA) ?? 2
    };
}

async function adicionarHeroiAoCombatePorId(id, irParaCombate = false) {
    const numId = Number(id);
    if (!numId) return;

    let heroData = (window.allRegisteredHeroes || []).find(h => Number(h.ID) === numId);
    if (!heroData) {
        try {
            const resp = await fetch(`${API_URL}/${numId}`);
            if (resp.ok) heroData = await resp.json();
        } catch (e) {
            console.error(e);
        }
    }
    if (!heroData) return;

    const existingIdx = combatState.heroes.findIndex(h => Number(h.id) === numId);
    if (existingIdx >= 0) {
        // Atualiza metadados mantendo os contadores atuais do combate
        const prev = combatState.heroes[existingIdx];
        combatState.heroes[existingIdx] = {
            ...criarObjetoHeroiCombate(heroData),
            hpCurrent: Math.min(prev.hpCurrent, Number(heroData.PV_MAXIMO) || 6),
            stressCurrent: Math.min(prev.stressCurrent, Number(heroData.PF_MAXIMO) || 6),
            armorCurrent: prev.armorCurrent,
            hope: prev.hope
        };
    } else {
        combatState.heroes.push(criarObjetoHeroiCombate(heroData));
    }

    salvarEstadoCombate();
    atualizarDropdownHeroisCombate();
    renderizarHeroisCombate();

    if (irParaCombate) {
        alternarModoApp("combat");
    }
}
window.adicionarHeroiAoCombatePorId = adicionarHeroiAoCombatePorId;

function adicionarHeroiSelecionadoAoCombate() {
    const sel = document.getElementById("selectHeroToCombat");
    if (!sel || !sel.value) return;
    adicionarHeroiAoCombatePorId(Number(sel.value), false);
    sel.value = "";
}
window.adicionarHeroiSelecionadoAoCombate = adicionarHeroiSelecionadoAoCombate;

function adicionarTodosHeroisAoCombate() {
    (window.allRegisteredHeroes || []).forEach(p => {
        if (!combatState.heroes.some(h => Number(h.id) === Number(p.ID))) {
            combatState.heroes.push(criarObjetoHeroiCombate(p));
        }
    });
    salvarEstadoCombate();
    atualizarDropdownHeroisCombate();
    renderizarHeroisCombate();
}
window.adicionarTodosHeroisAoCombate = adicionarTodosHeroisAoCombate;

function removerHeroiDoCombate(id, silent = false) {
    combatState.heroes = combatState.heroes.filter(h => Number(h.id) !== Number(id));
    salvarEstadoCombate();
    if (!silent) {
        atualizarDropdownHeroisCombate();
        renderizarHeroisCombate();
    }
}
window.removerHeroiDoCombate = removerHeroiDoCombate;

function atualizarStatHeroiCombate(id, campo, valor) {
    const h = combatState.heroes.find(item => Number(item.id) === Number(id));
    if (!h) return;

    if (campo === "hpCurrent") {
        h.hpCurrent = Math.max(0, Math.min(h.hpMax, Number(valor) || 0));
    } else if (campo === "hpMax") {
        h.hpMax = Math.max(1, Math.min(24, Number(valor) || 6));
        h.hpCurrent = Math.min(h.hpCurrent, h.hpMax);
    } else if (campo === "stressCurrent") {
        h.stressCurrent = Math.max(0, Math.min(h.stressMax, Number(valor) || 0));
    } else if (campo === "stressMax") {
        h.stressMax = Math.max(1, Math.min(24, Number(valor) || 6));
        h.stressCurrent = Math.min(h.stressCurrent, h.stressMax);
    } else if (campo === "armorCurrent") {
        h.armorCurrent = Math.max(0, Math.min(h.armorMax, Number(valor) || 0));
    } else if (campo === "armorBase") {
        h.armorBase = Math.max(0, Math.min(30, Number(valor) || 0));
    } else if (campo === "hope") {
        h.hope = Math.max(0, Math.min(6, Number(valor) || 0));
    }

    salvarEstadoCombate();
    renderizarHeroisCombate();
}
window.atualizarStatHeroiCombate = atualizarStatHeroiCombate;

async function sincronizarHeroiCombateComBanco(id) {
    const h = combatState.heroes.find(item => Number(item.id) === Number(id));
    if (!h) return;

    try {
        const respGet = await fetch(`${API_URL}/${id}`);
        if (!respGet.ok) throw new Error("Herói não encontrado");
        const fullHero = await respGet.json();

        const payload = {
            ...fullHero,
            PV_MAXIMO: h.hpMax,
            PF_MAXIMO: h.stressMax,
            ARMADURA: h.armorBase,
            ESPERANCA: h.hope
        };

        const respPut = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (respPut.ok) {
            await buscarPersonagens();
            const btn = document.getElementById(`btnSyncHero_${id}`);
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = `<i class="fa-solid fa-check"></i> Salvo na Ficha!`;
                setTimeout(() => { btn.innerHTML = orig; }, 2000);
            }
        }
    } catch (e) {
        console.error("Erro ao sincronizar herói com ficha:", e);
    }
}
window.sincronizarHeroiCombateComBanco = sincronizarHeroiCombateComBanco;

function renderizarHeroisCombate() {
    const container = document.getElementById("combatHeroesList");
    if (!container) return;
    container.innerHTML = "";

    if (combatState.heroes.length === 0) {
        container.innerHTML = `
            <div class="combat-empty-state">
                <i class="fa-solid fa-user-shield fa-2x"></i>
                <h4>Nenhum Herói no Combate</h4>
                <p>Selecione um herói na barra acima ou clique em <strong>"Todos os Heróis"</strong> para trazê-los à batalha.</p>
            </div>
        `;
        return;
    }

    combatState.heroes.forEach(h => {
        const card = document.createElement("div");
        card.className = `combat-entity-card hero-combat-card ${h.hpCurrent >= h.hpMax ? "entity-defeated" : ""}`;

        const hasImg = h.image && h.image.trim() !== "";
        const avatarHtml = hasImg
            ? `<img src="${h.image}" alt="${h.name}" class="combat-avatar-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'combat-avatar-placeholder\\'><i class=\\'fa-solid fa-user-shield\\'></i></div>';">`
            : `<div class="combat-avatar-placeholder"><i class="fa-solid fa-user-shield"></i></div>`;

        // Gerar Pílulas de PV
        let hpPillsHtml = "";
        for (let i = 0; i < h.hpMax; i++) {
            const filled = i < h.hpCurrent;
            const nextVal = (i + 1 === h.hpCurrent) ? i : i + 1;
            hpPillsHtml += `<span class="c-pill hp-pill ${filled ? "filled" : ""}" onclick="atualizarStatHeroiCombate(${h.id}, 'hpCurrent', ${nextVal})" title="PV ${i + 1}"></span>`;
        }

        // Gerar Pílulas de Fadiga (PF)
        let pfPillsHtml = "";
        for (let i = 0; i < h.stressMax; i++) {
            const filled = i < h.stressCurrent;
            const nextVal = (i + 1 === h.stressCurrent) ? i : i + 1;
            pfPillsHtml += `<span class="c-pill stress-pill ${filled ? "filled" : ""}" onclick="atualizarStatHeroiCombate(${h.id}, 'stressCurrent', ${nextVal})" title="Fadiga ${i + 1}"></span>`;
        }

        // Gerar Escudos de Armadura
        let armorSlotsHtml = "";
        for (let i = 0; i < h.armorMax; i++) {
            const filled = i < h.armorCurrent;
            const nextVal = (i + 1 === h.armorCurrent) ? i : i + 1;
            armorSlotsHtml += `<span class="c-armor-slot ${filled ? "filled" : ""}" onclick="atualizarStatHeroiCombate(${h.id}, 'armorCurrent', ${nextVal})" title="Slot de Armadura ${i + 1}"><i class="fa-solid fa-shield-halved"></i></span>`;
        }

        // Gerar Diamantes de Esperança (0 a 6)
        let hopeDiamondsHtml = "";
        for (let i = 0; i < 6; i++) {
            const filled = i < h.hope;
            const nextVal = (i + 1 === h.hope) ? i : i + 1;
            hopeDiamondsHtml += `<span class="c-hope-diamond ${filled ? "filled" : ""}" onclick="atualizarStatHeroiCombate(${h.id}, 'hope', ${nextVal})" title="Esperança ${i + 1}"></span>`;
        }

        card.innerHTML = `
            <div class="combat-card-top">
                <div class="combat-avatar-frame" onclick="abrirFichaGrande(${h.id})" title="Clique para abrir a Ficha Completa">
                    ${avatarHtml}
                    <span class="combat-lvl-tag">Nv. ${h.nivel}</span>
                </div>

                <div class="combat-identity">
                    <div class="combat-name-row">
                        <h3 onclick="abrirFichaGrande(${h.id})" style="cursor:pointer;">${h.name}</h3>
                        ${h.hpCurrent >= h.hpMax ? `<span class="defeated-tag"><i class="fa-solid fa-skull"></i> CAIU</span>` : ""}
                    </div>
                    <div class="combat-badges-row">
                        <span class="class-badge">${h.classe}</span>
                        ${h.subclasse ? `<span class="subclass-badge">${h.subclasse}</span>` : ""}
                        <span class="c-quick-stat cyan" title="Evasão"><i class="fa-solid fa-person-running"></i> Eva: <strong>${h.evasao}</strong></span>
                        <span class="c-quick-stat amber" title="Limiares de Dano (Menor / Maior / Grave)"><i class="fa-solid fa-burst"></i> Limiares: <strong>${h.danoMenor}/${h.danoMaior}/${h.danoGrave}</strong></span>
                    </div>
                </div>

                <div class="combat-card-actions">
                    <button type="button" id="btnSyncHero_${h.id}" class="btn-icon-action gold" onclick="sincronizarHeroiCombateComBanco(${h.id})" title="Salvar alterações na Ficha do Herói">
                        <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                    <button type="button" class="btn-icon-action" onclick="abrirFichaGrande(${h.id})" title="Abrir Ficha Completa">
                        <i class="fa-solid fa-up-right-from-square"></i>
                    </button>
                    <button type="button" class="btn-icon-action danger" onclick="removerHeroiDoCombate(${h.id})" title="Remover do Combate">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Barras Interativas do Herói: PV, Fadiga, Armadura e Esperança -->
            <div class="combat-tracks-box">
                
                <!-- 1. VIDA (PV) -->
                <div class="c-track-line">
                    <div class="c-track-meta">
                        <span class="c-track-title hp-color"><i class="fa-solid fa-heart"></i> VIDA (PV)</span>
                        <div class="c-stepper">
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'hpCurrent', ${h.hpCurrent - 1})">-</button>
                            <input type="number" value="${h.hpCurrent}" min="0" max="${h.hpMax}" onchange="atualizarStatHeroiCombate(${h.id}, 'hpCurrent', this.value)">
                            <span>/</span>
                            <input type="number" value="${h.hpMax}" min="1" max="24" onchange="atualizarStatHeroiCombate(${h.id}, 'hpMax', this.value)" title="PV Máximo">
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'hpCurrent', ${h.hpCurrent + 1})">+</button>
                        </div>
                    </div>
                    <div class="c-pills-wrap">${hpPillsHtml}</div>
                </div>

                <!-- 2. FADIGA (PF) -->
                <div class="c-track-line">
                    <div class="c-track-meta">
                        <span class="c-track-title stress-color"><i class="fa-solid fa-bolt"></i> FADIGA (PF)</span>
                        <div class="c-stepper">
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'stressCurrent', ${h.stressCurrent - 1})">-</button>
                            <input type="number" value="${h.stressCurrent}" min="0" max="${h.stressMax}" onchange="atualizarStatHeroiCombate(${h.id}, 'stressCurrent', this.value)">
                            <span>/</span>
                            <input type="number" value="${h.stressMax}" min="1" max="24" onchange="atualizarStatHeroiCombate(${h.id}, 'stressMax', this.value)" title="PF Máximo">
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'stressCurrent', ${h.stressCurrent + 1})">+</button>
                        </div>
                    </div>
                    <div class="c-pills-wrap">${pfPillsHtml}</div>
                </div>

                <!-- 3. PONTOS DE ARMADURA -->
                <div class="c-track-line">
                    <div class="c-track-meta">
                        <span class="c-track-title armor-color">
                            <i class="fa-solid fa-shield"></i> ARMADURA
                            <small>(Base: <input type="number" class="inline-armor-base" value="${h.armorBase}" min="0" max="30" onchange="atualizarStatHeroiCombate(${h.id}, 'armorBase', this.value)">)</small>
                        </span>
                        <div class="c-stepper">
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'armorCurrent', ${h.armorCurrent - 1})">-</button>
                            <span class="c-step-readout">${h.armorCurrent} / ${h.armorMax}</span>
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'armorCurrent', ${h.armorCurrent + 1})">+</button>
                        </div>
                    </div>
                    <div class="c-pills-wrap">${armorSlotsHtml}</div>
                </div>

                <!-- 4. PONTOS DE ESPERANÇA -->
                <div class="c-track-line">
                    <div class="c-track-meta">
                        <span class="c-track-title hope-color"><i class="fa-solid fa-sun"></i> ESPERANÇA</span>
                        <div class="c-stepper">
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'hope', ${h.hope - 1})">-</button>
                            <span class="c-step-readout">${h.hope} / 6</span>
                            <button type="button" onclick="atualizarStatHeroiCombate(${h.id}, 'hope', ${h.hope + 1})">+</button>
                        </div>
                    </div>
                    <div class="c-pills-wrap hope-wrap">${hopeDiamondsHtml}</div>
                </div>

            </div>
        `;
        container.appendChild(card);
    });
}

// --------------------------------------------------------------------------
// 3. BESTIÁRIO OFICIAL (129 CRIATURAS DE INIMIGOS.PDF) & CRIATURAS EM COMBATE
// --------------------------------------------------------------------------
function abrirModalBestiario() {
    const modal = document.getElementById("modalBestiario");
    if (modal) {
        modal.style.display = "flex";
        renderizarBestiarioModal();
    }
}
window.abrirModalBestiario = abrirModalBestiario;

function fecharModalBestiario() {
    const modal = document.getElementById("modalBestiario");
    if (modal) modal.style.display = "none";
}
window.fecharModalBestiario = fecharModalBestiario;

function renderizarBestiarioModal() {
    const grid = document.getElementById("bestiaryCardsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const enemies = window.DAGGERHEART_ENEMIES || [];
    const fTier = document.getElementById("filterEnemyTier")?.value || "TODOS";
    const fRole = document.getElementById("filterEnemyRole")?.value || "TODOS";
    const fSearch = (document.getElementById("filterEnemySearch")?.value || "").toLowerCase().trim();

    const filtrados = enemies.filter(e => {
        if (fTier !== "TODOS" && String(e.tier) !== String(fTier)) return false;
        if (fRole !== "TODOS" && e.role.toLowerCase() !== fRole.toLowerCase()) return false;
        if (fSearch) {
            const matchName = e.name.toLowerCase().includes(fSearch);
            const matchDesc = (e.description || "").toLowerCase().includes(fSearch);
            const matchRole = (e.role || "").toLowerCase().includes(fSearch);
            if (!matchName && !matchDesc && !matchRole) return false;
        }
        return true;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-dragon fa-2x" style="margin-bottom: 10px; color: var(--accent-crimson);"></i>
                <p>Nenhuma criatura encontrada com os filtros atuais.</p>
            </div>
        `;
        return;
    }

    filtrados.forEach(e => {
        const card = document.createElement("div");
        card.className = "bestiary-card-ui";

        const habsPreview = (e.abilities || []).map(ab => `
            <div class="bestiary-ab-item">
                <span class="ab-badge ab-${ab.type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">${ab.type}</span>
                <strong>${ab.name}:</strong> ${ab.description}
            </div>
        `).join("");

        card.innerHTML = `
            <div class="bestiary-card-top">
                <div class="bestiary-thumb-wrap">
                    <img src="${e.image}" alt="${e.name}" class="bestiary-thumb-img">
                    <span class="bestiary-tier-pill">${e.tier}º Patamar</span>
                </div>
                <div class="bestiary-head-info">
                    <div class="bestiary-role-line">
                        <span class="enemy-role-tag">${e.role}${e.hordeCount ? ` (${e.hordeCount})` : ""}</span>
                        <span class="enemy-diff-tag">Dif. ${e.difficulty}</span>
                    </div>
                    <h4>${e.name}</h4>
                    <p class="bestiary-flavor">${e.description}</p>
                </div>
            </div>

            <div class="bestiary-stats-strip">
                <span><i class="fa-solid fa-heart"></i> <strong>${e.hpMax} PV</strong></span>
                <span><i class="fa-solid fa-bolt"></i> <strong>${e.stressMax} PF</strong></span>
                <span><i class="fa-solid fa-shield-halved"></i> Limiares: <strong>${e.thresholds}</strong></span>
                <span><i class="fa-solid fa-crosshairs"></i> ATQ <strong>${e.atkBonus}</strong> (${e.attackName} • ${e.attackDamage})</span>
            </div>

            <div class="bestiary-abilities-scroll">
                ${habsPreview}
            </div>

            <div class="bestiary-card-footer">
                <div class="qty-picker">
                    <label>Qtd:</label>
                    <input type="number" id="qtyEnemy_${e.id}" value="1" min="1" max="15">
                </div>
                <button type="button" class="btn-card-action btn-card-equip" onclick="adicionarCriaturaAoCombate(${e.id})">
                    <i class="fa-solid fa-plus"></i> Adicionar ao Combate
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}
window.renderizarBestiarioModal = renderizarBestiarioModal;

function adicionarCriaturaAoCombate(enemyId, customQty = null) {
    const template = (window.DAGGERHEART_ENEMIES || []).find(e => Number(e.id) === Number(enemyId));
    if (!template) return;

    const qtyInput = document.getElementById(`qtyEnemy_${enemyId}`);
    const qtd = customQty !== null ? customQty : Math.max(1, Math.min(20, Number(qtyInput?.value) || 1));

    // Contar quantos desse inimigo já existem no combate para numerar (#1, #2...)
    let existingCount = combatState.enemies.filter(c => Number(c.enemyId) === Number(enemyId)).length;

    for (let i = 0; i < qtd; i++) {
        existingCount++;
        const suffix = (qtd > 1 || existingCount > 1) ? ` #${existingCount}` : "";
        combatState.enemies.push({
            uid: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${i}`,
            enemyId: template.id,
            instanceName: `${template.name}${suffix}`,
            tier: template.tier,
            role: template.role,
            hordeCount: template.hordeCount || "",
            description: template.description || "",
            tactics: template.tactics || "",
            difficulty: template.difficulty,
            thresholds: template.thresholds,
            hpCurrent: 0,
            hpMax: template.hpMax,
            stressCurrent: 0,
            stressMax: template.stressMax,
            atkBonus: template.atkBonus,
            attackName: template.attackName,
            attackDamage: template.attackDamage,
            experiences: template.experiences || "",
            abilities: JSON.parse(JSON.stringify(template.abilities || [])),
            image: template.image,
            notes: ""
        });
    }

    salvarEstadoCombate();
    renderizarCriaturasCombate();

    // Feedback rápido no botão se o modal estiver aberto
    if (qtyInput) {
        const btn = qtyInput.closest(".bestiary-card-footer")?.querySelector("button");
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> +${qtd} no Combate!`;
            setTimeout(() => { btn.innerHTML = orig; }, 1200);
        }
    }
}
window.adicionarCriaturaAoCombate = adicionarCriaturaAoCombate;

function removerCriaturaDoCombate(uid) {
    combatState.enemies = combatState.enemies.filter(c => c.uid !== uid);
    salvarEstadoCombate();
    renderizarCriaturasCombate();
}
window.removerCriaturaDoCombate = removerCriaturaDoCombate;

function atualizarStatCriaturaCombate(uid, campo, valor) {
    const c = combatState.enemies.find(item => item.uid === uid);
    if (!c) return;

    if (campo === "hpCurrent") {
        c.hpCurrent = Math.max(0, Math.min(c.hpMax, Number(valor) || 0));
    } else if (campo === "hpMax") {
        c.hpMax = Math.max(1, Math.min(30, Number(valor) || 1));
        c.hpCurrent = Math.min(c.hpCurrent, c.hpMax);
    } else if (campo === "stressCurrent") {
        c.stressCurrent = Math.max(0, Math.min(c.stressMax, Number(valor) || 0));
    } else if (campo === "stressMax") {
        c.stressMax = Math.max(0, Math.min(30, Number(valor) || 0));
        c.stressCurrent = Math.min(c.stressCurrent, c.stressMax);
    } else if (campo === "notes") {
        c.notes = valor;
        salvarEstadoCombate();
        return; // Não re-renderiza o DOM inteiro enquanto digita na caixa de anotações
    } else if (campo === "instanceName") {
        c.instanceName = valor.trim() || c.instanceName;
        salvarEstadoCombate();
        return;
    }

    salvarEstadoCombate();
    renderizarCriaturasCombate();
}
window.atualizarStatCriaturaCombate = atualizarStatCriaturaCombate;

function trocarImagemCriaturaCombate(uid) {
    const c = combatState.enemies.find(item => item.uid === uid);
    if (!c) return;
    const novaUrl = prompt("Informe a URL da imagem ou caminho para representar esta criatura:", c.image);
    if (novaUrl !== null && novaUrl.trim() !== "") {
        c.image = novaUrl.trim();
        salvarEstadoCombate();
        renderizarCriaturasCombate();
    }
}
window.trocarImagemCriaturaCombate = trocarImagemCriaturaCombate;

function limparCombateInteiro() {
    if (!confirm("Deseja remover todos os heróis e criaturas da Arena de Combate atual?")) return;
    combatState.heroes = [];
    combatState.enemies = [];
    combatState.fearPoints = 1;
    salvarEstadoCombate();
    atualizarDropdownHeroisCombate();
    renderizarCombateCompleto();
}
window.limparCombateInteiro = limparCombateInteiro;

function renderizarCriaturasCombate() {
    const container = document.getElementById("combatEnemiesList");
    if (!container) return;
    container.innerHTML = "";

    if (combatState.enemies.length === 0) {
        container.innerHTML = `
            <div class="combat-empty-state">
                <i class="fa-solid fa-dragon fa-2x" style="color: var(--accent-crimson);"></i>
                <h4>Nenhuma Criatura no Combate</h4>
                <p>Clique em <strong>"+ Adicionar Criatura / Adversário"</strong> para escolher entre os 129 inimigos oficiais de <em>inimigos.pdf</em>.</p>
            </div>
        `;
        return;
    }

    combatState.enemies.forEach(c => {
        const isDefeated = c.hpCurrent >= c.hpMax;
        const card = document.createElement("div");
        card.className = `combat-entity-card enemy-combat-card ${isDefeated ? "entity-defeated" : ""}`;

        // Pílulas de PV da Criatura
        let hpPillsHtml = "";
        for (let i = 0; i < c.hpMax; i++) {
            const filled = i < c.hpCurrent;
            const nextVal = (i + 1 === c.hpCurrent) ? i : i + 1;
            hpPillsHtml += `<span class="c-pill hp-pill ${filled ? "filled" : ""}" onclick="atualizarStatCriaturaCombate('${c.uid}', 'hpCurrent', ${nextVal})" title="PV ${i + 1}"></span>`;
        }

        // Pílulas de Fadiga (PF) da Criatura
        let pfPillsHtml = "";
        for (let i = 0; i < c.stressMax; i++) {
            const filled = i < c.stressCurrent;
            const nextVal = (i + 1 === c.stressCurrent) ? i : i + 1;
            pfPillsHtml += `<span class="c-pill stress-pill ${filled ? "filled" : ""}" onclick="atualizarStatCriaturaCombate('${c.uid}', 'stressCurrent', ${nextVal})" title="Fadiga ${i + 1}"></span>`;
        }

        // Habilidades da Criatura
        const abilitiesHtml = (c.abilities || []).map(ab => {
            const typeSlug = (ab.type || "Passiva").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const usesFear = /ponto[s]? de medo/i.test(ab.description);
            const usesStress = /ponto[s]? de fadiga|\bPF\b/i.test(ab.description);

            return `
                <div class="enemy-ability-item">
                    <div class="enemy-ab-head">
                        <span class="ab-badge ab-${typeSlug}">${ab.type}</span>
                        <strong class="enemy-ab-name">${ab.name}</strong>
                        <div class="enemy-ab-quick-btns">
                            ${usesFear ? `<button type="button" class="btn-ab-cost fear-cost" onclick="ajustarPontosDeMedo(-1)" title="Gastar 1 Ponto de Medo da barra"><i class="fa-solid fa-skull"></i> -1 Medo</button>` : ""}
                            ${usesStress ? `<button type="button" class="btn-ab-cost stress-cost" onclick="atualizarStatCriaturaCombate('${c.uid}', 'stressCurrent', ${c.stressCurrent + 1})" title="Marcar +1 Ponto de Fadiga nesta criatura"><i class="fa-solid fa-bolt"></i> +1 PF</button>` : ""}
                        </div>
                    </div>
                    <p class="enemy-ab-desc">${ab.description}</p>
                </div>
            `;
        }).join("");

        card.innerHTML = `
            <div class="combat-card-top enemy-top">
                <div class="enemy-portrait-box" onclick="trocarImagemCriaturaCombate('${c.uid}')" title="Clique para alterar a imagem da criatura">
                    <img src="${c.image}" alt="${c.instanceName}" class="enemy-portrait-img" onerror="this.onerror=null; this.src='img/enemies/enemy_p1_59.png';">
                    <span class="enemy-tier-badge">${c.tier}º Patamar</span>
                    <span class="enemy-change-img-hint"><i class="fa-solid fa-camera"></i></span>
                </div>

                <div class="combat-identity">
                    <div class="combat-name-row">
                        <input type="text" class="enemy-instance-name-input" value="${c.instanceName}" onchange="atualizarStatCriaturaCombate('${c.uid}', 'instanceName', this.value)" title="Nome da criatura no encontro">
                        ${isDefeated ? `<span class="defeated-tag"><i class="fa-solid fa-skull"></i> DERROTADO</span>` : ""}
                    </div>
                    <div class="combat-badges-row">
                        <span class="enemy-role-tag">${c.role}${c.hordeCount ? ` (${c.hordeCount})` : ""}</span>
                        <span class="c-quick-stat crimson" title="Dificuldade da Criatura"><i class="fa-solid fa-bullseye"></i> Dif: <strong>${c.difficulty}</strong></span>
                        <span class="c-quick-stat amber" title="Limiares de Dano (Maior / Grave)"><i class="fa-solid fa-burst"></i> Limiares: <strong>${c.thresholds}</strong></span>
                        <span class="c-quick-stat purple" title="Bônus de Ataque"><i class="fa-solid fa-khanda"></i> ATQ: <strong>${c.atkBonus}</strong></span>
                    </div>
                    <div class="enemy-attack-line">
                        <i class="fa-solid fa-crosshairs"></i> <strong>Ataque:</strong> ${c.attackName} • <span class="atk-dmg-highlight">${c.attackDamage}</span>
                        ${c.experiences ? ` | <strong>Exp:</strong> ${c.experiences}` : ""}
                    </div>
                    ${c.tactics ? `<div class="enemy-tactics-line"><em>Motivações & Táticas:</em> ${c.tactics}</div>` : ""}
                </div>

                <div class="combat-card-actions">
                    <button type="button" class="btn-icon-action" onclick="adicionarCriaturaAoCombate(${c.enemyId}, 1)" title="Duplicar criatura (+1 no combate)">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                    <button type="button" class="btn-icon-action danger" onclick="removerCriaturaDoCombate('${c.uid}')" title="Remover criatura do combate">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

            <!-- Barras Editáveis de PV e Fadiga da Criatura -->
            <div class="combat-tracks-box">
                <!-- 1. VIDA (PV) -->
                <div class="c-track-line">
                    <div class="c-track-meta">
                        <span class="c-track-title hp-color"><i class="fa-solid fa-heart"></i> VIDA (PV)</span>
                        <div class="c-stepper">
                            <button type="button" onclick="atualizarStatCriaturaCombate('${c.uid}', 'hpCurrent', ${c.hpCurrent - 1})">-</button>
                            <input type="number" value="${c.hpCurrent}" min="0" max="${c.hpMax}" onchange="atualizarStatCriaturaCombate('${c.uid}', 'hpCurrent', this.value)">
                            <span>/</span>
                            <input type="number" value="${c.hpMax}" min="1" max="30" onchange="atualizarStatCriaturaCombate('${c.uid}', 'hpMax', this.value)" title="PV Máximo">
                            <button type="button" onclick="atualizarStatCriaturaCombate('${c.uid}', 'hpCurrent', ${c.hpCurrent + 1})">+</button>
                        </div>
                    </div>
                    <div class="c-pills-wrap">${hpPillsHtml}</div>
                </div>

                <!-- 2. FADIGA (PF) -->
                <div class="c-track-line">
                    <div class="c-track-meta">
                        <span class="c-track-title stress-color"><i class="fa-solid fa-bolt"></i> FADIGA (PF)</span>
                        <div class="c-stepper">
                            <button type="button" onclick="atualizarStatCriaturaCombate('${c.uid}', 'stressCurrent', ${c.stressCurrent - 1})">-</button>
                            <input type="number" value="${c.stressCurrent}" min="0" max="${c.stressMax}" onchange="atualizarStatCriaturaCombate('${c.uid}', 'stressCurrent', this.value)">
                            <span>/</span>
                            <input type="number" value="${c.stressMax}" min="0" max="30" onchange="atualizarStatCriaturaCombate('${c.uid}', 'stressMax', this.value)" title="PF Máximo">
                            <button type="button" onclick="atualizarStatCriaturaCombate('${c.uid}', 'stressCurrent', ${c.stressCurrent + 1})">+</button>
                        </div>
                    </div>
                    <div class="c-pills-wrap">${pfPillsHtml || '<span style="font-size:0.75rem;color:var(--text-dim);">Sem slots de Fadiga</span>'}</div>
                </div>
            </div>

            <!-- Habilidades da Criatura -->
            <div class="enemy-abilities-section">
                <div class="enemy-sec-title"><i class="fa-solid fa-book-skull"></i> HABILIDADES DA CRIATURA</div>
                <div class="enemy-abilities-list">
                    ${abilitiesHtml}
                </div>
            </div>

            <!-- Caixa de Anotações Individual da Criatura -->
            <div class="enemy-notes-section">
                <label class="enemy-sec-title"><i class="fa-solid fa-pen-to-square"></i> ANOTAÇÕES DE COMBATE / CONDIÇÕES</label>
                <textarea class="enemy-notes-textarea" rows="2" placeholder="Anote condições (Vulnerável, Imobilizado, Em Chamas), foco, marcadores ou táticas desta criatura..." oninput="atualizarStatCriaturaCombate('${c.uid}', 'notes', this.value)">${c.notes || ""}</textarea>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderizarCombateCompleto() {
    atualizarContadoresCombate();
    renderizarBarraDeMedo();
    renderizarHeroisCombate();
    renderizarCriaturasCombate();
}


