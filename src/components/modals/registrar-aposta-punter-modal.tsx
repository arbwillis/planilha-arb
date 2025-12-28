'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, X } from 'lucide-react';
import { salvarApostaPunter } from '@/services/punter-storage';

interface RegistrarApostaPunterModalProps {
  isOpen: boolean;
  onClose: () => void;
  valorUnidade: number;
}

export function RegistrarApostaPunterModal({ 
  isOpen, 
  onClose, 
  valorUnidade 
}: RegistrarApostaPunterModalProps) {
  const [evento, setEvento] = useState('');
  const [mercado, setMercado] = useState('');
  const [odd, setOdd] = useState('');
  const [valorAposta, setValorAposta] = useState('');
  const [unidades, setUnidades] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularUnidadesDoValor = (valor?: string) => {
    const valorParaUsar = valor !== undefined ? valor : valorAposta;
    const valorNum = parseFloat(valorParaUsar.replace(',', '.')) || 0;
    if (valorUnidade <= 0) return 0;
    return valorNum / valorUnidade;
  };

  const calcularValorDasUnidades = (unidadesParam?: string) => {
    const unidadesParaUsar = unidadesParam !== undefined ? unidadesParam : unidades;
    const unidadesNum = parseFloat(unidadesParaUsar.replace(',', '.')) || 0;
    return unidadesNum * valorUnidade;
  };

  const handleValorChange = (value: string) => {
    setValorAposta(value);
    if (value && valorUnidade > 0) {
      const valorNum = parseFloat(value.replace(',', '.')) || 0;
      if (valorNum > 0) {
        const unidadesCalculadas = valorNum / valorUnidade;
        // Arredondar para 2 casas decimais e formatar com vírgula
        const unidadesFormatadas = (Math.round(unidadesCalculadas * 100) / 100).toFixed(2).replace('.', ',');
        setUnidades(unidadesFormatadas);
      }
    } else if (!value) {
      setUnidades('');
    }
  };

  const handleUnidadesChange = (value: string) => {
    setUnidades(value);
    if (value && valorUnidade > 0) {
      const unidadesNum = parseFloat(value.replace(',', '.')) || 0;
      if (unidadesNum > 0) {
        const valorCalculado = unidadesNum * valorUnidade;
        // Arredondar para 2 casas decimais e formatar com vírgula
        const valorFormatado = (Math.round(valorCalculado * 100) / 100).toFixed(2).replace('.', ',');
        setValorAposta(valorFormatado);
      }
    } else if (!value) {
      setValorAposta('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evento.trim() || !mercado.trim() || !odd.trim() || (!valorAposta.trim() && !unidades.trim())) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const oddNum = parseFloat(odd.replace(',', '.'));
    const valorApostaNum = parseFloat(valorAposta.replace(',', '.')) || 0;
    const unidadesNum = parseFloat(unidades.replace(',', '.')) || 0;

    if (oddNum < 1.01 || oddNum > 100) {
      alert('A odd deve estar entre 1.01 e 100.00');
      return;
    }

    if (valorApostaNum <= 0 && unidadesNum <= 0) {
      alert('Preencha o valor da aposta ou as unidades');
      return;
    }

    if (unidadesNum > 50) {
      alert('As unidades não podem ser maiores que 50');
      return;
    }

    setIsLoading(true);

    try {
      // Calcular valores finais com precisão
      let valorFinal: number;
      let unidadesFinal: number;

      if (valorApostaNum > 0) {
        // Se valor foi preenchido, calcular unidades baseado no valor
        valorFinal = valorApostaNum;
        unidadesFinal = valorApostaNum / valorUnidade;
      } else if (unidadesNum > 0) {
        // Se unidades foi preenchido, calcular valor baseado nas unidades
        unidadesFinal = unidadesNum;
        valorFinal = unidadesNum * valorUnidade;
      } else {
        alert('Preencha o valor da aposta ou as unidades');
        return;
      }

      // Arredondar para 2 casas decimais para evitar problemas de precisão
      valorFinal = Math.round(valorFinal * 100) / 100;
      unidadesFinal = Math.round(unidadesFinal * 100) / 100;

      salvarApostaPunter({
        evento: evento.trim(),
        mercado: mercado.trim(),
        odd: oddNum,
        unidades: unidadesFinal,
        valorAposta: valorFinal
      });

      // Limpar formulário
      setEvento('');
      setMercado('');
      setOdd('');
      setValorAposta('');
      setUnidades('');
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar aposta:', error);
      alert('Erro ao salvar aposta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Registrar Nova Aposta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Evento */}
          <div className="space-y-2">
            <Label htmlFor="evento" className="text-sm font-medium">
              Evento *
            </Label>
            <Input
              id="evento"
              type="text"
              placeholder="Ex: Flamengo x Palmeiras"
              value={evento}
              onChange={(e) => setEvento(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Mercado */}
          <div className="space-y-2">
            <Label htmlFor="mercado" className="text-sm font-medium">
              Mercado *
            </Label>
            <Input
              id="mercado"
              type="text"
              placeholder="Ex: Vitória do Flamengo, Over 2.5 gols"
              value={mercado}
              onChange={(e) => setMercado(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Grid com Odd e Unidades */}
          <div className="grid grid-cols-2 gap-3">
            {/* Odd */}
            <div className="space-y-2">
              <Label htmlFor="odd" className="text-sm font-medium">
                Odd *
              </Label>
              <Input
                id="odd"
                type="text"
                placeholder="Ex: 2,50"
                value={odd}
                onChange={(e) => setOdd(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
            </div>

            {/* Valor da Aposta */}
            <div className="space-y-2">
              <Label htmlFor="valor-aposta" className="text-sm font-medium">
                Valor da Aposta (R$) *
              </Label>
              <Input
                id="valor-aposta"
                type="text"
                placeholder="Ex: 20,00"
                value={valorAposta}
                onChange={(e) => handleValorChange(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
          </div>

            {/* Unidades */}
            <div className="space-y-2">
              <Label htmlFor="unidades" className="text-sm font-medium">
                Unidades *
              </Label>
              <Input
                id="unidades"
                type="text"
                placeholder="Ex: 2,0"
                value={unidades}
                onChange={(e) => handleUnidadesChange(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
            </div>

          {/* Informação de Equivalência */}
          {(valorAposta || unidades) && valorUnidade > 0 && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {(() => {
                    const valorFinal = valorAposta ? parseFloat(valorAposta.replace(',', '.')) : calcularValorDasUnidades();
                    const unidadesFinal = unidades ? parseFloat(unidades.replace(',', '.')) : calcularUnidadesDoValor();
                    return `${formatarMoeda(valorFinal)} = ${unidadesFinal.toFixed(2).replace('.', ',')} unidades`;
                  })()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Valor da unidade: {formatarMoeda(valorUnidade)}
                </p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : 'Salvar Aposta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
