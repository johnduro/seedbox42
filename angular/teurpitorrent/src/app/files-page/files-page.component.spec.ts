import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesPageComponent } from './files-page.component';

describe('FilesPageComponent', () => {
  let component: FilesPageComponent;
  let fixture: ComponentFixture<FilesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
