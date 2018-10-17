import Character from './character';
import './style.css';
import 'phaser';
import tiles from './assets/tilesets/tuxmon-sample-32px-extruded.png';
import map from './assets/tilemaps/town.json';
import atlas from './assets/atlas/atlas.json';

import React from 'react';
import ReactDOM from 'react-dom';

const Index = () => {
  return <div>Hello React!</div>;
};

ReactDOM.render(<Index />, document.getElementById('index'));

var config = {
  type: Phaser.AUTO,
  parent: 'phaser',
  width: 600,
  height: 400,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let cursors;
let player;
let cat;
let showDebug = false;
let characterName = 'teamxerogrunt1';
let character;

function preload () {
  this.load.image('tiles', tiles);
  this.load.tilemapTiledJSON('map', map);
  //this.load.atlas('atlas', atlas1, atlas2);
  this.load.multiatlas('atlas', atlas, 'assets/atlas');
}

function create () {
  const map = this.make.tilemap({ key: 'map' });

  const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer('Below Player', tileset, 0, 0);
  const worldLayer = map.createStaticLayer('World', tileset, 0, 0);
  const aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  aboveLayer.setDepth(10);

  const spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn Point');

  player = new Character(this, spawnPoint, characterName);
  cat = new Character(this, {x: 300, y: 300}, 'cat');

  this.physics.add.collider(player.phaserObject, worldLayer);
  this.physics.add.collider(cat.phaserObject, worldLayer);
  this.physics.add.collider(player.phaserObject, cat.phaserObject, function() { console.log('miaou'); }, null, this);

  const camera = this.cameras.main;
  camera.startFollow(player.phaserObject);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  this.add
    .text(16, 16, 'Arrow keys to move\nPress \'D\' to show hitboxes', {
      font: '18px monospace',
      fill: '#000000',
      padding: { x: 20, y: 10 },
      backgroundColor: '#ffffff'
    })
    .setScrollFactor(0)
    .setDepth(30);

  this.input.keyboard.once('keydown_D', event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });
}

let dirMap = [
  Character.DIR_UP,
  Character.DIR_DOWN,
  Character.DIR_LEFT,
  Character.DIR_RIGHT,
  Character.DIR_UP | Character.DIR_LEFT,
  Character.DIR_UP | Character.DIR_RIGHT,
  Character.DIR_DOWN | Character.DIR_LEFT,
  Character.DIR_DOWN | Character.DIR_RIGHT
];
let catCounter = 0;
let catDir = 0;

function update(time, delta) {
  let dir = 0;

  // Horizontal movement
  if (cursors.left.isDown) {
    dir |= Character.DIR_LEFT;
  } else if (cursors.right.isDown) {
    dir |= Character.DIR_RIGHT;
  }

  // Vertical movement
  if (cursors.up.isDown) {
    dir |= Character.DIR_UP;
  } else if (cursors.down.isDown) {
    dir |= Character.DIR_DOWN;
  }

  player.update(dir);

  if (catCounter++ % 20 === 0) {
    catDir = dirMap[Math.floor(Math.random()*8)];
  }
  cat.update(catDir);
}
