import { Operacao, Freebet, ExtracaoFreebet, DadosDia, DadosMes } from '@/types';
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

    // Para freebets adquiridas no dia, verificamos TODAS as freebets cadastradas nesta data
    // (independente de estarem ativas ou não, pois queremos mostrar no calendário quando foram adquiridas)
    const dataFiltroStr = formatarData(data);
    
    const freebetsAdquiridasNoDia = freebets.filter(freebet => {
      try {
        // A dataAquisicao já está no formato YYYY-MM-DD
        const dataAquisicaoStr = freebet.dataAquisicao;
        
        // Garantir que ambas as strings estão no mesmo formato
        if (!dataAquisicaoStr || !dataFiltroStr) {
          return false;
        }
        
        
        // Comparação direta das strings de data (YYYY-MM-DD)
        // IMPORTANTE: Incluímos TODAS as freebets adquiridas no dia, ativas ou não
        return dataAquisicaoStr === dataFiltroStr;
      } catch (error) {
        console.error('Erro ao filtrar freebets por data:', error);
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
        const dataExt = new Date(ext.data + 'T00:00:00'); // Força timezone local
        return dataExt.getFullYear() === ano && dataExt.getMonth() === mes;
      } catch (error) {
        console.error('Erro ao processar data de extração:', error);
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

    // Para freebets adquiridas no mês, verificamos TODAS as freebets cadastradas neste período
    // (independente de estarem ativas ou não, pois queremos contabilizar quando foram adquiridas)
    const freebetsAdquiridasNoMes = freebets.filter(freebet => {
      try {
        if (!freebet.dataAquisicao) return false;
        
        // A dataAquisicao está no formato YYYY-MM-DD
        const dataAquisicaoStr = freebet.dataAquisicao;
        const [anoAquisicao, mesAquisicao] = dataAquisicaoStr.split('-').map(Number);
        
        // Validar se a conversão foi bem-sucedida
        if (isNaN(anoAquisicao) || isNaN(mesAquisicao)) {
          console.warn('Data de aquisição inválida:', dataAquisicaoStr);
          return false;
        }
        
        // Comparar ano e mês (lembrando que mes no JavaScript é 0-indexado)
        // IMPORTANTE: Incluímos TODAS as freebets adquiridas no mês, ativas ou não
        return anoAquisicao === ano && (mesAquisicao - 1) === mes;
      } catch (error) {
        console.error('Erro ao filtrar freebets por mês:', error);
        return false;
      }
    });

    const totalFreebetsAdquiridas = freebetsAdquiridasNoMes.reduce((total, freebet) => {
      if (typeof freebet.valor !== 'number' || isNaN(freebet.valor)) {
        return total;
      }
      return total + freebet.valor;
    }, 0);

    const mediaExtracao = extracoes.length > 0 
      ? extracoes.reduce((total, ext) => {
          if (typeof ext.porcentagemExtracao !== 'number' || isNaN(ext.porcentagemExtracao)) {
            return total;
          }
          return total + ext.porcentagemExtracao;
        }, 0) / extracoes.length
      : 0;

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
