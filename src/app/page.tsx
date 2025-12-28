'use client';

import { DailyInfoCard } from '@/components/daily-info-card';
import { RegisterCard } from '@/components/register-card';
import { FreebetsListCard } from '@/components/freebets-list-card';
import { OperationsListCard } from '@/components/operations-list-card';
import { NotesModal } from '@/components/notes-modal';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, StickyNote, Target } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { obterConfiguracoes, type Configuracoes } from '@/services/punter-storage';

export default function Home() {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({ 
    exibirGestaoPunter: false,
    valorBanca: 0,
    quantidadeUnidades: 100
  });

  useEffect(() => {
    // Carregar configurações do localStorage
    const configs = obterConfiguracoes();
    setConfiguracoes(configs);

    // Escutar mudanças nas configurações
    const handleConfiguracoesAtualizadas = (event: CustomEvent<Configuracoes>) => {
      setConfiguracoes(event.detail);
    };

    window.addEventListener('configuracoesAtualizadas', handleConfiguracoesAtualizadas as EventListener);

    return () => {
      window.removeEventListener('configuracoesAtualizadas', handleConfiguracoesAtualizadas as EventListener);
    };
  }, []);

  // App funciona 100% com localStorage - sem autenticação necessária

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          {/* Botões Centralizados */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 sm:px-4 text-xs sm:text-sm"
              onClick={() => setIsNotesOpen(true)}
            >
              <StickyNote className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Notas
            </Button>
            <Link href="/acompanhamento">
              <Button variant="outline" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Balanço
              </Button>
            </Link>
            {configuracoes.exibirGestaoPunter && (
              <Link href="/gestao-punter">
                <Button variant="outline" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Gestão de Punter</span>
                  <span className="sm:hidden">Punter</span>
                </Button>
              </Link>
            )}
            <Link href="/configuracoes">
              <Button variant="outline" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Configurações</span>
                <span className="sm:hidden">Config</span>
              </Button>
            </Link>
          </div>
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Planilha ARB
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
              Gerenciamento de operações de surebet e freebets
            </p>
            <p className="text-xs text-muted-foreground">
              Sistema de gestão de apostas esportivas
            </p>
          </div>
        </header>

        {/* Layout Principal */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Primeira linha - Card de informações do dia */}
          <DailyInfoCard />

          {/* Segunda linha - Grid com registro e freebets */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Card de registro */}
            <div className="md:col-span-1 xl:col-span-1">
              <RegisterCard />
            </div>
            
            {/* Card de freebets */}
            <div className="md:col-span-1 xl:col-span-2">
              <FreebetsListCard />
            </div>
          </div>

          {/* Terceira linha - Lista de operações */}
          <OperationsListCard />
        </div>

        {/* Modais */}
        <NotesModal 
          isOpen={isNotesOpen} 
          onClose={() => setIsNotesOpen(false)} 
        />

      </div>
    </div>
  );
}