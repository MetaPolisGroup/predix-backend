import { Generic } from './generic.entity';

export class Product extends Generic {
    name: string;

    price: string;

    description?: string;

    created_at: number;

    update_at: number;
}
