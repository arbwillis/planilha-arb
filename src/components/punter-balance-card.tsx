'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { obterApostasPunter, type ApostaPunter } from '@/services/punter-storage';
import { obterConfiguracoes, calcularValorUnidade } from '@/app/configuracoes/page';

interface BalancePunter {
  diario: {
    lucro: number;
    apostas: number;
    unidades: number;
  };
  mensal: {
    lucro: number;
    apostas: number;
    unidades: number;
  };
}

export function PunterBalanceCard() {
  const [balance, setBalance] = useState<BalancePunter>({
    diario: { lucro: 0, apostas: 0, unidades: 0 },
    mensal: { lucro: 0, apostas: 0, unidades: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterDataHoje = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  const obterMesAtual = () => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  };

  const calcularBalance = useCallback(() => {
    try {
      const apostas = obterApostasPunter();
      const configs = obterConfiguracoes();
      const valorUnidade = calcularValorUnidade(configs.valorBanca, configs.quantidadeUnidades);
      
      const hoje = obterDataHoje();
      const mesAtual = obterMesAtual();

      // Filtrar apostas do dia com validação
      const apostasDiarias = apostas.filter(aposta => {
        try {
          return aposta.data && typeof aposta.data === 'string' && aposta.data === hoje;
        } catch (error) {
          console.error('Erro ao filtrar aposta diária:', error);
          return false;
        }
      });
      
      // Filtrar apostas do mês com validação
      const apostasMensais = apostas.filter(aposta => {
        try {
          return aposta.data && typeof aposta.data === 'string' && aposta.data.startsWith(mesAtual);
        } catch (error) {
          console.error('Erro ao filtrar aposta mensal:', error);
          return false;
        }
      });

      // Calcular balanço diário com validação de dados
      const lucroDiario = apostasDiarias.reduce((total, aposta) => {
        const lucroPerda = typeof aposta.lucroPerda === 'number' && !isNaN(aposta.lucroPerda) 
          ? aposta.lucroPerda 
          : 0;
        return total + lucroPerda;
      }, 0);

      const unidadesDiarias = valorUnidade > 0 && !isNaN(lucroDiario) ? lucroDiario / valorUnidade : 0;

      // Calcular balanço mensal com validação de dados
      const lucroMensal = apostasMensais.reduce((total, aposta) => {
        const lucroPerda = typeof aposta.lucroPerda === 'number' && !isNaN(aposta.lucroPerda) 
          ? aposta.lucroPerda 
          : 0;
        return total + lucroPerda;
      }, 0);

      const unidadesMensais = valorUnidade > 0 && !isNaN(lucroMensal) ? lucroMensal / valorUnidade : 0;

      setBalance({
        diario: {
          lucro: lucroDiario,
          apostas: apostasDiarias.length,
          unidades: unidadesDiarias
        },
        mensal: {
          lucro: lucroMensal,
          apostas: apostasMensais.length,
          unidades: unidadesMensais
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao calcular balanço punter:', error);
      // Estado de fallback em caso de erro
      setBalance({
        diario: { lucro: 0, apostas: 0, unidades: 0 },
        mensal: { lucro: 0, apostas: 0, unidades: 0 }
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    calcularBalance();

    // Escutar eventos de mudanças
    const handleDataChange = () => {
      calcularBalance();
    };

    window.addEventListener('apostaPunterSalva', handleDataChange);
    window.addEventListener('apostaPunterAtualizada', handleDataChange);
    window.addEventListener('apostaPunterExcluida', handleDataChange);

    return () => {
      window.removeEventListener('apostaPunterSalva', handleDataChange);
      window.removeEventListener('apostaPunterAtualizada', handleDataChange);
      window.removeEventListener('apostaPunterExcluida', handleDataChange);
    };
  }, [calcularBalance]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="w-48 h-5 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-full h-16 bg-muted animate-pulse rounded-lg"></div>
            <div className="w-full h-16 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          Balanço Punter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Balanço Diário */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Hoje</h4>
            <Badge variant="secondary" className="text-xs">
              {balance.diario.apostas} apostas
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/30">
              <p className="text-muted-foreground mb-1">Lucro</p>
              <p className={`font-semibold ${balance.diario.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatarMoeda(balance.diario.lucro)}
              </p>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <p className="text-muted-foreground mb-1">Unidades</p>
              <p className={`font-semibold ${balance.diario.unidades >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {balance.diario.unidades >= 0 ? '+' : ''}{balance.diario.unidades.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Balanço Mensal */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Este Mês</h4>
            <Badge variant="secondary" className="text-xs">
              {balance.mensal.apostas} apostas
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/30">
              <p className="text-muted-foreground mb-1">Lucro</p>
              <p className={`font-semibold ${balance.mensal.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatarMoeda(balance.mensal.lucro)}
              </p>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <p className="text-muted-foreground mb-1">Unidades</p>
              <p className={`font-semibold ${balance.mensal.unidades >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {balance.mensal.unidades >= 0 ? '+' : ''}{balance.mensal.unidades.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
