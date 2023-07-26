import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  user_address: string;

  @IsOptional()
  @IsString()
  nickname: string;
}
