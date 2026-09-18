# Actualização da ContaFácil MZ — 16/09/2026

## Estado

O utilizador confirmou que o login local voltou a funcionar depois de reiniciar o backend. O ficheiro index.html utiliza http://localhost:4000/api. O servidor precisa de estar em execução para entrar e guardar dados.

## SQL a executar manualmente

Abra `backend/migrations/011_operacoes_atomicas.sql` e execute **todo o conteúdo actualizado**, desde o primeiro BEGIN até ao COMMIT final, no SQL Editor da mesma base Supabase usada pelo backend. O ficheiro foi actualizado depois da primeira versão: volte a executá-lo mesmo que já tenha executado uma cópia anterior.

Não copie apenas o corpo de uma função nem acrescente barras aos sublinhados. O IF pertence ao bloco CREATE FUNCTION ... LANGUAGE plpgsql ... $$; executá-lo isoladamente causa o erro 42601 apresentado anteriormente.

A migração mantém os registos existentes. Foi executada duas vezes seguidas em PostgreSQL local de teste para verificar a sintaxe e a repetição. Não foi aplicada automaticamente à base real. Pressupõe as tabelas das migrações anteriores já existentes nesta instalação; não execute dados de demonstração numa base com clientes reais.

## Correcções implementadas

- Treze tipos de negócio, incluindo Farmácia, com exemplos de campos, prioridades, atalhos e configuração inicial próprios.
- Sugestões opcionais só em Mercearia e Supermercado; Adicionar abre o formulário e não grava automaticamente.
- Serviços sem stock e artigos com unidades e quantidades fraccionadas, mantendo as áreas existentes.
- Vendas, compras, movimentos de stock, pagamentos de clientes, contas a pagar e alteração de escalões executados de forma atómica: uma falha reverte a operação completa.
- Protecção contra repetição de vendas/compras e pagamentos; verificação de stock, pertença ao negócio e limite de crédito opcional.
- Separação entre dinheiro recebido, dívidas, crédito depositado e margem estimada. Movimentos históricos sem origem identificada são assinalados para revisão; não foram reclassificados por adivinhação.
- Orçamentos, bancos, cartões, contas a pagar, escalões e pagamentos móveis usam a ligação Supabase existente.
- Totais do Dashboard e saldos bancários lêem todas as páginas de movimentos, ultrapassando o limite inicial de resultados da API.
- Pagamentos móveis gravam a intenção antes do contacto com o provedor; uma resposta incerta permanece pendente de confirmação e não é repetida pela mesma chave.
- Erros internos recebem um código de diagnóstico no backend; não é necessário enviar palavras-passe para investigar.

## Validação

29 testes automatizados: personalização dos 13 tipos, isolamento entre negócios, login com dados de teste, rollback financeiro, idempotência, quantidades fraccionadas, serviços, margem, crédito e paginação. Comando: `npm test`, na pasta backend.

Os testes de escrita utilizam PostgreSQL isolado e provedores simulados. As verificações da instalação real foram de leitura; não foram criadas vendas nem efectuadas cobranças reais para testar.

## Antes da publicação

- Aplicar o SQL final e confirmar os fluxos com uma empresa de teste na instalação final.
- Configurar e verificar o endereço do backend publicado. O endereço antigo presente em config.js devolveu “Application not found”; isso não afecta o login pelo ficheiro local.
- Validar M-Pesa/e-Mola com as credenciais e documentação da conta comercial. Os testes locais não certificam pagamentos reais nem a confirmação de pedidos pendentes.
- Rever movimentos antigos e escalões fiscais com os responsáveis. Esta alteração preserva as taxas configuradas; não certifica obrigações fiscais.

A personalização não implementa módulos especializados de lotes/validade, receitas de cozinha, reservas hoteleiras, prontuários ou gestão de obras. As actividades usam as funções de gestão existentes. Esta actualização, por si só, não constitui validação de prontidão para comercialização em todos esses sectores.
