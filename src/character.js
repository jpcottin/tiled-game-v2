const DIR = {
  UP: 1,
  DOWN: 2,
  LEFT: 4,
  RIGHT: 8,
}

class Character {
  constructor(phaser, spawnPoint, name) {
    this.phaserObject = phaser.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', name + '_front')
      .setSize(30, 40)
      .setOffset(0, 24);

    this._createAtlasAnims(phaser.anims, name);
    this.name = name;
  }

  _createAtlasAnims(anims, name) {
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

  static get DIR_UP() { return DIR.UP; }
  static get DIR_DOWN() { return DIR.DOWN; }
  static get DIR_LEFT() { return DIR.LEFT; }
  static get DIR_RIGHT() { return DIR.RIGHT; }

  //get phaserObject() { return this.phaserObject; }

  update(dir) {
    const speed = 175;
    const prevVelocity = this.phaserObject.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.phaserObject.body.setVelocity(0);

    // Set velocity
    if (dir & DIR.LEFT) {
      this.phaserObject.body.setVelocityX(-speed);
    } else if (dir & DIR.RIGHT) {
      this.phaserObject.body.setVelocityX(speed);
    }

    if (dir & DIR.UP) {
      this.phaserObject.body.setVelocityY(-speed);
    } else if (dir & DIR.DOWN) {
      this.phaserObject.body.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.phaserObject.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (dir & DIR.LEFT) {
      this.phaserObject.anims.play(this.name + '_left_walk', true);
    } else if (dir & DIR.RIGHT) {
      this.phaserObject.anims.play(this.name + '_right_walk', true);
    } else if (dir & DIR.UP) {
      this.phaserObject.anims.play(this.name + '_back_walk', true);
    } else if (dir & DIR.DOWN) {
      this.phaserObject.anims.play(this.name + '_front_walk', true);
    } else {
      this.phaserObject.anims.stop();

      // If we were moving, pick the idle frame to use
      if (prevVelocity.x < 0) this.phaserObject.setTexture('atlas', this.name + '_left');
      else if (prevVelocity.x > 0) this.phaserObject.setTexture('atlas', this.name + '_right');
      else if (prevVelocity.y < 0) this.phaserObject.setTexture('atlas', this.name + '_back');
      else if (prevVelocity.y > 0) this.phaserObject.setTexture('atlas', this.name + '_front');
    }
  }
}

export default Character;
