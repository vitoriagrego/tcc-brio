import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase';

export interface Materia {
  id?: string;
  nome: string;
  imagem: string;
  rotaEstudo: string;
  descricao?: string;
  corHex?: string;
}

@Component({
  selector: 'app-materias',
  templateUrl: './materias.page.html',
  styleUrls: ['./materias.page.scss'],
  standalone: false,
})
export class MateriasPage implements OnInit {

  filtroSelecionado: string = 'todas';
  materias: Materia[] = [];
  carregando: boolean = false;

  // Dados padronizados com as colunas exatas da tabela do Supabase
  private materiasIniciais = [
    {
      nome: 'Matemática',
      icone_url: 'assets/materias/mat.png',
      rota_estudo: '/matematica',
      descricao: 'Álgebra e Geometria'
    },
    {
      nome: 'História',
      icone_url: 'assets/materias/historia.png',
      rota_estudo: '/historia',
      descricao: 'História Geral e do Brasil'
    },
    {
      nome: 'Geografia',
      icone_url: 'assets/materias/geo.png',
      rota_estudo: '/geografia',
      descricao: 'Geografia Física e Humana'
    },
    {
      nome: 'Biologia',
      icone_url: 'assets/materias/biologia.png',
      rota_estudo: '/biologia',
      descricao: 'Ciências Biológicas'
    },
    {
      nome: 'Física',
      icone_url: 'assets/materias/fisica.png',
      rota_estudo: '/fisica',
      descricao: 'Mecânica e Termodinâmica'
    },
    {
      nome: 'Química',
      icone_url: 'assets/materias/quimica.png',
      rota_estudo: '/quimica',
      descricao: 'Química Geral e Orgânica'
    }
  ];

  constructor(
    private navCtrl: NavController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.carregarOuPovoarMaterias();
  }

  async ionViewWillEnter() {
    await this.carregarOuPovoarMaterias();
  }

  async carregarOuPovoarMaterias() {
    this.carregando = true;

    try {
      // 1. Tenta buscar os dados do Supabase
      const { data, error } = await this.supabaseService.client
        .from('materias')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao consultar Supabase (Verifique a política RLS):', error);
        this.carregarMateriasFallback();
        return;
      }

      // 2. Se a tabela no banco estiver vazia, faz o povoamento automático
      if (!data || data.length === 0) {
        console.log('Tabela materias está vazia no Supabase. Povoando registros...');
        
        const { data: dadosInseridos, error: erroInsercao } = await this.supabaseService.client
          .from('materias')
          .insert(this.materiasIniciais)
          .select();

        if (erroInsercao) {
          console.error('Erro de permissão/inserção no Supabase:', erroInsercao);
          this.carregarMateriasFallback();
          return;
        }

        if (dadosInseridos && dadosInseridos.length > 0) {
          console.log('Matérias inseridas no Supabase com sucesso!');
          this.mapearMaterias(dadosInseridos);
        } else {
          this.carregarMateriasFallback();
        }
      } else {
        // 3. Registros encontrados no banco
        this.mapearMaterias(data);
      }
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
      this.carregarMateriasFallback();
    } finally {
      this.carregando = false;
    }
  }

  // Mapeia os dados do Supabase para o formato do componente
  private mapearMaterias(dados: any[]) {
    this.materias = dados.map((item) => ({
      id: item.id,
      nome: item.nome,
      imagem: item.icone_url || 'assets/materias/padrao.png',
      rotaEstudo: item.rota_estudo || '/tabs/tab2',
      descricao: item.descricao,
      corHex: item.cor_hex
    }));
  }

  // Mantém a exibição funcionando mesmo se o banco falhar
  private carregarMateriasFallback() {
    console.warn('Exibindo matérias locais via fallback.');
    this.materias = this.materiasIniciais.map(item => ({
      nome: item.nome,
      imagem: item.icone_url,
      rotaEstudo: item.rota_estudo,
      descricao: item.descricao
    }));
  }

  get materiasFiltradas(): Materia[] {
    if (this.filtroSelecionado === 'todas') {
      return this.materias;
    }

    return this.materias.filter(
      materia => materia.nome.toLowerCase() === this.filtroSelecionado.toLowerCase()
    );
  }

  selecionarFiltro(filtro: string) {
    this.filtroSelecionado = filtro;
  }

  estudarMateria(materia: Materia) {
    if (materia.rotaEstudo) {
      this.navCtrl.navigateForward(materia.rotaEstudo);
    }
  }

  abrirExercicios(materia: Materia) {
    this.navCtrl.navigateForward('/quiz-historia', {
      queryParams: {
        materia: materia.nome,
        materiaId: materia.id
      }
    });
  }

  voltar() {
    this.navCtrl.navigateBack('/tabs/tab2');
  }
}