'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, TrendingUp, DollarSign, BarChart3, Plus, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { obterConfiguracoes, calcularValorUnidade, type Configuracoes } from '@/app/configuracoes/page';
import { calcularEstatisticasPunter, obterApostasPunter, excluirApostaPunter, atualizarResultadoAposta, type EstatisticasPunter, type ApostaPunter } from '@/services/punter-storage';
import { RegistrarApostaPunterModal } from '@/components/modals/registrar-aposta-punter-modal';
import { CalendarioPunter } from '@/components/calendario-punter';

// Estado consolidado para dados punter
interface DadosPunter {
  configuracoes: Configuracoes;
  estatisticas: EstatisticasPunter;
  apostas: ApostaPunter[];
  isLoading: boolean;
}

const estadoInicialPunter: DadosPunter = {
  configuracoes: {
    exibirGestaoPunter: false,
    valorBanca: 0,
    quantidadeUnidades: 100
  },
  estatisticas: {
    totalApostas: 0,
    apostasGanhas: 0,
    apostasPerdidas: 0,
    apostasPendentes: 0,
    taxaAcerto: 0,
    lucroTotal: 0,
    unidadesTotaisApostadas: 0,
    roi: 0,
    unidadesPositivasNegativas: 0
  },
  apostas: [],
  isLoading: true
};

export default function GestaoPunterPage() {
  const router = useRouter();
  const [isModalApostaOpen, setIsModalApostaOpen] = useState(false);
  const [dadosPunter, setDadosPunter] = useState<DadosPunter>(estadoInicialPunter);

  // Funções de formatação memoizadas
  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  const formatarPercentual = useCallback((valor: number) => {
    const sinal = valor >= 0 ? '+' : '';
    return `${sinal}${valor.toFixed(2)}%`;
  }, []);

  // Função consolidada para carregar todos os dados
  const carregarDados = useCallback(() => {
    try {
      const configs = obterConfiguracoes();
      const apostasData = obterApostasPunter();
      const valorUnidadeCalc = calcularValorUnidade(configs.valorBanca, configs.quantidadeUnidades);
      const stats = calcularEstatisticasPunter(configs.valorBanca, valorUnidadeCalc);
      
      setDadosPunter({
        configuracoes: configs,
        estatisticas: stats,
        apostas: apostasData,
        isLoading: false
      });
    } catch (error) {
      console.error('Erro ao carregar dados punter:', error);
      setDadosPunter(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    carregarDados();

    // Escutar eventos de mudanças nos dados
    const handleDataChange = () => {
      carregarDados();
    };

    const handleApostaExcluida = () => {
      carregarDados();
    };

    window.addEventListener('apostaPunterSalva', handleDataChange);
    window.addEventListener('apostaPunterAtualizada', handleDataChange);
    window.addEventListener('apostaPunterExcluida', handleApostaExcluida);
    window.addEventListener('configuracoesAtualizadas', handleDataChange);

    return () => {
      window.removeEventListener('apostaPunterSalva', handleDataChange);
      window.removeEventListener('apostaPunterAtualizada', handleDataChange);
      window.removeEventListener('apostaPunterExcluida', handleApostaExcluida);
      window.removeEventListener('configuracoesAtualizadas', handleDataChange);
    };
  }, [carregarDados]);

  // Valores calculados memoizados
  const valorUnidade = useMemo(() => 
    calcularValorUnidade(dadosPunter.configuracoes.valorBanca, dadosPunter.configuracoes.quantidadeUnidades),
    [dadosPunter.configuracoes.valorBanca, dadosPunter.configuracoes.quantidadeUnidades]
  );

  const bancaAtual = useMemo(() => 
    dadosPunter.configuracoes.valorBanca + dadosPunter.estatisticas.lucroTotal,
    [dadosPunter.configuracoes.valorBanca, dadosPunter.estatisticas.lucroTotal]
  );

  const variacao = useMemo(() => 
    dadosPunter.configuracoes.valorBanca > 0 
      ? ((bancaAtual - dadosPunter.configuracoes.valorBanca) / dadosPunter.configuracoes.valorBanca) * 100 
      : 0,
    [bancaAtual, dadosPunter.configuracoes.valorBanca]
  );

  // Funções otimizadas para gerenciar apostas
  const handleExcluirAposta = useCallback((apostaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aposta?')) return;
    
    try {
      // Feedback visual imediato
      setDadosPunter(prev => ({
        ...prev,
        apostas: prev.apostas.filter(a => a.id !== apostaId)
      }));
      
      excluirApostaPunter(apostaId);
      setTimeout(carregarDados, 100);
    } catch (error) {
      console.error('❌ Erro ao excluir aposta:', error);
      alert('Erro ao excluir aposta. Tente novamente.');
      carregarDados();
    }
  }, [carregarDados]);

  const handleMarcarResultado = useCallback((aposta: ApostaPunter, resultado: 'ganhou' | 'perdeu') => {
    try {
      const lucroPerda = resultado === 'ganhou' 
        ? (aposta.odd - 1) * aposta.valorAposta 
        : -aposta.valorAposta;
      
      // Feedback visual imediato
      setDadosPunter(prev => ({
        ...prev,
        apostas: prev.apostas.map(a => 
          a.id === aposta.id ? { ...a, resultado, lucroPerda } : a
        )
      }));
      
      atualizarResultadoAposta(aposta.id, resultado, lucroPerda);
      setTimeout(carregarDados, 100);
    } catch (error) {
      console.error(`❌ Erro ao marcar como ${resultado}:`, error);
      carregarDados();
    }
  }, [carregarDados]);

  // Componente de badge memoizado
  const getStatusBadge = useCallback((resultado?: 'ganhou' | 'perdeu' | 'pendente') => {
    const badgeProps = {
      ganhou: { 
        className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        icon: CheckCircle,
        text: "Green"
      },
      perdeu: { 
        className: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
        icon: XCircle,
        text: "Red"
      },
      pendente: { 
        className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
        icon: Clock,
        text: "Pendente"
      }
    };

    const props = badgeProps[resultado || 'pendente'];
    const Icon = props.icon;

    return (
      <Badge className={props.className}>
        <Icon className="h-3 w-3 mr-1" />
        {props.text}
      </Badge>
    );
  }, []);

  if (dadosPunter.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted animate-pulse rounded-lg"></div>
            <div className="w-48 sm:w-64 h-6 sm:h-8 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-48 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
          <div className="mb-6 sm:mb-8">
            <div className="w-full h-64 bg-muted animate-pulse rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="w-full h-64 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Verificar se a banca está configurada
  if (dadosPunter.configuracoes.valorBanca <= 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestão de Punter</h1>
            </div>
          </div>

          {/* Aviso de Configuração */}
          <Card className="border-dashed border-2 border-yellow-500/50">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center space-y-4">
                <Target className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mx-auto" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Configuração Necessária</h3>
                  <p className="text-sm text-muted-foreground mb-4 px-2">
                    Para utilizar a gestão de punter, você precisa configurar o valor da sua banca 
                    e a quantidade de unidades nas configurações.
                  </p>
                  <Button 
                    onClick={() => router.push('/configuracoes')}
                    className="gap-2"
                    size="sm"
                  >
                    <Target className="h-4 w-4" />
                    Ir para Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestão de Punter</h1>
          </div>
        </div>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Bankroll */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Bankroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-2">Bankroll Atual</p>
                <p className={`text-lg sm:text-2xl font-bold ${bancaAtual >= dadosPunter.configuracoes.valorBanca ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatarMoeda(bancaAtual)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground mb-1">Inicial</p>
                  <p className="font-semibold text-sm">{formatarMoeda(dadosPunter.configuracoes.valorBanca)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground mb-1">Lucro Total</p>
                  <p className={`font-semibold text-sm ${dadosPunter.estatisticas.lucroTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatarMoeda(dadosPunter.estatisticas.lucroTotal)}
                  </p>
                </div>
              </div>
              {valorUnidade > 0 && (
                <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Valor da Unidade</p>
                  <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">{formatarMoeda(valorUnidade)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">ROI</p>
                  <p className={`text-sm sm:text-lg font-bold ${dadosPunter.estatisticas.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatarPercentual(dadosPunter.estatisticas.roi)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Unidades +/-</p>
                  <p className={`text-sm sm:text-lg font-bold ${dadosPunter.estatisticas.unidadesPositivasNegativas >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {dadosPunter.estatisticas.unidadesPositivasNegativas >= 0 ? '+' : ''}{dadosPunter.estatisticas.unidadesPositivasNegativas.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">Taxa de Acerto</p>
                <p className="text-lg font-bold">{dadosPunter.estatisticas.taxaAcerto.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-2 px-1 border-b border-muted/50">
                <span className="text-xs sm:text-sm text-muted-foreground">Total</span>
                <span className="font-semibold text-sm">{dadosPunter.estatisticas.totalApostas}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-1 border-b border-muted/50">
                <span className="text-xs sm:text-sm text-muted-foreground">Ganhas</span>
                <span className="font-semibold text-sm text-emerald-500">{dadosPunter.estatisticas.apostasGanhas}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-1 border-b border-muted/50">
                <span className="text-xs sm:text-sm text-muted-foreground">Perdidas</span>
                <span className="font-semibold text-sm text-red-500">{dadosPunter.estatisticas.apostasPerdidas}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Pendentes</span>
                <span className="font-semibold text-sm text-yellow-500">{dadosPunter.estatisticas.apostasPendentes}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendário Punter */}
        <div className="mb-6 sm:mb-8">
          <CalendarioPunter />
        </div>

        {/* Seção de Apostas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Registrar Nova Aposta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Registrar Nova Aposta</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-center py-3">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Registre suas apostas para acompanhar performance
                </p>
                <Button 
                  onClick={() => setIsModalApostaOpen(true)}
                  className="gap-2 w-full sm:w-auto"
                  size="default"
                >
                  <Plus className="h-4 w-4" />
                  Nova Aposta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Apostas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <span>Histórico de Apostas</span>
                <Badge variant="secondary" className="text-xs">{dadosPunter.apostas.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosPunter.apostas.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm text-muted-foreground mb-4 px-2">
                    Nenhuma aposta registrada ainda
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalApostaOpen(true)}
                    className="gap-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Registrar Primeira Aposta
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
                  {dadosPunter.apostas.map((aposta) => (
                    <div
                      key={aposta.id}
                      className="p-3 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      {/* Header da Aposta */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate text-foreground">
                            {aposta.evento}
                          </h4>
                          {getStatusBadge(aposta.resultado)}
                        </div>
                        
                        {/* Botões de Ação */}
                        <div className="flex gap-1 shrink-0 ml-2">
                          {aposta.resultado === 'pendente' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarcarResultado(aposta, 'ganhou')}
                                className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                title="Marcar como Green (Ganhou)"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarcarResultado(aposta, 'perdeu')}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                title="Marcar como Red (Perdeu)"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExcluirAposta(aposta.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Excluir Aposta"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Mercado */}
                      <p className="text-xs text-muted-foreground mb-3 truncate">
                        {aposta.mercado}
                      </p>

                      {/* Informações da Aposta */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-muted-foreground">Odd:</span>
                          <span className="font-medium text-foreground">{aposta.odd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-muted-foreground">Unidades:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {typeof aposta.unidades === 'number' ? aposta.unidades.toFixed(2) : aposta.unidades}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium text-foreground">{formatarMoeda(aposta.valorAposta)}</span>
                        </div>
                        {aposta.lucroPerda !== undefined && (
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-muted-foreground">Resultado:</span>
                            <span className={`font-semibold ${aposta.lucroPerda >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {aposta.lucroPerda >= 0 ? '+' : ''}{formatarMoeda(aposta.lucroPerda)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Data da Aposta */}
                      <div className="mt-2 pt-2 border-t border-muted/30">
                        <span className="text-xs text-muted-foreground">
                          {new Date(aposta.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="border-dashed border-2 border-muted/50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Sistema de Gestão Punter</h3>
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                Sistema completo para gerenciamento profissional de apostas com controle de bankroll, 
                estatísticas detalhadas e análise de performance em tempo real.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Registro de Aposta */}
        <RegistrarApostaPunterModal
          isOpen={isModalApostaOpen}
          onClose={() => setIsModalApostaOpen(false)}
          valorUnidade={valorUnidade}
        />
      </div>
    </div>
  );
}

