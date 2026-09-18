/* Personalização visual; não altera módulos, permissões ou dados do negócio. */
const TIPOS_NEGOCIO = ['Empresa', 'Mercearia', 'Lojas', 'Quiosque/Banca/Barraca', 'Supermercado', 'Restaurante', 'Café/Pastelaria/Lanchonete', 'Construção/Empreiteiro', 'Agricultor/Machambas', 'Criação de Animais', 'Hotel/Hospedagem', 'Clínica/Consultório Privado', 'Farmácia'];
const TIPOS_ANTIGOS = {
  Loja: 'Lojas', Boutique: 'Lojas', 'Loja de roupa': 'Lojas', Ferragem: 'Lojas', 'Loja de eletrónicos': 'Lojas', Papelaria: 'Lojas',
  Barraca: 'Quiosque/Banca/Barraca', Quiosque: 'Quiosque/Banca/Barraca', 'Banca de mercado': 'Quiosque/Banca/Barraca',
  Cafetaria: 'Café/Pastelaria/Lanchonete', Padaria: 'Café/Pastelaria/Lanchonete', 'Take Away': 'Restaurante'
};
const PERFIS_NEGOCIO = {
  'Farmácia': ['receitas', 'saldo', 'despesas', 'lucro', 'vendas', 'produtos', 'estoque', 'compras', 'despesas'],
  Empresa: ['saldo', 'receitas', 'despesas', 'lucro', 'receitas', 'despesas', 'clientes', 'contaspagar', 'relatorios'],
  Mercearia: ['receitas', 'saldo', 'despesas', 'lucro', 'vendas', 'produtos', 'estoque', 'compras', 'despesas'],
  Lojas: ['receitas', 'lucro', 'saldo', 'despesas', 'vendas', 'produtos', 'estoque', 'clientes', 'despesas'],
  'Quiosque/Banca/Barraca': ['receitas', 'saldo', 'despesas', 'lucro', 'vendas', 'estoque', 'produtos', 'despesas', 'caixa'],
  Supermercado: ['receitas', 'saldo', 'despesas', 'lucro', 'vendas', 'produtos', 'estoque', 'compras', 'despesas'],
  Restaurante: ['receitas', 'despesas', 'lucro', 'saldo', 'vendas', 'compras', 'despesas', 'estoque', 'caixa'],
  'Café/Pastelaria/Lanchonete': ['receitas', 'saldo', 'lucro', 'despesas', 'vendas', 'caixa', 'compras', 'estoque', 'despesas'],
  'Construção/Empreiteiro': ['saldo', 'despesas', 'receitas', 'lucro', 'despesas', 'compras', 'receitas', 'clientes', 'contaspagar'],
  'Agricultor/Machambas': ['despesas', 'receitas', 'saldo', 'lucro', 'despesas', 'estoque', 'compras', 'vendas', 'receitas'],
  'Criação de Animais': ['despesas', 'saldo', 'receitas', 'lucro', 'despesas', 'compras', 'estoque', 'vendas', 'clientes'],
  'Hotel/Hospedagem': ['receitas', 'saldo', 'despesas', 'lucro', 'receitas', 'clientes', 'despesas', 'caixa', 'relatorios'],
  'Clínica/Consultório Privado': ['receitas', 'despesas', 'saldo', 'lucro', 'receitas', 'clientes', 'despesas', 'contaspagar', 'relatorios']
};
const ATALHOS_NEGOCIO = {
  vendas: ['Registar venda', 'fa-cash-register'], produtos: ['Adicionar produto', 'fa-box'], estoque: ['Adicionar stock', 'fa-boxes-stacked'],
  compras: ['Registar compra', 'fa-cart-shopping'], despesas: ['Registar despesa', 'fa-arrow-trend-down'], receitas: ['Registar entrada', 'fa-arrow-trend-up'],
  clientes: ['Gerir clientes', 'fa-users'], contaspagar: ['Ver pagamentos pendentes', 'fa-file-invoice'], relatorios: ['Ver relatórios', 'fa-chart-line'], caixa: ['Gerir caixa', 'fa-vault']
};
function tipoNegocioActual() {
  const tipo = String(state.user?.businessType || '').trim();
  const chave = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim();
  const conhecido = [...TIPOS_NEGOCIO, ...Object.keys(TIPOS_ANTIGOS)].find(nome => chave(nome) === chave(tipo));
  return TIPOS_ANTIGOS[conhecido] || conhecido || tipo || 'Empresa';
}
function preencherTiposNegocio(select, actual) {
  select.replaceChildren(new Option('Seleccione o tipo de negócio', ''));
  TIPOS_NEGOCIO.forEach(tipo => select.add(new Option(tipo, tipo)));
  // Preserva tipos guardados em versões anteriores, sem os converter na base.
  if (actual && !TIPOS_NEGOCIO.includes(actual)) select.add(new Option(actual, actual));
  select.value = actual || '';
}
function renderPersonalizacaoDashboard() {
  personalizarCamposNegocio();
  const perfil = PERFIS_NEGOCIO[tipoNegocioActual()] || PERFIS_NEGOCIO.Empresa;
  const grid = document.getElementById('dashboard-principal');
  perfil.slice(0, 4).forEach(id => grid.appendChild(document.getElementById('card-' + id).closest('.stat-card')));
  const host = document.getElementById('dashboard-atalhos');
  host.replaceChildren();
  perfil.slice(4).filter(view=>podeAcessarView(view)).forEach(view => {
    const [label, icon] = ATALHOS_NEGOCIO[view];
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn-outline';
    button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i> ${label}`;
    button.onclick = () => executarAtalhoNegocio(view);
    host.appendChild(button);
  });
  const note = document.getElementById('dashboard-tipo');
  note.textContent = state.user?.businessType ? tipoNegocioActual() : 'Escolha o tipo de negócio no Perfil para personalizar esta página.';
}
// Exemplos de preenchimento, nunca valores guardados nem sugestões de catálogo.
// Ordem: produto, categoria, fornecimentos, entrada, despesa, cargo.
const EXEMPLOS_NEGOCIO = {
  Empresa: ['Artigo de escritório', 'Material de escritório', 'Material de escritório', 'Recebimento de factura', 'Material de escritório', 'Assistente administrativo'],
  Mercearia: ['Arroz', 'Cereais', 'Arroz, óleo alimentar', 'Venda ao balcão', 'Compra de mercadoria', 'Vendedor(a)'],
  Supermercado: ['Arroz', 'Cereais', 'Alimentos, produtos de higiene', 'Vendas do dia', 'Reposição de mercadoria', 'Operador(a) de caixa'],
  Lojas: ['Artigo da loja', 'Categoria do artigo', 'Artigos comercializados', 'Venda de artigos', 'Compra de mercadoria', 'Vendedor(a)'],
  'Quiosque/Banca/Barraca': ['Água engarrafada', 'Bebidas', 'Bebidas, artigos de consumo diário', 'Venda ao balcão', 'Reposição de mercadoria', 'Atendente'],
  Restaurante: ['Refeição do dia', 'Refeições', 'Ingredientes, bebidas', 'Venda de refeições', 'Compra de ingredientes', 'Cozinheiro(a)'],
  'Café/Pastelaria/Lanchonete': ['Café', 'Bebidas quentes', 'Café, ingredientes de pastelaria', 'Venda ao balcão', 'Compra de ingredientes', 'Atendente'],
  'Construção/Empreiteiro': ['Cimento', 'Materiais de construção', 'Cimento, ferramentas', 'Pagamento de obra', 'Compra de materiais de construção', 'Pedreiro(a)'],
  'Agricultor/Machambas': ['Tomate', 'Hortícolas', 'Sementes, ferramentas agrícolas', 'Venda da colheita', 'Compra de sementes', 'Trabalhador(a) agrícola'],
  'Criação de Animais': ['Ovos', 'Produção animal', 'Ração, equipamentos de criação', 'Venda da produção', 'Compra de ração', 'Tratador(a) de animais'],
  'Hotel/Hospedagem': ['Kit de higiene', 'Artigos de higiene', 'Roupa de cama, produtos de limpeza', 'Pagamento de estadia', 'Lavandaria', 'Recepcionista'],
  'Clínica/Consultório Privado': ['Luvas descartáveis', 'Material clínico', 'Material clínico, consumíveis', 'Pagamento de consulta', 'Compra de material clínico', 'Recepcionista'],
  'Farmácia': ['Gaze esterilizada', 'Material de primeiros socorros', 'Material de primeiros socorros, artigos de higiene', 'Venda na farmácia', 'Compra de produtos farmacêuticos', 'Farmacêutico(a)']
};
function personalizarCamposNegocio() {
  const exemplos = [...(EXEMPLOS_NEGOCIO[tipoNegocioActual()] || EXEMPLOS_NEGOCIO.Empresa)];
  if(document.getElementById('produto-tipo')?.value==='servico'){
    const servicos={'Hotel/Hospedagem':['Estadia','Hospedagem'],'Clínica/Consultório Privado':['Consulta','Consultas'],'Construção/Empreiteiro':['Mão de obra','Trabalhos de construção']};
    [exemplos[0],exemplos[1]]=servicos[tipoNegocioActual()] || ['Serviço prestado','Serviços'];
  }
  const ids = ['produto-nome', 'produto-categoria', 'fornecedor-produtos', 'receita-descricao', 'despesa-descricao', 'funcionario-cargo'];
  ids.forEach((id, index) => {
    const input = document.getElementById(id);
    if (input) input.placeholder = 'Ex: ' + exemplos[index];
  });
  const marca = document.getElementById('produto-marca');
  if (marca) marca.placeholder = 'Marca ou fabricante';
  const iva = document.getElementById('iva-descricao');
  if (iva) iva.placeholder = 'Ex: ' + exemplos[3];
}
async function executarAtalhoNegocio(view) {
  if (!podeAcessarView(view)) { mostrarMensagemPlanoBloqueado(view); return; }
  try {
    // Os mesmos formulários e validações usados nos módulos originais.
    if (view === 'produtos') { await carregarFornecedores(); openProdutoModal(); }
    else if (view === 'estoque') { await carregarProdutos(); openMovimentoModal(); document.getElementById('movimento-tipo').value = 'entrada'; }
    else if (view === 'compras') { await Promise.all([carregarProdutos(), carregarFornecedores()]); openCompraModal(); }
    else if (view === 'receitas') await openReceitaModal();
    else if (view === 'despesas') await openDespesaModal();
    else showView(view);
  } catch (err) { alert(err.message); }
}
const PRODUTOS_COMUNS = {
  Mercearia: ['Arroz', 'Açúcar', 'Farinha', 'Óleo alimentar', 'Sal', 'Massas', 'Feijão', 'Leite', 'Água', 'Refrigerantes', 'Bolachas', 'Sabão'],
  Supermercado: ['Arroz', 'Açúcar', 'Farinha', 'Óleo alimentar', 'Massas', 'Feijão', 'Leite', 'Água', 'Refrigerantes', 'Bolachas', 'Produtos de higiene', 'Sabão', 'Detergentes']
};
function renderSugestoesProdutos() {
  const host = document.getElementById('produtos-sugestoes');
  host.replaceChildren();
  const tipo = tipoNegocioActual();
  const nomes = PRODUTOS_COMUNS[tipo];
  host.hidden = !nomes;
  if (!nomes) return;
  const titulo = document.createElement('h3');
  titulo.textContent = tipo === 'Mercearia' ? 'Produtos comuns para a sua mercearia' : 'Produtos comuns para o seu supermercado';
  const texto = document.createElement('p');
  texto.textContent = 'Escolha apenas o que vende. Adicionar abre o formulário para definir preços e quantidades; o produto só será criado ao guardar.';
  const lista = document.createElement('div'); lista.className = 'negocio-acoes';
  nomes.forEach(nome => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn-outline';
    button.textContent = nome + ' · Adicionar';
    button.onclick = async () => {
      if (tipoNegocioActual() !== tipo) return;
      try {
        await carregarFornecedores();
        if (tipoNegocioActual() !== tipo) return;
        openProdutoModal();
        document.getElementById('produto-nome').value = nome;
        document.getElementById('produto-nome').focus();
      } catch (err) { alert(err.message); }
    };
    lista.appendChild(button);
  });
  host.append(titulo, texto, lista);
}
function renderAlertasNegocio(alertas) {
  const host = document.getElementById('dashboard-alertas');
  host.replaceChildren();
  const comercio=['Mercearia','Supermercado','Lojas','Quiosque/Banca/Barraca','Farmácia','Restaurante','Café/Pastelaria/Lanchonete'].includes(tipoNegocioActual());
  const ordem=comercio?['estoque','clientes','contaspagar']:['contaspagar','clientes','estoque'];
  alertas.filter(a => a.valor > 0 && podeAcessarView(a.view)).sort((a,b)=>ordem.indexOf(a.view)-ordem.indexOf(b.view)).forEach(a => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn-outline'; button.textContent = a.texto;
    button.onclick = () => showView(a.view); host.appendChild(button);
  });
  host.hidden = !host.children.length;
}
