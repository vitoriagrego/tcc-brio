import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuimicaPage } from './quimica.page';

describe('QuimicaPage', () => {
  let component: QuimicaPage;
  let fixture: ComponentFixture<QuimicaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuimicaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
