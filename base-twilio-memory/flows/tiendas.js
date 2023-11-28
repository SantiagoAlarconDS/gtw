const { addKeyword } = require('@bot-whatsapp/bot');
const { airtableGet,airtableAnswers } = require('../services/airtable-client');
const { createSortedList, getFlow, getFields } = require('../tools/utils');

let city;

const flowSucursales = addKeyword(['LISTA_DE_TIENDAS'], {
  sensitive: true,
}).addAction({ capture: true }, async (ctx, { flowDynamic, fallBack,state }) => {
  let store = parseInt(ctx.body);
  const sucursales = await airtableGet('sucursales');
  const tienda = getFlow(getFields(sucursales), store);

  const flows = await airtableGet('flows');
  const disculpa = getFlow(getFields(flows), 'fallback');

  // console.log(city, tienda, disculpa);

  if (tienda.id_ciudad[0] === city) {
    await state.update({ sucursal: ctx.body });
    const myState = state.getMyState();
    airtableAnswers('test',myState,ctx)
    return await flowDynamic(tienda.direccion);
  } else {
    await flowDynamic(disculpa.texto);
    return fallBack();
  }
});

const flowTiendas = addKeyword(['LISTA_DE_CIUDADES'], {
  sensitive: true,
})
  .addAction(async (_, { flowDynamic }) => {
    const ciudades = await airtableGet('ciudades');
    const list = createSortedList(getFields(ciudades));

    const flows = await airtableGet('flows');
    const helperText = getFlow(getFields(flows), 'ciudades').texto;

    const mensaje = helperText + '\n\n' + list.join('\r\n');
    return await flowDynamic(mensaje);
  })
  .addAction({ capture: true }, async (ctx, { state,gotoFlow, flowDynamic,fallBack }) => {
    city = parseInt(ctx.body);
    const ciudades = await airtableGet('ciudades');
    const ciudad = getFlow(getFields(ciudades), city);

    if (isNaN(city)) {
      const flows = await airtableGet('flows');
      const disculpa = getFlow(getFields(flows), 'fallback');
      await flowDynamic(disculpa.texto);
      return fallBack();
    } else if (ciudad.sucursales.length > 1 && !isNaN(city)) {
      await state.update({ ciudad: city });
      const sucursales = await airtableGet('sucursales');
      const list = createSortedList(
        getFields(sucursales).filter((r) => r.id_ciudad.includes(city))
      );

      const flows = await airtableGet('flows');
      const helperText = getFlow(getFields(flows), 'sucursales').texto;

      await flowDynamic([helperText, list.join('\r\n')]);
      return gotoFlow(flowSucursales);
    } else if (!isNaN(city)){
      await state.update({ ciudad: city });
      console.log(ciudad)
      await state.update({ sucursal: ciudad.id });
      const myState = state.getMyState();
      airtableAnswers('test',myState,ctx)
      return await flowDynamic(ciudad.direccion[0]);
    }
  });

module.exports = {
  flowTiendas,
  flowSucursales,
};
