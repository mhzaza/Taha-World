import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean;
    adminRole?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      isAdmin?: boolean;
      adminRole?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
    adminRole?: string;
  }
}
