/* ContaFácil MZ — Login, registo e autenticação
   Este ficheiro depende de config.js (deve ser carregado antes). */

/* =========================================================
   AUTENTICAÇÃO
========================================================= */
function aplicarUsuarioLogado(u){
  state.user = {
    id:u.id, empresaId:u.empresa.id,
    ownerName: u.nome, email: u.email, phone: u.telefone, papel: u.papel,
    inscritoEm: u.inscritoEm || null,
    businessName: u.empresa.nomeNegocio, businessType: u.empresa.tipoNegocio,
    city: u.empresa.cidade, address: u.empresa.endereco, logo: u.empresa.logoUrl,
    nuit: u.empresa.nuit, formaJuridica: u.empresa.formaJuridica, sectorActividade: u.empresa.sectorActividade,
    cae: u.empresa.cae, empresaEmail: u.empresa.email, capitalSocial: u.empresa.capitalSocial,
    dataConstituicao: u.empresa.dataConstituicao, regimeIva: u.empresa.regimeIva, regimeIrpc: u.empresa.regimeIrpc,
    taxaIva: u.empresa.taxaIva!=null? Number(u.empresa.taxaIva): 0.16, taxaIrpc: u.empresa.taxaIrpc!=null? Number(u.empresa.taxaIrpc): 0.32,
    numeroFuncionarios: u.empresa.numeroFuncionarios, responsavelFinanceiro: u.empresa.responsavelFinanceiro,
    contabilistaCertificado: u.empresa.contabilistaCertificado,
    modulosAtivos: Array.isArray(u.empresa.modulosAtivos) && u.empresa.modulosAtivos.length ? u.empresa.modulosAtivos : Object.keys(MODULOS),
    planoAtual: u.planoAtual || {
      id: 'essencial',
      nome: 'Essencial',
      descricao: 'Plano padrão do sistema',
      preco: 12900,
      recomendado: true,
      features: ['Dashboard', 'Gestão de clientes', 'Financeiro', 'Caixa']
    }
  };
  personalizarCamposNegocio();
  aplicarFiltroModulos();
  renderResumoAssinatura();
}

async function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-password').value;
  const erroEl = document.getElementById('login-error');
  erroEl.style.display = 'none';

  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'A entrar...';
  try{
    const data = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ email, senha }) });
    authToken = data.token;
    try{ localStorage.setItem('contafacil_token', authToken); }catch(e){ /* ignore storage errors */ }
    aplicarUsuarioLogado(data.usuario);
    await carregarPlanosDoServidor();
    if(data.usuario.papel==='super_admin' || data.usuario.papel==='visualizador'){
      await enterAdminPanel();
    } else {
      await enterApp();
    }
  }catch(err){
    erroEl.textContent = err.message;
    erroEl.style.display = 'block';
  }finally{
    btn.disabled = false; btn.innerHTML = original;
  }
}

function handleRegister(e){
  e.preventDefault();
  const phoneInput = document.getElementById('reg-phone');
  const telefone = phoneInput.value.replace(/[\s()-]/g, '');
  if (!/^(?:\+?258)?\d{9}$/.test(telefone)) {
    phoneInput.setCustomValidity('Indique 9 dígitos, com ou sem +258.');
    phoneInput.reportValidity();
    return;
  }
  phoneInput.setCustomValidity('');
  pendingRegisterData = {
    nome: document.getElementById('reg-owner').value.trim(),
    nomeNegocio: document.getElementById('reg-business').value.trim(),
    telefone,
    email: document.getElementById('reg-email').value.trim(),
    senha: document.getElementById('reg-password').value
  };
  startOnboarding();
}

function handleLogout(){
  if (!window.confirm('Queres sair da conta? Para voltar, terás de iniciar sessão.')) return;
  toggleSidebar(false);
  toggleAdminSidebar(false);
  document.querySelectorAll('.modal-backdrop.active').forEach(el => el.classList.remove('active'));
  document.body.style.overflow = '';
  pendingRegisterData = null;
  pendingLogoDataUrl = null;
  pdvCart = [];
  authToken = null;
  state = {
    user:null, transactions:[], clients:[], products:[], stockMovements:[],
    suppliers:[], purchases:[], sales:[], employees:[], cashSessions:[], caixaAtual:null,
    currentPeriod:'hoje'
  };
  try{ localStorage.removeItem('contafacil_token'); }catch(e){}
  if (window.MobileNav) window.MobileNav.syncVisibility();
  showScreen('landing');
  document.querySelectorAll('input[type="password"]').forEach(el => { el.value = ''; });
}

// Tenta restaurar sessão a partir do token guardado em localStorage.
async function restoreSession(){
  try{
    const saved = localStorage.getItem('contafacil_token');
    if(!saved) {
      showScreen('landing');
      return;
    }

    authToken = saved;
    showScreen('app');

    // Pede ao backend os dados do utilizador; se falhar, limpa o token
    const data = await apiFetch('/auth/me');
    if(data){
      aplicarUsuarioLogado(data);
      await carregarPlanosDoServidor();
      if(data.papel==='super_admin' || data.papel==='visualizador'){
        await enterAdminPanel();
      } else {
        await enterApp();
      }
    }
  }catch(err){
    authToken = null;
    try{ localStorage.removeItem('contafacil_token'); }catch(e){}
    showScreen('landing');
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', restoreSession);
} else {
  restoreSession();
}

async function enterApp(){
  updateSidebarUser();
  if (window.MobileNav) window.MobileNav.syncVisibility();
  showScreen('app');
  try{
    // Dados de referência usados em vários ecrãs (listas pequenas, por isso
    // carregamos tudo já no início, para os formulários/selects ficarem prontos).
    await Promise.all([carregarProdutos(), carregarClientes(), carregarFornecedores(), carregarFuncionarios(), carregarPagamentosEstado()]);
  }catch(err){
    alert('Não foi possível carregar os dados iniciais: ' + err.message);
  }
  showView('dashboard');
  updateStockAlerts();
  renderNotifPanel();
}
