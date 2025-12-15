#!/usr/bin/env node

/**
 * Script de Verificação de Variáveis de Ambiente VITE
 * 
 * Este script verifica se as variáveis de ambiente necessárias
 * estão configuradas corretamente no projeto.
 */

console.log('\n🔍 Verificando Variáveis de Ambiente VITE\n');
console.log('='.repeat(60));

// Lista de variáveis VITE esperadas
const requiredVars = [
  'VITE_GOOGLE_MAPS_API_KEY',
];

const optionalVars = [
  'VITE_APP_TITLE',
  'VITE_APP_LOGO',
  'VITE_APP_ID',
  'VITE_ANALYTICS_ENDPOINT',
  'VITE_ANALYTICS_WEBSITE_ID',
  'VITE_FRONTEND_FORGE_API_KEY',
  'VITE_FRONTEND_FORGE_API_URL',
  'VITE_OAUTH_PORTAL_URL',
];

let hasErrors = false;

// Verificar variáveis obrigatórias
console.log('\n📋 Variáveis Obrigatórias:\n');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const maskedValue = value.length > 10 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : '***';
    console.log(`  ✅ ${varName}`);
    console.log(`     Valor: ${maskedValue}`);
    console.log(`     Tamanho: ${value.length} caracteres`);
  } else {
    console.log(`  ❌ ${varName} - NÃO CONFIGURADA`);
    hasErrors = true;
  }
});

// Verificar variáveis opcionais
console.log('\n📋 Variáveis Opcionais:\n');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = value.length > 50 
      ? `${value.substring(0, 47)}...`
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ⚠️  ${varName} - não configurada`);
  }
});

// Listar todas as variáveis VITE_ disponíveis
console.log('\n📦 Todas as Variáveis VITE_ Disponíveis:\n');
const allViteVars = Object.keys(process.env)
  .filter(key => key.startsWith('VITE_'))
  .sort();

if (allViteVars.length > 0) {
  allViteVars.forEach(varName => {
    console.log(`  • ${varName}`);
  });
} else {
  console.log('  ⚠️  Nenhuma variável VITE_ encontrada');
}

// Resumo
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('\n❌ ERRO: Variáveis obrigatórias não configuradas!');
  console.log('\n📝 Como resolver:');
  console.log('   1. Acesse o painel de gerenciamento do projeto');
  console.log('   2. Vá em Settings → Secrets');
  console.log('   3. Adicione a variável VITE_GOOGLE_MAPS_API_KEY');
  console.log('   4. Reinicie o servidor de desenvolvimento');
  console.log('\n💡 Obtenha uma chave em: https://console.cloud.google.com/google/maps-apis\n');
  process.exit(1);
} else {
  console.log('\n✅ Todas as variáveis obrigatórias estão configuradas!\n');
  process.exit(0);
}
