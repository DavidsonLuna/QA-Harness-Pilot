# Luninha STD (Spec-Driven Testing)

[![E2E Tests](https://github.com/DavidsonLuna/QA-Harness-Pilot/actions/workflows/playwright.yml/badge.svg)](https://github.com/DavidsonLuna/QA-Harness-Pilot/actions/workflows/playwright.yml)

Suíte Playwright para validar o OpenCart público e a Fake Store API. A cobertura é organizada em jornadas E2E, comportamento de API, contrato e acessibilidade.

## Cobertura

| Suíte | Diretório | Foco |
| --- | --- | --- |
| E2E | `tests/e2e/` | Navegação na home, login, recuperação de senha e entradas inválidas. |
| API | `tests/api/` | Autenticação, entradas ausentes/malformadas, limites e submissões repetidas. |
| Contrato | `tests/contract/` | Status, headers e formato do payload de autenticação. |
| Acessibilidade | `tests/accessibility/` | Labels e controles nomeados no formulário de login. |

As massas de teste ficam em `tests/fixtures/` e os Page Objects em `pages/`.

## Pré-requisitos

- Node.js LTS
- Google Chrome instalado para execução local. No CI, o Playwright usa Chromium e WebKit gerenciados.

## Instalação

```bash
npm ci
npm run install-playwright
```

## Execução

```bash
npm test
npm run test:e2e
npm run test:api
npm run test:contract
npm run test:accessibility
```

Para executar com o navegador visível:

```bash
npm run test:headed
```

Após uma execução, abra o relatório HTML local com:

```bash
npm run test:report
```

## CI e qualidade

A workflow `E2E Tests` é executada em pull requests, instala Chromium e WebKit e publica `playwright-report` como artefato mesmo quando um teste falha. Configure a regra de proteção da branch principal para exigir o check `E2E Tests / test` antes do merge.

## Licença

MIT.
