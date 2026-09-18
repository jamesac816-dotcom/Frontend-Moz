-- Supabase SQL Editor
-- Ajusta a restrição de forma_pagamento na tabela vendas para aceitar os métodos usados pelo PDV
-- incluindo saldo do cliente e pagamento eletrónico.

BEGIN;

ALTER TABLE IF EXISTS public.vendas
  DROP CONSTRAINT IF EXISTS vendas_forma_pagamento_check;

ALTER TABLE public.vendas
  ADD CONSTRAINT vendas_forma_pagamento_check
  CHECK (
    forma_pagamento IN (
      'Dinheiro',
      'Pagamento Eletrônico',
      'Saldo do Cliente',
      'Saldo',
      'M-Pesa',
      'e-Mola',
      'Transferência Bancária',
      'Cartão'
    )
  );

COMMIT;

-- Opcional: validação rápida.
SELECT id, numero, forma_pagamento
FROM public.vendas
WHERE forma_pagamento NOT IN (
  'Dinheiro',
  'Pagamento Eletrônico',
  'Saldo do Cliente',
  'Saldo',
  'M-Pesa',
  'e-Mola',
  'Transferência Bancária',
  'Cartão'
)
LIMIT 20;
