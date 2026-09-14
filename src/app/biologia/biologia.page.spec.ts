import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiologiaPage } from './biologia.page';

describe('BiologiaPage', () => {
  let component: BiologiaPage;
  let fixture: ComponentFixture<BiologiaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BiologiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
