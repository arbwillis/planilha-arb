'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calcularDadosMes } from '@/services/calculos';
import { DadosMes } from '@/types';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

interface ResumoMensalProps {
  mesSelecionado?: Date;
}

export function ResumoMensal({ mesSelecionado }: ResumoMensalProps) {
  const [dadosMes, setDadosMes] = useState<DadosMes>({
    lucroLiquido: 0,
    totalFreebetsAdquiridas: 0,
    quantidadeOperacoes: 0,
    mediaExtracao: 0
  });

  const carregarDados = useCallback(() => {
    if (typeof window !== 'undefined') {
      const dataReferencia = mesSelecionado || new Date();
      const dados = calcularDadosMes(dataReferencia.getFullYear(), dataReferencia.getMonth());
      setDadosMes(dados);
    }
  }, [mesSelecionado]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    const handleFreebetExcluida = (event: any) => {
      console.log('📊 RESUMO MENSAL - Recebeu evento freebetExcluida:', event.detail);
      carregarDados();
    };

    const handleOperacaoSalva = (event: any) => {
      console.log('📊 RESUMO MENSAL - Recebeu evento operacaoSalva:', event.detail);
      carregarDados();
    };

    const handleFreebetSalva = (event: any) => {
      console.log('📊 RESUMO MENSAL - Recebeu evento freebetSalva:', event.detail);
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

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const dataReferencia = mesSelecionado || new Date();
  const mesAtual = dataReferencia.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const estatisticas = [
    {
      titulo: 'Lucro Líquido do Mês',
      valor: formatarMoeda(dadosMes.lucroLiquido),
      cor: dadosMes.lucroLiquido >= 0 ? 'text-green-500' : 'text-red-500',
      icone: dadosMes.lucroLiquido >= 0 ? TrendingUp : TrendingDown,
      descricao: 'Total de lucros menos prejuízos'
    },
    {
      titulo: 'Freebets Adquiridas',
      valor: formatarMoeda(dadosMes.totalFreebetsAdquiridas),
      cor: 'text-blue-500',
      icone: Target,
      descricao: 'Valor total investido em freebets',
      corCustomizada: 'oklch(0.6 0.25 240)'
    },
    {
      titulo: 'Total de Operações',
      valor: dadosMes.quantidadeOperacoes.toString(),
      cor: 'text-secondary',
      icone: Activity,
      descricao: 'Número de operações realizadas'
    },
    {
      titulo: 'Média de Extração',
      valor: formatarPorcentagem(dadosMes.mediaExtracao),
      cor: 'text-violet-500',
      icone: Target,
      descricao: 'Média da porcentagem de extração das freebets'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          Resumo de {mesAtual}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {estatisticas.map((stat, index) => {
            const IconeComponente = stat.icone;
            
            return (
              <div key={index} className="text-center p-6 rounded-lg bg-muted/50 border">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-background">
                    <IconeComponente 
                      className="w-6 h-6" 
                      style={stat.corCustomizada ? { color: stat.corCustomizada } : {}}
                    />
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {stat.titulo}
                </h3>
                
                <p 
                  className={`text-2xl font-bold mb-2 ${stat.cor}`}
                  style={stat.corCustomizada ? { color: stat.corCustomizada } : {}}
                >
                  {stat.valor}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  {stat.descricao}
                </p>
              </div>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 p-6 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-4 text-center">Análise do Desempenho</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Lucro por Operação</p>
              <p className="font-semibold text-lg">
                {dadosMes.quantidadeOperacoes > 0 
                  ? formatarMoeda(dadosMes.lucroLiquido / dadosMes.quantidadeOperacoes)
                  : formatarMoeda(0)
                }
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground">Status do Mês</p>
              <Badge 
                variant={dadosMes.lucroLiquido >= 0 ? "default" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {dadosMes.lucroLiquido >= 0 ? 'Lucrativo' : 'Prejuízo'}
              </Badge>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground">Eficiência de Extração</p>
              <Badge 
                variant={dadosMes.mediaExtracao >= 70 ? "default" : dadosMes.mediaExtracao >= 50 ? "secondary" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {dadosMes.mediaExtracao >= 70 ? 'Excelente' : 
                 dadosMes.mediaExtracao >= 50 ? 'Boa' : 
                 dadosMes.mediaExtracao > 0 ? 'Regular' : 'Sem dados'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
