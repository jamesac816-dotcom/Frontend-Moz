/* ContaFácil MZ — Onboarding guiado para novos usuários
   Sistema de checklist para primeiro acesso */

const ONBOARDING_STEPS = [
  { id: 'adicionar-produto', icone: 'fa-box', titulo: 'Adicionar primeiro produto', descricao: 'Registe um produto no seu catálogo', funcao: () => showView('produtos') },
  { id: 'registar-cliente', icone: 'fa-user-plus', titulo: 'Registar um cliente', descricao: 'Adicione um cliente à sua base de dados', funcao: () => showView('clientes') },
  { id: 'fazer-venda', icone: 'fa-cash-register', titulo: 'Fazer a primeira venda', descricao: 'Registe uma venda no Ponto de Venda', funcao: () => showView('vendas') },
  { id: 'abrir-caixa', icone: 'fa-vault', titulo: 'Abrir o caixa', descricao: 'Configure o saldo inicial do seu caixa', funcao: () => showView('caixa') }
];

let onboardingCompleted = {};

function carregarOnboardingStatus() {
  try {
    const stored = localStorage.getItem('contafacil_onboarding_' + (state.user?.id || ''));
    onboardingCompleted = stored ? JSON.parse(stored) : {};
  } catch (e) {
    onboardingCompleted = {};
  }
}

function marcarOnboardingCompleto(stepId) {
  onboardingCompleted[stepId] = true;
  try {
    localStorage.setItem('contafacil_onboarding_' + (state.user?.id || ''), JSON.stringify(onboardingCompleted));
  } catch (e) {
    // silencioso
  }
  renderOnboardingProgress();
}

function calcularProgressoOnboarding() {
  const completados = Object.values(onboardingCompleted).filter(v => v).length;
  return Math.round((completados / ONBOARDING_STEPS.length) * 100);
}

function renderOnboardingProgress() {
  // Mostrar banner de progresso apenas se onboarding não está 100% completo
  const progresso = calcularProgressoOnboarding();
  const banner = document.getElementById('onboarding-banner');
  
  if (!banner) return; // elemento não existe
  
  if (progresso >= 100) {
    banner.style.display = 'none';
    return;
  }
  
  banner.style.display = 'flex';
  const items = ONBOARDING_STEPS.map(step => {
    const completo = onboardingCompleted[step.id];
    return `
    <div class="onb-item" style="display:flex;align-items:center;gap:8px;cursor:pointer;opacity:${completo ? '0.6' : '1'};transition:opacity .2s;" title="${step.descricao}">
      <i class="fa-solid ${step.icone}" style="color:${completo ? '#059669' : '#94A3B8'};font-size:13px;"></i>
      <span style="font-size:11px;color:${completo ? '#059669' : 'var(--ink)'};font-weight:${completo ? '700' : '500'};">${completo ? '✓' : '○'}</span>
    </div>`;
  }).join('');
  
  const barraPct = progresso;
  
  let texto = '';
  if (progresso === 0) {
    texto = '🚀 Bem-vindo! Configure o seu negócio:';
  } else if (progresso < 50) {
    texto = `⚡ Excelente! ${progresso}% do setup completo:`;
  } else if (progresso < 100) {
    texto = `🎯 Quase lá! ${progresso}% configurado:`;
  } else {
    texto = '✨ Parabéns! Seu negócio está pronto!';
  }
  
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
      <div style="font-size:13px;font-weight:600;color:var(--ink);white-space:nowrap;">${texto}</div>
      <div style="flex:1;height:6px;background:#D1F9D9;border-radius:999px;overflow:hidden;min-width:100px;">
        <div style="height:100%;width:${barraPct}%;background:linear-gradient(90deg,#059669,#10B981);border-radius:999px;transition:width .3s ease-out;box-shadow:0 0 8px rgba(16,185,129,.4);"></div>
      </div>
      <div style="font-size:12px;color:#059669;white-space:nowrap;font-weight:700;">${progresso}%</div>
    </div>
    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
      ${items}
    </div>
  `;
}

// Verificar se completou tarefas quando muda de vista
function verificarOnboardingCompletion(view) {
  if (view === 'produtos') {
    setTimeout(() => {
      if (state.products && state.products.length > 0) {
        marcarOnboardingCompleto('adicionar-produto');
      }
    }, 500);
  } else if (view === 'clientes') {
    setTimeout(() => {
      if (state.clients && state.clients.length > 0) {
        marcarOnboardingCompleto('registar-cliente');
      }
    }, 500);
  } else if (view === 'vendas') {
    setTimeout(() => {
      if (state.sales && state.sales.length > 0) {
        marcarOnboardingCompleto('fazer-venda');
      }
    }, 500);
  } else if (view === 'caixa') {
    setTimeout(() => {
      if (state.caixaAtual) {
        marcarOnboardingCompleto('abrir-caixa');
      }
    }, 500);
  }
}

// Chamar ao entrar na app
function initOnboarding() {
  carregarOnboardingStatus();
  renderOnboardingProgress();
}
