export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar (futuro) */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 hidden md:block">
        Sidebar
      </aside>
      {/* Conteúdo Principal */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
