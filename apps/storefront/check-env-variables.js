const c = require("ansi-colors");

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
    description:
      "Set this to your Medusa API origin, for example https://api.defendfreedomindustries.com",
  },
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
];

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    c;
    return !process.env[env.key];
  });

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    );

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`));
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`));
      }
    });

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    );

    process.exit(1);
  }

  if (process.env.NODE_ENV === "production") {
    try {
      const backendHostname = new URL(
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      ).hostname;

      if (["localhost", "127.0.0.1", "0.0.0.0"].includes(backendHostname)) {
        console.error(
          c.red.bold(
            "\n🚫 Error: NEXT_PUBLIC_MEDUSA_BACKEND_URL cannot point to localhost in production\n"
          )
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        c.red.bold(
          "\n🚫 Error: NEXT_PUBLIC_MEDUSA_BACKEND_URL must be a valid absolute URL\n"
        )
      );
      process.exit(1);
    }
  }
}

module.exports = checkEnvVariables;
