import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FisicaPage } from './fisica.page';

describe('FisicaPage', () => {
  let component: FisicaPage;
  let fixture: ComponentFixture<FisicaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FisicaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
