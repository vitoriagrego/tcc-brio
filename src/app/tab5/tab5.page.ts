import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {

  // Dados do usuário
  usuario = {
    nickname: 'Nickname',
    nome: 'Nome do usuário',
    avatar: 'assets/perfil.png', // Substitua pela sua imagem de avatar
    nivel: 17,
    xpAtual: 8920,
    xpTotal: 11500,
    guilda: 'Guilda dos Alquimistas'
  };

  // Estatísticas de estudo
  materiaPrestigio = {
    nome: 'Química',
    nivel: 4,
    progresso: 0.80 // 80%
  };

  tempoMedioEstudo = {
    horas: '3',
    minutos: '00'
  };

  principalConquista = {
    nome: 'Runa de Aetherion',
    imagem: 'assets/runa.png' // Substitua pela imagem da conquista
  };

  constructor() { }

  ngOnInit() { }

  alterarPerfil() {
    console.log('Botão alterar perfil clicado');
    // Insira sua lógica para abrir câmera ou galeria aqui
  }

  get progressoXp(): number {
    return this.usuario.xpAtual / this.usuario.xpTotal;
  }

}