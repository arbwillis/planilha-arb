import { obterOperacoes, obterFreebets, obterExtracoes, obterNotas } from './storage'
import { obterApostasPunter, obterConfiguracoes } from './punter-storage'
import { exportarBackup, importarBackup, BackupData } from './backup-restore'

export interface DataStats {
  operacoes: number
  freebets: number
  extracoes: number
  apostas_punter: number
  notas: boolean
  configuracoes: boolean
  ultima_atualizacao: string
}

export interface ClearOptions {
  operacoes?: boolean
  freebets?: boolean
  extracoes?: boolean
  apostas_punter?: boolean
  configuracoes?: boolean
  notas?: boolean
}

/**
 * Obtém estatísticas detalhadas dos dados
 */
export function obterEstatisticasDetalhadas(): DataStats {
  return {
    operacoes: obterOperacoes().length,
    freebets: obterFreebets().length,
    extracoes: obterExtracoes().length,
    apostas_punter: obterApostasPunter().length,
    notas: obterNotas().trim().length > 0,
    configuracoes: true, // Sempre existe
    ultima_atualizacao: new Date().toISOString()
  }
}

/**
 * Limpa dados seletivamente
 */
export function limparDadosSeletivo(options: ClearOptions): void {
  try {
    const keys = []
    
    if (options.operacoes) {
      localStorage.removeItem('planilha-arb-operacoes-v2')
      localStorage.removeItem('planilha-arb-operacoes') // Legacy
      keys.push('operações')
    }
    
    if (options.freebets) {
      localStorage.removeItem('planilha-arb-freebets-v2')
      localStorage.removeItem('planilha-arb-freebets') // Legacy
      keys.push('freebets')
    }
    
    if (options.extracoes) {
      localStorage.removeItem('planilha-arb-extracoes-v2')
      localStorage.removeItem('planilha-arb-extracoes') // Legacy
      keys.push('extrações')
    }
    
    if (options.apostas_punter) {
      localStorage.removeItem('planilha-arb-apostas-punter')
      localStorage.removeItem('betting-app-apostas-punter') // Legacy
      keys.push('apostas punter')
    }
    
    if (options.configuracoes) {
      localStorage.removeItem('planilha-arb-configuracoes')
      localStorage.removeItem('betting-app-configuracoes') // Legacy
      keys.push('configurações')
    }
    
    if (options.notas) {
      localStorage.removeItem('planilha-arb-notas-v2')
      localStorage.removeItem('planilha-arb-notas') // Legacy
      keys.push('notas')
    }
    
    // Disparar evento para atualizar a UI
    window.dispatchEvent(new CustomEvent('dadosLimpos', { 
      detail: { 
        cleared: keys,
        type: 'selective' 
      } 
    }))
    
  } catch (error) {
    console.error('Erro ao limpar dados seletivamente:', error)
    throw new Error('Falha ao limpar dados selecionados')
  }
}

/**
 * Limpa apenas dados de Surebets (operações, freebets, extrações)
 */
export function limparDadosSurebets(): void {
  limparDadosSeletivo({
    operacoes: true,
    freebets: true,
    extracoes: true
  })
}

/**
 * Limpa apenas dados de Punter (apostas punter)
 */
export function limparDadosPunter(): void {
  limparDadosSeletivo({
    apostas_punter: true
  })
}

/**
 * Limpa TODOS os dados (mantém compatibilidade)
 */
export function limparTodosDados(): void {
  limparDadosSeletivo({
    operacoes: true,
    freebets: true,
    extracoes: true,
    apostas_punter: true,
    configuracoes: true,
    notas: true
  })
}

/**
 * Verifica integridade dos dados
 */
export function verificarIntegridadeDados(): {
  valid: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  
  try {
    // Verificar se dados podem ser carregados
    const operacoes = obterOperacoes()
    const freebets = obterFreebets()
    const extracoes = obterExtracoes()
    const apostas = obterApostasPunter()
    
    // Verificar consistência de datas
    const hoje = new Date()
    const umAnoAtras = new Date()
    umAnoAtras.setFullYear(hoje.getFullYear() - 1)
    
    const operacoesAntigas = operacoes.filter(op => {
      try {
        return new Date(op.data) < umAnoAtras
      } catch {
        return false
      }
    })
    
    if (operacoesAntigas.length > 0) {
      recommendations.push(`${operacoesAntigas.length} operações com mais de 1 ano encontradas. Considere fazer backup e arquivar.`)
    }
    
    // Verificar freebets expiradas
    const freebetsExpiradas = freebets.filter(fb => {
      try {
        return fb.ativa && new Date(fb.dataExpiracao) < hoje
      } catch {
        return false
      }
    })
    
    if (freebetsExpiradas.length > 0) {
      issues.push(`${freebetsExpiradas.length} freebets expiradas ainda marcadas como ativas.`)
      recommendations.push('Execute a limpeza automática de freebets expiradas.')
    }
    
    return {
      valid: issues.length === 0,
      issues,
      recommendations
    }
    
  } catch (error) {
    issues.push('Erro ao verificar integridade dos dados: ' + error)
    return {
      valid: false,
      issues,
      recommendations: ['Considere fazer backup e restaurar os dados.']
    }
  }
}

/**
 * Cria backup automático baseado em critérios
 */
export function criarBackupAutomatico(): boolean {
  try {
    const stats = obterEstatisticasDetalhadas()
    const totalItems = stats.operacoes + stats.freebets + stats.extracoes + stats.apostas_punter
    
    // Só cria backup se há dados suficientes
    if (totalItems >= 10) {
      exportarBackup()
      return true
    }
    
    return false
  } catch (error) {
    console.error('Erro ao criar backup automático:', error)
    return false
  }
}

