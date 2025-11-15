'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';

// Definindo a interface do usuário
interface User {
  id: number;
  name: string;
  email: string;
}

// Definindo a interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

// Criando o contexto com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função fetcher para o SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Usuário não autenticado');
  }
  return res.json();
});

// Componente Provedor de Autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, error, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const user = data?.user || null;
  const isLoading = !data && !error;

  const login = async (credentials: any) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Falha no login');
    }
    await mutate(); // Revalida a sessão (chama /api/auth/me novamente)
  };

  const register = async (userData: any) => {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha no registro');
      }
      // Opcional: fazer login automaticamente após o registro
      await login({ email: userData.email, password: userData.password });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await mutate(undefined, false); // Limpa o cache do usuário sem revalidar
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
