import { AutoMap } from "@automapper/classes";

export class User {
  @AutoMap()
  id?: string;

  @AutoMap()
  nickname?: string;

  @AutoMap()
  password: string;

  @AutoMap()
  email: string;

  @AutoMap()
  phone: string;

  @AutoMap()
  ip: string;
}
