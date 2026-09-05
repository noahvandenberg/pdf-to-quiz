# PDF to Quiz

A Next.js application that streams multiple-choice questions from an uploaded PDF,
then presents answers, explanations, and quiz results. The current route requests
four questions per batch using the Google provider; the client and Zod schema use
that same count. Provider credentials belong in local/server environment configuration.

Use the committed pnpm lockfile to install dependencies, then `pnpm dev` for local
development. Review `package.json` for build scripts and `app/api/generate-quiz/route.ts`
for the configured model. Current model availability and live generation are not
verified by this documentation cleanup. No provider request was made.

## Earlier project documentation

# Todo

[ ] Loading page for when new quiz questions are being generated and when all questions are already answered
