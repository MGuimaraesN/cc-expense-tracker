import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, PlusCircle, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
              <DialogDescription>
                Adicione uma nova receita ou despesa.
              </DialogDescription>
            </DialogHeader>
            {/* Formulário de Nova Transação Virá Aqui */}
            <p>Formulário...</p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanço</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 4.879,30</div>
            <p className="text-xs text-muted-foreground">Saldo atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+ R$ 5.000,00</div>
            <p className="text-xs text-muted-foreground">no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">- R$ 120,70</div>
            <p className="text-xs text-muted-foreground">no último mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de Despesas */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Gráfico Virá Aqui */}
            <div className="h-[350px] w-full flex items-center justify-center bg-secondary rounded-lg">
              <p>Gráfico</p>
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Você fez 5 transações este mês.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Lista de Transações Virá Aqui */}
            <p>Lista de transações...</p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Orçamentos */}
       <Card>
          <CardHeader>
            <CardTitle>Status dos Orçamentos</CardTitle>
            <CardDescription>
              Acompanhe seus limites de gastos mensais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Lista de Orçamentos Virá Aqui */}
            <p>Lista de orçamentos...</p>
          </CardContent>
        </Card>
    </div>
  );
}
