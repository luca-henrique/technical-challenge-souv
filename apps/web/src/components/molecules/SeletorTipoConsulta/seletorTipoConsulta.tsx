import SegmentedControl from "@/components/molecules/SegmentedControl/segmentedControl";
import { NOME_TIPO } from "@/lib/formato";
import type { TipoConsulta } from "@bemviver/shared";
import type {
  OpcaoTipoConsulta,
  OpcaoTipoConsultaItem,
  SeletorTipoConsultaProps,
} from "./types";

export const OPCOES_TIPO_CONSULTA_PADRAO: readonly TipoConsulta[] = [
  "primeira",
  "retorno",
] as const;

function normalizarOpcao(opcao: OpcaoTipoConsulta): OpcaoTipoConsultaItem {
  if (typeof opcao === "string") {
    return {
      valor: opcao,
      rotulo: NOME_TIPO[opcao] ?? opcao,
    };
  }
  return {
    valor: opcao.valor,
    rotulo: opcao.rotulo ?? NOME_TIPO[opcao.valor] ?? opcao.valor,
  };
}

export default function SeletorTipoConsulta({
  valor,
  selecionado,
  onChange,
  onSelecionar,
  opcoes = OPCOES_TIPO_CONSULTA_PADRAO,
  label = "Tipo de consulta",
  erro,
  className = "",
  disabled = false,
}: SeletorTipoConsultaProps) {
  const tipoAtual = valor ?? selecionado ?? "primeira";
  const itens = opcoes.map(normalizarOpcao);

  const aoMudar = (tipo: TipoConsulta) => {
    onChange?.(tipo);
    onSelecionar?.(tipo);
  };

  return (
    <SegmentedControl
      opcoes={itens}
      valor={tipoAtual}
      onChange={aoMudar}
      label={label}
      erro={erro}
      disabled={disabled}
      className={className}
    />
  );
}

