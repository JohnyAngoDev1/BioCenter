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
    // Forzamos la URL correcta según el entorno (Redirigimos al checkout para manejo interno)
    "responseUrl": origin.includes('localhost') 
      ? `${origin}/checkout` 
      : `https://www.biocenter.life/checkout`,
    "cancellationUrl": origin.includes('localhost') 
      ? `${origin}/checkout?status=cancel` 
      : `https://www.biocenter.life/checkout?status=cancel`
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

    const payWithCardUrl = proxyData.data?.payWithCard || proxyData.data?.payWithPayPhone || proxyData.payWithCard || proxyData.url;
    const isSuccess = proxyData.status === true || proxyData.response === true || !!payWithCardUrl;

    return {
      status: isSuccess,
      payWithCard: payWithCardUrl,
      url: payWithCardUrl, 
      orderId: orderId,
      clientTransactionId: payload.clientTransactionId || clientTransactionId,
      sentToProxy: awsPayload, 
      details: proxyData       
    };
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
    console.error('[PayPhone Error]:', JSON.stringify(err.response?.data || err.message));
    return { 
      status: false, 
      message: errorMessage,
      error: errorMessage, 
      details: err.response?.data || { message: err.message }
    };
  }
});
