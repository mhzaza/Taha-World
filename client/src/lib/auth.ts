import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call your backend API to authenticate
          const { config } = await import('./config');
          const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
              return {
                id: data.data.user._id,
                email: data.data.user.email,
                name: data.data.user.displayName,
                isAdmin: data.data.user.isAdmin,
                adminRole: data.data.user.adminRole,
              };
            }
          }
        } catch (error) {
          console.error('Authentication error:', error);
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as { isAdmin?: boolean; adminRole?: string }).isAdmin;
        token.adminRole = (user as { isAdmin?: boolean; adminRole?: string }).adminRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const user = session.user as { id?: string; isAdmin?: boolean; adminRole?: string };
        user.id = token.sub!;
        user.isAdmin = token.isAdmin;
        user.adminRole = token.adminRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

// Helper function to check if user is admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  const allowedEmails = adminEmails.split(',').map(e => e.trim().toLowerCase());
  
  return allowedEmails.includes(email.toLowerCase());
}

// Helper function for server-side admin check
export async function isServerAdmin(email: string | null): Promise<boolean> {
  if (!email) return false;
  
  // Check email allowlist
  if (isAdminEmail(email)) {
    return true;
  }
  
  // In a real implementation, you would check your database here
  // For now, we'll just check the email allowlist
  return false;
}