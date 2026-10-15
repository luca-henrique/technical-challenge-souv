import Button from "@/components/atoms/Button/button";
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
  const tipoAtual = valor ?? selecionado;
  const itens = opcoes.map(normalizarOpcao);

  const aoMudar = (tipo: TipoConsulta) => {
    onChange?.(tipo);
    onSelecionar?.(tipo);
  };

  const gridColsClass =
    itens.length === 1
      ? "grid-cols-1"
      : itens.length === 2
        ? "grid-cols-2"
        : itens.length === 3
          ? "grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

  return (
    <fieldset className={className}>
      {label && (
        <legend className="block text-sm font-medium text-gray-700">
          {label}
        </legend>
      )}
      <div className={`mt-1 flex flex-col gap-2 ${gridColsClass}`}>
        {itens.map((opcao) => {
          const ativo = tipoAtual === opcao.valor;
          return (
            <Button
              key={opcao.valor}
              type="button"
              variante={ativo ? "primario" : "secundario"}
              aria-pressed={ativo}
              disabled={disabled}
              onClick={() => aoMudar(opcao.valor)}
              className="w-full"
            >
              {opcao.rotulo}
            </Button>
          );
        })}
      </div>
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
    </fieldset>
  );
}
