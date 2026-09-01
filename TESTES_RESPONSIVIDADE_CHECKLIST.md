# Checklist de Testes de Responsividade — ContaFácil MZ

Use este documento para testar cada página em todos os breakpoints.

## 🔧 Como Testar

### Chrome DevTools
1. Abra o Chrome/Edge
2. Pressione `F12` para abrir DevTools
3. Pressione `Ctrl+Shift+M` (ou `Cmd+Shift+M` no Mac) para "Toggle Device Toolbar"
4. Selecione diferentes dispositivos na dropdown

### Breakpoints a Testar
- **320px** — iPhone SE (Landscape seria 568px)
- **360px** — Galaxy Fold (Landscape 653px)
- **375px** — iPhone 6/7/8/SE 2ª Gen
- **390px** — iPhone 12/13 mini
- **414px** — iPhone 11/12/13
- **430px** — iPhone 14/15, Pixel 6
- **768px** — iPad (Tablet)
- **1024px** — iPad Pro
- **1366px** — Laptop/Desktop
- **1920px** — Full HD Desktop

---

## 📱 LANDING PAGE

### 320px
- [ ] Imagem hero visible mas redimensionada
- [ ] Hero text legível (não cortado)
- [ ] Botões ocupam 90% da largura
- [ ] Logo visible no nav
- [ ] Sem scroll horizontal
- [ ] Features em coluna única
- [ ] Stats em 2x2 grid
- [ ] "Instalar" não visível (sem botão)

### 375px-430px
- [ ] Melhor espaçamento
- [ ] Hero image clara
- [ ] Features mais legíveis
- [ ] Cards sem scroll
- [ ] CTA buttons bem espaçados

### 768px+
- [ ] Layout desktop normal
- [ ] Features 2-3 colunas
- [ ] Hero em 2 colunas
- [ ] Stats em 4 colunas

### Geral
- [ ] Sem scroll horizontal em nenhum breakpoint
- [ ] Fonte minima 14px
- [ ] Botões minimo 44px de altura
- [ ] Spacing consistente

---

## 🔑 LOGIN / REGISTER

### 320px-480px
- [ ] Auth side (ilustração) ESCONDIDA
- [ ] Form ocupa 100% com padding
- [ ] Campos de input com padding generoso (14px+)
- [ ] Font size 16px (previne zoom iOS)
- [ ] Botão "Entrar" ocupa 100% da largura
- [ ] Links "Voltar" e "Criar conta" legíveis
- [ ] Sem scroll horizontal

### 768px+
- [ ] Auth side visível à esquerda
- [ ] Form em coluna direita (500px)
- [ ] Layout lado a lado

---

## 📊 DASHBOARD

### Cards Principais (Saldo, Receitas, Despesas, Lucro)
- [ ] **320px**: 1 coluna (1x4 stack)
- [ ] **640px**: 2 colunas (2x2)
- [ ] **1024px+**: 4 colunas (1x4 horizontal)
- [ ] Valores visíveis e não cortados
- [ ] Icons distintos e não sobrepostos

### KPI Cards
- [ ] **320px**: 1 coluna com scroll
- [ ] **768px**: 2 colunas
- [ ] **1366px+**: 3-4 colunas
- [ ] "Produtos em falta" clicável
- [ ] Números grandes mas legíveis

### Gráficos
- [ ] **320px-480px**: 1 gráfico por linha, altura reduzida (~180px)
- [ ] **768px+**: 2 gráficos lado a lado
- [ ] Nenhum gráfico esticado horizontalmente
- [ ] Legend visible mesmo em mobile

### Tabela de Últimos Lançamentos
- [ ] **320px**: Scroll horizontal visível, colunas principais visíveis
- [ ] Sem quebra de texto nas colunas
- [ ] Espaçamento confortável
- [ ] Não cortaduras de valores

---

## 📦 PRODUTOS

### Search Bar
- [ ] **320px**: Ocupa 100% com ícone de search
- [ ] Placeholder visível
- [ ] Input com 16px font (iOS)
- [ ] Botão "Novo Produto" em nova linha ou ao lado

### Tabela de Produtos
- [ ] **320px**: 
  - Colunas principais visíveis (Produto, Categoria, Preço)
  - Scroll horizontal para mais colunas
  - Actions (editar/eliminar) acessíveis
- [ ] **768px**: 2-3 colunas mais visíveis
- [ ] **1366px+**: Todas as colunas sem scroll

### Responsivo
- [ ] Nenhum valor cortado
- [ ] Categorias em label pequeno mas legível
- [ ] Marca visível ou em hover
- [ ] Stock status em cor

---

## 📦 ESTOQUE

### Alertas de Falta
- [ ] **Todos os sizes**: Banner vermelho topo do conteúdo
- [ ] Produtos listados claramente
- [ ] Não esconde conteúdo
- [ ] Ícone de aviso visível

### Tabelas
- [ ] Níveis de estoque legíveis
- [ ] Quantidade mínima clara
- [ ] Situação (OK/FALTA) em cor
- [ ] Scroll horizontal se necessário

---

## 💳 VENDAS (PDV)

### Layout
- [ ] **320px-480px**: 
  - Produtos em coluna única (acima)
  - Carrinho em coluna única (abaixo)
  - Sem lado a lado
- [ ] **768px+**: 2 colunas (Produtos | Carrinho)
- [ ] **1024px+**: Grid responsivo

### Produtos
- [ ] **320px**: 2 colunas de produtos
- [ ] **480px**: 3 colunas
- [ ] **768px+**: 4-5 colunas
- [ ] Cards com ícone, nome, preço, stock
- [ ] Touch target mínimo 44px

### Carrinho
- [ ] Itens com quantidade ajustável
- [ ] Botões +/- são acessíveis (44px)
- [ ] Total claramente visível
- [ ] Cliente opcional (dropdown funciona)
- [ ] Pagamento selecionável (Dinheiro/Eletrônico)
- [ ] Botão "Finalizar Venda" em destaque

### Últimas Vendas
- [ ] **320px**: Recibo, Data, Cliente visíveis
- [ ] Scroll horizontal para mais info
- [ ] Total em destaque
- [ ] Ações (imprimir, editar) acessíveis

---

## 📋 CONTAS A PAGAR / RECEBER

### Tabelas
- [ ] Fornecedor/Cliente legível
- [ ] Valor em destaque (dir

eita)
- [ ] Data de vencimento visible ou em hover
- [ ] Status em cor (em dia/vencido)
- [ ] Scroll horizontal se necessário

### Desktop
- [ ] Todas as colunas sem scroll
- [ ] Sem stretch

---

## 📊 RELATÓRIOS

### Gráficos
- [ ] **320px**: Altura ~200px, redimensionável
- [ ] **768px**: Altura ~250px
- [ ] **1366px+**: Altura ~350px
- [ ] Legenda não sobrepõe dados
- [ ] Percentuais visíveis

### Tabelas
- [ ] **320px**: Scroll horizontal
- [ ] Resumo do período claro
- [ ] Totalizadores em destaque

### Exports
- [ ] Botões Excel/PDF visíveis
- [ ] Funcionam em mobile
- [ ] Downloads diretos (sem popup)

---

## ⚙️ CONFIGURAÇÕES

### Formulários
- [ ] Campos com 16px font em iOS
- [ ] Labels acima dos inputs
- [ ] Inputs com padding generoso
- [ ] Erro messages em vermelho, visíveis
- [ ] Switches grande o suficiente (44px altura)

### Tabelas de Configurações
- [ ] Rótulo + Ação em linha (se desktop)
- [ ] Rótulo acima, Ação abaixo (se mobile)
- [ ] Sem overflow

---

## 🔐 SEGURANÇA

### Dados Sensíveis
- [ ] Nenhum corte de números (MZN)
- [ ] Nenhuma truncação sem aviso
- [ ] Valores sempre completos

---

## ⌚ MODALS

### Todos os Modals
- [ ] **320px**: 
  - Ocupa 90% da largura com padding 10px cada lado
  - Max-width respeitada
  - Scrollable se conteúdo grande
  - Botões em coluna (stacked)
- [ ] **768px+**: Centrado, max-width 460px
- [ ] Header com titulo e X de fechar
- [ ] Body com conteúdo
- [ ] Footer com botões (Cancelar | Ação)

### Específicos
- [ ] Modal nova venda: formulário legível
- [ ] Modal nova despesa: campos largos
- [ ] Modal abrir caixa: spinners funcionam
- [ ] Modal fechar caixa: resumo legível

---

## 📲 DRAWER MENU (Mobile < 768px)

### Funcionamento
- [ ] [ ] Hamburger menu visível à esquerda da title
- [ ] [ ] Clique abre drawer da esquerda
- [ ] [ ] Overlay semi-transparente
- [ ] [ ] Click no overlay fecha drawer
- [ ] [ ] Escape key fecha drawer
- [ ] [ ] Nav items sem scroll (scrollable drawer se necessário)
- [ ] [ ] Click num item fecha drawer e muda view
- [ ] [ ] Transição suave (não jerky)

### Styling
- [ ] Drawer 260px de largura
- [ ] Text claro e contrastado
- [ ] Icons visíveis
- [ ] Seções (Essencial, Negócio, Financeiro, Conta) distintas
- [ ] User avatar + nome at bottom

---

## 📍 BOTTOM NAVIGATION (Mobile < 768px)

### Visibilidade
- [ ] Visível em topo de mobile (screen width < 768px)
- [ ] 4 tabs principais: Dashboard, Vendas, Caixa, Menu
- [ ] Altura 60px (confortável)
- [ ] Acima do keyboard quando input focado
- [ ] Respecting safe-area-inset-bottom (notch/home indicator)

### Interação
- [ ] Click muda view
- [ ] Indicador visual (cor/sublinha) do tab ativo
- [ ] Sem delay visível
- [ ] Scroll horizontal se muitos tabs
- [ ] Icons + labels legíveis

### Desktop (> 768px)
- [ ] Completely hidden (display: none)
- [ ] Sidebar visível

---

## 📐 ORIENTATION & DEVICE-SPECIFIC

### Portrait
- [ ] Cards em coluna única ou 2-wide
- [ ] Tabelas com scroll
- [ ] Layout vertical otimizado

### Landscape
- [ ] Mais colunas (se possível)
- [ ] Height <500px: cards mais compactos
- [ ] Reducir padding vertical

### iPhone Specific
- [ ] Notch handling (safe-area)
- [ ] Home indicator respected
- [ ] Font 16px em inputs (previne zoom)
- [ ] -webkit-appearance: none em inputs

### Android Specific
- [ ] Sistema de cores respeitado
- [ ] Status bar inteligente
- [ ] Hardware back button não quebra (navigation em hash)

---

## 🌐 PWA SPECIFIC

### Instalação
- [ ] Chrome mobile: ícone instalação aparece
- [ ] Android: "Adicionar à tela inicial" funciona
- [ ] Windows: ícone instalação funciona
- [ ] Manifest carregado corretamente

### Offline
- [ ] Offline mode: página de connexão perdida
- [ ] Status bar/indicator visível
- [ ] "Conexão restaurada" ao reconectar
- [ ] Assets em cache aparecem

### Standalone
- [ ] Sem barra de endereço
- [ ] Sem back/forward buttons
- [ ] Ícone correto
- [ ] Nome correto
- [ ] Tema cor respeitado

---

## 🎨 VISUAL CONSISTENCY

### Cores
- [ ] [ ] Primária (Verde #10B981) consistente
- [ ] Secundária (Azul) visível
- [ ] Vermelho (Danger) claro
- [ ] Dark mode (se implementado)

### Typography
- [ ] H1: legível mas não excessivo
- [ ] Tabelas: 13px ok
- [ ] Labels: 12px ok
- [ ] Min 44px clickable em mobile

### Spacing
- [ ] Padding consistente
- [ ] Gaps entre cards: 10-18px
- [ ] Não muito apertado
- [ ] Não muito espaçoso

### Shadows
- [ ] Subtle em mobile
- [ ] Não muito pesado
- [ ] Dark mode: shadows mais escuros

---

## 🚀 PERFORMANCE

- [ ] Sem jank ao scroll
- [ ] Transitions suaves (não congelam)
- [ ] Cliques responsivos
- [ ] Sem flashing de conteúdo
- [ ] Imagens otimizadas

---

## 📝 FINAL CHECKLIST

### Antes de Deploy

- [ ] Todos os breakpoints testados
- [ ] Sem scroll horizontal em nenhuma situação
- [ ] Nenhum elemento cortado
- [ ] Valores monetários sempre completos
- [ ] Tabelas scroll horizontal (não truncam)
- [ ] Formulários com font 16px
- [ ] Botões 44x44px mínimo
- [ ] Dark mode testado (se aplicável)
- [ ] Offline testado
- [ ] Instalação (PWA) testada
- [ ] Orientação portrait/landscape OK
- [ ] Touch targets acessíveis
- [ ] Contrast ratio 4.5:1 mínimo
- [ ] Lighthouse score 90+

---

## 🐛 COMMON ISSUES & FIXES

### Scroll Horizontal Indesejado
```css
html, body {
  width: 100%;
  overflow-x: hidden;
}
```

### Elementos Que Não Redimensionam
```css
img, canvas, iframe {
  max-width: 100%;
  height: auto;
}
```

### Inputs com Zoom em iOS
```css
input, select, textarea {
  font-size: 16px; /* Previne zoom automático */
}
```

### Drawer/Modal Clipping
```css
.drawer, .modal {
  max-width: 100vw;
  max-height: 100vh;
  overflow: auto;
}
```

---

## 📊 Test Results Template

```
Data: ___________
Tester: ________

Dispositivo: _________ (320px / 375px / 768px / 1366px)
Navegador: _________ (Chrome / Safari / Firefox / Edge)
Orientação: _________ (Portrait / Landscape)

Landing Page: ✓ / ✗ / ⚠️
Login: ✓ / ✗ / ⚠️
Dashboard: ✓ / ✗ / ⚠️
Produtos: ✓ / ✗ / ⚠️
Vendas: ✓ / ✗ / ⚠️
Caixa: ✓ / ✗ / ⚠️
Relatórios: ✓ / ✗ / ⚠️
Configurações: ✓ / ✗ / ⚠️

PWA Install: ✓ / ✗ / ⚠️
Offline Mode: ✓ / ✗ / ⚠️
Service Worker: ✓ / ✗ / ⚠️

Issues Found:
1. ___________
2. ___________
3. ___________

Notes:
___________
```

---

**Última Atualização:** 2026-01-09
**Versão:** 1.0
