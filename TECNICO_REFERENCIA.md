# 🔧 Guia Técnico — Mudanças Implementadas

## 1. Sistema de Notificações (`notificacoes-sistema.js`)

### Função Principal
```javascript
async function gerarNotificacoesSistema()
```

### Tipos de Notificações
- `estoque_baixo` — quando qtdEstoque < qtdMinima
- `estoque_critico` — quando qtdEstoque = 0
- `divida_vencida` — quando cliente.saldoDevedor > 0
- `caixa_aberto` — quando /caixa/atual retorna aberto
- `vendas_positivas` — motivação com total do dia

### Auto-Atualização
```javascript
setInterval(() => { 
  if(state.user) gerarNotificacoesSistema(); 
}, 120000); // 2 minutos
```

### Integração
- Chamado de `dashboard.js` (renderDashboard)
- Renderiza em `#notif-panel-body`
- Badge atualiza `#notif-count`

---

## 2. Validação de Crédito (`vendas.js`)

### Localização
Função `finalizarVenda()` — antes de processar pagamento

### Lógica
```javascript
if(cliente && cliente.saldoDevedor >= 0){
  const limitePadrao = 5000; // MT
  const limiteCliente = cliente.limiteCredito || limitePadrao;
  if(cliente.saldoDevedor + total > limiteCliente){
    // Bloqueia venda com alerta detalhado
    return;
  }
}
```

### Ajustáveis
- `limitePadrao` — mude de 5000 conforme política da empresa
- Apenas valida se cliente tem saldoDevedor >= 0 (não valida fiado negativo)

---

## 3. Fechamento Inteligente de Caixa (`caixa.js`)

### Função Modificada
`updateDiferencaCaixa()` — chama quando utilizador altera valor

### Lógica
```javascript
const diferenca = contado - state.caixaAtual.saldoEsperado;
const temDiferenca = Math.abs(diferenca) > 0.01; // tolerância
document.getElementById('explicacao-diferenca').style.display = 
  temDiferenca ? 'block' : 'none';
```

### Salvar Explicação
Função `handleFecharCaixa()` agora captura:
```javascript
const payload = { 
  saldoFinalContado: ...,
  explicacaoDiferenca: documento.getElementById('caixa-explicacao-diferenca').value || null
};
```

### Campo HTML
- ID: `caixa-explicacao-diferenca`
- Aparece apenas se temDiferenca = true
- Background amarelo (#FFF7E6) para atenção

---

## 4. Onboarding (`onboarding.js`)

### Funções Principais

#### `initOnboarding()`
- Chamado ao carregar dashboard
- Carrega status do localStorage
- Renderiza banner

#### `carregarOnboardingStatus()`
- Recupera progresso do utilizador de localStorage
- Chave: `contafacil_onboarding_[userId]`

#### `marcarOnboardingCompleto(stepId)`
- Marca tarefa como completa
- Atualiza localStorage
- Re-renderiza banner

#### `verificarOnboardingCompletion(view)`
- Detecta automaticamente quando tarefas foram feitas
- Chamado de `navegacao.js` após cada mudança de view
- Views: 'produtos', 'clientes', 'vendas', 'caixa'

#### `renderOnboardingProgress()`
- Atualiza banner visual
- Mostra %, barra animada, checklist de ícones
- Usa emojis: 🚀 0%, ⚡ 25%, 🎯 75%

### LocalStorage
```javascript
localStorage.getItem('contafacil_onboarding_' + state.user.id)
// Retorna: { "adicionar-produto": true, "registar-cliente": false, ... }
```

### Steps Array
```javascript
const ONBOARDING_STEPS = [
  { id: 'adicionar-produto', icone: 'fa-box', titulo: '...', descricao: '...', funcao: () => ... },
  { id: 'registar-cliente', icone: 'fa-user-plus', ... },
  { id: 'fazer-venda', icone: 'fa-cash-register', ... },
  { id: 'abrir-caixa', icone: 'fa-vault', ... }
];
```

---

## 5. Menu Reorganizado (`index.html`)

### Estrutura HTML
```html
<div class="sidebar-section-label">Essencial</div>
<!-- nav items aqui -->

<div class="sidebar-section-label">Negócio</div>
<!-- nav items aqui -->

<!-- ... etc -->
```

### CSS
```css
.sidebar-section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #7A8A9A;
  padding: 18px 14px 8px 14px;
  border-top: 1px solid rgba(255,255,255,.06);
  margin-top: 4px;
}
```

### Data Attribute
```html
<a class="nav-item" data-view="produtos" data-modulo="estoque">
```
Permite filtros futuros por `modulosAtivos`

---

## 6. Colors Humanizadas (`index.html` :root)

### Antes → Depois
```css
/* Antes */
--green-600: #10B981;     /* Muito saturado */
--danger: #D64545;        /* Neon-ish */

/* Depois */
--green-600: #059669;     /* Mais natural */
--danger: #dc2626;        /* Mais profissional */

/* Novos */
--warn: #D97706;          /* Aviso mais suave */
--shadow: rgba(0,0,0,0.06); /* Mais luz */
```

---

## 📋 Checklist de Integração

- [x] `onboarding.js` criado (111 linhas)
- [x] `notificacoes-sistema.js` criado (202 linhas)
- [x] `index.html` — menu reorganizado (+ 50 linhas)
- [x] `index.html` — CSS atualizado (+30 linhas)
- [x] `index.html` — banner adicionado (+2 linhas)
- [x] `index.html` — modal caixa atualizado (+20 linhas)
- [x] `index.html` — scripts carregados (+2 linhas)
- [x] `caixa.js` — updateDiferencaCaixa() melhorada
- [x] `caixa.js` — handleFecharCaixa() captura explicação
- [x] `dashboard.js` — chama initOnboarding()
- [x] `navegacao.js` — chama verificarOnboardingCompletion()
- [x] `vendas.js` — validação de crédito adicionada

---

## 🐛 Debugging

### Console Errors
Se ver erros relacionados a:

**`gerarNotificacoesSistema is not defined`**
- Verificar se `notificacoes-sistema.js` é carregado APÓS `navegacao.js`

**`initOnboarding is not defined`**
- Verificar se `onboarding.js` está no HTML antes de `dashboard.js`

**Crédito validação não funciona**
- Verificar se `cliente.saldoDevedor` existe (pode ser 0 ou null)
- Verificar se `cliente.limiteCredito` é number

**Banner onboarding não aparece**
- Verificar `#onboarding-banner` existe no HTML
- Verificar localStorage.getItem retorna objeto válido
- Abrir DevTools → Application → LocalStorage → procurar `contafacil_onboarding_`

---

## 🚀 Deployment Checklist

- [ ] Testar em produção com 3+ utilizadores novos
- [ ] Verificar localStorage não impede login (Safari Private mode)
- [ ] Verificar notificações com 2+ tipos de alertas simultâneos
- [ ] Testar crédito bloqueio com cliente real
- [ ] Testar caixa com diferença de +100 MT, -50 MT, +0.50 MT
- [ ] Verificar responsive em mobile (768px viewport)
- [ ] Verificar scroll do banner em viewports pequenos
- [ ] Testar com conexão lenta (DevTools Network Throttling)

---

## 📊 Performance

### Notificações
- Chamadas API: 3-5 por ciclo (produtos, clientes, caixa, vendas)
- Frequência: 2 min (customizável)
- Cache: usa state.products, state.clients (ja carregados)

### Onboarding
- LocalStorage read: ~1ms
- LocalStorage write: ~1ms
- Render banner: ~50ms (DOM updates)

### Crédito Validation
- Cálculo: O(1) — uma comparação
- Impacto: negligenciável

---

## 🔐 Segurança

### Notificações
- Lê apenas dados já em `state` (já autenticado)
- Não envia dados sensíveis externamente
- Backend deve validar permissões de acesso

### Crédito Validation
- Validação client-side = UX only
- **CRÍTICO**: Backend DEVE revalidar no POST /vendas
- Nunca confiar apenas em cliente.limiteCredito

### Fechamento Caixa
- Explicação é texto puro (sem validação SQL injection)
- Backend deve sanitizar antes de salvar

### Onboarding
- Armazenado em localStorage (não sincronizado)
- Sem dados sensíveis armazenados
- Chave: user ID (não expõe dados)

---

**Última atualização:** Sessão atual
**Compatibilidade:** Chrome, Firefox, Safari, Edge (ES6+)
**Requer:** state object, apiFetch() function (ambos em config.js)
