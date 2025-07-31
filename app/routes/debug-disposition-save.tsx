import DebugDispositionSave from "../../debug-disposition-save";

export function meta() {
  return [
    { title: "Debug Disposition Save" },
    { name: "description", content: "Debug disposition save functionality" },
  ];
}

export default function DebugDispositionSavePage() {
  return <DebugDispositionSave />;
}
