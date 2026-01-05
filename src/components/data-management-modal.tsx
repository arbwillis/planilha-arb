'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trash2, 
  AlertTriangle,
  Database,
  CheckCircle,
  Target,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react'
import { 
  obterEstatisticasDetalhadas,
  limparDadosSeletivo,
  limparDadosSurebets,
  limparDadosPunter,
  limparTodosDados,
  verificarIntegridadeDados,
  type ClearOptions
} from '@/services/data-management'

interface DataManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [clearOptions, setClearOptions] = useState<ClearOptions>({})

  const stats = obterEstatisticasDetalhadas()
  const integrity = verificarIntegridadeDados()

  const handleSelectiveClean = async () => {
    try {
      setIsLoading(true)
      setMessage(null)
      
      limparDadosSeletivo(clearOptions)
      
      setMessage({
        type: 'success',
        text: 'Dados selecionados foram limpos com sucesso! A página será recarregada.'
      })
      
      setShowConfirmClear(false)
      setClearOptions({})
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao limpar dados'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickClean = async (type: 'surebets' | 'punter' | 'all') => {
    try {
      setIsLoading(true)
      setMessage(null)
      
      switch (type) {
        case 'surebets':
          limparDadosSurebets()
          break
        case 'punter':
          limparDadosPunter()
          break
        case 'all':
          limparTodosDados()
          break
      }
      
      const typeNames = {
        surebets: 'Surebets',
        punter: 'Punter',
        all: 'todos os dados'
      }
      
      setMessage({
        type: 'success',
        text: `Dados de ${typeNames[type]} foram limpos! A página será recarregada.`
      })
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao limpar dados'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const dataItems = [
    {
      key: 'operacoes' as keyof ClearOptions,
      label: 'Operações',
      description: 'Lucros, prejuízos e extrações',
      icon: TrendingUp,
      count: stats.operacoes,
      color: 'text-green-600'
    },
    {
      key: 'freebets' as keyof ClearOptions,
      label: 'Freebets',
      description: 'Freebets ativas e inativas',
      icon: Target,
      count: stats.freebets,
      color: 'text-blue-600'
    },
    {
      key: 'extracoes' as keyof ClearOptions,
      label: 'Extrações',
      description: 'Histórico de extrações',
      icon: Database,
      count: stats.extracoes,
      color: 'text-purple-600'
    },
    {
      key: 'apostas_punter' as keyof ClearOptions,
      label: 'Apostas Punter',
      description: 'Gestão de apostas punter',
      icon: Target,
      count: stats.apostas_punter,
      color: 'text-orange-600'
    },
    {
      key: 'notas' as keyof ClearOptions,
      label: 'Notas',
      description: 'Anotações pessoais',
      icon: FileText,
      count: stats.notas ? 1 : 0,
      color: 'text-gray-600'
    },
    {
      key: 'configuracoes' as keyof ClearOptions,
      label: 'Configurações',
      description: 'Preferências do app',
      icon: Settings,
      count: 1,
      color: 'text-red-600'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Gerenciamento de Dados
          </DialogTitle>
          <DialogDescription>
            Limpe dados seletivamente ou por categoria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Dados Armazenados</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {dataItems.map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}: <span className="font-medium">{item.count}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Verificação de Integridade */}
          {(!integrity.valid || integrity.recommendations.length > 0) && (
            <Alert variant={integrity.valid ? 'default' : 'destructive'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  {integrity.issues.map((issue, index) => (
                    <div key={index} className="text-sm">{issue}</div>
                  ))}
                  {integrity.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-muted-foreground">{rec}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Limpeza Rápida */}
          <div className="space-y-3">
            <h4 className="font-medium">Limpeza Rápida</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => handleQuickClean('surebets')}
                disabled={isLoading}
                variant="outline"
                className="justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Limpar dados de Surebets ({stats.operacoes + stats.freebets + stats.extracoes} itens)
              </Button>
              
              <Button
                onClick={() => handleQuickClean('punter')}
                disabled={isLoading}
                variant="outline"
                className="justify-start"
              >
                <Target className="h-4 w-4 mr-2" />
                Limpar dados de Punter ({stats.apostas_punter} itens)
              </Button>
            </div>
          </div>

          {/* Limpeza Seletiva */}
          <div className="space-y-3">
            <h4 className="font-medium">Limpeza Seletiva</h4>
            <div className="space-y-3">
              {dataItems.map(item => (
                <div key={item.key} className="flex items-center space-x-3">
                  <Checkbox
                    id={item.key}
                    checked={clearOptions[item.key] || false}
                    onCheckedChange={(checked) => 
                      setClearOptions(prev => ({ ...prev, [item.key]: checked }))
                    }
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                      {item.label} ({item.count})
                    </label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {Object.values(clearOptions).some(Boolean) && (
              <Button
                onClick={handleSelectiveClean}
                disabled={isLoading}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Limpar Itens Selecionados
              </Button>
            )}
          </div>

          {/* Limpeza Total */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-destructive">Zona de Perigo</h4>
            <Button
              onClick={() => handleQuickClean('all')}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar TODOS os Dados
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Esta ação é irreversível! Faça backup antes de prosseguir.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



