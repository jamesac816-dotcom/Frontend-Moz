/* Primeiros passos por actividade, sem alterar módulos existentes. */
const ONBOARDING_STEPS = [
  {id:'adicionar-produto',titulo:'Adicionar primeiro artigo',view:'produtos'},
  {id:'registar-cliente',titulo:'Registar um cliente',view:'clientes'},
  {id:'fazer-venda',titulo:'Registar a primeira venda',view:'vendas'},
  {id:'abrir-caixa',titulo:'Abrir o caixa',view:'caixa'},
  {id:'registar-entrada',titulo:'Registar uma entrada',view:'receitas'},
  {id:'registar-despesa',titulo:'Registar uma despesa',view:'despesas'}
];
let onboardingCompleted = {};
function passosOnboarding(){
  const tipo=tipoNegocioActual();
  const servicos=['Empresa','Hotel/Hospedagem','Clínica/Consultório Privado','Construção/Empreiteiro'].includes(tipo);
  const producao=['Agricultor/Machambas','Criação de Animais'].includes(tipo);
  const ids=servicos?['registar-cliente','registar-entrada','registar-despesa','abrir-caixa']:producao?['registar-despesa','adicionar-produto','registar-cliente','fazer-venda']:['adicionar-produto','registar-cliente','fazer-venda','abrir-caixa'];
  return ids.map(id=>ONBOARDING_STEPS.find(s=>s.id===id)).filter(s=>podeAcessarView(s.view));
}
function chaveOnboarding(){return 'contafacil_onboarding_'+(state.user?.id || '')+'_'+(state.user?.empresaId || '');}
function carregarOnboardingStatus(){
  try{onboardingCompleted=JSON.parse(localStorage.getItem(chaveOnboarding()) || '{}');}catch{onboardingCompleted={};}
}
function marcarOnboardingCompleto(id){
  onboardingCompleted[id]=true;
  try{localStorage.setItem(chaveOnboarding(),JSON.stringify(onboardingCompleted));}catch{}
  renderOnboardingProgress();
}
function calcularProgressoOnboarding(){
  const passos=passosOnboarding();
  return passos.length?Math.round(passos.filter(s=>onboardingCompleted[s.id]).length/passos.length*100):100;
}
function renderOnboardingProgress(){
  const banner=document.getElementById('onboarding-banner');
  if(!banner)return;
  banner.style.display='none';
  banner.replaceChildren();
}
function verificarOnboardingCompletion(){
  if(state.products?.length) marcarOnboardingCompleto('adicionar-produto');
  if(state.clients?.length) marcarOnboardingCompleto('registar-cliente');
  if(state.sales?.length) marcarOnboardingCompleto('fazer-venda');
  if(state.caixaAtual) marcarOnboardingCompleto('abrir-caixa');
}
function initOnboarding(){carregarOnboardingStatus();verificarOnboardingCompletion();renderOnboardingProgress();}
