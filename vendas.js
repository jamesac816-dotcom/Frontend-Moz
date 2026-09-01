/* ContaFácil MZ — PDV (Ponto de Venda) e Pagamentos Móveis (M-Pesa/e-Mola)
   Este ficheiro depende de config.js (deve ser carregado antes). */

/* =========================================================
   VENDAS (PDV)
========================================================= */
function renderPdvProducts(){
  const q = (document.getElementById('pdv-search').value||'').toLowerCase();
  const grid = document.getElementById('pdv-product-grid');
  const items = state.products.filter(p => p.status==='Ativo' && (p.nome.toLowerCase().includes(q) || (p.codigoInterno||'').toLowerCase().includes(q)));
  grid.innerHTML = items.map(p=>{
    const s = stockInfo(p);
    const disabled = s.totalUnidades<=0;
    return `
    <button type="button" class="pdv-product-card" ${disabled?'style="opacity:.45;pointer-events:none;"':''} onclick="addToCart('${p.id}')">
      <div class="ppc-icon">${p.imagem? `<img src="${p.imagem}">`:'<i class="fa-solid fa-box"></i>'}</div>
      <div class="ppc-nome">${p.nome}</div>
      <div class="ppc-preco">${formatMZN(p.precoVendaUnidade)}</div>
      <div class="ppc-stock">${s.totalUnidades} un. em estoque</div>
    </button>`;
  }).join('') || '<p style="color:var(--slate-400);font-size:13.5px;grid-column:1/-1;text-align:center;padding:20px 0;">Nenhum produto encontrado.</p>';
}

function addToCart(productId){
  const p = state.products.find(x=>x.id===productId);
  const s = stockInfo(p);
  const item = pdvCart.find(i=>i.productId===productId);
  const qtdAtual = item? item.qtd : 0;
  if(qtdAtual+1 > s.totalUnidades){
    alert(`Estoque insuficiente de ${p.nome}. Restam apenas ${s.totalUnidades} unidades.`);
    return;
  }
  if(item) item.qtd += 1;
  else pdvCart.push({productId, qtd:1});
  renderPdvCart();
}

function changeCartQty(productId, delta){
  const item = pdvCart.find(i=>i.productId===productId);
  if(!item) return;
  const p = state.products.find(x=>x.id===productId);
  const s = stockInfo(p);
  const novaQtd = item.qtd + delta;
  if(novaQtd<=0){ pdvCart = pdvCart.filter(i=>i.productId!==productId); }
  else if(novaQtd > s.totalUnidades){ alert(`Estoque insuficiente de ${p.nome}.`); return; }
  else item.qtd = novaQtd;
  renderPdvCart();
}

function renderPdvCart(){
  const container = document.getElementById('pdv-cart-items');
  if(!pdvCart.length){
    container.innerHTML = '<p style="color:var(--slate-400);font-size:13.5px;text-align:center;padding:20px 0;">O carrinho está vazio.</p>';
  } else {
    container.innerHTML = pdvCart.map(i=>{
      const p = state.products.find(x=>x.id===i.productId);
      return `
      <div class="pdv-cart-item">
        <div><b style="font-size:13.5px;">${p.nome}</b><div style="font-size:12px;color:var(--slate-400);">${formatMZN(p.precoVendaUnidade)} / un.</div></div>
        <div class="pdv-qty-ctrl">
          <button type="button" onclick="changeCartQty('${p.id}',-1)"><i class="fa-solid fa-minus"></i></button>
          <span class="mono" style="min-width:20px;text-align:center;">${i.qtd}</span>
          <button type="button" onclick="changeCartQty('${p.id}',1)"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>`;
    }).join('');
  }
  const total = pdvCart.reduce((s,i)=>{ const p = state.products.find(x=>x.id===i.productId); return s + p.precoVendaUnidade*i.qtd; },0);
  document.getElementById('pdv-total').textContent = formatMZN(total);

  const clienteSel = document.getElementById('pdv-cliente');
  clienteSel.innerHTML = '<option value="">Cliente não identificado</option>' + state.clients.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  if (clienteSel.dataset.selectedId) {
    clienteSel.value = clienteSel.dataset.selectedId;
  }
  // atualizar display do saldo do cliente e estado do checkbox
  const saldoEl = document.getElementById('pdv-cliente-saldo');
  const useCheckbox = document.getElementById('pdv-use-saldo');
  const useLabel = document.getElementById('pdv-use-saldo-label');
  const clienteId = clienteSel.value || null;
  const cliente = clienteId ? state.clients.find(c => c.id === clienteId) : null;
  const dinheiroBtn = document.querySelector('.pay-method[data-metodo="Dinheiro"]');
  const clienteTemCredito = !!(cliente && cliente.saldoDevedor < 0);

  if (cliente) {
    saldoEl.textContent = `Saldo: ${formatMZN(cliente.saldoDevedor)}`;
    useCheckbox.disabled = false;
    useCheckbox.checked = false;
    if (useLabel) {
      useLabel.innerHTML = clienteTemCredito
        ? '<input type="checkbox" id="pdv-use-saldo"> Usar saldo do cliente'
        : '<input type="checkbox" id="pdv-use-saldo"> Fazer dívida / pagar depois';
    }
  } else {
    saldoEl.textContent = 'Saldo: 0,00 MT';
    useCheckbox.checked = false;
    useCheckbox.disabled = true;
    if (useLabel) {
      useLabel.innerHTML = '<input type="checkbox" id="pdv-use-saldo"> Fazer dívida / pagar depois';
    }
  }

  // Só se o cliente tiver crédito real é que o saldo pode ser usado.
  if (useCheckbox.checked && clienteTemCredito) {
    pdvPayMethod = 'Saldo do Cliente';
    if (dinheiroBtn) {
      dinheiroBtn.innerHTML = '<i class="fa-solid fa-wallet"></i><br>Saldo do Cliente';
      dinheiroBtn.classList.add('selected');
      dinheiroBtn.style.opacity = '1';
      dinheiroBtn.style.pointerEvents = 'none';
    }
    document.querySelectorAll('.pay-method').forEach(m => {
      if (m !== dinheiroBtn) {
        m.classList.remove('selected');
        m.style.opacity = '0.45';
        m.style.pointerEvents = 'none';
      }
    });
  } else {
    if (dinheiroBtn) {
      dinheiroBtn.innerHTML = '<i class="fa-solid fa-money-bill-wave"></i><br>Dinheiro';
      dinheiroBtn.style.opacity = '1';
      dinheiroBtn.style.pointerEvents = '';
    }
    document.querySelectorAll('.pay-method').forEach(m => {
      m.style.opacity = '1';
      m.style.pointerEvents = '';
      if (m.dataset.metodo === pdvPayMethod) m.classList.add('selected');
      else m.classList.remove('selected');
    });
    if (!pdvPayMethod || pdvPayMethod === 'Saldo do Cliente') pdvPayMethod = 'Dinheiro';
  }

  useCheckbox.onchange = () => {
    if (!cliente) {
      useCheckbox.checked = false;
      pdvPayMethod = 'Dinheiro';
      renderPdvCart();
      return;
    }

    if (useCheckbox.checked && clienteTemCredito) {
      pdvPayMethod = 'Saldo do Cliente';
      renderPdvCart();
      return;
    }

    if (useCheckbox.checked && !clienteTemCredito) {
      const confirmar = window.confirm(`Cliente "${cliente.nome}" não tem saldo disponível.\n\nVai fazer dívida nesta venda?`);
      if (!confirmar) {
        useCheckbox.checked = false;
        pdvPayMethod = 'Dinheiro';
        renderPdvCart();
        return;
      }
      pdvPayMethod = 'Dinheiro';
      renderPdvCart();
      return;
    }

    pdvPayMethod = 'Dinheiro';
    renderPdvCart();
  };

  clienteSel.onchange = () => {
    clienteSel.dataset.selectedId = clienteSel.value;
    renderPdvCart();
  };
}

function selectPayMethod(el){
  const useSaldo = document.getElementById('pdv-use-saldo') && document.getElementById('pdv-use-saldo').checked;
  if (useSaldo && el.dataset.metodo !== 'Dinheiro') {
    pdvPayMethod = 'Saldo do Cliente';
    return;
  }
  if (useSaldo && el.dataset.metodo === 'Dinheiro') {
    return;
  }

  document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));
  el.classList.add('selected');
  pdvPayMethod = el.dataset.metodo;
  // esconder campo de telemóvel — pagamentos móveis removidos; pagamento eletrónico é manual
  const phoneField = document.getElementById('pdv-mobile-phone-field');
  if(phoneField) phoneField.style.display = 'none';
}

async function carregarPagamentosEstado(){
  try{ state.pagamentosEstado = await apiFetch('/pagamentos/estado'); }
  catch(err){ state.pagamentosEstado = null; }
}

async function finalizarVenda(){
  if(!pdvCart.length){ alert('Adicione pelo menos um produto ao carrinho.'); return; }
  const clienteId = document.getElementById('pdv-cliente').value || null;
  const cliente = clienteId ? state.clients.find(c => c.id === clienteId) : null;
  const total = pdvCart.reduce((s,i)=>{ const p = state.products.find(x=>x.id===i.productId); return s + p.precoVendaUnidade*i.qtd; },0);
  const useSaldoCheckbox = document.getElementById('pdv-use-saldo');
  const usarSaldoCliente = !!(cliente && useSaldoCheckbox && useSaldoCheckbox.checked && cliente.saldoDevedor < 0);
  const fazerDivida = !!(cliente && useSaldoCheckbox && useSaldoCheckbox.checked && cliente.saldoDevedor >= 0);

  // aplicar saldo do cliente se pedido (saldoDevedor negativo significa crédito)
  let appliedFromBalance = 0;
  if(usarSaldoCliente){
    const credit = -cliente.saldoDevedor;
    appliedFromBalance = Math.min(credit, total);
  }

  // Se o cliente não tiver saldo, a dívida só acontece quando o utilizador marca explicitamente a opção.
  if(cliente && !usarSaldoCliente && !fazerDivida && cliente.saldoDevedor >= 0){
    // venda normal em dinheiro ou eletrónico
  }

  // Validação de limite de crédito quando a dívida for usada
  if(cliente && fazerDivida){
    const limitePadrao = 5000; // MT — ajustar conforme política da empresa
    const limiteCliente = cliente.limiteCredito || limitePadrao;
    if(cliente.saldoDevedor + total > limiteCliente){
      alert(`⛔ Cliente "${cliente.nome}" atingiu o limite de crédito.\n\nSaldo actual: ${formatMZN(cliente.saldoDevedor)}\nLimite: ${formatMZN(limiteCliente)}\nEsta compra ultrapassaria: ${formatMZN(cliente.saldoDevedor + total)}\n\nCobra em dinheiro ou contacte o cliente.`);
      return;
    }
  }

  const btn = document.getElementById('pdv-finalizar-btn');
  const original = btn.innerHTML;

  // Nota: pagamentos eletrónicos são registados manualmente por enquanto (sem integração automática)

  const payload = {
    clienteId,
    formaPagamento: pdvPayMethod,
    itens: pdvCart.map(i => ({ produtoId: i.productId, quantidade: i.qtd })),
    appliedBalance: appliedFromBalance,
    fazerDivida
  };
  console.log('PDV: enviar payload de venda', payload);

  try{
    const resultado = await apiFetch('/vendas', { method:'POST', body: JSON.stringify(payload) });

    const itensParaRecibo = resultado.itens.map(it=>{
      const p = state.products.find(x=>x.id===it.produtoId);
      return { nome: p?p.nome:'Produto', qtd: it.quantidade, precoUnit: Number(it.precoUnitario), subtotal: Number(it.subtotal) };
    });
    const venda = {
      numero: resultado.numero, data: resultado.data, hora: (resultado.hora||'').slice(0,5),
      clienteNome: cliente? cliente.nome : 'Cliente não identificado',
      pagamento: resultado.forma_pagamento, itens: itensParaRecibo,
      total: Number(resultado.total), lucro: Number(resultado.lucro)
    };

    mostrarRecibo(venda);
    pdvCart = [];
    document.getElementById('pdv-mobile-phone').value = '';
    document.getElementById('pdv-mobile-phone-field').style.display = 'none';
    document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));
    document.querySelector('.pay-method[data-metodo="Dinheiro"]').classList.add('selected');
    pdvPayMethod = 'Dinheiro';
    await renderVendas();
    await renderProdutos();
    await renderEstoque();
    renderDashboard();
  }catch(err){
    alert(err.message);
  }finally{
    btn.disabled = false; btn.innerHTML = original;
  }
}

function mostrarRecibo(venda){
  const linhas = venda.itens.map(i=>`<div class="r-line"><span>${i.qtd}x ${i.nome}</span><span>${formatMZN(i.subtotal)}</span></div>`).join('');
  document.getElementById('recibo-conteudo').innerHTML = `
    <div style="text-align:center;margin-bottom:10px;"><b>${state.user.businessName}</b><br><span style="font-size:11px;">${state.user.address||''} ${state.user.city? '· '+state.user.city:''}</span></div>
    <hr>
    <div class="r-line"><span>Recibo</span><span>${venda.numero}</span></div>
    <div class="r-line"><span>Data</span><span>${formatDatePt(venda.data)} ${venda.hora}</span></div>
    <div class="r-line"><span>Cliente</span><span>${venda.clienteNome}</span></div>
    <hr>
    ${linhas}
    <hr>
    <div class="r-line" style="font-weight:700;"><span>TOTAL</span><span>${formatMZN(venda.total)}</span></div>
    <div class="r-line"><span>Pagamento</span><span>${venda.pagamento}</span></div>
    <hr>
    <div style="text-align:center;font-size:11px;color:var(--slate-400);">Obrigado pela preferência!</div>
  `;
  openModal('modal-recibo');
}

function verReciboVenda(id){
  const v = state.sales.find(x=>x.id===id);
  if(!v) return;
  const itensAdaptados = v.itens.map(it=>({ nome: it.produtoNome, qtd: Number(it.quantidade), precoUnit: Number(it.precoUnitario), subtotal: Number(it.subtotal) }));
  mostrarRecibo({ ...v, itens: itensAdaptados });
}

const vendasState = {
  filtroInicio: '',
  filtroFim: '',
  limite: 10
};

async function carregarVendas(opcoes = {}){
  const params = new URLSearchParams();
  const dataInicio = opcoes.dataInicio || vendasState.filtroInicio || '';
  const dataFim = opcoes.dataFim || vendasState.filtroFim || '';
  const limite = Number(opcoes.limite || vendasState.limite || 10);

  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  if (Number.isFinite(limite) && limite > 0) params.set('limit', String(Math.min(limite, 200)));

  const rows = await apiFetch('/vendas' + (params.toString() ? '?' + params.toString() : ''));
  state.sales = rows.map(r=>({
    id:r.id, numero:r.numero, data:r.data, clienteNome:r.cliente_nome||'Cliente não identificado',
    pagamento:r.forma_pagamento, total:Number(r.total), lucro:Number(r.lucro), itens:r.itens
  }));
}

function aplicarFiltroVendas(){
  const inicio = document.getElementById('vendas-data-inicio').value;
  const fim = document.getElementById('vendas-data-fim').value;
  if (inicio && fim && inicio > fim) {
    alert('A data inicial não pode ser superior à data final.');
    return;
  }

  vendasState.filtroInicio = inicio;
  vendasState.filtroFim = fim;
  vendasState.limite = 10;
  renderVendas();
}

function limparFiltroVendas(){
  document.getElementById('vendas-data-inicio').value = '';
  document.getElementById('vendas-data-fim').value = '';
  vendasState.filtroInicio = '';
  vendasState.filtroFim = '';
  vendasState.limite = 10;
  renderVendas();
}

function verMaisVendas(){
  vendasState.limite += 10;
  renderVendas();
}

function imprimirListaVendas(){
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('O exportador PDF não está disponível neste navegador.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const vendas = [...state.sales].sort((a,b)=> b.data.localeCompare(a.data));
  const total = vendas.reduce((s, v) => s + Number(v.total || 0), 0);

  doc.setFontSize(16);
  doc.text('ContaFácil MZ — Vendas', 14, 18);
  doc.setFontSize(10);
  doc.text(`Período: ${vendasState.filtroInicio || '—'} até ${vendasState.filtroFim || '—'} · Total arrecadado: ${formatMZN(total)}`, 14, 26);

  let y = 40;
  doc.setFontSize(10);
  doc.text('Recibo', 14, y);
  doc.text('Data', 52, y);
  doc.text('Cliente', 95, y);
  doc.text('Total', 165, y);
  y += 7;

  vendas.forEach((v, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const linha = `${v.numero}`;
    doc.setFontSize(9);
    doc.text(linha, 14, y);
    doc.text(formatDatePt(v.data), 52, y);
    doc.text(String(v.clienteNome || 'Cliente não identificado').slice(0, 24), 95, y);
    doc.text(formatMZN(v.total), 165, y, { align: 'right' });
    y += 6;

    if (index >= 29) return;
  });

  if (!vendas.length) {
    doc.setFontSize(11);
    doc.text('Sem vendas no período seleccionado.', 14, 50);
  }

  doc.save(`vendas_contafacil_${todayISO()}.pdf`);
}

async function renderVendas(){
  renderPdvProducts();
  renderPdvCart();

  document.getElementById('vendas-data-inicio').value = vendasState.filtroInicio || '';
  document.getElementById('vendas-data-fim').value = vendasState.filtroFim || '';

  try{ await carregarVendas({
    dataInicio: vendasState.filtroInicio,
    dataFim: vendasState.filtroFim,
    limite: vendasState.limite
  }); }catch(err){ alert(err.message); return; }

  const tbody = document.querySelector('#table-vendas tbody');
  const vendasOrdenadas = [...state.sales].sort((a,b)=> b.data.localeCompare(a.data));
  const totalArrecadado = vendasOrdenadas.reduce((s, v) => s + Number(v.total || 0), 0);
  document.getElementById('vendas-total-arrecadado').textContent = formatMZN(totalArrecadado);

  tbody.innerHTML = vendasOrdenadas.map(v=>`
    <tr>
      <td class="mono">${v.numero}</td>
      <td>${formatDatePt(v.data)}</td>
      <td>${v.clienteNome}</td>
      <td><span class="tag blue">${v.pagamento}</span></td>
      <td style="text-align:right;" class="mono">${formatMZN(v.total)}</td>
      <td style="text-align:right;" class="amount-pos">${formatMZN(v.lucro)}</td>
      <td class="row-actions"><button title="Ver recibo" onclick="verReciboVenda('${v.id}')"><i class="fa-solid fa-receipt"></i></button></td>
    </tr>`).join('');

  const vazia = !state.sales.length;
  document.getElementById('empty-vendas').style.display = vazia ? 'block' : 'none';
  document.getElementById('btn-ver-mais-vendas').disabled = vazia || vendasOrdenadas.length < vendasState.limite;
}

async function renderPagamentosMoveis(){
  await carregarPagamentosEstado();
  const badgesEl = document.getElementById('pagamentos-status-badges');
  const badge = (nome, configurado) => `
    <span class="tag ${configurado?'green':'blue'}" style="font-size:12.5px;padding:8px 14px;">
      <i class="fa-solid ${configurado?'fa-circle-check':'fa-flask'}"></i> ${nome}: ${configurado? 'Ligado (produção)' : 'Modo de simulação'}
    </span>`;
  badgesEl.innerHTML = badge('M-Pesa', state.pagamentosEstado && state.pagamentosEstado.mpesa.configurado) +
                        badge('e-Mola', state.pagamentosEstado && state.pagamentosEstado.emola.configurado);

  let rows;
  try{ rows = await apiFetch('/pagamentos'); }
  catch(err){ alert(err.message); return; }

  state.mobilePayments = rows;
  const tbody = document.querySelector('#table-pagamentos-moveis tbody');
  tbody.innerHTML = rows.map(p=>`
    <tr>
      <td>${formatDatePt(p.criado_em)}</td>
      <td><span class="tag blue">${p.provedor==='mpesa'?'M-Pesa':'e-Mola'}</span></td>
      <td>${p.telefone_cliente}</td>
      <td style="text-align:right;" class="mono">${formatMZN(p.valor)}</td>
      <td class="mono" style="font-size:12px;">${p.referencia_transacao||'—'}</td>
      <td><span class="tag ${p.estado==='concluido'?'green':(p.estado==='falhado'?'red':'blue')}">${p.estado==='concluido'?'Concluído':(p.estado==='falhado'?'Falhado':'Pendente')}</span></td>
      <td>${p.modo_simulacao? '<span style="color:var(--warn);font-size:12px;">Simulação</span>' : '<span style="color:var(--green-600);font-size:12px;">Real</span>'}</td>
    </tr>`).join('');
  document.getElementById('empty-pagamentos-moveis').style.display = rows.length? 'none':'block';
}

