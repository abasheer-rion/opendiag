/**
 * Starter dictionary of generic (SAE-style, not make-specific) fault codes.
 * Every meaning is written in our own words. Nothing is copied from a vendor or a service manual.
 * confidence: how sure we are the plain-English meaning fits most cars.
 */
export interface DtcInfo {
  code: string;
  meaning: string;
  source: "own-words";
  confidence: "high" | "medium" | "low";
}

const e = (code: string, meaning: string, confidence: DtcInfo["confidence"] = "high"): DtcInfo => ({
  code,
  meaning,
  source: "own-words",
  confidence,
});

export const DTC_GENERIC: DtcInfo[] = [
  e("P0016", "Crankshaft and camshaft positions do not line up", "medium"),
  e("P0100", "Air flow sensor circuit problem"),
  e("P0101", "Air flow sensor reading outside the expected range"),
  e("P0110", "Intake air temperature sensor circuit problem"),
  e("P0115", "Coolant temperature sensor circuit problem"),
  e("P0117", "Coolant temperature sensor reads too low"),
  e("P0118", "Coolant temperature sensor reads too high"),
  e("P0120", "Throttle or pedal position sensor circuit problem", "medium"),
  e("P0128", "Engine is slow to warm up to normal temperature"),
  e("P0130", "Oxygen sensor 1 on bank 1 circuit problem"),
  e("P0133", "Oxygen sensor 1 on bank 1 reacts too slowly"),
  e("P0171", "Fuel mixture too lean on bank 1 (too much air, too little fuel)"),
  e("P0172", "Fuel mixture too rich on bank 1 (too much fuel, too little air)"),
  e("P0174", "Fuel mixture too lean on bank 2"),
  e("P0175", "Fuel mixture too rich on bank 2"),
  e("P0201", "Fuel injector for cylinder 1 circuit problem", "medium"),
  e("P0299", "Turbo or supercharger is not making enough pressure", "medium"),
  e("P0300", "Random or several cylinders are misfiring"),
  e("P0301", "Cylinder 1 is misfiring"),
  e("P0302", "Cylinder 2 is misfiring"),
  e("P0303", "Cylinder 3 is misfiring"),
  e("P0304", "Cylinder 4 is misfiring"),
  e("P0305", "Cylinder 5 is misfiring"),
  e("P0306", "Cylinder 6 is misfiring"),
  e("P0325", "Knock sensor 1 circuit problem"),
  e("P0335", "Crankshaft position sensor circuit problem"),
  e("P0340", "Camshaft position sensor circuit problem"),
  e("P0400", "Exhaust gas recirculation flow problem", "medium"),
  e("P0420", "Catalytic converter on bank 1 is not cleaning the exhaust well enough"),
  e("P0430", "Catalytic converter on bank 2 is not cleaning the exhaust well enough"),
  e("P0440", "Fuel vapour (evaporative) system problem", "medium"),
  e("P0442", "Small leak found in the fuel vapour system"),
  e("P0455", "Large leak found in the fuel vapour system (often a loose or missing fuel cap)", "medium"),
  e("P0500", "Vehicle speed sensor problem", "medium"),
  e("P0505", "Idle speed control problem", "medium"),
  e("P0562", "System voltage is low"),
  e("P0563", "System voltage is high"),
  e("P0600", "Communication problem between control units inside the engine module", "low"),
  e("P0700", "The transmission module has stored its own fault (read that module too)", "medium"),
  e("U0100", "Lost communication with the engine module"),
  e("U0101", "Lost communication with the transmission module"),
  e("U0121", "Lost communication with the anti-lock brake module"),
  e("U0155", "Lost communication with the instrument cluster"),
];

const BY_CODE = new Map(DTC_GENERIC.map((d) => [d.code, d]));

export function explainDtc(code: string): DtcInfo | undefined {
  return BY_CODE.get(code.toUpperCase());
}
