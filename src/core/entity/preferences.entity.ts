export class Preferences {
  id?: string;

  fee: number;

  interval_seconds?: number;

  genesis_start?: boolean;

  genesis_lock?: boolean;

  genesis_end?: boolean;

  paused: boolean;
}
