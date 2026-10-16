import type { SeletorProfissionalProps } from "./types";
import Select from "@/components/atoms/Select/select";
import Field from "@/components/molecules/Field/field";

export default function SeletorProfissional({
  profissionais,
  valor,
  onChange,
  label = "Profissional",
  permitirVazio = false,
  textoVazio = "Selecione um profissional",
  className = "",
  erro,
}: SeletorProfissionalProps) {
  return (
    <Field label={label} erro={erro} className={className}>
      <Select value={valor} onChange={(e) => onChange(e.target.value)}>
        {permitirVazio && <option value="">{textoVazio}</option>}
        {profissionais.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} ({p.especialidade}){p.folga ? " (De folga)" : ""}
          </option>
        ))}
      </Select>
    </Field>
  );
}
