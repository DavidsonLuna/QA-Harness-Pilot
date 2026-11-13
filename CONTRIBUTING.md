# Contribuindo

Obrigado por contribuir com o LunaFlow. Abra uma issue antes de mudanças maiores para alinhar o escopo; para correções pequenas, descreva o problema e como reproduzi-lo no pull request.

## Preparar o ambiente

Use Node.js LTS e instale as dependências:

```bash
npm ci
```

Execute a suíte relacionada à mudança:

```bash
npm run test:e2e
npm run test:api
npm run test:contract
npm run test:accessibility
```

`npm test` executa todas as suítes Playwright. Os testes de interface usam Page Objects em `pages/`; mantenha dados reutilizáveis em `tests/fixtures/` e prefira seletores por papel, rótulo ou test ID. Evite esperas fixas: use asserções Playwright que aguardam a condição esperada.

## Testes de performance

Os perfis K6 não definem um alvo por padrão. Use somente um serviço autorizado, informe `K6_BASE_URL` explicitamente e execute primeiro:

```bash
npm run test:k6:smoke
```

Os perfis de carga, pico e resistência também exigem `K6_ALLOW_HIGH_LOAD=true`. Mantenha credenciais em variáveis de ambiente ou secret store; não as inclua em fixtures ou commits.

## Pull requests

- Use uma branch com prefixo `feat/`, `fix/` ou `docs/`.
- Explique o objetivo e liste as verificações executadas.
- Mantenha as mudanças focadas e atualize a documentação relacionada.
- Não inclua segredos, relatórios gerados ou artefatos temporários.

A workflow **Playwright Tests** valida pull requests automaticamente.
