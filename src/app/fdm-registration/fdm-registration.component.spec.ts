import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FdmRegistrationComponent } from './fdm-registration.component';

describe('FdmRegistrationComponent', () => {
  let component: FdmRegistrationComponent;
  let fixture: ComponentFixture<FdmRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FdmRegistrationComponent]
    });
    fixture = TestBed.createComponent(FdmRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
