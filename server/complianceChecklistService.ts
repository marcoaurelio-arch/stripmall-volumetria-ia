/**
 * Serviço de checklist de conformidade
 * Validações automáticas de código de obras, bombeiros e normas ambientais
 */

export interface ComplianceCheck {
  id: string;
  category: "building_code" | "fire_safety" | "environmental" | "accessibility" | "parking";
  requirement: string;
  description: string;
  status: "compliant" | "non_compliant" | "not_applicable" | "pending";
  severity: "critical" | "high" | "medium" | "low";
  reference?: string; // Referência legal (NBR, lei municipal, etc)
  recommendation?: string;
}

export interface ComplianceReport {
  projectId: number;
  totalChecks: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  notApplicable: number;
  overallStatus: "approved" | "conditional" | "rejected";
  checks: ComplianceCheck[];
  generatedAt: Date;
}

/**
 * Gera checklist de conformidade para strip mall
 */
export function generateComplianceChecklist(params: {
  projectId: number;
  area: number; // Área do terreno
  totalBuiltArea: number; // Área construída total
  commercialArea: number; // Área comercial
  parkingSpaces: number; // Vagas de estacionamento
  parkingArea: number; // Área de estacionamento
  permeableArea: number; // Área permeável
  setbackFront: number; // Recuo frontal
  setbackSide: number; // Recuo lateral
  setbackRear: number; // Recuo de fundos
  occupancyRate: number; // Taxa de ocupação (%)
  buildingCoefficient: number; // Coeficiente de aproveitamento
  numberOfStores: number; // Número de lojas
  state: string; // Estado
}): ComplianceReport {
  const checks: ComplianceCheck[] = [];

  // ========== CÓDIGO DE OBRAS ==========
  
  // Recuos mínimos
  checks.push({
    id: "building_setback_front",
    category: "building_code",
    requirement: "Recuo frontal mínimo",
    description: `Recuo frontal de ${params.setbackFront}m`,
    status: params.setbackFront >= 5 ? "compliant" : "non_compliant",
    severity: "critical",
    reference: "Lei de Uso e Ocupação do Solo",
    recommendation: params.setbackFront < 5 ? "Aumentar recuo frontal para no mínimo 5m" : undefined,
  });

  checks.push({
    id: "building_setback_side",
    category: "building_code",
    requirement: "Recuo lateral mínimo",
    description: `Recuo lateral de ${params.setbackSide}m`,
    status: params.setbackSide >= 3 ? "compliant" : "non_compliant",
    severity: "high",
    reference: "Lei de Uso e Ocupação do Solo",
    recommendation: params.setbackSide < 3 ? "Aumentar recuo lateral para no mínimo 3m" : undefined,
  });

  checks.push({
    id: "building_setback_rear",
    category: "building_code",
    requirement: "Recuo de fundos mínimo",
    description: `Recuo de fundos de ${params.setbackRear}m`,
    status: params.setbackRear >= 3 ? "compliant" : "non_compliant",
    severity: "high",
    reference: "Lei de Uso e Ocupação do Solo",
    recommendation: params.setbackRear < 3 ? "Aumentar recuo de fundos para no mínimo 3m" : undefined,
  });

  // Taxa de ocupação
  checks.push({
    id: "building_occupancy_rate",
    category: "building_code",
    requirement: "Taxa de ocupação",
    description: `Taxa de ocupação de ${params.occupancyRate.toFixed(1)}%`,
    status: params.occupancyRate <= 70 ? "compliant" : "non_compliant",
    severity: "critical",
    reference: "Lei de Uso e Ocupação do Solo",
    recommendation: params.occupancyRate > 70 ? `Reduzir área ocupada para no máximo 70% (${(params.area * 0.7).toFixed(0)}m²)` : undefined,
  });

  // Coeficiente de aproveitamento
  checks.push({
    id: "building_coefficient",
    category: "building_code",
    requirement: "Coeficiente de aproveitamento",
    description: `Coeficiente de ${params.buildingCoefficient.toFixed(2)}`,
    status: params.buildingCoefficient <= 2.5 ? "compliant" : "non_compliant",
    severity: "critical",
    reference: "Lei de Uso e Ocupação do Solo",
    recommendation: params.buildingCoefficient > 2.5 ? `Reduzir área construída para no máximo ${(params.area * 2.5).toFixed(0)}m²` : undefined,
  });

  // ========== CORPO DE BOMBEIROS ==========
  
  // Saídas de emergência
  const requiredExits = params.commercialArea > 750 ? 2 : 1;
  checks.push({
    id: "fire_emergency_exits",
    category: "fire_safety",
    requirement: "Saídas de emergência",
    description: `Mínimo de ${requiredExits} saída(s) de emergência`,
    status: "pending",
    severity: "critical",
    reference: "NBR 9077 - Saídas de emergência em edifícios",
    recommendation: `Prever ${requiredExits} saída(s) de emergência com largura mínima de 1,20m`,
  });

  // Sistema de hidrantes
  checks.push({
    id: "fire_hydrant_system",
    category: "fire_safety",
    requirement: "Sistema de hidrantes",
    description: "Sistema de hidrantes e mangotinhos",
    status: params.totalBuiltArea > 750 ? "pending" : "not_applicable",
    severity: "critical",
    reference: "NBR 13714 - Sistemas de hidrantes e mangotinhos",
    recommendation: params.totalBuiltArea > 750 ? "Instalar sistema de hidrantes conforme NBR 13714" : undefined,
  });

  // Iluminação de emergência
  checks.push({
    id: "fire_emergency_lighting",
    category: "fire_safety",
    requirement: "Iluminação de emergência",
    description: "Sistema de iluminação de emergência",
    status: "pending",
    severity: "high",
    reference: "NBR 10898 - Sistema de iluminação de emergência",
    recommendation: "Instalar iluminação de emergência em rotas de fuga e áreas comuns",
  });

  // Sinalização de emergência
  checks.push({
    id: "fire_emergency_signage",
    category: "fire_safety",
    requirement: "Sinalização de emergência",
    description: "Placas de sinalização de rotas de fuga",
    status: "pending",
    severity: "high",
    reference: "NBR 13434 - Sinalização de segurança contra incêndio",
    recommendation: "Instalar sinalização fotoluminescente em rotas de fuga",
  });

  // Extintores
  const requiredExtinguishers = Math.ceil(params.totalBuiltArea / 250);
  checks.push({
    id: "fire_extinguishers",
    category: "fire_safety",
    requirement: "Extintores de incêndio",
    description: `Mínimo de ${requiredExtinguishers} extintor(es)`,
    status: "pending",
    severity: "critical",
    reference: "NBR 12693 - Sistemas de proteção por extintores",
    recommendation: `Instalar ${requiredExtinguishers} extintor(es) (1 a cada 250m²) - Tipos ABC e CO2`,
  });

  // Alarme de incêndio
  checks.push({
    id: "fire_alarm_system",
    category: "fire_safety",
    requirement: "Sistema de alarme de incêndio",
    description: "Alarme de incêndio e detecção de fumaça",
    status: params.totalBuiltArea > 750 ? "pending" : "not_applicable",
    severity: "high",
    reference: "NBR 17240 - Sistemas de detecção e alarme de incêndio",
    recommendation: params.totalBuiltArea > 750 ? "Instalar sistema de alarme e detecção de fumaça" : undefined,
  });

  // ========== NORMAS AMBIENTAIS ==========
  
  // Área permeável
  const minPermeableArea = params.area * 0.15; // Mínimo 15%
  const permeablePercentage = (params.permeableArea / params.area) * 100;
  checks.push({
    id: "env_permeable_area",
    category: "environmental",
    requirement: "Área permeável mínima",
    description: `Área permeável de ${params.permeableArea.toFixed(0)}m² (${permeablePercentage.toFixed(1)}%)`,
    status: params.permeableArea >= minPermeableArea ? "compliant" : "non_compliant",
    severity: "critical",
    reference: "Lei de Parcelamento do Solo",
    recommendation: params.permeableArea < minPermeableArea ? `Aumentar área permeável para no mínimo ${minPermeableArea.toFixed(0)}m² (15% do terreno)` : undefined,
  });

  // Arborização
  const requiredTrees = Math.floor(params.area / 80); // 1 árvore a cada 80m²
  checks.push({
    id: "env_trees",
    category: "environmental",
    requirement: "Arborização",
    description: `Mínimo de ${requiredTrees} árvore(s)`,
    status: "pending",
    severity: "medium",
    reference: "Lei de Arborização Urbana",
    recommendation: `Plantar ${requiredTrees} árvore(s) nativa(s) - 1 a cada 80m² de terreno`,
  });

  // Drenagem de águas pluviais
  checks.push({
    id: "env_drainage",
    category: "environmental",
    requirement: "Sistema de drenagem",
    description: "Drenagem de águas pluviais",
    status: "pending",
    severity: "high",
    reference: "NBR 10844 - Instalações prediais de águas pluviais",
    recommendation: "Prever sistema de drenagem com caixas de captação e direcionamento para rede pública",
  });

  // Gestão de resíduos
  checks.push({
    id: "env_waste_management",
    category: "environmental",
    requirement: "Gestão de resíduos",
    description: "Área para coleta seletiva",
    status: "pending",
    severity: "medium",
    reference: "PNRS - Política Nacional de Resíduos Sólidos",
    recommendation: "Prever área coberta para armazenamento temporário e coleta seletiva de resíduos",
  });

  // ========== ACESSIBILIDADE ==========
  
  // Vagas para PCD
  const requiredPCDSpaces = Math.ceil(params.parkingSpaces * 0.02); // Mínimo 2%
  checks.push({
    id: "access_pcd_parking",
    category: "accessibility",
    requirement: "Vagas para PCD",
    description: `Mínimo de ${requiredPCDSpaces} vaga(s) para PCD`,
    status: "pending",
    severity: "critical",
    reference: "NBR 9050 - Acessibilidade",
    recommendation: `Reservar ${requiredPCDSpaces} vaga(s) para PCD (2% do total) com dimensões 3,50m x 5,00m`,
  });

  // Rampas de acesso
  checks.push({
    id: "access_ramps",
    category: "accessibility",
    requirement: "Rampas de acesso",
    description: "Rampas com inclinação máxima de 8,33%",
    status: "pending",
    severity: "critical",
    reference: "NBR 9050 - Acessibilidade",
    recommendation: "Prever rampas de acesso com inclinação máxima de 8,33% (1:12) e corrimãos",
  });

  // Banheiros acessíveis
  const requiredAccessibleBathrooms = Math.max(1, Math.floor(params.numberOfStores / 10));
  checks.push({
    id: "access_bathrooms",
    category: "accessibility",
    requirement: "Banheiros acessíveis",
    description: `Mínimo de ${requiredAccessibleBathrooms} banheiro(s) acessível(is)`,
    status: "pending",
    severity: "critical",
    reference: "NBR 9050 - Acessibilidade",
    recommendation: `Prever ${requiredAccessibleBathrooms} banheiro(s) acessível(is) com dimensões mínimas e barras de apoio`,
  });

  // Sinalização tátil
  checks.push({
    id: "access_tactile_signage",
    category: "accessibility",
    requirement: "Piso tátil",
    description: "Piso tátil de alerta e direcional",
    status: "pending",
    severity: "high",
    reference: "NBR 9050 - Acessibilidade",
    recommendation: "Instalar piso tátil de alerta em desníveis e direcional em rotas acessíveis",
  });

  // ========== ESTACIONAMENTO ==========
  
  // Vagas mínimas
  const requiredParkingSpaces = Math.ceil(params.commercialArea / 40); // 1 vaga a cada 40m²
  checks.push({
    id: "parking_minimum_spaces",
    category: "parking",
    requirement: "Vagas mínimas de estacionamento",
    description: `${params.parkingSpaces} vagas (mínimo ${requiredParkingSpaces})`,
    status: params.parkingSpaces >= requiredParkingSpaces ? "compliant" : "non_compliant",
    severity: "critical",
    reference: "Código de Obras Municipal",
    recommendation: params.parkingSpaces < requiredParkingSpaces ? `Aumentar para ${requiredParkingSpaces} vagas (1 vaga a cada 40m² de área comercial)` : undefined,
  });

  // Dimensões das vagas
  checks.push({
    id: "parking_space_dimensions",
    category: "parking",
    requirement: "Dimensões das vagas",
    description: "Vagas com 2,50m x 5,00m",
    status: "pending",
    severity: "high",
    reference: "NBR 12255 - Execução e utilização de passeios públicos",
    recommendation: "Garantir dimensões mínimas de 2,50m x 5,00m para vagas regulares",
  });

  // Circulação interna
  checks.push({
    id: "parking_circulation",
    category: "parking",
    requirement: "Largura de circulação",
    description: "Corredores com largura mínima de 5,00m",
    status: "pending",
    severity: "medium",
    reference: "Código de Obras Municipal",
    recommendation: "Prever corredores de circulação com largura mínima de 5,00m para veículos",
  });

  // Calcular estatísticas
  const compliant = checks.filter(c => c.status === "compliant").length;
  const nonCompliant = checks.filter(c => c.status === "non_compliant").length;
  const pending = checks.filter(c => c.status === "pending").length;
  const notApplicable = checks.filter(c => c.status === "not_applicable").length;

  // Determinar status geral
  let overallStatus: "approved" | "conditional" | "rejected";
  const criticalIssues = checks.filter(c => c.status === "non_compliant" && c.severity === "critical").length;
  
  if (criticalIssues > 0) {
    overallStatus = "rejected";
  } else if (nonCompliant > 0) {
    overallStatus = "conditional";
  } else {
    overallStatus = "approved";
  }

  return {
    projectId: params.projectId,
    totalChecks: checks.length,
    compliant,
    nonCompliant,
    pending,
    notApplicable,
    overallStatus,
    checks,
    generatedAt: new Date(),
  };
}

/**
 * Formata relatório de conformidade para exportação
 */
export function formatComplianceReport(report: ComplianceReport): string {
  let markdown = `# Checklist de Conformidade\n\n`;
  markdown += `**Data de Geração:** ${report.generatedAt.toLocaleDateString("pt-BR")}\n\n`;
  markdown += `**Status Geral:** ${report.overallStatus === "approved" ? "✅ Aprovado" : report.overallStatus === "conditional" ? "⚠️ Aprovado com Ressalvas" : "❌ Reprovado"}\n\n`;
  markdown += `---\n\n`;
  markdown += `## Resumo\n\n`;
  markdown += `- **Total de Verificações:** ${report.totalChecks}\n`;
  markdown += `- **Conformes:** ${report.compliant}\n`;
  markdown += `- **Não Conformes:** ${report.nonCompliant}\n`;
  markdown += `- **Pendentes:** ${report.pending}\n`;
  markdown += `- **Não Aplicáveis:** ${report.notApplicable}\n\n`;
  markdown += `---\n\n`;

  // Agrupar por categoria
  const categories = {
    building_code: "Código de Obras",
    fire_safety: "Segurança Contra Incêndio",
    environmental: "Normas Ambientais",
    accessibility: "Acessibilidade",
    parking: "Estacionamento",
  };

  for (const [key, title] of Object.entries(categories)) {
    const categoryChecks = report.checks.filter(c => c.category === key);
    if (categoryChecks.length === 0) continue;

    markdown += `## ${title}\n\n`;
    
    for (const check of categoryChecks) {
      const statusIcon = check.status === "compliant" ? "✅" : check.status === "non_compliant" ? "❌" : check.status === "pending" ? "⏳" : "➖";
      const severityBadge = check.severity === "critical" ? "🔴 CRÍTICO" : check.severity === "high" ? "🟠 ALTO" : check.severity === "medium" ? "🟡 MÉDIO" : "🟢 BAIXO";
      
      markdown += `### ${statusIcon} ${check.requirement}\n\n`;
      markdown += `**Severidade:** ${severityBadge}\n\n`;
      markdown += `**Descrição:** ${check.description}\n\n`;
      if (check.reference) {
        markdown += `**Referência:** ${check.reference}\n\n`;
      }
      if (check.recommendation) {
        markdown += `**Recomendação:** ${check.recommendation}\n\n`;
      }
      markdown += `---\n\n`;
    }
  }

  return markdown;
}
