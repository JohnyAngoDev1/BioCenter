import axios from 'axios';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  
  // NUEVA URL DE AWS SEGÚN TU IMAGEN
  const url = 'https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod/prepare';

  // Obtenemos el dominio actual dinámicamente
  const origin = getRequestURL(event).origin;
  const clientTransactionId = `BIO-${Date.now()}`;

  // Formateamos el payload exactamente como pide el nuevo endpoint
  const awsPayload = {
    "source_module": body.source_module || "store",
    "full_name": body.full_name || "Cliente BioCenter",
    "documentId": body.document_number || body.documentId || "1700000000", 
    "email": body.email || "cliente@mail.com",
    "phoneNumber": body.phoneNumber || "+593999999999",
    "items": body.items,
    "subtotal": Number(body.subtotal || 0),
    "iva": 0,
    "reference": body.reference || "Pago BioCenter",
    "clientTransactionId": clientTransactionId,
    // Forzamos la URL correcta según el entorno
    "responseUrl": origin.includes('localhost') 
      ? `${origin}/api/payphone/confirm` 
      : `https://www.biocenter.life/api/payphone/confirm`,
    "cancellationUrl": origin.includes('localhost') 
      ? `${origin}/api/payphone/cancel` 
      : `https://www.biocenter.life/api/payphone/cancel`
  };

  console.log('[PayPhone] Enviando al Proxy:', JSON.stringify(awsPayload, null, 2));

  try {
    const response = await axios.post(url, awsPayload);
    const res = response.data;
    console.log('[PayPhone] Respuesta del Proxy:', JSON.stringify(res, null, 2));
    
    const proxyData = res;
    const payload = res.payload || {};
    
    // Extraer orderId de la respuesta o de la URL de confirmación
    let orderId = payload.orderId;
    if (!orderId && payload.responseUrl) {
      try {
        const u = new URL(payload.responseUrl);
        orderId = u.searchParams.get('orderId');
      } catch (e) {}
    }

    return {
      status: proxyData.status === true || proxyData.response === true,
      payWithCard: proxyData.data?.payWithCard || proxyData.data?.payWithPayPhone,
      url: proxyData.data?.payWithCard || proxyData.data?.payWithPayPhone, // Alias para facilitar extracción
      orderId: orderId,
      clientTransactionId: payload.clientTransactionId || clientTransactionId,
      sentToProxy: awsPayload, 
      details: proxyData       
    };
  } catch (err: any) {
    console.error('[PayPhone Error]:', err.response?.data || err.message);
    return { status: false, error: err.message };
  }
});
