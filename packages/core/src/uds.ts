import { at } from "./util.ts";
import type { Bytes } from "./util.ts";
import { decodeUdsDtc } from "./dtc.ts";
import type { UdsDtc } from "./dtc.ts";

/** ISO 14229 service ids used so far. */
export const SID = {
  SESSION_CONTROL: 0x10,
  ECU_RESET: 0x11,
  CLEAR_DTC: 0x14,
  READ_DTC: 0x19,
  READ_DID: 0x22,
  SECURITY_ACCESS: 0x27,
  WRITE_DID: 0x2e,
  ROUTINE: 0x31,
  TESTER_PRESENT: 0x3e,
} as const;

export const NEGATIVE_RESPONSE = 0x7f;
export const NRC_RESPONSE_PENDING = 0x78;

export const NRC_NAMES: Record<number, string> = {
  0x10: "generalReject",
  0x11: "serviceNotSupported",
  0x12: "subFunctionNotSupported",
  0x13: "incorrectMessageLengthOrInvalidFormat",
  0x14: "responseTooLong",
  0x21: "busyRepeatRequest",
  0x22: "conditionsNotCorrect",
  0x24: "requestSequenceError",
  0x31: "requestOutOfRange",
  0x33: "securityAccessDenied",
  0x35: "invalidKey",
  0x36: "exceededNumberOfAttempts",
  0x37: "requiredTimeDelayNotExpired",
  0x72: "generalProgrammingFailure",
  0x78: "requestCorrectlyReceivedResponsePending",
  0x7e: "subFunctionNotSupportedInActiveSession",
  0x7f: "serviceNotSupportedInActiveSession",
  0x92: "voltageTooHigh",
  0x93: "voltageTooLow",
};

export class NegativeResponse extends Error {
  readonly sid: number;
  readonly nrc: number;
  constructor(sid: number, nrc: number) {
    super(`negative response to 0x${sid.toString(16)}: 0x${nrc.toString(16)} ${NRC_NAMES[nrc] ?? "unknown"}`);
    this.name = "NegativeResponse";
    this.sid = sid;
    this.nrc = nrc;
  }
}

export const readDid = (did: number): Bytes => Uint8Array.of(SID.READ_DID, did >> 8, did & 0xff);
export const sessionControl = (type: number): Bytes => Uint8Array.of(SID.SESSION_CONTROL, type);
export const testerPresent = (suppressResponse = false): Bytes =>
  Uint8Array.of(SID.TESTER_PRESENT, suppressResponse ? 0x80 : 0x00);
/** ReadDTCInformation, reportDTCByStatusMask (0x02). */
export const readDtcByStatusMask = (mask = 0xff): Bytes => Uint8Array.of(SID.READ_DTC, 0x02, mask);
/** ClearDiagnosticInformation for a DTC group (default: all). */
export const clearDtc = (group = 0xffffff): Bytes =>
  Uint8Array.of(SID.CLEAR_DTC, (group >> 16) & 0xff, (group >> 8) & 0xff, group & 0xff);

export function isResponsePending(resp: Bytes): boolean {
  return resp.length >= 3 && at(resp, 0) === NEGATIVE_RESPONSE && at(resp, 2) === NRC_RESPONSE_PENDING;
}

/** Check a response to a request with service id `sid`; returns the bytes after the response SID. */
export function expectPositive(sid: number, resp: Bytes): Bytes {
  if (resp.length >= 3 && at(resp, 0) === NEGATIVE_RESPONSE && at(resp, 1) === sid) {
    throw new NegativeResponse(sid, at(resp, 2));
  }
  if (resp.length === 0 || at(resp, 0) !== sid + 0x40) {
    throw new Error(`unexpected response to 0x${sid.toString(16)}: first byte ${resp.length ? "0x" + at(resp, 0).toString(16) : "missing"}`);
  }
  return resp.subarray(1);
}

/** Parse a positive 0x19 0x02 response body (after the 0x59 SID byte). */
export function parseDtcByStatusMask(body: Bytes): { statusAvailabilityMask: number; dtcs: UdsDtc[] } {
  if (at(body, 0) !== 0x02) throw new Error("not a reportDTCByStatusMask response");
  const statusAvailabilityMask = at(body, 1);
  const dtcs: UdsDtc[] = [];
  for (let i = 2; i + 3 < body.length; i += 4) dtcs.push(decodeUdsDtc(body, i, true));
  return { statusAvailabilityMask, dtcs };
}
