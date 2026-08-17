import { SetMetadata } from '@nestjs/common';

export const SKIP_CONTRACT = 'SKIP_CONTRACT';
export const SkipContract = () => SetMetadata(SKIP_CONTRACT, true);
