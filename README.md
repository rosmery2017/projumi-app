# Sample Snack app

## Configuracion del backend

La URL base de la API se lee desde `EXPO_PUBLIC_API_URL`.

1. Edita `.env.local`.
2. Cambia el valor de `EXPO_PUBLIC_API_URL` por tu backend local o de produccion.
3. Reinicia Expo para que tome la nueva variable.

Ejemplo:

```bash
EXPO_PUBLIC_API_URL=http://10.139.167.20/projumi
```

Si pruebas en un emulador Android y tu backend corre en tu computadora, puede que necesites usar `http://10.0.2.2/projumi` en lugar de `localhost`.
Si tu celular está conectado por hotspot de Windows, prueba `http://192.168.137.1/projumi`.

Open the `App.js` file to start writing some code. You can preview the changes directly on your phone or tablet by scanning the **QR code** or use the iOS or Android emulators. When you're done, click **Save** and share the link!

When you're ready to see everything that Expo provides (or if you want to use your own editor) you can **Download** your project and use it with [expo cli](https://docs.expo.dev/get-started/installation/#expo-cli)).

All projects created in Snack are publicly available, so you can easily share the link to this project via link, or embed it on a web page with the `<>` button.

If you're having problems, you can tweet to us [@expo](https://twitter.com/expo) or ask in our [forums](https://forums.expo.dev/c/expo-dev-tools/61) or [Discord](https://chat.expo.dev/).

Snack is Open Source. You can find the code on the [GitHub repo](https://github.com/expo/snack).
