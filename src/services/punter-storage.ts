// Serviços de armazenamento para dados da metodologia punter

export interface ApostaPunter {
  id: string;
  data: string; // formato: YYYY-MM-DD
  dataHora: string; // formato: YYYY-MM-DD HH:mm:ss
  evento: string;
  mercado: string;
  odd: number;
  unidades: number; // quantidade de unidades apostadas
  valorAposta: number; // valor em reais (unidades * valor da unidade)
  resultado?: 'ganhou' | 'perdeu' | 'pendente';
  lucroPerda?: number; // lucro ou perda em reais
  observacoes?: string;
}

export interface EstatisticasPunter {
  totalApostas: number;
  apostasGanhas: number;
  apostasPerdidas: number;
  apostasPendentes: number;
  taxaAcerto: number; // percentual
  lucroTotal: number;
  unidadesTotaisApostadas: number;
  roi: number; // percentual
  unidadesPositivasNegativas: number; // unidades ganhas ou perdidas
}

export interface Configuracoes {
  exibirGestaoPunter: boolean;
  valorBanca: number;
  quantidadeUnidades: 20 | 50 | 100;
}

const STORAGE_KEYS = {
  APOSTAS_PUNTER: 'planilha-arb-apostas-punter',
  CONFIGURACOES: 'planilha-arb-configuracoes'
};

// Função para gerar ID único
export const gerarIdAposta = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função para formatar data no padrão brasileiro
export const formatarDataBR = (data: Date): string => {
  return data.toLocaleDateString('pt-BR');
};

// Função para obter data atual no formato YYYY-MM-DD
export const obterDataAtualISO = (): string => {
  const agora = new Date();
  return agora.toISOString().split('T')[0];
};

// Função para obter data e hora atual
export const obterDataHoraAtual = (): string => {
  const agora = new Date();
  return agora.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1 $4:$5:$6');
};

// Obter todas as apostas punter
export const obterApostasPunter = (): ApostaPunter[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const apostas = localStorage.getItem(STORAGE_KEYS.APOSTAS_PUNTER);
    if (apostas) {
      return JSON.parse(apostas);
    }
  } catch (error) {
    console.error('Erro ao carregar apostas punter:', error);
  }
  
  return [];
};

// Salvar aposta punter
// Função para salvar array completo de apostas (para backup/restore)
export const salvarApostasPunter = (apostas: ApostaPunter[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APOSTAS_PUNTER, JSON.stringify(apostas));
  } catch (error) {
    console.error('Erro ao salvar apostas punter:', error);
    throw new Error('Falha ao salvar apostas punter no localStorage');
  }
};

export const salvarApostaPunter = (aposta: Omit<ApostaPunter, 'id' | 'data' | 'dataHora'>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const apostas = obterApostasPunter();
    const novaAposta: ApostaPunter = {
      ...aposta,
      id: gerarIdAposta(),
      data: obterDataAtualISO(),
      dataHora: obterDataHoraAtual(),
      resultado: aposta.resultado || 'pendente'
    };
    
    apostas.push(novaAposta);
    localStorage.setItem(STORAGE_KEYS.APOSTAS_PUNTER, JSON.stringify(apostas));
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new CustomEvent('apostaPunterSalva', { detail: novaAposta }));
    
    console.log('✅ Aposta punter salva:', novaAposta);
  } catch (error) {
    console.error('Erro ao salvar aposta punter:', error);
  }
};

// Atualizar resultado de uma aposta
export const atualizarResultadoAposta = (
  apostaId: string, 
  resultado: 'ganhou' | 'perdeu', 
  lucroPerda: number
): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const apostas = obterApostasPunter();
    const apostaIndex = apostas.findIndex(a => a.id === apostaId);
    
    if (apostaIndex !== -1) {
      apostas[apostaIndex].resultado = resultado;
      apostas[apostaIndex].lucroPerda = lucroPerda;
      
      localStorage.setItem(STORAGE_KEYS.APOSTAS_PUNTER, JSON.stringify(apostas));
      
      // Disparar evento para atualizar componentes
      window.dispatchEvent(new CustomEvent('apostaPunterAtualizada', { 
        detail: apostas[apostaIndex] 
      }));
      
      console.log('✅ Resultado da aposta atualizado:', apostas[apostaIndex]);
    }
  } catch (error) {
    console.error('Erro ao atualizar resultado da aposta:', error);
  }
};

// Excluir aposta punter
export const excluirApostaPunter = (apostaId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const apostas = obterApostasPunter();
    
    const apostaParaExcluir = apostas.find(a => a.id === apostaId);
    if (!apostaParaExcluir) {
      console.warn('⚠️ Aposta não encontrada para exclusão:', apostaId);
      return;
    }
    
    const apostasAtualizadas = apostas.filter(a => a.id !== apostaId);
    localStorage.setItem(STORAGE_KEYS.APOSTAS_PUNTER, JSON.stringify(apostasAtualizadas));
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new CustomEvent('apostaPunterExcluida', { detail: { apostaId, aposta: apostaParaExcluir } }));
    
    console.log('🗑️ Aposta punter excluída:', apostaId);
  } catch (error) {
    console.error('❌ Erro ao excluir aposta punter:', error);
    throw error;
  }
};

// Calcular estatísticas punter
export const calcularEstatisticasPunter = (valorBanca: number, valorUnidade: number): EstatisticasPunter => {
  const apostas = obterApostasPunter();
  
  const totalApostas = apostas.length;
  const apostasGanhas = apostas.filter(a => a.resultado === 'ganhou').length;
  const apostasPerdidas = apostas.filter(a => a.resultado === 'perdeu').length;
  const apostasPendentes = apostas.filter(a => a.resultado === 'pendente').length;
  
  const taxaAcerto = totalApostas > 0 ? (apostasGanhas / (apostasGanhas + apostasPerdidas)) * 100 : 0;
  
  const lucroTotal = apostas.reduce((total, aposta) => {
    if (aposta.lucroPerda !== undefined) {
      return total + aposta.lucroPerda;
    }
    return total;
  }, 0);
  
  const unidadesTotaisApostadas = apostas.reduce((total, aposta) => total + aposta.unidades, 0);
  
  const valorTotalApostado = apostas.reduce((total, aposta) => total + aposta.valorAposta, 0);
  const roi = valorTotalApostado > 0 ? (lucroTotal / valorTotalApostado) * 100 : 0;
  
  // Calcular unidades positivas/negativas baseado no lucro total e valor da unidade
  const unidadesPositivasNegativas = valorUnidade > 0 ? lucroTotal / valorUnidade : 0;
  
  return {
    totalApostas,
    apostasGanhas,
    apostasPerdidas,
    apostasPendentes,
    taxaAcerto: Math.round(taxaAcerto * 100) / 100,
    lucroTotal,
    unidadesTotaisApostadas,
    roi: Math.round(roi * 100) / 100,
    unidadesPositivasNegativas: Math.round(unidadesPositivasNegativas * 100) / 100
  };
};

// Obter apostas por período
export const obterApostasPorPeriodo = (dataInicio: string, dataFim: string): ApostaPunter[] => {
  const apostas = obterApostasPunter();
  return apostas.filter(aposta => aposta.data >= dataInicio && aposta.data <= dataFim);
};

// Limpar todos os dados punter (para desenvolvimento)
export const limparDadosPunter = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.APOSTAS_PUNTER);
    window.dispatchEvent(new CustomEvent('dadosPunterLimpos'));
    console.log('🧹 Dados punter limpos');
  } catch (error) {
    console.error('Erro ao limpar dados punter:', error);
  }
};

// Funções para configurações
export const obterConfiguracoes = (): Configuracoes => {
  if (typeof window === 'undefined') {
    return { 
      exibirGestaoPunter: false,
      valorBanca: 0,
      quantidadeUnidades: 100
    };
  }
  
  try {
    const configuracoes = localStorage.getItem(STORAGE_KEYS.CONFIGURACOES);
    if (configuracoes) {
      const parsed = JSON.parse(configuracoes);
      return {
        exibirGestaoPunter: parsed.exibirGestaoPunter || false,
        valorBanca: parsed.valorBanca || 0,
        quantidadeUnidades: parsed.quantidadeUnidades || 100
      };
    }
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
  }
  
  return { 
    exibirGestaoPunter: false,
    valorBanca: 0,
    quantidadeUnidades: 100
  };
};

export const salvarConfiguracoes = (configuracoes: Configuracoes): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIGURACOES, JSON.stringify(configuracoes));
    window.dispatchEvent(new CustomEvent('configuracoesAtualizadas', { detail: configuracoes }));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
};

export const calcularValorUnidade = (valorBanca: number, quantidadeUnidades: number): number => {
  if (valorBanca <= 0 || quantidadeUnidades <= 0) return 0;
  return valorBanca / quantidadeUnidades;
};
