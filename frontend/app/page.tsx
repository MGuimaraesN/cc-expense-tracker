import { redirect } from 'next/navigation';

export default function RootPage() {
  // Por enquanto, redireciona diretamente para o dashboard.
  // No futuro, isso pode verificar a autenticação.
  redirect('/dashboard');
}
