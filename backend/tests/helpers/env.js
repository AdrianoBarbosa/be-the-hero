// Limite alto para que as suítes não esbarrem no rate limit, testado separadamente em rateLimit.spec.js.
process.env.AUTH_RATE_LIMIT = '1000';
