"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GRADE } from "@bemviver/shared";
import Alert from "@/components/atoms/Alert/alert";
import Button from "@/components/atoms/Button/button";
import Card from "@/components/atoms/Card/card";
import Select from "@/components/atoms/Select/select";
import BotaoExportarPdf from "@/components/molecules/BotaoExportarPdf/botaoExportarPdf";
import Field from "@/components/molecules/Field/field";
import TabelaConsultas from "@/components/organisms/TabelaConsultas/tabelaConsultas";
import { useAgenda } from "@/hooks/useAgenda";
import { usePacientes } from "@/hooks/usePacientes";
import { formatarData, NOME_TIPO } from "@/lib/formato";
import { agendarConsultaSchema, type DadosAgendarConsulta } from "./schema";
import type { AgendaDoDiaProps } from "./types";

export default function AgendaDoDia({
  profissionalId,
  data,
}: AgendaDoDiaProps) {
  const {
    agenda,
    carregando,
    erro,
    cancelarConsulta,
    cancelando,
    registrarFalta,
    registrandoFalta,
    agendarConsulta,
    agendando,
  } = useAgenda(profissionalId, data);

  const {
    data: pacientes = [],
    isLoading: carregandoPacientes,
    error: erroPacientes,
  } = usePacientes();

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DadosAgendarConsulta>({
    resolver: zodResolver(agendarConsultaSchema),
    defaultValues: {
      pacienteId: "",
      tipo: "primeira",
      hora: GRADE[0],
    },
  });

  async function executar(acao: "cancelar" | "falta", consultaId: string) {
    setErroAcao("");
    try {
      if (acao === "cancelar") {
        await cancelarConsulta(consultaId);
      } else {
        await registrarFalta(consultaId);
      }
    } catch (e) {
      setErroAcao((e as Error).message);
    }
  }

  const onSubmit = handleSubmit(async (valores) => {
    setMensagemSucesso("");
    setErroAcao("");
    try {
      await agendarConsulta({
        profissionalId,
        data,
        pacienteId: valores.pacienteId,
        tipo: valores.tipo,
        hora: valores.hora,
      });
      setMensagemSucesso("Consulta marcada com sucesso.");
      reset({
        pacienteId: "",
        tipo: "primeira",
        hora: GRADE[0],
      });
    } catch (e) {
      setErroAcao((e as Error).message);
    }
  });

  if (carregando && !agenda) {
    return <p className="text-sm text-gray-500">Carregando agenda...</p>;
  }

  if (erro && !agenda) {
    return <Alert>{erro}</Alert>;
  }

  if (!agenda) {
    return null;
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold first-letter:uppercase">
            {formatarData(agenda.data)}
          </h2>
          <BotaoExportarPdf
            tipo="agenda"
            filtros={{
              data,
              profissionalId,
            }}
          />
        </div>
        {agenda.folga && (
          <Alert variante="aviso">
            Dia bloqueado como folga do profissional.
          </Alert>
        )}
        {erro && <Alert>{erro}</Alert>}
        {erroAcao && <Alert>{erroAcao}</Alert>}
        <TabelaConsultas
          consultas={agenda.consultas}
          acoes={(consulta) =>
            consulta.status === "agendada" && (
              <div className="flex justify-end gap-2">
                {new Date(consulta.inicio) <= new Date() && (
                  <Button
                    variante="secundario"
                    tamanho="compacto"
                    disabled={registrandoFalta}
                    onClick={() => executar("falta", consulta.id)}
                    aria-label={`Registrar falta para paciente ${consulta.pacienteNome} às ${consulta.hora}`}
                  >
                    {registrandoFalta ? "Registrando..." : "Registrar falta"}
                  </Button>
                )}
                <Button
                  variante="secundario"
                  tamanho="compacto"
                  disabled={cancelando}
                  onClick={() => executar("cancelar", consulta.id)}
                  aria-label={`Cancelar consulta de ${consulta.pacienteNome} às ${consulta.hora}`}
                >
                  {cancelando ? "Cancelando..." : "Cancelar"}
                </Button>
              </div>
            )
          }
        />
      </Card>

      <Card>
        <form onSubmit={onSubmit} noValidate className="space-y-3">
          <h2 className="text-lg font-semibold">Marcar consulta</h2>
          <Field label="Paciente" erro={errors.pacienteId?.message}>
            <Select
              {...register("pacienteId")}
              aria-invalid={Boolean(errors.pacienteId)}
              disabled={carregandoPacientes}
            >
              <option value="">
                {carregandoPacientes ? "Carregando pacientes..." : "Selecione"}
              </option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo" erro={errors.tipo?.message}>
            <Select {...register("tipo")} aria-invalid={Boolean(errors.tipo)}>
              <option value="primeira">{NOME_TIPO.primeira}</option>
              <option value="retorno">{NOME_TIPO.retorno}</option>
            </Select>
          </Field>
          <Field label="Horário" erro={errors.hora?.message}>
            <Select {...register("hora")} aria-invalid={Boolean(errors.hora)}>
              {GRADE.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" disabled={agendando} className="w-full">
            {agendando ? "Marcando..." : "Marcar"}
          </Button>
          {mensagemSucesso && (
            <p role="status" className="text-sm text-teal-700">
              {mensagemSucesso}
            </p>
          )}
          {erroPacientes && <Alert>{erroPacientes.message}</Alert>}
        </form>
      </Card>
    </div>
  );
}
