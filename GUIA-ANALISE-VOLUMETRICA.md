# 📐 Guia Completo: Análise Volumétrica com IA

## Visão Geral

A **Análise Volumétrica com IA** é o coração do sistema Strip Mall Volumetria IA. Ela utiliza inteligência artificial para processar os dados do seu terreno e gerar automaticamente:

- ✅ Cálculos de área construída máxima
- ✅ Distribuição otimizada de lojas
- ✅ Número de vagas de estacionamento
- ✅ Sugestões de layout e implantação
- ✅ Análise de viabilidade urbanística
- ✅ Recomendações arquitetônicas personalizadas

---

## 🎯 Passo a Passo Completo

### Fase 1: Criar o Projeto

#### 1.1 Acessar Formulário de Novo Projeto

1. Na página inicial, clique em **"Criar Novo Projeto"** ou **"Novo Projeto"** no menu
2. Você será direcionado para o formulário de criação

#### 1.2 Preencher Informações Básicas

**Campos Obrigatórios:**

- **Nome do Projeto** * (obrigatório)
  - Exemplo: `Strip Mall Zona Sul`
  - Dica: Use um nome descritivo que identifique o empreendimento

- **Descrição** (opcional)
  - Exemplo: `Centro comercial de vizinhança com foco em serviços e alimentação`
  - Dica: Descreva brevemente o conceito do projeto

- **Briefing do Projeto** (recomendado)
  - Exemplo: 
    ```
    Conceito arquitetônico moderno com fachada em vidro e elementos em madeira.
    Público-alvo: classes A e B.
    Lojas âncora: supermercado (800m²) e farmácia (200m²).
    Estilo desejado: contemporâneo, sustentável, com áreas verdes.
    Materiais preferidos: concreto aparente, vidro, madeira certificada.
    ```
  - **Importante**: Este briefing será usado pela IA para gerar estudos conceituais mais precisos

- **Endereço** (opcional, mas recomendado)
  - Exemplo: `Av. Paulista, 1000 - Bela Vista, São Paulo - SP`
  - Dica: Quanto mais completo, melhor para a localização no mapa

#### 1.3 Definir Dimensões do Terreno

**Opção A: Entrada Manual**

- **Área Total (m²)** * (obrigatório)
  - Exemplo: `5000`
  - Mínimo recomendado: 2.000 m² para strip mall viável

- **Largura (m)** (opcional)
  - Exemplo: `50`
  
- **Comprimento (m)** (opcional)
  - Exemplo: `100`

- **Preço por m² (R$)** (opcional, mas recomendado para análise financeira)
  - Exemplo: `1500.00`
  - Dica: Pesquise valores de mercado na região

**Opção B: Desenhar no Mapa (Mais Preciso)**

1. Role até a seção **"Localização do Terreno"**
2. Use o campo **"Buscar Endereço"** para centralizar o mapa
3. Clique no botão **"Desenhar"** (azul)
4. Clique no mapa para adicionar pontos do polígono (mínimo 3 pontos)
5. Clique em **"Concluir"** quando terminar
6. A **área será calculada automaticamente** e preencherá o campo "Área Total"

**Opção C: Importar KMZ do Google Earth**

1. Exporte o terreno do Google Earth como arquivo `.kmz`
2. Clique em **"Importar KMZ do Google Earth"**
3. Selecione o arquivo
4. As coordenadas e área serão extraídas automaticamente

#### 1.4 Configurar Parâmetros Urbanísticos

**Deixe em branco para usar valores padrão** ou personalize:

- **Taxa de Ocupação (%)** (padrão: 70%)
  - Exemplo: `70`
  - Percentual do terreno que pode ser ocupado pela construção

- **Coeficiente de Aproveitamento** (padrão: 2.0)
  - Exemplo: `200` (para 2.0)
  - Insira o valor multiplicado por 100
  - Determina quantas vezes a área do terreno pode ser construída

- **Recuo Frontal (m)** (padrão: 5m)
  - Exemplo: `5`
  
- **Recuo Lateral (m)** (padrão: 3m)
  - Exemplo: `3`
  
- **Recuo de Fundos (m)** (padrão: 3m)
  - Exemplo: `3`

#### 1.5 Salvar Cenários (Opcional)

Se você desenhou o polígono no mapa e quer testar diferentes configurações:

1. Clique em **"Salvar Cenário Atual"**
2. Dê um nome descritivo (ex: "Cenário A - Terreno Original")
3. Desenhe outro polígono
4. Salve como novo cenário
5. Compare as opções antes de criar o projeto

#### 1.6 Criar o Projeto

1. Revise todos os dados preenchidos
2. Clique no botão **"Criar Projeto"** (verde, no final da página)
3. Aguarde alguns segundos
4. Você será redirecionado para a página de detalhes do projeto

---

### Fase 2: Gerar Análise Volumétrica com IA

#### 2.1 Acessar Página de Detalhes do Projeto

Após criar o projeto, você verá:

- Dados do terreno
- Mapa com localização
- Seção de análise volumétrica (vazia inicialmente)
- Botão **"Nova Análise com IA"**

#### 2.2 Iniciar Análise

1. Clique no botão **"Nova Análise com IA"** (azul, com ícone de estrela)
2. Um modal de confirmação pode aparecer
3. Clique em **"Confirmar"** ou **"Gerar Análise"**
4. **Aguarde 10-30 segundos** enquanto a IA processa os dados

**O que acontece nos bastidores:**

A IA analisa:
- Dimensões do terreno (área, formato, proporções)
- Parâmetros urbanísticos (taxa de ocupação, coeficiente)
- Recuos obrigatórios
- Briefing do projeto (se fornecido)
- Localização e contexto urbano

E gera:
- Cálculo de área construída máxima
- Distribuição otimizada de lojas por tamanho
- Número de vagas de estacionamento conforme normas
- Sugestões de layout e circulação
- Análise de viabilidade
- Recomendações arquitetônicas

#### 2.3 Visualizar Resultados

Após o processamento, a página será atualizada automaticamente com:

**Seção 1: Análise Volumétrica Completa**
- Texto detalhado gerado pela IA
- Análise de viabilidade urbanística
- Sugestões de implantação
- Recomendações de layout

**Seção 2: Quadro de Áreas Técnico (ABNT NBR 12.721)**
- Área do terreno
- Área construída total
- Área privativa (lojas)
- Área comum (circulação)
- Área de estacionamento
- Taxa de ocupação calculada
- Coeficiente de aproveitamento
- Número de pavimentos

**Seção 3: Distribuição de Lojas**
- Tabela com lojas pequenas, médias e grandes
- Quantidade de cada tipo
- Área individual
- Área total por categoria

**Seção 4: Vagas de Estacionamento**
- Número total de vagas
- Cálculo conforme normas técnicas
- Área necessária para estacionamento

---

### Fase 3: Gerar Estudos Visuais (Opcional)

Após a análise volumétrica, você pode gerar imagens conceituais:

#### 3.1 Maquete Eletrônica 3D

1. Role até a seção **"Estudos Conceituais"**
2. Clique em **"Gerar Maquete Eletrônica"**
3. Aguarde 15-30 segundos
4. Uma imagem 3D isométrica será gerada mostrando:
   - Volumes coloridos por função (farmácia, lojas, supermercado)
   - Textos identificadores
   - Estacionamento
   - Contexto urbano

#### 3.2 Planta Baixa

1. Clique em **"Gerar Planta Baixa"**
2. Aguarde 15-30 segundos
3. Uma planta arquitetônica será gerada com:
   - Layout de lojas
   - Circulação
   - Estacionamento detalhado
   - Cotas e dimensões

#### 3.3 Cortes Arquitetônicos

1. Clique em **"Gerar Cortes"**
2. Serão gerados automaticamente:
   - **Corte Longitudinal**: Vista ao longo do comprimento
   - **Corte Transversal**: Vista ao longo da largura
3. Ambos seguem normas ABNT com:
   - Cotas verticais e horizontais
   - Indicação de níveis (±0.00, piso, cobertura)
   - Representação de materiais
   - Hachuras conforme norma

#### 3.4 Planta de Implantação

1. Clique em **"Gerar Implantação"**
2. Uma planta de implantação completa será gerada com:
   - Layout de estacionamento (vagas 90°, 45°, paralelas)
   - Acessos veiculares e de pedestres
   - Calçadas perimetrais
   - Áreas verdes e paisagismo
   - Cotas de distâncias e recuos
   - Norte geográfico e escala gráfica
   - Legenda de materiais

#### 3.5 Fachadas

1. Clique em **"Gerar Fachadas"**
2. Serão geradas 4 vistas:
   - Fachada Frontal
   - Fachada Posterior
   - Fachada Lateral Esquerda
   - Fachada Lateral Direita

---

### Fase 4: Análise de Viabilidade Financeira (Opcional)

Se você forneceu o **preço por m²** do terreno:

1. Acesse a aba **"Viabilidade Financeira"**
2. O sistema calculará automaticamente:
   - **Custo do Terreno**: Área × Preço/m²
   - **Custo de Construção**: Estimativa baseada em CUB
   - **Investimento Total**: Terreno + Construção
   - **Receita de Locação**: Projeção de aluguel por tipo de loja
   - **Fluxo de Caixa**: Projeção para 10 anos
   - **VPL** (Valor Presente Líquido)
   - **TIR** (Taxa Interna de Retorno)
   - **Payback**: Período de retorno do investimento
   - **Análise de Sensibilidade**: Cenários otimista/pessimista

---

### Fase 5: Exportar Relatório Técnico em PDF

Quando tudo estiver pronto:

#### 5.1 Visualizar Prévia (Recomendado)

1. Clique no botão **"Visualizar Relatório"**
2. Um modal abrirá mostrando o PDF completo
3. Navegue pelas páginas para revisar o conteúdo
4. Se estiver satisfeito, clique em **"Baixar PDF"** dentro do modal

#### 5.2 Download Direto

1. Clique no botão **"Baixar PDF"**
2. O relatório será gerado e baixado automaticamente
3. O PDF incluirá:
   - Capa profissional
   - Dados do terreno
   - Análise volumétrica completa
   - Quadro de áreas técnico
   - Todas as imagens geradas
   - Análise financeira (se disponível)
   - Paginação e numeração

---

## 📊 Dados de Entrada Necessários

### Obrigatórios (Mínimo para Análise Básica)

| Campo | Tipo | Exemplo | Descrição |
|-------|------|---------|-----------|
| Nome do Projeto | Texto | "Strip Mall Zona Sul" | Identificação do empreendimento |
| Área Total | Número | 5000 | Área do terreno em m² |

### Recomendados (Para Análise Completa)

| Campo | Tipo | Exemplo | Descrição |
|-------|------|---------|-----------|
| Briefing | Texto longo | "Conceito moderno..." | Orientações para a IA |
| Endereço | Texto | "Av. Paulista, 1000..." | Localização do terreno |
| Preço por m² | Número | 1500.00 | Para análise financeira |
| Polígono Desenhado | Coordenadas | [(lat,lng)...] | Formato exato do terreno |

### Opcionais (Para Personalização)

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| Taxa de Ocupação | % | 70 | Percentual de ocupação |
| Coeficiente | Número | 2.0 | Aproveitamento do terreno |
| Recuo Frontal | Metros | 5 | Distância da frente |
| Recuo Lateral | Metros | 3 | Distância das laterais |
| Recuo de Fundos | Metros | 3 | Distância dos fundos |
| Largura | Metros | - | Dimensão do terreno |
| Comprimento | Metros | - | Dimensão do terreno |

---

## 🎯 Exemplos Práticos

### Exemplo 1: Análise Básica Rápida

**Entrada Mínima:**
```
Nome: Strip Mall Teste
Área Total: 3000 m²
```

**Resultado:**
- Análise volumétrica com valores padrão
- Distribuição de lojas otimizada
- Cálculo de vagas de estacionamento
- Sugestões básicas de layout

**Tempo:** ~15 segundos

---

### Exemplo 2: Análise Completa com Briefing

**Entrada Completa:**
```
Nome: Boulevard Gourmet
Descrição: Centro gastronômico premium
Briefing: 
  - Conceito: gastronomia de alto padrão
  - Público: classes A e B
  - Estilo: contemporâneo com elementos naturais
  - Materiais: madeira, vidro, concreto aparente
  - Lojas âncora: restaurante 300m², café 150m²
  
Endereço: Av. Brigadeiro Faria Lima, 2000 - São Paulo
Área Total: 4500 m²
Preço por m²: R$ 2.500,00
Taxa de Ocupação: 65%
Coeficiente: 1.8
Recuos: 8m frontal, 5m laterais
```

**Resultado:**
- Análise volumétrica personalizada
- Estudos conceituais alinhados ao briefing
- Análise financeira completa
- Relatório técnico profissional

**Tempo:** ~2-3 minutos (incluindo geração de imagens)

---

### Exemplo 3: Comparação de Cenários

**Processo:**
1. Desenhe polígono retangular → Salve como "Cenário A"
2. Desenhe polígono irregular → Salve como "Cenário B"
3. Desenhe polígono em L → Salve como "Cenário C"
4. Crie projeto com cada cenário
5. Compare análises volumétricas
6. Escolha a melhor opção

**Benefício:** Tomada de decisão baseada em dados concretos

---

## ⚡ Dicas e Boas Práticas

### Para Melhores Resultados

1. **Seja Específico no Briefing**
   - ❌ "Projeto moderno"
   - ✅ "Arquitetura contemporânea com fachada em vidro, elementos em madeira certificada, telhado verde, e iluminação LED"

2. **Use o Mapa para Precisão**
   - Desenhar o polígono é mais preciso que entrada manual
   - Considere formato real do terreno (irregular, esquina, etc.)

3. **Teste Múltiplos Cenários**
   - Salve diferentes configurações de polígono
   - Compare viabilidade de cada opção
   - Exporte cenários em CSV para análise externa

4. **Forneça Dados Financeiros**
   - Preço por m² permite análise de viabilidade
   - Essencial para decisão de investimento

5. **Revise Antes de Exportar**
   - Use "Visualizar Relatório" antes de baixar
   - Verifique se todas as imagens foram geradas
   - Confirme dados do quadro de áreas

### Limitações e Considerações

1. **Geração de Imagens**
   - Cada imagem leva 15-30 segundos
   - Imagens são conceituais, não projetos executivos
   - Podem requerer ajustes manuais por arquiteto

2. **Análise Volumétrica**
   - Baseada em parâmetros fornecidos
   - Não substitui análise de arquiteto profissional
   - Considere legislação local específica

3. **Viabilidade Financeira**
   - Projeções são estimativas
   - Valores de CUB podem variar por região
   - Consulte especialista financeiro para decisões

---

## 🆘 Solução de Problemas

### "Análise não está sendo gerada"

**Possíveis causas:**
- Área do terreno muito pequena (< 500m²)
- Dados obrigatórios não preenchidos
- Erro de conexão

**Solução:**
1. Verifique se "Nome" e "Área Total" estão preenchidos
2. Recarregue a página (Ctrl + F5)
3. Tente novamente

### "Imagens não estão sendo geradas"

**Possíveis causas:**
- Briefing muito vago
- Serviço de geração temporariamente indisponível

**Solução:**
1. Adicione mais detalhes ao briefing
2. Aguarde 1 minuto e tente novamente
3. Verifique conexão com internet

### "PDF está incompleto"

**Possíveis causas:**
- Imagens ainda não foram geradas
- Análise volumétrica não foi executada

**Solução:**
1. Gere a análise volumétrica primeiro
2. Gere todas as imagens desejadas
3. Aguarde todas as imagens carregarem
4. Então exporte o PDF

---

## 📚 Próximos Passos

Após dominar a análise volumétrica:

1. **Explore Projetos de Inspiração**
   - Navegue pela galeria de strip malls brasileiros
   - Use projetos como referência na análise

2. **Exporte e Compartilhe**
   - Baixe relatórios em PDF
   - Compartilhe estudos conceituais nas redes sociais

3. **Refine Iterativamente**
   - Ajuste parâmetros urbanísticos
   - Gere novas análises
   - Compare resultados

---

**Pronto para começar? Crie seu primeiro projeto e descubra o potencial do seu terreno!** 🚀
