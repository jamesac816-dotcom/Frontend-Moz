/* ContaFácil MZ — Configuração da API, estado global, arquitectura modular e normalização de dados
   Este ficheiro depende de config.js (deve ser carregado antes). */

/* =========================================================
   CONFIGURAÇÃO DA API
   ---------------------------------------------------------
   Isto é a ÚNICA linha que precisa de mudar quando publicar
   o backend no seu VPS. Enquanto testa no seu computador,
   deixe como está (http://localhost:4000/api).
========================================================= */
// Detecta automaticamente base da API em desenvolvimento (localhost ou file://)
let API_BASE = 'https://https://mozbackend.up.railway.app/api';
try{
  if (typeof window !== 'undefined'){
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:'){
      API_BASE = 'http://localhost:4000/api';
    }
  }
}catch(e){ /* ambiente sem window */ }

let authToken = null;

/**
 * Função central para falar com o backend.
 * - Junta a URL base ao caminho pedido
 * - Anexa automaticamente o token JWT (quando existe)
 * - Converte a resposta em JSON
 * - Lança um erro com a mensagem vinda da API, para podermos
 *   mostrar isso ao utilizador com alert()/mensagens no ecrã
 */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = 'Bearer ' + authToken;

  let res;
  try {
    res = await fetch(API_BASE + path, { ...options, headers });
  } catch (err) {
    throw new Error('Não foi possível ligar ao servidor. Verifique se o backend está a correr em ' + API_BASE + '.');
  }

  if (res.status === 204) return null; // DELETE bem-sucedido não devolve corpo

  let data = null;
  try { data = await res.json(); } catch (e) { /* resposta sem corpo JSON */ }

  if (!res.ok) {
    if (res.status === 401 && authToken) {
      alert('A sua sessão expirou. Por favor entre novamente.');
      handleLogout();
    }
    throw new Error((data && data.erro) || 'Ocorreu um erro. Tente novamente.');
  }
  return data;
}

/* =========================================================
   ESTADO LOCAL — funciona como uma "cache" do que a API devolveu.
   Cada vez que abrimos um ecrã, voltamos a buscar os dados
   frescos à API e substituímos o conteúdo destes arrays.
========================================================= */
let state = {
  user: null,
  transactions: [],
  clients: [],
  products: [],
  stockMovements: [],
  suppliers: [],
  purchases: [],
  sales: [],
  employees: [],
  cashSessions: [],
  caixaAtual: null,
  currentPeriod: 'mes',
  payables: [],
  fixedAssets: [],
  budgetLines: [],
  ivaEntries: [],
  irpsEscaloes: [],
  ivaPeriod: 'mes',
  pagamentosEstado: null,
  mobilePayments: [],
  bancos: [],
  cartoes: [],
  categoriasFinanceiras: [],
  planos: getPlanos()
};

const PLANOS_STORAGE_KEY = 'contafacil_planos';

function getPlanosPadrao(){
  return [
    { id:'iniciante', nome:'Iniciante', descricao:'Para pequenos negócios e vendas diárias', preco:4900, recomendado:false, features:['1 utilizador','Gestão de stock','Dashboard financeiro','Clientes e caixa'] },
    { id:'essencial', nome:'Essencial', descricao:'Para lojas em crescimento com mais controlo', preco:12900, recomendado:true, features:['Tudo do Iniciante','Vendas PDV','Relatórios detalhados','Alertas de stock'] },
    { id:'crescimento', nome:'Crescimento', descricao:'Para negócios com faturamento mais alto', preco:24900, recomendado:false, features:['Tudo do Essencial','Múltiplos utilizadores','Controle financeiro avançado','Pagamentos móveis'] },
    { id:'pro', nome:'Pro', descricao:'Para marcas e operações mais completas', preco:49900, recomendado:false, features:['Tudo do Crescimento','Suporte prioritário','Relatórios e gestão multi-loja','Personalização de módulos'] }
  ];
}

function normalizePlano(plano){
  const item = plano || {};
  return {
    id: item.id || String(item.nome || 'plano').toLowerCase().replace(/\s+/g, '-'),
    nome: item.nome || 'Plano',
    descricao: item.descricao || 'Plano do sistema',
    preco: Number(item.preco) || 0,
    recomendado: !!item.recomendado,
    features: Array.isArray(item.features) && item.features.length ? item.features : ['Funcionalidades do plano']
  };
}

function ordenarPlanos(planos){
  const ordem = { iniciante: 1, essencial: 2, crescimento: 3, pro: 4 };
  return [...(Array.isArray(planos) ? planos : [])].sort((a, b) => {
    const aid = String(a && a.id ? a.id : '').toLowerCase();
    const bid = String(b && b.id ? b.id : '').toLowerCase();
    return (ordem[aid] || 99) - (ordem[bid] || 99);
  });
}

function getPlanos(){
  try{
    const raw = localStorage.getItem(PLANOS_STORAGE_KEY);
    if(!raw) return ordenarPlanos(getPlanosPadrao());
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed) || !parsed.length) return ordenarPlanos(getPlanosPadrao());
    return ordenarPlanos(parsed.map(normalizePlano));
  }catch(err){
    return ordenarPlanos(getPlanosPadrao());
  }
}

function savePlanos(planos){
  const lista = ordenarPlanos((Array.isArray(planos) ? planos : getPlanosPadrao()).map(normalizePlano));
  state.planos = lista;
  localStorage.setItem(PLANOS_STORAGE_KEY, JSON.stringify(lista));
  if(typeof renderPlanosLanding === 'function') renderPlanosLanding();
  if(typeof renderPlanosConfig === 'function') renderPlanosConfig();
  return lista;
}

function formatPlanPrice(valor){
  const value = Number(valor) || 0;
  return `${value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MT`;
}

async function renderPlanosLanding(){
  const container = document.getElementById('planos-grid');
  if(!container) return;
  let planos = state.planos && state.planos.length ? state.planos : getPlanos();
  // Tentar obter planos públicos do backend; fallback para localStorage
  try{
    const remote = await apiFetch('/planos/public');
    if(Array.isArray(remote) && remote.length) planos = remote.map(normalizePlano);
  }catch(e){ /* ignore - usar local */ }

  const planosOrdenados = ordenarPlanos(planos);

  container.innerHTML = planosOrdenados.map((plano)=>`
    <article class="plan-card ${plano.recomendado ? 'featured' : ''}">
      ${plano.recomendado ? '<span class="plan-tag">Mais popular</span>' : ''}
      <div class="plan-name">${plano.nome}</div>
      <div class="plan-desc">${plano.descricao}</div>
      <div class="plan-price">${formatPlanPrice(plano.preco)}<span>/mês</span></div>
      <ul class="plan-features">
        ${(plano.features || []).map(feature => `<li><i class="fa-solid fa-circle-check"></i>${feature}</li>`).join('')}
      </ul>
      <a href="javascript:void(0)" class="btn ${plano.recomendado ? 'btn-primary' : 'btn-outline'} btn-block" onclick="openWhatsAppPurchase('${plano.id}','${plano.nome.replace(/'/g,"\\'")}', 'escolher')">
        ${plano.recomendado ? '<i class="fa-solid fa-rocket"></i>' : '<i class="fa-solid fa-arrow-right"></i>'}
        Escolher ${plano.nome}
      </a>
    </article>
  `).join('');
}

function openWhatsAppPurchase(planoId, planoNome, action = 'escolher'){
  const phone = '258876785909';
  const empresa = state.user?.businessName || state.user?.ownerName || 'Empresa';
  const nome = state.user?.ownerName || 'Cliente';
  const tipoAcao = action === 'upgrade' ? 'Upgrade' : action === 'downgrade' ? 'Downgrade' : 'Escolha';
  const msg = `Olá! Gostaria de ${tipoAcao.toLowerCase()} o plano ${planoNome}. Nome: ${nome}. Empresa: ${empresa}. Quero receber mais informações e confirmar a melhor opção para o meu negócio.`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', renderPlanosLanding);
}else{
  renderPlanosLanding();
}

let pendingBusinessType = null;   // tipo de negócio escolhido no onboarding, antes de submeter
let pendingLogoDataUrl = null;    // logo do negócio (onboarding/perfil), em base64
let pendingProdutoImagemUrl = null; // imagem do produto, em base64 (variável própria, para não colidir com o logo)
let pendingRegisterData = null;   // nome/e-mail/telefone/senha recolhidos no passo 1 do registo
let pdvCart = [];
let pdvPayMethod = 'Dinheiro';

// Stub para evitar erro se outros scripts chamarem antes do PDV ser carregado.
async function carregarPagamentosEstado(){
  // será sobrescrita por uma implementação em `vendas.js` quando esse ficheiro for carregado.
  return;
}

// Stubs para funções que podem ser chamadas antes de `vendas.js` carregar.
function renderVendas(){ return; }
function renderPdvProducts(){ return; }
function renderPdvCart(){ return; }

function todayISO(){ return new Date().toISOString().slice(0,10); }
function formatMZN(valor){
  const v = Number(valor||0);
  return v.toLocaleString('pt-MZ', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' MT';
}
function formatDatePt(iso){
  if(!iso) return '—';
  const [y,m,d] = String(iso).slice(0,10).split('-');
  return `${d}/${m}/${y}`;
}

const CATEGORIAS_DESPESA_COLORS = {
  'Fornecedores':'#2563EB','Renda/Aluguer':'#3B82F6','Salários':'#10B981',
  'Transporte':'#34D399','Energia/Água':'#C98A1A','Outras Despesas':'#8598AB'
};
const CATEGORIAS_RECEITA_COLORS = {
  'Vendas':'#10B981','Serviços':'#34D399','Recebimento de Cliente':'#3B82F6','Outras Receitas':'#2563EB'
};

/* =========================================================
   ARQUITECTURA MODULAR — cada módulo controla um grupo de ecrãs.
   Módulos que não aparecem aqui (dashboard, perfil, configuracoes) são
   "core" e ficam sempre visíveis, para todos os tipos de negócio.
========================================================= */
const MODULOS = {
  financeiro:         { label:'Financeiro',          icon:'fa-sack-dollar',            views:['receitas','despesas','contaspagar','contasreceber','bancos','cartoes','categorias','conciliacao'] },
  caixa:              { label:'Caixa',                icon:'fa-vault',                   views:['caixa'] },
  estoque:            { label:'Estoque',              icon:'fa-warehouse',               views:['produtos','estoque'] },
  vendas:             { label:'Vendas (PDV)',         icon:'fa-cash-register',           views:['vendas'] },
  clientes:           { label:'Clientes',             icon:'fa-users',                   views:['clientes'] },
  fornecedores:       { label:'Fornecedores e Compras',icon:'fa-truck-field',            views:['fornecedores','compras'] },
  funcionarios:       { label:'Gestão de Funcionários',icon:'fa-user-tie',               views:['funcionarios'] },
  relatorios:         { label:'Relatórios',           icon:'fa-chart-pie',               views:['relatorios'] },
  pagamentos_moveis:  { label:'Pagamentos Móveis (M-Pesa/e-Mola)', icon:'fa-mobile-screen-button', views:['pagamentosmoveis'] },
  contabilidade:      { label:'Módulo Empresarial (DRE, IVA, Folha de Salários...)', icon:'fa-building-columns', views:['dre','iva','folhasalarios','imobilizado','orcamento','calendariofiscal'] }
};

const PLANOS_MODULOS = {
  iniciante: ['caixa', 'estoque', 'vendas', 'clientes', 'relatorios'],
  essencial: ['caixa', 'estoque', 'vendas', 'clientes', 'fornecedores', 'funcionarios', 'financeiro', 'relatorios'],
  crescimento: ['caixa', 'estoque', 'vendas', 'clientes', 'fornecedores', 'funcionarios', 'financeiro', 'relatorios', 'pagamentos_moveis'],
  pro: Object.keys(MODULOS)
};

const PLANOS_ORDEM = { iniciante: 1, essencial: 2, crescimento: 3, pro: 4 };
const VIEWS_POR_PLANO = {
  dashboard: 'iniciante',
  produtos: 'iniciante',
  estoque: 'iniciante',
  vendas: 'iniciante',
  clientes: 'iniciante',
  caixa: 'iniciante',
  relatorios: 'iniciante',
  receitas: 'essencial',
  despesas: 'essencial',
  bancos: 'essencial',
  cartoes: 'essencial',
  categorias: 'essencial',
  conciliacao: 'essencial',
  fornecedores: 'essencial',
  compras: 'essencial',
  funcionarios: 'essencial',
  contaspagar: 'essencial',
  contasreceber: 'essencial',
  pagamentosmoveis: 'crescimento',
  dre: 'pro',
  iva: 'pro',
  folhasalarios: 'pro',
  imobilizado: 'pro',
  orcamento: 'pro',
  calendariofiscal: 'pro'
};

function getPlanoAtualId(){
  const plano = state.user && state.user.planoAtual ? state.user.planoAtual : null;
  if (!plano) return 'essencial';
  if (typeof plano === 'string') return plano;
  return plano.id || plano.nome || 'essencial';
}

function getModulosPermitidosPeloPlano(){
  const planoId = String(getPlanoAtualId()).toLowerCase();
  if (PLANOS_MODULOS[planoId]) return [...PLANOS_MODULOS[planoId]];
  return [...(PLANOS_MODULOS.essencial || Object.keys(MODULOS))];
}

function podeAcessarModulo(modulo){
  if (!modulo || !state.user) return true;
  if (['super_admin', 'admin', 'visualizador'].includes(state.user.papel)) return true;

  const modulosPermitidos = getModulosPermitidosPeloPlano();
  const modulosAtivos = Array.isArray(state.user.modulosAtivos) && state.user.modulosAtivos.length
    ? state.user.modulosAtivos
    : Object.keys(MODULOS);

  return modulosPermitidos.includes(modulo) && modulosAtivos.includes(modulo);
}

function getPlanoRequeridoParaView(view){
  return VIEWS_POR_PLANO[view] || 'iniciante';
}

function podeAcessarView(view){
  if (!view) return true;
  if (state.user && ['super_admin', 'admin', 'visualizador'].includes(state.user.papel)) return true;

  const modulo = moduloDoView(view);
  if (modulo && !podeAcessarModulo(modulo)) return false;

  const planoAtual = String(getPlanoAtualId()).toLowerCase();
  const planoNecessario = getPlanoRequeridoParaView(view);
  return (PLANOS_ORDEM[planoAtual] || 1) >= (PLANOS_ORDEM[planoNecessario] || 1);
}

function mostrarMensagemPlanoBloqueado(view){
  const planoNecessario = getPlanoRequeridoParaView(view);
  const nomePlano = (state.planos || getPlanos()).find(p => String(p.id).toLowerCase() === String(planoNecessario).toLowerCase())?.nome || planoNecessario;

  const mensagem = `Essas funções só funcionam a partir do plano ${nomePlano}.\n\nFale com o administrador para atualizar a sua conta.`;

  if (typeof window !== 'undefined' && document && document.getElementById('plan-lock-modal')) {
    const modal = document.getElementById('plan-lock-modal');
    const txt = document.getElementById('plan-lock-message');
    if (txt) txt.textContent = mensagem;
    if (modal) modal.classList.add('active');
    return;
  }

  alert(mensagem);
}

function moduloDoView(view){
  for(const [chave, mod] of Object.entries(MODULOS)){
    if(mod.views.includes(view)) return chave;
  }
  return null; // ecrã "core" — sempre visível
}

// Mostra/esconde os itens do menu lateral consoante os módulos activos da empresa e o plano.
function aplicarFiltroModulos(){
  if (!state.user) return;
  const modulosPermitidos = getModulosPermitidosPeloPlano();
  const ativos = (state.user.modulosAtivos || Object.keys(MODULOS)).filter(modulo => modulosPermitidos.includes(modulo));

  document.querySelectorAll('.sidebar-nav .nav-item[data-view]').forEach(item=>{
    const modulo = moduloDoView(item.dataset.view);
    const view = item.dataset.view;
    const bloqueado = view && !podeAcessarView(view);
    const visivelModulo = !modulo || (ativos.includes(modulo) && modulosPermitidos.includes(modulo));
    item.style.display = visivelModulo && !bloqueado ? '' : 'none';
  });

  document.querySelectorAll('.sidebar-section-label').forEach(label=>{
    let el = label.nextElementSibling, algumVisivel = false;
    while(el && el.classList.contains('nav-item')){
      if(el.style.display !== 'none') algumVisivel = true;
      el = el.nextElementSibling;
    }
    label.style.display = algumVisivel ? '' : 'none';
  });
}

/* =========================================================
   NORMALIZAÇÃO — converte as respostas da API (colunas em
   snake_case, como vêm do Postgres) para o formato camelCase
   que o resto da interface usa.
========================================================= */
function normalizeProduto(r){
  return {
    id: r.id, nome:r.nome, categoria:r.categoria||'', marca:r.marca||'',
    codigoInterno:r.codigo_interno||'', codigoBarras:r.codigo_barras||'',
    fornecedorId:r.fornecedor_id||'', descricao:r.descricao||'',
    precoCompra:Number(r.preco_compra), precoVendaUnidade:Number(r.preco_venda_unidade),
    precoVendaCaixa:Number(r.preco_venda_caixa), qtdPorCaixa:Number(r.qtd_por_caixa),
    qtdEstoqueUnidades:Number(r.qtd_estoque_unidades), qtdMinima:Number(r.qtd_minima_caixas),
    imagem:r.imagem_url, status:r.status
  };
}
function normalizeCliente(r){
  return { id:r.id, nome:r.nome, telefone:r.telefone||'', nif:r.nif||'', saldoDevedor:Number(r.saldo_devedor) };
}
function normalizeFornecedor(r){
  return { id:r.id, nome:r.nome, empresa:r.empresa||'', telefone:r.telefone||'', email:r.email||'', cidade:r.cidade||'', produtos:r.produtos_fornecidos||'' };
}
function normalizeFuncionario(r){
  return { id:r.id, nome:r.nome, cargo:r.cargo||'', telefone:r.telefone||'', salario:Number(r.salario), status:r.status };
}
function normalizeTransacao(r){
  return { id:r.id, tipo:r.tipo, valor:Number(r.valor), categoria:r.categoria, descricao:r.descricao||'', data:r.data };
}
function normalizeMovimento(r){
  return { id:r.id, productId:r.produto_id, tipo:r.tipo, quantidade:Number(r.quantidade_unidades),
    motivo:r.motivo||'', data:r.data, hora:(r.hora||'').slice(0,5), usuario:r.usuario_nome||state.user.ownerName };
}

