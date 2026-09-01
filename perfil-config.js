/* ContaFácil MZ — Notificações, Perfil e Configurações (incl. Módulos activos)
   Este ficheiro depende de config.js (deve ser carregado antes). */

/* =========================================================
   NOTIFICAÇÕES (calculadas localmente a partir dos dados já
   carregados — produtos e clientes ficam sempre atualizados
   porque cada ecrã os recarrega ao ser aberto)
========================================================= */
function computeNotifications(){
  const notifs = [];
  state.products.forEach(p=>{
    const s = stockInfo(p);
    if(s.isLow) notifs.push({icon:'fa-triangle-exclamation', color:'var(--danger)', titulo:`Estoque baixo: ${p.nome}`, sub:`Restam ${s.caixas} caixa(s).`});
  });
  state.clients.forEach(c=>{
    if(c.saldoDevedor>0) notifs.push({icon:'fa-hand-holding-dollar', color:'var(--warn)', titulo:`${c.nome} tem dívida pendente`, sub: formatMZN(c.saldoDevedor)});
  });
  [...state.sales].slice(-3).reverse().forEach(v=>{
    notifs.push({icon:'fa-cash-register', color:'var(--green-600)', titulo:`Nova venda ${v.numero}`, sub: formatMZN(v.total)});
  });
  return notifs;
}
function toggleNotifPanel(){
  const panel = document.getElementById('notif-panel');
  if (!panel || !state.user) return;

  const adminActive = document.getElementById('screen-admin') && document.getElementById('screen-admin').classList.contains('active');
  if (adminActive) return;

  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open', opening);
  panel.style.display = opening ? 'block' : 'none';

  if (opening) {
    if (typeof gerarNotificacoesSistema === 'function') {
      gerarNotificacoesSistema();
    } else {
      renderNotifPanel();
    }
  }
}
function renderNotifPanel(){
  const products = Array.isArray(state.products) ? state.products : [];
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const notifs = computeNotifications();
  const body = document.getElementById('notif-panel-body');
  if (!body) return;

  body.innerHTML = notifs.length ? notifs.map(n => `
    <div class="notif-item"><i class="fa-solid ${n.icon}" style="color:${n.color};"></i>
      <div><div class="ni-title">${n.titulo}</div><div class="ni-sub">${n.sub}</div></div>
    </div>`).join('') : '<div class="notif-empty">Sem notificações por agora.</div>';

  const countEl = document.getElementById('notif-count');
  const alertCount = products.filter(p => stockInfo(p).isLow).length + clients.filter(c => Number(c.saldoDevedor || 0) > 0).length;
  if (countEl) {
    countEl.style.display = alertCount ? 'inline-block' : 'none';
    countEl.textContent = alertCount;
  }
}

/* =========================================================
   PERFIL
========================================================= */
function renderPerfil(){
  const u = state.user;
  const initials = (u.ownerName||'U').trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  document.getElementById('perfil-avatar').textContent = initials;
  document.getElementById('perfil-nome-display').textContent = u.ownerName;
  document.getElementById('perfil-negocio-display').textContent = u.businessName;
  document.getElementById('perfil-business').value = u.businessName;
  document.getElementById('perfil-owner').value = u.ownerName;
  document.getElementById('perfil-phone').value = u.phone;
  document.getElementById('perfil-email').value = u.email;
  document.getElementById('perfil-tipo').value = u.businessType || '—';
  document.getElementById('perfil-cidade').value = u.city || '';
  document.getElementById('perfil-endereco').value = u.address || '';

  document.getElementById('fiscal-nuit').value = u.nuit || '';
  document.getElementById('fiscal-forma-juridica').value = u.formaJuridica || '';
  document.getElementById('fiscal-sector').value = u.sectorActividade || '';
  document.getElementById('fiscal-cae').value = u.cae || '';
  document.getElementById('fiscal-email').value = u.empresaEmail || '';
  document.getElementById('fiscal-capital-social').value = u.capitalSocial || '';
  document.getElementById('fiscal-data-constituicao').value = u.dataConstituicao ? String(u.dataConstituicao).slice(0,10) : '';
  document.getElementById('fiscal-num-funcionarios').value = u.numeroFuncionarios || '';
  document.getElementById('fiscal-regime-iva').value = u.regimeIva || 'Normal';
  document.getElementById('fiscal-regime-irpc').value = u.regimeIrpc || 'Geral';
  document.getElementById('fiscal-taxa-iva').value = u.taxaIva!=null? (u.taxaIva*100) : 16;
  document.getElementById('fiscal-taxa-irpc').value = u.taxaIrpc!=null? (u.taxaIrpc*100) : 32;
  document.getElementById('fiscal-responsavel').value = u.responsavelFinanceiro || '';
  document.getElementById('fiscal-contabilista').value = u.contabilistaCertificado || '';
}

async function handleSaveProfile(e){
  e.preventDefault();
  const nomeNegocio = document.getElementById('perfil-business').value.trim();
  const ownerName = document.getElementById('perfil-owner').value.trim();
  const phone = document.getElementById('perfil-phone').value.trim();
  const cidade = document.getElementById('perfil-cidade').value.trim();
  const endereco = document.getElementById('perfil-endereco').value.trim();

  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'A guardar...';
  try{
    await Promise.all([
      apiFetch('/auth/empresa', { method:'PUT', body: JSON.stringify({ nomeNegocio, cidade, endereco, telefone: phone }) }),
      apiFetch('/auth/usuario', { method:'PUT', body: JSON.stringify({ nome: ownerName, telefone: phone }) })
    ]);
    state.user.businessName = nomeNegocio; state.user.ownerName = ownerName; state.user.phone = phone;
    state.user.city = cidade; state.user.address = endereco;
    updateSidebarUser();
    renderPerfil();
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Guardado!';
  }catch(err){
    alert(err.message);
    btn.innerHTML = original;
  }finally{
    btn.disabled = false;
    setTimeout(()=>{ btn.innerHTML = original; }, 1800);
  }
}

async function handleSaveDadosFiscais(e){
  e.preventDefault();
  const payload = {
    nuit: document.getElementById('fiscal-nuit').value.trim(),
    formaJuridica: document.getElementById('fiscal-forma-juridica').value,
    sectorActividade: document.getElementById('fiscal-sector').value.trim(),
    cae: document.getElementById('fiscal-cae').value.trim(),
    email: document.getElementById('fiscal-email').value.trim(),
    capitalSocial: parseFloat(document.getElementById('fiscal-capital-social').value) || 0,
    dataConstituicao: document.getElementById('fiscal-data-constituicao').value || null,
    numeroFuncionarios: parseInt(document.getElementById('fiscal-num-funcionarios').value) || 0,
    regimeIva: document.getElementById('fiscal-regime-iva').value,
    regimeIrpc: document.getElementById('fiscal-regime-irpc').value,
    taxaIva: (parseFloat(document.getElementById('fiscal-taxa-iva').value) || 0) / 100,
    taxaIrpc: (parseFloat(document.getElementById('fiscal-taxa-irpc').value) || 0) / 100,
    responsavelFinanceiro: document.getElementById('fiscal-responsavel').value.trim(),
    contabilistaCertificado: document.getElementById('fiscal-contabilista').value.trim()
  };
  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'A guardar...';
  try{
    await apiFetch('/auth/empresa', { method:'PUT', body: JSON.stringify(payload) });
    Object.assign(state.user, {
      nuit: payload.nuit, formaJuridica: payload.formaJuridica, sectorActividade: payload.sectorActividade,
      cae: payload.cae, empresaEmail: payload.email, capitalSocial: payload.capitalSocial,
      dataConstituicao: payload.dataConstituicao, numeroFuncionarios: payload.numeroFuncionarios,
      regimeIva: payload.regimeIva, regimeIrpc: payload.regimeIrpc, taxaIva: payload.taxaIva, taxaIrpc: payload.taxaIrpc,
      responsavelFinanceiro: payload.responsavelFinanceiro, contabilistaCertificado: payload.contabilistaCertificado
    });
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Guardado!';
  }catch(err){
    alert(err.message);
    btn.innerHTML = original;
  }finally{
    btn.disabled = false;
    setTimeout(()=>{ btn.innerHTML = original; }, 1800);
  }
}

/* =========================================================
   CONFIGURAÇÕES
========================================================= */
function renderConfiguracoes(){
  const u = state.user;
  const planoAtual = u && u.planoAtual ? u.planoAtual : { nome: 'Essencial', preco: 12900 };
  document.getElementById('cfg-nome-negocio').textContent = u.businessName;
  document.getElementById('cfg-negocio-sub').textContent = `${u.businessType || 'Negócio'} · ${u.city || 'Moçambique'} · ${u.email}`;
  const planoEl = document.getElementById('cfg-plano-atual');
  if (planoEl) {
    planoEl.textContent = `Plano atual: ${planoAtual.nome} · ${formatPlanPrice(planoAtual.preco)}`;
  }
  renderPlanosConfig();
  renderModulosConfig();
}

function alterarPlanoAtual(planoId){
  return;
}

function renderPlanosConfig(){
  const container = document.getElementById('cfg-planos-lista');
  if(!container) return;
  const planos = state.planos && state.planos.length ? state.planos : getPlanos();
  const isAdmin = state.user && ['super_admin', 'admin'].includes(state.user.papel);
  const planoAtualId = getPlanoAtualId();
  const ordemPlanos = ['iniciante', 'essencial', 'crescimento', 'pro'];

  if (isAdmin) {
    container.innerHTML = planos.map((plano, index)=>`
      <div class="plan-config-card">
        <div class="sr-title">${plano.nome}</div>
        <div class="plan-config-grid">
          <div class="field" style="margin-bottom:0;">
            <label>Nome</label>
            <div class="field-plain"><input type="text" data-plan-field="nome" value="${plano.nome}"></div>
          </div>
          <div class="field" style="margin-bottom:0;">
            <label>Preço (MT)</label>
            <div class="field-plain"><input type="number" min="0" step="100" data-plan-field="preco" value="${Math.round(Number(plano.preco) || 0)}"></div>
          </div>
          <div class="field" style="margin-bottom:0;">
            <label>Plano destaque</label>
            <div class="field-plain">
              <select data-plan-field="recomendado">
                <option value="false" ${plano.recomendado ? '' : 'selected'}>Não</option>
                <option value="true" ${plano.recomendado ? 'selected' : ''}>Sim</option>
              </select>
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:10px;">
          <button type="button" class="btn btn-outline" data-plan-index="${index}" onclick="guardarPlanoConfig(${index})">Guardar plano</button>
        </div>
      </div>
    `).join('');
    return;
  }

  container.innerHTML = planos.map((plano)=>{
    const atual = plano.id === planoAtualId || (planoAtualId === 'essencial' && (!plano.id || plano.id === 'essencial'));
    const posAtual = ordemPlanos.indexOf(String(planoAtualId).toLowerCase());
    const posPlano = ordemPlanos.indexOf(String(plano.id || '').toLowerCase());
    const features = Array.isArray(plano.features) && plano.features.length ? plano.features : ['Funcionalidades do plano'];

    return `
      <div class="plan-config-card ${atual ? 'current-plan' : ''}">
        <div class="sr-title">${plano.nome}${atual ? ' · Plano atual' : ''}</div>
        <div class="plan-price" style="font-size:1.5rem;font-weight:800;margin:8px 0;">${formatPlanPrice(plano.preco)}</div>
        <div class="plan-desc">${plano.descricao || 'Plano do sistema'}</div>
        <ul class="plan-features" style="margin-top:12px;">
          ${features.map(feature => `<li><i class="fa-solid fa-circle-check"></i>${feature}</li>`).join('')}
        </ul>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;">
          <span class="badge" style="display:inline-flex;align-items:center;justify-content:center;padding:8px 12px;border-radius:999px;background:${atual ? '#dcfce7' : '#eef2ff'};color:${atual ? '#166534' : '#3730a3'};font-size:12px;font-weight:700;">
            ${atual ? 'Plano atual' : 'Acesso via admin'}
          </span>
          <button type="button" class="btn btn-outline" style="padding:8px 12px;font-size:12px;" onclick="openWhatsAppPurchase('${plano.id}','${plano.nome.replace(/'/g,"\\'")}', '${atual ? 'downgrade' : 'upgrade'}')">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function guardarPlanoConfig(index){
  const cards = [...document.querySelectorAll('.plan-config-card')];
  const card = cards[index];
  if(!card) return;

  const nome = card.querySelector('[data-plan-field="nome"]').value.trim() || 'Plano';
  const preco = Number(card.querySelector('[data-plan-field="preco"]').value) || 0;
  const recomendado = card.querySelector('[data-plan-field="recomendado"]').value === 'true';

  const nextPlanos = [...(state.planos || getPlanos())];
  nextPlanos[index] = {
    ...nextPlanos[index],
    nome,
    preco,
    recomendado,
    id: nextPlanos[index]?.id || String(nome).toLowerCase().replace(/\s+/g, '-')
  };

  if(recomendado){
    nextPlanos.forEach((plano, idx)=>{
      if(idx !== index) plano.recomendado = false;
    });
  }

  savePlanos(nextPlanos);
  // Tentar sincronizar com o backend (se estiver autenticado). Falha silenciosa mantém localStorage como fallback.
  (async function(){
    try{
      if(authToken){
        const plano = nextPlanos[index];
        await apiFetch('/planos/' + encodeURIComponent(plano.id), { method: 'PATCH', body: JSON.stringify({ nome: plano.nome, preco: plano.preco, recomendado: plano.recomendado, features: plano.features || [] }) });
      }
    }catch(err){
      // não bloqueamos a UX — já guardámos localmente
      console.warn('Não foi possível sincronizar plano com o servidor:', err.message);
    }
  })();

  alert('Preço do plano atualizado com sucesso.');
}

function renderModulosConfig(){
  const modulosPermitidos = getModulosPermitidosPeloPlano();
  const ativos = (state.user.modulosAtivos || Object.keys(MODULOS)).filter(modulo => modulosPermitidos.includes(modulo));
  const container = document.getElementById('cfg-modulos-lista');
  container.innerHTML = Object.entries(MODULOS)
    .filter(([chave]) => modulosPermitidos.includes(chave))
    .map(([chave, mod])=>`
      <div class="settings-row">
        <div><div class="sr-title"><i class="fa-solid ${mod.icon}" style="width:18px;color:var(--blue-700);"></i> ${mod.label}</div></div>
        <div class="switch ${ativos.includes(chave)?'on':''}" data-modulo="${chave}" onclick="this.classList.toggle('on'); handleToggleModulo()"></div>
      </div>`).join('');
}

let modulosGuardarTimeout = null;
function handleToggleModulo(){
  clearTimeout(modulosGuardarTimeout);
  modulosGuardarTimeout = setTimeout(salvarModulosAtivos, 600);
}

async function salvarModulosAtivos(){
  const modulosPermitidos = getModulosPermitidosPeloPlano();
  const selecionados = [...document.querySelectorAll('#cfg-modulos-lista .switch.on')]
    .map(el => el.dataset.modulo)
    .filter(modulo => modulosPermitidos.includes(modulo));

  try{
    const data = await apiFetch('/auth/modulos', { method:'PUT', body: JSON.stringify({ modulosAtivos: selecionados }) });
    state.user.modulosAtivos = (data.modulosAtivos || []).filter(modulo => modulosPermitidos.includes(modulo));
    aplicarFiltroModulos();
    const viewActivo = document.querySelector('#screen-app .view.active');
    if(viewActivo){
      const nomeView = viewActivo.id.replace('view-','');
      const modulo = moduloDoView(nomeView);
      if(modulo && !state.user.modulosAtivos.includes(modulo)){
        showView('dashboard');
        showView('configuracoes');
      }
    }
  }catch(err){ alert(err.message); }
}

function toggleDarkMode(el){
  const ativo = el.classList.toggle('on');
  document.body.classList.toggle('dark-mode', ativo);
}

function handleChangeIdioma(){
  const idioma = document.getElementById('cfg-idioma').value;
  if(idioma !== 'pt-MZ'){
    alert('Esse idioma ainda não está disponível. Por agora o sistema funciona apenas em Português.');
    document.getElementById('cfg-idioma').value = 'pt-MZ';
  }
}

async function handleTrocarSenha(e){
  e.preventDefault();
  const senhaAtual = document.getElementById('senha-atual').value;
  const senhaNova = document.getElementById('senha-nova').value;
  const confirmar = document.getElementById('senha-confirmar').value;
  const erro = document.getElementById('trocar-senha-erro');

  if(senhaNova !== confirmar){
    erro.textContent = 'As senhas não coincidem.';
    erro.style.display = 'block';
    return;
  }
  try{
    await apiFetch('/auth/senha', { method:'PUT', body: JSON.stringify({ senhaAtual, senhaNova }) });
    erro.style.display = 'none';
    e.target.reset();
    closeModal('modal-trocar-senha');
    alert('Senha alterada com sucesso.');
  }catch(err){
    erro.textContent = err.message;
    erro.style.display = 'block';
  }
}

