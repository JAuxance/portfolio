import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyTotp } from '@/lib/totp';

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  code: z.string().optional(),
});

// Surfaced to the login page as `response.code` so it can ask for the 2FA code.
class TotpRequired extends CredentialsSignin {
  code = 'totp_required';
}
class TotpInvalid extends CredentialsSignin {
  code = 'totp_invalid';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        if (user.totpEnabled && user.totpSecret) {
          if (!parsed.data.code) throw new TotpRequired();
          const step = verifyTotp(user.totpSecret, parsed.data.code, user.totpLastStep);
          if (step === null) throw new TotpInvalid();
          // Conditional write: two concurrent logins can't both spend the same code.
          const { count } = await db.adminUser.updateMany({
            where: {
              id: user.id,
              OR: [{ totpLastStep: null }, { totpLastStep: { lt: step } }],
            },
            data: { totpLastStep: step },
          });
          if (count === 0) throw new TotpInvalid();
        }
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user = { ...session.user, id: token.id as string };
      return session;
    },
  },
});
