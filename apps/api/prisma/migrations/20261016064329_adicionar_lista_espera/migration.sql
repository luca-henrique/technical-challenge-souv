-- CreateTable
CREATE TABLE "lista_espera" (
    "id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tipo" "TipoConsulta" NOT NULL,
    "turno" TEXT NOT NULL DEFAULT 'qualquer',
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "criada_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificado_em" TIMESTAMPTZ(3),

    CONSTRAINT "lista_espera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lista_espera_profissional_id_data_idx" ON "lista_espera"("profissional_id", "data");

-- CreateIndex
CREATE INDEX "lista_espera_paciente_id_idx" ON "lista_espera"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "lista_espera_profissional_id_paciente_id_data_key" ON "lista_espera"("profissional_id", "paciente_id", "data");

-- AddForeignKey
ALTER TABLE "lista_espera" ADD CONSTRAINT "lista_espera_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_espera" ADD CONSTRAINT "lista_espera_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
