'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { obterOperacoesPorMes, obterDataAtual } from '@/services/storage';
import { calcularDadosMes } from '@/services/calculos';
import { useEffect, useState, useCallback } from 'react';
import { Operacao } from '@/types';
import { TrendingUp, TrendingDown, ArrowUpDown, Search, Filter } from 'lucide-react';

export function OperationsListCard() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [operacoesFiltradas, setOperacoesFiltradas] = useState<Operacao[]>([]);
  const [lucroMes, setLucroMes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados dos filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCasa, setFiltroCasa] = useState('todas');

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
    let operacoesFiltradas = [...operacoes];

    // Filtro por texto (título, descrição, casa)
    if (filtroTexto) {
      const texto = filtroTexto.toLowerCase();
      operacoesFiltradas = operacoesFiltradas.filter(op =>
        op.titulo.toLowerCase().includes(texto) ||
        op.descricao?.toLowerCase().includes(texto) ||
        op.casaDeApostas.toLowerCase().includes(texto)
      );
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      operacoesFiltradas = operacoesFiltradas.filter(op => op.tipo === filtroTipo);
    }

    // Filtro por casa de apostas
    if (filtroCasa !== 'todas') {
      operacoesFiltradas = operacoesFiltradas.filter(op => op.casaDeApostas === filtroCasa);
    }

    setOperacoesFiltradas(operacoesFiltradas);
  }, [operacoes, filtroTexto, filtroTipo, filtroCasa]);

  // Obter casas de apostas únicas para o filtro
  const casasUnicas = [...new Set(operacoes.map(op => op.casaDeApostas))].sort();

  // Escutar eventos de mudanças nos dados
  useEffect(() => {
    const handleFreebetExcluida = () => {
      carregarDados();
    };

    const handleOperacaoSalva = () => {
      carregarDados();
    };

    const handleFreebetSalva = () => {
      carregarDados();
    };

    window.addEventListener('freebetExcluida', handleFreebetExcluida);
    window.addEventListener('operacaoSalva', handleOperacaoSalva);
    window.addEventListener('freebetSalva', handleFreebetSalva);
    
    return () => {
      window.removeEventListener('freebetExcluida', handleFreebetExcluida);
      window.removeEventListener('operacaoSalva', handleOperacaoSalva);
      window.removeEventListener('freebetSalva', handleFreebetSalva);
    };
  }, [carregarDados]);

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

  const obterCorValor = (tipo: string, valor: number) => {
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
                  <TableHead>Casa</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Nenhuma operação encontrada com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  operacoesFiltradas.map((operacao) => (
                  <TableRow key={operacao.id}>
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
                      {operacao.titulo}
                    </TableCell>
                    <TableCell>{operacao.casaDeApostas}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-muted-foreground">
                        {operacao.descricao || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${obterCorValor(operacao.tipo, operacao.valor)}`}>
                        {operacao.tipo === 'prejuizo' ? '-' : '+'}{formatarMoeda(operacao.valor)}
                      </span>
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
  );
}
