# Guia de Imagens para os 18 Novos Projetos de Inspiração

## Contexto
Os 18 projetos adicionados (IDs 8-25) são projetos fictícios criados para demonstração do sistema. Como não possuem fotos reais, recomendamos duas abordagens:

## Opção 1: Usar Imagens de Stock (Recomendado)

Buscar imagens de strip malls brasileiros em bancos de imagens:
- **Unsplash**: https://unsplash.com/s/photos/shopping-center-brazil
- **Pexels**: https://www.pexels.com/search/shopping%20mall/
- **Pixabay**: https://pixabay.com/images/search/shopping/

### Critérios de Seleção:
- Fachadas modernas de strip malls
- Estacionamento visível
- Arquitetura brasileira contemporânea
- Alta resolução (mínimo 1920x1080)
- Sem marcas d'água

## Opção 2: Gerar Imagens via IA

Usar o sistema de geração de imagens do próprio projeto para criar renders realistas:

### Prompts Sugeridos por Tipo:

**Strip Mall Compacto (3.500-5.200m²):**
```
Modern Brazilian strip mall, compact design, 10-14 stores, ACM facade panels in neutral tones, 
covered parking for 70-110 cars, single-story building, clean architecture, golden hour lighting, 
aerial 3/4 view, professional architectural photography
```

**Strip Mall Médio (6.500-9.000m²):**
```
Contemporary Brazilian strip mall, medium scale, 16-24 stores, mixed materials (glass, concrete, ACM), 
ample parking 140-200 spaces, modern signage, landscaping with native plants, afternoon sunlight, 
wide angle 24mm lens, architectural render quality
```

**Open Mall (11.000-15.000m²):**
```
Large Brazilian open mall, open-air design, 28-40 stores, pedestrian walkways, central plaza, 
modern architecture with steel and glass, 220-300 parking spaces, green areas, people walking, 
cars in parking, blue sky, professional real estate photography
```

**Neighborhood Center (5.800-7.800m²):**
```
Brazilian neighborhood shopping center, family-friendly, 15-20 stores, supermarket anchor visible, 
convenient access, covered parking 120-160 spaces, welcoming facade, afternoon lighting, 
community-focused design, architectural photography
```

**Boulevard Gastronômico:**
```
Upscale Brazilian food boulevard, premium gastronomy, 10 restaurants, sophisticated facade, 
outdoor seating area, valet parking, modern lighting, evening ambiance, luxury retail architecture
```

## Opção 3: Usar Placeholders Temporários

Enquanto não há imagens definitivas, manter o placeholder atual que exibe:
- Ícone de Building2 do Lucide
- Fundo gradiente
- Mensagem "Imagem em breve"

## Como Atualizar as Imagens

### Via Painel Admin (Recomendado):
1. Acessar `/admin/inspiracao`
2. Clicar em "Editar" no projeto desejado
3. Colar URL da imagem no campo "URL da Imagem Principal"
4. Salvar alterações

### Via SQL (Avançado):
```sql
UPDATE inspirationProjects 
SET mainImageUrl = 'URL_DA_IMAGEM_AQUI' 
WHERE id = ID_DO_PROJETO;
```

## Mapeamento de Projetos (IDs 8-25)

| ID | Nome do Projeto | Tipo | Sugestão de Imagem |
|----|----------------|------|-------------------|
| 8  | Shopping Cidade | Strip Mall | Fachada moderna, médio porte |
| 9  | Boulevard Shopping Contagem | Open Mall | Open mall com área verde |
| 10 | Strip Mall Savassi | Strip Mall | Premium, região nobre |
| 11 | Neighborhood Center Eldorado | Neighborhood | Familiar, supermercado |
| 12 | Open Mall Pampulha | Open Mall | Grande porte, contemporâneo |
| 13 | Strip Mall Betim Centro | Strip Mall | Estratégico, fácil acesso |
| 14 | Shopping Neighborhood Venda Nova | Neighborhood | Conveniência, eventos |
| 15 | Boulevard Gastronômico Lourdes | Strip Mall | Gastronomia premium |
| 16 | Strip Mall Industrial Contagem | Strip Mall | B2B, pé direito alto |
| 17 | Open Mall Barreiro | Open Mall | Popular, área de lazer |
| 18 | Neighborhood Center Santa Luzia | Neighborhood | Conveniência local |
| 19 | Strip Mall Sete Lagoas | Strip Mall | Modernizado, Wi-Fi |
| 20 | Boulevard Fashion Savassi | Strip Mall | Moda premium, valet |
| 21 | Open Mall Ribeirão das Neves | Open Mall | Praça central, eventos |
| 22 | Strip Mall Ibirité | Strip Mall | Estacionamento coberto |
| 23 | Neighborhood Center Nova Lima | Neighborhood | Premium, classe AA |
| 24 | Strip Mall Sabará | Strip Mall | Centro histórico |
| 25 | Open Mall Vespasiano | Open Mall | Familiar, playground |

## Próximos Passos

1. Escolher uma das 3 opções acima
2. Preparar/buscar as imagens
3. Atualizar via painel admin ou SQL
4. Verificar visualização na galeria
5. Ajustar se necessário (crop, resolução, etc)

## Nota Importante

Como os projetos são fictícios, **não é necessário** buscar fotos reais dos empreendimentos. O objetivo é ter imagens representativas que ilustrem o tipo e porte de cada projeto para melhorar a experiência visual da galeria.
