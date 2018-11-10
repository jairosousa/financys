import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Category } from './pages/categories/shared/category.model';

export class InMemoryDatabase implements InMemoryDbService {
    createDb() {
        const categories: Category[] = [
            { id: 1, name: 'Moradia', description: 'Pagamentos de Contas da Casa' },
            { id: 2, name: 'Saúde', description: 'Plano de Saúde e remádios' },
            { id: 3, name: 'Lazer', description: 'Cinema, parque, praia, etc' },
            { id: 4, name: 'Salario', description: 'Recebimento de salário' },
            { id: 5, name: 'Freelas', description: 'Trabalhos com Freelance' }
        ];

        return { categories };
    }
}