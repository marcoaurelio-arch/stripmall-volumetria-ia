# Strip Mall Volumetria IA - TODO

## Funcionalidades Principais

### Backend - Banco de Dados e API
- [x] Criar schema de banco de dados para projetos de terrenos
- [x] Criar schema para armazenar análises volumétricas
- [x] Implementar procedures tRPC para CRUD de projetos
- [x] Implementar integração com IA para análise de terrenos
- [x] Implementar cálculos de volumetria e área construída
- [x] Implementar cálculo de vagas de estacionamento
- [ ] Implementar geração de relatórios em PDF

### Frontend - Interface do Usuário
- [x] Criar página inicial com apresentação da ferramenta
- [x] Criar formulário de entrada de dados do terreno
- [ ] Implementar upload de arquivos (plantas, coordenadas)
- [x] Criar dashboard para listar projetos
- [x] Criar página de visualização de projeto individual
- [ ] Implementar visualização 2D do terreno
- [ ] Implementar visualização 3D interativa da volumetria
- [x] Criar interface para exibir resultados das análises
- [ ] Implementar geração e download de relatórios

### Análises e Cálculos
- [x] Implementar análise de taxa de ocupação
- [x] Implementar análise de coeficiente de aproveitamento
- [x] Implementar cálculo de área construída máxima
- [x] Implementar distribuição otimizada de lojas
- [x] Implementar cálculo de vagas de estacionamento conforme normas
- [ ] Implementar análise de insolação (opcional)
- [x] Implementar sugestões de layout baseadas em IA

### Integração com IA
- [x] Configurar prompts para análise de viabilidade
- [x] Implementar geração de sugestões de volumetria
- [x] Implementar otimização de layout com IA
- [x] Implementar análise de conformidade com códigos

### Visualização 3D
- [ ] Integrar biblioteca Three.js ou similar
- [ ] Implementar renderização de volumes 3D
- [ ] Implementar controles de câmera (zoom, rotação)
- [ ] Implementar visualização de diferentes cenários

### Relatórios
- [ ] Criar template de relatório em PDF
- [ ] Incluir plantas 2D no relatório
- [ ] Incluir renders 3D no relatório
- [ ] Incluir tabelas com dados quantitativos
- [ ] Incluir análises e recomendações

### Melhorias Futuras
- [ ] Implementar importação de arquivos CAD/DWG
- [ ] Integrar com APIs de mapas (Google Maps, OpenStreetMap)
- [ ] Implementar análise de sombreamento
- [ ] Implementar comparação de múltiplos cenários
- [ ] Adicionar templates pré-configurados de strip malls

### Integração com Google Maps
- [x] Adicionar campos de latitude e longitude no schema do banco de dados
- [x] Instalar biblioteca @vis.gl/react-google-maps
- [x] Criar componente de mapa interativo para seleção de localização
- [x] Integrar componente de mapa no formulário de novo projeto
- [x] Implementar busca de endereço via Geocoding API
- [x] Exibir localização do terreno na página de detalhes do projeto

### Ferramenta de Desenho de Polígonos
- [x] Adicionar biblioteca de desenho do Google Maps (@googlemaps/drawing)
- [x] Criar modo de desenho de polígonos no LocationPicker
- [x] Implementar cálculo automático de área usando geometry library
- [x] Atualizar campo de área total automaticamente ao desenhar
- [x] Adicionar botões para limpar e refazer polígono
- [x] Exibir área calculada em tempo real durante o desenho
- [x] Salvar coordenadas do polígono no banco de dados

### Sistema de Múltiplos Cenários de Polígonos
- [x] Criar tabela de cenários no banco de dados
- [x] Implementar procedures tRPC para CRUD de cenários
- [x] Criar componente para listar cenários salvos
- [x] Adicionar botão para salvar cenário atual com nome
- [x] Implementar carregamento de cenário selecionado
- [x] Adicionar exclusão de cenários
- [x] Exibir comparação de áreas entre cenários
- [x] Marcar cenário ativo/principal

### Exportação de Cenários para CSV
- [x] Criar função para gerar CSV com dados dos cenários
- [x] Adicionar botão de exportação no ScenarioManager
- [x] Incluir coordenadas detalhadas de cada polígono
- [x] Exportar metadados (nome, descrição, área, data)
- [x] Testar download do arquivo CSV

### Importação de Cenários via CSV
- [x] Criar função para ler e parsear arquivo CSV
- [x] Adicionar botão de importação no ScenarioManager
- [x] Validar formato do CSV importado
- [x] Criar cenários automaticamente a partir do CSV
- [x] Exibir feedback de sucesso/erro na importação
- [x] Testar importação com arquivo exportado

### Mesclagem de Múltiplos Polígonos
- [x] Adicionar seleção múltipla de cenários no ScenarioManager
- [x] Criar função para calcular união de polígonos (convex hull)
- [x] Implementar botão "Mesclar Selecionados"
- [x] Calcular área total do polígono mesclado
- [x] Criar novo cenário com polígono consolidado
- [x] Exibir preview do polígono mesclado antes de salvar
- [x] Testar mesclagem com 2+ polígonos

### Cálculo de Custo Estimado da Terra
- [x] Adicionar campo de preço por m² no schema de projetos
- [x] Criar input para preço por m² no formulário de projeto
- [x] Implementar cálculo automático de custo total (área × preço/m²)
- [x] Exibir custo estimado na página de detalhes do projeto
- [ ] Exibir custo nos cenários salvos
- [x] Adicionar formatação de moeda brasileira (R$)
- [ ] Incluir custo no relatório de análise com IA

### Painel de Resumo Financeiro
- [x] Criar componente de card de resumo financeiro
- [x] Calcular custo total de todos os projetos
- [x] Exibir número total de projetos
- [x] Exibir área total consolidada
- [x] Exibir custo total do portfólio
- [x] Adicionar painel na página de listagem de projetos
- [x] Incluir filtros por status (draft, analyzing, completed)

### Geração de Estudos Conceituais com IA
- [x] Criar schema para armazenar imagens geradas
- [x] Implementar procedure tRPC para gerar estudo conceitual 3D
- [x] Implementar procedure tRPC para gerar planta baixa
- [x] Integrar com API de geração de imagens (generateImage)
- [x] Criar prompts otimizados para renderização de strip malls
- [x] Criar prompts otimizados para plantas baixas arquitetônicas
- [x] Adicionar botão de gerar estudo conceitual na página de detalhes
- [x] Criar galeria de imagens geradas no projeto
- [x] Implementar download de imagens geradas
- [x] Adicionar loading states durante geração

### Carrossel de Estudos Conceituais na Página Inicial
- [x] Criar procedure tRPC para buscar imagens conceituais recentes (públicas)
- [x] Implementar componente de carrossel com autoplay
- [x] Adicionar transições suaves entre imagens
- [x] Exibir informações do projeto em cada slide
- [x] Adicionar navegação manual (setas e indicadores)
- [x] Integrar carrossel na página inicial (Home)
- [x] Adicionar link para o projeto ao clicar na imagem

### Compartilhamento Social de Estudos Conceituais
- [x] Adicionar botões de compartilhamento no carrossel (Facebook, Twitter, LinkedIn, WhatsApp)
- [x] Implementar função de compartilhamento com URL do projeto
- [ ] Adicionar meta tags Open Graph para preview rico nas redes sociais
- [x] Implementar botão de copiar link
- [x] Adicionar animação de feedback ao compartilhar
- [x] Testar compartilhamento em diferentes redes sociais

### Importação de Arquivos KMZ do Google Earth
- [x] Pesquisar e instalar biblioteca para parsear arquivos KMZ/KML
- [x] Implementar função backend para extrair coordenadas de KMZ
- [x] Criar procedure tRPC para upload e processamento de KMZ
- [x] Adicionar botão de upload de KMZ no formulário de novo projeto
- [x] Implementar parsing de polígonos e pontos do KML
- [x] Converter coordenadas para formato compatível com Google Maps
- [x] Preencher automaticamente campos de área e coordenadas
- [x] Adicionar validação de arquivo KMZ
- [x] Testar com arquivos KMZ reais do Google Earth

### Campo de Briefing do Projeto
- [x] Adicionar campo briefing no schema de projetos
- [x] Adicionar textarea de briefing no formulário de novo projeto
- [x] Exibir briefing na página de detalhes do projeto
- [x] Integrar briefing nos prompts de geração de imagens
- [x] Integrar briefing na análise volumétrica com IA

### Melhoria de Prompts para Imagens Realistas
- [x] Criar prompts fotorrealistas para estudos conceituais 3D
- [x] Criar prompts técnicos para plantas baixas arquitetônicas
- [x] Adicionar detalhes de materiais, iluminação e contexto urbano
- [x] Incluir especificações de câmera e renderização
- [x] Testar geração com diferentes estilos arquitetônicos

### Volumetria Arquitetônica Realista Baseada no Terreno
- [x] Extrair dados geométricos do polígono (formato, proporções, orientação)
- [x] Calcular dimensões reais da volumetria baseadas no polígono
- [x] Incluir formato específico do terreno nos prompts de IA
- [x] Adicionar vista aérea real do terreno no contexto da geração
- [x] Gerar imagem de referência do terreno com Google Maps Static API
- [x] Incluir imagem do terreno real como referência visual para a IA
- [x] Melhorar prompt com descrição geométrica precisa (retangular, irregular, L-shaped, etc)
- [x] Testar com diferentes formatos de terreno (regular, irregular, esquina)

### Estudos Estilo Maquete Eletrônica (Baseado no PDF de Referência)
- [x] Criar novo tipo de imagem: "Maquete Eletrônica"
- [x] Implementar prompt para volumes coloridos por função (farmácia amarelo, lojas azul, supermercado vermelho)
- [x] Adicionar textos identificadores sobre os volumes 3D
- [x] Gerar vista isométrica/aérea automática
- [x] Gerar fachadas de múltiplos ângulos (4 vistas)
- [x] Melhorar plantas baixas com layout de estacionamento detalhado
- [ ] Adicionar cotas e dimensões nas plantas
- [ ] Incluir legendas de áreas nas plantas
- [ ] Representar circulação e acessos nas plantas
- [ ] Adicionar quadro de áreas nas imagens geradas

### Bugs e Correções
- [x] Corrigir query getLatestAnalysis retornando undefined em vez de null quando não há análise

### Cortes Arquitetônicos ABNT
- [x] Adicionar tipos "longitudinal_section" e "transversal_section" no schema
- [x] Criar procedure para gerar corte longitudinal
- [x] Criar procedure para gerar corte transversal
- [x] Implementar prompts com normas ABNT (cotas, níveis, materiais, hachuras)
- [x] Adicionar seção de cortes na galeria de imagens
- [x] Incluir botão para gerar ambos os cortes automaticamente
- [x] Adicionar indicação de níveis (±0.00, piso, cobertura)
- [x] Incluir representação de materiais conforme ABNT
- [x] Adicionar cotas verticais e horizontais
- [x] Testar geração de cortes

### Planta de Implantação Completa
- [x] Adicionar tipo "site_plan" no schema de imagens
- [x] Criar procedure para gerar planta de implantação
- [x] Implementar prompt com layout de estacionamento (vagas 90°, 45°, paralelas)
- [x] Adicionar acessos veiculares e de pedestres
- [x] Incluir calçadas perimetrais e passeios
- [x] Adicionar áreas verdes e paisagismo
- [x] Incluir cotas de distâncias e recuos
- [x] Adicionar norte geográfico e escala gráfica
- [x] Incluir legenda de materiais de piso
- [x] Adicionar seção de implantação na galeria de imagens
- [x] Testar geração de planta de implantação

### Exportação de Relatório Técnico em PDF
- [x] Instalar biblioteca PDFKit para geração de PDFs
- [x] Criar procedure tRPC para gerar relatório PDF
- [x] Implementar capa do relatório com logo e informações do projeto
- [x] Adicionar seção de dados do terreno (endereço, área, coordenadas)
- [x] Incluir análise volumétrica completa da IA
- [x] Adicionar quadro de áreas técnico (área do terreno, construída, lojas, estacionamento)
- [x] Incluir todas as imagens geradas (maquete eletrônica, plantas, cortes, implantação)
- [x] Adicionar análise financeira (custo do terreno, preço por m²)
- [x] Implementar paginação e numeração de páginas
- [x] Adicionar cabeçalho e rodapé profissionais
- [x] Criar botão de exportação na página de detalhes do projeto
- [x] Implementar download automático do PDF gerado
- [x] Testar geração de PDF com projeto completo

### Quadro de Áreas Técnico ABNT NBR 12.721
- [x] Pesquisar estrutura do quadro de áreas conforme ABNT NBR 12.721
- [x] Criar função para calcular área privativa (lojas)
- [x] Calcular área comum (circulação, corredores, banheiros)
- [x] Calcular área de estacionamento
- [x] Calcular taxa de ocupação (área construída / área do terreno)
- [x] Calcular coeficiente de aproveitamento (área total construída / área do terreno)
- [x] Calcular número de pavimentos
- [x] Implementar tabela formatada no PDF com todas as áreas
- [x] Adicionar seção de índices urbanísticos
- [x] Criar componente visual do quadro de áreas na interface web
- [x] Adicionar quadro de áreas na página de detalhes do projeto
- [x] Testar cálculos com diferentes configurações de projeto

### Análise de Viabilidade Financeira
- [x] Criar módulo de cálculos financeiros (financialCalculator.ts)
- [x] Implementar cálculo de VPL (Valor Presente Líquido)
- [x] Implementar cálculo de TIR (Taxa Interna de Retorno)
- [x] Calcular período de payback (retorno do investimento)
- [x] Projetar receitas de locação (R$/m²/mês por tipo de loja)
- [x] Calcular custos operacionais (manutenção, condomínio, impostos)
- [x] Calcular custo total do investimento (terreno + construção)
- [x] Projetar fluxo de caixa para 10 anos
- [x] Calcular taxa de vacância estimada
- [x] Implementar análise de sensibilidade (cenários otimista/pessimista)
- [x] Adicionar seção de análise financeira ao PDF
- [x] Criar gráficos de fluxo de caixa e evolução patrimonial
- [x] Criar componente React de análise financeira
- [x] Adicionar aba de viabilidade financeira na interface
- [x] Testar cálculos com diferentes parâmetros
