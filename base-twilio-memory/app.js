//Importaciones
const {
  flowPrincipal,
  flowOpciones,
  flowReclamosSugerencias,
  flowRegistro,
  flowDespedida,
} = require('./flows/main-flows');

const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot');
const { flowTiendas, flowSucursales } = require('./flows/tiendas');
const { flowPuente } = require('./flows/puente');
const { flowCatalogo } = require('./flows/catalogos');

const TwilioProvider = require('@bot-whatsapp/provider/twilio');
const MockAdapter = require('@bot-whatsapp/database/mock');

//Main
const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([
    flowPrincipal,
    flowReclamosSugerencias,
    flowOpciones,
    flowTiendas,
    flowSucursales,
    flowCatalogo,
    flowRegistro,
    flowDespedida,
    flowPuente,
  ]);

  const adapterProvider = createProvider(TwilioProvider, {
    accountSid: 'ACd9e32ec40f49a8c4d98094d7c9db205f',
    authToken: 'f972710b8a29f4a1fbafad305ba26a4c',
    vendorNumber: '+584122650987',
  });

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
};

main();
