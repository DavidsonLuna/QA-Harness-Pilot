# Instruções de QA para geração de testes

## Stack
- Playwright + TypeScript (@playwright/test)
- Node LTS

## Convenções obrigatórias
- Use seletores baseados em role/label (getByRole, getByLabel, getByTestId)
- Nunca use page.waitForTimeout() — use assertions web-first (expect(locator).toBeVisible())
- Todo cenário deve ter pelo menos: 1 caminho feliz + 1 caso negativo/erro
- Testes devem ser independentes (não depender de ordem de execução)
- Dados de teste ficam em tests/fixtures/, nunca hardcoded no corpo do teste
- Nomeie arquivos como <funcionalidade>.spec.ts
- Sempre rode o teste gerado e corrija até passar antes de considerar concluído

## Estrutura de pastas
tests/e2e/ -> testes E2E
tests/fixtures/ -> massa de dados e factories
pages/ -> Page Object Model