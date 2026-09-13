const base64url = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

// JWT com expiração no futuro. A assinatura não é conferida no frontend.
export const validToken = () =>
    `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({ sub: 'abcd1234', exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;
