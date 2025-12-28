import { obterOperacoes, salvarOperacoes } from './storage'
import { obterFreebets, salvarFreebets, obterExtracoes, salvarExtracoes } from './storage'
import { obterApostasPunter, salvarApostasPunter } from './punter-storage'
import { obterConfiguracoes, salvarConfiguracoes } from './punter-storage'
import { obterNotas, salvarNotas } from './storage'

export interface BackupData {
  version: string
  timestamp: string
  app_version: string
  data: {
    operacoes: any[]
    freebets: any[]
    extracoes: any[]
    apostas_punter: any[]
    configuracoes: any
    notas: string
  }
  metadata: {
    total_items: number
    data_integrity: boolean
    created_by: string
  }
}

/**
 * Cria um backup completo de todos os dados
 */
export function criarBackup(): BackupData {
  const operacoes = obterOperacoes()
  const freebets = obterFreebets()
  const extracoes = obterExtracoes()
  const apostas_punter = obterApostasPunter()
  const configuracoes = obterConfiguracoes()
  const notas = obterNotas()
  
  const totalItems = operacoes.length + freebets.length + extracoes.length + apostas_punter.length
  
  const backup: BackupData = {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    app_version: '2.0.0',
    data: {
      operacoes,
      freebets,
      extracoes,
      apostas_punter,
      configuracoes,
      notas
    },
    metadata: {
      total_items: totalItems,
      data_integrity: true,
      created_by: 'Planilha ARB v2.0'
    }
  }

  return backup
}

/**
 * Exporta backup como arquivo JSON
 */
export function exportarBackup(): void {
  try {
    const backup = criarBackup()
    const dataStr = JSON.stringify(backup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `planilha-arb-backup-${new Date().toISOString().split('T')[0]}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Erro ao exportar backup:', error)
    throw new Error('Falha ao exportar backup')
  }
}

/**
 * Restaura dados de um backup
 */
export function restaurarBackup(backupData: BackupData): void {
  try {
    if (!backupData.data) {
      throw new Error('Dados de backup inválidos')
    }

    const { data } = backupData

    // Restaurar cada tipo de dado
    if (data.operacoes) {
      salvarOperacoes(data.operacoes)
    }

    if (data.freebets) {
      salvarFreebets(data.freebets)
    }

    if (data.extracoes) {
      salvarExtracoes(data.extracoes)
    }

    if (data.apostas_punter) {
      salvarApostasPunter(data.apostas_punter)
    }

    if (data.configuracoes) {
      salvarConfiguracoes(data.configuracoes)
    }

    if (data.notas) {
      salvarNotas(data.notas)
    }

    // Disparar evento para atualizar a UI
    window.dispatchEvent(new CustomEvent('dadosRestaurados'))
    
  } catch (error) {
    console.error('Erro ao restaurar backup:', error)
    throw new Error('Falha ao restaurar backup')
  }
}

/**
 * Importa backup de arquivo
 */
export function importarBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backupData: BackupData = JSON.parse(content)
        
        // Validar estrutura do backup
        if (!backupData.version || !backupData.data) {
          throw new Error('Arquivo de backup inválido')
        }
        
        restaurarBackup(backupData)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Limpa todos os dados armazenados
 */
export function limparTodosDados(): void {
  try {
    // Limpar localStorage
    const keys = [
      'planilha-arb-operacoes',
      'planilha-arb-freebets',
      'planilha-arb-extracoes',
      'planilha-arb-apostas-punter',
      'planilha-arb-configuracoes',
      'planilha-arb-notas'
    ]
    
    keys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Disparar evento para atualizar a UI
    window.dispatchEvent(new CustomEvent('dadosLimpos'))
    
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
    throw new Error('Falha ao limpar dados')
  }
}

/**
 * Obtém estatísticas dos dados armazenados
 */
export function obterEstatisticasDados() {
  return {
    operacoes: obterOperacoes().length,
    freebets: obterFreebets().length,
    extracoes: obterExtracoes().length,
    apostas_punter: obterApostasPunter().length,
    ultima_atualizacao: new Date().toISOString()
  }
}
