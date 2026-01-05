// Serviço para salvar dados mensais do punter de forma persistente

const STORAGE_KEY_PUNTER_MENSAL = 'planilha-arb-punter-mensal-v1';

export interface DadosMensaisPunter {
  mesAno: string; // Formato YYYY-MM
  bancaInicial: number;
  bancaFinal: number;
  lucroTotal: number;
  totalApostas: number;
  apostasGanhas: number;
  apostasPerdidas: number;
  taxaAcerto: number;
  roi: number;
  unidadesTotaisApostadas: number;
  unidadesPositivasNegativas: number;
  dataRegistro: string;
}

// Obter todos os dados mensais salvos
export const obterDadosMensaisPunter = (): DadosMensaisPunter[] => {
  if (typeof window === 'undefined') return [];
  try {
    const dados = localStorage.getItem(STORAGE_KEY_PUNTER_MENSAL);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error('Erro ao obter dados mensais punter:', error);
    return [];
  }
};

// Salvar dados de um mês específico
export const salvarDadosMensaisPunter = (dados: Omit<DadosMensaisPunter, 'dataRegistro'>): void => {
  if (typeof window === 'undefined') return;
  try {
    const todosDados = obterDadosMensaisPunter();
    const index = todosDados.findIndex(d => d.mesAno === dados.mesAno);
    const dataRegistro = new Date().toISOString();

    const dadosCompletos: DadosMensaisPunter = {
      ...dados,
      dataRegistro
    };

    if (index !== -1) {
      todosDados[index] = dadosCompletos;
    } else {
      todosDados.push(dadosCompletos);
    }
    
    localStorage.setItem(STORAGE_KEY_PUNTER_MENSAL, JSON.stringify(todosDados));
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new CustomEvent('dadosPunterMensalAtualizado', { 
      detail: dadosCompletos 
    }));
  } catch (error) {
    console.error('Erro ao salvar dados mensais punter:', error);
  }
};

// Obter dados de um mês específico
export const obterDadosDoMesPunter = (ano: number, mes: number): DadosMensaisPunter | null => {
  const mesAno = `${ano}-${String(mes + 1).padStart(2, '0')}`;
  const todosDados = obterDadosMensaisPunter();
  return todosDados.find(d => d.mesAno === mesAno) || null;
};

// Verificar se o mês já foi finalizado (mês anterior ao atual)
export const mesFinalizado = (ano: number, mes: number): boolean => {
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth();
  
  // Considera finalizado se for um mês anterior
  if (ano < anoAtual) return true;
  if (ano === anoAtual && mes < mesAtual) return true;
  
  return false;
};

// Salvar automaticamente o mês anterior quando mudar de mês
export const verificarEsalvarMesAnterior = (
  bancaInicial: number,
  lucroTotal: number,
  totalApostas: number,
  apostasGanhas: number,
  apostasPerdidas: number,
  taxaAcerto: number,
  roi: number,
  unidadesTotaisApostadas: number,
  unidadesPositivasNegativas: number
): void => {
  const agora = new Date();
  const mesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const anoAnterior = mesAnterior.getFullYear();
  const mesAnteriorNum = mesAnterior.getMonth();
  
  // Verificar se já existe registro do mês anterior
  const dadosExistentes = obterDadosDoMesPunter(anoAnterior, mesAnteriorNum);
  
  if (!dadosExistentes && mesFinalizado(anoAnterior, mesAnteriorNum)) {
    // Salvar dados do mês anterior
    const mesAno = `${anoAnterior}-${String(mesAnteriorNum + 1).padStart(2, '0')}`;
    
    salvarDadosMensaisPunter({
      mesAno,
      bancaInicial,
      bancaFinal: bancaInicial + lucroTotal,
      lucroTotal,
      totalApostas,
      apostasGanhas,
      apostasPerdidas,
      taxaAcerto,
      roi,
      unidadesTotaisApostadas,
      unidadesPositivasNegativas
    });
  }
};

