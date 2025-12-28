'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  salvarExtracao, 
  salvarOperacao, 
  marcarFreebetComoExtraida, 
  gerarId, 
  obterDataHoraAtual 
} from '@/services/storage';
import { 
  calcularPorcentagemExtracao, 
  calcularLucroLiquidoExtracao 
} from '@/services/calculos';
import { Freebet, ExtracaoFreebet, Operacao } from '@/types';

interface ExtracaoFreebetModalProps {
  freebet: Freebet;
  aberto: boolean;
  onClose: () => void;
}

export function ExtracaoFreebetModal({ freebet, aberto, onClose }: ExtracaoFreebetModalProps) {
  const [lucroExtraido, setLucroExtraido] = useState('');
  const [porcentagemExtracao, setPorcentagemExtracao] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (lucroExtraido) {
      const lucro = parseFloat(lucroExtraido.replace(',', '.'));
      if (!isNaN(lucro)) {
        const porcentagem = calcularPorcentagemExtracao(lucro, freebet.valor);
        const liquido = calcularLucroLiquidoExtracao(lucro, freebet.prejuizoParaAdquirir);
        
        setPorcentagemExtracao(porcentagem);
        setLucroLiquido(liquido);
      } else {
        setPorcentagemExtracao(0);
        setLucroLiquido(0);
      }
    } else {
      setPorcentagemExtracao(0);
      setLucroLiquido(0);
    }
  }, [lucroExtraido, freebet.valor, freebet.prejuizoParaAdquirir]);

  const resetarFormulario = () => {
    setLucroExtraido('');
    setPorcentagemExtracao(0);
    setLucroLiquido(0);
  };

  const handleMarcarExtracao = async () => {
    if (!lucroExtraido) {
      alert('Por favor, insira o lucro da extração.');
      return;
    }

    const lucro = parseFloat(lucroExtraido.replace(',', '.'));
    if (isNaN(lucro) || lucro < 0) {
      alert('Por favor, insira um valor válido para o lucro.');
      return;
    }

    setSalvando(true);

    try {
      const agora = obterDataHoraAtual().toISOString();

      // Salvar extração
      const extracao: ExtracaoFreebet = {
        id: gerarId(),
        freebetId: freebet.id,
        lucroExtraido: lucro,
        porcentagemExtracao,
        data: agora
      };

      salvarExtracao(extracao);

      // Salvar como operação de extração
      const operacao: Operacao = {
        id: gerarId(),
        titulo: `Extração: ${freebet.titulo}`,
        valor: lucroLiquido,
        casaDeApostas: freebet.casaDeApostas,
        data: agora,
        descricao: `Extração de freebet - Lucro bruto: R$ ${lucro.toFixed(2)} - Porcentagem: ${porcentagemExtracao.toFixed(1)}%`,
        tipo: 'extracao'
      };

      salvarOperacao(operacao);

      // Marcar freebet como extraída
      marcarFreebetComoExtraida(freebet.id);

      resetarFormulario();
      onClose();
      
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao marcar extração:', error);
      alert('Erro ao marcar a extração. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    resetarFormulario();
    onClose();
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={aberto} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle 
            className="text-xl font-bold text-center"
            style={{ color: 'oklch(0.6 0.25 240)' }}
          >
            Extrair Freebet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 px-1">
          {/* Informações da Freebet */}
          <div className="bg-muted/50 p-6 rounded-xl border space-y-4">
            <h3 className="text-lg font-bold text-center">{freebet.titulo}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">Valor</span>
                <p className="text-lg font-bold" style={{ color: 'oklch(0.6 0.25 240)' }}>
                  {formatarMoeda(freebet.valor)}
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">Casa</span>
                <p className="text-sm font-semibold">{freebet.casaDeApostas}</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">Expira em</span>
                <p className="text-sm font-semibold">{formatarData(freebet.dataExpiracao)}</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">Custo</span>
                <p className="text-lg font-bold text-red-500">
                  {formatarMoeda(freebet.prejuizoParaAdquirir)}
                </p>
              </div>
            </div>
            
            <div className="bg-background p-3 rounded-lg">
              <span className="text-xs text-muted-foreground block mb-2">Requisito:</span>
              <p className="text-sm">{freebet.requisito}</p>
            </div>
          </div>

          <Separator />

          {/* Input do Lucro */}
          <div className="space-y-2">
            <Label htmlFor="lucroExtraido" className="text-sm font-semibold">
              Lucro da Extração (R$) *
            </Label>
            <Input
              id="lucroExtraido"
              type="number"
              step="0.01"
              value={lucroExtraido}
              onChange={(e) => setLucroExtraido(e.target.value)}
              placeholder="0,00"
              className="h-12 text-xl font-bold text-center"
              style={{ color: 'oklch(0.6 0.25 240)' }}
            />
          </div>

          {/* Cálculos em Tempo Real */}
          {lucroExtraido && (
            <div className="bg-muted/50 p-6 rounded-xl border space-y-4">
              <h4 className="font-semibold text-center text-lg">Cálculos em Tempo Real</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-background rounded-xl border">
                  <p className="text-sm text-muted-foreground mb-2">Porcentagem de Extração</p>
                  <p className="text-4xl font-bold" style={{ color: 'oklch(0.6 0.25 240)' }}>
                    {porcentagemExtracao.toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center p-6 bg-background rounded-xl border">
                  <p className="text-sm text-muted-foreground mb-2">Lucro Líquido</p>
                  <p className={`text-4xl font-bold ${lucroLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatarMoeda(lucroLiquido)}
                  </p>
                </div>
              </div>

              <div className="bg-background p-4 rounded-lg border">
                <p className="text-sm font-semibold mb-2">Fórmula:</p>
                <p className="text-xs text-muted-foreground mb-1">Lucro Líquido = Lucro Extraído - Custo de Aquisição</p>
                <p className="text-sm font-mono">
                  {formatarMoeda(parseFloat(lucroExtraido.replace(',', '.')) || 0)} - {formatarMoeda(freebet.prejuizoParaAdquirir)} = {formatarMoeda(lucroLiquido)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarcarExtracao}
              className="flex-1 h-12 font-semibold"
              style={{ 
                backgroundColor: 'oklch(0.6 0.25 240)', 
                color: 'white' 
              }}
              disabled={salvando || !lucroExtraido}
            >
              {salvando ? 'Salvando...' : 'Marcar Extração'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
