import { codexModel } from "betterwright";

const model = codexModel({
  model: "gpt-5.4",
  effort: "low",
});

try {
  const result = await model.complete({
    system: "Você é um assistente de teste.",
    messages: [
      {
        role: "user",
        text: "Responda apenas: OK",
      },
    ],
    tools: [],
  });

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("MODEL ERROR");
  console.error("name:", error?.name);
  console.error("message:", error?.message);
  console.error("code:", error?.code);
  console.error("status:", error?.status);
  console.error("cause:", error?.cause);
  console.error(error?.stack);
}