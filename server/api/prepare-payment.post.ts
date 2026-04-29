const buildUrl = (base: string, params: Record<string, unknown>) => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const payphoneToken = config.payphoneToken;
  const payphoneStoreId = config.payphoneStoreId;
  const payphoneResponseUrl = config.payphoneResponseUrl;
  const payphoneCancellationUrl = config.payphoneCancellationUrl;

  if (
    !payphoneToken ||
    !payphoneStoreId ||
    !payphoneResponseUrl ||
    !payphoneCancellationUrl
  ) {
    throw createError({
      statusCode: 500,
      message: "Faltan credenciales de PayPhone",
    });
  }

  const orderId = body.orderId || `BIO-${Date.now()}`;
  const clientTransactionId =
    body.clientTransactionId || `PP-${orderId}-${Date.now()}`;
  const responseUrl = buildUrl(payphoneResponseUrl, {
    orderId,
    clientTransactionId,
  });
  const cancellationUrl = buildUrl(payphoneCancellationUrl, {
    orderId,
    clientTransactionId,
  });

  const response = await $fetch<Record<string, unknown>>(
    `${config.payphoneApiUrl}/prepare`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payphoneToken}`,
      },
      body: {
        ...body,
        orderId,
        clientTransactionId,
        storeId: payphoneStoreId,
        responseUrl,
        cancellationUrl,
      },
    },
  );

  return response;
});
