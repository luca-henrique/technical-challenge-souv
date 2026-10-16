import type { NextFunction, Request, Response } from 'express'

export function errorHandler(
  erro: Error & { status?: number; statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = erro.status ?? erro.statusCode ?? 500

  if (status === 400) {
    res.status(400).json({
      erro: erro.message && erro.message !== 'Bad Request' ? erro.message : 'Corpo da requisição inválido',
      message: erro.message || 'Corpo da requisição inválido',
      status: 'error',
    })
    return
  }

  console.error(erro)
  res.status(status).json({
    erro: erro.message && status < 500 ? erro.message : 'Erro inesperado no servidor',
    message: erro.message && status < 500 ? erro.message : 'Erro inesperado no servidor',
    status: 'error',
  })
}
