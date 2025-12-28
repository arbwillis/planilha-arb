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

// Operações
// Função para salvar array completo de operações (para backup/restore)
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
    // Tentar carregar dados versionados
    const dados = localStorage.getItem(STORAGE_KEYS.OPERACOES);
    if (dados) {
      const parsed = JSON.parse(dados);
      // Se tem estrutura versionada, retorna os dados
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
      // Se é array direto (formato antigo), retorna como está
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    
    // Tentar carregar dados legados
    const dadosLegados = localStorage.getItem(LEGACY_KEYS.OPERACOES);
    if (dadosLegados) {
      const operacoes = JSON.parse(dadosLegados);
      // Migrar para novo formato
      salvarOperacoes(operacoes);
      // Limpar dados antigos
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

export const obterOperacoesPorDia = (data: string): Operacao[] => {
  const operacoes = obterOperacoes();
  return operacoes.filter(op => {
    try {
      const dataOp = new Date(op.data);
      const dataFiltro = new Date(data + 'T00:00:00'); // Garantir que seja início do dia
      
      // Verificar se as datas são válidas
      if (isNaN(dataOp.getTime()) || isNaN(dataFiltro.getTime())) {
        return false;
      }
      
      // Normalizar ambas as datas para o início do dia no timezone local
      const dataOpNormalizada = new Date(dataOp.getFullYear(), dataOp.getMonth(), dataOp.getDate());
      const dataFiltroNormalizada = new Date(dataFiltro.getFullYear(), dataFiltro.getMonth(), dataFiltro.getDate());
      
      return dataOpNormalizada.getTime() === dataFiltroNormalizada.getTime();
    } catch (error) {
      console.error('Erro ao comparar datas:', error);
      return false;
    }
  });
};

// Freebets
// Função para salvar array completo de freebets (para backup/restore)
export const salvarFreebets = (freebets: Freebet[]): void => {
  try {
    localStorage.setItem(CHAVE_FREEBETS, JSON.stringify(freebets));
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
  const dados = localStorage.getItem(STORAGE_KEYS.FREEBETS);
  return dados ? JSON.parse(dados) : [];
};

export const obterFreebetsAtivas = (): Freebet[] => {
  return obterFreebets().filter(fb => fb.ativa);
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
    
    console.log('🗑️ Freebet excluída:', freebetId);
  } catch (error) {
    console.error('Erro ao excluir freebet:', error);
  }
};

// Extrações
// Função para salvar array completo de extrações (para backup/restore)
export const salvarExtracoes = (extracoes: ExtracaoFreebet[]): void => {
  try {
    localStorage.setItem(CHAVE_EXTRACOES, JSON.stringify(extracoes));
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
  return dados ? JSON.parse(dados) : [];
};

// Utilitários
export const gerarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatarData = (data: Date): string => {
  // Usar timezone local para evitar problemas de fuso horário
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const formatarDataHora = (data: Date): string => {
  // Usar timezone local para evitar problemas de fuso horário
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  const segundos = String(data.getSeconds()).padStart(2, '0');
  return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
};

export const obterDataAtual = (): Date => {
  // Retorna a data atual no timezone local
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
};

export const obterDataHoraAtual = (): Date => {
  // Retorna a data e hora atual
  return new Date();
};

// Função para limpar e validar dados de freebets
export const validarELimparFreebets = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const freebets = obterFreebets();
    const freebetsValidas: Freebet[] = [];
    
    freebets.forEach(freebet => {
      // Verificar se a freebet tem todos os campos obrigatórios
      if (
        freebet.id &&
        freebet.titulo &&
        typeof freebet.valor === 'number' &&
        freebet.casaDeApostas &&
        freebet.dataAquisicao &&
        freebet.dataExpiracao &&
        typeof freebet.prejuizoParaAdquirir === 'number' &&
        freebet.requisito &&
        typeof freebet.ativa === 'boolean'
      ) {
        // Verificar se não é duplicata
        const jaExiste = freebetsValidas.find(fb => 
          fb.titulo === freebet.titulo && 
          fb.valor === freebet.valor && 
          fb.dataAquisicao === freebet.dataAquisicao &&
          fb.casaDeApostas === freebet.casaDeApostas
        );
        
        if (!jaExiste) {
          freebetsValidas.push(freebet);
        } else {
          console.log('Freebet duplicada removida:', freebet.titulo);
        }
      } else {
        console.log('Freebet inválida removida:', freebet);
      }
    });
    
    // Salvar apenas as freebets válidas
    localStorage.setItem(STORAGE_KEYS.FREEBETS, JSON.stringify(freebetsValidas));
    
    console.log(`Limpeza concluída: ${freebets.length} -> ${freebetsValidas.length} freebets`);
  } catch (error) {
    console.error('Erro ao validar freebets:', error);
  }
};

// FUNÇÃO TEMPORÁRIA PARA DESENVOLVIMENTO - VERIFICAR FREEBETS
export const verificarFreebets = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const freebets = obterFreebets();
    console.log('🔍 Verificando todas as freebets:', freebets);
    
    freebets.forEach((freebet, index) => {
      console.log(`Freebet ${index + 1}:`, {
        titulo: freebet.titulo,
        dataAquisicao: freebet.dataAquisicao,
        valor: freebet.valor,
        ativa: freebet.ativa
      });
    });
  } catch (error) {
    console.error('Erro ao verificar freebets:', error);
  }
};

// FUNÇÃO TEMPORÁRIA PARA DESENVOLVIMENTO - REMOVER QUANDO IMPLEMENTAR BD
export const limparTodosDados = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Limpar todos os dados do localStorage
    localStorage.removeItem(STORAGE_KEYS.OPERACOES);
    localStorage.removeItem(STORAGE_KEYS.FREEBETS);
    localStorage.removeItem(STORAGE_KEYS.EXTRACOES);
    
    console.log('🗑️ Todos os dados foram limpos do localStorage');
    
    // Recarregar a página para atualizar a interface
    window.location.reload();
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
};

// FUNÇÃO TEMPORÁRIA PARA DESENVOLVIMENTO - REMOVER QUANDO IMPLEMENTAR BD
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
    
    console.log('📦 Dados exportados com sucesso');
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
