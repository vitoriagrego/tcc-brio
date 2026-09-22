import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelaxamentoPage } from './relaxamento.page';

describe('RelaxamentoPage', () => {
  let component: RelaxamentoPage;
  let fixture: ComponentFixture<RelaxamentoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RelaxamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
