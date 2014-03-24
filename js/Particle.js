Particle = function(options) {
    this.init(options);
};

Particle.prototype.init = function(options) {
    //prep defaults
    this.settings = {
        context: null,
        blendMode: "normal",
        radial: false,
        alive: true,
        position: new Vector2D(0, 0),
        velocity: new Vector2D(0, 0),
        size: 1,
        deltaSize: 1,
        lifeSpan: 1,
        sharpness: 100,
        inner: null,
        colorArray: [255, 255, 255, 1],
        deltaColor: [0, 0, 0, 0],
        gravitate: false,
        forceVector: new Vector2D(0, 0),
    };

    this.age = 1;

    //extend!
    for (var i in options) {
        if (options.hasOwnProperty(i)) {
            this.settings[i] = options[i];
        }
    }
};

Particle.prototype.update = function(dt) {
    this.age += dt;

    if (this.age > this.settings.lifeSpan) {
        this.kill();
        return;
    }

    this.settings.velocity.add(this.calculateAcceleration());
    this.settings.position.add(this.settings.velocity);

    //If the particle exits the viewport, kill it!
    //This is to help performance.  If you have a viewport,
    //and it move around alot, this may give you the results your want.
    if (this.outOfBounds()) {
        this.kill();
        return;
    }

    //update our sizes
    this.settings.size += this.settings.deltaSize * dt;

    if (this.settings.radial)
        this.settings.inner = ~~ ((this.settings.size / 200) * this.settings.sharpness);

    //linear easing the color...
    //would be cool to add different easing options, but that would require a lot more processing
    //as the delta would not be constant...
    var r = this.settings.colorArray[0] += (this.settings.deltaColor[0] * dt);
    var g = this.settings.colorArray[1] += (this.settings.deltaColor[1] * dt);
    var b = this.settings.colorArray[2] += (this.settings.deltaColor[2] * dt);
    var a = this.settings.colorArray[3] += (this.settings.deltaColor[3] * dt);

    //clamp to 0-255
    r = (r > 255 ? 255 : r < 0 ? 0 : ~~r),
    g = (g > 255 ? 255 : g < 0 ? 0 : ~~g),
    b = (b > 255 ? 255 : b < 0 ? 0 : ~~b),
    a = (a > 1 ? 1 : a < 0 ? 0 : a.toFixed(2));

    this.settings.drawColor = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    this.settings.drawColorTransparent = 'rgba(' + r + ',' + g + ',' + b + ', 0)';
};

Particle.prototype.draw = function() {
    if (!this.settings.alive)
        return;

    if (this.settings.radial) {
        //I would consider this to be a beta feature.  It takes too much tweaking
        //to get the right result based on the sharpness setting and how big the particle is
        //More work needs to be put into this gradient code.
        var halfSize = this.settings.size >> 1;
        var x = ~~ (this.settings.position.x - halfSize);
        var y = ~~ (this.settings.position.y - halfSize);

        var radgrad = this.settings.context.createRadialGradient(x + halfSize, y + halfSize, this.settings.inner, x + halfSize, y + halfSize, halfSize);
        radgrad.addColorStop(0, this.settings.drawColor);
        radgrad.addColorStop(1, this.settings.drawColorTransparent);

        this.settings.context.save();
        this.settings.context.globalCompositeOperation = this.settings.blendMode;

        this.settings.context.fillStyle = radgrad;
        this.settings.context.fillRect(x, y, this.settings.size, this.settings.size);
        this.settings.context.restore();

    } else {
        this.settings.context.save();
        this.settings.context.globalCompositeOperation = this.settings.blendMode;
        this.settings.context.beginPath();
        this.settings.context.fillStyle = this.settings.drawColor;
        this.settings.context.arc(this.settings.position.x, this.settings.position.y, this.settings.size, 0, 2 * Math.PI, false);
        this.settings.context.fill();
        this.settings.context.restore();
    }
};

Particle.prototype.calculateAcceleration = function() {
    if (this.settings.gravitate)
        return this.settings.forceVector;
    else
        return new Vector2D(0, 0);
};

Particle.prototype.outOfBounds = function() {
    var xMin = yMin = 0 - this.settings.size;
    var xMax = this.settings.context.canvas.width + this.settings.size;
    var yMax = this.settings.context.canvas.height + this.settings.size;

    if (this.settings.position.x < xMin || this.settings.position.x > xMax)
        return true;

    if (this.settings.position.y < yMin || this.settings.position.y > yMax)
        return true;

    return false;
};

Particle.prototype.kill = function() {
    this.settings.alive = false;
};
