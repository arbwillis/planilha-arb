// Serviço para gerenciar bancas mensais
// Cada mês tem seu próprio registro de banca

interface BancaMensal {
  ano: number;
  mes: number; // 0-11 (janeiro = 0)
  valor: number;
  dataRegistro: string; // ISO string
}

interface BancasMensaisData {
  bancas: BancaMensal[];
  bancaAtual: number; // Banca definida atualmente nas configurações
}

const STORAGE_KEY = 'planilha-arb-bancas-mensais';

// Gera uma chave única para o mês
const gerarChaveMes = (ano: number, mes: number): string => {
  return `${ano}-${String(mes).padStart(2, '0')}`;
};

// Obtém todos os dados de bancas mensais
export const obterBancasMensais = (): BancasMensaisData => {
  if (typeof window === 'undefined') {
    return { bancas: [], bancaAtual: 0 };
  }
  
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) {
      return JSON.parse(dados);
    }
  } catch (error) {
    console.error('Erro ao carregar bancas mensais:', error);
  }
  
  return { bancas: [], bancaAtual: 0 };
};

// Salva os dados de bancas mensais
const salvarBancasMensais = (dados: BancasMensaisData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch (error) {
    console.error('Erro ao salvar bancas mensais:', error);
  }
};

// Obtém a banca de um mês específico
export const obterBancaDoMes = (ano: number, mes: number): number => {
  const dados = obterBancasMensais();
  
  // Procura a banca do mês específico
  const bancaMes = dados.bancas.find(b => b.ano === ano && b.mes === mes);
  
  if (bancaMes) {
    return bancaMes.valor;
  }
  
  // Se não encontrar banca para o mês, verifica se é o mês atual
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  
  // Se for o mês atual e não tem registro, usa a banca atual das configurações
  if (ano === anoAtual && mes === mesAtual) {
    return dados.bancaAtual;
  }
  
  // Para meses passados sem registro, retorna 0
  return 0;
};

// Registra/atualiza a banca de um mês específico
export const registrarBancaDoMes = (ano: number, mes: number, valor: number): void => {
  const dados = obterBancasMensais();
  
  // Procura se já existe registro para o mês
  const index = dados.bancas.findIndex(b => b.ano === ano && b.mes === mes);
  
  const novaBanca: BancaMensal = {
    ano,
    mes,
    valor,
    dataRegistro: new Date().toISOString()
  };
  
  if (index !== -1) {
    // Atualiza registro existente
    dados.bancas[index] = novaBanca;
  } else {
    // Adiciona novo registro
    dados.bancas.push(novaBanca);
  }
  
  salvarBancasMensais(dados);
};

// Atualiza a banca atual (configurações) e registra para o mês atual
export const atualizarBancaAtual = (valor: number): void => {
  const dados = obterBancasMensais();
  dados.bancaAtual = valor;
  
  // Registra também para o mês atual
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  
  // Procura se já existe registro para o mês atual
  const index = dados.bancas.findIndex(b => b.ano === anoAtual && b.mes === mesAtual);
  
  const novaBanca: BancaMensal = {
    ano: anoAtual,
    mes: mesAtual,
    valor,
    dataRegistro: new Date().toISOString()
  };
  
  if (index !== -1) {
    dados.bancas[index] = novaBanca;
  } else {
    dados.bancas.push(novaBanca);
  }
  
  salvarBancasMensais(dados);
  
  // Dispara evento para atualizar componentes
  window.dispatchEvent(new CustomEvent('bancaAtualizada', { 
    detail: { valor, ano: anoAtual, mes: mesAtual } 
  }));
};

// Obtém a banca atual das configurações
export const obterBancaAtual = (): number => {
  const dados = obterBancasMensais();
  return dados.bancaAtual;
};

// Obtém histórico de bancas (para relatórios futuros)
export const obterHistoricoBancas = (): BancaMensal[] => {
  const dados = obterBancasMensais();
  // Ordena por data (mais recente primeiro)
  return dados.bancas.sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano;
    return b.mes - a.mes;
  });
};

// Formata mês/ano para exibição
export const formatarMesAno = (ano: number, mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${meses[mes]} ${ano}`;
};


