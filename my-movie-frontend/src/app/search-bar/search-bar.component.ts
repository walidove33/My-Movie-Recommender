import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Input() allGenres: string[] = [];
  @Input() filters: any = {};
  @Input() filtersVisible = false;

  @Output() searchInput = new EventEmitter<string>();
  @Output() toggleFilters = new EventEmitter<void>();
  @Output() toggleGenre = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.emit(value);
  }

  onToggleFilters(): void {
    this.toggleFilters.emit();
  }

  onToggleGenre(genre: string): void {
    this.toggleGenre.emit(genre);
  }

  onSearch(): void {
    this.search.emit();
  }

  clearFilters(): void {
    this.filters.genres = [];
    this.filters.yearFrom = null;
    this.filters.yearTo = null;
    this.filters.ratingFrom = null;
    this.filters.ratingTo = null;
  }
}