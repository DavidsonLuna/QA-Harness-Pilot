# QA-Harness-Pilot

[![Playwright Tests](https://github.com/your-org/QA-Harness-Pilot/actions/workflows/playwright.yml/badge.svg)](https://github.com/your-org/QA-Harness-Pilot/actions/workflows/playwright.yml)

Badges: (atualize o link acima substituindo `your-org` pelo seu usuário/organização)

Suite de testes E2E para OpenCart usando Playwright.

## Quickstart

Instale dependências e binários do Playwright:

```bash
npm install
npx playwright install --with-deps
```

Executar todos os testes:

```bash
npx playwright test
```

Executar um teste em modo headed:

```bash
npx playwright test --headed
```

## Estrutura

- `pages/` — Page Objects (POM)
- `tests/` — testes Playwright
- `tests/fixtures/` — dados de teste

## Contribuição

Abra PRs para mudanças; inclua descrição e passos para reproduzir.

## Licença

Este projeto usa a licença MIT — veja o arquivo `LICENSE`.
