/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Param } from '@nestjs/common';
import { ContractFactoryAbstract } from './core/abstract/contract-factory/contract-factory.abstract';
import { MyLoggerService } from './service/custom-logger/logger.service';

@Controller('nft')
export class NFTController {
  private logger: MyLoggerService;

  constructor(private readonly factory: ContractFactoryAbstract) {
    this.logger = new MyLoggerService('test', '#236A59', '#EF7E3E');
  }

  @Get()
  async test() {
    // Implement
    const gasLimit = await this.factory.nftContract.setBaseURI.estimateGas('ipfs://QmXzPf3CdUv13ruTJHN24MrmgmsgkJ6YxQJ3YYXZXMiX8U/');
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.nftContract.setBaseURI('ipfs://QmXzPf3CdUv13ruTJHN24MrmgmsgkJ6YxQJ3YYXZXMiX8U/', {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      this.logger.log1(`New round execute successfully!`);
    }

    // Execute round failed
    else {
      this.logger.log1(`New round executed failed! retry...`);
    }
  }

  @Get('init')
  async testChain() {
    // Implement
    const gasLimit = await this.factory.nftContract.init.estimateGas(
      'Predix NFT',
      'PFT',
      'QmXzPf3CdUv13ruTJHN24MrmgmsgkJ6YxQJ3YYXZXMiX8U',
      '0xb90925393aBe64f9db1A0200a09C9162F334d5a8',
    );
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.nftContract.init(
      'Predix NFT',
      'PFT',
      'QmXzPf3CdUv13ruTJHN24MrmgmsgkJ6YxQJ3YYXZXMiX8U',
      '0xb90925393aBe64f9db1A0200a09C9162F334d5a8',
      {
        gasLimit,
        gasPrice: gasPrice.gasPrice,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
      },
    );

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      this.logger.log1(`New round execute successfully!`);
    }

    // Execute round failed
    else {
      this.logger.log1(`New round executed failed! retry...`);
    }
  }

  @Get('whitelist')
  async whitelist() {
    // Implement
    const gasLimit = await this.factory.nftContract.whitelistUser.estimateGas('0x66405F84DaC6DE3aFF921d77174B0E0C46Eb2aBA');
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.nftContract.whitelistUser('0x66405F84DaC6DE3aFF921d77174B0E0C46Eb2aBA', {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      this.logger.log1(`New round execute successfully!`);
    }

    // Execute round failed
    else {
      this.logger.log1(`New round executed failed! retry...`);
    }
  }

  @Get('mint/:id')
  async mint(@Param('id') id: string) {
    // Implement
    const gasLimit = await this.factory.nftContract.mint.estimateGas('0x66405F84DaC6DE3aFF921d77174B0E0C46Eb2aBA', '1');
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.nftContract.mint('0x66405F84DaC6DE3aFF921d77174B0E0C46Eb2aBA', 1, {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      this.logger.log1(`New round execute successfully!`);
    }

    // Execute round failed
    else {
      this.logger.log1(`New round executed failed! retry...`);
    }
  }
}
