import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToWatchListComponent } from './to-watch-list.component';

describe('ToWatchListComponent', () => {
  let component: ToWatchListComponent;
  let fixture: ComponentFixture<ToWatchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToWatchListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToWatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
