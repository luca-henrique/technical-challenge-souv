"use client";

import { useState } from "react";
import Alert from "@/components/atoms/Alert/alert";
import Button from "@/components/atoms/Button/button";
import CardAgendaDia from "@/components/organisms/CardAgendaDia/cardAgendaDia";
import MarcarConsulta from "@/components/organisms/MarcarConsulta/marcarConsulta";
import { useAgenda } from "@/hooks/useAgenda";
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
  } = useAgenda(profissionalId, data);

  const [erroAcao, setErroAcao] = useState("");

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
      <CardAgendaDia
        agenda={agenda}
        profissionalId={profissionalId}
        data={data}
        erro={erro}
        erroAcao={erroAcao}
        mensagemFolga="Dia bloqueado como folga do profissional."
        acoes={(consulta) =>
          consulta.status === "agendada" && (
            <div className="flex justify-end gap-2">
              {new Date(consulta.inicio) <= new Date() && (
                <Button
                  variante="secundario"
                  tamanho="compacto"
                  disabled={registrandoFalta}
                  onClick={() => executar("falta", consulta.id)}
                >
                  {registrandoFalta ? "Registrando..." : "Registrar falta"}
                </Button>
              )}
              <Button
                variante="secundario"
                tamanho="compacto"
                disabled={cancelando}
                onClick={() => executar("cancelar", consulta.id)}
              >
                {cancelando ? "Cancelando..." : "Cancelar"}
              </Button>
            </div>
          )
        }
      />

      <MarcarConsulta profissionalId={profissionalId} data={data} />
    </div>
  );
}

