import { BetterWright } from "betterwright";

const executablePath =
  process.env.BETTERWRIGHT_BROWSER ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const bw = new BetterWright({
  provider: {
    executablePath,
  },
});