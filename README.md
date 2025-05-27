# BI Dashboard para Inspeções

Este dashboard foi desenvolvido para visualizar dados da collection Checklist do Firebase, permitindo filtrar e analisar informações de inspeções.

## Instruções para Deploy no GitHub Pages

1. Faça upload de todos os arquivos para o repositório GitHub
2. Vá para "Settings" > "Pages" no seu repositório
3. Em "Source", selecione "Deploy from a branch"
4. Selecione a branch "main" e a pasta "/ (root)"
5. Clique em "Save"
6. Aguarde alguns minutos para a publicação
7. Acesse o site em: https://mobilityedgeai.github.io/bi/

## Configuração de Segurança do Firebase

Para que o dashboard funcione corretamente, você precisará ajustar as regras de segurança do Firestore:

1. Acesse o Firebase Console: https://console.firebase.google.com/
2. Selecione seu projeto "sentinel-insights-o7f49d"
3. Navegue até "Firestore Database" > "Rules"
4. Atualize as regras para permitir acesso de leitura à collection "Checklist"
5. Exemplo de regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso à collection Checklist para leitura a partir de qualquer origem
    match /Checklist/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Regras para outras collections podem ser mais restritivas
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Embedando no FlutterFlow

Para incorporar este dashboard em um aplicativo FlutterFlow:

1. Use o componente WebView
2. Configure a URL do GitHub Pages: https://mobilityedgeai.github.io/bi/
3. Defina as dimensões conforme necessário para seu layout

## Funcionalidades

- Filtros por data, garagem, filial, motorista, placa e tipo de ativo
- Cards de resumo com scorecard, total de ativos, inspeções e motoristas
- Gráficos de evolução do scorecard, inspeções por mês e por ativo
- Tabelas com dados de ativos, inspeções por status e não conformes
- Exportação para CSV

## Suporte

Se precisar de ajustes adicionais ou tiver dúvidas sobre a implementação, entre em contato.
