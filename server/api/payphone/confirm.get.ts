import axios from 'axios';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();
  
  const orderId = query.orderId as string;
  const clientTransactionId = query.clientTransactionId as string;
  const statusFromUrl = query.status as string;
  const isAjax = getHeader(event, 'accept')?.includes('application/json') || query.ajax === 'true';

  // VIA RÁPIDA: Si el Proxy de AWS nos redirige con el estado de pagado
  if (statusFromUrl === 'already_paid' || statusFromUrl === 'paid') {
    console.log('[PayPhone Confirm] Vía rápida detectada por status en URL:', statusFromUrl);
    if (isAjax) return { status: 'success', orderId, clientTransactionId };
    return sendRedirect(event, `/payment/success?id=${orderId}&clientTransactionId=${clientTransactionId}`, 302);
  }

  if (!orderId || !clientTransactionId) {
    if (isAjax) return { status: 'error', message: 'Faltan parámetros' };
    return sendRedirect(event, '/checkout?status=error&message=Faltan+parametros', 302);
  }

  try {
    // 1. INTENTO RÁPIDO: Consultar directamente a landingpay
    try {
      const orderUrl = `${config.apiUrl}order/${orderId}`;
      console.log('[PayPhone Confirm] Consultando landingpay:', orderUrl);
      const orderData = await $fetch<any>(orderUrl);
      const order = orderData?.data || orderData;
      
      if (order && (order.payment_status === 'paid' || order.payphone_status === 'APPROVED')) {
        console.log('[PayPhone Confirm] Éxito: Pedido pagado en DB');
        if (isAjax) return { status: 'success', orderId, clientTransactionId };
        return sendRedirect(event, `/payment/success?id=${orderId}&clientTransactionId=${clientTransactionId}`, 302);
      }
    } catch (e) {
      console.warn('[PayPhone Confirm] Error en landingpay rapid check');
    }

    // 2. INTENTO SEGUNDO: Llamada al Proxy de AWS
    const confirmUrl = `${config.payphoneApiUrl}/confirm`;
    console.log('[PayPhone Confirm] Consultando Proxy AWS (Fallback)...');
    
    const response = await axios.get(confirmUrl, {
      params: { orderId, clientTransactionId },
      timeout: 15000 
    });
    
    const data = response.data;
    console.log('[PayPhone Confirm] JSON recibido del Proxy:', JSON.stringify(data));

    let redirectUrl = data.url || data.payload?.url || data.data?.url;
    
    if (redirectUrl) {
      // Si la URL de redirección no tiene el ID, se lo añadimos
      if (!redirectUrl.includes('clientTransactionId') && clientTransactionId) {
        const separator = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl += `${separator}clientTransactionId=${clientTransactionId}`;
      }

      console.log('>>> [REDIRECCIÓN ENCONTRADA] Saltando a URL:', redirectUrl);
      if (!isAjax) {
        return sendRedirect(event, redirectUrl, 302);
      }
    }

    const result = data.payphoneResponse || data.data || data.payload || data.order || data;
    
    const rootStatus = String(data.status || data.success || data.response || '').toUpperCase();
    const internalStatus = String(result.status || result.state || '').toUpperCase();
    const transStatus = String(result.transactionStatus || '').toUpperCase();
    const payphoneStatus = String(result.payphone_status || '').toUpperCase();
    
    const isApproved = 
      data.status === true || 
      data.success === true || 
      data.response === true ||
      data.status === 'paid' ||
      result.approved === true || 
      result.success === true || 
      result.payment_status === 'paid' ||
      rootStatus === 'APPROVED' || 
      rootStatus === 'PAID' ||
      internalStatus === 'APPROVED' || 
      transStatus === 'APPROVED' ||
      payphoneStatus === 'APPROVED' ||
      Number(result.statusCode) === 3;

    const finalSuccessUrl = redirectUrl || `/payment/success?id=${orderId}&clientTransactionId=${clientTransactionId}`;

    if (isApproved) {
      console.log('[PayPhone Confirm] Pago Verificado ->', finalSuccessUrl);
      if (isAjax) return { 
        status: 'success', 
        orderId, 
        clientTransactionId, 
        url: finalSuccessUrl,
        data: result 
      };
      return sendRedirect(event, finalSuccessUrl, 302);
    } else {
      console.warn('[PayPhone Confirm] Pago No Aprobado/Pendiente');
      const msg = 'Pago en proceso o no aprobado';
      if (isAjax) return { status: 'error', message: msg, url: redirectUrl, debug: { proxyResponse: data } };
      return sendRedirect(event, `/checkout?status=unapproved&message=${encodeURIComponent(msg)}`, 302);
    }

  } catch (err: any) {
    console.error('[PayPhone Confirm Error]:', err.message);
    const errorMsg = err.message.includes('timeout') ? 'El servidor de pago está tardando demasiado. Por favor, refresca la página en unos segundos.' : 'Error de validación';
    
    if (isAjax) return { status: 'error', message: errorMsg };
    return sendRedirect(event, `/checkout?status=error&message=${encodeURIComponent(errorMsg)}`, 302);
  }
});
