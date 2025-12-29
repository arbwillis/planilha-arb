'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { gerarId } from '@/services/storage';
import { Freebet } from '@/types';

interface RegistrarFreebetModalProps {
  aberto: boolean;
  onClose: () => void;
}

export function RegistrarFreebetModal({ aberto, onClose }: RegistrarFreebetModalProps) {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [casaDeApostas, setCasaDeApostas] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [dataAquisicao, setDataAquisicao] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [prejuizoParaAdquirir, setPrejuizoParaAdquirir] = useState('');
  const [requisito, setRequisito] = useState('');
  const [salvando, setSalvando] = useState(false);

  const resetarFormulario = () => {
    setTitulo('');
    setValor('');
    setCasaDeApostas('');
    setDataExpiracao('');
    setDataAquisicao(new Date().toISOString().split('T')[0]);
    setPrejuizoParaAdquirir('');
    setRequisito('');
  };

  const handleSalvar = async () => {
    if (!titulo || !valor || !casaDeApostas || !dataExpiracao || !dataAquisicao || !prejuizoParaAdquirir) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    const prejuizoNumerico = parseFloat(prejuizoParaAdquirir.replace(',', '.'));
    
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor, insira um valor válido para a freebet.');
      return;
    }

    if (isNaN(prejuizoNumerico) || prejuizoNumerico < 0) {
      alert('Por favor, insira um valor válido para o prejuízo de aquisição.');
      return;
    }

    setSalvando(true);

    try {
      const freebet: Freebet = {
        id: gerarId(),
        titulo,
        valor: valorNumerico,
        casaDeApostas,
        dataExpiracao,
        prejuizoParaAdquirir: prejuizoNumerico,
        requisito,
        ativa: true,
        dataAquisicao: dataAquisicao
      };

      // Salvar diretamente no localStorage
      const chave = 'planilha-arb-freebets-v2';
      const existentes = JSON.parse(localStorage.getItem(chave) || '[]');
      existentes.push(freebet);
      localStorage.setItem(chave, JSON.stringify(existentes));

      resetarFormulario();
      onClose();
      
      // Disparar evento para atualizar componentes
      window.dispatchEvent(new CustomEvent('freebetSalva', { 
        detail: { freebet } 
      }));
      
    } catch (error) {
      console.error('Erro ao salvar freebet:', error);
      alert('Erro ao salvar a freebet. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    resetarFormulario();
    onClose();
  };

  const dataMinima = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={aberto} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle 
            className="text-xl font-bold text-center"
            style={{ color: 'oklch(0.6 0.25 240)' }}
          >
            Registrar Freebet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-semibold">
                Título *
              </Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Freebet R$ 50 Betano"
                className="h-11"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-semibold">
                Valor da Freebet (R$) *
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="h-11 text-lg font-semibold"
                style={{ color: 'oklch(0.6 0.25 240)' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prejuizo" className="text-sm font-semibold">
                Prejuízo para Adquirir (R$) *
              </Label>
              <Input
                id="prejuizo"
                type="number"
                step="0.01"
                value={prejuizoParaAdquirir}
                onChange={(e) => setPrejuizoParaAdquirir(e.target.value)}
                placeholder="0,00"
                className="h-11 text-lg font-semibold text-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dataAquisicao" className="text-sm font-semibold">
                Data de Aquisição *
              </Label>
              <Input
                id="dataAquisicao"
                type="date"
                value={dataAquisicao}
                onChange={(e) => setDataAquisicao(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataExpiracao" className="text-sm font-semibold">
                Data de Expiração *
              </Label>
              <Input
                id="dataExpiracao"
                type="date"
                value={dataExpiracao}
                onChange={(e) => setDataExpiracao(e.target.value)}
                min={dataMinima}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requisito" className="text-sm font-semibold">
              Requisito/Condição para Uso
            </Label>
            <Textarea
              id="requisito"
              value={requisito}
              onChange={(e) => setRequisito(e.target.value)}
              placeholder="Ex: Apostar em odds mínimas de 2.0, válida apenas para futebol... (opcional)"
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
              className="flex-1 h-12 font-semibold"
              style={{ 
                backgroundColor: 'oklch(0.6 0.25 240)', 
                color: 'white' 
              }}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Freebet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
