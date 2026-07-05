# Publication Checklist

Checklist final para abertura pública do repositório.

## Metadados sugeridos

- Nome: `stripmall-volumetria-ia`
- Descrição sugerida: `Aplicação para estudos preliminares de volumetria, layouts e apoio à viabilidade de strip malls.`
- Homepage recomendada agora: deixar vazio
- Licença recomendada: `MIT`, se a decisão institucional continuar alinhada ao `package.json` e ao arquivo `LICENSE`

## Postura recomendada

Para o estado atual do projeto, a melhor combinação prática é:

1. descrição pública objetiva e neutra
2. sem `homepage` por enquanto, para não criar promessa de demo ou página institucional ainda não consolidada
3. `MIT` como licença pública, apenas se isso já estiver validado institucionalmente
4. abertura pública só depois de revisar o diff final do clone auditado

## Antes de mudar a visibilidade

1. revisar o diff final no clone auditado
2. confirmar que não há secrets, `.env` ou credenciais reais
3. confirmar a descrição pública final no GitHub
4. confirmar se haverá `homepageUrl`
5. confirmar a licença publicada
6. revisar se a narrativa do README está compatível com a posição institucional
7. validar build e testes no estado final

## Decisões humanas pendentes

1. manter como vitrine técnica pública ou ativo ainda reservado
2. aprovar a descrição pública final
3. aprovar eventual homepage institucional
4. aprovar a política de licença para publicação

## Mudanças remotas a fazer no GitHub

1. atualizar `description`
2. publicar `homepage`, se aplicável
3. garantir detecção correta da licença
4. só então mudar a visibilidade de `PRIVATE` para `PUBLIC`

## Sequência operacional sugerida

1. abrir `Settings > General`
2. atualizar a `Description` com o texto sugerido
3. manter `Website` vazio neste momento
4. confirmar que a licença detectada pelo GitHub está consistente após subir o `LICENSE`
5. revisar a aba principal do repositório como visitante logado
6. abrir `Settings > Danger Zone`
7. mudar a visibilidade para `Public`
8. revisar novamente a página pública final depois da abertura
