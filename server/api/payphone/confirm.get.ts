import axios from 'axios';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();
  
  console.log('[PayPhone Confirm] Verificando pago con Proxy AWS:', query);

  const { orderId, clientTransactionId } = query;

  if (!orderId || !clientTransactionId) {
    return sendRedirect(event, '/checkout?status=error&message=Missing+params', 302);
  }

  try {
    /* 
    // COMENTADO PARA PRUEBAS: Esto es lo que se usará en producción
    const confirmUrl = `${config.payphoneApiUrl}/confirm`;
    const response = await axios.get(confirmUrl, {
      params: { orderId, clientTransactionId }
    });
    const data = response.data;
    */

    // MOCK PARA PRUEBAS: Forzamos el éxito para ver la pantalla de gracias y limpieza de datos
    const data = { approved: true, message: 'Pago mockeado exitoso' };
    console.log('[PayPhone Confirm] MODO PRUEBA ACTIVO:', data);

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
