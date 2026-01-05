'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { atualizarOperacao } from '@/services/storage';
import { Operacao } from '@/types';

interface EditarOperacaoModalProps {
  operacao: Operacao | null;
  aberto: boolean;
  onClose: () => void;
  onSucesso: () => void;
}

export function EditarOperacaoModal({ operacao, aberto, onClose, onSucesso }: EditarOperacaoModalProps) {
  const [novoValor, setNovoValor] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (operacao) {
      setNovoValor(operacao.valor.toString());
    }
  }, [operacao]);

  const handleSalvar = async () => {
    if (!operacao) return;
    
    const valorNumerico = parseFloat(novoValor.replace(',', '.'));
    
    if (isNaN(valorNumerico) || valorNumerico < 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    setSalvando(true);

    try {
      const sucesso = atualizarOperacao(operacao.id, valorNumerico);
      
      if (sucesso) {
        onSucesso();
        onClose();
        
        // Disparar evento para atualizar todos os componentes
        window.dispatchEvent(new CustomEvent('operacaoAtualizada', { 
          detail: { operacaoId: operacao.id, novoValor: valorNumerico } 
        }));
      } else {
        alert('Erro ao atualizar a operação.');
      }
    } catch (error) {
      console.error('Erro ao atualizar operação:', error);
      alert('Erro ao atualizar a operação. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    setNovoValor('');
    onClose();
  };

  const obterTipoFormatado = (tipo: string) => {
    switch (tipo) {
      case 'lucro': return 'Lucro';
      case 'prejuizo': return 'Prejuízo';
      case 'extracao': return 'Extração';
      default: return tipo;
    }
  };

  const obterCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'lucro':
      case 'extracao':
        return 'text-green-500';
      case 'prejuizo':
        return 'text-red-500';
      default:
        return '';
    }
  };

  if (!operacao) return null;

  return (
    <Dialog open={aberto} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle 
            className="text-xl font-bold text-center"
            style={{ color: 'oklch(0.6 0.25 240)' }}
          >
            Editar Operação
          </DialogTitle>
          <DialogDescription className="text-center">
            Altere o valor da operação abaixo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 px-1">
          {/* Informações da operação */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <span className={`font-medium ${obterCorTipo(operacao.tipo)}`}>
                {obterTipoFormatado(operacao.tipo)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Título:</span>
              <span className="font-medium">{operacao.titulo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Casa:</span>
              <span className="font-medium">{operacao.casaDeApostas}</span>
            </div>
          </div>

          {/* Campo de valor */}
          <div className="space-y-2">
            <Label htmlFor="novoValor" className="text-sm font-semibold">
              Novo Valor (R$)
            </Label>
            <Input
              id="novoValor"
              type="number"
              step="0.01"
              min="0"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              placeholder="0,00"
              className={`h-12 text-lg font-semibold ${obterCorTipo(operacao.tipo)}`}
              autoFocus
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              className="flex-1 h-12 font-semibold"
              style={{ 
                backgroundColor: 'oklch(0.6 0.25 240)', 
                color: 'white' 
              }}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


