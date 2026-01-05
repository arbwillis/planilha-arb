'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Database,
  CheckCircle
} from 'lucide-react'
import { 
  exportarBackup, 
  importarBackup, 
  limparTodosDados,
  obterEstatisticasDados 
} from '@/services/backup-restore'

interface BackupRestoreModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BackupRestoreModal({ isOpen, onClose }: BackupRestoreModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stats = obterEstatisticasDados()

  const handleExportBackup = async () => {
    try {
      setIsLoading(true)
      setMessage(null)
      
      exportarBackup()
      
      setMessage({
        type: 'success',
        text: 'Backup exportado com sucesso!'
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao exportar backup'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setMessage(null)
      
      await importarBackup(file)
      
      setMessage({
        type: 'success',
        text: 'Backup importado com sucesso! A página será recarregada.'
      })
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao importar backup'
      })
    } finally {
      setIsLoading(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearAllData = async () => {
    try {
      setIsLoading(true)
      setMessage(null)
      
      limparTodosDados()
      
      setMessage({
        type: 'success',
        text: 'Todos os dados foram limpos! A página será recarregada.'
      })
      
      setShowConfirmClear(false)
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup e Restore
          </DialogTitle>
          <DialogDescription>
            Gerencie seus dados com segurança
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Dados Armazenados</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Operações: <span className="font-medium">{stats.operacoes}</span></div>
              <div>Freebets: <span className="font-medium">{stats.freebets}</span></div>
              <div>Extrações: <span className="font-medium">{stats.extracoes}</span></div>
              <div>Apostas Punter: <span className="font-medium">{stats.apostas_punter}</span></div>
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Exportar Backup */}
          <div className="space-y-2">
            <Label>Exportar Backup</Label>
            <Button
              onClick={handleExportBackup}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Exportando...' : 'Baixar Backup'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Salva todos os seus dados em um arquivo JSON
            </p>
          </div>

          {/* Importar Backup */}
          <div className="space-y-2">
            <Label>Importar Backup</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                variant="outline"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Restaura dados de um arquivo de backup
            </p>
          </div>

          {/* Limpar Dados */}
          <div className="space-y-2">
            <Label className="text-destructive">Zona de Perigo</Label>
            {!showConfirmClear ? (
              <Button
                onClick={() => setShowConfirmClear(true)}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </Button>
            ) : (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta ação é irreversível! Todos os dados serão perdidos.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClearAllData}
                    disabled={isLoading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Limpeza
                  </Button>
                  <Button
                    onClick={() => setShowConfirmClear(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Remove permanentemente todos os dados armazenados
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



