export interface E2EAdminCredentials {
  email: string;
  password: string;
}

export function getE2EAdminCredentials(): E2EAdminCredentials | null {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}
