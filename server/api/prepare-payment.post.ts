import axios from 'axios';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  
  // NUEVA URL DE AWS SEGÚN TU IMAGEN
  const url = 'https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod/prepare';

  // Formateamos el payload exactamente como pide el nuevo endpoint
  const awsPayload = {
    "source_module": "store",
    "full_name": body.full_name || "Cliente BioCenter",
    "document_number": body.documentId || "1723456789", // Documento por defecto si no hay
    "email": body.email || "cliente@mail.com",
    "phoneNumber": body.phoneNumber || "+593999999999",
    "main_street": "Av. Interoceánica", // Valores por defecto requeridos
    "secondary_street": "Calle 10",
    "house_number": "N10-25",
    "city": "Quito",
    "state": "Pichincha",
    "postalCode": "170101",
    "customerId": body.customerId || "cli-001",
    "items": body.items || [
      {
        "kind": "service",
        "product_name": "sku-001",
        "name_snapshot": body.reference || "Servicio BioCenter",
        "quantity": 1,
        "unit_price": Number(body.subtotal || 0),
        "total_price": Number(body.subtotal || 0)
      }
    ],
    "subtotal": Number(body.subtotal || 0),
    "iva": Number(body.iva || 0),
    "reference": body.reference || "Pago BioCenter"
  };

  console.log('[PayPhone] Payload a enviar al Proxy AWS:', JSON.stringify(awsPayload, null, 2));

  try {
    const response = await axios.post(url, awsPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    console.log('[PayPhone] Respuesta del Proxy AWS:', JSON.stringify(data, null, 2));
    
    // Extraemos la información de la respuesta de PayPhone que viene dentro de payphoneResponse
    const pp = data.payphoneResponse || {};

    return {
      paymentId: pp.paymentId || pp.transactionId,
      token: pp.token || pp.paymentId || pp.transactionId,
      payWithPayPhone: pp.payWithPayPhone,
      payWithCard: pp.payWithCard,
      status: data.status
    };

  } catch (err: any) {
    const errorData = err.response?.data || err.message;
    console.error('[AWS Proxy Error]:', JSON.stringify(errorData, null, 2));
    return { status: false, details: errorData };
  }
});
