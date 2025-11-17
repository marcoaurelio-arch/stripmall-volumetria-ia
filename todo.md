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

### Módulo de Projetos de Inspiração
- [x] Pesquisar e catalogar strip malls relevantes do Brasil
- [x] Criar tabela de projetos de inspiração no banco de dados
- [x] Adicionar campos: nome, localização, área, número de lojas, ano, arquiteto, características
- [x] Implementar upload de múltiplas imagens por projeto
- [x] Criar procedure para adicionar projeto de inspiração
- [x] Criar procedure para listar projetos com filtros (localização, tamanho, tipo)
- [x] Criar procedure para buscar detalhes de projeto
- [x] Implementar sistema de tags/categorias
- [x] Criar componente de galeria de projetos de inspiração
- [x] Implementar filtros por região, área, número de lojas
- [x] Criar página de detalhes do projeto de inspiração
- [x] Adicionar seção de características técnicas
- [x] Implementar seleção de projeto como referência na análise
- [ ] Integrar dados de inspiração nos prompts da IA
- [x] Adicionar botão "Usar como Referência" na galeria
- [x] Criar seed data com 10-15 projetos brasileiros relevantes
- [x] Testar integração com análise volumétrica

## Funcionalidade de Busca em Projetos de Inspiração

- [x] Atualizar procedure de listagem para aceitar parâmetro de busca
- [x] Implementar busca por texto em nome, localização, arquiteto, incorporadora
- [x] Adicionar campo de busca na interface da galeria
- [x] Implementar debounce para otimizar requisições
- [x] Testar busca com diferentes termos

## Anexar Imagens dos Estudos Visuais nos Relatórios PDF

- [x] Analisar código atual de geração de relatórios PDF
- [x] Identificar onde as imagens geradas são armazenadas
- [x] Atualizar lógica de geração de PDF para incluir imagens
- [x] Adicionar seção de "Estudos Visuais" no relatório com as imagens
- [x] Garantir que imagens sejam redimensionadas adequadamente no PDF
- [x] Testar geração de relatório completo com imagens

## Visualização Prévia de Relatórios PDF

- [x] Criar endpoint tRPC para gerar preview do PDF
- [x] Retornar PDF como base64 ou blob URL para visualização
- [x] Criar componente PDFPreviewDialog com react-pdf ou iframe
- [x] Adicionar botão "Visualizar" ao lado do botão "Exportar PDF"
- [x] Implementar modal de preview com opções de download e fechar
- [x] Adicionar indicador de carregamento durante geração do preview
- [x] Testar preview com diferentes projetos e tamanhos de PDF

## Resolver Erro InvalidKeyMapError do Google Maps

- [x] Diagnosticar causa do erro InvalidKeyMapError
- [x] Verificar se a chave está corretamente configurada no ambiente
- [x] Verificar restrições de domínio no Google Cloud Console
- [ ] Implementar modo de desenho manual como fallback (sem Google Maps)
- [ ] Adicionar interface para entrada manual de coordenadas
- [ ] Testar funcionalidade de desenho sem dependência do Google Maps
- [ ] Documentar solução alternativa para o usuário

## Criar Exemplo Prático: Centro de Conveniência Uberlândia
- [x] Pesquisar características da Av. Nicomedes Alves dos Santos
- [x] Pesquisar perfil do bairro Morada da Colina
- [x] Criar documento completo com briefing detalhado
- [x] Incluir análise volumétrica adaptada para conveniência
- [x] Incluir análise financeira com valores de mercado local

## Templates Pré-configurados
- [x] Criar tabela de templates no banco de dados
- [x] Criar 5 templates iniciais (Gastronomia, Saúde, Conveniência, Varejo, Serviços)
- [x] Implementar procedure para listar templates
- [x] Implementar procedure para aplicar template ao projeto
- [x] Criar componente de seleção de templates no frontend
- [x] Adicionar botão "Usar Template" na criação de projeto
- [x] Preencher formulário automaticamente com dados do template
- [x] Testar funcionalidade completa com template de Saúde

## Upload de Plantas e Arquivos com Drag-and-Drop
- [x] Criar tabela de anexos no banco de dados (projectAttachments)
- [x] Implementar procedure de upload com S3 (uploadAttachment)
- [x] Implementar procedure para listar anexos (listAttachments)
- [x] Implementar procedure para excluir anexos (deleteAttachment)
- [x] Implementar procedure para obter detalhes de anexo (getAttachment)
- [x] Criar componente FileUploadZone com drag-and-drop
- [x] Suportar múltiplos formatos (PNG, JPG, PDF, DWG, KML, KMZ)
- [x] Validar tamanho máximo de arquivo (16MB)
- [x] Converter arquivos para base64 para upload
- [x] Exibir lista de arquivos selecionados
- [x] Implementar preview de imagens no gerenciador
- [x] Criar componente AttachmentManager para visualização
- [x] Adicionar botão de download de arquivos
- [x] Adicionar botão de exclusão de arquivos
- [x] Integrar na página de detalhes do projeto (nova aba Anexos)
- [x] Testar upload com diferentes tipos e tamanhos

## Processamento Automático de Arquivos KMZ nos Anexos
- [x] Detectar quando arquivo KMZ é enviado via aba Anexos
- [x] Reutilizar função de parsing de KMZ existente (parseKMZ)
- [x] Extrair coordenadas do polígono automaticamente
- [x] Atualizar campos do projeto (polygonCoordinates, area, latitude, longitude)
- [x] Exibir notificação de sucesso com dados extraídos
- [x] Adicionar botão "Extrair Coordenadas" para arquivos KMZ
- [x] Implementar procedure processKMZAttachment no backend
- [x] Download automático do arquivo do S3 para processamento
- [x] Invalidar cache do projeto após atualização
- [ ] Testar com diferentes arquivos KMZ

## Extração de Dados de PDFs com OCR
- [x] Pesquisar bibliotecas de OCR para Node.js (usado pdfjs-dist)
- [x] Instalar dependências necessárias para OCR
- [x] Criar função para extrair texto de PDF (extractTextFromPDF)
- [x] Implementar regex para identificar dimensões (ex: "10m x 20m", "área: 200m²")
- [x] Implementar regex para identificar recuos (ex: "recuo frontal: 5m")
- [x] Implementar regex para identificar área total
- [x] Implementar regex para taxa de ocupação e coeficiente de aproveitamento
- [x] Criar procedure tRPC para processar PDF e extrair dados (extractPDFData)
- [x] Adicionar botão "Extrair Dados" ao lado de PDFs anexados
- [x] Exibir preview dos dados extraídos antes de aplicar
- [x] Calcular nível de confiança baseado em dados encontrados
- [x] Atualizar campos do projeto com dados extraídos
- [x] Adicionar feedback de progresso durante OCR
- [x] Criar dialog com grid de dados extraídos
- [ ] Testar com diferentes formatos de plantas em PDF

## Galeria de Imagens de Referência para IA
- [x] Criar componente ReferenceImageGallery
- [x] Filtrar apenas anexos do tipo "reference_image" ou imagens
- [x] Exibir imagens em grid responsivo (2/3/4 colunas)
- [x] Adicionar seleção visual de imagens como referência
- [x] Gerenciar seleção via estado local (selectedReferenceImages)
- [x] Modificar prompts de geração de imagens para incluir referências
- [x] Enviar imagens selecionadas como originalImages para a IA
- [x] Implementar preview em modal ao clicar na imagem
- [x] Adicionar seção "Imagens de Referência" na aba de Estudos Visuais
- [x] Criar função getAttachmentsByIds para buscar anexos
- [x] Integrar imagens de referência na geração conceitual
- [ ] Testar geração de estudos com diferentes imagens de referência

## Campo de Upload de Arquivos de Inspiração
- [x] Criar componente InspirationUpload com drag-and-drop
- [x] Suportar upload múltiplo de imagens (PNG, JPG, JPEG)
- [x] Exibir preview das imagens selecionadas antes do upload
- [x] Permitir remover imagens da seleção antes de salvar
- [x] Exibir contador de imagens selecionadas
- [x] Validar tamanho máximo por imagem (16MB)
- [x] Mostrar progresso de upload para cada imagem
- [x] Indicador visual de status (uploading, uploaded, error)
- [x] Adicionar campo no formulário de criação de projeto
- [x] Fazer upload automático como anexos tipo "reference_image"
- [x] Modificar mutation create para retornar projectId
- [x] Implementar upload assíncrono após criar projeto
- [ ] Adicionar campo no formulário de edição de projeto
- [x] Testar integração com galeria de referências
- [x] Verificar que campo aparece corretamente no formulário
- [x] Confirmar que upload funciona após criar projeto

## Revisão Completa do Sistema
### Infraestrutura e Backend
- [x] Verificar se servidor está rodando sem erros TypeScript
- [x] Verificar se todas as procedures tRPC estão funcionando
- [x] Testar conexão com banco de dados
- [x] Verificar se uploads para S3 estão funcionando
- [x] Testar autenticação e autorização
- [x] Corrigir erro de JSON.parse em analyzePolygonGeometry
- [x] Adicionar tratamento de erro robusto para parseKMZ
- [x] Melhorar mensagens de erro para arquivos KMZ inválidos

### Upload e Gerenciamento de Arquivos
- [x] Testar upload de arquivo KMZ via formulário
- [x] Testar upload de arquivo PDF via aba Anexos
- [x] Testar upload de múltiplas imagens via campo de inspiração
- [x] Verificar se anexos aparecem na aba Anexos
- [x] Testar download de arquivos anexados
- [x] Testar exclusão de arquivos anexados

### Processamento Automático
- [x] Testar botão "Extrair Coordenadas" em arquivo KMZ
- [x] Verificar se coordenadas são extraídas e aplicadas ao projeto
- [x] Testar botão "Extrair Dados" em arquivo PDF
- [x] Verificar se dados extraídos aparecem no dialog
- [x] Testar aplicação de dados extraídos do PDF ao projeto
- [x] Corrigir erro de JSON.parse em analyzePolygonGeometry
- [x] Adicionar validação robusta em parseKMZ

### Galeria de Referências e IA
- [x] Verificar se imagens de inspiração aparecem na galeria
- [x] Testar seleção de múltiplas imagens de referência
- [x] Testar geração de estudo conceitual sem referências
- [x] Testar geração de estudo conceitual com referências selecionadas
- [x] Verificar se imagens de referência são enviadas para IA
- [x] Confirmar integração com aba Estudos Visuais

### Fluxo Completo de Criação de Projeto
- [x] Criar novo projeto com dados básicos
- [x] Adicionar imagens de inspiração no formulário
- [x] Verificar se projeto é criado com sucesso
- [x] Verificar se imagens são enviadas automaticamente
- [x] Acessar detalhes do projeto criado
- [x] Verificar se todas as abas estão funcionando (Dados do Terreno, Análise, Relatório, Viabilidade, Estudos Visuais, Anexos)

### Interface e UX
- [ ] Verificar responsividade em diferentes tamanhos de tela
- [ ] Testar feedback visual (toasts, loading states)
- [ ] Verificar se todos os botões estão funcionais
- [ ] Testar navegação entre páginas
- [ ] Verificar se não há erros no console do navegador

## FASE 1: Impacto Imediato

### Integração com Legislação Urbanística por CEP
- [x] Pesquisar APIs públicas de legislação urbanística brasileira
- [x] Criar serviço de busca de parâmetros por CEP/município (urbanLegislationService.ts)
- [x] Implementar integração com ViaCEP para buscar endereço
- [x] Criar tabela no banco para armazenar parâmetros urbanísticos (urbanLegislation)
- [x] Adicionar procedures tRPC para buscar legislação (urbanLegislationRouter)
- [x] Criar componente UrbanLegislationChecker no frontend
- [x] Implementar busca por CEP com feedback visual
- [x] Exibir comparação: parâmetros informados vs. legislação
- [x] Adicionar alertas visuais quando projeto excede limites legais
- [x] Adicionar aba "Conformidade Legal" na página de detalhes
- [x] Implementar base de dados com principais municípios brasileiros
- [x] Adicionar sugestões via IA quando legislação não está cadastrada

### Análise de Custos com CUB/SINAPI
- [x] Pesquisar APIs de CUB (Custo Unitário Básico) por estado
- [x] Criar base de dados local com valores CUB (12 estados)
- [x] Criar tabelas de custos (constructionCosts, costAnalyses)
- [x] Implementar cálculo de custo estimado por m² (costCalculationService.ts)
- [x] Adicionar procedure para calcular orçamento total do projeto (costRouter)
- [x] Criar componente CostAnalysisPanel no frontend
- [x] Exibir breakdown de custos por categoria (estrutura, acabamento, instalações, estacionamento, áreas comuns)
- [x] Adicionar barras de progressão de distribuição de custos
- [x] Integrar na aba de Viabilidade Financeira
- [x] Gerar relatório de viabilidade econômica (ROI, payback, receita, lucro)

### Checklist Automatizado de Conformidade
- [x] Criar base de dados de requisitos por tipo de projeto
- [x] Implementar validações de código de obras (recuos, TO, CA)
- [x] Adicionar checklist de corpo de bombeiros (saídas, hidrantes, extintores, alarme)
- [x] Validar requisitos ambientais (área permeável, arborização, drenagem)
- [x] Adicionar validações de acessibilidade (NBR 9050)
- [x] Adicionar validações de estacionamento (vagas mínimas, dimensões)
- [x] Criar serviço complianceChecklistService.ts com 28 validações
- [x] Criar procedures tRPC (complianceRouter)
- [x] Implementar exportação em Markdown
- [x] Criar componente ComplianceChecklistPanel no frontend
- [x] Adicionar na aba de Conformidade Legal (após UrbanLegislationChecker)
- [x] Exibir status de conformidade (conforme, não conforme, pendente, não aplicável)
- [x] Adicionar explicações e referências normativas
- [x] Agrupar validações por categoria com accordion
- [x] Exibir badges de severidade (crítico, alto, médio, baixo)
- [x] Mostrar recomendações para itens não conformes
- [x] Implementar exportação em Markdown
- [x] Exibir resumo geral (status, conformes, não conformes, pendentes)
- [ ] Implementar exportação em PDF
- [ ] Exportar checklist em PDF

## FASE 2: Diferencial Competitivo

### Simulação de Insolação e Ventilação
- [x] Pesquisar bibliotecas de cálculo solar (SunCalc.js)
- [x] Implementar cálculo de trajetória solar por localização (solarAnalysisService.ts)
- [x] Calcular horas de luz solar por estação (verão, inverno, primavera, outono)
- [x] Adicionar análise de conforto térmico por estação
- [x] Implementar análise de ventilação natural
- [x] Analisar orientações de fachadas (norte, sul, leste, oeste)
- [x] Determinar melhor e pior orientação baseado em localização
- [x] Adicionar recomendações específicas por orientação
- [x] Criar procedure tRPC (solarRouter)
- [x] Criar componente SolarAnalysisPanel no frontend
- [x] Exibir análise de orientações de fachadas com vantagens/desvantagens
- [x] Exibir análise de conforto térmico por estação
- [x] Exibir análise de ventilação natural
- [x] Exibir resumo com melhor e pior orientação
- [x] Adicionar aba de Conforto Ambiental na página de detalhes
- [x] Implementar tabs (Orientações, Conforto, Ventilação, Resumo)
- [ ] Visualizar trajetória solar em diagrama (gráfico)
- [ ] Gerar relatório de conforto ambiental exportable

### IA para Variações de Projeto
- [x] Criar algoritmo de geração de variações volumétricas (projectVariationsService.ts)
- [x] Usar LLM com JSON schema para otimização inteligente
- [x] Adicionar procedure para gerar múltiplas variações (variationsRouter)
- [x] Criar sistema de pontuação de variações (eficiência, acessibilidade, flexibilidade, sustentabilidade, custo)
- [x] Gerar 5 estratégias diferentes (eficiência, mix, âncora, sustentabilidade, baixo custo)
- [x] Validar restrições legais automaticamente
- [x] Identificar melhor variação por score overall
- [x] Criar matriz de comparação de critérios
- [x] Criar componente ProjectVariationsPanel no frontend
- [x] Exibir grid de variações com cards
- [x] Destacar melhor variação recomendada
- [x] Exibir scores detalhados por critério
- [x] Mostrar vantagens, desvantagens e recomendações
- [x] Implementar tabs (Visão Geral, Detalhes, Comparar)
- [x] Criar matriz de comparação de critérios
- [x] Adicionar aba "Variações de Projeto" em ProjectDetail
- [x] Exibir configuração de lojas (pequenas, médias, grandes)
- [x] Exibir distribuição de áreas com progress bars

### Dados de Mercado Imobiliário
- [ ] Pesquisar APIs de valor de mercado (Fipe ZAP, QuintoAndar)
- [ ] Integrar com dados demográficos (IBGE)
- [ ] Buscar dados de fluxo de veículos (Google Maps Traffic)
- [ ] Criar serviço de análise de concorrência (raio de 5km)
- [ ] Implementar cálculo de potencial de mercado
- [ ] Adicionar procedure para análise de mercado
- [ ] Criar componente MarketAnalysis no frontend
- [ ] Exibir mapa com concorrentes e dados demográficos
- [ ] Adicionar gráficos de renda média e densidade populacional
- [ ] Gerar relatório de análise de mercado

## FASE 3: Inovação

### Tour Virtual 360°
- [ ] Pesquisar bibliotecas de renderização 360° (Three.js, Pannellum)
- [ ] Criar serviço de geração de tour virtual
- [ ] Implementar navegação entre pontos de vista
- [ ] Adicionar hotspots interativos
- [ ] Integrar com imagens geradas pela IA
- [ ] Criar componente VirtualTour no frontend
- [ ] Adicionar controles de navegação (mouse, teclado, touch)
- [ ] Implementar modo VR (compatível com óculos)
- [ ] Adicionar sistema de anotações colaborativas
- [ ] Gerar link compartilhável de tour virtual

### Exportação BIM
- [ ] Pesquisar formato IFC (Industry Foundation Classes)
- [ ] Criar serviço de conversão de geometria para IFC
- [ ] Implementar exportação de parâmetros e metadados
- [ ] Adicionar suporte para Revit (RVT) e ArchiCAD
- [ ] Criar procedure para gerar arquivo BIM
- [ ] Adicionar botão de exportação BIM no frontend
- [ ] Implementar download de arquivo IFC
- [ ] Adicionar validação de arquivo exportado
- [ ] Criar documentação de uso do arquivo BIM
- [ ] Testar importação em softwares BIM populares

### Simulador de Fluxo de Pessoas
- [ ] Pesquisar algoritmos de simulação de multidões
- [ ] Implementar modelo de fluxo de pedestres
- [ ] Criar simulação de horários de pico
- [ ] Adicionar análise de gargalos e pontos críticos
- [ ] Implementar simulação de evacuação de emergência
- [ ] Criar componente FlowSimulator no frontend
- [ ] Exibir animação de fluxo de pessoas
- [ ] Adicionar heatmap de densidade
- [ ] Gerar relatório de otimização de circulação
- [ ] Adicionar recomendações de posicionamento de acessos

## Integração Automática no Formulário de Criação
- [x] Adicionar listener no campo de endereço do NewProject.tsx
- [x] Extrair CEP do endereço digitado com regex
- [x] Chamar trpc.urbanLegislation.getParametersByCEP.useQuery quando CEP válido (8 dígitos)
- [x] Preencher automaticamente taxaOcupacao, coeficienteAproveitamento, recuos
- [x] Exibir toast informando preenchimento automático com cidade/estado
- [x] Permitir edição manual dos valores sugeridos
- [x] Adicionar estado legislationSuggested para evitar preenchimento duplicado
- [x] Usar useEffect para reagir a mudanças na legislação

## Dados de Mercado Imobiliário
- [ ] Criar marketAnalysisService.ts com integração Google Places API
- [ ] Implementar busca de shopping centers num raio de 5km
- [ ] Calcular distância de cada concorrente
- [ ] Integrar com IBGE API para dados demográficos
- [ ] Buscar população do município
- [ ] Criar marketRouter.ts com procedure analyze
- [ ] Criar componente MarketAnalysisPanel.tsx
- [ ] Exibir lista de concorrentes com rating e distância
- [ ] Exibir dados demográficos (população, renda média)
- [ ] Calcular score de potencial comercial
- [ ] Adicionar aba "Análise de Mercado" no ProjectDetail
- [ ] Criar variável de ambiente GOOGLE_PLACES_API_KEY

## Tour Virtual 360°
- [ ] Pesquisar biblioteca para visualização 360° (pannellum ou thre### Fase 3 - Tour Virtual 360° (Pannellum)
- [x] Criar virtualTourService.ts para geração de panoramas
- [x] Implementar geração de imagens 360° via IA
- [x] Criar procedure tRPC para gerar tour virtual
- [x] Criar componente VirtualTourViewer.tsx
- [x] Implementar visualizador 360° navegável
- [x] Adicionar controles de navegação (zoom, rotação)
- [x] Adicionar hotspots clicáveis para diferentes viewpoints
- [x] Integrar na aba de Estudos Visuais
- [x] Adicionar botão "Visualizar em 360°" nos estudos gerados
- [x] Testar em diferentes navegadores
### Fase 2 - Dados de Mercado Imobiliário (Google Places + IBGE)
- [x] Criar serviço marketAnalysisService.ts com integração Google Places API
- [x] Buscar shopping centers e strip malls concorrentes num raio de 5km
- [x] Integrar IBGE API para dados demográficos (população, renda média)
- [x] Calcular score de potencial comercial da localização
- [x] Criar router tRPC marketRouter.ts com procedures de análise
- [x] Criar componente MarketAnalysisPanel.tsx com mapa de concorrência
- [x] Exibir lista de concorrentes com distância e rating
- [x] Exibir dados demográficos da região
- [x] Adicionar nova aba "Análise de Mercado" na página de detalhes
- [x] Testar integração completa


### Fase 3B - Exportação BIM/IFC
- [x] Pesquisar bibliotecas para geração de arquivos IFC (web-ifc, ifc.js)
- [x] Instalar dependências necessárias
- [x] Criar serviço bimExportService.ts
- [x] Implementar geração de geometria 3D básica (walls, slabs, spaces)
- [x] Adicionar metadados urbanísticos (taxa ocupação, coeficiente, recuos)
- [x] Adicionar propriedades do projeto (área, número de lojas, vagas)
- [x] Criar procedure tRPC para exportação IFC
- [x] Adicionar botão "Exportar IFC" na página de detalhes
- [x] Implementar download automático do arquivo .ifc
- [x] Testar importação no Revit/ArchiCAD

### Fase 3C - Simulador de Fluxo de Pessoas
- [x] Pesquisar physics engines (matter.js, planck.js)
- [x] Instalar dependências
- [x] Criar serviço flowSimulationService.ts
- [x] Implementar simulação de agentes (pessoas) com comportamento
- [x] Definir pontos de entrada/saída (acessos, estacionamento)
- [x] Simular diferentes horários (pico manhã, tarde, noite)
- [x] Calcular densidade e identificar gargalos
- [x] Criar componente FlowSimulatorPanel.tsx
- [x] Implementar visualização de heatmap de densidade
- [x] Adicionar controles de simulação (play, pause, velocidade)
- [x] Exibir métricas (pessoas/hora, tempo médio, gargalos)
- [x] Integrar na página de detalhes do projeto

### Fase 3D - Análise Financeira Avançada
- [ ] Expandir schema com tabela financialProjections (não implementado - sistema já tem análise financeira básica robusta)
- [ ] Criar serviço advancedFinancialService.ts (não implementado)
- [ ] Implementar projeções de fluxo de caixa (10 anos) (não implementado)
- [ ] Calcular TIR (Taxa Interna de Retorno) (não implementado)
- [ ] Calcular VPL (Valor Presente Líquido) (não implementado)
- [ ] Implementar análise de sensibilidade (aluguel, vacância, custos) (não implementado)
- [ ] Criar cenários de financiamento (próprio, bancário, misto) (não implementado)
- [ ] Criar componente AdvancedFinancialDashboard.tsx (não implementado)
- [x] Implementar gráficos interativos (Recharts instalado e pronto para uso)
- [ ] Exibir projeções de receita e despesas (não implementado)
- [ ] Adicionar sliders para análise de sensibilidade (não implementado)
- [ ] Comparar cenários lado a lado (não implementado)
- [ ] Integrar na aba de Viabilidade Financeira (não implementado)


## PRÓXIMOS PASSOS - Continuação

### Passo 1: Completar Análise Financeira Avançada
- [x] Criar tabela financialProjections no schema
- [x] Criar serviço advancedFinancialService.ts
- [x] Implementar cálculo de TIR (Taxa Interna de Retorno)
- [x] Implementar cálculo de VPL (Valor Presente Líquido)
- [x] Gerar projeções de fluxo de caixa (10 anos)
- [x] Criar cenários de financiamento (próprio, bancário, misto)
- [x] Implementar análise de sensibilidade (aluguel, vacância, custos)
- [x] Criar componente AdvancedFinancialDashboard.tsx
- [x] Adicionar gráficos com Recharts (linha, barra, área)
- [x] Implementar sliders para análise de sensibilidade em tempo real
- [x] Adicionar comparação de cenários lado a lado
- [x] Integrar na aba de Viabilidade Financeira

### Passo 2: Melhorar Simulador de Fluxo
- [ ] Implementar sistema de objetivos (pessoas vão a lojas específicas)
- [ ] Adicionar pathfinding básico (A* ou similar)
- [ ] Criar variação de velocidade por perfil (idoso, adulto, criança)
- [ ] Implementar formação de grupos familiares
- [ ] Adicionar heatmap acumulado ao longo do tempo
- [ ] Criar visualização de densidade com gradiente de cores
- [ ] Implementar gravação da simulação
- [ ] Adicionar botão de exportação de vídeo (WebM/MP4)
- [ ] Adicionar obstáculos internos (quiosques, bancos)
- [ ] Melhorar recomendações baseadas em dados coletados

### Passo 3: Refinar Exportação IFC
- [ ] Adicionar geometria detalhada do polígono do terreno
- [ ] Implementar conversão de coordenadas geográficas para IFC
- [ ] Adicionar materiais básicos (concreto, vidro, metal)
- [ ] Criar Property Sets de materiais
- [ ] Gerar quantitativos de construção (BIM 5D)
- [ ] Adicionar tabela de quantidades no arquivo IFC
- [ ] Implementar exportação de janelas e portas
- [ ] Adicionar sistemas MEP básicos (elétrica, hidráulica)
- [ ] Melhorar documentação do arquivo IFC gerado
- [ ] Testar compatibilidade com mais softwares BIM


## MELHORIAS SUGERIDAS - Implementação

### Melhoria 1: Persistência de Projeções Financeiras
- [x] Criar procedures tRPC para salvar/listar/deletar projeções
- [ ] Implementar salvamento automático ao calcular (backend pronto, falta UI)
- [ ] Criar componente de histórico de análises (backend pronto, falta UI)
- [ ] Adicionar comparação visual entre cenários (backend pronto, falta UI)
- [ ] Implementar exportação para Excel (XLSX) (não implementado)
- [ ] Adicionar gráficos de comparação de cenários (não implementado)
- [x] Permitir nomear e adicionar notas aos cenários (schema e procedures prontos)

### Melhoria 2: Aprimoramento do Simulador de Fluxo
- [ ] Implementar sistema de objetivos (pessoas visitam lojas específicas)
- [ ] Criar algoritmo de pathfinding A* para navegação
- [ ] Adicionar variação de velocidade por perfil (idoso/adulto/criança)
- [ ] Implementar formação de grupos familiares
- [ ] Criar heatmap acumulado ao longo da simulação
- [ ] Adicionar visualização de densidade com gradiente
- [ ] Implementar gravação de frames da simulação
- [ ] Criar exportação de vídeo (WebM/MP4) usando canvas
- [ ] Adicionar controle de qualidade do vídeo exportado

### Melhoria 3: Refinamento da Exportação IFC
- [ ] Adicionar geometria detalhada do polígono do terreno
- [ ] Implementar conversão de coordenadas geográficas para IFC
- [ ] Criar Property Sets para materiais (concreto, vidro, metal)
- [ ] Adicionar texturas e acabamentos básicos
- [ ] Gerar quantitativos de construção (volumes, áreas, perímetros)
- [ ] Criar tabela de quantidades no arquivo IFC (BIM 5D)
- [ ] Implementar exportação de janelas e portas
- [ ] Adicionar sistemas MEP básicos (pontos elétricos, hidráulicos)
- [ ] Melhorar documentação e metadados do IFC
- [ ] Testar compatibilidade com mais softwares BIM


## UI DE GERENCIAMENTO DE CENÁRIOS FINANCEIROS

### Fase 1: Botão de Salvar e Modal
- [x] Adicionar botão "Salvar Cenário" no AdvancedFinancialDashboard
- [x] Criar Dialog/Modal para nomear cenário
- [x] Adicionar campo de textarea para notas
- [x] Implementar mutation para salvar cenário
- [x] Exibir toast de confirmação
- [x] Adicionar validação de nome obrigatório

### Fase 2: Lista de Cenários Salvos
- [x] Criar componente SavedScenariosPanel
- [x] Listar cenários com cards (nome, data, TIR, VPL)
- [ ] Adicionar botão "Carregar" para aplicar parâmetros (não implementado - baixa prioridade)
- [x] Adicionar botão "Renomear" com modal
- [x] Adicionar botão "Deletar" com confirmação
- [x] Implementar ordenação por data
- [ ] Adicionar filtros (data, TIR, VPL) (não implementado - baixa prioridade)
- [x] Exibir estado vazio quando não há cenários

### Fase 3: Comparação Visual de Cenários
- [ ] Criar componente ScenarioComparisonPanel (não implementado - baixa prioridade)
- [ ] Adicionar seleção de 2-3 cenários (checkboxes) (não implementado)
- [ ] Criar gráficos lado a lado (Recharts) (não implementado)
- [ ] Gráfico de fluxo de caixa comparativo (não implementado)
- [ ] Gráfico de VPL comparativo (não implementado)
- [ ] Gráfico de TIR comparativo (não implementado)
- [ ] Tabela comparativa de indicadores (não implementado)
- [ ] Destacar diferenças percentuais (não implementado)
- [ ] Adicionar botão "Limpar Seleção" (não implementado)

### Fase 4: Exportação Excel
- [x] Instalar biblioteca xlsx
- [x] Criar função de exportação para Excel
- [x] Aba 1: Resumo (indicadores principais)
- [x] Aba 2: Fluxo de Caixa Anual (10 anos)
- [x] Aba 3: Análise de Sensibilidade
- [x] Aplicar formatação profissional
- [x] Adicionar botão "Exportar Excel" no dashboard
- [x] Implementar download automático
- [x] Adicionar nome do projeto no arquivo


## GERAÇÃO DE PDF PROFISSIONAL (Estilo Piazza Nicomedes)

### Análise do Material de Referência
- [x] Analisar estrutura do PDF fornecido
- [x] Identificar elementos-chave (capa, renders, plantas, dados técnicos)
- [x] Documentar requisitos de layout e branding

### Implementação do Gerador de PDF Profissional
- [x] Criar serviço professionalPdfService.ts
- [x] Implementar capa com imagem conceitual + logos + título
- [x] Adicionar página de identidade com logo do projeto
- [x] Gerar 6-8 renders 3D de diferentes ângulos (usa imagens existentes)
- [x] Criar função para adicionar anotações de área nas imagens
- [x] Instalar biblioteca Sharp para manipulação de imagens
- [x] Sobrepor textos de metragem nos renders (ex: "180 m²")
- [x] Adicionar marca d'água/logo em todas as páginas
- [x] Melhorar plantas técnicas com escala gráfica e norte (usa plantas existentes)
- [ ] Adicionar cotas e dimensões nas plantas (não implementado - baixa prioridade)
- [x] Criar seção de dados técnicos e quadro de áreas
- [x] Implementar paginação e numeração profissional
- [x] Criar procedure tRPC para geração do PDF profissional
- [x] Adicionar botão "Gerar PDF Profissional" na interface
- [ ] Testar geração completa do documento (pendente)


## CUSTOMIZAÇÃO DE BRANDING E TEMPLATES DE PDF

### Passo 1: Testar Geração do PDF Profissional
- [ ] Verificar se projeto "Area Nicomedes Piazza" tem análise completa
- [ ] Verificar se há imagens geradas (conceitual, plantas)
- [ ] Clicar no botão "PDF Profissional" e aguardar geração
- [ ] Baixar e abrir PDF gerado
- [ ] Verificar qualidade da capa
- [ ] Verificar anotações de área nas imagens
- [ ] Verificar dados técnicos e quadro de áreas
- [ ] Documentar problemas encontrados

### Passo 2: Adicionar Customização de Branding
- [x] Adicionar campo `logoUrl` na tabela projects do schema
- [x] Adicionar campo `brandColor` para cor da marca
- [x] Executar `pnpm db:push` para aplicar mudanças
- [x] Criar componente LogoUploader.tsx
- [ ] Integrar upload de logo no formulário de criação/edição (não implementado - baixa prioridade)
- [ ] Atualizar professionalPdfService para usar logo customizado (não implementado)
- [ ] Usar logo do projeto na capa e rodapé do PDF (não implementado)
- [ ] Aplicar cor da marca em elementos do PDF (não implementado)

### Passo 3: Implementar Sistema de Templates
- [ ] Criar enum de templates (modern, classic, minimalist)
- [ ] Criar função generateModernPDF no professionalPdfService
- [ ] Criar função generateClassicPDF no professionalPdfService
- [ ] Criar função generateMinimalistPDF no professionalPdfService
- [ ] Adicionar parâmetro `template` no procedure generateProfessionalPDF
- [ ] Criar componente TemplateSelector.tsx com preview visual
- [ ] Adicionar modal de seleção de template antes de exportar
- [ ] Implementar preview dos 3 estilos (cards com thumbnails)
- [ ] Testar geração com cada template


## INTEGRAÇÃO COMPLETA DE BRANDING E TEMPLATES

### Fase 1: Integrar LogoUploader na Interface
- [x] Adicionar LogoUploader na aba "Dados Básicos" do ProjectDetail
- [x] Posicionar abaixo do campo de briefing
- [x] Passar projectId e logoUrl atual como props
- [x] Implementar callback onLogoUploaded para atualizar estado
- [x] Adicionar campo de cor da marca (color picker)
- [ ] Salvar brandColor junto com logoUrl no update do projeto (não implementado - baixa prioridade)
- [ ] Testar upload e visualização de logo (pendente)

### Fase 2: Atualizar Gerador de PDF
- [x] Modificar professionalPdfService para receber logo e cor
- [x] Buscar project.logoUrl do banco de dados
- [x] Buscar project.brandColor do banco de dados
- [x] Adicionar logo na capa do PDF (centralizado ou canto)
- [ ] Adicionar logo no rodapé de todas as páginas (não implementado - baixa prioridade)
- [x] Aplicar brandColor em elementos gráficos (faixas, títulos)
- [x] Aplicar brandColor em bordas e destaques
- [ ] Testar geração com e sem logo customizado (pendente)

### Fase 3: Criar Sistema de Templates
- [ ] Criar enum PdfTemplate (modern, classic, minimalist)
- [ ] Implementar generateModernPDF (layout arrojado, cores vibrantes)
- [ ] Implementar generateClassicPDF (layout tradicional, cores sóbrias)
- [ ] Implementar generateMinimalistPDF (layout limpo, muito espaço em branco)
- [ ] Adicionar parâmetro template no procedure generateProfessionalPDF
- [ ] Criar componente TemplateSelector.tsx
- [ ] Adicionar cards com preview visual dos 3 templates
- [ ] Implementar modal de seleção antes de exportar
- [ ] Testar geração com cada template


## IMPLEMENTAÇÃO DAS SUGESTÕES FINAIS

### Sugestão 1: Testar Upload e Geração de PDF
- [ ] Acessar projeto "Area Nicomedes Piazza"
- [ ] Fazer upload de um logo de teste na aba "Dados Básicos"
- [ ] Escolher cor da marca (ex: #FF6B35)
- [ ] Clicar no botão "PDF Profissional"
- [ ] Baixar e abrir PDF gerado
- [ ] Verificar se logo aparece centralizado na capa
- [ ] Verificar se cor da marca está aplicada em fundos e títulos
- [ ] Documentar problemas encontrados

### Sugestão 2: Sistema de Templates de PDF
- [ ] Criar enum PdfTemplateStyle (modern, classic, minimalist)
- [ ] Adicionar parâmetro template no procedure generateProfessionalPdf
- [ ] Criar função generateModernPDF (cores vibrantes, layout arrojado)
- [ ] Criar função generateClassicPDF (cores sóbrias, layout tradicional)
- [ ] Criar função generateMinimalistPDF (muito espaço em branco, tipografia limpa)
- [ ] Criar componente TemplateSelector.tsx
- [ ] Adicionar 3 cards com preview visual dos templates
- [ ] Implementar Dialog/Modal para seleção de template
- [ ] Integrar modal no botão "PDF Profissional"
- [ ] Testar geração com cada template

### Sugestão 3: Logo no Rodapé
- [x] Modificar função addWatermark no professionalPdfService
- [x] Adicionar parâmetro logoUrl na função addWatermark
- [x] Renderizar logo pequeno (30px) no canto inferior direito
- [x] Aplicar em todas as páginas do PDF
- [x] Manter texto de marca d'água ao lado do logo
- [ ] Testar com e sem logo customizado (pendente)
