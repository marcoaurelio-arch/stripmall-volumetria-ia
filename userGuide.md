# Strip Mall Volumetria IA - Guia do Usuário

## Informações Gerais

**Propósito:** Criar e analisar estudos de massa e volumetria para projetos de strip malls com inteligência artificial.

**Acesso:** Login obrigatório via autenticação da plataforma.

---

## Plataforma

Esta aplicação utiliza tecnologias de ponta para entregar análises precisas e rápidas:

**Frontend:** React 19 com TypeScript, Tailwind CSS 4 e shadcn/ui para interface moderna e responsiva.

**Backend:** Node.js com Express 4 e tRPC 11 para comunicação type-safe entre cliente e servidor.

**Banco de Dados:** MySQL/TiDB com Drizzle ORM para gerenciamento eficiente de dados.

**Inteligência Artificial:** Integração com GPT-4 para análises volumétricas avançadas e sugestões de layout otimizadas.

**Autenticação:** OAuth para login seguro e gerenciamento de usuários.

**Deployment:** Infraestrutura auto-escalável com CDN global para acesso rápido de qualquer lugar.

---

## Usando Sua Aplicação

### Criando um Novo Projeto

Acesse a página inicial e clique em "Novo Projeto" no cabeçalho. Preencha o formulário com os dados do terreno: insira o nome do projeto. Na seção "Localização do Terreno", busque o endereço ou clique em "Desenhar" para ativar o modo de desenho de polígono. Clique nos cantos do terreno no mapa para traçar o perímetro exato - a área será calculada automaticamente em metros quadrados. Clique em "Concluir" para finalizar o polígono. Você pode salvar diferentes configurações de polígono como cenários clicando em "Salvar Cenário Atual". Opcionalmente, adicione descrição, dimensões e parâmetros urbanísticos. Clique em "Criar Projeto" para salvar.

### Analisando um Terreno

Na lista de projetos, clique em "Ver Detalhes" no projeto desejado. Na página do projeto, clique no botão "Analisar com IA" para iniciar a análise volumétrica. A inteligência artificial processará os dados e gerará automaticamente: área máxima construída, área ocupada no térreo, número recomendado de lojas, quantidade de vagas de estacionamento, dimensões da volumetria (largura, comprimento e altura), descrição detalhada do layout e sugestões de projeto.

### Visualizando Resultados

Após a análise, navegue pelas abas "Dados do Terreno" para revisar informações inseridas e visualizar a localização no mapa interativo, "Análise Volumétrica" para ver resultados dos cálculos e dimensões da volumetria, e "Relatório" para ler sugestões e recomendações detalhadas da IA. Na seção "Cenários de Polígonos", você pode salvar, carregar e comparar diferentes configurações de terreno para o mesmo projeto. Todos os valores são exibidos em métricas claras e organizadas.

---

## Gerenciando Sua Aplicação

### Visualizando Projetos

Acesse "Meus Projetos" no cabeçalho para ver todos os seus projetos. Cada card mostra nome, status (Rascunho, Analisando ou Concluído), área do terreno e data de criação. Use o botão de lixeira para excluir projetos indesejados.

### Painel de Gerenciamento

Acesse o painel de gerenciamento através do ícone no cabeçalho da interface. No painel "Preview", visualize a aplicação em tempo real. Em "Code", navegue pelos arquivos do projeto e faça download se necessário. No "Dashboard", monitore estatísticas de uso e controle a visibilidade da aplicação. Em "Database", gerencie dados diretamente através da interface CRUD. No painel "Settings", ajuste configurações gerais, domínios personalizados e variáveis de ambiente. Para habilitar os mapas interativos, adicione sua Google Maps API Key em "Settings → Secrets" com o nome VITE_GOOGLE_MAPS_API_KEY.

---

## Próximos Passos

Para evoluir a aplicação, registre novas demandas técnicas ou funcionais no fluxo interno do projeto. Para usar os mapas interativos, obtenha uma chave de API gratuita do Google Maps em console.cloud.google.com e adicione em Settings → Secrets. Experimente criar seu primeiro projeto de strip mall com localização geográfica e veja como a IA otimiza automaticamente o layout e a distribuição de espaços para maximizar o potencial do terreno.
