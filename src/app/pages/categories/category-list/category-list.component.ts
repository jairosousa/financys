import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../shared/category.service';
import { Category } from '../shared/category.model';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];

  constructor(
    private categoriaService: CategoryService
  ) { }

  ngOnInit() {
    this.categoriaService.getAll()
      .subscribe(
        categories => this.categories = categories,
        error => alert('Erro ao carregar alista')
      );
  }

  delete(category: Category) {
    const mustDelete = confirm('Deseja realmente excluir este item?');
    if (mustDelete) {
      this.categoriaService.delete(category.id)
        .subscribe(
          () => this.categories = this.categories.filter(element => element !== category),
          () => alert('Erro ao excluir')
        );
    }
  }

}
