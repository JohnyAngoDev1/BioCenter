export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  console.log('[PayPhone Cancel] Pago cancelado:', query);

  // Redirigir al checkout con un mensaje de error o estado cancelado
  return sendRedirect(event, '/checkout?status=cancel', 302);
});
