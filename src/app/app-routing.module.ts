import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'cadastro',
    loadChildren: () =>
      import('./cadastro/cadastro.module').then(m => m.CadastroPageModule)
  },
  {
    path: 'questionario',
    loadChildren: () =>
      import('./questionario/questionario.module').then(m => m.QuestionarioPageModule)
  },
  {
    path: 'tab4',
    loadChildren: () => import('./tab4/tab4.module').then( m => m.Tab4PageModule)
  },
  {
    path: 'tab5',
    loadChildren: () => import('./tab5/tab5.module').then( m => m.Tab5PageModule)
  },
  {
    path: 'tab4',
    loadChildren: () => import('./tab4/tab4.module').then( m => m.Tab4PageModule)
  },
  {
    path: 'tab5',
    loadChildren: () => import('./tab5/tab5.module').then( m => m.Tab5PageModule)
  },
  {
    path: 'ia',
    loadChildren: () => import('./ia/ia.module').then( m => m.IaPageModule)
  },
  {
    path: 'grim1',
    loadChildren: () => import('./grim1/grim1.module').then( m => m.Grim1PageModule)
  },
  {
    path: 'config',
    loadChildren: () => import('./config/config.module').then( m => m.ConfigPageModule)
  },
  {
    path: 'notificacao',
    loadChildren: () => import('./notificacao/notificacao.module').then( m => m.NotificacaoPageModule)
  },
  {
    path: 'backup-sincronizacao',
    loadChildren: () => import('./backup-sincronizacao/backup-sincronizacao.module').then( m => m.BackupSincronizacaoPageModule)
  },
  {
    path: 'idioma',
    loadChildren: () => import('./idioma/idioma.module').then( m => m.IdiomaPageModule)
  },
  {
    path: 'sons',
    loadChildren: () => import('./sons/sons.module').then( m => m.SonsPageModule)
  },
  {
    path: 'sobre',
    loadChildren: () => import('./sobre/sobre.module').then( m => m.SobrePageModule)
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule)
  },
  {
    path: 'guildas',
    loadChildren: () => import('./guildas/guildas.module').then( m => m.GuildasPageModule)
  },
  {
    path: 'materias',
    loadChildren: () => import('./materias/materias.module').then( m => m.MateriasPageModule)
  },
  {
    path: 'grim2',
    loadChildren: () => import('./grim2/grim2.module').then( m => m.Grim2PageModule)
  },
  {
    path: 'biologia',
    loadChildren: () => import('./biologia/biologia.module').then( m => m.BiologiaPageModule)
  },
  {
    path: 'matematica',
    loadChildren: () => import('./matematica/matematica.module').then( m => m.MatematicaPageModule)
  },
  {
    path: 'fisica',
    loadChildren: () => import('./fisica/fisica.module').then( m => m.FisicaPageModule)
  },
  {
    path: 'quimica',
    loadChildren: () => import('./quimica/quimica.module').then( m => m.QuimicaPageModule)
  },
  {
    path: 'historia',
    loadChildren: () => import('./historia/historia.module').then( m => m.HistoriaPageModule)
  },
  {
    path: 'geografia',
    loadChildren: () => import('./geografia/geografia.module').then( m => m.GeografiaPageModule)
  },
  {
    path: 'relaxamento',
    loadChildren: () => import('./relaxamento/relaxamento.module').then( m => m.RelaxamentoPageModule)
  },
  {
    path: 'quiz-historia',
    loadChildren: () => import('./quiz-historia/quiz-historia.module').then( m => m.QuizHistoriaPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
