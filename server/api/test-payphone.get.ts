import axios from 'axios';

export default defineEventHandler(async (event) => {
  const url = 'https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod/prepare';

  const testPayload = {
    "source_module": "store",
    "full_name": "Johnny Ango",
    "document_number": "1723456789",
    "email": "cliente@mail.com",
    "phoneNumber": "+593999999999",
    "main_street": "Av. Interoceánica",
    "secondary_street": "Calle 10",
    "house_number": "N10-25",
    "city": "Quito",
    "state": "Pichincha",
    "postalCode": "170101",
    "customerId": "cli-001",
    "items": [
      {
        "kind": "service",
        "product_name": "sku-001",
        "name_snapshot": "Servicio demo",
        "quantity": 1,
        "unit_price": 100,
        "total_price": 100
      }
    ],
    "subtotal": 100,
    "iva": 15,
    "reference": "Pago orden 1001"
  };

  try {
    const response = await axios.post(url, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      message: "Prueba con Proxy de AWS",
      proxyResponse: response.data
    };
  } catch (err: any) {
    return {
      message: "Error en el Proxy de AWS",
      error: err.response?.data || err.message,
      payloadSent: testPayload
    };
  }
});
