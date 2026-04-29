const buildUrl = (base: string, params: Record<string, string>) => {
  const url = new URL(base)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { payphoneApiUrl, payphoneToken, payphoneStoreId, payphoneResponseUrl, payphoneCancellationUrl } = config

  if (!payphoneToken || !payphoneStoreId || !payphoneResponseUrl || !payphoneCancellationUrl) {
    throw createError({ statusCode: 500, message: 'Faltan credenciales de PayPhone' })
  }

  const clientTransactionId = `BIO-${Date.now()}`
  const responseUrl = buildUrl(String(payphoneResponseUrl), { clientTransactionId })
  const cancellationUrl = buildUrl(String(payphoneCancellationUrl), { clientTransactionId })

  // PayPhone: amount = amountWithoutTax + amountWithTax + tax
  // Servicios de salud gravan IVA 0%: amountWithTax=0, tax=0, todo va en amountWithoutTax
  const subtotal: number = body.subtotal ?? 0
  const ivaBase: number = body.iva ?? 0          // base imponible 12% (0 para salud)
  const taxAmount: number = body.taxAmount ?? 0  // monto del IVA (0 para salud)

  const amountWithoutTax = Math.round(subtotal * 100)   // base exenta / IVA 0%
  const amountWithTax = Math.round(ivaBase * 100)       // base gravada 12%
  const tax = Math.round(taxAmount * 100)               // valor del IVA
  const amount = amountWithoutTax + amountWithTax + tax // validación aritmética PayPhone

  try {
    const response = await $fetch<Record<string, unknown>>(
      `${payphoneApiUrl}/Prepare`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${String(payphoneToken).trim()}`,
        },
        body: {
          amount,
          amountWithoutTax,
          amountWithTax,
          tax,
          service: 0,
          tip: 0,
          currency: 'USD',
          storeId: Number(payphoneStoreId),
          clientTransactionId,
          responseUrl,
          cancellationUrl,
          reference: body.reference ?? 'Pedido BioCenter',
          documentId: body.documentId ?? '0000000000',
          email: body.email ?? '',
          firstName: body.firstName ?? 'Cliente',
          lastName: body.lastName ?? '',
          phoneNumber: body.phoneNumber ?? '',
        },
      },
    )

    return { ...response, clientTransactionId }
  }
  catch (err: unknown) {
    const fetchError = err as { data?: unknown; statusCode?: number; message?: string }
    throw createError({
      statusCode: fetchError.statusCode ?? 502,
      message: 'Error al preparar el pago con PayPhone',
      data: fetchError.data,
    })
  }
})
