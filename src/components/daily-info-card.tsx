'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calcularDadosDia } from '@/services/calculos';
import { obterDataAtual, validarELimparFreebets } from '@/services/storage';
import { useEffect, useState, useCallback } from 'react';
import { DadosDia } from '@/types';

export function DailyInfoCard() {
  const [dadosDia, setDadosDia] = useState<DadosDia>({
    lucroLiquido: 0,
    totalFreebets: 0,
    quantidadeOperacoes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const carregarDados = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Limpar dados inconsistentes na primeira carga
      validarELimparFreebets();
      
      const hoje = obterDataAtual();
      const dados = calcularDadosDia(hoje);
      
      setDadosDia(dados);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    const handleFreebetExcluida = (event: any) => {
      console.log('📊 DAILY INFO - Recebeu evento freebetExcluida:', event.detail);
      carregarDados();
    };

    const handleOperacaoSalva = (event: any) => {
      console.log('📊 DAILY INFO - Recebeu evento operacaoSalva:', event.detail);
      carregarDados();
    };

    const handleFreebetSalva = (event: any) => {
      console.log('📊 DAILY INFO - Recebeu evento freebetSalva:', event.detail);
      carregarDados();
    };

    window.addEventListener('freebetExcluida', handleFreebetExcluida);
    window.addEventListener('operacaoSalva', handleOperacaoSalva);
    window.addEventListener('freebetSalva', handleFreebetSalva);
    
    return () => {
      window.removeEventListener('freebetExcluida', handleFreebetExcluida);
      window.removeEventListener('operacaoSalva', handleOperacaoSalva);
      window.removeEventListener('freebetSalva', handleFreebetSalva);
    };
  }, [carregarDados]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Resumo do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-4 sm:p-5 lg:p-6 rounded-xl bg-muted/50 border animate-pulse">
                <div className="h-3 sm:h-4 bg-muted rounded mb-2 sm:mb-3"></div>
                <div className="h-6 sm:h-7 lg:h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-center">
          Resumo do Dia - {obterDataAtual().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 sm:pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Lucro Líquido */}
          <div className="text-center p-4 sm:p-5 lg:p-6 rounded-xl bg-muted/50 border">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
              Lucro Líquido do Dia
            </h3>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
              dadosDia.lucroLiquido >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatarMoeda(dadosDia.lucroLiquido)}
            </p>
          </div>

          {/* Freebets Adquiridas Hoje */}
          <div className="text-center p-4 sm:p-5 lg:p-6 rounded-xl bg-muted/50 border">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
              Freebets Adquiridas Hoje
            </h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: 'oklch(0.6 0.25 240)' }}>
              {formatarMoeda(dadosDia.totalFreebets)}
            </p>
          </div>

          {/* Operações do Dia */}
          <div className="text-center p-4 sm:p-5 lg:p-6 rounded-xl bg-muted/50 border sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
              Operações Hoje
            </h3>
            <div className="flex justify-center">
              <Badge 
                variant="secondary" 
                className="text-base sm:text-lg lg:text-xl px-3 sm:px-4 py-1.5 sm:py-2 font-bold"
                style={{ backgroundColor: 'oklch(0.45 0.15 270)', color: 'white' }}
              >
                {dadosDia.quantidadeOperacoes}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
