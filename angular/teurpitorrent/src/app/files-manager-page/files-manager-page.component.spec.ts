import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesManagerPageComponent } from './files-manager-page.component';

describe('FilesManagerPageComponent', () => {
  let component: FilesManagerPageComponent;
  let fixture: ComponentFixture<FilesManagerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesManagerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesManagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
