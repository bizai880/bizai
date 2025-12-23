// Mock useAuth for build time
export function useAuth() {
  return {
    user: { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com',
      role: 'user'
    },
    login: async (email: string, password: string) => {
      console.log('Mock login:', email);
      return true;
    },
    logout: () => {
      console.log('Mock logout');
    },
    isAuthenticated: true,
    isLoading: false
  };
}
