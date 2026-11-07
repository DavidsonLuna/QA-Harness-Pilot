import { bw } from "../client.mjs";

try {
  const result = await bw.run(`
    await page.goto(
      "https://opencart.abstracta.us/index.php?route=account/login"
    );

    const email = page.getByRole("textbox", {
      name: "E-Mail Address",
      exact: true
    }).first();

    const password = page.getByRole("textbox", {
      name: "Password",
      exact: true
    }).first();

    await email.fill("teste@example.com");
    await password.fill("senha-invalida");

    const login = page.getByRole("button", {
      name: "Login",
      exact: true
    }).first();

    await human.click(login);

    return {
      url: page.url(),
      title: await page.title()
    };
  `);

  console.log(JSON.stringify(result, null, 2));
} finally {
  await bw.close();
}