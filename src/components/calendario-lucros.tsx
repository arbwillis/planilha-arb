'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calcularDadosDia } from '@/services/calculos';
import { formatarData } from '@/services/storage';
import { DadosDia } from '@/types';

interface CalendarioLucrosProps {
  onMesChange?: (mes: Date) => void;
  mesAtual?: Date;
}

export function CalendarioLucros({ onMesChange, mesAtual: mesAtualProp }: CalendarioLucrosProps) {
  const [mesAtual, setMesAtual] = useState(mesAtualProp || new Date());
  const [dadosPorDia, setDadosPorDia] = useState<Record<string, DadosDia>>({});

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const carregarDadosDoMes = useCallback(() => {
    if (typeof window !== 'undefined') {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth();
      const diasNoMes = new Date(ano, mes + 1, 0).getDate();
      const novosDados: Record<string, DadosDia> = {};

      for (let dia = 1; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes, dia);
        const chaveData = formatarData(data);
        const dadosDia = calcularDadosDia(data);
        novosDados[chaveData] = dadosDia;
      }

      setDadosPorDia(novosDados);
    }
  }, [mesAtual]);

  useEffect(() => {
    if (mesAtualProp) {
      setMesAtual(mesAtualProp);
    }
  }, [mesAtualProp]);

  useEffect(() => {
    carregarDadosDoMes();
  }, [mesAtual, carregarDadosDoMes]);

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    const recarregarDados = () => {
      setDadosPorDia({});
      setTimeout(() => {
        carregarDadosDoMes();
      }, 100);
    };

    window.addEventListener('freebetExcluida', recarregarDados);
    window.addEventListener('operacaoSalva', recarregarDados);
    window.addEventListener('freebetSalva', recarregarDados);
    window.addEventListener('operacaoAtualizada', recarregarDados);
    window.addEventListener('operacaoExcluida', recarregarDados);
    
    return () => {
      window.removeEventListener('freebetExcluida', recarregarDados);
      window.removeEventListener('operacaoSalva', recarregarDados);
      window.removeEventListener('freebetSalva', recarregarDados);
      window.removeEventListener('operacaoAtualizada', recarregarDados);
      window.removeEventListener('operacaoExcluida', recarregarDados);
    };
  }, [carregarDadosDoMes]);

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    const novoMes = new Date(mesAtual);
    if (direcao === 'anterior') {
      novoMes.setMonth(novoMes.getMonth() - 1);
    } else {
      novoMes.setMonth(novoMes.getMonth() + 1);
    }
    setMesAtual(novoMes);
    onMesChange?.(novoMes);
  };

  const obterDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias = [];

    // Dias vazios no início
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }

    return dias;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterChaveData = (dia: number) => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const data = new Date(ano, mes, dia);
    return formatarData(data);
  };

  const ehHoje = (dia: number) => {
    const hoje = new Date();
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    
    // Garantir que estamos comparando no timezone local
    const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const diaComparado = new Date(ano, mes, dia);
    
    return hojeLocal.getTime() === diaComparado.getTime();
  };

  const dias = obterDiasDoMes();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Calendário de Lucros
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarMes('anterior')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarMes('proximo')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Cabeçalho dos dias da semana */}
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center font-semibold text-sm p-2 text-muted-foreground">
              {dia}
            </div>
          ))}

          {/* Dias do calendário */}
          {dias.map((dia, index) => {
            if (dia === null) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const chaveData = obterChaveData(dia);
            const dados = dadosPorDia[chaveData];
            const isHoje = ehHoje(dia);

            return (
              <div
                key={`day-${dia}`}
                className={`
                  p-2 border rounded-lg min-h-[80px] flex flex-col justify-between
                  ${isHoje ? 'border-secondary bg-secondary/10' : 'border-border'}
                  ${(dados?.quantidadeOperacoes > 0 || dados?.totalFreebets > 0) ? 'bg-muted/50' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isHoje ? 'text-secondary font-bold' : ''}`}>
                    {dia}
                  </span>
                  {(dados?.quantidadeOperacoes > 0 || dados?.totalFreebets > 0) && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {dados.quantidadeOperacoes}
                    </Badge>
                  )}
                </div>

                {dados && (dados.quantidadeOperacoes > 0 || dados.totalFreebets > 0) && (
                  <div className="space-y-1">
                    {/* Lucro Líquido - só mostra se houver operações */}
                    {dados.quantidadeOperacoes > 0 && (
                      <div className="text-xs">
                        <span className={`font-semibold ${
                          dados.lucroLiquido >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatarMoeda(dados.lucroLiquido)}
                        </span>
                      </div>
                    )}

                    {/* Freebets - mostra sempre que houver */}
                    {dados.totalFreebets > 0 && (
                      <div className="text-xs">
                        <span style={{ color: 'oklch(0.6 0.25 240)' }} className="font-semibold">
                          FB: {formatarMoeda(dados.totalFreebets)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Lucro Positivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Prejuízo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'oklch(0.6 0.25 240)' }}></div>
            <span>Freebets (FB)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-secondary rounded"></div>
            <span>Hoje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
