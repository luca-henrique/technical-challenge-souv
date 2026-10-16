import Card from '@/components/atoms/Card/card'
import Heading from '@/components/atoms/Heading/heading'
import Text from '@/components/atoms/Text/text'
import type { AuthTemplateProps } from './types'

export default function AuthTemplate({ titulo, subtitulo, children }: AuthTemplateProps) {
  return (
    <main id="conteudo-principal" tabIndex={-1} className="flex min-h-screen items-center justify-center p-4 outline-none">
      <Card className="w-full max-w-sm space-y-4">
        <div>
          <Heading as="h1" variante="pagina" className="text-teal-800 dark:text-teal-400">
            {titulo}
          </Heading>
          {subtitulo && (
            <Text variante="corpo" cor="secundario">
              {subtitulo}
            </Text>
          )}
        </div>
        {children}
      </Card>
    </main>
  )
}
