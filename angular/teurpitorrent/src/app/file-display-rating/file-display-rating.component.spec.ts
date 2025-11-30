import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDisplayRatingComponent } from './file-display-rating.component';

describe('FileDisplayRatingComponent', () => {
  let component: FileDisplayRatingComponent;
  let fixture: ComponentFixture<FileDisplayRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDisplayRatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDisplayRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
