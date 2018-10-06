import greet from './greet';
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

function createAtlasAnims(anims, name) {
  anims.create({
    key: name + '_left_walk',
    frames: anims.generateFrameNames('atlas', { prefix: name + '_left_walk.', start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: name + '_right_walk',
    frames: anims.generateFrameNames('atlas', { prefix: name + '_right_walk.', start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: name + '_front_walk',
    frames: anims.generateFrameNames('atlas', { prefix: name + '_front_walk.', start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: name + '_back_walk',
    frames: anims.generateFrameNames('atlas', { prefix: name + '_back_walk.', start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
}


const game = new Phaser.Game(config);
let cursors;
let player;
let cat;
let showDebug = false;
let character = 'teamxerogrunt1';

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

  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, 'atlas', character + '_front')
    .setSize(30, 40)
    .setOffset(0, 24);

  cat = this.physics.add
      .sprite(300, 300, 'atlas', 'cat_front')
      .setSize(30, 30)
      .setOffset(0, 8);

  this.physics.add.collider(player, worldLayer);
  this.physics.add.collider(player, cat);

  createAtlasAnims(this.anims, character);
  createAtlasAnims(this.anims, 'cat');

  const camera = this.cameras.main;
  camera.startFollow(player);
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

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);
  cat.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play(character + '_left_walk', true);
  } else if (cursors.right.isDown) {
    player.anims.play(character + '_right_walk', true);
  } else if (cursors.up.isDown) {
    player.anims.play(character + '_back_walk', true);
  } else if (cursors.down.isDown) {
    player.anims.play(character + '_front_walk', true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture('atlas', character + '_left');
    else if (prevVelocity.x > 0) player.setTexture('atlas', character + '_right');
    else if (prevVelocity.y < 0) player.setTexture('atlas', character + '_back');
    else if (prevVelocity.y > 0) player.setTexture('atlas', character + '_front');
  }
}
