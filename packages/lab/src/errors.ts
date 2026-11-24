export interface Gate {
  name: string;
  ok: boolean;
  detail: string;
}

/** A check failed before any write was sent. Carries every gate so the reason is plain. */
export class LabRefusal extends Error {
  readonly gates: Gate[];
  constructor(gates: Gate[]) {
    const bad = gates.filter((g) => !g.ok);
    super("refused: " + bad.map((g) => `${g.name} (${g.detail})`).join("; "));
    this.name = "LabRefusal";
    this.gates = gates;
  }
}

export function refuse(name: string, detail: string): never {
  throw new LabRefusal([{ name, ok: false, detail }]);
}

/** An earlier write did not finish. Nothing new may be written until recovery has run. */
export class RecoveryRequired extends Error {
  readonly txns: string[];
  constructor(txns: string[]) {
    super(`unfinished write ${txns.join(", ")} found in the journal; run recovery first`);
    this.name = "RecoveryRequired";
    this.txns = txns;
  }
}

/** Stands for the host process dying (power loss, kill -9). The engine never catches it. */
export class HardStop extends Error {
  constructor(message = "hard stop") {
    super(message);
    this.name = "HardStop";
  }
}

/** Restoring the backup did not work. The journal stays open and nothing new may be written until recovery runs. */
export class RollbackFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RollbackFailed";
  }
}
