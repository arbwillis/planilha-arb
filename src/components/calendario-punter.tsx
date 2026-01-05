'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { obterApostasPunter, type ApostaPunter } from '@/services/punter-storage';
import { obterConfiguracoes, calcularValorUnidade } from '@/app/configuracoes/page';
import { obterDadosDoMesPunter, salvarDadosMensaisPunter, mesFinalizado, type DadosMensaisPunter } from '@/services/punter-mensal';

interface DadosDiaPunter {
  lucro: number;
  apostas: number;
  unidades: number;
}

interface ResumoMesPunter {
  totalApostas: number;
  apostasGanhas: number;
  apostasPerdidas: number;
  taxaAcerto: number;
  lucroTotal: number;
  roi: number;
  unidadesTotais: number;
}

export function CalendarioPunter() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dadosDoMes, setDadosDoMes] = useState<Record<string, DadosDiaPunter>>({});
  const [resumoMes, setResumoMes] = useState<ResumoMesPunter | null>(null);
  const [dadosSalvos, setDadosSalvos] = useState<DadosMensaisPunter | null>(null);
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
      
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth();
      const mesAno = `${ano}-${String(mes + 1).padStart(2, '0')}`;
      
      // Verificar se há dados salvos para este mês
      const dadosMesSalvo = obterDadosDoMesPunter(ano, mes);
      setDadosSalvos(dadosMesSalvo);
      
      // Filtrar apostas do mês com validação de data
      const apostasDoMes = apostas.filter((aposta: ApostaPunter) => {
        try {
          if (!aposta.data || typeof aposta.data !== 'string') {
            return false;
          }
          return aposta.data.startsWith(mesAno);
        } catch (error) {
          return false;
        }
      });
      
      // Agrupar por dia com validação de dados
      const dadosPorDia: Record<string, DadosDiaPunter> = {};
      let lucroTotal = 0;
      let apostasGanhas = 0;
      let apostasPerdidas = 0;
      let unidadesTotais = 0;
      let valorTotalApostado = 0;
      
      apostasDoMes.forEach((aposta: ApostaPunter) => {
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
          lucroTotal += lucroPerda;
          
          // Validar unidades
          const unidades = typeof aposta.unidades === 'number' && !isNaN(aposta.unidades) 
            ? aposta.unidades 
            : 0;
          dadosPorDia[dia].unidades += unidades;
          unidadesTotais += unidades;
          
          // Contar resultados
          if (aposta.resultado === 'ganhou') apostasGanhas++;
          if (aposta.resultado === 'perdeu') apostasPerdidas++;
          
          // Valor apostado
          valorTotalApostado += aposta.valorAposta || 0;
        } catch (error) {
          console.error('Erro ao processar aposta:', error);
        }
      });
      
      // Calcular resumo do mês
      const totalApostas = apostasDoMes.length;
      const taxaAcerto = (apostasGanhas + apostasPerdidas) > 0 
        ? (apostasGanhas / (apostasGanhas + apostasPerdidas)) * 100 
        : 0;
      const roi = valorTotalApostado > 0 ? (lucroTotal / valorTotalApostado) * 100 : 0;
      
      const resumo: ResumoMesPunter = {
        totalApostas,
        apostasGanhas,
        apostasPerdidas,
        taxaAcerto: Math.round(taxaAcerto * 100) / 100,
        lucroTotal,
        roi: Math.round(roi * 100) / 100,
        unidadesTotais: Math.round(unidadesTotais * 100) / 100
      };
      
      setResumoMes(resumo);
      setDadosDoMes(dadosPorDia);
      
      // Se o mês já passou e não há dados salvos, salvar automaticamente
      if (mesFinalizado(ano, mes) && !dadosMesSalvo && totalApostas > 0) {
        const unidadesPositivasNegativas = valorUnidade > 0 ? lucroTotal / valorUnidade : 0;
        
        salvarDadosMensaisPunter({
          mesAno,
          bancaInicial: configs.valorBanca,
          bancaFinal: configs.valorBanca + lucroTotal,
          lucroTotal,
          totalApostas,
          apostasGanhas,
          apostasPerdidas,
          taxaAcerto: Math.round(taxaAcerto * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          unidadesTotaisApostadas: Math.round(unidadesTotais * 100) / 100,
          unidadesPositivasNegativas: Math.round(unidadesPositivasNegativas * 100) / 100
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao calcular dados do mês punter:', error);
      setDadosDoMes({});
      setResumoMes(null);
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

  // Usar dados salvos para meses finalizados, ou resumo atual para mês corrente
  const dadosParaExibir = dadosSalvos || (resumoMes ? {
    totalApostas: resumoMes.totalApostas,
    apostasGanhas: resumoMes.apostasGanhas,
    apostasPerdidas: resumoMes.apostasPerdidas,
    taxaAcerto: resumoMes.taxaAcerto,
    lucroTotal: resumoMes.lucroTotal,
    roi: resumoMes.roi,
    unidadesTotaisApostadas: resumoMes.unidadesTotais
  } : null);

  const formatarPercentual = (valor: number) => {
    const sinal = valor >= 0 ? '+' : '';
    return `${sinal}${valor.toFixed(2)}%`;
  };

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
      <CardContent className="space-y-6">
        {/* Resumo Mensal */}
        {dadosParaExibir && dadosParaExibir.totalApostas > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <h4 className="font-semibold text-center">
                Resumo de {obterNomeMes(mesAtual)}
                {dadosSalvos && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Salvo
                  </Badge>
                )}
              </h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Lucro Total */}
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {dadosParaExibir.lucroTotal >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Lucro Total</p>
                <p className={`text-lg font-bold ${dadosParaExibir.lucroTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatarMoeda(dadosParaExibir.lucroTotal)}
                </p>
              </div>
              
              {/* ROI */}
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className={`text-lg font-bold ${dadosParaExibir.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatarPercentual(dadosParaExibir.roi)}
                </p>
              </div>
              
              {/* Taxa de Acerto */}
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Taxa de Acerto</p>
                <p className="text-lg font-bold">
                  {dadosParaExibir.taxaAcerto.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {dadosParaExibir.apostasGanhas}W / {dadosParaExibir.apostasPerdidas}L
                </p>
              </div>
              
              {/* Total de Apostas */}
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Apostas</p>
                <p className="text-lg font-bold">
                  {dadosParaExibir.totalApostas}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dadosParaExibir.unidadesTotaisApostadas?.toFixed(1) || resumoMes?.unidadesTotais.toFixed(1)} un.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Calendário */}
        {renderizarCalendario()}
      </CardContent>
    </Card>
  );
}
