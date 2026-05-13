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
    console.log('[PayPhone Confirm] Respuesta del Proxy:', JSON.stringify(data, null, 2));

    // El Proxy puede devolver la info en varios niveles
    const result = data.payphoneResponse || data.data || data.payload || data;
    
    // Validación de aprobación robusta (case-insensitive y flexible)
    const status = String(result.status || result.state || '').toUpperCase();
    const isApproved = 
      result.approved === true || 
      result.success === true || 
      status === 'APPROVED' || 
      status === 'SUCCESS' ||
      result.transactionStatus === 'Approved';

    // Detectamos si es una petición AJAX (desde el frontend) o navegación directa
    const isAjax = getHeader(event, 'accept')?.includes('application/json') || query.ajax === 'true';

    if (isApproved) {
      console.log('[PayPhone Confirm] Pago Aprobado con éxito');
      if (isAjax) return { status: 'success', orderId, clientTransactionId };
      return sendRedirect(event, `/payment/success?id=${orderId}&clientTransactionId=${clientTransactionId}`, 302);
    } else {
      console.warn('[PayPhone Confirm] Pago no aprobado. Resultado:', result);
      const msg = result.message || 'Pago no aprobado o pendiente';
      if (isAjax) return { status: 'error', message: msg };
      return sendRedirect(event, `/checkout?status=unapproved&message=${encodeURIComponent(msg)}`, 302);
    }

  } catch (err: any) {
    console.error('[PayPhone Confirm Error]:', err.response?.data || err.message);
    if (getHeader(event, 'accept')?.includes('application/json')) {
      return { status: 'error', message: 'Error interno de validación' };
    }
    return sendRedirect(event, '/checkout?status=error&message=Error+en+verificacion', 302);
  }
});
