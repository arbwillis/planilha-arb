'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calcularDadosMes } from '@/services/calculos';
import { obterBancaDoMes } from '@/services/banca-mensal';
import { DadosMes } from '@/types';
import { TrendingUp, TrendingDown, Activity, Target, Wallet, Percent } from 'lucide-react';

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
  const [bancaDoMes, setBancaDoMes] = useState(0);

  const carregarDados = useCallback(() => {
    if (typeof window !== 'undefined') {
      const dataReferencia = mesSelecionado || new Date();
      const ano = dataReferencia.getFullYear();
      const mes = dataReferencia.getMonth();
      
      const dados = calcularDadosMes(ano, mes);
      setDadosMes(dados);
      
      // Obter banca do mês específico
      const banca = obterBancaDoMes(ano, mes);
      setBancaDoMes(banca);
    }
  }, [mesSelecionado]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    window.addEventListener('freebetExcluida', carregarDados);
    window.addEventListener('operacaoSalva', carregarDados);
    window.addEventListener('freebetSalva', carregarDados);
    window.addEventListener('operacaoAtualizada', carregarDados);
    window.addEventListener('operacaoExcluida', carregarDados);
    window.addEventListener('configuracoesAtualizadas', carregarDados);
    window.addEventListener('bancaAtualizada', carregarDados);
    
    return () => {
      window.removeEventListener('freebetExcluida', carregarDados);
      window.removeEventListener('operacaoSalva', carregarDados);
      window.removeEventListener('freebetSalva', carregarDados);
      window.removeEventListener('operacaoAtualizada', carregarDados);
      window.removeEventListener('operacaoExcluida', carregarDados);
      window.removeEventListener('configuracoesAtualizadas', carregarDados);
      window.removeEventListener('bancaAtualizada', carregarDados);
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

  const formatarPorcentagemComSinal = (valor: number) => {
    const sinal = valor >= 0 ? '+' : '';
    return `${sinal}${valor.toFixed(2)}%`;
  };

  const dataReferencia = mesSelecionado || new Date();
  const mesAtual = dataReferencia.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Calcular métricas da banca usando a banca do mês específico
  const porcentagemSobreBanca = bancaDoMes > 0 ? (dadosMes.lucroLiquido / bancaDoMes) * 100 : 0;
  const valorizacaoBanca = dadosMes.lucroLiquido;

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

        {/* Métricas da Banca - Só aparece se a banca do mês estiver configurada */}
        {bancaDoMes > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wallet className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold text-center">Desempenho da Banca</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Banca do Mês</p>
                </div>
                <p className="text-xl font-bold text-blue-500">
                  {formatarMoeda(bancaDoMes)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Retorno sobre Banca</p>
                </div>
                <p className={`text-xl font-bold ${porcentagemSobreBanca >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatarPorcentagemComSinal(porcentagemSobreBanca)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {valorizacaoBanca >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {valorizacaoBanca >= 0 ? 'Valorização' : 'Desvalorização'}
                  </p>
                </div>
                <p className={`text-xl font-bold ${valorizacaoBanca >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {valorizacaoBanca >= 0 ? '+' : ''}{formatarMoeda(valorizacaoBanca)}
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Banca Atual: <span className={`font-bold ${valorizacaoBanca >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatarMoeda(bancaDoMes + valorizacaoBanca)}
                </span>
              </p>
            </div>
          </div>
        )}

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
