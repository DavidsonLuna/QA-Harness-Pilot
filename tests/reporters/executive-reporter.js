const fs = require('node:fs/promises');
const path = require('node:path');

const STATUS_LABELS = {
  passed: 'Aprovado',
  failed: 'Falhou',
  flaky: 'Instável',
  skipped: 'Ignorado',
};

function getTestStatus(test) {
  const outcome = test.outcome();
  if (outcome === 'expected') return 'passed';
  if (outcome === 'flaky') return 'flaky';
  if (outcome === 'skipped') return 'skipped';
  return 'failed';
}

function getSuiteName(file) {
  const normalized = file.split(path.sep).join('/');
  const match = normalized.match(/(?:^|\/)tests\/([^/]+)/);
  return match ? match[1] : 'outros';
}

function collectTests(rootSuite) {
  return rootSuite.allTests().map((test) => {
    const result = test.results[test.results.length - 1];
    const error = result && result.error;
    const file = path.relative(process.cwd(), test.location.file).split(path.sep).join('/');

    return {
      title: test.title,
      fullTitle: test.titlePath().filter(Boolean).join(' › '),
      file,
      line: test.location.line,
      project: test.parent.project()?.name || 'default',
      suite: getSuiteName(file),
      status: getTestStatus(test),
      duration: result ? result.duration : 0,
      error: error ? error.message || error.value || 'Falha sem mensagem de erro.' : '',
      stack: error && error.stack ? error.stack : '',
    };
  });
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderExecutiveReport(summary) {
  const reportData = escapeJsonForHtml(summary);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Relatório executivo de qualidade · LunaFlow</title>
  <style>
    :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17283f;background:#f3f6fb;font-synthesis:none}
    *{box-sizing:border-box}body{margin:0}.shell{max-width:1320px;margin:auto;padding:38px 28px 56px}
    .eyebrow{font-size:12px;font-weight:750;letter-spacing:.14em;text-transform:uppercase;color:#4668a5;margin:0 0 10px}
    h1{font-size:clamp(28px,4vw,42px);letter-spacing:-.04em;margin:0}.sub{color:#63748b;margin:10px 0 0}
    .topline{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.actions{display:flex;gap:10px;flex-wrap:wrap}
    .button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid #d6dfeb;border-radius:9px;padding:10px 13px;background:#fff;color:#40536d;font:inherit;font-size:13px;font-weight:700}
    .button.primary{background:#1d4f9a;border-color:#1d4f9a;color:#fff}
    .meta{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.pill{border:1px solid #dce5ef;background:#fff;border-radius:999px;padding:7px 11px;color:#586b83;font-size:12px}
    .cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin:24px 0}
    .card,.panel{background:#fff;border:1px solid #e1e8f1;border-radius:16px;box-shadow:0 8px 26px #18345c0a}
    .card{padding:19px}.label{font-size:12px;color:#63748b;font-weight:650}.value{font-size:28px;font-weight:780;letter-spacing:-.04em;margin-top:8px}.unit{font-size:14px;color:#718096;font-weight:550}
    .green{color:#12806a}.red{color:#bd4a4a}.amber{color:#ad6c12}.blue{color:#315fa7}
    .grid{display:grid;grid-template-columns:1fr 1.4fr;gap:16px}.panel{padding:21px;margin-top:16px;min-width:0}
    h2{font-size:17px;margin:0}.panel-desc{color:#738198;font-size:12px;margin:7px 0 0}
    .chart{height:260px;margin-top:14px}.chart svg{width:100%;height:100%;overflow:visible}.chart text{font:12px Inter,-apple-system,sans-serif;fill:#64758c}
    .chart rect[tabindex]{cursor:pointer}.chart rect[tabindex]:focus{outline:2px solid #17283f;outline-offset:2px}
    .toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:17px 0}
    .filters{display:flex;gap:7px;flex-wrap:wrap}.filters button,.toolbar input,.toolbar select{font:inherit;font-size:13px;border:1px solid #d8e1ec;background:#fff;color:#4c5d73;border-radius:8px;padding:9px 11px}
    .filters button{cursor:pointer}.filters button[aria-pressed=true]{background:#eaf1ff;border-color:#9bb8e8;color:#214f91;font-weight:700}
    .search{display:flex;gap:8px;flex-wrap:wrap}.search input{min-width:210px}
    .table-wrap{overflow:auto;border:1px solid #e3eaf2;border-radius:11px}
    table{width:100%;border-collapse:collapse;min-width:760px}th,td{text-align:left;padding:12px 13px;border-bottom:1px solid #edf1f6;font-size:13px;vertical-align:top}
    th{background:#f8fafd;color:#61728a;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
    tr:last-child td{border-bottom:0}.test-name{font-weight:700;color:#253852}.test-file{display:block;color:#738198;font-size:11px;margin-top:4px}
    .status-tag{display:inline-block;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:750;white-space:nowrap}
    .status-passed{color:#117a63;background:#e8f6f1}.status-failed{color:#a63f3f;background:#fff0ef}.status-flaky{color:#95600e;background:#fff5df}.status-skipped{color:#69788d;background:#eef2f6}
    details{margin-top:7px}summary{cursor:pointer;color:#a63f3f;font-size:12px}.error{white-space:pre-wrap;overflow-wrap:anywhere;color:#8b3434;background:#fff7f6;border-radius:7px;padding:10px;margin:8px 0 0;font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
    .empty{padding:30px;text-align:center;color:#718096}.foot{margin-top:20px;color:#7a899d;font-size:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    @media(max-width:900px){.cards{grid-template-columns:repeat(3,minmax(0,1fr))}.grid{grid-template-columns:1fr}}
    @media(max-width:620px){.shell{padding:27px 15px 40px}.topline{display:block}.actions{margin-top:18px}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.card{padding:15px}.value{font-size:24px}.search input{min-width:0;width:100%}}
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <p class="eyebrow">LunaFlow · Quality Engineering</p>
      <div class="topline">
        <div><h1>Resumo executivo de qualidade</h1><p class="sub">Visão da execução Playwright para decisão, priorização e investigação.</p></div>
        <nav class="actions" aria-label="Relatórios">
          <a class="button primary" href="./details/index.html">Abrir relatório detalhado</a>
        </nav>
      </div>
      <div class="meta"><span class="pill" id="run-date"></span><span class="pill" id="run-duration"></span><span class="pill" id="project-count"></span><span class="pill" id="file-count"></span></div>
    </header>
    <section class="cards" aria-label="Indicadores executivos">
      <article class="card"><div class="label">Taxa de aprovação</div><div class="value green" id="pass-rate"></div></article>
      <article class="card"><div class="label">Aprovados</div><div class="value green" id="passed-count"></div></article>
      <article class="card"><div class="label">Falhas</div><div class="value red" id="failed-count"></div></article>
      <article class="card"><div class="label">Instáveis</div><div class="value amber" id="flaky-count"></div></article>
      <article class="card"><div class="label">Ignorados</div><div class="value blue" id="skipped-count"></div></article>
    </section>
    <div class="grid">
      <section class="panel" aria-labelledby="status-heading">
        <h2 id="status-heading">Resultado da execução</h2><p class="panel-desc">Selecione uma barra para filtrar os cenários.</p>
        <div class="chart"><svg id="status-chart" role="img" aria-label="Quantidade de testes por resultado"></svg></div>
      </section>
      <section class="panel" aria-labelledby="suite-heading">
        <h2 id="suite-heading">Qualidade por suíte</h2><p class="panel-desc">Comparativo de aprovações, falhas, instabilidade e cenários ignorados.</p>
        <div class="chart"><svg id="suite-chart" role="img" aria-label="Resultados dos testes por suíte"></svg></div>
      </section>
    </div>
    <section class="panel" aria-labelledby="tests-heading">
      <h2 id="tests-heading">Cenários executados</h2><p class="panel-desc" id="result-count"></p>
      <div class="toolbar">
        <div class="filters" role="group" aria-label="Filtrar por resultado">
          <button type="button" data-status="all" aria-pressed="true">Todos</button>
          <button type="button" data-status="failed" aria-pressed="false">Falhas</button>
          <button type="button" data-status="flaky" aria-pressed="false">Instáveis</button>
          <button type="button" data-status="passed" aria-pressed="false">Aprovados</button>
          <button type="button" data-status="skipped" aria-pressed="false">Ignorados</button>
        </div>
        <div class="search">
          <select id="suite-filter" aria-label="Filtrar por suíte"><option value="all">Todas as suítes</option></select>
          <input id="search-filter" type="search" aria-label="Buscar cenário" placeholder="Buscar cenário ou arquivo">
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Cenário</th><th>Resultado</th><th>Duração</th><th>Projeto</th></tr></thead>
          <tbody id="test-results"></tbody>
        </table>
        <div id="empty-results" class="empty" hidden>Nenhum cenário corresponde aos filtros.</div>
      </div>
    </section>
    <footer class="foot"><span id="run-summary"></span><span>Relatório Playwright detalhado em <a href="./details/index.html">detalhes</a>.</span></footer>
  </main>
  <script>
    const report = ${reportData};
    const statuses = ['passed', 'failed', 'flaky', 'skipped'];
    const colors = { passed: '#159477', failed: '#d95656', flaky: '#e2a235', skipped: '#9aa8b8' };
    const labels = { passed: 'Aprovado', failed: 'Falhou', flaky: 'Instável', skipped: 'Ignorado' };
    const counts = Object.fromEntries(statuses.map((status) => [status, report.tests.filter((test) => test.status === status).length]));
    const eligible = report.tests.length - counts.skipped;
    const passRate = eligible > 0 ? counts.passed / eligible : 0;
    let activeStatus = 'all';
    const suiteFilter = document.getElementById('suite-filter');
    const searchFilter = document.getElementById('search-filter');
    const resultsBody = document.getElementById('test-results');
    const emptyResults = document.getElementById('empty-results');
    const fmt = (number, digits = 0) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(number);
    document.getElementById('run-date').textContent = 'Executado em ' + new Date(report.generatedAt).toLocaleString('pt-BR');
    document.getElementById('run-duration').textContent = 'Duração: ' + fmt(report.duration / 1000, 1) + ' s';
    document.getElementById('project-count').textContent = report.projects.length + ' projeto(s)';
    document.getElementById('file-count').textContent = report.files.length + ' arquivo(s)';
    document.getElementById('pass-rate').textContent = fmt(passRate * 100, 1) + '%';
    document.getElementById('passed-count').textContent = fmt(counts.passed);
    document.getElementById('failed-count').textContent = fmt(counts.failed);
    document.getElementById('flaky-count').textContent = fmt(counts.flaky);
    document.getElementById('skipped-count').textContent = fmt(counts.skipped);
    document.getElementById('run-summary').textContent = fmt(report.tests.length) + ' cenários analisados · ' + fmt(report.files.length) + ' arquivos';
    [...new Set(report.tests.map((test) => test.suite))].sort().forEach((suite) => {
      const option = document.createElement('option');
      option.value = suite;
      option.textContent = suite;
      suiteFilter.appendChild(option);
    });

    function addSvgElement(svg, name, attributes, text) {
      const element = document.createElementNS('http://www.w3.org/2000/svg', name);
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      if (text !== undefined) element.textContent = text;
      svg.appendChild(element);
      return element;
    }

    function renderStatusChart() {
      const svg = document.getElementById('status-chart');
      const width = Math.max(300, svg.parentElement.clientWidth);
      const height = 250;
      const left = 82, right = 18, top = 14, bottom = 25;
      const plotWidth = width - left - right;
      const plotHeight = height - top - bottom;
      const max = Math.max(1, ...statuses.map((status) => counts[status]));
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.replaceChildren();
      for (let i = 0; i <= 4; i++) {
        const x = left + plotWidth * i / 4;
        addSvgElement(svg, 'line', { x1: x, y1: top, x2: x, y2: height - bottom, stroke: '#e9eef5' });
        addSvgElement(svg, 'text', { x, y: height - 5, 'text-anchor': 'middle' }, fmt(max * i / 4));
      }
      statuses.forEach((status, index) => {
        const y = top + index * (plotHeight / statuses.length) + 7;
        addSvgElement(svg, 'text', { x: left - 10, y: y + 13, 'text-anchor': 'end' }, labels[status]);
        const barWidth = counts[status] / max * (plotWidth - 8);
        const bar = addSvgElement(svg, 'rect', { x: left, y, width: Math.max(counts[status] ? 2 : 0, barWidth), height: 22, rx: 5, fill: colors[status], tabindex: 0, role: 'button', 'aria-label': 'Filtrar ' + labels[status] + ': ' + counts[status] });
        addSvgElement(svg, 'text', { x: left + Math.max(counts[status] ? 2 : 0, barWidth) + 7, y: y + 15 }, fmt(counts[status]));
        bar.addEventListener('click', () => setStatusFilter(status));
        bar.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') setStatusFilter(status); });
      });
    }

    function renderSuiteChart() {
      const svg = document.getElementById('suite-chart');
      const suites = [...new Set(report.tests.map((test) => test.suite))].sort();
      const width = Math.max(360, svg.parentElement.clientWidth);
      const rowHeight = 38;
      const height = Math.max(100, suites.length * rowHeight + 35);
      const left = Math.min(115, Math.max(85, width * .23)), right = 18, top = 15;
      const plotWidth = width - left - right;
      const max = Math.max(1, ...suites.map((suite) => report.tests.filter((test) => test.suite === suite).length));
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.replaceChildren();
      suites.forEach((suite, index) => {
        const y = top + index * rowHeight;
        addSvgElement(svg, 'text', { x: left - 9, y: y + 17, 'text-anchor': 'end' }, suite);
        const items = statuses.map((status) => report.tests.filter((test) => test.suite === suite && test.status === status).length);
        let x = left;
        statuses.forEach((status, statusIndex) => {
          if (!items[statusIndex]) return;
          const barWidth = items[statusIndex] / max * plotWidth;
          const bar = addSvgElement(svg, 'rect', { x, y, width: barWidth, height: 23, rx: 3, fill: colors[status], tabindex: 0, role: 'button', 'aria-label': suite + ', ' + labels[status] + ': ' + items[statusIndex] });
          bar.addEventListener('click', () => { suiteFilter.value = suite; activeStatus = status; updateStatusButtons(); renderRows(); });
          bar.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { suiteFilter.value = suite; activeStatus = status; updateStatusButtons(); renderRows(); } });
          if (barWidth > 27) addSvgElement(svg, 'text', { x: x + barWidth / 2, y: y + 16, 'text-anchor': 'middle', fill: '#fff', style: 'fill:#fff;font-weight:700' }, fmt(items[statusIndex]));
          x += barWidth;
        });
      });
    }

    function updateStatusButtons() {
      document.querySelectorAll('[data-status]').forEach((button) => button.setAttribute('aria-pressed', button.dataset.status === activeStatus ? 'true' : 'false'));
    }

    function addCell(row, text) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.appendChild(cell);
      return cell;
    }

    function renderRows() {
      const query = searchFilter.value.trim().toLowerCase();
      const filtered = report.tests.filter((test) => {
        const statusMatches = activeStatus === 'all' || test.status === activeStatus;
        const suiteMatches = suiteFilter.value === 'all' || test.suite === suiteFilter.value;
        const queryMatches = !query || (test.fullTitle + ' ' + test.file).toLowerCase().includes(query);
        return statusMatches && suiteMatches && queryMatches;
      }).sort((a, b) => (a.status === 'failed' ? -1 : b.status === 'failed' ? 1 : a.file.localeCompare(b.file)));
      resultsBody.replaceChildren();
      filtered.forEach((test) => {
        const row = document.createElement('tr');
        const nameCell = addCell(row, '');
        const name = document.createElement('span');
        name.className = 'test-name';
        name.textContent = test.fullTitle;
        nameCell.appendChild(name);
        const file = document.createElement('span');
        file.className = 'test-file';
        file.textContent = test.file + ':' + test.line;
        nameCell.appendChild(file);
        if (test.error) {
          const details = document.createElement('details');
          const summary = document.createElement('summary');
          summary.textContent = 'Ver erro';
          const error = document.createElement('pre');
          error.className = 'error';
          error.textContent = test.error + (test.stack ? '\\n' + test.stack : '');
          details.append(summary, error);
          nameCell.appendChild(details);
        }
        const statusCell = addCell(row, '');
        const tag = document.createElement('span');
        tag.className = 'status-tag status-' + test.status;
        tag.textContent = labels[test.status];
        statusCell.appendChild(tag);
        addCell(row, fmt(test.duration / 1000, 2) + ' s');
        addCell(row, test.project);
        resultsBody.appendChild(row);
      });
      emptyResults.hidden = filtered.length > 0;
      document.getElementById('result-count').textContent = 'Exibindo ' + fmt(filtered.length) + ' de ' + fmt(report.tests.length) + ' cenários.';
    }

    function setStatusFilter(status) {
      activeStatus = status;
      updateStatusButtons();
      renderRows();
    }

    document.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => setStatusFilter(button.dataset.status)));
    suiteFilter.addEventListener('change', renderRows);
    searchFilter.addEventListener('input', renderRows);
    renderStatusChart();
    renderSuiteChart();
    renderRows();
    window.addEventListener('resize', () => { renderStatusChart(); renderSuiteChart(); });
  </script>
</body>
</html>`;
}

class ExecutiveReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'playwright-report/index.html';
  }

  async onEnd(result) {
    const tests = collectTests(this.rootSuite);
    const summary = {
      generatedAt: new Date().toISOString(),
      duration: result.duration || 0,
      status: result.status,
      tests,
      files: [...new Set(tests.map((test) => test.file))].sort(),
      projects: [...new Set(tests.map((test) => test.project))].sort(),
    };
    const outputPath = path.resolve(process.cwd(), this.outputFile);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, renderExecutiveReport(summary), 'utf8');
  }

  onBegin(_config, suite) {
    this.rootSuite = suite;
  }
}

module.exports = ExecutiveReporter;
module.exports.renderExecutiveReport = renderExecutiveReport;
