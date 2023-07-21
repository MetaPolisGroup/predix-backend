import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  account_id: string;

  @IsNotEmpty()
  recommend_id: string;
}
