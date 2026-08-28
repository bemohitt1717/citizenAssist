import app from './app.js';

/**
 * Starts the server. The app itself is built in app.js.
 *
 * The port comes from the environment so a host can choose it, falling back to
 * 5000 for local work.
 */
const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Citizen Assist API running on http://localhost:${PORT}`);
});
