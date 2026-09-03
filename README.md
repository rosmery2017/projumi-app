# Projumi App

Aplicación móvil en Expo para consumir el backend de Projumi.

## Configuración

La app toma la URL base del backend desde:

- `.env`
- `.env.local`

Variable:

```bash
EXPO_PUBLIC_API_URL=http://192.168.100.9/projumi
```

## Qué debes cambiar

1. Si trabajas desde tu PC con un celular físico, usa la IP real de tu red local.
2. Si cambias de red o publicas en hosting, solo actualiza `EXPO_PUBLIC_API_URL`.
3. Reinicia Expo con caché limpia cuando cambies el valor:

```bash
npx expo start -c
```

## Recomendaciones rápidas

- En emulador Android, puedes usar `http://10.0.2.2/projumi`.
- Si usas hotspot de Windows, prueba `http://192.168.137.1/projumi`.
- No subas el archivo `.env`; deja solo `.env.example` en el repositorio.
