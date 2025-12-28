'use client';

import { useState } from 'react';
import { CalendarioLucros } from '@/components/calendario-lucros';
import { ResumoMensal } from '@/components/resumo-mensal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AcompanhamentoPage() {
  const [mesSelecionado, setMesSelecionado] = useState(new Date());

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">
            Balanço Financeiro
          </h1>
          <p className="text-muted-foreground text-center">
            Acompanhe seu desempenho mensal e histórico de operações
          </p>
        </header>

        {/* Layout Principal */}
        <div className="space-y-8">
          {/* Calendário de Lucros */}
          <CalendarioLucros 
            onMesChange={setMesSelecionado}
            mesAtual={mesSelecionado}
          />

          {/* Resumo Mensal */}
          <ResumoMensal mesSelecionado={mesSelecionado} />
        </div>

      </div>
    </div>
  );
}
