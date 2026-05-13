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
    // 1. INTENTO RÁPIDO: Consultar directamente a tu API de pedidos
    // Esto es mucho más rápido que el Proxy de AWS
    try {
      const orderUrl = `${config.apiUrl}order/${orderId}`;
      console.log('[PayPhone Confirm] Consultando estado en landingpay:', orderUrl);
      const orderData = await $fetch<any>(orderUrl);
      
      const order = orderData?.data || orderData;
      if (order && (order.payment_status === 'paid' || order.payphone_status === 'APPROVED')) {
        console.log('[PayPhone Confirm] Éxito: Pedido ya marcado como pagado en DB');
        if (isAjax) return { status: 'success', orderId, clientTransactionId };
        return sendRedirect(event, `/payment/success?id=${orderId}`, 302);
      }
    } catch (e) {
      console.warn('[PayPhone Confirm] No se pudo verificar en landingpay, intentando Proxy...');
    }

    // 2. INTENTO SEGUNDO: Llamada al Proxy de AWS (como respaldo)
    const confirmUrl = `${config.payphoneApiUrl}/confirm`;
    console.log('[PayPhone Confirm] Llamando al Proxy AWS (Fallback):', confirmUrl);
    
    const response = await axios.get(confirmUrl, {
      params: { orderId, clientTransactionId },
      timeout: 15000 
    });
    
    const data = response.data;
    const result = data.payphoneResponse || data.data || data.payload || data.order || data;
    
    // ... resto de la lógica de validación que ya tenemos ...
    const rootStatus = String(data.status || data.success || data.response || '').toUpperCase();
    const internalStatus = String(result.status || result.state || '').toUpperCase();
    const transStatus = String(result.transactionStatus || '').toUpperCase();
    const payphoneStatus = String(result.payphone_status || '').toUpperCase();
    
    const isApproved = 
      data.status === true || 
      data.success === true || 
      data.response === true ||
      result.approved === true || 
      result.success === true || 
      result.payment_status === 'paid' ||
      rootStatus === 'APPROVED' || 
      internalStatus === 'APPROVED' || 
      transStatus === 'APPROVED' ||
      payphoneStatus === 'APPROVED' ||
      Number(result.statusCode) === 3;

    if (isApproved) {
      if (isAjax) return { status: 'success', orderId, clientTransactionId };
      return sendRedirect(event, `/payment/success?id=${orderId}`, 302);
    } else {
      const msg = result.message || 'Pago en proceso o no aprobado';
      if (isAjax) return { status: 'error', message: msg, debug: { proxyResponse: data } };
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
