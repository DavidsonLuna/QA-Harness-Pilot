function value(summary, metricName, field) {
  const metric = summary.metrics && summary.metrics[metricName];
  const result = metric && metric.values ? metric.values[field] : undefined;
  return Number.isFinite(result) ? result : 0;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function failedThresholds(summary) {
  const failures = [];
  const metrics = summary.metrics || {};

  Object.keys(metrics).forEach((metricName) => {
    const thresholds = metrics[metricName].thresholds || {};
    Object.keys(thresholds).forEach((threshold) => {
      if (!thresholds[threshold].ok) failures.push(`${metricName}: ${threshold}`);
    });
  });

  return failures;
}

export function createExecutiveReport(summary, profile) {
  const requests = value(summary, 'http_reqs', 'count');
  const failedRate = value(summary, 'http_req_failed', 'rate');
  const checkPasses = value(summary, 'checks', 'passes');
  const checkFailures = value(summary, 'checks', 'fails');
  const checkTotal = checkPasses + checkFailures;
  const checkRate = checkTotal > 0 ? checkPasses / checkTotal : 0;
  const thresholdFailures = failedThresholds(summary);
  const status = requests > 0 && checkTotal > 0 && failedRate === 0 && checkFailures === 0 && thresholdFailures.length === 0
    ? 'Saudável'
    : 'Requer atenção';
  const reportData = {
    profile,
    status,
    requests,
    failedRate,
    checkPasses,
    checkFailures,
    checkRate,
    thresholdFailures,
    latency: {
      avg: value(summary, 'http_req_duration', 'avg'),
      p50: value(summary, 'http_req_duration', 'med'),
      p90: value(summary, 'http_req_duration', 'p(90)'),
      p95: value(summary, 'http_req_duration', 'p(95)'),
      max: value(summary, 'http_req_duration', 'max'),
    },
    requestRate: value(summary, 'http_reqs', 'rate'),
    generatedAt: new Date().toISOString(),
  };
  const safeData = JSON.stringify(reportData).replace(/</g, '\\u003c');
  const safeProfile = escapeHtml(profile);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Relatório executivo de performance · ${safeProfile}</title>
  <style>
    :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#14243a;background:#f3f6fb;font-synthesis:none}
    *{box-sizing:border-box}body{margin:0}.shell{max-width:1180px;margin:auto;padding:40px 28px 56px}
    .eyebrow{font-size:12px;font-weight:750;letter-spacing:.13em;text-transform:uppercase;color:#4668a5;margin:0 0 10px}
    h1{font-size:clamp(28px,4vw,42px);letter-spacing:-.04em;margin:0}.sub{color:#617087;margin:10px 0 28px}
    .topline{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.badge{border:1px solid #d5deeb;background:#fff;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:700;white-space:nowrap}
    .status{color:${status === 'Saudável' ? '#117b63' : '#a15b00'}}.cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin:26px 0}
    .card,.panel{background:#fff;border:1px solid #e1e8f1;border-radius:16px;box-shadow:0 8px 26px #18345c0a}
    .card{padding:20px}.label{font-size:12px;color:#63748b;font-weight:650}.value{font-size:27px;font-weight:760;letter-spacing:-.035em;margin-top:8px}.unit{font-size:14px;color:#708097;font-weight:550}
    .panel{padding:22px;margin-top:18px}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
    h2{font-size:18px;margin:0}.switches{display:flex;gap:7px}.switches button{border:1px solid #d9e2ef;background:#fff;color:#43536a;border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit;font-size:13px}
    .switches button[aria-pressed=true]{background:#eaf1ff;border-color:#96b6f0;color:#184d9d;font-weight:700}
    .chart{min-height:290px;margin-top:15px;position:relative}.chart svg{width:100%;height:290px;overflow:visible}.chart text{font:12px Inter,-apple-system,sans-serif;fill:#60728a}
    .tip{position:absolute;display:none;background:#14243a;color:white;border-radius:7px;padding:7px 10px;font-size:12px;pointer-events:none;transform:translate(-50%,-115%);white-space:nowrap}
    .insight{border-left:3px solid #517de0;padding:13px 15px;background:#f6f8fc;border-radius:0 10px 10px 0;color:#46566d;line-height:1.55}
    footer{margin-top:24px;color:#74839a;font-size:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    @media(max-width:980px){.cards{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:780px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.topline{display:block}.badge{display:inline-block;margin-top:18px}}
    @media(max-width:480px){.shell{padding:28px 16px}.cards{grid-template-columns:1fr 1fr}.card{padding:15px}.value{font-size:22px}}
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <p class="eyebrow">LunaFlow · Quality Engineering</p>
      <div class="topline"><div><h1>Resumo executivo de performance</h1><p class="sub">Visão de confiabilidade e latência da API para a execução selecionada.</p></div><span class="badge">Perfil: ${safeProfile}</span></div>
    </header>
    <section class="cards" aria-label="Indicadores executivos">
      <article class="card"><div class="label">Latência p95</div><div class="value" id="p95"></div></article>
      <article class="card"><div class="label">Taxa de falha HTTP</div><div class="value" id="failed"></div></article>
      <article class="card"><div class="label">Requisições</div><div class="value" id="requests"></div></article>
      <article class="card"><div class="label">Throughput médio</div><div class="value" id="rate"></div></article>
      <article class="card"><div class="label">Checks aprovados</div><div class="value" id="checks"></div></article>
    </section>
    <section class="panel" aria-labelledby="chart-heading">
      <div class="panel-head"><h2 id="chart-heading">Indicadores da execução</h2><div class="switches" role="group" aria-label="Selecionar gráfico"><button type="button" data-chart="latency" aria-pressed="true">Latência</button><button type="button" data-chart="checks" aria-pressed="false">Checks</button></div></div>
      <div class="chart"><div class="tip" id="tip" role="status"></div><svg id="chart" role="img" aria-label="Gráfico de latência"></svg></div>
    </section>
    <section class="panel"><h2>Leitura para decisão</h2><p class="insight" id="insight"></p></section>
    <footer><span id="status" class="status"></span><span id="generated"></span></footer>
  </main>
  <script>
    const data = ${safeData};
    const fmt = (n, digits = 0) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(n);
    document.getElementById('p95').innerHTML = fmt(data.latency.p95, 1) + ' <span class="unit">ms</span>';
    document.getElementById('failed').textContent = fmt(data.failedRate * 100, 2) + '%';
    document.getElementById('requests').textContent = fmt(data.requests);
    document.getElementById('rate').innerHTML = fmt(data.requestRate, 2) + ' <span class="unit">req/s</span>';
    document.getElementById('checks').textContent = fmt(data.checkRate * 100, 1) + '%';
    document.getElementById('status').textContent = data.status + ' · ' + data.profile;
    document.getElementById('generated').textContent = 'Gerado em ' + new Date(data.generatedAt).toLocaleString('pt-BR');
    const thresholdDetails = data.thresholdFailures.length ? ' Limites excedidos: ' + data.thresholdFailures.join('; ') + '.' : '';
    document.getElementById('insight').textContent = data.status === 'Saudável'
      ? 'Os checks funcionais passaram e a taxa de falhas HTTP permaneceu em ' + fmt(data.failedRate * 100, 2) + '%. Compare a latência p95 (' + fmt(data.latency.p95, 1) + ' ms) com o SLO acordado para este serviço antes de aprovar a mudança.'
      : 'A execução encontrou ' + fmt(data.checkFailures) + ' check(s) reprovado(s), ' + fmt(data.thresholdFailures.length) + ' limite(s) de métrica excedido(s) e uma taxa de falhas HTTP de ' + fmt(data.failedRate * 100, 2) + '%. Investigue o serviço e compare o impacto com o SLO antes de promover a mudança.' + thresholdDetails;
    const svg = document.getElementById('chart');
    const tooltip = document.getElementById('tip');
    function renderChart(type) {
      const width = Math.max(320, svg.parentElement.clientWidth);
      const height = 290;
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.replaceChildren();
      const ns = 'http://www.w3.org/2000/svg';
      const add = (name, attrs, text) => {
        const el = document.createElementNS(ns, name);
        Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
        if (text) el.textContent = text;
        svg.appendChild(el);
        return el;
      };
      const labels = type === 'latency' ? ['p50', 'p90', 'p95', 'média', 'máxima'] : ['Aprovados', 'Reprovados'];
      const values = type === 'latency'
        ? [data.latency.p50, data.latency.p90, data.latency.p95, data.latency.avg, data.latency.max]
        : [data.checkPasses, data.checkFailures];
      const max = Math.max(...values, 1);
      const left = 58, right = 18, top = 20, bottom = 38;
      const plotWidth = width - left - right, plotHeight = height - top - bottom;
      for (let i = 0; i <= 4; i++) {
        const y = top + plotHeight * i / 4;
        add('line', { x1: left, y1: y, x2: width - right, y2: y, stroke: '#e8edf4', 'stroke-width': 1 });
        add('text', { x: left - 9, y: y + 4, 'text-anchor': 'end' }, fmt(max * (4 - i) / 4, type === 'latency' ? 0 : 1));
      }
      const band = plotWidth / labels.length;
      values.forEach((value, index) => {
        const barWidth = Math.min(58, band * .56);
        const barHeight = Math.max(value > 0 ? 3 : 0, (value / max) * (plotHeight - 8));
        const x = left + index * band + (band - barWidth) / 2;
        const y = top + plotHeight - barHeight;
        const bar = add('rect', { x, y, width: barWidth, height: barHeight, rx: 5, fill: type === 'latency' ? '#4778d0' : (index === 0 ? '#159477' : '#e09a39'), tabindex: 0 });
        const showTip = () => { tooltip.textContent = labels[index] + ': ' + fmt(value, 1) + (type === 'latency' ? ' ms' : ' checks'); tooltip.style.display = 'block'; tooltip.style.left = (x + barWidth / 2) + 'px'; tooltip.style.top = y + 'px'; };
        bar.addEventListener('mouseenter', showTip);
        bar.addEventListener('focus', showTip);
        bar.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
        bar.addEventListener('blur', () => { tooltip.style.display = 'none'; });
        bar.setAttribute('aria-label', labels[index] + ': ' + fmt(value, 1));
        add('text', { x: x + barWidth / 2, y: height - 12, 'text-anchor': 'middle' }, labels[index]);
      });
      svg.setAttribute('aria-label', type === 'latency' ? 'Latência em milissegundos por percentil' : 'Checks aprovados e reprovados');
    }
    document.querySelectorAll('[data-chart]').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('[data-chart]').forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
      renderChart(button.dataset.chart);
    }));
    renderChart('latency');
    window.addEventListener('resize', () => renderChart(document.querySelector('[data-chart][aria-pressed=true]').dataset.chart));
  </script>
</body>
</html>`;
}
