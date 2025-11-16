# 🔍 Guia de Verificação de Variáveis de Ambiente

Este guia explica como verificar se a variável `VITE_GOOGLE_MAPS_API_KEY` está configurada corretamente no projeto.

## Método 1: Script de Linha de Comando (Recomendado)

### Executar o Script

```bash
node verify-env.mjs
```

### O que o script verifica:

- ✅ **Variáveis Obrigatórias**: `VITE_GOOGLE_MAPS_API_KEY`
- 📋 **Variáveis Opcionais**: Todas as outras variáveis `VITE_*`
- 📦 **Lista Completa**: Mostra todas as variáveis disponíveis

### Exemplo de Saída (Sucesso):

```
🔍 Verificando Variáveis de Ambiente VITE
============================================================

📋 Variáveis Obrigatórias:

  ✅ VITE_GOOGLE_MAPS_API_KEY
     Valor: AIzaSyB1...f3e1
     Tamanho: 39 caracteres

============================================================

✅ Todas as variáveis obrigatórias estão configuradas!
```

### Exemplo de Saída (Erro):

```
❌ ERRO: Variáveis obrigatórias não configuradas!

📝 Como resolver:
   1. Acesse o painel de gerenciamento do projeto
   2. Vá em Settings → Secrets
   3. Adicione a variável VITE_GOOGLE_MAPS_API_KEY
   4. Reinicie o servidor de desenvolvimento
```

---

## Método 2: Componente Visual React

### Como Usar:

1. **Importe o componente** em qualquer página:

```tsx
import EnvChecker from '@/components/EnvChecker';

export default function MyPage() {
  return (
    <div>
      <EnvChecker />
      {/* Resto do conteúdo da página */}
    </div>
  );
}
```

2. **Acesse a página** no navegador

3. **Visualize o status** das variáveis em um card colorido:
   - ✅ Verde = Configurada
   - ❌ Vermelho = Não configurada (obrigatória)
   - ⚠️ Amarelo = Não configurada (opcional)

4. **Remova o componente** após verificar

### Exemplo de Uso Rápido (Home.tsx):

```tsx
// Adicione temporariamente no topo da página Home
import EnvChecker from '@/components/EnvChecker';

export default function Home() {
  return (
    <div>
      <EnvChecker /> {/* ← Adicione esta linha */}
      {/* ... resto do código ... */}
    </div>
  );
}
```

---

## Método 3: Console do Navegador

### Passos:

1. Abra o **DevTools** (F12)
2. Vá na aba **Console**
3. Digite e execute:

```javascript
console.log('Google Maps API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
```

### Resultado Esperado:

- **Se configurada**: Mostra a chave (ex: `AIzaSyB1234...`)
- **Se não configurada**: Mostra `undefined`

---

## Método 4: Verificar Diretamente nos Componentes

Os componentes de mapa já possuem verificação embutida:

- `LocationPicker.tsx`
- `LocationPickerWithDrawing.tsx`
- `LocationViewer.tsx`

Se a variável não estiver configurada, eles mostram automaticamente uma mensagem de erro com instruções.

---

## Como Adicionar a Variável VITE_GOOGLE_MAPS_API_KEY

### Passo 1: Obter uma Chave do Google Maps

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Vá em **APIs & Services → Credentials**
4. Clique em **+ CREATE CREDENTIALS → API Key**
5. Copie a chave gerada

### Passo 2: Configurar no Projeto

1. **Abra o painel de gerenciamento** (ícone no canto superior direito)
2. **Navegue**: Settings → Secrets
3. **Adicione**:
   - **Key**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: Cole sua chave do Google Maps
4. **Salve** a configuração

### Passo 3: Reiniciar o Servidor

```bash
# Solicite via chat ou execute:
# "Reinicie o servidor de desenvolvimento"
```

### Passo 4: Verificar Novamente

```bash
node verify-env.mjs
```

Deve mostrar: ✅ **VITE_GOOGLE_MAPS_API_KEY** configurada

---

## Troubleshooting

### ❌ Variável não aparece após adicionar

**Solução**: Certifique-se de ter reiniciado o servidor após adicionar a secret.

### ❌ Erro "API key not valid"

**Solução**: 
1. Verifique se a chave foi copiada corretamente (sem espaços extras)
2. Ative as APIs necessárias no Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API
   - Places API (opcional)

### ❌ Mapa não carrega mesmo com a chave configurada

**Solução**:
1. Limpe o cache do navegador (Ctrl + Shift + R)
2. Verifique o console do navegador para erros específicos
3. Confirme que o domínio está autorizado nas restrições da API key

---

## Segurança

⚠️ **Importante**:

- Nunca commite chaves de API diretamente no código
- Use sempre o sistema de Secrets para gerenciar variáveis sensíveis
- Configure restrições de domínio no Google Cloud Console
- Monitore o uso da API para detectar abusos

---

## Arquivos Criados

- `verify-env.mjs` - Script de verificação CLI
- `client/src/components/EnvChecker.tsx` - Componente visual React
- `VERIFICACAO-ENV.md` - Este guia (pode ser removido após configuração)

---

**Dúvidas?** Execute `node verify-env.mjs` para diagnóstico completo.
