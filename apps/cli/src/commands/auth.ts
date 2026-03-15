import { Command } from "commander";
import { loadConfig, saveConfig } from "../lib/config.js";

export const loginCmd = new Command("login")
  .description("Login with email and password")
  .requiredOption("--email <email>", "Email address")
  .requiredOption("--password <password>", "Password")
  .action(async (opts) => {
    const config = loadConfig();
    const res = await fetch(`${config.apiUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: opts.email, password: opts.password }),
    });

    if (!res.ok) {
      console.error("Login failed:", await res.text());
      process.exit(1);
    }

    const data = await res.json();
    saveConfig({ token: data.token });
    console.log("Logged in successfully.");
  });

export const whoamiCmd = new Command("whoami")
  .description("Show current user")
  .option("--json", "JSON output")
  .action(async (opts) => {
    const config = loadConfig();
    if (!config.token) {
      console.error("Not logged in.");
      process.exit(1);
    }
    const res = await fetch(`${config.apiUrl}/api/auth/get-session`, {
      headers: { Cookie: `better-auth.session_token=${config.token}` },
    });
    if (!res.ok) {
      console.error("Session expired. Run: toki login");
      process.exit(1);
    }
    const session = await res.json();
    if (opts.json) {
      console.log(JSON.stringify(session.user, null, 2));
    } else {
      console.log(`${session.user.name} <${session.user.email}>`);
    }
  });
