/* ContaFácil MZ — Sistema central de notificações
   Responsável por agregar e exibir alertas inteligentes */

const NOTIF_TYPES = {
  ESTOQUE_BAIXO: 'estoque_baixo',
  ESTOQUE_CRITICO: 'estoque_critico',
  DIVIDA_VENCIDA: 'divida_vencida',
  DIVIDA_PROXIMA_VENCER: 'divida_proxima',
  CAIXA_ABERTO: 'caixa_aberto',
  VENDAS_POSITIVAS: 'vendas_positivas',
  ALERTA_GERAL: 'alerta_geral'
};

let notificacoes = [];

async function gerarNotificacoesSistema() {
  notificacoes = [];
  const ativos = state.user?.modulosAtivos || [];
  
  try {
    // Alertas de estoque baixo
    if (ativos.includes('estoque')) {
      await gerarAlertasEstoque();
    }

    // Alertas de dívidas
    if (ativos.includes('financeiro') || ativos.includes('clientes')) {
      await gerarAlertasDividas();
    }

    // Alerta: Caixa aberto
    if (ativos.includes('caixa')) {
      await gerarAlertaCaixa();
    }

    // Alerta: Vendas positivas (animador)
    if (ativos.includes('vendas')) {
      await gerarAlertaVendas();
    }

  } catch (err) {
    console.log('Erro ao gerar notificações:', err);
  }

  exibirNotificacoes();
  atualizarBadgeNotificacoes();
}

async function gerarAlertasEstoque() {
  try {
    await carregarProdutos();
    const estoqueBaixo = state.products.filter(p => {
      const info = stockInfo(p);
      return info.isLow || info.isCritical;
    });

    estoqueBaixo.slice(0, 3).forEach(p => {
      const info = stockInfo(p);
      if (info.isCritical) {
        notificacoes.push({
          id: 'estoque_' + p.id,
          tipo: NOTIF_TYPES.ESTOQUE_CRITICO,
          icone: 'fa-triangle-exclamation',
          titulo: '🔴 ' + p.nome + ' — ESGOTADO',
          descricao: 'Estoque em falta. Clique para repor.',
          cor: '#D64545',
          acao: () => showView('estoque')
        });
      } else if (info.isLow) {
        notificacoes.push({
          id: 'estoque_' + p.id,
          tipo: NOTIF_TYPES.ESTOQUE_BAIXO,
          icone: 'fa-circle-exclamation',
          titulo: '🟡 ' + p.nome + ' — A acabar',
          descricao: 'Considere fazer encomenda.',
          cor: '#C98A1A',
          acao: () => showView('estoque')
        });
      }
    });

    if (estoqueBaixo.length > 3) {
      notificacoes.push({
        id: 'estoque_resumo',
        tipo: NOTIF_TYPES.ESTOQUE_BAIXO,
        icone: 'fa-warehouse',
        titulo: '🟡 ' + (estoqueBaixo.length - 3) + ' produtos adicionais em falta',
        descricao: 'Veja todos em Estoque.',
        cor: '#C98A1A',
        acao: () => showView('estoque')
      });
    }
  } catch (err) {
    console.log('Erro ao gerar alertas de estoque:', err);
  }
}

async function gerarAlertasDividas() {
  try {
    await carregarClientes();
    const comDivida = state.clients.filter(c => c.saldoDevedor > 0).sort((a, b) => b.saldoDevedor - a.saldoDevedor);

    if (comDivida.length > 0) {
      const maiorDevedor = comDivida[0];
      notificacoes.push({
        id: 'divida_maior',
        tipo: NOTIF_TYPES.DIVIDA_VENCIDA,
        icone: 'fa-circle-exclamation',
        titulo: '💬 ' + maiorDevedor.nome + ' deve ' + formatMZN(maiorDevedor.saldoDevedor),
        descricao: 'Cliente com maior dívida.',
        cor: '#C98A1A',
        acao: () => showView('clientes')
      });
    }

    if (comDivida.length > 1) {
      const totalDivida = comDivida.reduce((s, c) => s + c.saldoDevedor, 0);
      notificacoes.push({
        id: 'dividas_total',
        tipo: NOTIF_TYPES.DIVIDA_VENCIDA,
        icone: 'fa-money-bill-transfer',
        titulo: '💰 Dívida total: ' + formatMZN(totalDivida),
        descricao: comDivida.length + ' clientes com dívida.',
        cor: '#D64545',
        acao: () => showView('clientes')
      });
    }
  } catch (err) {
    console.log('Erro ao gerar alertas de dívidas:', err);
  }
}

async function gerarAlertaCaixa() {
  try {
    const sessao = await apiFetch('/caixa/atual');
    if (sessao) {
      notificacoes.push({
        id: 'caixa_aberto',
        tipo: NOTIF_TYPES.CAIXA_ABERTO,
        icone: 'fa-vault',
        titulo: '🔓 Caixa ainda está aberto',
        descricao: 'Não se esqueça de fazer fecho.',
        cor: '#C98A1A',
        acao: () => showView('caixa')
      });
    }
  } catch (err) {
    // caixa sem sessão aberta — normal
  }
}

async function gerarAlertaVendas() {
  try {
    const vendasHoje = (await carregarTransacoes('receita', 'hoje')).filter(t => t.categoria === 'Vendas');
    if (vendasHoje.length > 0) {
      const total = vendasHoje.reduce((s, t) => s + t.valor, 0);
      notificacoes.push({
        id: 'vendas_hoje',
        tipo: NOTIF_TYPES.VENDAS_POSITIVAS,
        icone: 'fa-arrow-trend-up',
        titulo: '🟢 Vendas de hoje: ' + formatMZN(total),
        descricao: vendasHoje.length + ' transacção(ões).',
        cor: '#10B981'
      });
    }
  } catch (err) {
    console.log('Erro ao gerar alerta de vendas:', err);
  }
}

function exibirNotificacoes() {
  const body = document.getElementById('notif-panel-body');
  if (!body) return;

  if (notificacoes.length === 0) {
    body.innerHTML = '<div style="padding:20px;text-align:center;color:var(--slate-400);font-size:13px;"><i class="fa-solid fa-bell-slash"></i><p>Tudo bem por agora!</p></div>';
    return;
  }

  body.innerHTML = notificacoes.map(n => `
    <div class="notif-item" style="cursor:pointer;border-left:4px solid ${n.cor};" onclick="javascript:${n.acao ? n.acao.toString().replace(/^function.*?\{/, '').slice(0, -1) : ''}; closeNotifPanel()">
      <div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-bottom:1px solid #EFF1F5;">
        <div style="color:${n.cor};font-size:16px;margin-top:2px;"><i class="fa-solid ${n.icone}"></i></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;color:var(--ink);font-size:13px;">${n.titulo}</div>
          <div style="font-size:12px;color:var(--slate-600);margin-top:2px;">${n.descricao}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function atualizarBadgeNotificacoes() {
  const badge = document.getElementById('notif-count');
  if (badge) {
    if (notificacoes.length > 0) {
      badge.textContent = notificacoes.length;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel || !state.user) return;

  const adminActive = document.getElementById('screen-admin') && document.getElementById('screen-admin').classList.contains('active');
  if (adminActive) return;

  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open', opening);
  panel.style.display = 'block';
  panel.style.visibility = opening ? 'visible' : 'hidden';
  panel.style.opacity = opening ? '1' : '0';
  panel.style.pointerEvents = opening ? 'auto' : 'none';

  if (opening) {
    gerarNotificacoesSistema();
  }
}

function closeNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (panel) {
    panel.classList.remove('open');
    panel.style.display = 'block';
    panel.style.visibility = 'hidden';
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
  }
}

// Executar a cada 2 minutos para atualizar notificações
setInterval(() => {
  if (state.user) {
    gerarNotificacoesSistema();
  }
}, 120000);
