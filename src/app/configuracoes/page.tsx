'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings, DollarSign, Target, HardDrive, Trash2, Database, TrendingUp, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BackupRestoreModal } from '@/components/backup-restore-modal';
import { DataManagementModal } from '@/components/data-management-modal';
import { atualizarBancaAtual, obterBancaAtual, formatarMesAno } from '@/services/banca-mensal';

interface Configuracoes {
  exibirGestaoPunter: boolean;
  valorBanca: number;
  quantidadeUnidades: 20 | 50 | 100;
  bancaSurebet: number;
}

interface DadosPunter {
  valorUnidade: number;
  bancaAtual: number;
}

const CONFIGURACOES_KEY = 'planilha-arb-configuracoes';

const obterConfiguracoes = (): Configuracoes => {
  if (typeof window === 'undefined') {
    return { 
      exibirGestaoPunter: false,
      valorBanca: 0,
      quantidadeUnidades: 100,
      bancaSurebet: 0
    };
  }
  
  try {
    const configuracoes = localStorage.getItem(CONFIGURACOES_KEY);
    if (configuracoes) {
      const parsed = JSON.parse(configuracoes);
      return {
        exibirGestaoPunter: parsed.exibirGestaoPunter || false,
        valorBanca: parsed.valorBanca || 0,
        quantidadeUnidades: parsed.quantidadeUnidades || 100,
        bancaSurebet: parsed.bancaSurebet || 0
      };
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  
  return { 
    exibirGestaoPunter: false,
    valorBanca: 0,
    quantidadeUnidades: 100,
    bancaSurebet: 0
  };
};

const salvarConfiguracoes = (configuracoes: Configuracoes): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONFIGURACOES_KEY, JSON.stringify(configuracoes));
    window.dispatchEvent(new CustomEvent('configuracoesAtualizadas', { detail: configuracoes }));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
};

const calcularValorUnidade = (valorBanca: number, quantidadeUnidades: number): number => {
  if (valorBanca <= 0 || quantidadeUnidades <= 0) return 0;
  return valorBanca / quantidadeUnidades;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({ 
    exibirGestaoPunter: false,
    valorBanca: 0,
    quantidadeUnidades: 100,
    bancaSurebet: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [valorBancaInput, setValorBancaInput] = useState('');
  const [bancaSurebetInput, setBancaSurebetInput] = useState('');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  // Mês atual para exibição
  const mesAtualTexto = formatarMesAno(new Date().getFullYear(), new Date().getMonth());

  useEffect(() => {
    const configs = obterConfiguracoes();
    // Usar banca do serviço de banca mensal
    const bancaAtual = obterBancaAtual();
    
    setConfiguracoes({ ...configs, bancaSurebet: bancaAtual || configs.bancaSurebet });
    setValorBancaInput(configs.valorBanca > 0 ? configs.valorBanca.toString() : '');
    setBancaSurebetInput(bancaAtual > 0 ? bancaAtual.toString() : (configs.bancaSurebet > 0 ? configs.bancaSurebet.toString() : ''));
    setIsLoading(false);
  }, []);

  const handleToggleGestaoPunter = (checked: boolean) => {
    const novasConfiguracoes = { ...configuracoes, exibirGestaoPunter: checked };
    setConfiguracoes(novasConfiguracoes);
    salvarConfiguracoes(novasConfiguracoes);
  };

  const handleValorBancaChange = (value: string) => {
    setValorBancaInput(value);
    const valorNumerico = parseFloat(value.replace(',', '.')) || 0;
    const novasConfiguracoes = { ...configuracoes, valorBanca: valorNumerico };
    setConfiguracoes(novasConfiguracoes);
    salvarConfiguracoes(novasConfiguracoes);
  };

  const handleQuantidadeUnidadesChange = (value: string) => {
    const quantidade = parseInt(value) as 20 | 50 | 100;
    const novasConfiguracoes = { ...configuracoes, quantidadeUnidades: quantidade };
    setConfiguracoes(novasConfiguracoes);
    salvarConfiguracoes(novasConfiguracoes);
  };

  const handleBancaSurebetChange = (value: string) => {
    setBancaSurebetInput(value);
    const valorNumerico = parseFloat(value.replace(',', '.')) || 0;
    
    // Atualizar configurações locais
    const novasConfiguracoes = { ...configuracoes, bancaSurebet: valorNumerico };
    setConfiguracoes(novasConfiguracoes);
    salvarConfiguracoes(novasConfiguracoes);
    
    // Salvar no serviço de banca mensal (registra para o mês atual)
    atualizarBancaAtual(valorNumerico);
  };

  const valorUnidade = calcularValorUnidade(configuracoes.valorBanca, configuracoes.quantidadeUnidades);
  
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted animate-pulse rounded-lg"></div>
            <div className="w-48 h-8 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="w-full h-64 bg-muted animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Configurações</h1>
          </div>
        </div>

        {/* Banca Surebet Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Banca de Surebets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Defina o valor da sua banca para acompanhar a valorização/desvalorização mensal e a porcentagem de retorno sobre o capital investido.
            </p>

            {/* Indicador do mês */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Banca para: <span className="font-semibold text-blue-500">{mesAtualTexto}</span>
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="banca-surebet" className="text-sm font-medium">
                Valor da Banca (R$) - Opcional
              </Label>
              <Input
                id="banca-surebet"
                type="text"
                placeholder="Ex: 5000,00"
                value={bancaSurebetInput}
                onChange={(e) => handleBancaSurebetChange(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Este valor será registrado como a banca de {mesAtualTexto}. Meses anteriores mantêm seus próprios registros.
              </p>
            </div>

            {configuracoes.bancaSurebet > 0 && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Banca de {mesAtualTexto}:</span>
                  </div>
                  <span className="text-lg font-bold text-blue-500">
                    {formatarMoeda(configuracoes.bancaSurebet)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  As métricas de valorização serão exibidas no balanço financeiro do mês correspondente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gestão Punter */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="gestao-punter"
                  checked={configuracoes.exibirGestaoPunter}
                  onCheckedChange={handleToggleGestaoPunter}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1">
                  <label
                    htmlFor="gestao-punter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Exibir gestão da metodologia punter?
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ativa a funcionalidade de gestão profissional de apostas punter na tela inicial
                  </p>
                </div>
              </div>

              {/* Configurações da Banca - Só aparece se punter estiver ativo */}
              {configuracoes.exibirGestaoPunter && (
                <div className="space-y-4 pt-4 border-t border-muted">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Configuração da Banca Punter</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Valor da Banca */}
                    <div className="space-y-2">
                      <Label htmlFor="valor-banca" className="text-xs font-medium">
                        Valor da Banca (R$)
                      </Label>
                      <Input
                        id="valor-banca"
                        type="text"
                        placeholder="Ex: 1000,00"
                        value={valorBancaInput}
                        onChange={(e) => handleValorBancaChange(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Quantidade de Unidades */}
                    <div className="space-y-2">
                      <Label htmlFor="quantidade-unidades" className="text-xs font-medium">
                        Quantidade de Unidades
                      </Label>
                      <Select
                        value={configuracoes.quantidadeUnidades.toString()}
                        onValueChange={handleQuantidadeUnidadesChange}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20 unidades</SelectItem>
                          <SelectItem value="50">50 unidades</SelectItem>
                          <SelectItem value="100">100 unidades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Valor da Unidade Calculado */}
                  {configuracoes.valorBanca > 0 && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Valor da Unidade:</span>
                        </div>
                        <span className="text-sm font-bold text-blue-500">
                          {formatarMoeda(valorUnidade)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calculado: {formatarMoeda(configuracoes.valorBanca)} ÷ {configuracoes.quantidadeUnidades} unidades
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gerenciamento de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Gerenciamento de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setIsBackupOpen(true)}
                variant="outline"
                className="flex items-center gap-2 h-auto p-4"
              >
                <HardDrive className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Backup & Restore</div>
                  <div className="text-sm text-muted-foreground">Exportar e importar dados</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setIsDataManagementOpen(true)}
                variant="outline"
                className="flex items-center gap-2 h-auto p-4"
              >
                <Trash2 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Limpeza de Dados</div>
                  <div className="text-sm text-muted-foreground">Limpar dados seletivamente</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre as Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As configurações são salvas localmente no seu navegador. A banca de surebets é salva por mês, 
              permitindo acompanhar a evolução do seu capital ao longo do tempo.
            </p>
          </CardContent>
        </Card>

        {/* Modais */}
        <BackupRestoreModal 
          isOpen={isBackupOpen}
          onClose={() => setIsBackupOpen(false)}
        />
        
        <DataManagementModal 
          isOpen={isDataManagementOpen}
          onClose={() => setIsDataManagementOpen(false)}
        />
      </div>
    </div>
  );
}

// Função para exportar as configurações (para uso em outros componentes)
export { obterConfiguracoes, salvarConfiguracoes, calcularValorUnidade };
export type { Configuracoes, DadosPunter };
