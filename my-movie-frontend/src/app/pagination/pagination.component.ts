import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() visiblePages: number[] = [];
  
  @Output() pageChange = new EventEmitter<number>();
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
  
  isFirstPage(): boolean {
    return this.currentPage === 1;
  }
  
  isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }
  
  showFirstPageButton(): boolean {
    return !this.visiblePages.includes(1) && this.visiblePages.length > 0;
  }
  
  showLastPageButton(): boolean {
    return !this.visiblePages.includes(this.totalPages) && this.visiblePages.length > 0 && this.totalPages > 1;
  }
}