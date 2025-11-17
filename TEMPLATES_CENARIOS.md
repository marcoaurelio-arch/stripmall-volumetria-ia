# Templates de Cenários para Strip Malls

## Objetivo

Criar templates pré-configurados que sugerem automaticamente parâmetros urbanísticos, número de lojas e vagas de estacionamento baseados na área do terreno, facilitando a criação de novos projetos.

## Faixas de Área e Templates

### 1. Pequeno Porte (1.000 - 3.000 m²)
**Características:**
- **Taxa de Ocupação:** 60-70%
- **Coeficiente de Aproveitamento:** 0.8 - 1.2
- **Número de Lojas:** 4-8 lojas
- **Vagas de Estacionamento:** 1 vaga / 30m² de ABL (Área Bruta Locável)
- **Recuos:** Frontal 5m, Laterais 3m, Fundos 3m
- **Altura:** 1 pavimento (máx. 6m)
- **Perfil:** Strip mall de vizinhança, serviços locais

**Exemplo 2.000m²:**
- Área ocupada: 1.400m² (70%)
- Área construída: 2.000m² (coef. 1.0)
- Lojas: 6 unidades (média 330m² cada)
- Vagas: 67 vagas

---

### 2. Médio Porte (3.000 - 6.000 m²)
**Características:**
- **Taxa de Ocupação:** 65-75%
- **Coeficiente de Aproveitamento:** 1.0 - 1.5
- **Número de Lojas:** 8-15 lojas
- **Vagas de Estacionamento:** 1 vaga / 28m² de ABL
- **Recuos:** Frontal 5m, Laterais 4m, Fundos 4m
- **Altura:** 1-2 pavimentos (máx. 9m)
- **Perfil:** Strip mall regional, mix de varejo e serviços

**Exemplo 5.000m²:**
- Área ocupada: 3.500m² (70%)
- Área construída: 6.000m² (coef. 1.2)
- Lojas: 12 unidades (média 500m² cada)
- Vagas: 214 vagas

---

### 3. Grande Porte (6.000 - 10.000 m²)
**Características:**
- **Taxa de Ocupação:** 70-80%
- **Coeficiente de Aproveitamento:** 1.2 - 1.8
- **Número de Lojas:** 15-25 lojas
- **Vagas de Estacionamento:** 1 vaga / 27m² de ABL
- **Recuos:** Frontal 6m, Laterais 5m, Fundos 5m
- **Altura:** 2 pavimentos (máx. 10m)
- **Perfil:** Strip mall âncora, supermercado + lojas satélites

**Exemplo 8.000m²:**
- Área ocupada: 6.000m² (75%)
- Área construída: 12.000m² (coef. 1.5)
- Lojas: 20 unidades (média 600m² cada)
- Vagas: 444 vagas

---

### 4. Extra Grande Porte (10.000 - 15.000 m²)
**Características:**
- **Taxa de Ocupação:** 75-85%
- **Coeficiente de Aproveitamento:** 1.5 - 2.0
- **Número de Lojas:** 25-40 lojas
- **Vagas de Estacionamento:** 1 vaga / 25m² de ABL
- **Recuos:** Frontal 8m, Laterais 6m, Fundos 6m
- **Altura:** 2 pavimentos (máx. 12m)
- **Perfil:** Power center, múltiplas âncoras + food court

**Exemplo 12.000m²:**
- Área ocupada: 9.600m² (80%)
- Área construída: 20.000m² (coef. 1.67)
- Lojas: 32 unidades (média 625m² cada)
- Vagas: 800 vagas

---

## Variações de Cenários

Para cada faixa de área, oferecemos 3 cenários:

### Cenário Conservador
- Taxa de ocupação no limite inferior da faixa
- Coeficiente de aproveitamento mínimo
- Mais vagas de estacionamento (1 vaga / 25m²)
- Recuos generosos
- **Objetivo:** Maximizar conforto e facilidade de aprovação

### Cenário Balanceado (Recomendado)
- Parâmetros no meio da faixa
- Equilíbrio entre rentabilidade e conforto
- Vagas padrão (1 vaga / 27-28m²)
- **Objetivo:** Melhor custo-benefício

### Cenário Otimista
- Taxa de ocupação no limite superior
- Coeficiente de aproveitamento máximo
- Vagas mínimas permitidas (1 vaga / 30m²)
- Recuos mínimos legais
- **Objetivo:** Maximizar rentabilidade e ABL

---

## Fórmulas de Cálculo

### Área Construída
```
areaConstruida = areaTerreno × coeficienteAproveitamento
```

### Área Ocupada (Térreo)
```
areaOcupada = areaTerreno × (taxaOcupacao / 100)
```

### Número de Lojas
```
numeroLojas = areaConstruida / areaMediaPorLoja
onde areaMediaPorLoja varia de 250m² (pequeno) a 650m² (extra grande)
```

### Vagas de Estacionamento
```
vagas = Math.ceil(areaConstruida / m2PorVaga)
onde m2PorVaga varia de 25 a 30 conforme cenário
```

### Área Bruta Locável (ABL)
```
ABL = areaConstruida × 0.75  // 75% da área construída
```

---

## Referências de Mercado

- **ABRASCE** (Associação Brasileira de Shopping Centers): Padrões de vagas e mix de lojas
- **NBR 9050**: Acessibilidade e dimensionamento de vagas
- **Código de Obras Municipal**: Recuos e taxa de ocupação
- **ICSC** (International Council of Shopping Centers): Benchmarks internacionais

---

## Implementação Técnica

### Tabela: projectTemplates
```sql
CREATE TABLE projectTemplates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  minArea INT,
  maxArea INT,
  taxaOcupacaoMin INT,
  taxaOcupacaoMax INT,
  coeficienteMin DECIMAL(3,2),
  coeficienteMax DECIMAL(3,2),
  numeroLojasMin INT,
  numeroLojasMax INT,
  m2PorVagaMin INT,
  m2PorVagaMax INT,
  recuoFrontal INT,
  recuoLateral INT,
  recuoFundos INT,
  alturaMaxima INT,
  description TEXT
);
```

### Serviço: projectTemplateService.ts
```typescript
export function getTemplateByArea(area: number) {
  if (area < 3000) return templates.pequeno;
  if (area < 6000) return templates.medio;
  if (area < 10000) return templates.grande;
  return templates.extraGrande;
}

export function calculateScenarios(area: number, template) {
  return {
    conservador: calculateConservative(area, template),
    balanceado: calculateBalanced(area, template),
    otimista: calculateOptimistic(area, template)
  };
}
```

---

## Próximos Passos

1. ✅ Documentar templates e fórmulas
2. ⏳ Criar schema e popular banco de dados
3. ⏳ Implementar serviço de cálculo automático
4. ⏳ Criar componente de seleção visual
5. ⏳ Integrar no formulário de novo projeto
6. ⏳ Testar com casos reais
