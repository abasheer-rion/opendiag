import { DiagClient } from "./client.ts";
import { obdRequest } from "./obd.ts";
import { clearDtc } from "./uds.ts";

/**
 * DiagClient plus fault clearing. Kept in its own file so read-only front ends (the web app)
 * never bundle a clear call.
 */
export class ClearingClient extends DiagClient {
  async clearObdDtcs(target = 0x7e0): Promise<void> {
    await this.call(target, obdRequest(0x04));
  }

  async clearUdsDtcs(target: number, group = 0xffffff): Promise<void> {
    await this.call(target, clearDtc(group));
  }
}
