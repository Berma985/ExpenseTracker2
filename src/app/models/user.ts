export type User = {
  id: string;
  email: string;
  emailVerified: boolean;

  password: string | null;

  name: string;

  budgetGoals: string;

  providers: {
    provider: 'google' | 'local';
    providerId: string;
  }[];
};
