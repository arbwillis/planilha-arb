'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { obterOperacoesPorMes, obterDataAtual, excluirOperacao } from '@/services/storage';
import { calcularDadosMes } from '@/services/calculos';
import { useEffect, useState, useCallback } from 'react';
import { Operacao } from '@/types';
import { TrendingUp, TrendingDown, ArrowUpDown, Search, Filter, Pencil, Trash2, Eye } from 'lucide-react';
import { EditarOperacaoModal } from './modals/editar-operacao-modal';
import { DetalhesExtracaoModal } from './modals/detalhes-extracao-modal';

export function OperationsListCard() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [operacoesFiltradas, setOperacoesFiltradas] = useState<Operacao[]>([]);
  const [lucroMes, setLucroMes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados dos filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCasa, setFiltroCasa] = useState('todas');

  // Estados do modal de edição
  const [operacaoEditando, setOperacaoEditando] = useState<Operacao | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  // Estados do modal de detalhes de extração
  const [operacaoDetalhes, setOperacaoDetalhes] = useState<Operacao | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);

  const carregarDados = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hoje = obterDataAtual();
      const operacoesMes = obterOperacoesPorMes(hoje.getFullYear(), hoje.getMonth());
      const dadosMes = calcularDadosMes(hoje.getFullYear(), hoje.getMonth());
      
      // Ordenar por data (mais recente primeiro)
      const operacoesOrdenadas = operacoesMes.sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      
      setOperacoes(operacoesOrdenadas);
      setOperacoesFiltradas(operacoesOrdenadas);
      setLucroMes(dadosMes.lucroLiquido);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Filtrar operações
  useEffect(() => {
    let resultado = [...operacoes];

    // Filtro por texto (título, descrição, casa)
    if (filtroTexto) {
      const texto = filtroTexto.toLowerCase();
      resultado = resultado.filter(op =>
        op.titulo.toLowerCase().includes(texto) ||
        op.descricao?.toLowerCase().includes(texto) ||
        op.casaDeApostas.toLowerCase().includes(texto)
      );
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(op => op.tipo === filtroTipo);
    }

    // Filtro por casa de apostas
    if (filtroCasa !== 'todas') {
      resultado = resultado.filter(op => op.casaDeApostas === filtroCasa);
    }

    setOperacoesFiltradas(resultado);
  }, [operacoes, filtroTexto, filtroTipo, filtroCasa]);

  // Obter casas de apostas únicas para o filtro
  const casasUnicas = [...new Set(operacoes.map(op => op.casaDeApostas))].sort();

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    const handleDadosAtualizados = () => {
      carregarDados();
    };

    window.addEventListener('freebetExcluida', handleDadosAtualizados);
    window.addEventListener('operacaoSalva', handleDadosAtualizados);
    window.addEventListener('freebetSalva', handleDadosAtualizados);
    window.addEventListener('operacaoAtualizada', handleDadosAtualizados);
    window.addEventListener('operacaoExcluida', handleDadosAtualizados);
    
    return () => {
      window.removeEventListener('freebetExcluida', handleDadosAtualizados);
      window.removeEventListener('operacaoSalva', handleDadosAtualizados);
      window.removeEventListener('freebetSalva', handleDadosAtualizados);
      window.removeEventListener('operacaoAtualizada', handleDadosAtualizados);
      window.removeEventListener('operacaoExcluida', handleDadosAtualizados);
    };
  }, [carregarDados]);

  const handleEditarOperacao = (operacao: Operacao) => {
    setOperacaoEditando(operacao);
    setModalEditarAberto(true);
  };

  const handleExcluirOperacao = (operacao: Operacao) => {
    const tipoFormatado = operacao.tipo === 'lucro' ? 'lucro' : 
                          operacao.tipo === 'prejuizo' ? 'prejuízo' : 'extração';
    
    if (confirm(`Tem certeza que deseja excluir esta operação de ${tipoFormatado}?\n\n"${operacao.titulo}" - R$ ${operacao.valor.toFixed(2)}\n\nEsta ação não pode ser desfeita.`)) {
      const sucesso = excluirOperacao(operacao.id);
      
      if (sucesso) {
        carregarDados();
        
        // Disparar evento para atualizar todos os componentes
        window.dispatchEvent(new CustomEvent('operacaoExcluida', { 
          detail: { operacaoId: operacao.id } 
        }));
      } else {
        alert('Erro ao excluir a operação.');
      }
    }
  };

  const handleFecharModalEditar = () => {
    setModalEditarAberto(false);
    setOperacaoEditando(null);
  };

  const handleVerDetalhesExtracao = (operacao: Operacao) => {
    setOperacaoDetalhes(operacao);
    setModalDetalhesAberto(true);
  };

  const handleFecharModalDetalhes = () => {
    setModalDetalhesAberto(false);
    setOperacaoDetalhes(null);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obterIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'lucro':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'prejuizo':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'extracao':
        return <ArrowUpDown className="w-4 h-4" style={{ color: 'oklch(0.6 0.25 240)' }} />;
      default:
        return null;
    }
  };

  const obterCorValor = (tipo: string) => {
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

  const obterTipoFormatado = (tipo: string) => {
    switch (tipo) {
      case 'lucro':
        return 'Lucro';
      case 'prejuizo':
        return 'Prejuízo';
      case 'extracao':
        return 'Extração';
      default:
        return tipo;
    }
  };

  const mesAtual = obterDataAtual().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              Operações de {mesAtual}
            </CardTitle>
            <div className="flex gap-3">
              <Badge 
                variant="secondary" 
                className={`text-base px-3 py-2 font-semibold ${
                  lucroMes >= 0 ? 'bg-green-600' : 'bg-red-600'
                } text-white`}
              >
                {formatarMoeda(lucroMes)}
              </Badge>
              <Badge 
                variant="secondary" 
                className="text-base px-3 py-2 font-semibold"
                style={{ backgroundColor: 'oklch(0.45 0.15 270)', color: 'white' }}
              >
                {operacoes.length} operações
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filtros */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Filtro por texto */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descrição..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por tipo */}
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="lucro">Lucro</SelectItem>
                  <SelectItem value="prejuizo">Prejuízo</SelectItem>
                  <SelectItem value="extracao">Extração</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por casa de apostas */}
              <Select value={filtroCasa} onValueChange={setFiltroCasa}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por casa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as casas</SelectItem>
                  {casasUnicas.map(casa => (
                    <SelectItem key={casa} value={casa}>{casa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contador de resultados */}
            {operacoesFiltradas.length !== operacoes.length && (
              <div className="text-sm text-muted-foreground">
                Mostrando {operacoesFiltradas.length} de {operacoes.length} operações
              </div>
            )}
          </div>

          {operacoes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>Nenhuma operação encontrada neste mês.</p>
              <p className="text-sm mt-2">Registre uma operação para começar!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Casa</TableHead>
                    <TableHead className="hidden lg:table-cell">Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operacoesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        Nenhuma operação encontrada com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    operacoesFiltradas.map((operacao) => (
                    <TableRow key={operacao.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">
                        {formatarDataHora(operacao.data)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {obterIconeTipo(operacao.tipo)}
                          <span className="text-sm font-medium">
                            {obterTipoFormatado(operacao.tipo)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[150px]" title={operacao.titulo}>
                          {operacao.titulo}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-[100px]" title={operacao.casaDeApostas}>
                          {operacao.casaDeApostas}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs hidden lg:table-cell">
                        <div className="truncate text-sm text-muted-foreground">
                          {operacao.descricao || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${obterCorValor(operacao.tipo)}`}>
                          {operacao.tipo === 'prejuizo' ? '-' : '+'}{formatarMoeda(operacao.valor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {operacao.tipo === 'extracao' ? (
                          <div className="flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalhesExtracao(operacao)}
                              className="h-8 w-8 p-0 hover:bg-violet-100 dark:hover:bg-violet-900"
                              title="Ver detalhes da extração"
                            >
                              <Eye className="h-4 w-4" style={{ color: 'oklch(0.6 0.25 240)' }} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditarOperacao(operacao)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                              title="Editar valor"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExcluirOperacao(operacao)}
                              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                              title="Excluir operação"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <EditarOperacaoModal
        operacao={operacaoEditando}
        aberto={modalEditarAberto}
        onClose={handleFecharModalEditar}
        onSucesso={carregarDados}
      />

      {/* Modal de Detalhes da Extração */}
      <DetalhesExtracaoModal
        operacao={operacaoDetalhes}
        aberto={modalDetalhesAberto}
        onClose={handleFecharModalDetalhes}
      />
    </>
  );
}
