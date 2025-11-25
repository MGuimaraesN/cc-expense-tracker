'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data, error } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const user = data?.user || null;
  const isLoading = !data && !error;

  const login = async (credentials: any) => {
    try {
      const res = await api.post('/api/auth/login', credentials);
      const { token } = res.data;

      if (!token) {
        throw new Error('Token não encontrado na resposta');
      }

      localStorage.setItem('token', token);
      await mutate('/api/auth/me'); // Revalidate user session
      toast.success('Login bem-sucedido!');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Falha no login';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: any) => {
    try {
      await api.post('/api/auth/register', userData);
      toast.success('Registro bem-sucedido! Fazendo login...');
      // Automatically log in after registration
      await login({ email: userData.email, password: userData.password });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Falha no registro';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    mutate('/api/auth/me', undefined, false); // Clear user cache
    toast.info('Você foi desconectado.');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
