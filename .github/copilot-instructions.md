# Instruções de QA para geração de testes

## Stack
- Playwright + TypeScript (@playwright/test)
- Grafana k6 for backend performance checks (external CLI)
- Node LTS

## Convenções obrigatórias
- Use seletores baseados em role/label (getByRole, getByLabel, getByTestId)
- Nunca use `page.waitForTimeout()` — use assertions web-first (expect(locator).toBeVisible())
- Todo cenário deve ter pelo menos: 1 caminho feliz + 1 caso negativo/erro
- Testes devem ser independentes (não depender de ordem de execução)
- Dados de teste ficam em `tests/fixtures/`, nunca hardcoded no corpo do teste
- Nomeie arquivos como `<funcionalidade>.spec.ts`
- Sempre rode o teste gerado e corrija até passar antes de considerar concluído
- Use Page Object Model para testes de UI e mantenha a lógica de navegação em `pages/`
- Para testes de API, centralize endpoints e dados em `tests/fixtures/`
- Valide respostas de API com `response.status()`, `response.json()` e, quando for texto, use `trim()`
- Evite depender de APIs externas instáveis em testes unitários; use mocks quando possível
- K6 deve receber `K6_BASE_URL` explicitamente e nunca apontar para um serviço sem autorização
- Perfis K6 de carga, pico e resistência exigem `K6_ALLOW_HIGH_LOAD=true`; executar primeiro o smoke em ambiente controlado
- Credenciais K6 devem vir de variáveis de ambiente/secret store e nunca ser salvas em fixtures versionadas
- Não misture chamadas negativas na carga sustentada, exceto quando isso fizer parte da hipótese e estiver documentado
- Mantenha relatórios de performance sem segredos e compare resultados com SLOs acordados, não com limites universais

## O que aprendemos neste projeto
- A API Fake Store pode retornar `201` para login válido e `401` para credenciais inválidas, então não presuma outros códigos
- Envie `Content-Type: application/json` em requests de API para evitar comportamento inconsistente
- Crie fixtures reutilizáveis para usuários válidos/inválidos e mensagens de erro esperadas
- Não faça asserts rígidos em mensagens de erro que podem variar de espaçamento; normalize com `trim()` antes
- Testes de contrato devem validar tanto status quanto headers e formato do corpo
- Use branch protection com PRs e checks obrigatórios em vez de pushes diretos para `main`
- Documente no `README.md` como rodar a suite e como instalar dependências

## Estrutura de pastas
- `tests/e2e/` — testes E2E com UI e POM
- `tests/api/` — testes de API diretos
- `tests/contract/` — testes de contrato de API
- `tests/fixtures/` — massa de dados e configurações de endpoints
- `tests/performance/` — perfis K6 e relatório executivo de performance
- `pages/` — Page Object Model

## Skill
- `.github/skills/qa-performance/SKILL.md` — procedimento para ampliar e executar cenários K6 com segurança.

## Recomendações práticas
- Prefira `request.post(url, { data, headers: { 'Content-Type': 'application/json' } })` para chamadas JSON
- Para chamadas de login, valide token e contrato de resposta JWT
- Quando falhar, capture `response.status()` e `response.text()`/`response.body()` para depuração rápida
- Mantenha o fluxo de PRs óbvio e use nomes de branch claros como `ci/update-generated-files`
- Atualize `package.json` com scripts úteis e use workflow GitHub Actions para rodar Playwright
- Para K6, reutilize perfis em `tests/performance/`, gere/inspecione o relatório HTML e valide a sintaxe antes de ampliar a carga
- Se a aplicação crescer, adicione `CONTRIBUTING.md` e `CODE_OF_CONDUCT.md` para times maiores
