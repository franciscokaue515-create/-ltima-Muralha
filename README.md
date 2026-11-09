# Última Muralha

Jogo de sobrevivência de fantasia medieval (estilo survivors-like) feito em HTML, CSS e JavaScript puro. Sem instalação e sem dependências: abra o `index.html` no navegador.

## Como jogar
- **Mover:** W A S D
- **Escolha o herói** ao começar: Guerreiro, Mago ou Ladra. Cada um tem 4 habilidades nos mesmos controles: botão esquerdo (ataque, segure), botão direito, Espaço e E.
  - **Guerreiro:** Espada (com Onda de Energia), Giro Devastador, Avanço Fugaz, Onda de Choque.
  - **Mago:** Bola de Fogo, Bomba de Gelo, Teletransporte, Lança-chamas.
  - **Ladra:** Flechas, Trapaceira (rede), Rapel, Chuva de Flechas.
- **Armas automáticas** (compradas nas Melhorias) são diferentes para cada herói.
- **Pausa e configurações:** Esc ou botão Pausa. Volumes e troca de controles ficam lá.

São 25 rounds, com chefão a cada 4 rounds (5, 9, 13, 17, 21 e 25). O jogador começa com 3 vidas extras.

## Estrutura
```
index.html           página e HUD
css/style.css        visual
js/
  core/              dados, estado, configurações, entrada, atualização e laço principal
  audio/             efeitos sonoros e música gerados pelo navegador
  world/             mapa da cidade, colisões, navegação dos inimigos e câmera
  entities/          nascimento de inimigos e IA (comuns e chefões)
  combat/            habilidades do jogador, armas automáticas e ataques inimigos
  render/            desenho do campo de batalha
  ui/                telas (menu, pausa, melhorias), HUD, barra de habilidades e configurações
```
Os arquivos de `js/` são carregados em ordem pelo `index.html` e compartilham o mesmo escopo, então a ordem das tags `<script>` importa.
