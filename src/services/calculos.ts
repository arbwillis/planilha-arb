import { DadosDia, DadosMes } from '@/types';
import { 
  obterOperacoesPorDia, 
  obterOperacoesPorMes, 
  obterFreebetsAtivas, 
  obterFreebets,
  obterExtracoes,
  formatarData 
} from './storage';

export const calcularDadosDia = (data: Date): DadosDia => {
  try {
    const dataStr = formatarData(data);
    const operacoes = obterOperacoesPorDia(dataStr);
    const freebets = obterFreebets();
    
    const lucroLiquido = operacoes.reduce((total, op) => {
      if (typeof op.valor !== 'number' || isNaN(op.valor)) {
        return total;
      }
      
      if (op.tipo === 'lucro' || op.tipo === 'extracao') {
        return total + op.valor;
      } else if (op.tipo === 'prejuizo') {
        return total - op.valor;
      }
      return total;
    }, 0);

    const dataFiltroStr = formatarData(data);
    
    const freebetsAdquiridasNoDia = freebets.filter(freebet => {
      try {
        const dataAquisicaoStr = freebet.dataAquisicao;
        if (!dataAquisicaoStr || !dataFiltroStr) {
          return false;
        }
        return dataAquisicaoStr === dataFiltroStr;
      } catch {
        return false;
      }
    });

    const totalFreebets = freebetsAdquiridasNoDia.reduce((total, freebet) => {
      if (typeof freebet.valor !== 'number' || isNaN(freebet.valor)) {
        return total;
      }
      return total + freebet.valor;
    }, 0);

    return {
      lucroLiquido,
      totalFreebets,
      quantidadeOperacoes: operacoes.length
    };
  } catch (error) {
    console.error('Erro ao calcular dados do dia:', error);
    return {
      lucroLiquido: 0,
      totalFreebets: 0,
      quantidadeOperacoes: 0
    };
  }
};

export const calcularDadosMes = (ano: number, mes: number): DadosMes => {
  try {
    const operacoes = obterOperacoesPorMes(ano, mes);
    const freebets = obterFreebets();
    const extracoes = obterExtracoes().filter(ext => {
      try {
        const dataExt = new Date(ext.data);
        if (isNaN(dataExt.getTime())) {
          return false;
        }
        return dataExt.getFullYear() === ano && dataExt.getMonth() === mes;
      } catch {
        return false;
      }
    });

    const lucroLiquido = operacoes.reduce((total, op) => {
      if (typeof op.valor !== 'number' || isNaN(op.valor)) {
        return total;
      }
      
      if (op.tipo === 'lucro' || op.tipo === 'extracao') {
        return total + op.valor;
      } else if (op.tipo === 'prejuizo') {
        return total - op.valor;
      }
      return total;
    }, 0);

    const freebetsAdquiridasNoMes = freebets.filter(freebet => {
      try {
        if (!freebet.dataAquisicao) return false;
        
        const dataAquisicaoStr = freebet.dataAquisicao;
        const [anoAquisicao, mesAquisicao] = dataAquisicaoStr.split('-').map(Number);
        
        if (isNaN(anoAquisicao) || isNaN(mesAquisicao)) {
          return false;
        }
        
        return anoAquisicao === ano && (mesAquisicao - 1) === mes;
      } catch {
        return false;
      }
    });

    const totalFreebetsAdquiridas = freebetsAdquiridasNoMes.reduce((total, freebet) => {
      if (typeof freebet.valor !== 'number' || isNaN(freebet.valor)) {
        return total;
      }
      return total + freebet.valor;
    }, 0);

    // Calcular média de extração
    let somaExtracao = 0;
    let extracoesValidas = 0;
    
    extracoes.forEach(ext => {
      if (typeof ext.porcentagemExtracao === 'number' && !isNaN(ext.porcentagemExtracao)) {
        somaExtracao += ext.porcentagemExtracao;
        extracoesValidas++;
      }
    });
    
    const mediaExtracao = extracoesValidas > 0 ? somaExtracao / extracoesValidas : 0;

    return {
      lucroLiquido,
      totalFreebetsAdquiridas,
      quantidadeOperacoes: operacoes.length,
      mediaExtracao
    };
  } catch (error) {
    console.error('Erro ao calcular dados do mês:', error);
    return {
      lucroLiquido: 0,
      totalFreebetsAdquiridas: 0,
      quantidadeOperacoes: 0,
      mediaExtracao: 0
    };
  }
};

export const calcularPorcentagemExtracao = (lucroExtraido: number, valorFreebet: number): number => {
  return valorFreebet > 0 ? (lucroExtraido / valorFreebet) * 100 : 0;
};

export const calcularLucroLiquidoExtracao = (lucroExtraido: number, prejuizoAquisicao: number): number => {
  return lucroExtraido - prejuizoAquisicao;
};

export const obterTotalFreebetsAtivas = (): number => {
  const freebetsAtivas = obterFreebetsAtivas();
  return freebetsAtivas.reduce((total, fb) => total + fb.valor, 0);
};
