// Script de debug para testar localStorage de freebets
console.log('🔍 TESTANDO FREEBETS NO LOCALSTORAGE...');

// Simular dados de teste
const freebetTeste = {
  id: 'test-' + Date.now(),
  titulo: 'Freebet Teste',
  valor: 50,
  casaDeApostas: 'Teste Casa',
  dataExpiracao: '2025-01-30',
  prejuizoParaAdquirir: 10,
  requisito: 'Teste requisito',
  ativa: true,
  dataAquisicao: '2025-01-01'
};

// Testar chaves diferentes
const chaves = [
  'planilha-arb-freebets-v2',
  'planilha-arb-freebets',
  'betting-app-freebets',
  'freebets'
];

console.log('📋 Verificando chaves existentes:');
chaves.forEach(chave => {
  const dados = localStorage.getItem(chave);
  console.log(`${chave}: ${dados ? `${dados.length} chars` : 'null'}`);
  if (dados) {
    try {
      const parsed = JSON.parse(dados);
      console.log(`  - Dados: ${Array.isArray(parsed) ? parsed.length + ' items' : typeof parsed}`);
    } catch (e) {
      console.log(`  - Erro ao parsear: ${e.message}`);
    }
  }
});

// Testar salvamento
console.log('\n💾 Testando salvamento...');
const chaveCorreta = 'planilha-arb-freebets-v2';

// Obter dados existentes
let freebetsExistentes = [];
try {
  const dados = localStorage.getItem(chaveCorreta);
  freebetsExistentes = dados ? JSON.parse(dados) : [];
  console.log(`Freebets existentes: ${freebetsExistentes.length}`);
} catch (e) {
  console.log(`Erro ao obter freebets existentes: ${e.message}`);
}

// Adicionar nova freebet
freebetsExistentes.push(freebetTeste);
localStorage.setItem(chaveCorreta, JSON.stringify(freebetsExistentes));

// Verificar se foi salvo
const verificacao = localStorage.getItem(chaveCorreta);
const freebetsSalvas = JSON.parse(verificacao);
console.log(`✅ Freebets após salvamento: ${freebetsSalvas.length}`);
console.log(`✅ Última freebet: ${freebetsSalvas[freebetsSalvas.length - 1].titulo}`);

console.log('\n🎯 TESTE CONCLUÍDO!');
