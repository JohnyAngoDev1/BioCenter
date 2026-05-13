import axios from 'axios';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  
  // NUEVA URL DE AWS SEGÚN TU IMAGEN
  const url = 'https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod/prepare';

  // Formateamos el payload exactamente como pide el nuevo endpoint
  const awsPayload = {
    "source_module": body.source_module || "store",
    "full_name": body.full_name || "Cliente BioCenter",
    "document_number": body.document_number || body.documentId || "1723456789", 
    "email": body.email || "cliente@mail.com",
    "phoneNumber": body.phoneNumber || "+593999999999",
    "main_street": body.main_street || "Av. Interoceánica", 
    "secondary_street": body.secondary_street || "Calle 10",
    "house_number": body.house_number || "N10-25",
    "city": body.city || "Quito",
    "state": body.state || "Pichincha",
    "postalCode": body.postalCode || "170101",
    "customerId": body.customerId || body.email || "cli-001",
    "items": body.items,
    "subtotal": Number(body.subtotal || 0),
    "iva": Number(body.iva || 0),
    "reference": body.reference || "Pago BioCenter",
    "responseUrl": "https://www.biocenter.life/api/payphone/confirm",
    "cancellationUrl": "https://www.biocenter.life/api/payphone/cancel"
  };

  console.log('[PayPhone] Payload a enviar al Proxy AWS:', JSON.stringify(awsPayload, null, 2));

  try {
    const response = await axios.post(url, awsPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    console.log('[PayPhone] Respuesta completa del Proxy AWS:', JSON.stringify(data, null, 2));
    
    // Intentamos obtener los datos de PayPhone de varias formas posibles
    // Algunos proxies devuelven la respuesta en 'payphoneResponse', otros en la raíz
    const pp = data.payphoneResponse || data.data || data;

    // Extraemos el ID del pago (puede llamarse de varias formas)
    const paymentId = pp.paymentId || pp.transactionId || pp.id;
    const token = pp.token || paymentId;

    return {
      paymentId: paymentId,
      token: token,
      payWithPayPhone: pp.payWithPayPhone || pp.payWithPayphone,
      payWithCard: pp.payWithCard || pp.payWithCardUrl,
      status: data.status !== undefined ? data.status : (pp.status || !!paymentId),
      // Enviamos el objeto completo para debug si es necesario
      raw: pp
    };

  } catch (err: any) {
    const errorData = err.response?.data || err.message;
    console.error('[AWS Proxy Error]:', JSON.stringify(errorData, null, 2));
    return { status: false, details: errorData };
  }
});
