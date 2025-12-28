export interface Operacao {
  id: string;
  titulo: string;
  valor: number;
  casaDeApostas: string;
  data: string;
  descricao?: string;
  tipo: 'lucro' | 'prejuizo' | 'extracao';
}

export interface Freebet {
  id: string;
  titulo: string;
  casaDeApostas: string;
  valor: number;
  dataExpiracao: string;
  prejuizoParaAdquirir: number;
  requisito?: string; // Opcional
  ativa: boolean;
  dataAquisicao: string;
}

export interface ExtracaoFreebet {
  id: string;
  freebetId: string;
  lucroExtraido: number;
  porcentagemExtracao: number;
  data: string;
}

export interface DadosDia {
  lucroLiquido: number;
  totalFreebets: number;
  quantidadeOperacoes: number;
}

export interface DadosMes {
  lucroLiquido: number;
  totalFreebetsAdquiridas: number;
  quantidadeOperacoes: number;
  mediaExtracao: number;
}
