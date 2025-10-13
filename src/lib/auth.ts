import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

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
          if (!auth) {
            throw new Error('Firebase Auth not initialized');
          }
          
          // Sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          const user = userCredential.user;

          // Get additional user data from Firestore
          if (!db) {
            return {
              id: user.uid,
              email: user.email,
              name: user.displayName,
              role: 'user',
              image: user.photoURL,
            };
          }
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          return {
            id: user.uid,
            email: user.email,
            name: userData?.name || user.displayName,
            role: userData?.role || 'user',
            image: userData?.photoURL || user.photoURL,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// Helper function to check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    if (!db) {
      return false;
    }
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Helper function to check if user is coach
export async function isCoach(userId: string): Promise<boolean> {
  try {
    if (!db) {
      return false;
    }
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    return userData?.role === 'coach' || userData?.role === 'admin';
  } catch (error) {
    console.error('Error checking coach status:', error);
    return false;
  }
}