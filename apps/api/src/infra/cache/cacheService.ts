import { redisConnection } from '../../redis'

export class CacheService {
  async obter<T>(chave: string): Promise<T | null> {
    try {
      const valor = await redisConnection.get(chave)
      if (!valor) return null
      return JSON.parse(valor) as T
    } catch (err) {
      console.error(`[Cache] Erro ao recuperar chave "${chave}":`, err)
      return null
    }
  }

  async salvar(chave: string, valor: unknown, ttlSegundos = 60): Promise<void> {
    try {
      await redisConnection.set(chave, JSON.stringify(valor), 'EX', ttlSegundos)
    } catch (err) {
      console.error(`[Cache] Erro ao salvar chave "${chave}":`, err)
    }
  }

  async remover(chave: string): Promise<void> {
    try {
      await redisConnection.del(chave)
    } catch (err) {
      console.error(`[Cache] Erro ao remover chave "${chave}":`, err)
    }
  }

  async invalidarPadrao(padrao: string): Promise<void> {
    try {
      const chaves = await redisConnection.keys(padrao)
      if (chaves.length > 0) {
        await redisConnection.del(...chaves)
      }
    } catch (err) {
      console.error(`[Cache] Erro ao invalidar chaves com padrão "${padrao}":`, err)
    }
  }
}

export const cacheService = new CacheService()
