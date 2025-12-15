# Processo para Adicionar Imagens aos Projetos de Inspiração

Este guia explica como adicionar imagens reais aos 18 projetos de inspiração (IDs 8-25) que atualmente não possuem imagens.

## 📋 Opções Disponíveis

### Opção 1: Upload via Painel Admin (Recomendado)

**Mais simples e rápido para imagens já disponíveis**

1. Acesse `/admin/inspiracao` (requer login como admin)
2. Localize o projeto desejado na lista
3. Clique em "Editar"
4. No campo "URL da Imagem Principal", cole a URL da imagem:
   - Para imagens locais: `/inspiracao/nome-arquivo.jpg`
   - Para imagens externas: `https://exemplo.com/imagem.jpg`
5. Clique em "Salvar"

**Vantagens:**
- Interface visual amigável
- Validação automática de campos
- Preview imediato
- Sem necessidade de SQL

### Opção 2: Geração via IA

**Para criar renders realistas personalizados**

Use o próprio sistema de geração de imagens da aplicação:

1. Acesse a página de novo projeto
2. Preencha os dados básicos do projeto similar ao da galeria
3. Gere o estudo conceitual
4. Faça download da imagem gerada
5. Faça upload para `/client/public/inspiracao/`
6. Atualize via painel admin com a URL local

**Prompts sugeridos** (consulte `GUIA-IMAGENS-NOVOS-PROJETOS.md` para prompts detalhados por tipo)

### Opção 3: Imagens de Stock

**Para usar fotos profissionais existentes**

Fontes recomendadas:
- Unsplash (gratuito, alta qualidade)
- Pexels (gratuito)
- Pixabay (gratuito)
- Shutterstock (pago, maior variedade)

Termos de busca sugeridos:
- "strip mall brazil"
- "shopping center facade"
- "retail plaza"
- "commercial building exterior"

### Opção 4: Atualização em Massa via SQL

**Para atualizar múltiplos projetos de uma vez**

```sql
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/shopping-cidade.jpg' 
WHERE id = 8;

UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/boulevard-contagem.jpg' 
WHERE id = 9;

-- Repita para cada projeto...
```

## 🗂️ Mapeamento de Projetos (IDs 8-25)

| ID | Nome do Projeto | Categoria | Sugestão de Imagem |
|----|----------------|-----------|-------------------|
| 8 | Shopping Cidade | Strip Mall | Strip mall moderno, fachada ACM |
| 9 | Boulevard Shopping Contagem | Open Mall | Open mall com praça central |
| 10 | Strip Mall Savassi | Strip Mall | Strip mall urbano, vidro e concreto |
| 11 | Neighborhood Center Pampulha | Neighborhood Center | Centro de vizinhança com supermercado |
| 12 | Open Mall Eldorado | Open Mall | Open mall com paisagismo |
| 13 | Strip Mall Buritis | Strip Mall | Strip mall compacto, estacionamento frontal |
| 14 | Boulevard Gourmet Lourdes | Open Mall | Boulevard gastronômico, área externa |
| 15 | Neighborhood Center Castelo | Neighborhood Center | Centro comercial de bairro |
| 16 | Strip Mall Mangabeiras | Strip Mall | Strip mall em área nobre |
| 17 | Open Mall Belvedere | Open Mall | Open mall premium, arquitetura contemporânea |
| 18 | Strip Mall Santa Inês | Strip Mall | Strip mall tradicional |
| 19 | Neighborhood Center São Pedro | Neighborhood Center | Centro de conveniência |
| 20 | Open Mall Funcionários | Open Mall | Open mall urbano |
| 21 | Strip Mall Gutierrez | Strip Mall | Strip mall compacto |
| 22 | Neighborhood Center Barreiro | Neighborhood Center | Centro comercial popular |
| 23 | Strip Mall Anchieta | Strip Mall | Strip mall médio porte |
| 24 | Open Mall Luxemburgo | Open Mall | Open mall sofisticado |
| 25 | Strip Mall Jaraguá | Strip Mall | Strip mall tradicional |

## 📁 Organização de Arquivos

Recomendações para nomear e organizar imagens:

```
client/public/inspiracao/
├── shopping-cidade.jpg (ID 8)
├── boulevard-contagem.jpg (ID 9)
├── strip-mall-savassi.jpg (ID 10)
├── neighborhood-pampulha.jpg (ID 11)
└── ...
```

**Convenções de nomenclatura:**
- Use apenas letras minúsculas
- Substitua espaços por hífens (-)
- Use extensão .jpg ou .png
- Mantenha nomes descritivos e curtos

## ✅ Checklist de Qualidade

Antes de adicionar uma imagem, verifique:

- [ ] Resolução mínima: 1200×800 pixels
- [ ] Formato: JPG ou PNG
- [ ] Tamanho do arquivo: < 500KB (otimize se necessário)
- [ ] Aspecto: 3:2 ou 16:9 (horizontal)
- [ ] Qualidade: Nítida, bem iluminada
- [ ] Conteúdo: Mostra claramente a fachada/exterior do empreendimento
- [ ] Direitos: Imagem livre de direitos autorais ou com permissão de uso

## 🔧 Ferramentas Úteis

**Otimização de imagens:**
- TinyPNG (https://tinypng.com/) - Compressão sem perda de qualidade
- Squoosh (https://squoosh.app/) - Otimização avançada

**Edição básica:**
- Photopea (https://www.photopea.com/) - Editor online gratuito
- GIMP - Software gratuito desktop

## 📊 Status Atual

- **Total de projetos:** 25
- **Com imagens:** 7 (IDs 1-7)
- **Sem imagens:** 18 (IDs 8-25)
- **Meta:** 100% dos projetos com imagens

## 🚀 Próximos Passos Recomendados

1. **Curto prazo:** Adicionar placeholders genéricos via painel admin
2. **Médio prazo:** Substituir por imagens de stock de alta qualidade
3. **Longo prazo:** Gerar renders personalizados via IA para cada projeto

---

**Dúvidas?** Consulte também:
- `GUIA-IMAGENS-INSPIRACAO.md` - Imagens dos primeiros 7 projetos
- `GUIA-IMAGENS-NOVOS-PROJETOS.md` - Prompts de geração IA detalhados
