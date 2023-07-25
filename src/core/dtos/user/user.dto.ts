import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  account_id: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  user_address: string;
}
