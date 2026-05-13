import axios from 'axios';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();
  
  console.log('[PayPhone Confirm] Verificando pago con Proxy AWS:', query);

  // PayPhone suele enviar 'id', pero el proxy de AWS espera 'orderId'
  const orderId = query.orderId || query.id;
  const clientTransactionId = query.clientTransactionId;

  if (!orderId || !clientTransactionId) {
    console.error('[PayPhone Confirm] Faltan parámetros en la URL:', { orderId, clientTransactionId, fullQuery: query });
    return sendRedirect(event, '/checkout?status=error&message=Parametros+de+confirmacion+faltantes', 302);
  }

  try {
    // Llamada real al Proxy de AWS para confirmar el pago
    const confirmUrl = `${config.payphoneApiUrl}/confirm`;
    const response = await axios.get(confirmUrl, {
      params: { orderId, clientTransactionId }
    });
    
    const data = response.data;
    console.log('[PayPhone Confirm] Respuesta del Proxy:', data);

    if (data.approved === true) {
      return sendRedirect(event, `/payment/success?clientTransactionId=${clientTransactionId}`, 302);
    } else {
      return sendRedirect(event, `/checkout?status=unapproved&message=${encodeURIComponent(data.message || 'Pago no aprobado')}`, 302);
    }

  } catch (err: any) {
    console.error('[PayPhone Confirm Error]:', err.response?.data || err.message);
    return sendRedirect(event, '/checkout?status=error&message=Error+en+verificacion', 302);
  }
});
