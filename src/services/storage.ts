import { Operacao, Freebet, ExtracaoFreebet } from '@/types';

// Chaves consistentes para localStorage com versionamento para persistência
const STORAGE_KEYS = {
  OPERACOES: 'planilha-arb-operacoes-v2',
  FREEBETS: 'planilha-arb-freebets-v2',
  EXTRACOES: 'planilha-arb-extracoes-v2',
  NOTAS: 'planilha-arb-notas-v2',
};

// Chaves antigas para migração (se necessário)
const LEGACY_KEYS = {
  OPERACOES: 'planilha-arb-operacoes',
  FREEBETS: 'planilha-arb-freebets',
  EXTRACOES: 'planilha-arb-extracoes',
  NOTAS: 'planilha-arb-notas',
};

// Outras chaves possíveis que podem existir
const OTHER_POSSIBLE_KEYS = [
  'betting-app-freebets',
  'freebets',
  'planilha-arb-apostas-freebets'
];

// Função para migrar dados de chaves antigas
const migrarFreebetsSeNecessario = (): void => {
  if (typeof window === 'undefined') return;
  
  const dadosAtuais = localStorage.getItem(STORAGE_KEYS.FREEBETS);
  if (dadosAtuais) return;
  
  const todasChaves = [LEGACY_KEYS.FREEBETS, ...OTHER_POSSIBLE_KEYS];
  
  for (const chave of todasChaves) {
    const dados = localStorage.getItem(chave);
    if (dados) {
      try {
        const freebets = JSON.parse(dados);
        if (Array.isArray(freebets) && freebets.length > 0) {
          localStorage.setItem(STORAGE_KEYS.FREEBETS, dados);
          return;
        }
      } catch {
        // Ignorar erros de parse
      }
    }
  }
};

// Operações
export const salvarOperacoes = (operacoes: Operacao[]): void => {
  try {
    const dataWithTimestamp = {
      data: operacoes,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    localStorage.setItem(STORAGE_KEYS.OPERACOES, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.error('Erro ao salvar operações:', error);
    throw new Error('Falha ao salvar operações no localStorage');
  }
};

export const salvarOperacao = (operacao: Operacao): void => {
  const operacoes = obterOperacoes();
  operacoes.push(operacao);
  localStorage.setItem(STORAGE_KEYS.OPERACOES, JSON.stringify(operacoes));
};

export const obterOperacoes = (): Operacao[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.OPERACOES);
    if (dados) {
      const parsed = JSON.parse(dados);
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    
    const dadosLegados = localStorage.getItem(LEGACY_KEYS.OPERACOES);
    if (dadosLegados) {
      const operacoes = JSON.parse(dadosLegados);
      salvarOperacoes(operacoes);
      localStorage.removeItem(LEGACY_KEYS.OPERACOES);
      return operacoes;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao carregar operações:', error);
    return [];
  }
};

export const obterOperacoesPorMes = (ano: number, mes: number): Operacao[] => {
  const operacoes = obterOperacoes();
  return operacoes.filter(op => {
    const dataOp = new Date(op.data);
    return dataOp.getFullYear() === ano && dataOp.getMonth() === mes;
  });
};

// Atualizar valor de uma operação
export const atualizarOperacao = (operacaoId: string, novoValor: number): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const operacoes = obterOperacoes();
    const index = operacoes.findIndex(op => op.id === operacaoId);
    
    if (index === -1) return false;
    
    operacoes[index].valor = novoValor;
    
    const dataWithTimestamp = {
      data: operacoes,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    localStorage.setItem('planilha-arb-operacoes-v2', JSON.stringify(dataWithTimestamp));
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar operação:', error);
    return false;
  }
};

// Excluir uma operação
export const excluirOperacao = (operacaoId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const operacoes = obterOperacoes();
    const operacoesAtualizadas = operacoes.filter(op => op.id !== operacaoId);
    
    if (operacoesAtualizadas.length === operacoes.length) return false;
    
    const dataWithTimestamp = {
      data: operacoesAtualizadas,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    localStorage.setItem('planilha-arb-operacoes-v2', JSON.stringify(dataWithTimestamp));
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir operação:', error);
    return false;
  }
};

export const obterOperacoesPorDia = (data: string): Operacao[] => {
  const operacoes = obterOperacoes();
  return operacoes.filter(op => {
    try {
      const dataOp = new Date(op.data);
      const dataFiltro = new Date(data + 'T00:00:00');
      
      if (isNaN(dataOp.getTime()) || isNaN(dataFiltro.getTime())) {
        return false;
      }
      
      const dataOpNormalizada = new Date(dataOp.getFullYear(), dataOp.getMonth(), dataOp.getDate());
      const dataFiltroNormalizada = new Date(dataFiltro.getFullYear(), dataFiltro.getMonth(), dataFiltro.getDate());
      
      return dataOpNormalizada.getTime() === dataFiltroNormalizada.getTime();
    } catch {
      return false;
    }
  });
};

// Freebets
export const salvarFreebets = (freebets: Freebet[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FREEBETS, JSON.stringify(freebets));
  } catch (error) {
    console.error('Erro ao salvar freebets:', error);
    throw new Error('Falha ao salvar freebets no localStorage');
  }
};

export const salvarFreebet = (freebet: Freebet): void => {
  const freebets = obterFreebets();
  freebets.push(freebet);
  localStorage.setItem(STORAGE_KEYS.FREEBETS, JSON.stringify(freebets));
};

export const obterFreebets = (): Freebet[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.FREEBETS);
    if (dados) {
      return JSON.parse(dados);
    }
    return [];
  } catch {
    return [];
  }
};

export const obterFreebetsAtivas = (): Freebet[] => {
  const todasFreebets = obterFreebets();
  return todasFreebets.filter(fb => fb.ativa === true);
};

export const marcarFreebetComoExtraida = (freebetId: string): void => {
  const freebets = obterFreebets();
  const index = freebets.findIndex(fb => fb.id === freebetId);
  if (index !== -1) {
    freebets[index].ativa = false;
    localStorage.setItem(STORAGE_KEYS.FREEBETS, JSON.stringify(freebets));
  }
};

export const excluirFreebet = (freebetId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const freebets = obterFreebets();
    const freebetsAtualizadas = freebets.filter(fb => fb.id !== freebetId);
    localStorage.setItem(STORAGE_KEYS.FREEBETS, JSON.stringify(freebetsAtualizadas));
  } catch (error) {
    console.error('Erro ao excluir freebet:', error);
  }
};

// Extrações
export const salvarExtracoes = (extracoes: ExtracaoFreebet[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXTRACOES, JSON.stringify(extracoes));
  } catch (error) {
    console.error('Erro ao salvar extrações:', error);
    throw new Error('Falha ao salvar extrações no localStorage');
  }
};

export const salvarExtracao = (extracao: ExtracaoFreebet): void => {
  const extracoes = obterExtracoes();
  extracoes.push(extracao);
  localStorage.setItem(STORAGE_KEYS.EXTRACOES, JSON.stringify(extracoes));
};

export const obterExtracoes = (): ExtracaoFreebet[] => {
  if (typeof window === 'undefined') return [];
  
  const dados = localStorage.getItem(STORAGE_KEYS.EXTRACOES);
  if (dados) {
    return JSON.parse(dados);
  }
  return [];
};

// Utilitários
export const gerarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatarData = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const formatarDataHora = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  const segundos = String(data.getSeconds()).padStart(2, '0');
  return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
};

export const obterDataAtual = (): Date => {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
};

export const obterDataHoraAtual = (): Date => {
  return new Date();
};

// Função para limpar e validar dados de freebets
export const validarELimparFreebets = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const freebets = obterFreebets();
    const freebetsValidas: Freebet[] = [];
    
    freebets.forEach(freebet => {
      if (
        freebet.id &&
        freebet.titulo &&
        typeof freebet.valor === 'number' &&
        freebet.casaDeApostas &&
        freebet.dataAquisicao &&
        freebet.dataExpiracao &&
        typeof freebet.prejuizoParaAdquirir === 'number' &&
        (typeof freebet.requisito === 'string' || freebet.requisito === undefined) &&
        typeof freebet.ativa === 'boolean'
      ) {
        const jaExiste = freebetsValidas.find(fb => 
          fb.titulo === freebet.titulo && 
          fb.valor === freebet.valor && 
          fb.dataAquisicao === freebet.dataAquisicao &&
          fb.casaDeApostas === freebet.casaDeApostas
        );
        
        if (!jaExiste) {
          freebetsValidas.push(freebet);
        }
      }
    });
    
    localStorage.setItem(STORAGE_KEYS.FREEBETS, JSON.stringify(freebetsValidas));
  } catch (error) {
    console.error('Erro ao validar freebets:', error);
  }
};

// Limpar todos os dados
export const limparTodosDados = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.OPERACOES);
    localStorage.removeItem(STORAGE_KEYS.FREEBETS);
    localStorage.removeItem(STORAGE_KEYS.EXTRACOES);
    window.location.reload();
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
};

// Exportar dados
export const exportarDados = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const dados = {
      operacoes: obterOperacoes(),
      freebets: obterFreebets(),
      extracoes: obterExtracoes(),
      exportadoEm: new Date().toISOString()
    };
    
    const dadosJson = JSON.stringify(dados, null, 2);
    const blob = new Blob([dadosJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `planilha-arb-backup-${formatarData(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
  }
};

// Notas
export const obterNotas = (): string => {
  if (typeof window === 'undefined') return '';
  const dados = localStorage.getItem(STORAGE_KEYS.NOTAS);
  return dados || '';
};

export const salvarNotas = (notas: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.NOTAS, notas);
};
