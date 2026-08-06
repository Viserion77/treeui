# Prompt: adopt the TreeUI colour contract in a product

Copy everything inside the fence into your coding agent, fill the two brackets,
and run it. It is written for a product that already consumes `@treeui/vue` or
`@treeui/react` and has colour of its own — hardcoded hexes, a wrapper
stylesheet, a forked component, an `!important` somewhere.

It is deliberately a **four-phase** prompt with a stop after the audit. Colour is
a stakeholder decision; an agent that picks your brand tone for you has picked
wrong even when the contrast passes.

**Where it comes from.** TreeUI's own dashboard example was migrated with this
exact prompt — the result is `examples/dashboard-vue/src/theme.ts`,
`scripts/check-theme.ts`, and the `check:theme` script in its `package.json`.
Read those three files for a finished, validated shape before you start.

**Do not paraphrase the last line.** "Se falta token, é PR na lib" is what keeps
the contract shared rather than per-product. A product that invents
`--brand-elevated-accent-2` has left the system, and the next component TreeUI
ships will not know about it.

---

```
Este produto consome TreeUI (`@treeui/vue`), que expõe um contrato de tokens
semânticos versionado e aceita um tema a partir de uma seed. Migre este produto
para esse contrato.

## Contexto
- Cor principal da marca deste produto: [HEX DA MARCA]
- Versão da lib: a que está no lockfile deste repo — confira, não assuma
- Contrato: `@treeui/tokens` → `SEMANTIC_TOKENS`, `CONTRAST_PAIRS`,
  `STATE_DISTINCTIONS` (arquivo `contract.ts`, `CONTRACT_VERSION` 1.0)
- Guia: `MIGRATION.md` na raiz do TreeUI, e `docs/ai/TOKENS.yaml`
- Exemplo pronto: `examples/dashboard-vue/src/theme.ts` no repo do TreeUI

Antes de qualquer coisa, entenda as três camadas, porque elas decidem o que você
pode escrever:
1. **Primitivas** — valores crus (`#0969da`). Vivem só dentro da lib. Você nunca
   referencia uma.
2. **Semânticas** — os papéis (`bg.surface`, `text.muted`, `brand.primary`).
   Esta é a API pública: é o que você preenche e o único nível que você nomeia.
3. **Estados derivados** — hover, press, selected, disabled. A lib calcula a
   partir da camada 2. Você LÊ (`var(--tree-color-brand-press)`), nunca define.
   Definir um estado à mão é o bug que este contrato existe para eliminar.

## Fase 1 — Auditoria (pare e me mostre antes de mudar nada)
1. Toda cor definida neste repo — hex, `rgb()`, `hsl()`, classes de cor,
   variáveis CSS próprias, cor em SVG inline, cor em config de gráfico.
2. Todo lugar onde este produto sobrescreve ou contorna a lib para trocar cor.
   No TreeUI isso tem quatro formas conhecidas — procure as quatro:
   - regra que mira uma classe `t-*` a partir de CSS do produto;
   - `!important` em qualquer lugar perto de um componente da lib;
   - wrapper/`:deep()` que repinta um componente por fora;
   - componente forkado (copiado da lib e editado).
   Para cada um: o que ele queria que a lib fizesse?
3. Cores que este produto usa e que NÃO têm equivalente semântico no contrato.
   Confira contra `SEMANTIC_TOKENS` — não contra memória. Separe em:
   (a) devia virar token novo na lib,
   (b) é ilustração/marketing e fica fora do sistema (logo, hero art, mapa),
   (c) é gambiarra e some.
4. Pares texto+fundo criados aqui que reprovam em WCAG AA.
5. Cor usada como ÚNICO portador de significado (status só por cor, série de
   gráfico só por cor). Isso não é um problema de token e não some com a
   migração; liste separado.

Mostre o resultado das 5 e pare.

## Fase 2 — Definir o tema
- Monte a seed a partir da cor da marca:

      import { createValidatedThemePair, formatValidationResult } from '@treeui/tokens';
      const { themes, results, valid } = createValidatedThemePair({ accent: '[HEX DA MARCA]' });

  `accent` é o único campo obrigatório. `accentSecondary`, `neutral`, `status` e
  `overrides` são opcionais e passam pelo mesmo validador.
- Status NÃO derivam da marca, de propósito: sucesso continuar verde quando a
  marca é vermelha é o motivo de existir cor de status. Só mude via `status`.
- Rode o validador. Se algum par reprovar, me mostre as opções — ajustar o tom
  da marca dentro do produto, ou `overrides` pontual no token — com a razão de
  contraste medida de cada uma. **Não escolha sozinho: cor de marca é decisão de
  stakeholder.**
- Confirme o resultado de `brand.contrast` (a tinta que vai EM CIMA da marca:
  preto ou branco) e valide olhando, não só pela razão. Um par que passa em
  4.6:1 ainda pode vibrar.
- Emita o CSS com `createSemanticThemeCss` e monte no seletor de tema do
  produto. Não escreva `--tree-color-*` à mão em nenhum arquivo.

## Fase 3 — Migração
- Troque cor hardcoded por token semântico. Se você não sabe qual token usar num
  ponto, **não chute**: liste como pendência para eu decidir. Chutar aqui é
  como o produto acumulou as cores da Fase 1.
- Elimine os contornos listados na auditoria. Se algum for inevitável, documente
  o porquê — isso vira pedido de feature na lib, não um `!important` permanente.
- Onde você precisar de hover/press/selected/disabled, use as variáveis
  derivadas (`--tree-color-brand-hover`, `-press`, `--tree-color-state-*`).
  Não recalcule com `color-mix`, `filter: brightness` ou `opacity`.
- `opacity` para desabilitado só onde não há texto. Onde há rótulo, use
  `--tree-color-state-disabled-*`: opacidade não é mensurável em contraste.
- Rode o validador no CI:

      // scripts/check-theme.ts
      import { assertThemeValid } from '@treeui/tokens';
      import { light, dark } from '../src/theme';
      assertThemeValid(light, 'light', { label: 'produto-light' });
      assertThemeValid(dark, 'dark', { label: 'produto-dark' });

  Ele lança com o par, os dois valores, a razão medida e o limite.

## Entregáveis
1. Arquivo de tema do produto — só a seed + overrides justificados, cada um com
   um comentário dizendo por que existe.
2. Lista de pendências: pontos onde o token certo não era óbvio.
3. Lista de pedidos para a lib: tokens que faltam no contrato, e o contorno da
   Fase 1 que cada um resolveria.
4. Diff visual das telas principais, antes e depois, nos dois modos.

Não invente nome semântico novo. Se falta token, é PR na lib.
```

---

## For the TreeUI-side agent reading a report produced by this prompt

Deliverable 3 is the input to this repository. Treat each entry as a candidate
contract change, not as a support question:

- If a product needed a colour role the contract has no name for, that is a gap
  in `SEMANTIC_TOKENS` — a new role, added to `contract.ts` with its contrast
  tier and its pairs, is the fix. A product-local override is the symptom.
- If two products ask for the same missing role, stop treating it as a request
  and ship it.
- If a product asks for a role that is really "our marketing gradient", it is
  category (b) from the audit and stays out of the system. Say so, and say why
  — a token that only one surface in one product uses is not a contract.
- If a product's override exists because a DERIVED state was wrong, that is a
  bug in `states.ts`, not a theming question. Derived states are the library's
  job by definition.
