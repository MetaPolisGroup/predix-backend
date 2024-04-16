import { IsNotEmpty, IsString } from 'class-validator';

export class FaucetDto {
    @IsNotEmpty()
    @IsString()
    address: string;
}
