import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizHistoriaPage } from './quiz-historia.page';

describe('QuizHistoriaPage', () => {
  let component: QuizHistoriaPage;
  let fixture: ComponentFixture<QuizHistoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizHistoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
