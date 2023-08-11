export class Preferences {
  id?: string;

  fee: number;

  interval_seconds?: number;

  buffer_seconds?: number;

  genesis_start?: boolean;

  genesis_lock?: boolean;

  paused: boolean;
}
