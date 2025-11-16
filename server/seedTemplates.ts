import { drizzle } from "drizzle-orm/mysql2";
import { projectTemplates } from "../drizzle/schema";

async function seedTemplates() {
  const db = drizzle(process.env.DATABASE_URL!);

  const templates = [
    {
      name: "Boulevard Gourmet - Centro Gastronômico Premium",
      description: "Template para centro gastronômico de alto padrão com foco em restaurantes, cafés e operações âncora de gastronomia",
      category: "gastronomia" as const,
      briefingTemplate: `CONCEITO ARQUITETÔNICO:
- Estilo contemporâneo sofisticado com elementos industriais
- Fachada em vidro, concreto aparente e madeira natural
- Praça central com pé-direito duplo e iluminação zenital
- Mezanino em balanço com vista para a praça
- Jardins verticais e elementos de biofilia
- Iluminação cênica e atmosfera acolhedora

PÚBLICO-ALVO:
- Classes A e B (renda familiar acima de R$ 8.000)
- Faixa etária: 25-55 anos (jovens profissionais, casais, famílias)
- Apreciadores de gastronomia de qualidade
- Frequentadores de bairros nobres e centros culturais

ÂNCORAS DESEJADAS:
1. Restaurante Premium (200-250m²) - Gastronomia autoral
2. Café Gourmet (150-180m²) - Cafeteria especializada
3. Mercado Gourmet (180-220m²) - Produtos importados e especiais
4. Cervejaria Artesanal (200m²) - Chope artesanal e petiscos

LOJAS COMPLEMENTARES:
- Restaurantes temáticos (japonês, italiano, brasileiro contemporâneo)
- Hamburguerias gourmet
- Pizzarias artesanais
- Sorveterias premium
- Confeitarias e docerias
- Wine bar
- Lojas de produtos gourmet

MATERIAIS PREFERIDOS:
- Piso: Porcelanato amadeirado ou cimento queimado
- Paredes: Concreto aparente, tijolinho à vista, painéis de madeira
- Fachada: Vidro temperado, brises de madeira, concreto
- Teto: Laje aparente com vigas metálicas, forro de madeira
- Mobiliário: Madeira de demolição, metal industrial

DIFERENCIAIS DESEJADOS:
- Praça central com mesas compartilhadas
- Iluminação cênica (spots, pendentes, LED RGB)
- Música ambiente (som profissional)
- Wi-Fi gratuito de alta velocidade
- Estações de recarga USB
- Eventos gastronômicos (food trucks, festivais)
- Horário estendido (até meia-noite)

SUSTENTABILIDADE:
- Telhado verde com horta comunitária
- Painéis solares
- Captação de água pluvial
- Compostagem de resíduos orgânicos
- Iluminação LED com sensores

REFERÊNCIAS VISUAIS:
- Time Out Market (Lisboa, São Paulo)
- Eataly (Milão, São Paulo)
- Chelsea Market (Nova York)
- Mercado de San Miguel (Madrid)`,
      typicalArea: 4200,
      typicalStoreCount: 18,
      defaultTaxaOcupacao: 70,
      defaultCoeficiente: 200,
      defaultRecuoFrontal: 5,
      defaultRecuoLateral: 3,
      defaultRecuoFundos: 3,
      anchorStores: JSON.stringify([
        "Restaurante Premium 200-250m²",
        "Café Gourmet 150-180m²",
        "Mercado Gourmet 180-220m²",
        "Cervejaria Artesanal 200m²"
      ]),
      complementaryStores: JSON.stringify([
        "Restaurante Japonês 120m²",
        "Restaurante Italiano 120m²",
        "Hamburgeria Gourmet 100m²",
        "Pizzaria Artesanal 120m²",
        "Sorveteria Premium 80m²",
        "Confeitaria 90m²",
        "Wine Bar 100m²",
        "Loja Gourmet 70m²"
      ]),
      features: JSON.stringify([
        "Praça central com pé-direito duplo",
        "Mezanino em balanço",
        "Jardins verticais",
        "Iluminação cênica",
        "Horário estendido até meia-noite",
        "Eventos gastronômicos",
        "Telhado verde com horta"
      ]),
      targetAudience: "Classes A e B, apreciadores de gastronomia, 25-55 anos",
      isActive: 1
    },
    {
      name: "Espaço Saúde & Bem-Estar - Centro Multidisciplinar",
      description: "Template para centro de serviços de saúde com clínicas, consultórios e serviços de bem-estar",
      category: "saude" as const,
      briefingTemplate: `CONCEITO ARQUITETÔNICO:
- Estilo clean e profissional com atmosfera acolhedora
- Fachada em vidro e ACM branco/azul claro
- Pátio interno com jardim zen e fonte d'água
- Iluminação natural abundante
- Cores claras e neutras (branco, bege, azul claro)
- Sinalização clara e intuitiva

PÚBLICO-ALVO:
- Classes A, B e C+ (renda familiar R$ 3.500 - R$ 15.000)
- Todas as faixas etárias (crianças, adultos, idosos)
- Moradores da região e adjacências
- Pacientes de convênios e particulares

ÂNCORAS DESEJADAS:
1. Clínica Médica Multiespecialidades (300-400m²)
2. Clínica Odontológica (250-300m²)
3. Clínica de Fisioterapia (200-250m²)
4. Farmácia (150-200m²)

LOJAS COMPLEMENTARES:
- Consultórios médicos individuais (40-60m²)
- Laboratório de análises clínicas
- Clínica de nutrição
- Centro de estética e dermatologia
- Clínica veterinária
- Ótica
- Loja de produtos naturais
- Academia/Pilates
- Psicologia e terapias

MATERIAIS PREFERIDOS:
- Piso: Porcelanato branco ou bege (fácil limpeza)
- Paredes: Gesso liso pintado em cores claras
- Fachada: Vidro temperado + ACM branco/azul
- Teto: Forro de gesso com iluminação embutida
- Mobiliário: Branco, madeira clara, cromado

DIFERENCIAIS DESEJADOS:
- Pátio interno com jardim zen (atmosfera relaxante)
- Brinquedoteca para crianças
- Sala de espera confortável com TV e revistas
- Wi-Fi gratuito
- Estacionamento coberto
- Acessibilidade total (NBR 9050)
- Elevador (se múltiplos pavimentos)
- Subsolo para estacionamento

SUSTENTABILIDADE:
- Iluminação natural maximizada
- Iluminação LED com sensores
- Ar-condicionado eficiente (inverter)
- Captação de água pluvial
- Coleta seletiva de lixo

REFERÊNCIAS VISUAIS:
- Clínicas Lavoisier (Uberlândia)
- Hospital Israelita Albert Einstein (São Paulo)
- Clínicas modernas de saúde`,
      typicalArea: 6000,
      typicalStoreCount: 28,
      defaultTaxaOcupacao: 50,
      defaultCoeficiente: 150,
      defaultRecuoFrontal: 5,
      defaultRecuoLateral: 3,
      defaultRecuoFundos: 5,
      anchorStores: JSON.stringify([
        "Clínica Médica 300-400m²",
        "Clínica Odontológica 250-300m²",
        "Clínica de Fisioterapia 200-250m²",
        "Farmácia 150-200m²"
      ]),
      complementaryStores: JSON.stringify([
        "Consultórios médicos 40-60m² (múltiplos)",
        "Laboratório de análises",
        "Nutrição 60m²",
        "Estética 80m²",
        "Veterinária 100m²",
        "Ótica 60m²",
        "Produtos naturais 50m²",
        "Pilates 100m²"
      ]),
      features: JSON.stringify([
        "Pátio interno com jardim zen",
        "Brinquedoteca",
        "Subsolo para estacionamento",
        "Acessibilidade total",
        "Elevador",
        "Iluminação natural abundante"
      ]),
      targetAudience: "Classes A, B e C+, todas as faixas etárias",
      isActive: 1
    },
    {
      name: "Morada Plaza - Centro de Conveniência de Bairro",
      description: "Template para centro comercial de vizinhança com supermercado, farmácia, padaria e serviços essenciais",
      category: "conveniencia" as const,
      briefingTemplate: `CONCEITO ARQUITETÔNICO:
- Estilo contemporâneo funcional (arquitetura de varejo)
- Fachada em alvenaria aparente + ACM colorido (setorização visual)
- Marquise contínua em toda a frente (proteção sol e chuva)
- Vitrines amplas para todas as lojas (visibilidade dos produtos)
- Iluminação de destaque nas fachadas (visibilidade noturna)
- Cores vibrantes por setor (supermercado verde, farmácia azul, alimentação vermelho)

PÚBLICO-ALVO:
- Moradores do bairro e adjacências
- Classes B2 e C+ (renda familiar R$ 3.500 - R$ 8.000)
- Faixa etária: 25-60 anos (famílias)
- Perfil: Pessoas que buscam conveniência e proximidade
- Compras rápidas no caminho casa-trabalho

ÂNCORAS DESEJADAS:
1. Supermercado de Bairro (700-900m²)
2. Farmácia 24 Horas (200-300m²)
3. Padaria Gourmet e Café (150-200m²)

LOJAS COMPLEMENTARES:
- Pizzaria e Lanchonete (120m²)
- Pet Shop (90m²)
- Lotérica e Correspondente Bancário (80m²)
- Salão de Beleza e Barbearia (100m²)
- Loja de Roupas e Calçados (80m²)
- Ótica (60m²)
- Loja de Celulares (70m²)
- Academia de Bairro (150m²)

MATERIAIS PREFERIDOS:
- Piso: Porcelanato cinza antiderrapante (alto tráfego)
- Paredes externas: Alvenaria aparente + pintura texturizada
- Fachada: ACM colorido por setor + vidro temperado
- Marquise: Estrutura metálica + telha sanduíche branca
- Calçada: Piso intertravado permeável (drenagem)
- Estacionamento: Concreto intertravado cinza

DIFERENCIAIS DESEJADOS:
- Estacionamento amplo e gratuito (150 vagas)
- Vagas cobertas próximas à entrada (30 vagas)
- Horário estendido (lojas até 22h, farmácia 24h)
- Wi-Fi gratuito em toda a área comum
- Praça de alimentação externa com mesas e guarda-sóis
- Playground infantil (área de lazer para crianças)
- Fraldário nos banheiros
- Bicicletário coberto (50 vagas)
- Caixas eletrônicos 24h

SUSTENTABILIDADE:
- Captação de água pluvial para irrigação e limpeza
- Iluminação 100% LED com sensores de presença
- Painéis solares no telhado (geração própria)
- Coleta seletiva de lixo
- Paisagismo com espécies nativas

REFERÊNCIAS VISUAIS:
- Savegnago Supermercados (interior de SP)
- Pão de Açúcar Minuto (São Paulo)
- Carrefour Express (bairros)
- Strip malls americanos (estacionamento frontal)`,
      typicalArea: 3500,
      typicalStoreCount: 17,
      defaultTaxaOcupacao: 60,
      defaultCoeficiente: 100,
      defaultRecuoFrontal: 5,
      defaultRecuoLateral: 3,
      defaultRecuoFundos: 3,
      anchorStores: JSON.stringify([
        "Supermercado de Bairro 700-900m²",
        "Farmácia 24 Horas 200-300m²",
        "Padaria Gourmet e Café 150-200m²"
      ]),
      complementaryStores: JSON.stringify([
        "Pizzaria e Lanchonete 120m²",
        "Pet Shop 90m²",
        "Lotérica 80m²",
        "Salão de Beleza 100m²",
        "Loja de Roupas 80m²",
        "Ótica 60m²",
        "Loja de Celulares 70m²",
        "Academia 150m²"
      ]),
      features: JSON.stringify([
        "Estacionamento amplo 150 vagas",
        "Playground infantil",
        "Praça de alimentação externa",
        "Farmácia 24 horas",
        "Bicicletário coberto",
        "Horário estendido"
      ]),
      targetAudience: "Moradores do bairro, classes B2 e C+, famílias",
      isActive: 1
    },
    {
      name: "Fashion Plaza - Centro de Moda e Varejo",
      description: "Template para centro comercial focado em moda, calçados, acessórios e lifestyle",
      category: "varejo" as const,
      briefingTemplate: `CONCEITO ARQUITETÔNICO:
- Estilo moderno e clean com elementos de vitrinismo
- Fachada em vidro e ACM com cores neutras (branco, cinza, preto)
- Vitrines amplas e iluminadas para destaque dos produtos
- Circulação ampla tipo galeria (corredor central)
- Iluminação LED de destaque (spots direcionáveis)
- Piso claro e polido (porcelanato branco)

PÚBLICO-ALVO:
- Classes B e C (renda familiar R$ 3.000 - R$ 10.000)
- Faixa etária: 18-45 anos (jovens e adultos)
- Perfil: Consumidores de moda, tendências e lifestyle
- Compras de lazer (finais de semana e horário estendido)

ÂNCORAS DESEJADAS:
1. Loja de Departamento / Fast Fashion (300-400m²)
2. Megastore de Calçados (200-250m²)
3. Loja de Esportes e Fitness (180-220m²)

LOJAS COMPLEMENTARES:
- Lojas de moda feminina (60-100m²)
- Lojas de moda masculina (60-80m²)
- Loja de moda infantil (70m²)
- Loja de lingerie e moda íntima (50m²)
- Loja de acessórios e bijuterias (40m²)
- Loja de bolsas e malas (50m²)
- Perfumaria e cosméticos (60m²)
- Ótica (50m²)
- Joalheria (40m²)
- Loja de celulares e eletrônicos (70m²)

MATERIAIS PREFERIDOS:
- Piso: Porcelanato polido branco ou cinza claro
- Paredes: Gesso liso pintado em branco
- Fachada: Vidro temperado + ACM branco/cinza
- Teto: Forro de gesso com spots embutidos
- Vitrines: Vidro temperado com iluminação LED

DIFERENCIAIS DESEJADOS:
- Corredor central amplo tipo galeria (4m largura)
- Iluminação de vitrine profissional (spots direcionáveis)
- Ar-condicionado central (conforto térmico)
- Música ambiente (playlist moderna)
- Wi-Fi gratuito
- Provadores amplos e bem iluminados
- Espelhos de corpo inteiro em pontos estratégicos
- Área de descanso com bancos
- Estacionamento coberto

SUSTENTABILIDADE:
- Iluminação LED em todas as áreas
- Ar-condicionado inverter (economia de energia)
- Sensores de presença em áreas de baixo fluxo
- Coleta seletiva

REFERÊNCIAS VISUAIS:
- Shopping centers de rua (Rua Oscar Freire - SP)
- Outlets premium (Catarina Fashion Outlet)
- Galerias de moda (Galeria do Rock - SP)`,
      typicalArea: 3000,
      typicalStoreCount: 20,
      defaultTaxaOcupacao: 65,
      defaultCoeficiente: 130,
      defaultRecuoFrontal: 5,
      defaultRecuoLateral: 3,
      defaultRecuoFundos: 3,
      anchorStores: JSON.stringify([
        "Loja de Departamento 300-400m²",
        "Megastore de Calçados 200-250m²",
        "Loja de Esportes 180-220m²"
      ]),
      complementaryStores: JSON.stringify([
        "Moda Feminina 60-100m² (múltiplas)",
        "Moda Masculina 60-80m²",
        "Moda Infantil 70m²",
        "Lingerie 50m²",
        "Acessórios 40m²",
        "Bolsas 50m²",
        "Perfumaria 60m²",
        "Ótica 50m²",
        "Joalheria 40m²",
        "Celulares 70m²"
      ]),
      features: JSON.stringify([
        "Corredor central tipo galeria 4m",
        "Iluminação profissional de vitrines",
        "Ar-condicionado central",
        "Provadores amplos",
        "Área de descanso",
        "Estacionamento coberto"
      ]),
      targetAudience: "Classes B e C, jovens e adultos 18-45 anos, consumidores de moda",
      isActive: 1
    },
    {
      name: "Service Hub - Centro de Serviços Essenciais",
      description: "Template para centro comercial focado em serviços do dia a dia (bancos, correios, cartórios, despachante)",
      category: "servicos" as const,
      briefingTemplate: `CONCEITO ARQUITETÔNICO:
- Estilo corporativo clean e profissional
- Fachada em vidro e ACM azul/cinza (cores sóbrias)
- Layout funcional com salas individuais
- Circulação ampla e bem sinalizada
- Iluminação natural e artificial abundante
- Cores neutras e profissionais

PÚBLICO-ALVO:
- Todas as classes sociais (A, B, C, D)
- Todas as faixas etárias (18-70 anos)
- Perfil: Pessoas que precisam resolver questões burocráticas e serviços essenciais
- Fluxo durante horário comercial (8h-18h)

ÂNCORAS DESEJADAS:
1. Agência Bancária ou Correspondente (150-200m²)
2. Correios (100-150m²)
3. Cartório (120-150m²)

LOJAS COMPLEMENTARES:
- Despachante (60m²)
- Contabilidade (80m²)
- Advocacia (70m²)
- Imobiliária (60m²)
- Seguros e previdência (50m²)
- Agência de viagens (60m²)
- Coworking / Escritórios compartilhados (150m²)
- Lan house / Cyber café (80m²)
- Papelaria e xerox (50m²)
- Lotérica (60m²)
- Chaveiro e consertos (30m²)

MATERIAIS PREFERIDOS:
- Piso: Porcelanato cinza ou bege (neutro)
- Paredes: Gesso liso pintado em cores claras
- Fachada: Vidro temperado + ACM azul/cinza
- Divisórias: Drywall com isolamento acústico
- Portas: Madeira ou vidro temperado

DIFERENCIAIS DESEJADOS:
- Salas individuais com boa acústica
- Sala de reuniões compartilhada
- Área de espera confortável com cadeiras e TV
- Wi-Fi gratuito de alta velocidade
- Impressora e scanner compartilhados
- Caixas eletrônicos 24h
- Estacionamento amplo (rotatividade alta)
- Segurança 24h
- Ar-condicionado em todas as salas

SUSTENTABILIDADE:
- Iluminação LED
- Ar-condicionado inverter
- Sensores de presença
- Papel reciclado

REFERÊNCIAS VISUAIS:
- Centros empresariais
- Edifícios comerciais de serviços
- Coworkings modernos`,
      typicalArea: 2500,
      typicalStoreCount: 15,
      defaultTaxaOcupacao: 60,
      defaultCoeficiente: 120,
      defaultRecuoFrontal: 5,
      defaultRecuoLateral: 3,
      defaultRecuoFundos: 3,
      anchorStores: JSON.stringify([
        "Agência Bancária 150-200m²",
        "Correios 100-150m²",
        "Cartório 120-150m²"
      ]),
      complementaryStores: JSON.stringify([
        "Despachante 60m²",
        "Contabilidade 80m²",
        "Advocacia 70m²",
        "Imobiliária 60m²",
        "Seguros 50m²",
        "Agência de viagens 60m²",
        "Coworking 150m²",
        "Lan house 80m²",
        "Papelaria 50m²",
        "Lotérica 60m²",
        "Chaveiro 30m²"
      ]),
      features: JSON.stringify([
        "Salas individuais com acústica",
        "Sala de reuniões compartilhada",
        "Área de espera confortável",
        "Wi-Fi de alta velocidade",
        "Caixas eletrônicos 24h",
        "Segurança 24h"
      ]),
      targetAudience: "Todas as classes e faixas etárias, serviços essenciais",
      isActive: 1
    }
  ];

  console.log("🌱 Inserindo templates pré-configurados...");

  for (const template of templates) {
    await db.insert(projectTemplates).values(template);
    console.log(`✅ Template criado: ${template.name}`);
  }

  console.log("\n🎉 Seed de templates concluído com sucesso!");
  console.log(`📊 Total de templates criados: ${templates.length}`);
  
  process.exit(0);
}

seedTemplates().catch((error) => {
  console.error("❌ Erro ao popular templates:", error);
  process.exit(1);
});
