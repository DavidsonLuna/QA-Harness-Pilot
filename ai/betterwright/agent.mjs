import { runAgentTask } from "betterwright";
import { bw } from "./client.mjs";

try {
  const result = await runAgentTask({
    task: `
      Abra https://opencart.abstracta.us/index.php?route=account/login.
      Analise a página de login e me informe:
      1. quais campos de entrada existem;
      2. quais botões existem;
      3. quais links relacionados ao login existem.
    `,
    browser: bw,
    model: "codex/gpt-5.4",
  });

  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        answer: result.answer,
        steps: result.steps,
        toolCalls: result.toolCalls,
        reason: result.reason,
      },
      null,
      2,
    ),
  );
} finally {
  await bw.close();
}