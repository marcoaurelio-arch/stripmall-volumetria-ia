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
