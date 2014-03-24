ParticleEmitter = function(options) {
    this.init(options);
};

ParticleEmitter.prototype.init = function(options) {
    //prep defaults
    this.settings = {
        context: null, //canvas drawing context
        blendMode: "normal", //canvas global composite operation
        radial: false, //if true, particles are drawn with a radial gradient
        sharpness: 0, //graphical sharpness of particle when using the 'radial' option
        sharpnessVariance: 0,
        maxParticles: 0, //the maximum allowed particles for this emitter
        position: new Vector2D(0, 0), //emitter position
        positionVariance: new Vector2D(0, 0), //controls square distribution of spawning particles
        circularDistribution: false, //overrides position variance to be circular
        radius: 0, //radius of circular distribution, if turned on
        direction: 0, //which way the particles are headed, in radians
        directionVariance: 0,
        speed: 0, //how fast particles go
        speedVariance: 0,
        size: 0, //how big the particles are
        sizeVariance: 0,
        endSize: 0, //how big the particles are before they die
        endSizeVariance: 0,
        life: 0, //how long a particle exists in milliseconds
        lifeVariance: 0,
        color: [0,0,0,0], //color of particle at creation, rgba array
        colorVariance: [0,0,0,0],
        endColor: [0,0,0,0], //color of particle before it dies
        endColorVariance: [0,0,0,0],
        duration: -1, //life of emitter. -1 for infinite
        gravitate: true, //particles effected by an external force,
        forceVector: new Vector2D(0, 0), //external force to act on particles
    };

    this.particles = [];
    this.emitCounter = 0; //tracking variable
    this.elapsedTime = 0; //how long it has been emitting
    this.alive = true;

    //extend!
    for (var i in options) {
        if (options.hasOwnProperty(i)) {
            this.settings[i] = options[i];
        }
    }
};

ParticleEmitter.prototype.update = function(dt) {
    //explosion
    if (this.settings.duration === 0) {
        if (this.particles.length <= 0) {
            this.kill();
        }
    } else {
        var emissionRate = this.settings.maxParticles / this.settings.life;

        if (this.settings.alive && emissionRate > 0) {
            var rate = 1 / emissionRate;
            this.emitCounter += dt;

            while (this.particles.length < this.settings.maxParticles && this.emitCounter > rate) {
                this.emitParticle();
                this.emitCounter -= rate;
            }

            this.elapsedTime += dt;
            if (this.settings.duration != -1 && this.settings.duration < this.elapsedTime) {
                this.kill();
            }
        }
    }

    var len = this.particles.length;
    while (len--) {
        var particle = this.particles[len];
        particle.update(dt);
        if (!particle.settings.alive) {
            this.particles.splice(len, 1);
        }
    }
};

ParticleEmitter.prototype.draw = function() {
    var len = this.particles.length;
    while (len--) {
        var particle = this.particles[len];
        particle.draw();
    }
};

ParticleEmitter.prototype.emitParticle = function() {
    var r_Pos;

    if (this.settings.circularDistribution) {
        r_Pos = pointInCircleAround(this.settings.position.duplicate(), this.settings.radius);
    } else {
        r_Pos = this.settings.position.duplicate();
        r_Pos.x = r_Pos.x + this.settings.positionVariance.x * Pollock.randomNegativeOneToOne();
        r_Pos.y = r_Pos.y + this.settings.positionVariance.y * Pollock.randomNegativeOneToOne();
    }


    var r_Angle = this.settings.direction + this.settings.directionVariance * Pollock.randomNegativeOneToOne();
    var r_Speed = this.settings.speed + this.settings.speedVariance * Pollock.randomNegativeOneToOne();

    var r_Dir = new Vector2D(Math.cos(r_Angle), Math.sin(r_Angle)).multiply(r_Speed);

    var r_Size = this.settings.size + this.settings.sizeVariance * Pollock.randomNegativeOneToOne();
    r_Size = r_Size < 0 ? 0 : ~~r_Size;

    var r_EndSize = this.settings.endSize + this.settings.endSizeVariance * Pollock.randomNegativeOneToOne();
    r_EndSize = r_EndSize < 0 ? 0 : ~~r_EndSize;

    var r_Life = this.settings.life + this.settings.lifeVariance * Pollock.randomNegativeOneToOne();

    var r_DeltaSize = (r_EndSize - r_Size) / r_Life;

    var r_Sharp = this.settings.sharpness + this.settings.sharpnessVariance * Pollock.randomNegativeOneToOne();
    r_Sharp = r_Sharp > 100 ? 100 : r_Sharp < 0 ? 0 : r_Sharp;

    var r_Inner = ~~ ((r_Size / 200) * r_Sharp);


    var start = [
        this.settings.color[0] + this.settings.colorVariance[0] * Pollock.randomNegativeOneToOne(),
        this.settings.color[1] + this.settings.colorVariance[1] * Pollock.randomNegativeOneToOne(),
        this.settings.color[2] + this.settings.colorVariance[2] * Pollock.randomNegativeOneToOne(),
        this.settings.color[3] + this.settings.colorVariance[3] * Pollock.randomNegativeOneToOne()
    ];

    var end = [
        this.settings.endColor[0] + this.settings.endColorVariance[0] * Pollock.randomNegativeOneToOne(),
        this.settings.endColor[1] + this.settings.endColorVariance[1] * Pollock.randomNegativeOneToOne(),
        this.settings.endColor[2] + this.settings.endColorVariance[2] * Pollock.randomNegativeOneToOne(),
        this.settings.endColor[3] + this.settings.endColorVariance[3] * Pollock.randomNegativeOneToOne()
    ];

    var r_Color = start;

    var r_DeltaColor = [];
    r_DeltaColor[0] = (end[0] - start[0]) / r_Life;
    r_DeltaColor[1] = (end[1] - start[1]) / r_Life;
    r_DeltaColor[2] = (end[2] - start[2]) / r_Life;
    r_DeltaColor[3] = (end[3] - start[3]) / r_Life;

    var part = new Particle({
        context: this.settings.context,
        blendMode: this.settings.blendMode,
        radial: this.settings.radial,
        position: r_Pos,
        velocity: r_Dir,
        size: r_Size,
        deltaSize: r_DeltaSize,
        lifeSpan: r_Life,
        sharpness: r_Sharp,
        inner: r_Inner,
        colorArray: r_Color,
        deltaColor: r_DeltaColor,
        physical: this.settings.physical,
        gravitate: this.settings.gravitate,
        forceVector: this.settings.forceVector,
    });

    this.particles.push(part);
};

ParticleEmitter.prototype.kill = function() {
    this.settings.alive = false;
};

/*

    init: function(options) {
        $.extend(this, options);

        this.maxParticles *= g.particleCoefficient;

        g.particleManager.addEntity(this);

        //explosion case
        if (this.duration == 0) {
            var rate = 1 / this.maxParticles;

            while (this.particles.count < this.maxParticles) {
                this.emitParticle();
                //this.emitCounter -= rate;
            }
        }

    },

});
 */
