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
    console.log('[PayPhone Confirm] Full Proxy Data:', JSON.stringify(data, null, 2));
    
    // Validación de aprobación ultra-robusta (revisamos raíz y niveles internos)
    const rootStatus = String(data.status || data.success || data.response || '').toUpperCase();
    const internalStatus = String(result.status || result.state || '').toUpperCase();
    const transStatus = String(result.transactionStatus || '').toUpperCase();
    
    const isApproved = 
      // Banderas booleanas o strings de éxito en raíz o interno
      data.status === true || 
      data.success === true || 
      data.response === true ||
      result.approved === true || 
      result.success === true || 
      // Comparaciones de texto
      rootStatus === 'APPROVED' || 
      rootStatus === 'SUCCESS' ||
      rootStatus === 'TRUE' ||
      internalStatus === 'APPROVED' || 
      internalStatus === 'SUCCESS' ||
      transStatus === 'APPROVED' ||
      // Códigos específicos de PayPhone
      result.statusCode === 3 ||
      String(result.transactionStatus).toLowerCase() === 'approved';

    // Detectamos si es una petición AJAX (desde el frontend) o navegación directa
    const isAjax = getHeader(event, 'accept')?.includes('application/json') || query.ajax === 'true';

    if (isApproved) {
      console.log('[PayPhone Confirm] Pago Verificado con Éxito');
      if (isAjax) return { status: 'success', orderId, clientTransactionId };
      return sendRedirect(event, `/payment/success?id=${orderId}&clientTransactionId=${clientTransactionId}`, 302);
    } else {
      console.warn('[PayPhone Confirm] Pago NO verificado. Detalles:', { root: data, internal: result });
      const msg = result.message || data.message || 'Pago no aprobado o pendiente de verificación';
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
