/**
 * Script de teste para validar correções de consistência
 * Cria projeto de teste e valida geração de cortes arquitetônicos
 */

import 'dotenv/config';

const API_BASE = 'http://localhost:3000/api/trpc';

// Simular autenticação (usando owner)
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID;

async function trpcCall(procedure, input = {}) {
  const url = `${API_BASE}/${procedure}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-user': OWNER_OPEN_ID, // Simular autenticação para teste
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TRPC call failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.result?.data;
}

async function main() {
  console.log('🧪 Iniciando teste de validação de consistência...\n');

  try {
    // 1. Criar projeto de teste
    console.log('📝 Criando projeto de teste...');
    const project = await trpcCall('project.create', {
      name: 'Teste Consistência - Strip Mall Exemplo',
      area: 5000,
      width: 80,
      length: 62.5,
      latitude: '-23.5505',
      longitude: '-46.6333',
      polygonCoordinates: JSON.stringify([
        { lat: -23.5505, lng: -46.6333 },
        { lat: -23.5510, lng: -46.6333 },
        { lat: -23.5510, lng: -46.6340 },
        { lat: -23.5505, lng: -46.6340 },
      ]),
      briefing: 'Strip mall comercial com mix de lojas: farmácia âncora, lojas de conveniência, restaurante e serviços. Fachada moderna com brises horizontais e vidro. Estacionamento frontal com 60 vagas.',
      taxaOcupacao: 70,
      coeficienteAproveitamento: 100,
      recuoFrontal: 5,
      recuoLateral: 3,
      recuoFundos: 3,
    });

    console.log(`✅ Projeto criado: ID ${project.id}`);
    console.log(`   - Área: ${project.area}m²`);
    console.log(`   - Dimensões: ${project.width}m x ${project.length}m\n`);

    // 2. Executar análise volumétrica
    console.log('🔍 Executando análise volumétrica...');
    const analysis = await trpcCall('project.analyzeVolumetry', {
      projectId: project.id,
    });

    console.log(`✅ Análise concluída:`);
    console.log(`   - Número de lojas: ${analysis.numeroLojas}`);
    console.log(`   - Área construída: ${analysis.areaMaximaConstruida}m²`);
    console.log(`   - Vagas de estacionamento: ${analysis.vagasEstacionamento}`);
    console.log(`   - Altura da edificação: ${analysis.volumetriaHeight}m\n`);

    // 3. Gerar DNA do projeto
    console.log('🧬 Gerando DNA do projeto...');
    // DNA é gerado automaticamente na primeira chamada de geração de imagem

    // 4. Gerar cortes arquitetônicos
    console.log('🏗️  Gerando cortes arquitetônicos...\n');

    console.log('   Gerando corte longitudinal...');
    const longitudinal = await trpcCall('image.generateLongitudinalSection', {
      projectId: project.id,
    });
    console.log(`   ✅ Corte longitudinal gerado`);
    console.log(`   URL: ${longitudinal.imageUrl}`);

    console.log('\n   Gerando corte transversal...');
    const transversal = await trpcCall('image.generateTransversalSection', {
      projectId: project.id,
    });
    console.log(`   ✅ Corte transversal gerado`);
    console.log(`   URL: ${transversal.imageUrl}`);

    // 5. Validar consistência dos prompts
    console.log('\n📊 Validando consistência dos prompts...\n');

    const validations = [];

    // Validar corte longitudinal
    console.log('🔍 Validando corte longitudinal:');
    const longChecks = {
      'Número de lojas': longitudinal.prompt.includes(analysis.numeroLojas.toString()),
      'Área total': longitudinal.prompt.includes(project.area.toString()),
      'Dimensões': longitudinal.prompt.includes(project.width.toString()) && longitudinal.prompt.includes(project.length.toString()),
      'Briefing': longitudinal.prompt.toLowerCase().includes('briefing'),
      'Geometria': longitudinal.prompt.toLowerCase().includes('geometry'),
      'Critical requirements': longitudinal.prompt.includes('CRITICAL'),
    };

    for (const [check, passed] of Object.entries(longChecks)) {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      validations.push({ section: 'Longitudinal', check, passed });
    }

    // Validar corte transversal
    console.log('\n🔍 Validando corte transversal:');
    const transChecks = {
      'Número de lojas': transversal.prompt.includes(analysis.numeroLojas.toString()),
      'Área total': transversal.prompt.includes(project.area.toString()),
      'Dimensões': transversal.prompt.includes(project.width.toString()) && transversal.prompt.includes(project.length.toString()),
      'Briefing': transversal.prompt.toLowerCase().includes('briefing'),
      'Geometria': transversal.prompt.toLowerCase().includes('geometry'),
      'Critical requirements': transversal.prompt.includes('CRITICAL'),
    };

    for (const [check, passed] of Object.entries(transChecks)) {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      validations.push({ section: 'Transversal', check, passed });
    }

    // 6. Resumo
    const totalChecks = validations.length;
    const passedChecks = validations.filter(v => v.passed).length;
    const failedChecks = totalChecks - passedChecks;

    console.log('\n' + '='.repeat(60));
    console.log('📈 RESUMO DO TESTE');
    console.log('='.repeat(60));
    console.log(`Total de validações: ${totalChecks}`);
    console.log(`✅ Aprovadas: ${passedChecks}`);
    console.log(`❌ Reprovadas: ${failedChecks}`);
    console.log(`📊 Taxa de sucesso: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (failedChecks === 0) {
      console.log('\n🎉 TESTE PASSOU! Todas as validações foram aprovadas.');
      console.log('As correções de consistência estão funcionando corretamente.\n');
    } else {
      console.log('\n⚠️  TESTE FALHOU! Algumas validações não passaram.');
      console.log('Revise as correções implementadas.\n');
      process.exit(1);
    }

    // Informações adicionais
    console.log('📋 Informações do projeto de teste:');
    console.log(`   - ID do projeto: ${project.id}`);
    console.log(`   - Nome: ${project.name}`);
    console.log(`   - Acesse o projeto em: http://localhost:3000/projeto/${project.id}\n`);

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
