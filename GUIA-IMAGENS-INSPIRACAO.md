# Guia de Imagens dos Projetos de Inspiração

## 📸 Imagens Disponíveis

As seguintes imagens foram baixadas e estão disponíveis em `/client/public/inspiracao/`:

### Imagens de Alta Qualidade

1. **boulevard-gourmet.jpg** (1280x720, 176KB)
   - Festival gastronômico do Boulevard Gourmet
   - Uso sugerido: Boulevard Gourmet, Open Mall Savassi

2. **boulevard-gourmet-interior.jpg** (1200x675, 132KB)
   - Interior do Boulevard Gourmet
   - Uso sugerido: Projetos de praça de alimentação

3. **gsa-ativos.jpg** (1024x575, 148KB)
   - Projeto da GSA Ativos
   - Uso sugerido: GSA Pampulha, projetos GSA

4. **shopping-brasil-1.jpg** (1300x906, 136KB)
   - Shopping center brasileiro moderno
   - Uso sugerido: BestCenter Contagem, Shopping Cidade

5. **shopping-brasil-2.jpg** (1300x956, 213KB)
   - Interior de shopping brasileiro
   - Uso sugerido: Projetos de shopping center

6. **shopping-sao-paulo.jpg** (1500x917, 127KB)
   - Shopping em São Paulo
   - Uso sugerido: Strip Mall Eldorado, projetos de São Paulo

7. **strip-mall-lmf.jpg** (1280x720, 115KB)
   - Strip Mall LMF Ribeirão Pires
   - Uso sugerido: New LMF Betim, projetos LMF

## 🔗 Como Usar no Painel Admin

### Opção 1: URLs Locais (Recomendado para Desenvolvimento)

Acesse `/admin/inspiracao` e use as URLs relativas:

```
/inspiracao/boulevard-gourmet.jpg
/inspiracao/boulevard-gourmet-interior.jpg
/inspiracao/gsa-ativos.jpg
/inspiracao/shopping-brasil-1.jpg
/inspiracao/shopping-brasil-2.jpg
/inspiracao/shopping-sao-paulo.jpg
/inspiracao/strip-mall-lmf.jpg
```

### Opção 2: Upload para S3 (Recomendado para Produção)

1. Acesse o painel admin em `/admin/inspiracao`
2. Para cada projeto, clique em "Editar"
3. No campo "URL da Imagem Principal", cole a URL do S3 após fazer upload
4. Clique em "Atualizar Projeto"

## 📋 Sugestão de Associação

| Projeto | Imagem Sugerida | URL Local |
|---------|----------------|-----------|
| Boulevard Gourmet | Festival gastronômico | `/inspiracao/boulevard-gourmet.jpg` |
| GSA Pampulha | Projeto GSA | `/inspiracao/gsa-ativos.jpg` |
| BestCenter Contagem | Shopping moderno | `/inspiracao/shopping-brasil-1.jpg` |
| New LMF Betim | Strip Mall LMF | `/inspiracao/strip-mall-lmf.jpg` |
| Shopping Cidade | Shopping interior | `/inspiracao/shopping-brasil-2.jpg` |
| Open Mall Savassi | Boulevard interior | `/inspiracao/boulevard-gourmet-interior.jpg` |
| Strip Mall Eldorado | Shopping SP | `/inspiracao/shopping-sao-paulo.jpg` |

## 🚀 Atualização Rápida via SQL (Opcional)

Se preferir atualizar diretamente no banco de dados, use o painel Database na interface de gerenciamento:

```sql
-- Atualizar Boulevard Gourmet
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/boulevard-gourmet.jpg' 
WHERE name LIKE '%Boulevard Gourmet%';

-- Atualizar GSA Pampulha
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/gsa-ativos.jpg' 
WHERE name LIKE '%GSA%Pampulha%';

-- Atualizar BestCenter Contagem
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/shopping-brasil-1.jpg' 
WHERE name LIKE '%BestCenter%Contagem%';

-- Atualizar New LMF Betim
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/strip-mall-lmf.jpg' 
WHERE name LIKE '%LMF%Betim%';

-- Atualizar Shopping Cidade
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/shopping-brasil-2.jpg' 
WHERE name LIKE '%Shopping Cidade%';

-- Atualizar Open Mall Savassi
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/boulevard-gourmet-interior.jpg' 
WHERE name LIKE '%Savassi%';

-- Atualizar Strip Mall Eldorado
UPDATE inspirationProjects 
SET mainImageUrl = '/inspiracao/shopping-sao-paulo.jpg' 
WHERE name LIKE '%Eldorado%';
```

## 📝 Notas

- As imagens estão em `client/public/inspiracao/` e serão servidas estaticamente
- URLs locais começam com `/inspiracao/` (sem `client/public`)
- Para produção, considere fazer upload para S3 e usar URLs absolutas
- O painel admin permite preview da imagem ao colar a URL
