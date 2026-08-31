/* ContaFácil MZ — Painel de Administração (super_admin / visualizador)
   Este ficheiro depende de config.js (deve ser carregado antes). */

/* =========================================================
   PAINEL DE ADMINISTRAÇÃO (super_admin / visualizador)
========================================================= */
async function enterAdminPanel(){
  const u = state.user;
  const initials = (u.ownerName||'U').trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  document.getElementById('admin-sidebar-avatar').textContent = initials;
  document.getElementById('admin-sidebar-username').textContent = u.ownerName;
  document.getElementById('admin-sidebar-papel').textContent = u.papel==='super_admin' ? 'Super Administrador' : 'Visualizador';
  document.getElementById('admin-nav-usuarios').style.display = u.papel==='super_admin' ? 'flex' : 'none';
  // Mostrar link para gerir planos apenas para super_admin
  const navPlanos = document.querySelector('[data-admin-view="planos"]');
  if(navPlanos) navPlanos.style.display = u.papel==='super_admin' ? 'flex' : 'none';

  showScreen('admin');
  showAdminView('empresas');
}

function toggleAdminSidebar(open){
  document.getElementById('admin-sidebar').classList.toggle('open', open);
  document.getElementById('admin-sidebar-overlay').classList.toggle('show', open);
}

function showAdminView(view){
  toggleAdminSidebar(false);
  document.querySelectorAll('#screen-admin .view').forEach(v=>v.classList.remove('active'));
  document.getElementById('admin-view-'+view).classList.add('active');
  document.querySelectorAll('#admin-sidebar .nav-item').forEach(n=>n.classList.remove('active'));
  const navItem = document.querySelector(`#admin-sidebar .nav-item[data-admin-view="${view}"]`);
  if(navItem) navItem.classList.add('active');

  const titles = { empresas:'Empresas', usuarios:'Utilizadores' };
  document.getElementById('admin-topbar-title').textContent = titles[view] || 'Empresas';

  if(view==='empresas') renderAdminEmpresas();
  if(view==='usuarios') renderAdminUsuarios();
  if(view==='planos') renderAdminPlanos();
}

async function renderAdminEmpresas(){
  let rows;
  try{ rows = await apiFetch('/admin/empresas'); }
  catch(err){ alert(err.message); return; }

  const podeGerir = state.user.papel==='super_admin';
  const tbody = document.querySelector('#table-admin-empresas tbody');
  tbody.innerHTML = rows.map(e=>`
    <tr>
      <td><b>${e.nome_negocio}</b></td>
      <td>${e.tipo_negocio||'—'}</td>
      <td>${e.cidade||'—'}</td>
      <td>${e.dono_nome||'—'}<div style="font-size:11px;color:var(--slate-400);">${e.dono_email||''}</div></td>
      <td style="text-align:right;">${e.total_produtos}</td>
      <td style="text-align:right;">${e.total_usuarios}</td>
      <td style="text-align:right;" class="mono">${formatMZN(e.receitas_mes)}</td>
      <td class="row-actions" style="white-space:nowrap;">
        <button title="Ver produtos" onclick="abrirProdutosDaEmpresa('${e.id}','${e.nome_negocio.replace(/'/g,"&apos;")}')"><i class="fa-solid fa-box"></i></button>
        ${podeGerir? `<button title="Remover empresa" onclick="deleteAdminEmpresa('${e.id}')"><i class="fa-solid fa-trash"></i></button>`:''}
      </td>
    </tr>`).join('');
}

let adminEmpresaAtualId = null;

async function abrirProdutosDaEmpresa(empresaId, nomeNegocio){
  adminEmpresaAtualId = empresaId;
  document.getElementById('admin-produtos-empresa-nome').textContent = nomeNegocio;
  showAdminView('produtos-empresa');
  document.getElementById('admin-topbar-title').textContent = nomeNegocio;

  try{
    const [resumo, produtos] = await Promise.all([
      apiFetch('/admin/empresas/'+empresaId+'/resumo'),
      apiFetch('/admin/empresas/'+empresaId+'/produtos')
    ]);

    document.getElementById('admin-emp-saldo').textContent = formatMZN(resumo.saldoAtual);
    document.getElementById('admin-emp-receitas').textContent = formatMZN(resumo.receitasMes);
    document.getElementById('admin-emp-despesas').textContent = formatMZN(resumo.despesasMes);
    document.getElementById('admin-emp-lucro').textContent = formatMZN(resumo.lucroMes);
    document.getElementById('admin-emp-lucro').style.color = resumo.lucroMes>=0? 'var(--green-600)':'var(--danger)';

    document.querySelector('#table-admin-produtos tbody').innerHTML = produtos.map(p=>`
      <tr>
        <td><b>${p.nome}</b></td>
        <td>${p.categoria||'—'}</td>
        <td>${p.marca||'—'}</td>
        <td style="text-align:right;" class="mono">${formatMZN(p.preco_venda_unidade)}</td>
        <td style="text-align:right;" class="mono">${formatMZN(p.preco_venda_caixa)}</td>
        <td style="text-align:right;">${p.qtd_estoque_unidades}</td>
        <td><span class="tag ${p.status==='Ativo'?'green':'red'}">${p.status}</span></td>
      </tr>`).join('');
    document.getElementById('empty-admin-produtos').style.display = produtos.length? 'none':'block';

    document.querySelector('#table-admin-clientes tbody').innerHTML = resumo.clientes.map(c=>`
      <tr><td><b>${c.nome}</b></td><td>${c.telefone||'—'}</td>
      <td style="text-align:right;" class="${c.saldo_devedor>0?'amount-neg':'amount-pos'}">${formatMZN(c.saldo_devedor)}</td></tr>`).join('');
    document.getElementById('empty-admin-clientes').style.display = resumo.clientes.length? 'none':'block';

    document.querySelector('#table-admin-funcionarios tbody').innerHTML = resumo.funcionarios.map(f=>`
      <tr><td><b>${f.nome}</b></td><td>${f.cargo||'—'}</td>
      <td style="text-align:right;" class="mono">${formatMZN(f.salario)}</td>
      <td><span class="tag ${f.status==='Ativo'?'green':'red'}">${f.status}</span></td></tr>`).join('');
    document.getElementById('empty-admin-funcionarios').style.display = resumo.funcionarios.length? 'none':'block';

    showAdminEmpresaTab('produtos');
  }catch(err){ alert(err.message); }
}

function showAdminEmpresaTab(tab){
  document.querySelectorAll('#admin-emp-tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.admin-emp-tab-panel').forEach(p=>{
    p.style.display = p.id==='admin-emp-tab-'+tab ? 'block' : 'none';
  });
}

async function deleteAdminEmpresa(id){
  if(!confirm('Isto remove PERMANENTEMENTE esta empresa e todos os seus dados (produtos, clientes, vendas, etc.). Tem a certeza?')) return;
  try{
    await apiFetch('/admin/empresas/'+id, { method:'DELETE' });
    renderAdminEmpresas();
  }catch(err){ alert(err.message); }
}

async function downloadDatabaseBackup(){
  if (!state.user || state.user.papel !== 'super_admin') {
    alert('Apenas o super administrador pode fazer backup completo da base de dados.');
    return;
  }

  try {
    const response = await fetch(API_BASE + '/admin/backup/sql', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + authToken,
      }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error((data && data.erro) || 'Não foi possível gerar o backup SQL.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = 'contafacil-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.sql';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    alert('Backup SQL gerado e descarregado com sucesso.');
  } catch (err) {
    alert(err.message);
  }
}

async function renderAdminUsuarios(){
  let rows;
  try{ rows = await apiFetch('/admin/usuarios'); }
  catch(err){ alert(err.message); return; }

  const papelLabel = {super_admin:'Super Administrador', dono:'Dono de Negócio', visualizador:'Visualizador'};
  const tbody = document.querySelector('#table-admin-usuarios tbody');
  tbody.innerHTML = rows.map(u=>`
    <tr>
      <td><b>${u.nome}</b></td>
      <td>${u.email}</td>
      <td>${u.nome_negocio||'—'}</td>
      <td><div class="field-plain"><select onchange="changeAdminUsuarioPapel('${u.id}', this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;">
        <option value="dono" ${u.papel==='dono'?'selected':''}>Dono de Negócio</option>
        <option value="visualizador" ${u.papel==='visualizador'?'selected':''}>Visualizador</option>
        <option value="super_admin" ${u.papel==='super_admin'?'selected':''}>Super Administrador</option>
      </select></div></td>
      <td class="row-actions"><button title="Remover" onclick="deleteAdminUsuario('${u.id}')"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`).join('');
}

function getClientePlanosMap(){
  try {
    const raw = localStorage.getItem('contafacil_cliente_planos');
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function guardarClientePlanosMap(map){
  localStorage.setItem('contafacil_cliente_planos', JSON.stringify(map));
}

async function guardarPlanoAdmin(index){
  const planos = [...(state.planos || getPlanos())];
  const card = document.querySelectorAll('#admin-planos-lista .plan-admin-card')[index];
  if(!card) return;

  const nome = card.querySelector('[data-plan-field="nome"]').value.trim() || 'Plano';
  const descricao = card.querySelector('[data-plan-field="descricao"]').value.trim() || 'Plano do sistema';
  const preco = Number(card.querySelector('[data-plan-field="preco"]').value) || 0;
  const recomendado = card.querySelector('[data-plan-field="recomendado"]').checked;

  const planoAtual = planos[index] || { id: String(nome).toLowerCase().replace(/\s+/g, '-') };
  const payload = {
    nome,
    descricao,
    preco,
    recomendado,
    features: planoAtual.features || ['Funcionalidades do plano']
  };

  const btn = card.querySelector('button[type="button"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A guardar...';

  try {
    const res = await apiFetch('/planos/' + encodeURIComponent(planoAtual.id || String(nome).toLowerCase().replace(/\s+/g, '-')), {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    const nextPlanos = [...planos];
    nextPlanos[index] = { ...planoAtual, ...res, ...payload, id: res?.id || planoAtual.id };
    if (recomendado) {
      nextPlanos.forEach((plano, idx) => {
        if (idx !== index) plano.recomendado = false;
      });
    }
    savePlanos(nextPlanos);
    state.planos = nextPlanos;

    const badge = document.createElement('div');
    badge.className = 'tag green';
    badge.style.marginTop = '10px';
    badge.style.display = 'inline-block';
    badge.textContent = `Preço atualizado para ${formatPlanPrice(preco)}`;

    const existing = card.querySelector('.plan-price-status');
    if (existing) existing.remove();
    badge.classList.add('plan-price-status');
    card.appendChild(badge);

    btn.innerHTML = '<i class="fa-solid fa-check"></i> Guardado';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      badge.remove();
    }, 2200);

    await renderAdminPlanos();
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = originalText;
    alert(err.message);
  }
}

async function adminAtualizarPlanoCliente(empresaId, planoId){
  const select = document.querySelector(`select[data-empresa-plan-select="${empresaId}"]`);
  const previous = select ? select.dataset.previousValue || select.value : planoId;

  if (select) {
    select.disabled = true;
    select.dataset.previousValue = previous;
  }

  try {
    await apiFetch('/admin/empresas/' + encodeURIComponent(empresaId) + '/plano', {
      method: 'POST',
      body: JSON.stringify({ plano_id: planoId })
    });

    const plano = state.planos?.find(p => p.id === planoId) || { nome: 'Plano' };
    const row = select ? select.closest('tr') : null;
    if (row) {
      const status = row.querySelector('.plan-assignment-status');
      const badge = document.createElement('span');
      badge.className = 'tag green plan-assignment-status';
      badge.textContent = `Plano atualizado: ${plano.nome}`;
      if (status) status.remove();
      row.querySelector('td:last-child').appendChild(badge);
    }

    await renderAdminPlanos();
  } catch (err) {
    if (select) {
      select.value = previous;
    }
    alert(err.message);
  } finally {
    if (select) {
      select.disabled = false;
      select.dataset.previousValue = planoId;
    }
  }
}

async function renderAdminPlanos(){
  try {
    const planos = ordenarPlanos(await apiFetch('/planos'));
    state.planos = planos;
    savePlanos(planos);

    const planosLista = document.getElementById('admin-planos-lista');
    if(planosLista){
      planosLista.innerHTML = planos.map((plano, index)=>`
        <div class="plan-admin-card" style="background:#fff;border:1px solid var(--border);border-radius:18px;padding:18px;box-shadow:var(--shadow-sm);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;">
            <div style="font-size:15px;font-weight:800;">${plano.nome}</div>
            <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--slate-600);">
              <input type="checkbox" data-plan-field="recomendado" ${plano.recomendado ? 'checked' : ''}> Destaque
            </label>
          </div>
          <div class="field" style="margin-bottom:10px;">
            <label>Nome do plano</label>
            <div class="field-plain"><input type="text" data-plan-field="nome" value="${plano.nome.replace(/"/g,'&quot;')}" /></div>
          </div>
          <div class="field" style="margin-bottom:10px;">
            <label>Descrição</label>
            <div class="field-plain"><input type="text" data-plan-field="descricao" value="${(plano.descricao || '').replace(/"/g,'&quot;')}" /></div>
          </div>
          <div class="field" style="margin-bottom:14px;">
            <label>Preço (MT)</label>
            <div class="field-plain"><input type="number" min="0" step="100" data-plan-field="preco" value="${Math.round(Number(plano.preco) || 0)}" /></div>
          </div>
          <button type="button" class="btn btn-primary btn-block" onclick="guardarPlanoAdmin(${index})"><i class="fa-solid fa-floppy-disk"></i> Guardar preço</button>
        </div>
      `).join('');
    }

    const clientes = await apiFetch('/admin/planos');
    const tabelaClientes = document.querySelector('#table-admin-planos-clientes tbody');
    if(!tabelaClientes) return;

    tabelaClientes.innerHTML = clientes.length ? clientes.map(empresa => {
      const planoAtualId = empresa.plano_id || 'essencial';
      const planoAtual = planos.find(p => p.id === planoAtualId) || planos[0];
      return `
        <tr>
          <td><b>${empresa.nome_negocio}</b></td>
          <td>${empresa.dono_nome || '—'}<div style="font-size:11px;color:var(--slate-400);">${empresa.dono_email || ''}</div></td>
          <td>
            <div class="field-plain">
              <select data-empresa-plan-select="${empresa.id}" onchange="adminAtualizarPlanoCliente('${empresa.id}', this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;">
                ${planos.map(plano => `<option value="${plano.id}" ${planoAtualId === plano.id ? 'selected' : ''}>${plano.nome}</option>`).join('')}
              </select>
            </div>
          </td>
          <td style="text-align:right;">
            <span class="tag green plan-assignment-status">${planoAtual ? planoAtual.nome : 'Sem plano'}</span>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-building"></i><p>Sem empresas registadas para gerir planos.</p></div></td></tr>';
  } catch (err) {
    alert(err.message);
  }
}

async function openAdminPlanPayPrompt(planId){
  const meses = prompt('Número de meses a registar (ex: 1):', '1');
  if(!meses) return;
  const valor = prompt('Valor recebido (opcional):', '0');
  try{
    await apiFetch('/user_plans/'+planId+'/pay', { method:'POST', body: JSON.stringify({ meses: Number(meses), valor: Number(valor) }) });
    alert('Pagamento registado.');
    renderAdminPlanos();
  }catch(err){ alert(err.message); }
}

function openAdminUsuarioModal(){
  document.querySelector('#modal-admin-usuario form').reset();
  openModal('modal-admin-usuario');
}

function openAdminEmpresaModal(){
  const form = document.querySelector('#modal-admin-empresa form');
  if (form) form.reset();
  openModal('modal-admin-empresa');
}

async function handleAddAdminEmpresa(e){
  e.preventDefault();
  const payload = {
    nomeNegocio: document.getElementById('admin-empresa-nome').value.trim(),
    tipoNegocio: document.getElementById('admin-empresa-tipo').value.trim(),
    nomeResponsavel: document.getElementById('admin-empresa-responsavel').value.trim(),
    email: document.getElementById('admin-empresa-email').value.trim(),
    telefone: document.getElementById('admin-empresa-telefone').value.trim(),
    senha: document.getElementById('admin-empresa-senha').value,
    cidade: document.getElementById('admin-empresa-cidade').value.trim(),
    endereco: document.getElementById('admin-empresa-endereco').value.trim(),
  };

  try {
    await apiFetch('/admin/empresas', { method:'POST', body: JSON.stringify(payload) });
    closeModal('modal-admin-empresa');
    renderAdminEmpresas();
    alert('Empresa criada com sucesso e plano inicial atribuído.');
  } catch (err) {
    alert(err.message);
  }
}

async function handleAddAdminUsuario(e){
  e.preventDefault();
  const payload = {
    nome: document.getElementById('admin-user-nome').value.trim(),
    email: document.getElementById('admin-user-email').value.trim(),
    telefone: document.getElementById('admin-user-telefone').value.trim(),
    senha: document.getElementById('admin-user-senha').value,
    papel: document.getElementById('admin-user-papel').value
  };
  try{
    await apiFetch('/admin/usuarios', { method:'POST', body: JSON.stringify(payload) });
    closeModal('modal-admin-usuario');
    renderAdminUsuarios();
  }catch(err){ alert(err.message); }
}

async function changeAdminUsuarioPapel(id, papel){
  try{
    await apiFetch('/admin/usuarios/'+id+'/papel', { method:'PATCH', body: JSON.stringify({ papel }) });
  }catch(err){
    alert(err.message);
    renderAdminUsuarios();
  }
}

async function deleteAdminUsuario(id){
  if(!confirm('Remover este utilizador?')) return;
  try{
    await apiFetch('/admin/usuarios/'+id, { method:'DELETE' });
    renderAdminUsuarios();
  }catch(err){ alert(err.message); }
}

function updateSidebarUser(){
  const u = state.user;
  const initials = (u.ownerName||'U').trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const planoNome = (u.planoAtual && u.planoAtual.nome) || 'Essencial';
  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('sidebar-username').textContent = `${u.ownerName} · ${planoNome}`;
  document.getElementById('sidebar-bizname').textContent = u.businessName;

  // Se for super_admin, esconder o menu de navegação da app e mostrar um único link para o Admin Panel
  const mainNavItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
  if(u.papel === 'super_admin'){
    mainNavItems.forEach(it => it.style.display = 'none');
    // adicionar link / botão para abrir Admin Panel se não existir
    if(!document.getElementById('admin-link-in-main')){
      const a = document.createElement('a');
      a.id = 'admin-link-in-main';
      a.className = 'nav-item';
      a.href = 'javascript:void(0)';
      a.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
      a.onclick = () => { enterAdminPanel(); };
      const nav = document.querySelector('.sidebar-nav');
      if(nav) nav.insertBefore(a, nav.firstChild);
    }
  } else {
    // restaurar menu normal e remover o link admin se existir
    mainNavItems.forEach(it => it.style.display = 'flex');
    const adminLink = document.getElementById('admin-link-in-main');
    if(adminLink) adminLink.remove();
  }
}

