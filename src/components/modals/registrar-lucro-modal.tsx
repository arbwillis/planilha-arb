'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { salvarOperacao, gerarId, obterDataHoraAtual } from '@/services/storage';
import { Operacao } from '@/types';

interface RegistrarLucroModalProps {
  aberto: boolean;
  onClose: () => void;
}


export function RegistrarLucroModal({ aberto, onClose }: RegistrarLucroModalProps) {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [casaDeApostas, setCasaDeApostas] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const resetarFormulario = () => {
    setTitulo('');
    setValor('');
    setCasaDeApostas('');
    setDescricao('');
  };

  const handleSalvar = async () => {
    if (!titulo || !valor || !casaDeApostas) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    setSalvando(true);

    try {
      const operacao: Operacao = {
        id: gerarId(),
        titulo,
        valor: valorNumerico,
        casaDeApostas,
        data: obterDataHoraAtual().toISOString(),
        descricao,
        tipo: 'lucro'
      };

      salvarOperacao(operacao);
      resetarFormulario();
      onClose();
      
      // Disparar evento para atualizar componentes
      window.dispatchEvent(new CustomEvent('operacaoSalva', { 
        detail: { operacao, tipo: 'lucro' } 
      }));
    } catch (error) {
      console.error('Erro ao salvar operação:', error);
      alert('Erro ao salvar a operação. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    resetarFormulario();
    onClose();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-green-500 text-xl font-bold text-center">
            Registrar Lucro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 px-1">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-sm font-semibold">
              Título *
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Surebet Flamengo vs Palmeiras"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor" className="text-sm font-semibold">
              Valor do Lucro (R$) *
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="h-11 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="casa" className="text-sm font-semibold">
              Casa de Apostas *
            </Label>
            <Input
              id="casa"
              value={casaDeApostas}
              onChange={(e) => setCasaDeApostas(e.target.value)}
              placeholder="Ex: Bet365, Betano, Sportingbet..."
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm font-semibold">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais sobre a operação..."
              rows={4}
              className="resize-none"
            />
          </div>

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
              onClick={handleSalvar}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-semibold"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Lucro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
