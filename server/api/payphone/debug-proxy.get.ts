import axios from 'axios';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();
  
  const orderId = query.orderId as string;
  const clientTransactionId = query.clientTransactionId as string;

  if (!orderId || !clientTransactionId) {
    return { error: 'Faltan parámetros orderId o clientTransactionId' };
  }

  try {
    const confirmUrl = `${config.payphoneApiUrl}/confirm`;
    console.log('[DEBUG ENDPOINT] Consultando Proxy:', confirmUrl);
    
    const response = await axios.get(confirmUrl, {
      params: { orderId, clientTransactionId },
      timeout: 15000
    });

    return {
      source: 'AWS Proxy Debug',
      orderId,
      clientTransactionId,
      status: response.status,
      data: response.data
    };
  } catch (err: any) {
    return {
      error: 'Error al consultar el Proxy',
      message: err.message,
      details: err.response?.data
    };
  }
});
