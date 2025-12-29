'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { obterFreebetsAtivas, excluirFreebet } from '@/services/storage';
import { obterTotalFreebetsAtivas } from '@/services/calculos';
import { useEffect, useState } from 'react';
import { Freebet } from '@/types';
import { ExtracaoFreebetModal } from './modals/extracao-freebet-modal';
import { Trash2 } from 'lucide-react';

export function FreebetsListCard() {
  const [freebetsAtivas, setFreebetsAtivas] = useState<Freebet[]>([]);
  const [totalFreebets, setTotalFreebets] = useState(0);
  const [freebetSelecionada, setFreebetSelecionada] = useState<Freebet | null>(null);
  const [modalExtracaoAberto, setModalExtracaoAberto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const carregarFreebets = () => {
    if (typeof window !== 'undefined') {
      const freebets = obterFreebetsAtivas();
      const total = obterTotalFreebetsAtivas();
      setFreebetsAtivas(freebets);
      setTotalFreebets(total);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarFreebets();
  }, []);

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    const handleFreebetExcluida = () => {
      carregarFreebets();
    };

    const handleFreebetSalva = () => {
      carregarFreebets();
    };

    window.addEventListener('freebetExcluida', handleFreebetExcluida);
    window.addEventListener('freebetSalva', handleFreebetSalva);
    
    return () => {
      window.removeEventListener('freebetExcluida', handleFreebetExcluida);
      window.removeEventListener('freebetSalva', handleFreebetSalva);
    };
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const diasParaExpirar = (dataExpiracao: string) => {
    const hoje = new Date();
    const expiracao = new Date(dataExpiracao);
    const diffTime = expiracao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleClickFreebet = (freebet: Freebet) => {
    setFreebetSelecionada(freebet);
    setModalExtracaoAberto(true);
  };

  const handleCloseModal = () => {
    setModalExtracaoAberto(false);
    setFreebetSelecionada(null);
    carregarFreebets(); // Recarregar a lista após extração
  };

  const handleExcluirFreebet = (freebet: Freebet, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (confirm(`Tem certeza que deseja excluir a freebet "${freebet.titulo}"?`)) {
      const dataAquisicao = freebet.dataAquisicao;
      excluirFreebet(freebet.id);
      carregarFreebets();
      
      window.dispatchEvent(new CustomEvent('freebetExcluida', { 
        detail: { 
          freebetId: freebet.id, 
          freebetData: freebet,
          dataAquisicao: dataAquisicao
        } 
      }));
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              Freebets Ativas
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="text-base px-3 py-2 font-semibold"
              style={{ backgroundColor: 'oklch(0.6 0.25 240)', color: 'white' }}
            >
              {formatarMoeda(totalFreebets)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          {freebetsAtivas.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground flex-1 flex flex-col justify-center">
              <p className="text-sm">Nenhuma freebet ativa encontrada.</p>
              <p className="text-xs mt-1">Registre uma freebet para começar!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Título</TableHead>
                    <TableHead className="text-xs">Valor</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Casa</TableHead>
                    <TableHead className="text-xs">Expira</TableHead>
                    <TableHead className="text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {freebetsAtivas.map((freebet) => {
                    const diasRestantes = diasParaExpirar(freebet.dataExpiracao);
                    const expirandoSoon = diasRestantes <= 3;
                    
                    return (
                      <TableRow key={freebet.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium text-sm py-2">
                          <div className="truncate max-w-[120px]" title={freebet.titulo}>
                            {freebet.titulo}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span style={{ color: 'oklch(0.6 0.25 240)' }} className="font-semibold text-sm">
                            {formatarMoeda(freebet.valor)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm py-2 hidden sm:table-cell">
                          <div className="truncate max-w-[80px]" title={freebet.casaDeApostas}>
                            {freebet.casaDeApostas}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-col">
                            <span className="text-xs">
                              {formatarData(freebet.dataExpiracao)}
                            </span>
                            <Badge 
                              variant={expirandoSoon ? "destructive" : "secondary"}
                              className="text-xs w-fit mt-1 px-1"
                            >
                              {diasRestantes > 0 ? `${diasRestantes}d` : 'Exp'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleClickFreebet(freebet)}
                              className="h-8 px-2 text-xs"
                              style={{ 
                                backgroundColor: 'oklch(0.6 0.25 240)', 
                                color: 'white' 
                              }}
                            >
                              Extrair
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => handleExcluirFreebet(freebet, e)}
                              className="h-8 w-8 p-0"
                              title="Excluir freebet"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Extração */}
      {freebetSelecionada && (
        <ExtracaoFreebetModal
          freebet={freebetSelecionada}
          aberto={modalExtracaoAberto}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
