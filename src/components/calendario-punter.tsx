'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { obterApostasPunter } from '@/services/punter-storage';
import { obterConfiguracoes, calcularValorUnidade } from '@/app/configuracoes/page';

interface DadosDiaPunter {
  lucro: number;
  apostas: number;
  unidades: number;
}

export function CalendarioPunter() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dadosDoMes, setDadosDoMes] = useState<Record<string, DadosDiaPunter>>({});
  const [isLoading, setIsLoading] = useState(true);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterNomeMes = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const obterPrimeiroDiaDoMes = (data: Date) => {
    return new Date(data.getFullYear(), data.getMonth(), 1);
  };

  const obterUltimoDiaDoMes = (data: Date) => {
    return new Date(data.getFullYear(), data.getMonth() + 1, 0);
  };

  const obterDiaDaSemana = (data: Date) => {
    const dia = data.getDay();
    return dia === 0 ? 6 : dia - 1; // Converter domingo (0) para 6, segunda (1) para 0, etc.
  };

  const formatarDataISO = (data: Date) => {
    return data.toISOString().split('T')[0];
  };

  const calcularDadosDoMes = useCallback(() => {
    try {
      const apostas = obterApostasPunter();
      const configs = obterConfiguracoes();
      const valorUnidade = calcularValorUnidade(configs.valorBanca, configs.quantidadeUnidades);
      
      const mesAno = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
      
      // Filtrar apostas do mês com validação de data
      const apostasDoMes = apostas.filter(aposta => {
        try {
          if (!aposta.data || typeof aposta.data !== 'string') {
            console.warn('Data de aposta inválida:', aposta);
            return false;
          }
          return aposta.data.startsWith(mesAno);
        } catch (error) {
          console.error('Erro ao filtrar aposta por data:', error);
          return false;
        }
      });
      
      // Agrupar por dia com validação de dados
      const dadosPorDia: Record<string, DadosDiaPunter> = {};
      
      apostasDoMes.forEach(aposta => {
        try {
          const dia = aposta.data;
          if (!dadosPorDia[dia]) {
            dadosPorDia[dia] = { lucro: 0, apostas: 0, unidades: 0 };
          }
          
          dadosPorDia[dia].apostas++;
          
          // Validar lucroPerda
          const lucroPerda = typeof aposta.lucroPerda === 'number' && !isNaN(aposta.lucroPerda) 
            ? aposta.lucroPerda 
            : 0;
          dadosPorDia[dia].lucro += lucroPerda;
          
          // Validar unidades
          const unidades = typeof aposta.unidades === 'number' && !isNaN(aposta.unidades) 
            ? aposta.unidades 
            : 0;
          dadosPorDia[dia].unidades += unidades;
        } catch (error) {
          console.error('Erro ao processar aposta:', error);
        }
      });

      setDadosDoMes(dadosPorDia);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao calcular dados do mês punter:', error);
      setDadosDoMes({});
      setIsLoading(false);
    }
  }, [mesAtual]);

  useEffect(() => {
    calcularDadosDoMes();

    // Escutar eventos de mudanças
    const handleDataChange = () => {
      calcularDadosDoMes();
    };

    window.addEventListener('apostaPunterSalva', handleDataChange);
    window.addEventListener('apostaPunterAtualizada', handleDataChange);
    window.addEventListener('apostaPunterExcluida', handleDataChange);

    return () => {
      window.removeEventListener('apostaPunterSalva', handleDataChange);
      window.removeEventListener('apostaPunterAtualizada', handleDataChange);
      window.removeEventListener('apostaPunterExcluida', handleDataChange);
    };
  }, [calcularDadosDoMes]);

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    setMesAtual(prev => {
      const novoMes = new Date(prev);
      if (direcao === 'anterior') {
        novoMes.setMonth(prev.getMonth() - 1);
      } else {
        novoMes.setMonth(prev.getMonth() + 1);
      }
      return novoMes;
    });
  };

  const renderizarCalendario = () => {
    const primeiroDia = obterPrimeiroDiaDoMes(mesAtual);
    const ultimoDia = obterUltimoDiaDoMes(mesAtual);
    const diasParaMostrar = [];

    // Adicionar dias vazios do início
    const diasVaziosInicio = obterDiaDaSemana(primeiroDia);
    for (let i = 0; i < diasVaziosInicio; i++) {
      diasParaMostrar.push(null);
    }

    // Adicionar dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      diasParaMostrar.push(dia);
    }

    const hoje = new Date();
    const ehMesAtual = mesAtual.getMonth() === hoje.getMonth() && mesAtual.getFullYear() === hoje.getFullYear();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalho dos dias da semana */}
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(dia => (
          <div key={dia} className="text-center text-xs font-medium text-muted-foreground p-2">
            {dia}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {diasParaMostrar.map((dia, index) => {
          if (dia === null) {
            return <div key={index} className="p-1"></div>;
          }

          const dataCompleta = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
          const dataISO = formatarDataISO(dataCompleta);
          const dados = dadosDoMes[dataISO];
          const ehHoje = ehMesAtual && dia === hoje.getDate();

          return (
            <div
              key={dia}
              className={`
                p-1 text-center text-xs border rounded
                ${ehHoje ? 'bg-primary text-primary-foreground font-bold' : 'bg-background'}
                ${dados ? 'border-blue-200 dark:border-blue-800' : 'border-muted'}
              `}
            >
              <div className="font-medium">{dia}</div>
              {dados && (
                <div className="mt-1 space-y-0.5">
                  <div className={`text-xs font-semibold ${dados.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatarMoeda(dados.lucro)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dados.apostas} apostas
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="w-48 h-6 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg">Calendário Punter</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarMes('anterior')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center capitalize">
              {obterNomeMes(mesAtual)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarMes('proximo')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderizarCalendario()}
      </CardContent>
    </Card>
  );
}
