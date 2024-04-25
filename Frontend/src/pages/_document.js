import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
      <link rel="icon" href="favicon.png" sizes="any" />
      <title>Datos Climaticos Timpo Real</title>
      <meta charset="UTF-8" />
    <meta name="description" content="Pagina para obtener datos climaticos en tiempo real en base a la api de Nasa POWER" />
      </Head>
      
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
