import express from 'express';

/**
 * The Express application.
 *
 * This file only builds and exports the app — it does not listen. Starting the
 * server is server.js's job. Keeping those apart means tests can import the app
 * without a port being opened.
 *
 * Nothing here is wired to the frontend yet. Every route the client expects is
 * marked `TODO(api)` in the client source, with its method, path and body already
 * written next to it.
 */
const app = express();

app.use(express.json());

/** Health check. Useful for confirming the process is up. */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Citizen Assist API',
    time: new Date().toISOString(),
  });
});

/* Routes to come:
 *   /api/auth       send-otp, verify-otp, google, sign-out
 *   /api/services   the six services
 *   /api/requests   create, list, status updates, notes
 *   /api/agents     apply, list, verify
 *   /api/admin      overview counts, complaints
 */

/** Anything unmatched. JSON, not HTML, since every client of this is code. */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Error handler. Must take four arguments for Express to recognise it as one,
 * and must be registered last.
 */
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status ?? 500).json({
    status: 'error',
    // The real message only in development — in production it can leak internals.
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong on our side.'
        : (error.message ?? 'Unknown error'),
  });
});

export default app;
