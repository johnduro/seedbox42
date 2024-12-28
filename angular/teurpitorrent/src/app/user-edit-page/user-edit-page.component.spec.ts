import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditPageComponent } from './user-edit-page.component';

describe('UserEditPageComponent', () => {
  let component: UserEditPageComponent;
  let fixture: ComponentFixture<UserEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEditPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
