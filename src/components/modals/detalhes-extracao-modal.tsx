'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Operacao } from '@/types';
import { Info, DollarSign, Percent, Calendar, Building2, TrendingUp } from 'lucide-react';

interface DetalhesExtracaoModalProps {
  operacao: Operacao | null;
  aberto: boolean;
  onClose: () => void;
}

export function DetalhesExtracaoModal({ operacao, aberto, onClose }: DetalhesExtracaoModalProps) {
  if (!operacao) return null;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extrair dados da descrição da extração
  // Formato esperado: "Extração de freebet - Lucro bruto: R$ 73.00 - Porcentagem: 73.0%"
  // Os valores são salvos com ponto decimal (formato JavaScript/inglês)
  const parseDescricao = () => {
    if (!operacao.descricao) {
      return { lucroBruto: operacao.valor, porcentagem: 0 };
    }

    const matchLucro = operacao.descricao.match(/Lucro bruto: R\$ ([\d.]+)/);
    const matchPorcentagem = operacao.descricao.match(/Porcentagem: ([\d.]+)%/);

    // Os valores já estão em formato com ponto decimal, então basta fazer parseFloat direto
    const lucroBruto = matchLucro 
      ? parseFloat(matchLucro[1]) 
      : operacao.valor;
    const porcentagem = matchPorcentagem 
      ? parseFloat(matchPorcentagem[1]) 
      : 0;

    return { lucroBruto, porcentagem };
  };

  const { lucroBruto, porcentagem } = parseDescricao();
  
  // Calcular o custo de aquisição (lucro bruto - lucro líquido)
  const custoAquisicao = lucroBruto - operacao.valor;

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Info className="h-5 w-5" style={{ color: 'oklch(0.6 0.25 240)' }} />
            Detalhes da Extração
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Título da Extração */}
          <div className="text-center p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Operação</p>
            <h3 className="font-semibold text-lg">{operacao.titulo}</h3>
            <Badge 
              className="mt-2"
              style={{ backgroundColor: 'oklch(0.6 0.25 240)', color: 'white' }}
            >
              Extração de Freebet
            </Badge>
          </div>

          <Separator />

          {/* Grid de Informações */}
          <div className="grid grid-cols-2 gap-4">
            {/* Lucro Bruto */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Lucro Bruto</span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatarMoeda(lucroBruto)}
              </p>
            </div>

            {/* Porcentagem de Extração */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'oklch(0.6 0.25 240 / 0.1)', borderColor: 'oklch(0.6 0.25 240 / 0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4" style={{ color: 'oklch(0.6 0.25 240)' }} />
                <span className="text-sm text-muted-foreground">% Extração</span>
              </div>
              <p className="text-xl font-bold" style={{ color: 'oklch(0.6 0.25 240)' }}>
                {porcentagem.toFixed(1)}%
              </p>
            </div>

            {/* Custo de Aquisição */}
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                <span className="text-sm text-muted-foreground">Custo Aquisição</span>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                -{formatarMoeda(Math.abs(custoAquisicao))}
              </p>
            </div>

            {/* Lucro Líquido */}
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Lucro Líquido</span>
              </div>
              <p className={`text-xl font-bold ${operacao.valor >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {operacao.valor >= 0 ? '+' : ''}{formatarMoeda(operacao.valor)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <div className="space-y-3">
            {/* Casa de Apostas */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Casa de Apostas</span>
              </div>
              <span className="font-medium">{operacao.casaDeApostas}</span>
            </div>

            {/* Data da Extração */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Data da Extração</span>
              </div>
              <span className="font-medium text-sm">{formatarDataHora(operacao.data)}</span>
            </div>
          </div>

          {/* Fórmula Explicativa */}
          <div className="p-4 bg-muted/20 rounded-lg border">
            <p className="text-sm font-semibold mb-2">Como foi calculado:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• <strong>Lucro Bruto:</strong> Valor extraído da freebet</p>
              <p>• <strong>Custo de Aquisição:</strong> Prejuízo para obter a freebet</p>
              <p>• <strong>Lucro Líquido:</strong> Lucro Bruto - Custo de Aquisição</p>
              <p className="mt-2 pt-2 border-t font-mono text-xs">
                {formatarMoeda(lucroBruto)} - {formatarMoeda(Math.abs(custoAquisicao))} = {formatarMoeda(operacao.valor)}
              </p>
            </div>
          </div>

          {/* Botão Fechar */}
          <Button 
            onClick={onClose}
            className="w-full h-11"
            style={{ backgroundColor: 'oklch(0.6 0.25 240)', color: 'white' }}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

