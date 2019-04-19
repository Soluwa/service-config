module.exports = {
  productId: 'cbaas',
  variantId: 'wibble',
  weight: 1,
  coordination: {
    picker: 'stack',
    stack: [['modelA'], ['conv1', 'exception']],
    exceptionRef: 'exception',
    threshold: 0.8,
  },
  models: {
    conv1: {
      engine: 'watson-assistant',
      credentials: 'CBAAS-WATSON-ASSISTANT',
      workspaceId: '2c287b04-7088-4167-8345-baf61e4bf264',
    },
    exception: {
      engine: 'watson-assistant',
      credentials: 'CBAAS-WATSON-ASSISTANT',
      workspaceId: 'c3c4b427-a0ac-4011-99b4-8bad2fffde21',
    },
    modelA: {
      engine: 'watson-assistant',
      credentials: 'CBAAS-WATSON-ASSISTANT',
      workspaceId: '0c885f24-c8a5-4847-8ab7-a9214116673d',
    },
  },
  engines: {
    'watson-assistant': {
      url: '{{cbaas}}/watson',
      credentials: {
        'CBAAS-WATSON-ASSISTANT': {
          url: 'https://origin-gateway-fra.watsonplatform.net/conversation/api',
          username: 'c3a1b534-0cb5-4384-840c-a1390f597e41',
        },
      },
    },
  },
};
